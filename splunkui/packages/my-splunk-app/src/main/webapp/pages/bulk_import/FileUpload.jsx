import { createToast } from '@splunk/my-page/src/AppContainer';
import { TOAST_TYPES } from '@splunk/react-toast-notifications/ToastConstants';
import File from '@splunk/react-ui/File';
import React from 'react';
import PropTypes from 'prop-types';

export default function FileUpload({ setFileText, fileName, setFileName, fileIsLoading, setFileIsLoading }) {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (event) => {
        setFileText(event.target.result);
        setFileIsLoading(false);
    });

    const handleOnRequestAdd = (files) => {
        console.log('handleOnRequestAdd', files);
        if (files?.length === 1) {
            const file = files[0];
            if (file.type !== 'application/json') {
                createToast({
                    type: TOAST_TYPES.ERROR,
                    title: `Invalid file ${file.name}`,
                    message: `Expected a JSON file`,
                    autoDismiss: true
                });
                return;
            }
            setFileText(null);
            setFileIsLoading(true);
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
    return (<div>
        <File accept=".json" onRequestAdd={handleOnRequestAdd} onRequestRemove={handleOnRequestRemove}
              disabled={fileIsLoading} />
        <div>{fileName ? `File selected: ${fileName}` : 'No file selected'}</div>
    </div>);
}
FileUpload.propTypes = {
    setFileText: PropTypes.func.isRequired,
    setFileName: PropTypes.func.isRequired,
    fileName: PropTypes.string.isRequired,
    fileIsLoading: PropTypes.bool.isRequired,
    setFileIsLoading: PropTypes.func.isRequired,
}
