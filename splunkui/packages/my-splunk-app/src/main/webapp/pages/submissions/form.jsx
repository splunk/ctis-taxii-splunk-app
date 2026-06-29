import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { errorToText, listTaxiiCollections, submitGrouping } from '@splunk/my-page/src/ApiClient';
import Loader from '@splunk/my-page/src/Loader';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import SubmitButton from '@splunk/my-page/src/SubmitButton';
import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import { HorizontalButtonLayout } from '@splunk/my-page/src/HorizontalButtonLayout';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import Code from '@splunk/react-ui/Code';
import Switch from '@splunk/react-ui/Switch';
import { dateToIsoStringWithoutTimezone } from '@splunk/my-page/src/date_utils';
import moment from 'moment';
import { urlForViewSubmission } from '@splunk/my-page/src/urls';
import Message from '@splunk/react-ui/Message';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import P from '@splunk/react-ui/Paragraph';
import { isString } from 'lodash';
import { useDebounce } from '@splunk/my-page/src/debounce';
import {
    GroupingId,
    ScheduledAt,
    TaxiiCollectionIdDropdown,
    TaxiiCollectionIdText,
    TaxiiConfigField,
} from '../../common/submission_form/fields';
import { usePageTitle } from '../../common/utils';
import { useValidateCollectionId } from './hooks/useValidateCollectionId';
import { useSubmissionFormData } from './hooks/useSubmissionFormData';

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
`;

function collectionToOption(collection) {
    let label = `${collection.title} (${collection.id})`;
    if (collection.can_write === false) {
        label += ' [Cannot Write]';
    }
    return {
        label,
        value: collection.id,
        disabled: collection.can_write === false,
    };
}

function useTaxiiCollectionsOptions({ selectedTaxiiConfig }) {
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        console.log('Selected TAXII Config:', selectedTaxiiConfig);
        if (selectedTaxiiConfig) {
            setLoading(true);
            listTaxiiCollections({
                taxiiConfigName: selectedTaxiiConfig,
                successHandler: (resp) => {
                    console.log('Collections:', resp);
                    const options = resp.collections.map((collection) =>
                        collectionToOption(collection),
                    );
                    setCollectionOptions(options);
                    setLoading(false);
                },
                errorHandler: async (errorResponse) => {
                    const errorText = await errorResponse.text();
                    const errMessage = `Error getting TAXII collections: ${errorText}`;
                    console.error(errMessage, errorResponse);
                    setLoading(false);
                    setError(errMessage);
                },
            }).then();
        }
    }, [selectedTaxiiConfig]);
    return { collectionOptions, loading, error };
}

function extractShouldDiscoverCollectionsFromConfig(taxiiConfigContent) {
    if (taxiiConfigContent && 'should_discover_collections' in taxiiConfigContent) {
        return taxiiConfigContent.should_discover_collections === '1';
    }
    // if should_discover_collections is not present, default to true for backwards compatibility
    return true;
}

export function Form({ groupingId }) {
    const title = 'Submit Grouping';
    usePageTitle(title);

    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_TAXII_CONFIG_NAME]: null,
            [FIELD_TAXII_COLLECTION_ID]: null,
            [FIELD_GROUPING_ID]: groupingId,
            [FIELD_SCHEDULED_AT]: null,
        },
    });
    const { watch, register, trigger, handleSubmit, formState, setValue, clearErrors, setError } =
        methods;

    const { error, loading, bundleJsonString, advancedSettings, taxiiConfig } =
        useSubmissionFormData(groupingId);
    const taxiiConfigEntries = taxiiConfig?.entry || [];
    const taxiiConfigOptions = taxiiConfigEntries.map((entry) => ({
        label: `${entry.name} (${entry.content.api_root_url})`,
        value: entry.name,
    }));
    const taxiiConfigNameToContent = Object.fromEntries(
        taxiiConfigEntries.map((entry) => [entry.name, entry.content]),
    );

    register(FIELD_GROUPING_ID, { required: 'Grouping ID is required' });
    register(FIELD_TAXII_CONFIG_NAME, { required: 'TAXII Config is required' });
    register(FIELD_TAXII_COLLECTION_ID, {
        required: 'TAXII Collection is required',
    });
    const formCollectionId = watch(FIELD_TAXII_COLLECTION_ID);
    const debouncedCollectionId = useDebounce(formCollectionId, 300);

    const [scheduledSubmission, setScheduledSubmission] = useState(false);
    const submitButtonLabel = scheduledSubmission ? 'Schedule Submission' : 'Submit Now';

    register(FIELD_SCHEDULED_AT, {
        validate: (value) => {
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
        },
    });

    const selectedTaxiiConfig = watch(FIELD_TAXII_CONFIG_NAME);
    const selectedTaxiiConfigContent = taxiiConfigNameToContent[selectedTaxiiConfig];
    const shouldDiscoverTaxiiCollections = extractShouldDiscoverCollectionsFromConfig(
        selectedTaxiiConfigContent,
    );

    const defaultCollectionId = selectedTaxiiConfigContent?.default_collection_id;
    const selectedDefaultCollectionId =
        isString(defaultCollectionId) && defaultCollectionId !== '' ? defaultCollectionId : null;

    const {
        loading: collectionOptionsLoading,
        collectionOptions,
        error: taxiiCollectionsError,
    } = useTaxiiCollectionsOptions({ selectedTaxiiConfig });

    useEffect(() => {
        setValue(FIELD_TAXII_COLLECTION_ID, selectedDefaultCollectionId, { shouldValidate: true });
    }, [selectedDefaultCollectionId, collectionOptions, setValue]);

    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);

    const onSubmit = async (data) => {
        console.log('Form data:', data);
        const formIsValid = await trigger();
        if (formIsValid) {
            console.log('Form is valid');
            await submitGrouping(
                data,
                (resp) => {
                    console.log(resp);
                    setSubmitSuccess(true);
                    window.location = urlForViewSubmission(resp.submission.submission_id);
                },
                (errorResponse) => {
                    console.error('Error submitting grouping', errorResponse);
                    errorToText(errorResponse).then((errorText) => {
                        setSubmissionError(errorText);
                    });
                },
            );
        } else {
            console.log('Form is not valid');
            console.error(formState.errors);
        }
    };

    const handleScheduleSwitchOnClick = () => {
        setScheduledSubmission((v) => !v);
    };
    useEffect(() => {
        if (scheduledSubmission) {
            const dateInFuture = moment().add(1, 'days').startOf('minute').toDate();
            setValue(FIELD_SCHEDULED_AT, dateToIsoStringWithoutTimezone(dateInFuture), {
                shouldValidate: true,
            });
        } else {
            setValue(FIELD_SCHEDULED_AT, null, { shouldValidate: true });
        }
    }, [scheduledSubmission, setValue]);

    const {
        error: collectionValidationError,
        loading: collectionValidationLoading,
        collectionMetadata: loadedCollectionMetadata,
    } = useValidateCollectionId(
        debouncedCollectionId,
        selectedTaxiiConfig,
        !shouldDiscoverTaxiiCollections,
    );
    useEffect(() => {
        if (collectionValidationError) {
            setError(FIELD_TAXII_COLLECTION_ID, { message: collectionValidationError });
        } else {
            clearErrors(FIELD_TAXII_COLLECTION_ID);
        }
    }, [collectionValidationError, collectionValidationLoading, setError, clearErrors]);

    useEffect(() => {
        const {defaultTaxiiConfigName} = advancedSettings;
        if (isString(defaultTaxiiConfigName) && defaultTaxiiConfigName !== '') {
            setValue(FIELD_TAXII_CONFIG_NAME, defaultTaxiiConfigName, { shouldValidate: true });
        }
    }, [advancedSettings, setValue]);

    const submitButtonDisabled = useMemo(
        () =>
            Object.keys(formState.errors).length > 0 ||
            collectionValidationLoading ||
            collectionOptionsLoading ||
            formState.isSubmitting ||
            submitSuccess,
        [submitSuccess, formState, collectionValidationLoading, collectionOptionsLoading],
    );

    return (
        <FormProvider {...methods}>
            <StyledForm name="SubmitGrouping" onSubmit={handleSubmit(onSubmit)}>
                <PageHeadingContainer>
                    <PageHeading level={1}>{title}</PageHeading>
                </PageHeadingContainer>
                <P>Submit Grouping as STIX Bundle to TAXII Server</P>
                <Loader error={error} loading={loading}>
                    {submissionError && (
                        <Message appearance="fill" type="error">
                            Error: {JSON.stringify(submissionError)}
                        </Message>
                    )}
                    <section>
                        <GroupingId fieldName={FIELD_GROUPING_ID} />
                        <TaxiiConfigField
                            fieldName={FIELD_TAXII_CONFIG_NAME}
                            options={taxiiConfigOptions}
                        />
                        {/* <Code language="json" value={JSON.stringify(advancedSettings, null, 4)}/> */}
                        {/* <Code language="json" value={JSON.stringify(selectedTaxiiConfigContent, null, 4)}/> */}

                        {shouldDiscoverTaxiiCollections && (
                            <TaxiiCollectionIdDropdown
                                loading={collectionOptionsLoading}
                                disabled={selectedTaxiiConfig === null}
                                fieldName={FIELD_TAXII_COLLECTION_ID}
                                options={collectionOptions}
                                error={taxiiCollectionsError}
                            />
                        )}
                        {!shouldDiscoverTaxiiCollections && (
                            <TaxiiCollectionIdText
                                fieldName={FIELD_TAXII_COLLECTION_ID}
                                help={
                                    !collectionValidationError &&
                                    !collectionValidationLoading &&
                                    `Collection Title: ${loadedCollectionMetadata?.title}`
                                }
                            />
                        )}
                        <CustomControlGroup label="Scheduled?">
                            <SwitchContainer>
                                <Switch
                                    key="scheduleSubmissionSwitch"
                                    onClick={handleScheduleSwitchOnClick}
                                    selected={scheduledSubmission}
                                    appearance="toggle"
                                >
                                    {scheduledSubmission
                                        ? 'Schedule for later'
                                        : 'Will submit immediately'}
                                </Switch>
                            </SwitchContainer>
                        </CustomControlGroup>
                        {scheduledSubmission && <ScheduledAt fieldName={FIELD_SCHEDULED_AT} />}
                    </section>
                    <CustomControlGroup>
                        <HorizontalButtonLayout>
                            <SubmitButton
                                label={submitButtonLabel}
                                disabled={submitButtonDisabled}
                                submitting={formState.isSubmitting}
                            />
                        </HorizontalButtonLayout>
                    </CustomControlGroup>
                    <section>
                        <CollapsiblePanel title="Preview of STIX Bundle JSON">
                            <Code language="json" value={bundleJsonString} />
                        </CollapsiblePanel>
                    </section>
                </Loader>
            </StyledForm>
        </FormProvider>
    );
}

Form.propTypes = {
    groupingId: PropTypes.string.isRequired,
};
