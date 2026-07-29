import { useFormContext } from 'react-hook-form';
import Checkbox from '@splunk/react-ui/Checkbox';
import PropTypes from 'prop-types';
import React from 'react';
import { CustomControlGroup } from '../CustomControlGroup';

export function CheckboxControlGroup({ fieldName, label, controlGroupHelp }) {
    const { setValue, watch } = useFormContext();
    const isChecked = watch(fieldName);
    return (<CustomControlGroup label={label} help={controlGroupHelp}>
        <Checkbox checked={isChecked}
                  onChange={(e, { checked }) => setValue(fieldName, checked, { shouldValidate: true })} />
    </CustomControlGroup>);
}

CheckboxControlGroup.propTypes = {
    fieldName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    controlGroupHelp: PropTypes.string.isRequired
};

export function RevokedCheckboxControlGroup({ fieldName }) {
    return <CheckboxControlGroup fieldName={fieldName} label='Revoked' controlGroupHelp='Whether the object has been revoked. Revoked objects are no longer considered valid by the object creator.' />
}
RevokedCheckboxControlGroup.propTypes = {
    fieldName: PropTypes.string.isRequired,
}
