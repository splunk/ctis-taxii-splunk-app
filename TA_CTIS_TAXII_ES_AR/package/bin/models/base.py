from attrs import define
from cattr.gen import make_dict_structure_fn
from cattrs import Converter


@define(slots=False, kw_only=True)
class BaseModel:
    key: str = None
    user: str = None
    schema_version: int = None


@define(slots=False, kw_only=True)
class BaseModelV1(BaseModel):
    schema_version: int = 1


def make_base_converter():
    base_converter = Converter()

    # https://stackoverflow.com/a/69800305/23523267
    def make_structure(cls):
        default_structure = make_dict_structure_fn(cls, base_converter)

        def custom(val, another_cls):
            key = val.get("_key")
            user = val.get("_user")
            if key is not None:
                val["key"] = key
                del val["_key"]
            if user is not None:
                val["user"] = user
                del val["_user"]
            result = default_structure(val, another_cls)
            return result

        return custom

    base_converter.register_structure_hook_factory(lambda cls: issubclass(cls, BaseModel), make_structure)
    # TODO: create unstructure hook to handle _key and _user fields
    return base_converter
