import styled from "styled-components";
import React, {useEffect, useMemo, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
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
import {urlForEditGrouping, VIEW_GROUPINGS_PAGE} from "@splunk/my-react-component/src/urls";
import Loader from "@splunk/my-react-component/src/Loader";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import DeleteButton from "@splunk/my-react-component/src/DeleteButton";
import EditButton from "@splunk/my-react-component/src/EditButton";
import CancelButton from "@splunk/my-react-component/src/CancelButton";
import useModal from "@splunk/my-react-component/src/useModal";
import {DeleteGroupingModal} from "@splunk/my-react-component/src/DeleteModal";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-react-component/PageHeading";
import {ContextField, CreatedByField, DescriptionField, GroupingIdField, NameField} from "./grouping_form/fields";
import {useOnFormSubmit} from "./formSubmit";
import {usePageTitle} from "./utils";
import {TLPv2RatingField, FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION} from "./tlp";
import {ConfidenceField, FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION} from "./confidence";

const MyForm = styled.form`
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

const ButtonsForViewMode = ({grouping}) => {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return <HorizontalButtonLayout justifyContent="space-between">
        <DeleteButton inline onClick={handleRequestOpen}/>
        <EditButton inline to={urlForEditGrouping(grouping.grouping_id)}/>
        <DeleteGroupingModal open={open} onRequestClose={handleRequestClose} grouping={grouping}/>
    </HorizontalButtonLayout>;
}
ButtonsForViewMode.propTypes = {
    grouping: PropTypes.object.isRequired
}

function GoToGroupingsButton() {
    return (<Button to={VIEW_GROUPINGS_PAGE} appearance="primary" label="Go to Groupings"/>);
}

export function Form({existingGrouping, readOnly = false}) {
    if (readOnly && !existingGrouping) {
        throw new Error("existingGrouping is required when readOnly is true.");
    }
    let title;
    if (existingGrouping) {
        title = readOnly ? "Grouping" : "Edit Grouping";
    } else {
        title = "Create New Grouping";
    }
    usePageTitle(title);

    const submissionSuccessModalTitle = existingGrouping ? "Successfully Edited Grouping" : "Successfully Created New Grouping";
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_CONFIDENCE]: 100,
        }
    });
    const {register, setValue, handleSubmit, formState} = methods;

    register(FORM_FIELD_NAME, {required: "Name is required.", value: ""});
    register(FORM_FIELD_CONTEXT, {required: "Context is required.", value: ""});
    register(FORM_FIELD_CREATED_BY_REF, {required: "Created By is required.", value: ""});
    register(FORM_FIELD_DESCRIPTION, {required: "Description is required.", value: ""});
    register(FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION);
    register(FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION);

    if (existingGrouping) {
        register(FORM_FIELD_GROUPING_ID, {required: "Grouping ID is required.", value: ""});
    }

    useEffect(() => {
        if (existingGrouping) {
            console.log("Setting values for existing grouping");
            setValue(FORM_FIELD_GROUPING_ID, existingGrouping.grouping_id);
            setValue(FORM_FIELD_NAME, existingGrouping.name);
            setValue(FORM_FIELD_CONTEXT, existingGrouping.context);
            setValue(FORM_FIELD_DESCRIPTION, existingGrouping.description);
            setValue(FORM_FIELD_CREATED_BY_REF, existingGrouping.created_by_ref);
            setValue(FORM_FIELD_TLP_V2_RATING, existingGrouping.tlp_v2_rating);
            setValue(FIELD_CONFIDENCE, existingGrouping.confidence);
        }
    }, [setValue, existingGrouping]);

    const [identities, setIdentities] = useState([]);
    const optionsIdentities = useMemo(() => identities.map((identity) => ({
        label: `${identity.name} (${identity.identity_id})`,
        value: identity.identity_id
    })), [identities]);

    // TODO: Replace this with ApiClient function getAllIdentities()
    useEffect(() => {
        getIdentities({
            skip: 0, limit: 0, successHandler: (resp) => {
                setIdentities(resp.records);
            }, errorHandler: (error) => {
                console.error(error);
            }
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

    const commonProps = {readOnly};

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
                    {existingGrouping &&
                        <GroupingIdField disabled {...commonProps} fieldName={FORM_FIELD_GROUPING_ID}/>}
                    <NameField {...commonProps} fieldName={FORM_FIELD_NAME}/>
                    <DescriptionField {...commonProps} fieldName={FORM_FIELD_DESCRIPTION}/>
                    <ContextField {...commonProps} options={GROUPING_CONTEXTS} fieldName={FORM_FIELD_CONTEXT}/>
                    <CreatedByField {...commonProps} fieldName={FORM_FIELD_CREATED_BY_REF} options={optionsIdentities}/>
                    <TLPv2RatingField fieldName={FORM_FIELD_TLP_V2_RATING}
                                      help="Note: Grouping TLP marking is automatically updated as you associate Indicators to match the highest Indicator TLP marking."
                    />
                    <ConfidenceField fieldName={FIELD_CONFIDENCE}/>
                    <CustomControlGroup>
                        {!readOnly && <HorizontalButtonLayout>
                            <CancelButton/>
                            <SubmitButton inline disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                                          label={existingGrouping ? "Save Changes" : "Submit"}/>
                        </HorizontalButtonLayout>}
                        {readOnly && <ButtonsForViewMode grouping={existingGrouping}/>}
                    </CustomControlGroup>
                </section>
                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={submissionSuccessModalTitle}
                    />
                    <Modal.Body>
                        <GoToGroupingsButton/>
                    </Modal.Body>
                </Modal>
            </MyForm>
        </FormProvider>
    )
}

Form.propTypes = {
    existingGrouping: PropTypes.object,
    readOnly: PropTypes.bool
}

function ExistingGroupingForm({groupingId, readOnly = false}) {
    const {record, loading, error} = useGetRecord({
        restGetFunction: getGrouping,
        restFunctionQueryArgs: {groupingId}
    });
    return (
        <Loader error={error} loading={loading}>
            <Form existingGrouping={record} readOnly={readOnly}/>
        </Loader>
    );
}

ExistingGroupingForm.propTypes = {
    groupingId: PropTypes.string.isRequired,
    readOnly: PropTypes.bool
}

export default function GroupingForm({groupingId, readOnly = false}) {
    return groupingId ? <ExistingGroupingForm readOnly={readOnly} groupingId={groupingId}/> : <Form/>;
}
GroupingForm.propTypes = {
    groupingId: PropTypes.string,
    readOnly: PropTypes.bool
}
