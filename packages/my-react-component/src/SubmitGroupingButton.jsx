import BaseButton from "./BaseButton";
import PaperPlane from "@splunk/react-icons/PaperPlane";
import {urlForSubmitGrouping} from "./urls";
import React from "react";

export function SubmitGroupingButton({groupingId, label = "Submit Grouping", ...props}) {
    return <BaseButton inline icon={<PaperPlane/>} label={label} appearance="primary"
                       to={urlForSubmitGrouping(groupingId)} {...props}/>
}
