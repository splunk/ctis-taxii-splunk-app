import re
from enum import Enum
from typing import Optional

from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .ioc_category import IoCCategory
from .base_converter import CIMToSTIXConverter


class FileHashType(str, Enum):
    MD5 = "MD5"
    SHA1 = "SHA-1"
    SHA256 = "SHA-256"
    SHA512 = "SHA-512"


HASH_TYPE_TO_STR_LENGTH = {
    "MD5": 32,
    "SHA-1": 40,
    "SHA-256": 64,
    "SHA-512": 128
}


def generate_filehash_regex(expected_length: int) -> str:
    return r'^[a-f0-9]{' + str(expected_length) + r'}$'


FILE_HASH_TYPE_TO_REGEX = {k: generate_filehash_regex(v) for k, v in HASH_TYPE_TO_STR_LENGTH.items()}


def file_hash_looks_like(filehash: str) -> str:
    for hash_type, regex in FILE_HASH_TYPE_TO_REGEX.items():
        if re.match(regex, filehash, flags=re.IGNORECASE):
            return hash_type


class FileHashConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        hash_type = file_hash_looks_like(splunk_field_value)
        ece = EqualityComparisonExpression(ObjectPath("file", ["hashes", hash_type]), splunk_field_value)
        observation = ObservationExpression(ece)
        return observation

    @staticmethod
    def supports(ioc_category: str, value: str) -> bool:
        return ioc_category in ("filehash", "file_hash") and file_hash_looks_like(value) is not None

    @staticmethod
    def category(value: str) -> IoCCategory:
        hash_type = file_hash_looks_like(value)
        if hash_type == "MD5":
            return IoCCategory.FILE_HASH_MD5
        elif hash_type == "SHA-1":
            return IoCCategory.FILE_HASH_SHA1
        elif hash_type == "SHA-256":
            return IoCCategory.FILE_HASH_SHA256
        elif hash_type == "SHA-512":
            return IoCCategory.FILE_HASH_SHA512
        else:
            raise ValueError(f"Invalid file hash: {value}")

    @staticmethod
    def supports_field(splunk_field_name: str, splunk_field_value: str) -> bool:
        return file_hash_looks_like(splunk_field_value) is not None
