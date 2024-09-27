import React from "react";
import BaseButton from "../BaseButton";
import Tooltip from '@splunk/react-ui/Tooltip';
import Pencil from "@splunk/react-icons/Pencil";
import {variables} from "@splunk/themes";

export default function EditIconOnlyButton({onClick, to, tooltipContent="Edit", ...props}) {
    return (
        <Tooltip content={tooltipContent} onClick={onClick}>
            <BaseButton borderColor={variables.contentColorMuted} noMargin inline appearance="default" icon={<Pencil hideDefaultTooltip/>} to={to} {...props}/>
        </Tooltip>
    );
}
