import styled from "styled-components";
import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import {useFormInputProps} from "./formInputProps";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {getIdentity, postCreateIdentity, postEditIdentity} from "@splunk/my-react-component/src/ApiClient";
import Message from "@splunk/react-ui/Message";
import Modal from "@splunk/react-ui/Modal";
import Button from "@splunk/react-ui/Button";
import {VIEW_IDENTITIES_PAGE} from "@splunk/my-react-component/src/urls";
import CollapsiblePanel from "@splunk/react-ui/CollapsiblePanel";
import {useOnFormSubmit} from "./formSubmit";
import {variables} from "@splunk/themes";
import Heading from "@splunk/react-ui/Heading";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import P from "@splunk/react-ui/Paragraph";

const MyForm = styled.form`
    margin-top: ${variables.spacingMedium};
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

function LoadingForEditMode() {
    return (<Heading>Loading...<WaitSpinner size="large"/></Heading>);

}

export function Form({existingIdentity}) {
    const title = existingIdentity ? "Editing Identity" : "Create New Identity";
    const submissionSuccessModalTitle = existingIdentity ? "Successfully Edited Identity" : "Successfully Created New Identity";
    const methods = useForm({
        mode: 'all',
    });
    const {register, setValue, handleSubmit, formState, getValues} = methods;

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

    const postEndpointFunction = existingIdentity ? postEditIdentity : postCreateIdentity;
    const {submitSuccess, submissionError, onSubmit, submitButtonDisabled} = useOnFormSubmit({
        formMethods: methods,
        submitToPostEndpoint: postEndpointFunction,
        submissionSuccessCallback: (resp) => console.log(resp),
        submissionErrorCallback: (error) => {
            console.error(error)
        },
    })
    useEffect(() => {
        console.log(getValues());
    }, [formState]);

    return (
        <MyForm onSubmit={handleSubmit(onSubmit)}>
            <Heading>{title}</Heading>
            <section>
                {submissionError && <Message appearance="fill" type="error">
                    {submissionError?.json?.error && <code>{submissionError.json.error}</code>}
                    {submissionError?.error && <code>{submissionError.error.toString()}</code>}
                </Message>}
                {existingIdentity && <TextControlGroup disabled
                                                       label="Identity ID" {...useFormInputProps(methods, FORM_FIELD_IDENTITY_ID)}/>}
                <TextControlGroup label="Name" {...useFormInputProps(methods, FORM_FIELD_NAME)}/>
                <SelectControlGroup label="Identity Class" {...useFormInputProps(methods, FORM_FIELD_IDENTITY_CLASS)}
                                    options={IDENTITY_CLASSES}/>
                <SubmitButton disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                              label={existingIdentity ? "Edit Identity" : "Create Identity"}/>
            </section>
            <Modal open={submitSuccess}>
                <Modal.Header
                    title={submissionSuccessModalTitle}
                />
                <Modal.Body>
                    <GotoIdentitiesPageButton/>
                </Modal.Body>
            </Modal>
            <CollapsiblePanel title="Debug info">
                <div style={{color: 'red'}}>
                    <code>
                        {JSON.stringify(formState.errors)}
                    </code>
                </div>
            </CollapsiblePanel>
        </MyForm>
    )
}
const MessageContent = styled.div`
    flex-direction: column;
    display: flex;
`;

// TODO: extract this to a common component which loads a single record in preparation for editing
export default function IdentityForm({editMode, identityId}) {
    const [identity, setIdentity] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editMode && identityId) {
            getIdentity(identityId, (resp) => {
                console.log("Existing identity:", resp);
                setIdentity(resp);
                setLoading(false);
            }, (error) => {
                console.error(error);
                if(error instanceof Error) {
                    setError(error.toString());
                }else{
                    setError(JSON.stringify(error));
                }
            });
        }
    }, [identityId, editMode]);
    return (
        <>
            {error && <Message appearance="fill" type="error">
                <MessageContent>
                    <div>
                        <Message.Title><strong>Something went wrong</strong></Message.Title>
                    </div>
                    <div>
                        <P>{error}</P>
                    </div>
                </MessageContent>
            </Message>}
                {!error &&
                <>
                    {editMode && loading && <LoadingForEditMode/>}
                    {editMode && !loading && <Form existingIdentity={identity}/>}
                    {!editMode && <Form/>}
                </>
            }
        </>
    );
}
