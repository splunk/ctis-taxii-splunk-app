import React, { useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import Container from './container';
import { IdentitiesFileUploader } from './FileUploader';

export default function ImportIdentitiesPage() {
    const [identities, setIdentities] = useState([]);
    const [filename, setFilename] = useState('');
    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Identities</PageHeading>
            </PageHeadingContainer>
            <IdentitiesFileUploader setIdentities={setIdentities} filename={filename} setFilename={setFilename} />
            <div>
                <code>{JSON.stringify(identities)}</code>
            </div>
        </Container>
    );
}
