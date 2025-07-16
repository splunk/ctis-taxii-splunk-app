from attrs import define, field
from cattr.gen import make_dict_structure_fn, make_dict_unstructure_fn
from cattrs import Converter
from datetime import datetime

def get_datetime_utc_now():
    # datetime.utcnow() is deprecated since Python version 3.12
    # Currently, Splunk supports up to Python 3.9 so this might need to be updated in the future.
    return datetime.utcnow()

@define(slots=False, kw_only=True)
class BaseModel:
    key: str = None
    user: str = None
    schema_version: int = None
    created: datetime = field(default=None)
    modified: datetime = field(default=None)

    def __attrs_post_init__(self):
        now_utc = get_datetime_utc_now()
        if self.created is None:
            self.created = now_utc
        if self.modified is None:
            self.modified = now_utc

    def set_modified_to_now(self):
        self.modified = get_datetime_utc_now()

def validate_schema_version_is_1(instance, attribute, value: int):
    if value != 1:
        raise ValueError("schema_version must be 1")


@define(slots=False, kw_only=True)
class BaseModelV1(BaseModel):
    schema_version: int = field(default=1, validator=[validate_schema_version_is_1])


# As a reminder, `unstructure` is used to convert a Python object to a dictionary
# https://catt.rs/en/stable/
def unstructure_datetime_hook(val: datetime) -> str:
    """This hook will be registered for `datetime`s."""
    return val.isoformat()

# `structure` is used to convert a dictionary to a Python object
def structure_datetime_hook(value, type) -> datetime:
    """This hook will be registered for `datetime`s."""
    return datetime.fromisoformat(value)


def make_base_converter():
    base_converter = Converter()

    # https://stackoverflow.com/a/69800305/23523267
    def make_structure(cls):
        default_structure = make_dict_structure_fn(cls, base_converter)

        def custom(val, another_cls):
            key = val.get("_key")
            user = val.get("_user")
            if key is not None:
                val["key"] = val.pop("_key")
            if user is not None:
                val["user"] = val.pop("_user")
            result = default_structure(val, another_cls)
            return result

        return custom

    base_converter.register_structure_hook_factory(lambda cls: issubclass(cls, BaseModel), make_structure)

    def make_unstructure(cls):
        default_unstructure = make_dict_unstructure_fn(cls, base_converter)

        def custom(obj):
            result = default_unstructure(obj)
            if "key" in result:
                key = result.pop("key")
                if key is not None:
                    result["_key"] = key
            if "user" in result:
                user = result.pop("user")
                if user is not None:
                    result["_user"] = user

            return result

        return custom

    base_converter.register_unstructure_hook_factory(lambda cls: issubclass(cls, BaseModel), make_unstructure)

    # Hooks to correctly serialize/deserialize datetime objects
    base_converter.register_structure_hook(datetime, structure_datetime_hook)
    base_converter.register_unstructure_hook(datetime, unstructure_datetime_hook)

    return base_converter
