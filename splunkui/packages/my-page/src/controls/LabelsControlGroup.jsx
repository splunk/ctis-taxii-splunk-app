import { useFormContext } from 'react-hook-form';
import Multiselect from '@splunk/react-ui/Multiselect';
import PropTypes from 'prop-types';
import React from 'react';
import { CustomControlGroup } from '../CustomControlGroup';

export function LabelsControlGroup({ fieldName }) {
    const { setValue, watch } = useFormContext();
    const labels = watch(fieldName);
    const handleOnChange = (e, { values }) => {
        setValue(fieldName, values, { shouldValidate: true });
    };

    return (<CustomControlGroup label="Labels" help="Type to add a label. Click on a label to remove it.">
        <Multiselect allowNewValues values={labels} onChange={handleOnChange} />
    </CustomControlGroup>);
}

LabelsControlGroup.propTypes = {
    fieldName: PropTypes.string.isRequired
};
