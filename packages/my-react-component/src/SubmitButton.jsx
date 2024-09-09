import Button from "@splunk/react-ui/Button";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import React from "react";

export default function SubmitButton({disabled, submitting, label}) {
    // const label = numIndicators > 1 ? "Create Indicators" : "Create Indicator";
    return (
        <Button inline={false} type="submit" label={label} appearance="primary" disabled={disabled}>
            {submitting && <WaitSpinner/>}
        </Button>
    );
}
