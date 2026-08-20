from .util import (update_advanced_settings, get_advanced_settings, new_sample_grouping, create_indicator_form_payload,
                   create_new_indicator, example_indicator, list_indicators, oneshot_splunk_search)


def test_revoked_indicators_gets_deleted(session, cleanup_all_collections):
    update_advanced_settings(session=session, enable_indicators_cleanup=False)
    settings = get_advanced_settings(session=session)
    assert settings["enable_indicators_cleanup"] == '0'

    grouping = new_sample_grouping(session=session)

    indicator = example_indicator()
    indicator["revoked"] = True

    payload = create_indicator_form_payload(grouping_id=grouping["grouping_id"], indicators=[indicator])
    create_new_indicator(session=session, payload=payload)

    resp = list_indicators(session=session)
    assert len(resp["records"]) == 1
    only_created_indicator = resp["records"][0]
    assert only_created_indicator["revoked"] is True

    update_advanced_settings(session=session, enable_indicators_cleanup=True)
    settings = get_advanced_settings(session=session)
    assert settings["enable_indicators_cleanup"] == '1'

    oneshot_splunk_search(session=session, spl_query="| ctistaxiischeduler")

    query_for_indicator_resp = list_indicators(session=session, query={
        "indicator_id": only_created_indicator["indicator_id"],
    })
    assert len(query_for_indicator_resp["records"]) == 0, "Failed to clean up revoked indicator."
