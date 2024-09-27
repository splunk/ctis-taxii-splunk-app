import React from "react";
import BaseButton from "../BaseButton";
import Tooltip from '@splunk/react-ui/Tooltip';
import TrashCanCross from "@splunk/react-icons/TrashCanCross";

export default function DeleteIconOnlyButton({onClick, tooltipContent = "Delete", ...props}) {
    return (
        <Tooltip content={tooltipContent} onClick={onClick}>
            <BaseButton noMargin inline appearance="destructive" icon={<TrashCanCross hideDefaultTooltip/>} {...props}/>
        </Tooltip>
    );
}
