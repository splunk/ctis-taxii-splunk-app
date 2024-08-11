import Button from "@splunk/react-ui/Button";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import React from "react";

export default function SubmitButton({disabled, submitting}) {
    return (
        <Button type="submit" label="Create Indicator" appearance="primary" disabled={disabled}>
            {submitting && <WaitSpinner/>}
        </Button>
    );
}
