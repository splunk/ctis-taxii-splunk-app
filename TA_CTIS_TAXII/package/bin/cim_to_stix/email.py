from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter

STIX_TYPE_EMAIL_MESSAGE = "email-message"


class EmailSenderConverter(CIMToSTIXConverter):
    """
    https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_alhyho8zsnmv

    Matching on an Email Message with specific Sender and Subject
    [email-message:sender_ref.value = 'jdoe@example.com' AND email-message:subject = 'Conference Info']
    """

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath(STIX_TYPE_EMAIL_MESSAGE, ["sender_ref", "value"]), value)
        observation = ObservationExpression(ece)
        return observation


class EmailBodyConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath(STIX_TYPE_EMAIL_MESSAGE, ["body"]), value)
        observation = ObservationExpression(ece)
        return observation


class EmailSubjectConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath(STIX_TYPE_EMAIL_MESSAGE, ["subject"]), value)
        observation = ObservationExpression(ece)
        return observation


class EmailAttachmentFilenameConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(
            ObjectPath(STIX_TYPE_EMAIL_MESSAGE, ["body_multipart[*]", "body_raw_ref", "name"]),
            value
        )
        observation = ObservationExpression(ece)
        return observation
