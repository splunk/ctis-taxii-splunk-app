import {useFormContext} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {PatternSuggester} from "./patternSuggester";
import Heading from "@splunk/react-ui/Heading";
import Button from "@splunk/react-ui/Button";
import Divider from "@splunk/react-ui/Divider";
import styled from "styled-components";
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {variables} from '@splunk/themes';
import Switch from "@splunk/react-ui/Switch";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {
    IndicatorCategoryField,
    IndicatorDescriptionField,
    IndicatorNameField,
    IndicatorValueField,
    SplunkFieldNameDropdown
} from "../../common/indicator_form/formControls";
import {FIELD_INDICATOR_NAME, FIELD_INDICATOR_DESCRIPTION, FIELD_INDICATOR_CATEGORY, FIELD_INDICATOR_VALUE, FIELD_SPLUNK_FIELD_NAME, FIELD_STIX_PATTERN} from "../../common/indicator_form/fieldNames";

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

const StyledButton = styled(Button)`
    flex-grow: 0;
    width: 100px;
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

    const fieldSplunkFieldName = `indicators.${index}.${FIELD_SPLUNK_FIELD_NAME}`;
    const fieldIndicatorValue = `indicators.${index}.${FIELD_INDICATOR_VALUE}`;
    const fieldIndicatorCategory = `indicators.${index}.${FIELD_INDICATOR_CATEGORY}`;
    const fieldIndicatorName = `indicators.${index}.${FIELD_INDICATOR_NAME}`;
    const fieldIndicatorDescription = `indicators.${index}.${FIELD_INDICATOR_DESCRIPTION}`;
    const fieldStixPattern = `indicators.${index}.${FIELD_STIX_PATTERN}`;

    register(fieldSplunkFieldName);
    register(fieldIndicatorValue, {required: "Indicator Value is required."});
    register(fieldIndicatorCategory, {required: "Indicator Category is required."});
    register(fieldStixPattern, {required: "STIX Pattern is required."});
    register(fieldIndicatorName, {required: "Indicator Name is required."});
    register(fieldIndicatorDescription, {required: "Indicator Description is required."});

    const splunkFieldName = watch(fieldSplunkFieldName);
    const indicatorValue = watch(fieldIndicatorValue);
    const indicatorCategory = watch(fieldIndicatorCategory);

    useEffect(() => {
        if (splunkEvent?.hasOwnProperty(splunkFieldName)) {
            setValue(fieldIndicatorValue, splunkEvent[splunkFieldName], {shouldValidate: true});
        }
    }, [splunkFieldName]);
    const indexStartingAtOne = index + 1;
    const splunkFieldDropdownOptions = splunkFields.map(field => ({label: field, value: field}));
    const [toggleShowSplunkFieldDropdown, setToggleShowSplunkFieldDropdown] = useState(true);
    return <section key={field.id}>
        <HorizontalLayout>
            <StyledHeading level={2}>New Indicator {`#${indexStartingAtOne}`}</StyledHeading>
            <StyledButton inline icon={<TrashCanCross/>} label="Remove" appearance="destructive"
                          onClick={() => removeSelf()}/>
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
        <IndicatorValueField fieldName={fieldIndicatorValue}/>
        <IndicatorCategoryField options={indicatorCategories} fieldName={fieldIndicatorCategory}/>
        <PatternSuggester indicatorCategory={indicatorCategory} indicatorValue={indicatorValue}
                          stixPatternFieldName={fieldStixPattern}/>
        <IndicatorNameField fieldName={fieldIndicatorName}/>
        <IndicatorDescriptionField fieldName={fieldIndicatorDescription}/>
        <Divider/>
    </section>
}
