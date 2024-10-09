import TextArea from "@splunk/react-ui/TextArea";
import React from "react";
import PropTypes from "prop-types";
import Link from "@splunk/react-ui/Link";
import Message from "@splunk/react-ui/Message";
import {CustomControlGroup} from "./CustomControlGroup";
import {LinkContainer} from "./LinkContainer";

const StixPatternControlGroup = ({
                                     label,
                                     value,
                                     onChange,
                                     help,
                                     error,
                                     patternApiError,
                                     setValueToSuggestedPattern,
                                     suggestedPattern,
                                     ...rest
                                 }) => {
    const onClick = (e) => {
        e.preventDefault();
        setValueToSuggestedPattern();
    }
    const suggestionText = (<LinkContainer>
        <Link to='#' onClick={onClick}>
            Use suggested pattern
        </Link>
    </LinkContainer>);
    const valueIsDiff = value !== suggestedPattern;
    const patternExists = !!suggestedPattern;

    return (
        <CustomControlGroup controlsLayout='stack' label={label} help={help} error={error} value={value} {...rest}>
            <TextArea spellCheck={false} value={value} onChange={onChange} error={error}/>
            {
                (!value || valueIsDiff) && patternExists && suggestionText
            }
            {patternApiError && <Message type="warning">Warning: {patternApiError}</Message>}
        </CustomControlGroup>
    );

}
StixPatternControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.bool,
    help: PropTypes.string,
    setValueToSuggestedPattern: PropTypes.func,
    suggestedPattern: PropTypes.string,
    patternApiError: PropTypes.string
}

export default StixPatternControlGroup;
