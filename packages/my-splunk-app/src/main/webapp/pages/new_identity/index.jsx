import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";
import {NewIdentityForm} from "./form";

function MainComponent() {
    return (
        <AppContainer>
            <Heading level={1}>New Identity</Heading>
            <NewIdentityForm/>
        </AppContainer>
    )
}

getUserTheme()
    .then((theme) => {
        layout(
            <MainComponent/>,
            {theme,}
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
