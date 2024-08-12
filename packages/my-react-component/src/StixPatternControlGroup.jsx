import ControlGroup from "@splunk/react-ui/ControlGroup";
import TextArea from "@splunk/react-ui/TextArea";
import React from "react";
import PropTypes from "prop-types";
import Link from "@splunk/react-ui/Link";

const StixPatternControlGroup = ({label, value, onChange, help, error, hasSuggestedPattern, useSuggestedPattern, valueIsDifferentToSuggestedPattern, ...rest}) => {
    const onClick = (e) => {
        console.log(e);
        e.preventDefault();
        useSuggestedPattern();
    }
    const suggestionText = (<div>
        <Link to='#' onClick={onClick}>
            Use suggested pattern
        </Link>
    </div>);
    return (
        <ControlGroup controlsLayout='stack' label={label} help={help} error={error} {...rest}>
            <TextArea value={value} onChange={onChange} error={error}/>
            {
                (!value || valueIsDifferentToSuggestedPattern(value)) && hasSuggestedPattern() && suggestionText
            }
        </ControlGroup>
    );

}
StixPatternControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string
}

export default StixPatternControlGroup;
