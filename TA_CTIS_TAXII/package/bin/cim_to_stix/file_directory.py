from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import StringConstant, _PatternExpression

from .base_converter import CIMToSTIXConverter


class FileDirectoryConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        file_directory = StringConstant(value, from_parse_tree=False)
        ece = EqualityComparisonExpression(ObjectPath("file", ["parent_directory_ref", "path"]), file_directory)
        observation = ObservationExpression(ece)
        return observation
