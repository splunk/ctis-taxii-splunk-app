import styled from "styled-components";
import React from "react";
import Chip from "@splunk/react-ui/Chip";
import Calendar from '@splunk/react-icons/Calendar';
import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import CheckCircle from '@splunk/react-icons/CheckCircle';

import {variables} from "@splunk/themes";

const StyledChip = styled(Chip)`
    background-color: ${props => props.backgroundColor};

    & div {
        color: white;
    }
`;
const ChipContents = styled.div`
    display: flex;
    align-items: center;
    gap: 2px;
`;

export function SubmissionStatusChip({status}) {
    let backgroundColor = variables.statusColorInfo;
    let icon = <Calendar/>;
    if (status === "SENT") {
        backgroundColor = '#1a8929';
        icon = <CheckCircle/>;
    } else if (status === "FAILED") {
        backgroundColor = variables.statusColorCritical;
        icon = <ExclamationTriangle/>;
    }
    return <StyledChip backgroundColor={backgroundColor}>
        <ChipContents>
            {icon}
            {status}
        </ChipContents>
    </StyledChip>;
}
