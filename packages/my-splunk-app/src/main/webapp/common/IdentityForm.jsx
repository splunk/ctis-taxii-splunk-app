import styled from "styled-components";
import React, {useEffect} from "react";
import {FormProvider, useForm} from "react-hook-form";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {editIdentity, getIdentity, postCreateIdentity, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import Message from "@splunk/react-ui/Message";
import Modal from "@splunk/react-ui/Modal";
import Button from "@splunk/react-ui/Button";
import {VIEW_IDENTITIES_PAGE} from "@splunk/my-react-component/src/urls";
import Loader from "@splunk/my-react-component/src/Loader";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-react-component/PageHeading";
import {IdentityClassField, IdentityIdField, NameField} from "./identity_form/fields";
import {useOnFormSubmit} from "./formSubmit";
import {usePageTitle} from "./utils";

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

export function Form({existingIdentity}) {
    const title = existingIdentity ? "Edit Identity" : "Create New Identity";
    usePageTitle(title);

    const submissionSuccessModalTitle = existingIdentity ? "Successfully Edited Identity" : "Successfully Created New Identity";
    const methods = useForm({
        mode: 'all',
    });
    const {register, setValue, handleSubmit, formState} = methods;

    register(FORM_FIELD_NAME, {required: "Name is required.", value: ""});
    register(FORM_FIELD_IDENTITY_CLASS, {required: "Identity Class is required.", value: ""});
    if (existingIdentity) {
        register(FORM_FIELD_IDENTITY_ID, {required: "Identity ID is required.", value: ""});
    }

    useEffect(() => {
        if (existingIdentity) {
            setValue(FORM_FIELD_IDENTITY_ID, existingIdentity.identity_id);
            setValue(FORM_FIELD_IDENTITY_CLASS, existingIdentity.identity_class);
            setValue(FORM_FIELD_NAME, existingIdentity.name);
        }
    }, [existingIdentity, setValue]);

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
                    <PageHeading>{title}</PageHeading>
                </PageHeadingContainer>
                <section>
                    {submissionError && <Message appearance="fill" type="error">
                        {submissionError?.json?.error && <code>{submissionError.json.error}</code>}
                        {submissionError?.error && <code>{submissionError.error.toString()}</code>}
                    </Message>}
                    {existingIdentity && <IdentityIdField disabled fieldName={FORM_FIELD_IDENTITY_ID}/>}
                    <NameField fieldName={FORM_FIELD_NAME}/>
                    <IdentityClassField fieldName={FORM_FIELD_IDENTITY_CLASS} options={IDENTITY_CLASSES}/>
                    <CustomControlGroup>
                        <HorizontalButtonLayout>
                            <SubmitButton inline disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                                          label={existingIdentity ? "Edit Identity" : "Create Identity"}/>
                        </HorizontalButtonLayout>
                    </CustomControlGroup>
                </section>
                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={submissionSuccessModalTitle}
                    />
                    <Modal.Body>
                        <GotoIdentitiesPageButton/>
                    </Modal.Body>
                </Modal>
            </MyForm>
        </FormProvider>
    )
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
