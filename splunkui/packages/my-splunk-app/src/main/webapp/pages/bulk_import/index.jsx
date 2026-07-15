import React, { useState } from 'react';
import { AppContainer, createToast } from '@splunk/my-page/src/AppContainer';
import Message from '@splunk/react-ui/Message';
import { getUrlQueryParams } from '@splunk/my-page/src/queryParams';
import File from '@splunk/react-ui/File';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import Chip from '@splunk/react-ui/Chip';
import styled from 'styled-components';
import { TOAST_TYPES } from '@splunk/react-toast-notifications/ToastConstants';
import { layoutWithTheme } from '../../common/theme';

const Container = styled.div`
    max-width: 1000px;
`;
function validateTextIsStixBundleJson(text) {
    try {
        const obj = JSON.parse(text);
        return obj?.type === 'bundle';
    } catch (e) {
        return false;
    }
}

function BulkImportIndicators() {
    const fileReader = new FileReader();
    const [fileText, setFileText] = useState(null);
    const [filename, setFileName] = useState(null);
    fileReader.addEventListener('load', (event) => {
        setFileText(event.target.result);
    });

    const handleOnRequestAdd = (files) => {
        console.log('handleOnRequestAdd', files);
        if (files?.length === 1) {
            const file = files[0];
            if(file.type !== 'application/json'){
                createToast({
                    type: TOAST_TYPES.ERROR,
                    title: `Invalid file ${file.name}`,
                    message: `Expected a JSON file`,
                    autoDismiss: true,
                });
                return;
            }
            setFileText(null);
            fileReader.readAsText(file);
            setFileName(file.name);
        }
    };
    const handleOnRequestRemove = () => {
        setFileName(null);
        setFileText(null);
        if (fileReader.readyState === 1) {
            fileReader.abort();
        }
    };
    const statusChip = (fileText !== null && validateTextIsStixBundleJson(fileText))
        ? <Chip appearance="success">{filename} is valid</Chip>
        : <Chip appearance="error">{filename} is not valid</Chip>;

    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Indicators</PageHeading>
            </PageHeadingContainer>
            <PageHeading level={2}>Please upload a JSON STIX Bundle file.</PageHeading>
            <File accept=".json" onRequestAdd={handleOnRequestAdd} onRequestRemove={handleOnRequestRemove} />
            {fileText && <div>
                {statusChip}
                <pre>{fileText}</pre>
            </div>}
        </Container>
    );
}

function BulkImportIdentities() {
    return (<Message>Bulk import identities</Message>);
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('model', 'indicator')) {
        return <BulkImportIndicators />;
    }
    if (queryParams.has('model', 'identity')) {
        return <BulkImportIdentities />;
    }
    return (<Message>Bulk Import Page - expected model query param.</Message>);
}

layoutWithTheme(
    <AppContainer>
        <Router />
    </AppContainer>
);
