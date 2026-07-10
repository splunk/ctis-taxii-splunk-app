import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loader from '@splunk/my-page/src/Loader';
import {
    getSighting,
    postCreateSighting,
    editSighting,
    useGetRecord,
} from '@splunk/my-page/src/ApiClient';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { shouldUseDebugMode } from '@splunk/my-page/src/queryParams';
import SubmitButton from '@splunk/my-page/src/SubmitButton';
import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import Button from '@splunk/react-ui/Button';
import { viewSighting } from '@splunk/my-page/src/urls';
import { usePageTitle } from '../../common/utils';
import { ConfidenceField, FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION } from '../../common/confidence';
import { DescriptionField, FirstSeen, LastSeen, SightingOfRef } from './formControls';
import { useOnFormSubmit } from '../../common/formSubmit';

const FORM_FIELD_SIGHTING_ID = 'sighting_id';
const FORM_FIELD_SIGHTING_OF_REF = 'sighting_of_ref';
const FORM_FIELD_DESCRIPTION = 'description';
const FORM_FIELD_FIRST_SEEN = 'first_seen';
const FORM_FIELD_LAST_SEEN = 'last_seen';


const MyForm = styled.form`
    max-width: 800px;
`;

function useExistingSighting(sightingId) {
    const { record: sighting, loading, error } = useGetRecord(
        {
            restGetFunction: getSighting,
            restFunctionQueryArgs: { sightingId }
        }
    );
    return { sighting, loading, error };
}

export function Form({ existingSighting = null }) {
    // Pass in an existingSighting object to use edit mode.
    // Otherwise, assumed to be in create-new mode.
    const editMode = existingSighting !== null;
    const pageTitle = editMode ? `Edit Sighting ${existingSighting.sighting_id}` : 'New Sighting';
    usePageTitle(pageTitle);

    const formMethods = useForm({
        mode: 'all', defaultValues: {
            [FIELD_CONFIDENCE]: 100

        }
    });
    const { handleSubmit, register, setValue, watch, formState, trigger } = formMethods;

    const validateFirstSeenIsBeforeLastSeen = (val, fullFormValues) => {
        if(fullFormValues.first_seen !== undefined && fullFormValues.last_seen !== undefined && fullFormValues.last_seen < fullFormValues.first_seen) {
            return 'first_seen must be before last_seen'
        }
        return null;
    }
    register(FORM_FIELD_SIGHTING_OF_REF, { required: 'sighting_of_ref is required', value: null });
    register(FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION);
    register(FORM_FIELD_DESCRIPTION, { required: false });
    register(FORM_FIELD_FIRST_SEEN, { required: false, validate: validateFirstSeenIsBeforeLastSeen });
    register(FORM_FIELD_LAST_SEEN, { required: false, validate: validateFirstSeenIsBeforeLastSeen});

    useEffect(() => {
        if (existingSighting !== null) {
            register(FORM_FIELD_SIGHTING_ID, {
                required: 'sighting_id is required',
                value: existingSighting.sighting_id
            });
            setValue(FORM_FIELD_SIGHTING_OF_REF, existingSighting.sighting_of_ref);
            setValue(FIELD_CONFIDENCE, existingSighting.confidence);
            setValue(FORM_FIELD_DESCRIPTION, existingSighting.description)
        }
    }, [existingSighting, register, setValue]);

    const isDebugMode = shouldUseDebugMode();
    const formValues = watch();

    const [firstSeen, lastSeen] = watch([FORM_FIELD_FIRST_SEEN, FORM_FIELD_LAST_SEEN]);
    useEffect(() => {
        trigger([FORM_FIELD_FIRST_SEEN, FORM_FIELD_LAST_SEEN]);
    }, [firstSeen, lastSeen, trigger]);

    useEffect(() => {
        // Handle when datetime input is cleared, which sets the value to a blank string
        if (firstSeen === '') {
            setValue(FORM_FIELD_FIRST_SEEN, undefined, { shouldValidate: true });
        }
        if (lastSeen === '') {
            setValue(FORM_FIELD_LAST_SEEN, undefined, { shouldValidate: true });
        }
    }, [firstSeen, lastSeen, setValue]);

    const [respSightingId, setRespSightingId] = useState(null);
    const {submitSuccess, submissionError, onSubmit, submitButtonDisabled} = useOnFormSubmit({
        formMethods,
        submitToPostEndpoint: editMode ? editSighting : postCreateSighting,
        submissionSuccessCallback: (resp) => {
            setRespSightingId(resp?.sighting_id);
            console.log(resp);
        },
        submissionErrorCallback: (error) => {
            console.error(error)
        },
    })
    const successModalTitle = editMode ? 'Updated Sighting' : 'Created Sighting';

    return (<FormProvider {...formMethods}>
        <MyForm onSubmit={handleSubmit(onSubmit)}>
            <SightingOfRef fieldName={FORM_FIELD_SIGHTING_OF_REF}/>
            <ConfidenceField fieldName={FIELD_CONFIDENCE}/>
            <DescriptionField fieldName={FORM_FIELD_DESCRIPTION}/>
            <FirstSeen fieldName={FORM_FIELD_FIRST_SEEN}/>
            <LastSeen fieldName={FORM_FIELD_LAST_SEEN}/>
            <CustomControlGroup>
                <SubmitButton inline submitting={formState.isSubmitting} label='Submit' disabled={submitButtonDisabled}/>
            </CustomControlGroup>
            {submissionError && <Message type='error'>Error: {JSON.stringify(submissionError)}</Message>}
        </MyForm>
        <Modal open={submitSuccess}>
            <Modal.Header title={successModalTitle} />
            <Modal.Body>
                <Button to={viewSighting(respSightingId)} appearance='primary' label='Go to Sighting'/>
            </Modal.Body>
        </Modal>
        {isDebugMode && <div>
            <div><code>{JSON.stringify(formValues)}</code></div>
            <div><code>{JSON.stringify(formState)}</code></div>
            <div><code>{JSON.stringify(formState.errors)}</code></div>
            <div>Submit success: {JSON.stringify(submitSuccess)}</div>
        </div>}
    </FormProvider>);
}

Form.propTypes = {
    existingSighting: PropTypes.object
};

export function EditSightingForm({ existingSightingId = null }) {
    const { sighting, loading, error } = useExistingSighting(existingSightingId);
    return (<Loader loading={loading} error={error}>
        {sighting && <Form existingSighting={sighting} />}
    </Loader>);
}

EditSightingForm.propTypes = {
    existingSightingId: PropTypes.string
};
