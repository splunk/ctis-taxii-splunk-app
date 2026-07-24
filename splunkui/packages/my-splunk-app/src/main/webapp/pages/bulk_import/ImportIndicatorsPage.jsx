import React, { useEffect, useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import Message from '@splunk/react-ui/Message';
import PropTypes from 'prop-types';
import Container from './container';
import FileUpload from './FileUpload';

function extractIndicatorsFromBundleJSON(text) {
    let obj;
    try {
        obj = JSON.parse(text);
    } catch (e) {
        throw new Error(`Unable to parse text as JSON: ${e.toString()}`);
    }
    if(!Array.isArray(obj?.objects)) {
        throw new Error(`Expected "objects" to be a top-level array`)
    }
    return obj.objects.filter(x => {
        return x?.type === 'indicator' && x?.spec_version === '2.1';
    });
}
function IndicatorsFileUploader({indicators, setIndicators}){
    const [fileText, setFileText] = useState(null);
    const [filename, setFileName] = useState(null);
    const [fileIsLoading, setFileIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if(fileText){
            try {
                setIndicators(extractIndicatorsFromBundleJSON(fileText));
                setErrorMessage(null);
            }catch(e){
                setIndicators([]);
                setErrorMessage(e.message);
            }
        }
    }, [fileText, setIndicators]);
   return <>
       <PageHeading level={2}>Please upload a JSON STIX Bundle file.</PageHeading>
       <FileUpload setFileText={setFileText} fileName={filename} setFileName={setFileName} fileIsLoading={fileIsLoading} setFileIsLoading={setFileIsLoading} />
       <div>Indicators found: {indicators.length}</div>
       {errorMessage && <Message type='error' appearance='fill'>Error: {errorMessage}</Message>}
   </>
}
IndicatorsFileUploader.propTypes = {
    indicators: PropTypes.arrayOf(PropTypes.shape({})),
    setIndicators: PropTypes.func.isRequired
}

export default function ImportIndicatorsPage() {
    const [indicators, setIndicators] = useState([]);

    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Indicators</PageHeading>
            </PageHeadingContainer>
            <IndicatorsFileUploader indicators={indicators} setIndicators={setIndicators} />
        </Container>
    );
}
