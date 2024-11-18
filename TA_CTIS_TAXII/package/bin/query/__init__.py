# Used in place of the mongodb '$in' operator, which does not seem to be supported by Splunk version 9.1
def query_value_in_list(field_value: str, possible_values: list) -> dict:
    if not possible_values:
        return {}
    return {"$or" : [{field_value : x} for x in possible_values]}
