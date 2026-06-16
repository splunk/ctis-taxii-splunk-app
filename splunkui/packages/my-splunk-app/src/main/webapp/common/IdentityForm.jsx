import styled from "styled-components";
import React, {useEffect, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import SubmitButton from "@splunk/my-page/src/SubmitButton";
import {editIdentity, getIdentity, postCreateIdentity, useGetRecord} from "@splunk/my-page/src/ApiClient";
import Message from "@splunk/react-ui/Message";
import Modal from "@splunk/react-ui/Modal";
import Button from "@splunk/react-ui/Button";
import {VIEW_IDENTITIES_PAGE} from "@splunk/my-page/src/urls";
import Loader from "@splunk/my-page/src/Loader";
import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import Switch from '@splunk/react-ui/Switch';
import {IdentityClassField, IdentityIdField, NameField} from "./identity_form/fields";
import {useOnFormSubmit} from "./formSubmit";
import {usePageTitle} from "./utils";

import {FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION, TLPv2RatingField} from "./tlp";
import {ConfidenceField, FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION} from "./confidence";

const MyForm = styled.form`
    max-width: 600px;
`

const FORM_FIELD_NAME = "name";
const FORM_FIELD_IDENTITY_CLASS = "identity_class";

// For edit mode
const FORM_FIELD_IDENTITY_ID = "identity_id";

const IDENTITY_CLASSES = [
    {label: 'Individual', value: 'individual'},
    {label: 'Organization', value: 'organization'},
    {label: 'Group', value: 'group'},
    {label: 'Class', value: 'class'},
    {label: 'Unknown', value: 'unknown'},
];

function GotoIdentitiesPageButton() {
    return (<Button to={VIEW_IDENTITIES_PAGE} appearance="primary" label="Go to Identities"/>);
}

function RenderIdentityIdField({ hasExistingIdentity, shouldAutogenerateId }) {
    if (hasExistingIdentity) {
        return <IdentityIdField disabled fieldName={FORM_FIELD_IDENTITY_ID} />;
    }
    if (!shouldAutogenerateId) {
        return <IdentityIdField fieldName={FORM_FIELD_IDENTITY_ID} />;
    }
    return null;
}

RenderIdentityIdField.propTypes = {
    hasExistingIdentity: PropTypes.bool,
    shouldAutogenerateId: PropTypes.bool,
}

function validateIdentityId(value){
    if(!String(value).startsWith("identity--")){
        return "Should start with 'identity--'";
    }
    const regex = /^identity--[a-f0-9-]{36}$/;
    if(!regex.test(value)){
        return "Should be in format of 'identity--{UUIDv4}'. Lowercase only.";
    }
    return null;
}

function SwitchForShouldAutogenerateId({autogenerateId, setAutogenerateId}){
    return (
        <CustomControlGroup>
            <Switch
                appearance="toggle"
                selected={autogenerateId}
                onClick={() => setAutogenerateId(!autogenerateId)}
            >
                Auto-generate ID
            </Switch>
        </CustomControlGroup>
    );
}
SwitchForShouldAutogenerateId.propTypes = {
    autogenerateId: PropTypes.string,
    setAutogenerateId: PropTypes.func,
}

export function Form({existingIdentity}) {
    const title = existingIdentity ? "Edit Identity" : "Create New Identity";
    usePageTitle(title);

    const submissionSuccessModalTitle = existingIdentity ? "Successfully Edited Identity" : "Successfully Created New Identity";
    const [autogenerateId, setAutogenerateId] = useState(true);
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_CONFIDENCE]: 100,
        }
    });
    const {register, unregister, setValue, handleSubmit, formState} = methods;

    register(FORM_FIELD_NAME, {required: "Name is required.", value: ""});
    register(FORM_FIELD_IDENTITY_CLASS, {required: "Identity Class is required.", value: ""});
    register(FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION);
    register(FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION);

    if (existingIdentity) {
        register(FORM_FIELD_IDENTITY_ID, {required: "Identity ID is required.", value: ""});
    }

    useEffect(() => {
        if (existingIdentity) {
            setValue(FORM_FIELD_IDENTITY_ID, existingIdentity.identity_id);
            setValue(FORM_FIELD_IDENTITY_CLASS, existingIdentity.identity_class);
            setValue(FORM_FIELD_NAME, existingIdentity.name);
            setValue(FORM_FIELD_TLP_V2_RATING, existingIdentity.tlp_v2_rating);
            setValue(FIELD_CONFIDENCE, existingIdentity.confidence);
        }
    }, [existingIdentity, setValue]);

    useEffect(() => {
        if(!existingIdentity) {
            if (!autogenerateId) {
                register(FORM_FIELD_IDENTITY_ID, {
                    required: 'Identity ID is required.',
                    value: '',
                    validate: validateIdentityId,
                });
            } else {
                unregister(FORM_FIELD_IDENTITY_ID);
            }
        }
    }, [autogenerateId, existingIdentity, register, unregister]);

    const postEndpointFunction = existingIdentity ? editIdentity : postCreateIdentity;
    const {submitSuccess, submissionError, onSubmit, submitButtonDisabled} = useOnFormSubmit({
        formMethods: methods,
        submitToPostEndpoint: postEndpointFunction,
        submissionSuccessCallback: (resp) => console.log(resp),
        submissionErrorCallback: (error) => {
            console.error(error)
        },
    })

    return (
        <FormProvider {...methods}>
            <MyForm onSubmit={handleSubmit(onSubmit)}>
                <PageHeadingContainer>
                    <PageHeading level={2}>{title}</PageHeading>
                </PageHeadingContainer>
                <section>
                    {submissionError && (
                        <Message appearance="fill" type="error">
                            {submissionError?.json?.error && (
                                <code>{submissionError.json.error}</code>
                            )}
                            {submissionError?.error && (
                                <code>{submissionError.error.toString()}</code>
                            )}
                        </Message>
                    )}
                    {!existingIdentity && <SwitchForShouldAutogenerateId autogenerateId={autogenerateId} setAutogenerateId={setAutogenerateId}/>}
                    <RenderIdentityIdField
                        hasExistingIdentity={!!existingIdentity}
                        shouldAutogenerateId={autogenerateId}
                    />
                    <NameField fieldName={FORM_FIELD_NAME} />
                    <IdentityClassField
                        fieldName={FORM_FIELD_IDENTITY_CLASS}
                        options={IDENTITY_CLASSES}
                    />
                    <TLPv2RatingField fieldName={FORM_FIELD_TLP_V2_RATING} />
                    <ConfidenceField fieldName={FIELD_CONFIDENCE} />
                    <CustomControlGroup>
                        <HorizontalButtonLayout>
                            <SubmitButton
                                inline
                                disabled={submitButtonDisabled}
                                submitting={formState.isSubmitting}
                                label={existingIdentity ? 'Edit Identity' : 'Create Identity'}
                            />
                        </HorizontalButtonLayout>
                    </CustomControlGroup>
                </section>
                <Modal open={submitSuccess}>
                    <Modal.Header title={submissionSuccessModalTitle} />
                    <Modal.Body>
                        <GotoIdentitiesPageButton />
                    </Modal.Body>
                </Modal>
            </MyForm>
        </FormProvider>
    );
}

Form.propTypes = {
    existingIdentity: PropTypes.object,
}

function EditModeForm({identityId}) {
    const {record: identity, loading, error} = useGetRecord({
        restGetFunction: getIdentity,
        restFunctionQueryArgs: {identityId}
    });
    return (
        <Loader error={error} loading={loading}>
            <Form existingIdentity={identity}/>
        </Loader>
    );
}

EditModeForm.propTypes = {
    identityId: PropTypes.string.isRequired,
}

export default function IdentityForm({editMode, identityId}) {
    return editMode ? <EditModeForm identityId={identityId}/> : <Form/>;
}
IdentityForm.propTypes = {
    editMode: PropTypes.bool,
    identityId: PropTypes.string,
}
