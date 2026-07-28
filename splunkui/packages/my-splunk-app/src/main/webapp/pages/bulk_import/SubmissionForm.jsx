import React, { useEffect, useState } from 'react';
import Checkbox from '@splunk/react-ui/Checkbox';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import CreatedByRef from '@splunk/my-page/src/controls/CreatedByRefFormControl';
import { shouldUseDebugMode } from '@splunk/my-page/src/queryParams';
import { errorToText, postSubmitStixIndicatorsToImport } from '@splunk/my-page/src/ApiClient';
import Message from '@splunk/react-ui/Message';
import SubmitButton from '@splunk/my-page/src/SubmitButton';
import P from '@splunk/react-ui/Paragraph';
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

function SubmitSection({numExistingIndicators, numNewIndicators, submitting = false}){
    const [checked, setChecked] = useState(false);
    const checkboxOnChange = (e, { checked: newChecked }) => {
        setChecked(newChecked);
    };
    if (numExistingIndicators === 0) {
        return <CustomControlGroup>
            <SubmitButton submitting={submitting} appearance='primary' label={`Import ${numNewIndicators} indicators`} />
        </CustomControlGroup>;
    }
    const disabledDueToUnchecked = (numExistingIndicators > 0 && !checked);
    const buttonLabel = `Import ${numNewIndicators + numExistingIndicators} indicators (${numExistingIndicators} existing will be overwritten)`;
    return (<CustomControlGroup>
        <Checkbox checked={checked} onChange={checkboxOnChange}>I understand that some existing indicators will be
            overwritten.</Checkbox>
        <SubmitButton submitting={submitting} appearance="destructive" label={buttonLabel} disabled={disabledDueToUnchecked} />
    </CustomControlGroup>);
}
SubmitSection.propTypes = {
    numExistingIndicators: PropTypes.number.isRequired,
    numNewIndicators: PropTypes.number.isRequired,
    submitting: PropTypes.bool.isRequired,
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

    useEffect(() => {
        setValue(FORM_FIELD_NAME, `Indicators imported from ${filename}`, {shouldValidate : true})
        setValue(FORM_FIELD_DESCRIPTION, `Indicators imported from ${filename}`, {shouldValidate : true})
        setValue(FORM_FIELD_CONTEXT, 'unspecified', {shouldValidate: true})
        setValue(FORM_FIELD_TLP_V2_RATING, 'TLP:GREEN', {shouldValidate: true})
    }, [filename, setValue]);

    // TODO: Show a modal upon success with button to navigate to the new grouping
    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const onSubmit = async (data) => {
        console.log('Form submitted with data:', data);
        setSubmitting(true);
        setSubmissionError(null);
        await postSubmitStixIndicatorsToImport({indicators, newGrouping: data, overwriteExisting: true, successHandler: (resp) => {
                console.log(resp);
                setSubmitting(false);
            }, errorHandler: async (err) => {
                console.error(err);
                setSubmissionError(await errorToText(err));
                setSubmitting(false);
            }})
    }
    const formData = watch();

    return <FormProvider {...formMethods}>
        <MyForm onSubmit={handleSubmit(onSubmit)}>
            <section>
                <PageHeadingContainer>
                    <PageHeading level={2}>New Grouping to add Indicators to</PageHeading>
                </PageHeadingContainer>
                <CustomControlGroup>
                    <P>A new grouping will be created to which the imported indicators will be added. Please fill out the grouping details below.</P>
                </CustomControlGroup>
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
                           submitting={submitting} />
            {submissionError && <Message type='error' appearance='fill'>ERROR: {String(submissionError)}</Message>}

        </MyForm>
    </FormProvider>;
}

SubmissionForm.propTypes = {
    filename: PropTypes.string.isRequired,
    indicators: PropTypes.array.isRequired,
    numExistingIndicators: PropTypes.number.isRequired,
}
