import {expect, test} from '@jest/globals'

import {findErrorMessage} from "./formInputProps";

test('blank object', () => {
    expect(findErrorMessage({}, 'test')).toBeNull();
});

test('simple object', () => {
    const validationObject = {
        myField: {
            ref: {
                name: 'myField'
            },
            message: 'test message'
        }
    };
    expect(findErrorMessage(validationObject, 'myField')).toBe('test message');
});
const sampleComplexErrorObject = {
    "indicators": [{
        "indicator_value": {
            "type": "required",
            "message": "Indicator Value is required.",
            "ref": {"name": "indicators.0.indicator_value"}
        },
        "indicator_category": {
            "type": "required",
            "message": "Indicator Category is required.",
            "ref": {"name": "indicators.0.indicator_category"}
        },
        "stix_pattern": {
            "type": "required",
            "message": "STIX Pattern is required.",
            "ref": {"name": "indicators.0.stix_pattern"}
        },
        "name": {"type": "required", "message": "Indicator Name is required.", "ref": {"name": "indicators.0.name"}},
        "description": {
            "type": "required",
            "message": "Indicator Description is required.",
            "ref": {"name": "indicators.0.description"}
        }
    }]
}

test('array of objects', () => {
    expect(findErrorMessage(sampleComplexErrorObject, 'indicators.0.indicator_value')).toBe('Indicator Value is required.');
    expect(findErrorMessage(sampleComplexErrorObject, 'indicators.0.description')).toBe('Indicator Description is required.');
});
