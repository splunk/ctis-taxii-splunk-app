import styled from "styled-components";
import React, {useState, useMemo} from "react";
import {useForm} from "react-hook-form";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import {useFormInputProps} from "../../common/formInputProps";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {postCreateIdentity} from "@splunk/my-react-component/src/ApiClient";
import Message from "@splunk/react-ui/Message";
import Modal from "@splunk/react-ui/Modal";
import P from "@splunk/react-ui/Paragraph";
import Button from "@splunk/react-ui/Button";
import {VIEW_IDENTITIES_PAGE} from "@splunk/my-react-component/src/urls";
import CollapsiblePanel from "@splunk/react-ui/CollapsiblePanel";

const MyForm = styled.form`
    max-width: 500px;
`

const FORM_FIELD_NAME = "name";
const FORM_FIELD_IDENTITY_CLASS = "identity_class";

const IDENTITY_CLASSES = [
    {label: 'Individual', value: 'individual'},
    {label: 'Organization', value: 'organization'},
    {label: 'Group', value: 'group'},
    {label: 'Class', value: 'class'},
    {label: 'Unknown', value: 'unknown'},
    {label: 'Trigger error', value: 'this should be invalid'},
];

function GotoIdentitiesPageButton() {
    return (<Button to={VIEW_IDENTITIES_PAGE} appearance="primary" label="Go to Identities"/>);
}

export function NewIdentityForm() {
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FORM_FIELD_IDENTITY_CLASS]: '',
            [FORM_FIELD_NAME]: '',
        }
    });
    const {watch, register, trigger, handleSubmit, formState, control, setError} = methods;

    register(FORM_FIELD_NAME, {required: "Name is required."});
    register(FORM_FIELD_IDENTITY_CLASS, {required: "Identity Class is required."});

    const [submissionError, setSubmissionError] = useState(null);
    const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || isSubmitSuccessful,
        [formState, isSubmitSuccessful]);
    const onSubmit = async (data) => {
        console.log(data);
        const formIsValid = await trigger();
        if(formIsValid){
            console.log("Form is valid");
            await postCreateIdentity(data, (resp) => {
                console.log(resp);
                setIsSubmitSuccessful(true);
            }, (error) => {
                console.error("Error creating identity", error);
                setSubmissionError(error);
                setError("root.server", {message: `Server error: ${error}`});
            });
        }
    }
    return (
        <MyForm onSubmit={handleSubmit(onSubmit)}>
            <section>
                {submissionError && <Message appearance="fill" type="error">
                    {JSON.stringify(submissionError)}
                </Message>}
                <TextControlGroup label="Name" {...useFormInputProps(methods, FORM_FIELD_NAME)}/>
                <SelectControlGroup label="Identity Class" {...useFormInputProps(methods, FORM_FIELD_IDENTITY_CLASS)}
                options={IDENTITY_CLASSES}/>
                <SubmitButton disabled={submitButtonDisabled} submitting={formState.isSubmitting} label="Create Identity"/>
            </section>
            <Modal open={isSubmitSuccessful}>
                <Modal.Header
                    title={"Successfully Created New Identity"}
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
