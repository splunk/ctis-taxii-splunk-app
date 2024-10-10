from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import StringConstant, _PatternExpression

from .base_converter import CIMToSTIXConverter


class FilePathConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        file_path = StringConstant(value, from_parse_tree=True)
        ece = EqualityComparisonExpression(ObjectPath("file", ["parent_directory_ref", "path"]), file_path)
        observation = ObservationExpression(ece)
        return observation
