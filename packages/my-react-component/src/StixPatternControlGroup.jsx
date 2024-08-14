import ControlGroup from "@splunk/react-ui/ControlGroup";
import TextArea from "@splunk/react-ui/TextArea";
import React from "react";
import PropTypes from "prop-types";
import Link from "@splunk/react-ui/Link";
import styled from "styled-components";
import {variables} from '@splunk/themes';
import {CustomControlGroup} from "./CustomControlGroup";

const LinkContainer = styled.div`
    padding: ${variables.spacingXSmall} 0 0;
`;

const StixPatternControlGroup = ({
                                     label,
                                     value,
                                     onChange,
                                     help,
                                     error,
                                     useSuggestedPattern,
                                     suggestedPattern,
                                     ...rest
                                 }) => {
    const onClick = (e) => {
        console.log(e);
        e.preventDefault();
        useSuggestedPattern();
    }
    const suggestionText = (<LinkContainer>
        <Link to='#' onClick={onClick}>
            Use suggested pattern
        </Link>
    </LinkContainer>);
    const valueIsDiff = value !== suggestedPattern;
    const patternExists = !!suggestedPattern;

    return (
        <CustomControlGroup controlsLayout='stack' label={label} help={help} error={error} {...rest}>
            <TextArea value={value} onChange={onChange} error={error}/>
            {
                (!value || valueIsDiff) && patternExists && suggestionText
            }
        </CustomControlGroup>
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
