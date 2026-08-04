import React, { useCallback, useEffect, useState } from 'react';
import { PageHeading } from '@splunk/my-page/src/PageHeading';
import Message from '@splunk/react-ui/Message';
import PropTypes from 'prop-types';
import FileUpload from './FileUpload';

function assertTextIsStixBundleJson(text){
    let obj;
    try {
        obj = JSON.parse(text);
    } catch (e) {
        throw new Error(`Unable to parse text as JSON: ${e.toString()}`);
    }
    if (!Array.isArray(obj?.objects)) {
        throw new Error(`Expected "objects" to be a top-level array`);
    }
}

function extractIndicatorsFromBundleJSON(text) {
    assertTextIsStixBundleJson(text);
    const obj = JSON.parse(text);
    return obj.objects.filter(x => {
        return x?.type === 'indicator' && x?.spec_version === '2.1';
    });
}

function GenericFileUploader({ onFileLoaded, filename, setFilename }) {
    const [fileText, setFileText] = useState(null);
    const [fileIsLoading, setFileIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (fileText) {
            try {
                console.log('Firing onFileLoaded')
                onFileLoaded(fileText);
                setErrorMessage(null);
            } catch (e) {
                setErrorMessage(e.message);
            }
        }
    }, [fileText, onFileLoaded]);
    return <>
        <PageHeading level={2}>Choose a JSON STIX Bundle file.</PageHeading>
        <FileUpload setFileText={setFileText} fileName={filename} setFileName={setFilename}
                    fileIsLoading={fileIsLoading} setFileIsLoading={setFileIsLoading} />
        {errorMessage && <Message type="error" appearance="fill">Error: {errorMessage}</Message>}
    </>;
}

GenericFileUploader.propTypes = {
    onFileLoaded: PropTypes.func.isRequired,
    filename: PropTypes.string.isRequired,
    setFilename: PropTypes.func.isRequired,
}

export function IndicatorsFileUploader({ setIndicators, filename, setFilename }) {
    const onFileLoaded = useCallback((fileText) => {
        try {
            setIndicators(extractIndicatorsFromBundleJSON(fileText));
        } catch (e) {
            setIndicators([]);
        }
    }, [setIndicators]);

    return <GenericFileUploader onFileLoaded={onFileLoaded} filename={filename} setFilename={setFilename} />
}

IndicatorsFileUploader.propTypes = {
    setIndicators: PropTypes.func.isRequired,
    filename: PropTypes.string.isRequired,
    setFilename: PropTypes.func.isRequired,
}
