import styled from "styled-components";
import React from "react";
import Chip from "@splunk/react-ui/Chip";
import Calendar from '@splunk/react-icons/Calendar';
import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import CheckCircle from '@splunk/react-icons/CheckCircle';
import InformationCircle from '@splunk/react-icons/InformationCircle';



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

const COLOR_GREEN = '#1a8929';

export function SubmissionStatusChip({status}) {
    // TODO: Handle other statuses including CANCELLED
    let backgroundColor = variables.statusColorInfo;
    let icon = <InformationCircle/>;
    if (status === "SCHEDULED") {
        backgroundColor = variables.statusColorInfo;
        icon = <Calendar/>;
    }else if (status === "SENT") {
        backgroundColor = COLOR_GREEN;
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
