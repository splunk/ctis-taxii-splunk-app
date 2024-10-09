from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter


class EmailSenderConverter(CIMToSTIXConverter):
    """
    https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_alhyho8zsnmv

    Matching on an Email Message with specific Sender and Subject
    [email-message:sender_ref.value = 'jdoe@example.com' AND email-message:subject = 'Conference Info']
    """

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath("email-message", ["sender_ref", "value"]), value)
        observation = ObservationExpression(ece)
        return observation
