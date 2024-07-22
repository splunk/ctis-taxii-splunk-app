import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ControlGroup from '@splunk/react-ui/ControlGroup';
import {v4 as uuidv4} from 'uuid';
import Text from '@splunk/react-ui/Text';
import PropTypes from 'prop-types';
import {StyledContainer, StyledGreeting} from './styles';


function MyForm({initialIndicatorId}) {
    return (
        <form>
            <ControlGroup label="Indicator ID">
                <Text canClear value={initialIndicatorId} />
            </ControlGroup>
        </form>
    );
}
MyForm.propTypes = {
    initialIndicatorId: PropTypes.string,
};

getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>New Indicator of Compromise (IoC)</StyledGreeting>
                <MyForm initialIndicatorId={`indicator--${uuidv4()}`} />

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
