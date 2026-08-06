import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import CreatedByRef from '@splunk/my-page/src/controls/CreatedByRefFormControl';
import { shouldUseDebugMode } from '@splunk/my-page/src/queryParams';
import { errorToText, postSubmitStixIndicatorsToImport } from '@splunk/my-page/src/ApiClient';
import Message from '@splunk/react-ui/Message';
import P from '@splunk/react-ui/Paragraph';
import Modal from '@splunk/react-ui/Modal';
import { viewGrouping } from '@splunk/my-page/src/urls';
import { StyledButton } from '@splunk/my-page/src/StyledButton';
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
import { GenericSubmitSection } from './GenericSubmitSection';


const MyForm = styled.form`
    max-width: 1200px;
`

export function IndicatorsSubmissionForm({ filename, indicators, numExistingIndicators }) {
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

    const [submitting, setSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [newGroupingId, setNewGroupingId] = useState(null);
    const onSubmit = async (data) => {
        console.log('Form submitted with data:', data);
        setSubmitting(true);
        setSubmissionError(null);
        setSubmitSuccess(false);
        await postSubmitStixIndicatorsToImport({indicators, newGrouping: data, overwriteExisting: true, successHandler: (resp) => {
                console.log(resp);
                setSubmitting(false);
                setSubmitSuccess(true);
                setNewGroupingId(resp?.new_grouping?.grouping_id);
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
            <GenericSubmitSection numExistingRecords={numExistingIndicators}
                           numNewRecords={numNewIndicators}
                           submitting={submitting} />
            {submissionError && <Message type='error' appearance='fill'>ERROR: {String(submissionError)}</Message>}
            <Modal open={submitSuccess}>
                <Modal.Header
                    title='Successfully Imported Indicators And Created New Grouping'
                />
                <Modal.Body>
                    <StyledButton to={viewGrouping(newGroupingId)} label='View New Grouping'/>
                </Modal.Body>
            </Modal>

        </MyForm>
    </FormProvider>;
}

IndicatorsSubmissionForm.propTypes = {
    filename: PropTypes.string.isRequired,
    indicators: PropTypes.array.isRequired,
    numExistingIndicators: PropTypes.number.isRequired,
}
