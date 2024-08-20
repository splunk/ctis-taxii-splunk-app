import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';
import {v4 as uuidv4} from 'uuid';
import {NewIndicatorForm} from "./NewIndicatorForm";
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";


function getUrlQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const splunkFieldName = urlParams.get('splunkFieldName');
    const splunkFieldValue = urlParams.get('splunkFieldValue');
    return {splunkFieldName, splunkFieldValue}
}

getUserTheme()
    .then((theme) => {
        const {splunkFieldName, splunkFieldValue} = getUrlQueryParams();
        layout(
            <AppContainer>
                <Heading level={1}>New Indicator of Compromise (IoC)</Heading>
                <NewIndicatorForm
                        initialSplunkFieldName={splunkFieldName}
                        initialSplunkFieldValue={splunkFieldValue}
                />

            </AppContainer>,
            {
                theme,
            }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
