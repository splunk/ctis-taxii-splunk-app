import React, { useEffect, useState } from 'react';
import Button from '@splunk/react-ui/Button';
import Checkbox from '@splunk/react-ui/Checkbox';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import CreatedByRef from '@splunk/my-page/src/controls/CreatedByRefFormControl';
import { shouldUseDebugMode } from '@splunk/my-page/src/queryParams';
import { postSubmitStixIndicatorsToImport } from '@splunk/my-page/src/ApiClient';
import registerGroupingFields from '../../common/grouping_form/formRegistration';
import { ContextField, DescriptionField, NameField } from '../../common/grouping_form/fields';
import {
    FORM_FIELD_CONTEXT,
    FORM_FIELD_CREATED_BY_REF,
    FORM_FIELD_DESCRIPTION,
    FORM_FIELD_NAME
} from '../../common/grouping_form/const';
import { FORM_FIELD_TLP_V2_RATING, TLPv2RatingField } from '../../common/tlp';
import { ConfidenceField, FIELD_CONFIDENCE } from '../../common/confidence';

function SubmitSection({numExistingIndicators, numNewIndicators, disabled = false}){
    const [checked, setChecked] = useState(false);
    const checkboxOnChange = (e, { checked: newChecked }) => {
        setChecked(newChecked);
    };
    if (numExistingIndicators === 0) {
        return <CustomControlGroup>
            <Button appearance="primary" label={`Save ${numNewIndicators} new indicators`} disabled={disabled && 'disabled'} type='submit' />
        </CustomControlGroup>;
    }
    const disabledDueToUnchecked = (numExistingIndicators > 0 && !checked);
    const buttonLabel = `Save ${numNewIndicators} new indicators and overwrite ${numExistingIndicators} existing indicators`;
    return (<CustomControlGroup>
        <Checkbox checked={checked} onChange={checkboxOnChange}>I understand that some existing indicators will be
            overwritten.</Checkbox>
        <Button appearance="destructive" label={buttonLabel} disabled={(disabled || disabledDueToUnchecked) && 'disabled'} type='submit' />
    </CustomControlGroup>);
}
SubmitSection.propTypes = {
    numExistingIndicators: PropTypes.number.isRequired,
    numNewIndicators: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
}
const MyForm = styled.form`
    max-width: 1200px;
`


export function SubmissionForm({ filename, indicators, numExistingIndicators }) {
    const numNewIndicators = indicators.length - numExistingIndicators;
    const formMethods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_CONFIDENCE]: 100
        }
    })
    const debugFlag = shouldUseDebugMode();

    const {watch, register, setValue, handleSubmit, formState} = formMethods;
    registerGroupingFields(register);
    const submitDisabled = false; // placeholder

    useEffect(() => {
        setValue(FORM_FIELD_NAME, `Indicators imported from ${filename}`, {shouldValidate : true})
        setValue(FORM_FIELD_DESCRIPTION, `Indicators imported from ${filename}`, {shouldValidate : true})
        setValue(FORM_FIELD_CONTEXT, 'unspecified', {shouldValidate: true})
        setValue(FORM_FIELD_TLP_V2_RATING, 'TLP:GREEN', {shouldValidate: true})
    }, [filename, setValue]);

    // TODO: Handle waiting for POST response including loading state and error handling
    // TODO: Show a modal upon success with button to navigate to the new grouping
    const onSubmit = async (data) => {
        console.log('Form submitted with data:', data);
        await postSubmitStixIndicatorsToImport({indicators, newGrouping: data, overwriteExisting: true, successHandler: (resp) => {
                console.log(resp);
            }, errorHandler: (err) => {
                console.error(err);
            }})
    }
    const formData = watch();

    return <FormProvider {...formMethods}>
        <MyForm onSubmit={handleSubmit(onSubmit)}>
            <section>
                <PageHeadingContainer>
                    <PageHeading level={2}>New grouping to add indicators to</PageHeading>
                </PageHeadingContainer>
                <CreatedByRef fieldName={FORM_FIELD_CREATED_BY_REF} />
                <NameField fieldName={FORM_FIELD_NAME} />
                <DescriptionField fieldName={FORM_FIELD_DESCRIPTION} />
                <ContextField fieldName={FORM_FIELD_CONTEXT} />
                <TLPv2RatingField fieldName={FORM_FIELD_TLP_V2_RATING} />
                <ConfidenceField fieldName={FIELD_CONFIDENCE} />
            </section>
            {debugFlag && (
                <section>
                    <div><code>{JSON.stringify(formData)}</code></div>
                    <div><code>{JSON.stringify(formState.errors)}</code></div>
                </section>
            )}
            <SubmitSection numExistingIndicators={numExistingIndicators}
                           numNewIndicators={numNewIndicators}
                           disabled={submitDisabled} />

        </MyForm>
    </FormProvider>;
}

SubmissionForm.propTypes = {
    filename: PropTypes.string.isRequired,
    indicators: PropTypes.array.isRequired,
    numExistingIndicators: PropTypes.number.isRequired,
}
