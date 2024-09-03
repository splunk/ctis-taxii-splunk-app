import ToastMessages from "@splunk/react-toast-notifications";
import React from "react";
import styled from "styled-components";
import {mixins, variables} from "@splunk/themes";
import Toaster, {makeCreateToast} from "@splunk/react-toast-notifications/Toaster";

const StyledContainer = styled.div`
    ${mixins.reset('inline')};
    display: grid;
    //gap: 10px;
    flex-direction: column;
    font-size: ${variables.fontSizeLarge};
    line-height: 200%;
    margin: ${variables.spacingXXLarge} ${variables.spacingXXLarge};
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
        <StyledContainer>
            {children}
            <ToastMessages position='top-right'/>
        </StyledContainer>
    )
}
