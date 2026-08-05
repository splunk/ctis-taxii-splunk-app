import React, { useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { useValidateStixIndicators } from '@splunk/my-page/src/hooks/useValidateStixObjects';
import Container from './container';
import { IndicatorsFileUploader } from './FileUploader';
import IndicatorsValidationSummary from './IndicatorsValidationSummary';
import { SubmissionForm } from './SubmissionForm';

export default function ImportIndicatorsPage() {
    const [filename, setFilename] = useState(null);
    const [indicators, setIndicators] = useState([]);
    const { validationError, loading: validationLoading, existingIds } = useValidateStixIndicators(indicators);

    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Indicators</PageHeading>
            </PageHeadingContainer>
            <IndicatorsFileUploader setIndicators={setIndicators} filename={filename} setFilename={setFilename}/>
            <IndicatorsValidationSummary
                indicators={indicators}
                validationLoading={validationLoading}
                validationError={validationError}
                existingIndicatorIds={existingIds}
            />
            {!validationLoading && !validationError && indicators.length > 0 &&
                <SubmissionForm indicators={indicators}
                                filename={filename}
                                numExistingIndicators={existingIds.length} />}
        </Container>
    );
}
