import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import IdentityForm from "../../common/IdentityForm";

function MainComponent() {
    return (
        <AppContainer>
            <IdentityForm/>
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
