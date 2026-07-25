import React, { useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { useValidateStixIndicators } from '@splunk/my-page/src/hooks/useValidateStixIndicators';
import Container from './container';
import { IndicatorsFileUploader } from './IndicatorsFileUploader';
import IndicatorsValidationSummary from './IndicatorsValidationSummary';


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
        </Container>
    );
}
