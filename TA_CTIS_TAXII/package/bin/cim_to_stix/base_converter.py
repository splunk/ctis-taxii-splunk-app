import abc

from stix2.patterns import _PatternExpression


class CIMToSTIXConverter(abc.ABC):
    @staticmethod
    @abc.abstractmethod
    def convert(value: str) -> _PatternExpression:
        pass
