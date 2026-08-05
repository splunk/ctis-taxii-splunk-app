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

function extractStixObjectsOfCertainTypeFromJson(jsonText, stixObjectType){
    if(typeof jsonText !== 'string'){
        throw new Error("Expected jsonText to be non-null string");
    }
    if(typeof stixObjectType !== 'string'){
        throw new Error("Expected stixObjectType to be a non-null string");
    }
    assertTextIsStixBundleJson(jsonText);
    const obj = JSON.parse(jsonText);
    const filteredObjects = obj.objects.filter(x => {
        return x?.type === stixObjectType && x?.spec_version === '2.1';
    });
    if(filteredObjects.length === 0){
        throw new Error(`No stix objects of type "${stixObjectType}" found`);
    }
    return filteredObjects;
}

function extractIndicatorsFromBundleJSON(text) {
    return extractStixObjectsOfCertainTypeFromJson(text, 'indicator');
}

function extractIdentitiesFromBundleJSON(text) {
    return extractStixObjectsOfCertainTypeFromJson(text, 'identity');
}
function ErrorMessage({errorMessage}) {
    if(errorMessage){
        return <Message type="error" appearance="fill">ERROR: {errorMessage}</Message>;
    }
    return null;

}
ErrorMessage.propTypes = {
    errorMessage: PropTypes.string.isRequired
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
        <ErrorMessage errorMessage={errorMessage} />
    </>;
}

GenericFileUploader.propTypes = {
    onFileLoaded: PropTypes.func.isRequired,
    filename: PropTypes.string.isRequired,
    setFilename: PropTypes.func.isRequired,
}

export function IndicatorsFileUploader({ setIndicators, filename, setFilename }) {
    const [errorMessage, setErrorMessage] = useState(null);
    const onFileLoaded = useCallback((fileText) => {
        try {
            setIndicators(extractIndicatorsFromBundleJSON(fileText));
            setErrorMessage(null);
        } catch (e) {
            setErrorMessage(e.message);
            setIndicators([]);
        }
    }, [setIndicators]);

    return <>
        <GenericFileUploader onFileLoaded={onFileLoaded} filename={filename} setFilename={setFilename} />
        <ErrorMessage errorMessage={errorMessage} />
    </>
}

IndicatorsFileUploader.propTypes = {
    setIndicators: PropTypes.func.isRequired,
    filename: PropTypes.string.isRequired,
    setFilename: PropTypes.func.isRequired,
}

export function IdentitiesFileUploader({ setIdentities, filename, setFilename }) {
    const [errorMessage, setErrorMessage] = useState(null);
    const onFileLoaded = useCallback((fileText) => {
        try {
            setIdentities(extractIdentitiesFromBundleJSON(fileText));
            setErrorMessage(null);
        } catch (e) {
            setIdentities([]);
            setErrorMessage(e.message);
        }
    }, [setIdentities]);

    return <>
        <GenericFileUploader onFileLoaded={onFileLoaded} filename={filename} setFilename={setFilename} />
        <ErrorMessage errorMessage={errorMessage} />
    </>
}
IdentitiesFileUploader.propTypes = {
    setIdentities: PropTypes.func.isRequired,
    filename: PropTypes.string.isRequired,
    setFilename: PropTypes.func.isRequired,
}
