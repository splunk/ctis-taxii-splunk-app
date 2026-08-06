import React, { useState } from 'react';
import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import SubmitButton from '@splunk/my-page/src/SubmitButton';
import Checkbox from '@splunk/react-ui/Checkbox';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { variables } from '@splunk/themes';

const SubmitSectionContainer = styled.div`
    margin-top: ${variables.spacingLarge};
`;

export function GenericSubmitSection({ numExistingRecords, numNewRecords, submitting = false }) {
    const totalRecords = numExistingRecords + numNewRecords;
    const [checked, setChecked] = useState(false);
    const checkboxOnChange = (e, { checked: newChecked }) => {
        setChecked(newChecked);
    };
    if (numExistingRecords === 0) {
        return <CustomControlGroup>
            <SubmitButton submitting={submitting} appearance="primary" label={`Import ${numNewRecords} records`} />
        </CustomControlGroup>;
    }
    const disabledDueToUnchecked = (numExistingRecords > 0 && !checked);
    const buttonLabel = `Import ${totalRecords} objects (${numExistingRecords} existing will be overwritten)`;
    return (<SubmitSectionContainer>
        <CustomControlGroup label="Please Check to Continue">
            <Checkbox checked={checked} onChange={checkboxOnChange}>I understand that some existing objects will be
                overwritten.</Checkbox>
        </CustomControlGroup>
        <CustomControlGroup>
            <SubmitButton submitting={submitting} appearance="destructive" label={buttonLabel}
                          disabled={disabledDueToUnchecked} />
        </CustomControlGroup>
    </SubmitSectionContainer>);
}
GenericSubmitSection.propTypes = {
    numExistingRecords: PropTypes.number.isRequired,
    numNewRecords: PropTypes.number.isRequired,
    submitting: PropTypes.bool,
}
