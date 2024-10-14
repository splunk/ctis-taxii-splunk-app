import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import React from "react";
import PropTypes from "prop-types";
import BaseButton from "./BaseButton";

export default function SubmitButton({submitting, inline = true, label = "Submit", type = "submit", ...props}) {
    return (
        <BaseButton type={type} label={label} inline={inline} {...props}>
            {submitting && <WaitSpinner/>}
        </BaseButton>
    );
}

SubmitButton.propTypes = {
    submitting: PropTypes.bool.isRequired,
    inline: PropTypes.bool,
    label: PropTypes.string,
    type: PropTypes.string
}
