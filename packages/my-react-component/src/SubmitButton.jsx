import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import React from "react";
import BaseButton from "./BaseButton";

export default function SubmitButton({submitting, type="submit", ...props}) {
    return (
        <BaseButton type={type} {...props}>
            {submitting && <WaitSpinner/>}
        </BaseButton>
    );
}
