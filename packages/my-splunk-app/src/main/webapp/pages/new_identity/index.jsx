import React, {useEffect, useState} from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';
import {NewIndicatorForm} from "./NewIndicatorForm";
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";
import {getData} from "@splunk/splunk-utils/search";
import P from "@splunk/react-ui/Paragraph";
import styled from "styled-components";

const MyForm = styled.form`
    max-width: 1000px;
`
function MainComponent() {
    return (
        <AppContainer>
            <Heading level={1}>New Identity</Heading>
            <MyForm>

            </MyForm>
        </AppContainer>
    )
}

getUserTheme()
    .then((theme) => {
        layout(
            <MainComponent />,
            { theme, }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
