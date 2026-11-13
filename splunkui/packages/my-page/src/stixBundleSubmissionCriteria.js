// Marking-definition ids for TLP 2.0. Keep in sync with TA_CTIS_TAXII/package/bin/models/tlp_v2.py
const TLP_MARKING_ID_TO_NAME = {
    'marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487': 'TLP:CLEAR',
    'marking-definition--bab4a63c-aed9-4cf5-a766-dfca5abac2bb': 'TLP:GREEN',
    'marking-definition--55d920b0-5e8b-4f79-9ee9-91f868d9b421': 'TLP:AMBER',
    'marking-definition--939a9414-2ddd-4d32-a0cd-375ea402b003': 'TLP:AMBER+STRICT',
    'marking-definition--e828b379-4e03-4974-9ac4-e53a884c97c1': 'TLP:RED',
};

// Only these object types are checked against the submission criteria.
const ANALYSED_TYPES = new Set(['grouping', 'indicator', 'sighting', 'identity']);

// Backend default when an object has no confidence (see models/indicator.py).
const MISSING_CONFIDENCE_VALUE = 100;

function getTlpName(object) {
    const refs = Array.isArray(object.object_marking_refs) ? object.object_marking_refs : [];
    const ref = refs.find((r) => TLP_MARKING_ID_TO_NAME[r]);
    return ref ? TLP_MARKING_ID_TO_NAME[ref] : null;
}

/**
 * Checks each object in a STIX bundle against the submission criteria.
 * Returns { violations: [{ id, type, name, reasons: string[] }] }.
 */
export function analyzeBundle(bundle, { minConfidence, tlpAllowlist }) {
    const objects = Array.isArray(bundle?.objects) ? bundle.objects : [];
    const violations = [];

    objects.forEach((object) => {
        if (!object || !ANALYSED_TYPES.has(object.type)) {
            return;
        }
        const reasons = [];

        const confidence = typeof object.confidence === 'number' ? object.confidence : MISSING_CONFIDENCE_VALUE;
        if (confidence < minConfidence) {
            reasons.push(`confidence ${confidence} is below the minimum of ${minConfidence}`);
        }

        const tlp = getTlpName(object);
        if (tlp && !tlpAllowlist.includes(tlp)) {
            reasons.push(`${tlp} is not an allowed TLP 2.0 value`);
        }

        if (reasons.length > 0) {
            violations.push({ id: object.id, type: object.type, name: object.name, reasons });
        }
    });

    return { violations };
}
