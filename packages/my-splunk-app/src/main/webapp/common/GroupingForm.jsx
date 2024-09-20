import styled from "styled-components";
import React, {useEffect, useMemo, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import TextControlGroup from "@splunk/my-react-component/src/TextControlGroup";
import {useFormInputProps} from "./formInputProps";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {
    editGrouping,
    getGrouping,
    getIdentities,
    postCreateGrouping,
    useGetRecord
} from "@splunk/my-react-component/src/ApiClient";
import Message from "@splunk/react-ui/Message";
import Modal from "@splunk/react-ui/Modal";
import Button from "@splunk/react-ui/Button";
import {VIEW_GROUPINGS_PAGE} from "@splunk/my-react-component/src/urls";
import CollapsiblePanel from "@splunk/react-ui/CollapsiblePanel";
import {useOnFormSubmit} from "./formSubmit";
import {variables} from "@splunk/themes";
import Heading from "@splunk/react-ui/Heading";
import Loader from "@splunk/my-react-component/src/Loader";
import TextAreaControlGroup from "@splunk/my-react-component/src/TextAreaControlGroup";
import {ContextField, CreatedByField, DescriptionField, GroupingIdField, NameField} from "./grouping_form/fields";

const MyForm = styled.form`
    margin-top: ${variables.spacingMedium};
    max-width: 800px;
`

const FORM_FIELD_NAME = "name";
const FORM_FIELD_DESCRIPTION = "description";
const FORM_FIELD_CONTEXT = "context";
const FORM_FIELD_CREATED_BY_REF = "created_by_ref";

// For edit mode
const FORM_FIELD_GROUPING_ID = "grouping_id";

const GROUPING_CONTEXTS = [
    {label: 'unspecified', value: 'unspecified'},
    {label: 'suspicious-activity', value: 'suspicious-activity'},
    {label: 'malicious-activity', value: 'malicious-activity'},
];

function GoToGroupingsButton() {
    return (<Button to={VIEW_GROUPINGS_PAGE} appearance="primary" label="Go to Groupings"/>);
}

export function Form({existingGrouping}) {
    const title = existingGrouping ? "Editing Grouping" : "Create New Grouping";
    const submissionSuccessModalTitle = existingGrouping ? "Successfully Edited Grouping" : "Successfully Created New Grouping";
    const methods = useForm({
        mode: 'all',
    });
    const {register, setValue, handleSubmit, formState, getValues} = methods;

    register(FORM_FIELD_NAME, {required: "Name is required.", value: ""});
    register(FORM_FIELD_CONTEXT, {required: "Context is required.", value: ""});
    if (existingGrouping) {
        register(FORM_FIELD_GROUPING_ID, {required: "Grouping ID is required.", value: ""});
    }

    useEffect(() => {
        if (existingGrouping) {
            setValue(FORM_FIELD_GROUPING_ID, existingGrouping.grouping_id);
            setValue(FORM_FIELD_NAME, existingGrouping.name);
            setValue(FORM_FIELD_CONTEXT, existingGrouping.context);
            setValue(FORM_FIELD_DESCRIPTION, existingGrouping.description);
            setValue(FORM_FIELD_CREATED_BY_REF, existingGrouping.created_by_ref);
        }
    }, [existingGrouping, setValue]);

    const [identities, setIdentities] = useState([]);
    const optionsIdentities = useMemo(() => identities.map((identity) => ({
        label: `${identity.name} (${identity.identity_id})`,
        value: identity.identity_id
    })), [identities]);
    useEffect(() => {
        getIdentities(0, 0, (resp) => {
            setIdentities(resp.records);
        }, (error) => {
            console.error(error);
        }).then();
    }, []);

    const postEndpointFunction = existingGrouping ? editGrouping : postCreateGrouping;
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
        <FormProvider {...methods}>
            <MyForm onSubmit={handleSubmit(onSubmit)}>
                <Heading>{title}</Heading>
                <section>
                    {submissionError && <Message appearance="fill" type="error">
                        {submissionError?.json?.error && <code>{submissionError.json.error}</code>}
                        {submissionError?.error && <code>{submissionError.error.toString()}</code>}
                    </Message>}
                    {existingGrouping && <GroupingIdField disabled fieldName={FORM_FIELD_GROUPING_ID}/>}
                    <NameField fieldName={FORM_FIELD_NAME}/>
                    <DescriptionField fieldName={FORM_FIELD_DESCRIPTION}/>
                    <ContextField options={GROUPING_CONTEXTS} fieldName={FORM_FIELD_CONTEXT}/>
                    <CreatedByField fieldName={FORM_FIELD_CREATED_BY_REF} options={optionsIdentities}/>
                    <SubmitButton disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                                  label={existingGrouping ? "Edit Grouping" : "Create Grouping"}/>
                </section>
                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={submissionSuccessModalTitle}
                    />
                    <Modal.Body>
                        <GoToGroupingsButton/>
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
        </FormProvider>
    )
}

function EditModeForm({groupingId}) {
    const {record, loading, error} = useGetRecord({
        restGetFunction: getGrouping,
        restFunctionQueryArgs: {groupingId}
    });
    return (
        <Loader error={error} loading={loading}>
            <Form existingGrouping={record}/>
        </Loader>
    );
}

export default function GroupingForm({editMode, groupingId}) {
    return editMode ? <EditModeForm groupingId={groupingId}/> : <Form/>;
}
