import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ControlGroup from '@splunk/react-ui/ControlGroup';
import {v4 as uuidv4} from 'uuid';
import Text from '@splunk/react-ui/Text';
import PropTypes from 'prop-types';
import {StyledContainer, StyledGreeting} from './styles';


function MyForm({initialIndicatorId, splunkFieldName, splunkFieldValue}) {
    return (
        <form>
            <ControlGroup label="Indicator ID">
                <Text canClear value={initialIndicatorId} />
            </ControlGroup>
            <ControlGroup label="Splunk Field Name">
                <Text canClear value={splunkFieldName} />
            </ControlGroup>
            <ControlGroup label="Splunk Field Value">
                <Text canClear value={splunkFieldValue} />
            </ControlGroup>
        </form>
    );
}
MyForm.propTypes = {
    initialIndicatorId: PropTypes.string,
};
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
                <MyForm initialIndicatorId={`indicator--${uuidv4()}`}
                        splunkFieldName={splunkFieldName}
                        splunkFieldValue={splunkFieldValue}
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
