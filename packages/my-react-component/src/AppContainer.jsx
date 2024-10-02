import ToastMessages from "@splunk/react-toast-notifications";
import React from "react";
import styled, {createGlobalStyle} from "styled-components";
import {mixins, SplunkThemeProvider, variables} from "@splunk/themes";
import Toaster, {makeCreateToast} from "@splunk/react-toast-notifications/Toaster";

const GlobalStyle = createGlobalStyle`
    body {
        background-color: ${variables.backgroundColor};
    }
`

const StyledContainer = styled.div`
    ${mixins.reset('inline')};
    display: grid;
    gap: 5px;
    flex-direction: column;
    font-size: ${variables.fontSizeLarge};
    line-height: 200%;
    padding: ${variables.spacingXXLarge} ${variables.spacingXXLarge};
    background-color: ${variables.backgroundColor};
`;

export const createToast = makeCreateToast(Toaster);
export const createErrorToast = (error) => createToast(
    {
        type: 'error',
        title: 'Something went wrong!',
        message: `An error occurred: ${error}`,
        autoDismiss: false,
    });

export function AppContainer({children}) {
    return (
        <>
            <GlobalStyle/>
            <SplunkThemeProvider>
                <StyledContainer>
                    {children}
                    <ToastMessages position='top-right'/>
                </StyledContainer>
            </SplunkThemeProvider>
        </>
    )
}
