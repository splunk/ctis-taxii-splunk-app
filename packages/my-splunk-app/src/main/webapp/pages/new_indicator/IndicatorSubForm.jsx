import {useFormContext} from "react-hook-form";
import React, {useEffect, useState} from "react";
import {useDebounce} from "@splunk/my-react-component/src/debounce";
import {suggestPattern} from "./patternSuggester";
import Heading from "@splunk/react-ui/Heading";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import StixPatternControlGroup from "@splunk/my-react-component/src/StixPatternControlGroup";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";
import Button from "@splunk/react-ui/Button";
import Divider from "@splunk/react-ui/Divider";
import styled from "styled-components";
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {variables} from '@splunk/themes';
import Switch from "@splunk/react-ui/Switch";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {useFormInputProps} from "../../common/formInputProps";

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
    const formMethods = useFormContext();
    const {register, setValue, watch} = formMethods;
    const splunkFields = Object.keys(splunkEvent || {});

    const fieldSplunkFieldName = `indicators.${index}.splunk_field_name`;
    const fieldIndicatorValue = `indicators.${index}.indicator_value`;
    const fieldIndicatorCategory = `indicators.${index}.indicator_category`;
    const fieldIndicatorName = `indicators.${index}.name`;
    const fieldIndicatorDescription = `indicators.${index}.description`;
    const fieldStixPattern = `indicators.${index}.stix_pattern`;

    register(fieldSplunkFieldName);
    register(fieldIndicatorValue, {required: "Indicator Value is required."});
    register(fieldIndicatorCategory, {required: "Indicator Category is required."});
    register(fieldStixPattern, {required: "STIX Pattern is required."});
    register(fieldIndicatorName, {required: "Indicator Name is required."});
    register(fieldIndicatorDescription, {required: "Indicator Description is required."});

    const splunkFieldName = watch(fieldSplunkFieldName);
    const indicatorValue = watch(fieldIndicatorValue);
    const indicatorCategory = watch(fieldIndicatorCategory);
    const stixPattern = watch(fieldStixPattern);

    const [suggestedPattern, setSuggestedPattern] = useState(null);
    const debounceIndicatorValue = useDebounce(indicatorValue, 200);
    useEffect(() => {
        suggestPattern(indicatorCategory, indicatorValue, setSuggestedPattern);
    }, [indicatorCategory, debounceIndicatorValue]);

    useEffect(() => {
        if (suggestedPattern) {
            setValue(fieldStixPattern, suggestedPattern, {shouldValidate: true});
        }
    }, [suggestedPattern]);

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
            <SelectControlGroup label="Splunk Field Name" {...useFormInputProps(formMethods, fieldSplunkFieldName)}
                                options={splunkFieldDropdownOptions}/>
        }
        <TextControlGroup label="Indicator Value" {...useFormInputProps(formMethods, fieldIndicatorValue)} />
        <SelectControlGroup label="Indicator Category" {...useFormInputProps(formMethods, fieldIndicatorCategory)}
                            options={indicatorCategories}/>
        <StixPatternControlGroup label="STIX v2 Pattern" {...useFormInputProps(formMethods, fieldStixPattern)}
                                 useSuggestedPattern={() => setValue(fieldStixPattern, suggestedPattern, {shouldValidate: true})}
                                 suggestedPattern={suggestedPattern}/>
        <TextControlGroup label="Indicator Name" {...useFormInputProps(formMethods, fieldIndicatorName)} />
        <TextAreaControlGroup label="Description" {...useFormInputProps(formMethods, fieldIndicatorDescription)} />
        <Divider/>
    </section>
}
