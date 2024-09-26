import React from "react";
import BaseButton from "../BaseButton";
import Tooltip from '@splunk/react-ui/Tooltip';
import Pencil from "@splunk/react-icons/Pencil";

export default function EditIconOnlyButton({onClick, to, tooltipContent="Edit", ...props}) {
    return (
        <Tooltip content={tooltipContent} onClick={onClick}>
            <BaseButton noBorder noMargin inline appearance="secondary" icon={<Pencil hideDefaultTooltip/>} to={to} {...props}/>
        </Tooltip>
    );
}
