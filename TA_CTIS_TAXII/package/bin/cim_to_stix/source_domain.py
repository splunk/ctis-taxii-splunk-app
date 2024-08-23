from typing import Optional

from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .ioc_category import IoCCategory
from .base_converter import CIMToSTIXConverter
from .cim_fields import SOURCE_DOMAIN_NAME, SOURCE_HOST_NAME
from .stix_constants import DOMAIN_NAME, NETWORK_TRAFFIC


class SourceDomainConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "type"]), DOMAIN_NAME)
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "value"]), splunk_field_value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def supports(ioc_category: str, value: str) -> bool:
        return ioc_category in (SOURCE_HOST_NAME, SOURCE_DOMAIN_NAME)

    @staticmethod
    def suggest_category(splunk_field_name:str, splunk_field_value:str) -> Optional[IoCCategory]:
        if splunk_field_name in [SOURCE_DOMAIN_NAME, SOURCE_HOST_NAME]:
            return IoCCategory.SOURCE_DOMAIN
