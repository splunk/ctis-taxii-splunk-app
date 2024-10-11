import {FormProvider, useForm} from "react-hook-form";
import React, {useCallback, useEffect, useState} from "react";
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
    SplunkFieldNameDropdown,
    StixPatternField
} from "../../common/indicator_form/formControls";
import {
    FIELD_INDICATOR_CATEGORY,
    FIELD_INDICATOR_DESCRIPTION,
    FIELD_INDICATOR_NAME,
    FIELD_INDICATOR_VALUE,
    FIELD_SPLUNK_FIELD_NAME,
    FIELD_STIX_PATTERN,
    REGISTER_FIELD_OPTIONS
} from "../../common/indicator_form/fieldNames";
import {usePatternSuggester} from "./patternSuggester";

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
                                     id,
                                     index,
                                     updateIndicator,
                                     splunkEvent,
                                     indicatorCategories,
                                     removeSelf,
                                     submissionErrors
                                 }) => {
    const formMethods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_SPLUNK_FIELD_NAME]: '',
            [FIELD_INDICATOR_VALUE]: '',
            [FIELD_INDICATOR_CATEGORY]: '',
            [FIELD_STIX_PATTERN]: '',
            [FIELD_INDICATOR_NAME]: '',
            [FIELD_INDICATOR_DESCRIPTION]: ''
        }
    });
    const {register, watch, setValue, getValues} = formMethods;
    const splunkFields = Object.keys(splunkEvent || {});

    [FIELD_SPLUNK_FIELD_NAME, FIELD_INDICATOR_VALUE, FIELD_INDICATOR_CATEGORY,
        FIELD_STIX_PATTERN, FIELD_INDICATOR_NAME, FIELD_INDICATOR_DESCRIPTION].forEach(fieldToRegister => {
        register(fieldToRegister, REGISTER_FIELD_OPTIONS[fieldToRegister]);
    });

    const splunkFieldName = watch(FIELD_SPLUNK_FIELD_NAME);
    const indicatorValue = watch(FIELD_INDICATOR_VALUE);
    const indicatorCategory = watch(FIELD_INDICATOR_CATEGORY);
    const stixPattern = watch(FIELD_STIX_PATTERN);
    const indicatorName = watch(FIELD_INDICATOR_NAME);
    const indicatorDescription = watch(FIELD_INDICATOR_DESCRIPTION);

    const {suggestedPattern, error: patternApiError} = usePatternSuggester(indicatorCategory, indicatorValue);

    const indexStartingAtOne = index + 1;
    const splunkFieldDropdownOptions = splunkFields.map(splunkField => ({
        label: `${splunkField} (${splunkEvent[splunkField]})`,
        value: splunkField
    }));
    const [toggleShowSplunkFieldDropdown, setToggleShowSplunkFieldDropdown] = useState(true);

    useEffect(() => {
        if (splunkEvent) {
            // https://stackoverflow.com/a/455340/23523267
            if (Object.prototype.hasOwnProperty.call(splunkEvent, splunkFieldName) && toggleShowSplunkFieldDropdown) {
                setValue(FIELD_INDICATOR_VALUE, splunkEvent[splunkFieldName], {shouldValidate: true});
            }
        }
    }, [setValue, splunkEvent, splunkFieldName, toggleShowSplunkFieldDropdown]);

    const updateIndicatorWithFormValues = useCallback(() => {
        console.log("Updating indicator with form values");
        updateIndicator(getValues());
    }, [updateIndicator, getValues]);

    // When suggested pattern changes, update the STIX pattern field with new pattern
    useEffect(() => {
        if (suggestedPattern) {
            setValue(FIELD_STIX_PATTERN, suggestedPattern, {shouldValidate: true});
        }
    }, [setValue, suggestedPattern]);

    useEffect(() => {
        updateIndicatorWithFormValues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [splunkFieldName, indicatorValue, indicatorCategory, stixPattern, indicatorName, indicatorDescription]);

    return <StyledSection key={id}>
        <FormProvider {...formMethods}>
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
                <SplunkFieldNameDropdown fieldName={FIELD_SPLUNK_FIELD_NAME} options={splunkFieldDropdownOptions}/>
            }
            {
                (!splunkEvent || !toggleShowSplunkFieldDropdown) &&
                <IndicatorValueField fieldName={FIELD_INDICATOR_VALUE}/>
            }
            <IndicatorCategoryField options={indicatorCategories} fieldName={FIELD_INDICATOR_CATEGORY}/>
            <StixPatternField suggestedPattern={suggestedPattern} fieldName={FIELD_STIX_PATTERN}
                              patternApiError={patternApiError}/>
            <IndicatorNameField fieldName={FIELD_INDICATOR_NAME}/>
            <IndicatorDescriptionField fieldName={FIELD_INDICATOR_DESCRIPTION}/>
            <Divider/>
        </FormProvider>
    </StyledSection>
}

IndicatorSubForm.propTypes = {
    id: PropTypes.string,
    index: PropTypes.number,
    updateIndicator: PropTypes.func,
    splunkEvent: PropTypes.object,
    indicatorCategories: PropTypes.array,
    removeSelf: PropTypes.func,
    submissionErrors: PropTypes.array
}
