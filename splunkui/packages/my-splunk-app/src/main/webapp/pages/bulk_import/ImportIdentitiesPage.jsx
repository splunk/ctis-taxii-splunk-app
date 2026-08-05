import React, { useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { useValidateStixIdentities } from '@splunk/my-page/src/hooks/useValidateStixObjects';
import Container from './container';
import { IdentitiesFileUploader } from './FileUploader';
import ValidationSummary from './ValidationSummary';

export default function ImportIdentitiesPage() {
    const [identities, setIdentities] = useState([]);
    const [filename, setFilename] = useState('');
    const { loading, validationError, existingIds } = useValidateStixIdentities(identities);
    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Identities</PageHeading>
            </PageHeadingContainer>
            <IdentitiesFileUploader setIdentities={setIdentities} filename={filename} setFilename={setFilename} />
            <ValidationSummary
                stixObjects={identities}
                stixObjectType='identity'
                validationLoading={loading}
                validationError={validationError}
                existingIds={existingIds}
            />
        </Container>
    );
}
