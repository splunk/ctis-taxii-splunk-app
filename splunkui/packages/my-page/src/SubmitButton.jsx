import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import React from "react";
import PropTypes from "prop-types";
import BaseButton from "./BaseButton";

export default function SubmitButton({submitting, inline = true, label = "Submit", type = "submit", disabled = false, ...props}) {
    return (
        <BaseButton type={type} label={label} inline={inline} disabled={(disabled || submitting) && 'disabled'} {...props}>
            {submitting && <WaitSpinner/>}
        </BaseButton>
    );
}

SubmitButton.propTypes = {
    submitting: PropTypes.bool.isRequired,
    inline: PropTypes.bool,
    label: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.bool,
}
