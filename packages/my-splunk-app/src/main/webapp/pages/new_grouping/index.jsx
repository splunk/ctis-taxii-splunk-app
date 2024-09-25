import React from 'react';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import GroupingForm from "../../common/GroupingForm";
import {layoutWithTheme} from "../../common/theme";

function MainComponent() {
    return (
        <AppContainer>
            <GroupingForm/>
        </AppContainer>
    )
}

layoutWithTheme(<MainComponent/>);
