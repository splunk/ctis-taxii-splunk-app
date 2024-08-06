from .destination_ipv4 import DestinationIpv4Converter

CONVERTER_CLASSES = [DestinationIpv4Converter]


def convert_cim_to_stix2_pattern(splunk_field_name: str, splunk_field_value: str) -> str:
    for converter in CONVERTER_CLASSES:
        if converter.supports(splunk_field_name):
            return str(converter.convert(splunk_field_name, splunk_field_value))
    else:
        raise NotImplementedError(f"Field name '{splunk_field_name}' is not supported")
