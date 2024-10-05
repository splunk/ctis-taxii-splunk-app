import {useFormContext} from "react-hook-form";
import React, {useEffect, useState} from "react";
import Heading from "@splunk/react-ui/Heading";
import Divider from "@splunk/react-ui/Divider";
import styled from "styled-components";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {variables} from '@splunk/themes';
import Switch from "@splunk/react-ui/Switch";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import DeleteButton from "@splunk/my-react-component/src/DeleteButton";
import PropTypes from "prop-types";
import {
    IndicatorCategoryField,
    IndicatorDescriptionField,
    IndicatorNameField,
    IndicatorValueField,
    SplunkFieldNameDropdown
} from "../../common/indicator_form/formControls";
import {
    FIELD_INDICATOR_CATEGORY,
    FIELD_INDICATOR_DESCRIPTION,
    FIELD_INDICATOR_NAME,
    FIELD_INDICATOR_VALUE,
    FIELD_INDICATORS,
    FIELD_SPLUNK_FIELD_NAME,
    FIELD_STIX_PATTERN,
    REGISTER_FIELD_OPTIONS
} from "../../common/indicator_form/fieldNames";
import {PatternSuggester} from "./patternSuggester";

const HorizontalLayout = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${variables.spacingLarge} 0;
`
const StyledHeading = styled(Heading)`
    margin: 0;
    flex-grow: 1;
`;
const StyledSection = styled.section`
    margin-bottom: ${variables.spacingMedium};
`;

export const IndicatorSubForm = ({
                                     field,
                                     index,
                                     splunkEvent,
                                     indicatorCategories,
                                     removeSelf,
                                     submissionErrors
                                 }) => {
    // It is assumed that this subform is used within a FormProvider
    const formMethods = useFormContext();
    const {register, setValue, watch} = formMethods;
    const splunkFields = Object.keys(splunkEvent || {});

    const fieldSplunkFieldName = `${FIELD_INDICATORS}.${index}.${FIELD_SPLUNK_FIELD_NAME}`;
    const fieldIndicatorValue = `${FIELD_INDICATORS}.${index}.${FIELD_INDICATOR_VALUE}`;
    const fieldIndicatorCategory = `${FIELD_INDICATORS}.${index}.${FIELD_INDICATOR_CATEGORY}`;
    const fieldIndicatorName = `${FIELD_INDICATORS}.${index}.${FIELD_INDICATOR_NAME}`;
    const fieldIndicatorDescription = `${FIELD_INDICATORS}.${index}.${FIELD_INDICATOR_DESCRIPTION}`;
    const fieldStixPattern = `${FIELD_INDICATORS}.${index}.${FIELD_STIX_PATTERN}`;

    register(fieldSplunkFieldName, REGISTER_FIELD_OPTIONS[FIELD_SPLUNK_FIELD_NAME]);
    register(fieldIndicatorValue, REGISTER_FIELD_OPTIONS[FIELD_INDICATOR_VALUE]);
    register(fieldIndicatorCategory, REGISTER_FIELD_OPTIONS[FIELD_INDICATOR_CATEGORY]);
    register(fieldStixPattern, REGISTER_FIELD_OPTIONS[FIELD_STIX_PATTERN]);
    register(fieldIndicatorName, REGISTER_FIELD_OPTIONS[FIELD_INDICATOR_NAME]);
    register(fieldIndicatorDescription, REGISTER_FIELD_OPTIONS[FIELD_INDICATOR_DESCRIPTION]);

    const splunkFieldName = watch(fieldSplunkFieldName);
    const indicatorValue = watch(fieldIndicatorValue);
    const indicatorCategory = watch(fieldIndicatorCategory);

    const indexStartingAtOne = index + 1;
    const splunkFieldDropdownOptions = splunkFields.map(splunkField => ({
        label: `${splunkField} (${splunkEvent[splunkField]})`,
        value: splunkField
    }));
    const [toggleShowSplunkFieldDropdown, setToggleShowSplunkFieldDropdown] = useState(true);

    useEffect(() => {
        if (splunkEvent?.splunkFieldName && toggleShowSplunkFieldDropdown) {
            setValue(fieldIndicatorValue, splunkEvent[splunkFieldName], {shouldValidate: true});
        }
    }, [fieldIndicatorValue, setValue, splunkEvent, splunkFieldName, toggleShowSplunkFieldDropdown]);

    return <StyledSection key={field.id}>
        <HorizontalLayout>
            <StyledHeading level={2}>New Indicator {`#${indexStartingAtOne}`}</StyledHeading>
            <DeleteButton inline label="Remove" onClick={() => removeSelf()}/>
        </HorizontalLayout>
        {submissionErrors && <Message appearance="fill" type="error">
            {submissionErrors.map(error => <P>{error}</P>)}
        </Message>}
        {splunkEvent &&
            <CustomControlGroup label="Use Splunk Field?">
                <Switch
                    key="toggleShowSplunkFieldDropdown"
                    onClick={() => setToggleShowSplunkFieldDropdown(!toggleShowSplunkFieldDropdown)}
                    selected={toggleShowSplunkFieldDropdown}
                    appearance="toggle"
                />
            </CustomControlGroup>
        }
        {splunkEvent && toggleShowSplunkFieldDropdown &&
            <SplunkFieldNameDropdown fieldName={fieldSplunkFieldName} options={splunkFieldDropdownOptions}/>
        }
        {
            (!splunkEvent || !toggleShowSplunkFieldDropdown) && <IndicatorValueField fieldName={fieldIndicatorValue}/>
        }
        <IndicatorCategoryField options={indicatorCategories} fieldName={fieldIndicatorCategory}/>
        <PatternSuggester indicatorCategory={indicatorCategory} indicatorValue={indicatorValue}
                          stixPatternFieldName={fieldStixPattern}/>
        <IndicatorNameField fieldName={fieldIndicatorName}/>
        <IndicatorDescriptionField fieldName={fieldIndicatorDescription}/>
        <Divider/>
    </StyledSection>
}

IndicatorSubForm.propTypes = {
    field: PropTypes.object,
    index: PropTypes.number,
    splunkEvent: PropTypes.object,
    indicatorCategories: PropTypes.array,
    removeSelf: PropTypes.func,
    submissionErrors: PropTypes.array
}
