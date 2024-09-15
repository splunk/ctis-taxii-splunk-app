import Button from "@splunk/react-ui/Button";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import React from "react";

export default function SubmitButton({disabled, submitting, label, inline=false, type = "submit", appearance = "primary", ...props}) {
    // const label = numIndicators > 1 ? "Create Indicators" : "Create Indicator";
    return (
        <Button inline={inline} type={type} label={label} appearance={appearance} disabled={disabled} {...props}>
            {submitting && <WaitSpinner/>}
        </Button>
    );
}
