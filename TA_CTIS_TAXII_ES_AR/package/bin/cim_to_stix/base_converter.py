import abc

from stix2.patterns import _PatternExpression


class CIMToSTIXConverter(abc.ABC):
    @staticmethod
    @abc.abstractmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        pass

    @staticmethod
    @abc.abstractmethod
    def supports(splunk_field_name: str) -> bool:
        pass
