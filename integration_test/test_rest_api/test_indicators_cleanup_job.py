import time

from .util import (update_advanced_settings, get_advanced_settings, new_sample_grouping, create_indicator_form_payload,
                   create_new_indicator, example_indicator, list_indicators)
import pytest

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

    # Cleanup job runs every minute, give a little extra...
    for _ in range(90):
        query_for_indicator_resp = list_indicators(session=session, query={
            "indicator_id" : only_created_indicator["indicator_id"],
        })
        if len(query_for_indicator_resp["records"]) == 0:
            break
        else:
            time.sleep(1)
    else:
        pytest.fail("Failed to clean up revoked indicator after 90 seconds.")
