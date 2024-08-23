from typing import Optional

from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import StringConstant, _PatternExpression

from .ioc_category import IoCCategory
from .base_converter import CIMToSTIXConverter


class FilePathConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        file_path = StringConstant(splunk_field_value, from_parse_tree=True)
        ece = EqualityComparisonExpression(ObjectPath("file", ["parent_directory_ref", "path"]), file_path)
        observation = ObservationExpression(ece)
        return observation

    @staticmethod
    def category(value:str) -> IoCCategory:
        return IoCCategory.FILE_PATH

    @staticmethod
    def supports_field(splunk_field_name: str, splunk_field_value: str) -> bool:
        return splunk_field_name in ("file_path", "filepath")
