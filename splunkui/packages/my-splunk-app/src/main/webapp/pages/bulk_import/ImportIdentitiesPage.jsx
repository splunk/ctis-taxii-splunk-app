import React, { useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { useValidateStixIdentities } from '@splunk/my-page/src/hooks/useValidateStixObjects';
import Loader from '@splunk/my-page/src/Loader';
import Container from './container';
import { IdentitiesFileUploader } from './FileUploader';

export default function ImportIdentitiesPage() {
    const [identities, setIdentities] = useState([]);
    const [filename, setFilename] = useState('');
    const {loading, validationError, existingIds} = useValidateStixIdentities(identities);
    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Identities</PageHeading>
            </PageHeadingContainer>
            <IdentitiesFileUploader setIdentities={setIdentities} filename={filename} setFilename={setFilename} />
            <Loader loading={loading}>
                {validationError && <div>{validationError}</div>}
                <div>
                    Existing IDs: {existingIds.length}
                </div>
            </Loader>
            <div>
                <code>{JSON.stringify(identities)}</code>
            </div>
        </Container>
    );
}
