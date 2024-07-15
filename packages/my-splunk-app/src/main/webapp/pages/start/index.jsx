import React from 'react';

import layout from '@splunk/react-page';
import MyReactComponent from '@splunk/my-react-component';
import { getUserTheme } from '@splunk/splunk-utils/themes';

import { StyledContainer, StyledGreeting } from './StartStyles';

getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Hello, from inside MySplunkApp!</StyledGreeting>
                <div>Your component will appear below.</div>
                <MyReactComponent name="from inside MyReactComponent" />
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
