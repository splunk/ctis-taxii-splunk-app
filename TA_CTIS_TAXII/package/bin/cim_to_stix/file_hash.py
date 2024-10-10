import re
from enum import Enum

from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter


class FileHashType(str, Enum):
    MD5 = "MD5"
    SHA1 = "SHA-1"
    SHA256 = "SHA-256"
    SHA512 = "SHA-512"


HASH_TYPE_TO_STR_LENGTH = {
    FileHashType.MD5.value: 32,
    FileHashType.SHA1.value: 40,
    FileHashType.SHA256.value: 64,
    FileHashType.SHA512.value: 128
}


def generate_filehash_regex(expected_length: int) -> str:
    return r'^[a-f0-9]{' + str(expected_length) + r'}$'


FILE_HASH_TYPE_TO_REGEX = {k: generate_filehash_regex(v) for k, v in HASH_TYPE_TO_STR_LENGTH.items()}


def file_hash_looks_like(filehash: str) -> str:
    for hash_type, regex in FILE_HASH_TYPE_TO_REGEX.items():
        if re.match(regex, filehash, flags=re.IGNORECASE):
            return hash_type


def validate_file_hash(filehash: str, hash_type: FileHashType):
    if not re.match(FILE_HASH_TYPE_TO_REGEX[hash_type], filehash, flags=re.IGNORECASE):
        raise ValueError(f"Invalid {hash_type} hash: {filehash}")


def generate_observation_expression(filehash: str, hash_type: FileHashType) -> ObservationExpression:
    validate_file_hash(filehash, hash_type)
    ece = EqualityComparisonExpression(ObjectPath("file", ["hashes", hash_type.value]), filehash)
    return ObservationExpression(ece)


class MD5FileHashConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_observation_expression(value, FileHashType.MD5)


class SHA1FileHashConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_observation_expression(value, FileHashType.SHA1)


class SHA256FileHashConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_observation_expression(value, FileHashType.SHA256)


class SHA512FileHashConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_observation_expression(value, FileHashType.SHA512)
