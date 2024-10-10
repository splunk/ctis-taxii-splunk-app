import React from "react";
import ControlGroup from "@splunk/react-ui/ControlGroup";
import styled from "styled-components";
import {ReadOnlyContainer} from "./ReadOnlyContainer";

const StyledCustomControlGroup = styled(ControlGroup)`
    max-width: none; // Override max-width of ControlGroup which is 600px
`;

export const CustomControlGroup = ({readOnly = false, value, children, labelWidth=140, ...props}) => {
    return (
        <StyledCustomControlGroup labelWidth={labelWidth} {...props}>
            {readOnly && <ReadOnlyContainer>{value}</ReadOnlyContainer>}
            {!readOnly && children}
        </StyledCustomControlGroup>
    );
}
