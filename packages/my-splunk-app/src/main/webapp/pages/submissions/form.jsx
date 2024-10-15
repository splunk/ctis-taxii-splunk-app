import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from "prop-types";
import {
    errorToText,
    getGrouping,
    getStixBundleForGrouping,
    getTaxiiConfigs,
    listTaxiiCollections,
    submitGrouping,
    useGetRecord
} from "@splunk/my-react-component/src/ApiClient";
import Loader from "@splunk/my-react-component/src/Loader";
import {FormProvider, useForm} from "react-hook-form";
import styled from "styled-components";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import CollapsiblePanel from "@splunk/react-ui/CollapsiblePanel";
import Code from '@splunk/react-ui/Code';
import Switch from "@splunk/react-ui/Switch";
import {dateToIsoStringWithoutTimezone} from "@splunk/my-react-component/src/date_utils";
import moment from "moment";
import {urlForViewSubmission} from "@splunk/my-react-component/src/urls";
import Message from "@splunk/react-ui/Message";
import {PageHeading, PageHeadingContainer} from "@splunk/my-react-component/PageHeading";
import P from "@splunk/react-ui/Paragraph";
import {GroupingId, ScheduledAt, TaxiiCollectionId, TaxiiConfigField} from "../../common/submission_form/fields";
import {usePageTitle} from "../../common/utils";

const FIELD_TAXII_CONFIG_NAME = 'taxii_config_name';
const FIELD_TAXII_COLLECTION_ID = 'taxii_collection_id';
const FIELD_GROUPING_ID = 'grouping_id';
const FIELD_SCHEDULED_AT = 'scheduled_at';

const StyledForm = styled.form`
    max-width: 1000px;
`;
const SwitchContainer = styled.div`
    flex-grow: 0;
    min-width: fit-content;
    max-width: 30%;
`

function collectionToOption(collection) {
    let label = `${collection.title} (${collection.id})`;
    if (collection.can_write === false) {
        label += " [Cannot Write]";
    }
    return {
        label,
        value: collection.id,
        disabled: collection.can_write === false
    }
}

function useTaxiiCollections({selectedTaxiiConfig}) {
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        console.log("Selected TAXII Config:", selectedTaxiiConfig);
        if (selectedTaxiiConfig) {
            setLoading(true);
            listTaxiiCollections({
                taxiiConfigName: selectedTaxiiConfig,
                successHandler: (resp) => {
                    console.log("Collections:", resp);
                    const options = resp.collections.map(collection => collectionToOption(collection));
                    setCollectionOptions(options);
                    setLoading(false);
                },
                errorHandler: async (errorResponse) => {
                    const errorText = await errorResponse.text()
                    const errMessage = `Error getting TAXII collections: ${errorText}`;
                    console.error(errMessage, errorResponse);
                    setLoading(false);
                    setError(errMessage);
                }
            }).then();
        }
    }, [selectedTaxiiConfig]);
    return {collectionOptions, loading, error};

}

export function Form({groupingId}) {
    const title = "Submit Grouping";
    usePageTitle(title);

    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_TAXII_CONFIG_NAME]: null,
            [FIELD_TAXII_COLLECTION_ID]: null,
            [FIELD_GROUPING_ID]: groupingId,
            [FIELD_SCHEDULED_AT]: null,
        }
    });
    const {watch, register, trigger, handleSubmit, formState, setValue} = methods;

    const {loading: loadingGrouping, error: groupingError} = useGetRecord({
        restGetFunction: getGrouping,
        restFunctionQueryArgs: {groupingId}
    });

    const {loading: loadingTaxiiConfigs, record: taxiiConfig, error: taxiiConfigError} = useGetRecord({
        restGetFunction: getTaxiiConfigs,
        restFunctionQueryArgs: {}
    })

    const {loading: bundleLoading, record: bundle, error: bundleError} = useGetRecord({
        restGetFunction: getStixBundleForGrouping,
        restFunctionQueryArgs: {groupingId}
    });
    const bundleJsonString = JSON.stringify(bundle?.bundle, null, 4);

    const loading = loadingGrouping || bundleLoading || loadingTaxiiConfigs;
    const taxiiConfigEntries = taxiiConfig?.entry || [];
    const taxiiConfigOptions = taxiiConfigEntries.map(entry => ({
        label: `${entry.name} (${entry.content.api_root_url})`,
        value: entry.name
    }));

    register(FIELD_GROUPING_ID, {required: 'Grouping ID is required'});
    register(FIELD_TAXII_CONFIG_NAME, {required: 'TAXII Config is required'});
    register(FIELD_TAXII_COLLECTION_ID, {required: 'TAXII Collection is required'});

    const [scheduledSubmission, setScheduledSubmission] = useState(false);
    const submitButtonLabel = scheduledSubmission ? "Schedule Submission" : "Submit Now";

    register(FIELD_SCHEDULED_AT, {
        validate:
            (value) => {
                if (scheduledSubmission) {
                    if (!value) {
                        return `Scheduled At is required`;
                    }
                    const now = moment();
                    const dateValue = moment.utc(value);
                    if (dateValue < now) {
                        return `Scheduled At must be in the future`;
                    }
                }
                return null;
            }
    });

    const selectedTaxiiConfig = watch(FIELD_TAXII_CONFIG_NAME);
    const {
        loading: collectionOptionsLoading,
        collectionOptions,
        error: taxiiCollectionsError
    } = useTaxiiCollections({selectedTaxiiConfig});

    const error = groupingError || bundleError || taxiiConfigError || taxiiCollectionsError;

    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);

    const [submissionError, setSubmissionError] = useState(null);

    const onSubmit = async (data) => {
        console.log("Form data:", data);
        const formIsValid = await trigger();
        if (formIsValid) {
            console.log("Form is valid");
            await submitGrouping(data, (resp) => {
                console.log(resp);
                setSubmitSuccess(true);
                window.location = urlForViewSubmission(resp.submission.submission_id);
            }, (errorResponse) => {
                console.error("Error submitting grouping", errorResponse);
                errorToText(errorResponse).then(
                    errorText => {
                        setSubmissionError(errorText);
                    }
                );
            });
        } else {
            console.log("Form is not valid");
            console.error(formState.errors);
        }
    }

    const handleScheduleSwitchOnClick = () => {
        setScheduledSubmission(v => !v);
    }
    useEffect(() => {
        if (scheduledSubmission) {
            const dateInFuture = moment().add(1, 'days').startOf('minute').toDate();
            setValue(FIELD_SCHEDULED_AT, dateToIsoStringWithoutTimezone(dateInFuture), {shouldValidate: true});
        } else {
            setValue(FIELD_SCHEDULED_AT, null, {shouldValidate: true});
        }
    }, [scheduledSubmission, setValue]);

    return (
        <FormProvider {...methods}>
            <StyledForm name="SubmitGrouping" onSubmit={handleSubmit(onSubmit)}>
                <PageHeadingContainer>
                    <PageHeading level={1}>{title}</PageHeading>
                </PageHeadingContainer>
                <P>Submit Grouping as STIX Bundle to TAXII Server</P>
                <Loader error={error} loading={loading}>
                    {submissionError && <Message appearance="fill" type="error">
                        Error: {JSON.stringify(submissionError)}
                    </Message>}
                    <section>
                        <GroupingId fieldName={FIELD_GROUPING_ID}/>
                        <TaxiiConfigField fieldName={FIELD_TAXII_CONFIG_NAME} options={taxiiConfigOptions}/>
                        <TaxiiCollectionId loading={collectionOptionsLoading} disabled={selectedTaxiiConfig === null}
                                           fieldName={FIELD_TAXII_COLLECTION_ID} options={collectionOptions}/>
                        <CustomControlGroup label="Scheduled?">
                            <SwitchContainer>
                                <Switch
                                    key="scheduleSubmissionSwitch"
                                    onClick={handleScheduleSwitchOnClick}
                                    selected={scheduledSubmission}
                                    appearance="toggle"
                                >{scheduledSubmission ? "Schedule for later" : "Will submit immediately"}</Switch>
                            </SwitchContainer>
                        </CustomControlGroup>
                        {scheduledSubmission && <ScheduledAt fieldName={FIELD_SCHEDULED_AT}/>}
                    </section>
                    <CustomControlGroup>
                        <HorizontalButtonLayout>
                            <SubmitButton label={submitButtonLabel} disabled={submitButtonDisabled}
                                          submitting={formState.isSubmitting}/>
                        </HorizontalButtonLayout>
                    </CustomControlGroup>
                    <section>
                        <CollapsiblePanel title="Preview of STIX Bundle JSON">
                            <Code language="json" value={bundleJsonString}/>
                        </CollapsiblePanel>
                    </section>
                </Loader>
            </StyledForm>
        </FormProvider>
    );
}

Form.propTypes = {
    groupingId: PropTypes.string.isRequired
}

