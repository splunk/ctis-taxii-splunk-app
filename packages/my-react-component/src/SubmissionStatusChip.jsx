import styled from "styled-components";
import React from "react";
import Chip from "@splunk/react-ui/Chip";
import Calendar from '@splunk/react-icons/Calendar';
import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import CheckCircle from '@splunk/react-icons/CheckCircle';
import InformationCircle from '@splunk/react-icons/InformationCircle';

import ExclamationCircle from '@splunk/react-icons/ExclamationCircle';

import {variables} from "@splunk/themes";

const StyledChip = styled(Chip)`
    background-color: ${props => props.backgroundColor};

    & div {
        color: ${props => props.foregroundColor || "white"};
    }
`;
const ChipContents = styled.div`
    display: flex;
    align-items: center;
    gap: 2px;
`;

const COLOR_GREEN = '#1a8929';

export function SubmissionStatusChip({status}) {
    let backgroundColor = variables.statusColorInfo;
    let foregroundColor = "white";
    let icon = <InformationCircle/>;
    if (status === "SCHEDULED") {
        backgroundColor = variables.statusColorInfo;
        icon = <Calendar/>;
    } else if (status === "SENT") {
        backgroundColor = COLOR_GREEN;
        icon = <CheckCircle/>;
    } else if (status === "FAILED") {
        backgroundColor = variables.statusColorCritical;
        icon = <ExclamationTriangle/>;
    } else if (status === "CANCELLED") {
        backgroundColor = variables.accentColorWarning;
        icon = <ExclamationCircle/>;
        foregroundColor = "black";
    }

    return <StyledChip backgroundColor={backgroundColor} foregroundColor={foregroundColor}>
        <ChipContents>
            {icon}
            <span>{status}</span>
        </ChipContents>
    </StyledChip>;
}
