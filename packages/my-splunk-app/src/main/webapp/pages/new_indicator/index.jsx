import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';
import {v4 as uuidv4} from 'uuid';
import {StyledContainer, StyledGreeting} from './styles';
import {NewIndicatorForm} from "./NewIndicatorForm";


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
            <StyledContainer>
                <StyledGreeting>New Indicator of Compromise (IoC)</StyledGreeting>
                <NewIndicatorForm initialIndicatorId={`indicator--${uuidv4()}`}
                        initialSplunkFieldName={splunkFieldName}
                        initialSplunkFieldValue={splunkFieldValue}
                />

            </StyledContainer>,
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
