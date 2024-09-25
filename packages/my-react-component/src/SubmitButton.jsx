import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import React from "react";
import BaseButton from "./BaseButton";

export default function SubmitButton({submitting, inline = true, label = "Submit", type = "submit", ...props}) {
    return (
        <BaseButton type={type} label={label} inline={inline} {...props}>
            {submitting && <WaitSpinner/>}
        </BaseButton>
    );
}
