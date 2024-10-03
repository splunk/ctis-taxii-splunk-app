import Cross from '@splunk/react-icons/Cross';
import React from "react";
import SubmitButton from "../SubmitButton";

export function CancelSubmissionButton({inline = true, label = "Cancel Submission", ...props}) {
    return <SubmitButton inline={inline} icon={<Cross/>} label={label} appearance="destructive" {...props}/>
}
