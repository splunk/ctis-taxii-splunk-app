from .util import (
    create_new_indicator, create_indicator_form_payload,
    example_indicator, new_sample_grouping, get_sightings_collection,
    create_new_sighting, list_sightings,
    edit_sighting, delete_sighting, example_sighting, get_indicators_collection
)
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def new_indicator(session) -> dict:
    grouping = new_sample_grouping(session)
    payload = create_indicator_form_payload(
        grouping_id=grouping["grouping_id"],
        indicators=[example_indicator()]
    )
    resp = create_new_indicator(session, payload=payload)
    return resp["indicators"][0]

def test_create_sighting(session, cleanup_all_collections):
    indicator = new_indicator(session=session)
    indicator_id = indicator["indicator_id"]
    indicators = get_indicators_collection(session)
    assert len(indicators) == 1

    # Create sighting
    sighting_payload = example_sighting(
        indicator_id=indicator_id,
        description="Test sighting",
        count=1
    )
    resp = create_new_sighting(session, payload=sighting_payload)
    logger.debug(resp)

    # Verify via collection
    sightings = get_sightings_collection(session)
    assert len(sightings) == 1

    sighting = sightings[0]

    assert sighting["sighting_of_ref"] == indicator_id
    assert sighting["sighting_id"].startswith("sighting--")
    assert sighting["description"] == "Test sighting"
    assert sighting["count"] == 1

def test_list_sightings(session, cleanup_all_collections):
    # Create prerequisite indicator
    indicator = new_indicator(session=session)
    indicator_id = indicator["indicator_id"]

    # Create multiple sightings
    for i in range(5):
        sighting_payload = example_sighting(
            indicator_id=indicator_id,
        )
        create_new_sighting(session, payload=sighting_payload)

    # List all sightings without filter
    resp = list_sightings(session, skip=0, limit=0)
    assert resp["total"] == 5
    assert len(resp["records"]) == 5

def test_list_sightings_with_query_filter(session, cleanup_all_collections):
    # Create prerequisite indicator
    indicator_1 = new_indicator(session=session)
    indicator_1_id = indicator_1["indicator_id"]

    indicator_2 = new_indicator(session=session)
    indicator_2_id = indicator_2["indicator_id"]

    # Create multiple sightings
    for indicator_id in [indicator_1_id, indicator_2_id]:
        for i in range(2):
            sighting_payload = example_sighting(
                indicator_id=indicator_id,
            )
            create_new_sighting(session, payload=sighting_payload)


    # List with query filter
    resp_filtered = list_sightings(session, skip=0, limit=0, query={
        "sighting_of_ref": indicator_1_id
    })
    assert resp_filtered["total"] == 2
    assert len(resp_filtered["records"]) == 2
    assert all(s["sighting_of_ref"] == indicator_1_id for s in resp_filtered["records"])


def test_update_sighting(session, cleanup_all_collections):
    indicator = new_indicator(session=session)
    indicator_id = indicator["indicator_id"]

    # Create sighting with initial values
    sighting_payload = example_sighting(
        indicator_id=indicator_id,
        count=5,
        confidence=80
    )
    resp = create_new_sighting(session, payload=sighting_payload)
    logger.debug(resp)

    sightings = get_sightings_collection(session)
    assert len(sightings) == 1

    original_sighting = sightings[0]
    assert original_sighting["confidence"] == 80
    assert original_sighting["count"] == 5

    sighting_id = original_sighting["sighting_id"]
    original_created = original_sighting["created"]

    # Edit sighting
    edit_payload = {
        "sighting_id": sighting_id,
        "count": 10,
        "confidence": 90,
        "description": "Updated description"
    }
    edit_resp = edit_sighting(session, payload=edit_payload)

    # Verify updates
    assert "sighting" in edit_resp
    updated_sighting = edit_resp["sighting"]
    assert updated_sighting["count"] == 10
    assert updated_sighting["confidence"] == 90
    assert updated_sighting["description"] == "Updated description"
    assert updated_sighting["created"] == original_created
    assert updated_sighting["modified"] != original_sighting["modified"]


def test_delete_sighting(session, cleanup_all_collections):
    indicator = new_indicator(session=session)
    indicator_id = indicator["indicator_id"]

    # Create sighting
    sighting_payload = example_sighting(indicator_id=indicator_id)
    resp = create_new_sighting(session, payload=sighting_payload)
    logger.debug(resp)

    # Verify sighting exists
    sightings = get_sightings_collection(session)
    assert len(sightings) == 1
    sighting_id = sightings[0]["sighting_id"]

    # Delete sighting
    delete_resp = delete_sighting(session, sighting_id=sighting_id)
    assert "sighting_id" in delete_resp
    assert delete_resp["sighting_id"] == sighting_id

    # Verify deletion
    sightings_after = get_sightings_collection(session)
    assert len(sightings_after) == 0
