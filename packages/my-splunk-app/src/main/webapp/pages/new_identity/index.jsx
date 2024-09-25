import React from 'react';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import IdentityForm from "../../common/IdentityForm";
import {layoutWithTheme} from "../../common/theme";

function MainComponent() {
    return (
        <AppContainer>
            <IdentityForm/>
        </AppContainer>
    )
}

layoutWithTheme(<MainComponent/>);
