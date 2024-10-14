import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useForm} from "react-hook-form"
import Heading from "@splunk/react-ui/Heading";
import {useDispatch, useSelector} from 'react-redux'
import PropTypes from "prop-types";

import DeleteButton from "@splunk/my-react-component/src/DeleteButton";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import Switch from "@splunk/react-ui/Switch";
import Divider from "@splunk/react-ui/Divider";
import styled from "styled-components";
import {variables} from "@splunk/themes";
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
import {useRespondToValidationSignal} from "./formUtils";
import {getValidationSignal, submitData, validationDone} from './Indicators.slice'
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
const FORM_FIELDS = [FIELD_SPLUNK_FIELD_NAME, FIELD_INDICATOR_VALUE, FIELD_INDICATOR_CATEGORY, FIELD_STIX_PATTERN, FIELD_INDICATOR_NAME, FIELD_INDICATOR_DESCRIPTION];

const IndicatorSubForm = ({
                              id,
                              index,
                              removeSelf,
                              removeSelfEnabled,
                              submissionErrors,
                              splunkEvent,
                              indicatorCategories
                          }) => {
    const formMethods = useForm({
        mode: 'all',
        defaultValues: useSelector(state => state.indicators.indicators[id]) || {}
    })
    const {register, handleSubmit, formState: {errors}, watch, trigger, setValue} = formMethods;

    FORM_FIELDS.forEach(fieldName => {
        register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]);
    });

    const splunkFields = Object.keys(splunkEvent || {});
    const dispatch = useDispatch();
    const validationSignal = useSelector(getValidationSignal);

    const splunkFieldName = watch(FIELD_SPLUNK_FIELD_NAME);
    const indicatorValue = watch(FIELD_INDICATOR_VALUE);
    const indicatorCategory = watch(FIELD_INDICATOR_CATEGORY);
    const stixPattern = watch(FIELD_STIX_PATTERN);
    const indicatorName = watch(FIELD_INDICATOR_NAME);
    const indicatorDescription = watch(FIELD_INDICATOR_DESCRIPTION);

    const formValues = useMemo(() => ({
        [FIELD_SPLUNK_FIELD_NAME]: splunkFieldName,
        [FIELD_INDICATOR_VALUE]: indicatorValue,
        [FIELD_INDICATOR_CATEGORY]: indicatorCategory,
        [FIELD_STIX_PATTERN]: stixPattern,
        [FIELD_INDICATOR_NAME]: indicatorName,
        [FIELD_INDICATOR_DESCRIPTION]: indicatorDescription
    }), [
        splunkFieldName,
        indicatorValue,
        indicatorCategory,
        stixPattern,
        indicatorName,
        indicatorDescription
    ]);

    const {suggestedPattern, error: patternApiError} = usePatternSuggester(indicatorCategory, indicatorValue);

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

    // When suggested pattern changes, update the STIX pattern field with new pattern
    useEffect(() => {
        if (suggestedPattern) {
            setValue(FIELD_STIX_PATTERN, suggestedPattern, {shouldValidate: true});
        }
    }, [setValue, suggestedPattern]);

    // Propagate form values to store
    useEffect(() => {
        dispatch(submitData({
            id,
            data: formValues
        }));
    }, [id, dispatch, formValues]);

    useRespondToValidationSignal({
        validationSignal,
        formErrors: errors,
        trigger,
        validationDoneActionCreator: ({...args}) => validationDone({...args, id})
    });
    const onSubmit = (data) => console.log(data);

    return (
        <StyledSection>
            <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <HorizontalLayout>
                        <StyledHeading level={2}>New Indicator {`#${index + 1}`}</StyledHeading>
                        <DeleteButton inline disabled={!removeSelfEnabled} label="Remove" onClick={() => removeSelf()}/>
                    </HorizontalLayout>
                    {submissionErrors?.length > 0 && <Message appearance="fill" type="error">
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
                        <SplunkFieldNameDropdown fieldName={FIELD_SPLUNK_FIELD_NAME}
                                                 options={splunkFieldDropdownOptions}/>
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
                </form>
            </FormProvider>
        </StyledSection>
    );
};

IndicatorSubForm.propTypes = {
    index: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    removeSelf: PropTypes.func,
    removeSelfEnabled: PropTypes.bool,
    submissionErrors: PropTypes.array,
    splunkEvent: PropTypes.object,
    indicatorCategories: PropTypes.array,
};

export default IndicatorSubForm;
