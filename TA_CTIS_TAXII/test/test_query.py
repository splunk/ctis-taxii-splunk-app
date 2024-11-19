from TA_CTIS_TAXII.package.bin.query import query_value_in_list


def test_query_value_in_list():
    assert query_value_in_list("field_value", []) == {}
    assert query_value_in_list("grouping_id", ["abc"]) == {
        "$or": [
            {"grouping_id": "abc"},
        ]
    }
    assert query_value_in_list("field_value", ["possible_value_1", "possible_value_2"]) == {
        "$or": [
            {"field_value": "possible_value_1"},
            {"field_value": "possible_value_2"},
        ]
    }
