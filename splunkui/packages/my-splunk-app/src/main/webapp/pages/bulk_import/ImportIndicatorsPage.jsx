import React, { useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { useValidateStixIndicators } from '@splunk/my-page/src/hooks/useValidateStixIndicators';
import Button from '@splunk/react-ui/Button';
import PropTypes from 'prop-types';
import Checkbox from '@splunk/react-ui/Checkbox';
import Container from './container';
import { IndicatorsFileUploader } from './IndicatorsFileUploader';
import IndicatorsValidationSummary from './IndicatorsValidationSummary';

function SubmissionForm({indicators, numNewIndicators, numExistingIndicators}){
    const onClick = () => {
        console.log('Submitting...')
    }
    const [checked, setChecked] = useState(false);
    const checkboxOnChange = (e, {checked: newChecked}) => {
        setChecked(newChecked);
    }
    if(numExistingIndicators === 0){
        return <div>
            <Button appearance='primary' label={`Save ${numNewIndicators} new indicators`} onClick={onClick}/>
        </div>
    }
    const submitDisabled = !indicators || (numExistingIndicators > 0 && !checked);
    const buttonLabel = `Save ${numNewIndicators} new indicators and overwrite ${numExistingIndicators} existing indicators`;
    return (<div>
        <Checkbox checked={checked} onChange={checkboxOnChange}>I understand that some existing indicators will be overwritten.</Checkbox>
        <Button appearance='destructive' label={buttonLabel} disabled={submitDisabled} onClick={onClick}/>
    </div>)
}
SubmissionForm.propTypes = {
    indicators: PropTypes.array.isRequired,
    numNewIndicators: PropTypes.number.isRequired,
    numExistingIndicators: PropTypes.number.isRequired,
}
export default function ImportIndicatorsPage() {
    const [indicators, setIndicators] = useState([]);
    const { validationError, loading: validationLoading, existingIndicatorIds } = useValidateStixIndicators(indicators);

    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Indicators</PageHeading>
            </PageHeadingContainer>
            <IndicatorsFileUploader setIndicators={setIndicators} />
            <IndicatorsValidationSummary
                indicators={indicators}
                validationLoading={validationLoading}
                validationError={validationError}
                existingIndicatorIds={existingIndicatorIds}
            />
            {!validationLoading && !validationError && indicators.length > 0 &&
                <SubmissionForm indicators={indicators}
                                numNewIndicators={indicators.length - existingIndicatorIds.length}
                                numExistingIndicators={existingIndicatorIds.length} />}
        </Container>
    );
}
