import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
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
import { useTaxiiCollectionsOptions } from './hooks/useTaxiiCollectionsOptions';
import { useFormSubmission } from './hooks/useFormSubmission';
import {
    FIELD_GROUPING_ID,
    FIELD_SCHEDULED_AT,
    FIELD_TAXII_COLLECTION_ID,
    FIELD_TAXII_CONFIG_NAME,
    useRegisterFormFields,
} from './formFields';
import { useExtractFromTaxiiConfig } from './hooks/useExtractFromTaxiiConfig';
import { DebugForm } from './debugForm';

const StyledForm = styled.form`
    max-width: 1000px;
`;
const SwitchContainer = styled.div`
    flex-grow: 0;
    min-width: fit-content;
    max-width: 30%;
`;

const DEBUG = false;

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
    const {
        watch,
        register,
        trigger,
        handleSubmit,
        formState,
        setValue,
        clearErrors,
        setError,
    } = methods;

    const { error, loading, bundleJsonString, advancedSettings, taxiiConfig } =
        useSubmissionFormData(groupingId);

    const formCollectionId = watch(FIELD_TAXII_COLLECTION_ID);
    const debouncedCollectionId = useDebounce(formCollectionId, 300);

    const [scheduledSubmission, setScheduledSubmission] = useState(false);
    useRegisterFormFields(register, scheduledSubmission);
    const submitButtonLabel = scheduledSubmission ? 'Schedule Submission' : 'Submit Now';

    const selectedTaxiiConfig = watch(FIELD_TAXII_CONFIG_NAME);
    const { selectedDefaultCollectionId, taxiiConfigOptions, shouldDiscoverTaxiiCollections } =
        useExtractFromTaxiiConfig({ taxiiConfig, selectedTaxiiConfigName: selectedTaxiiConfig });

    const {
        loading: collectionOptionsLoading,
        collectionOptions,
        error: taxiiCollectionsError,
    } = useTaxiiCollectionsOptions({ selectedTaxiiConfig });

    useEffect(() => {
        setValue(FIELD_TAXII_COLLECTION_ID, selectedDefaultCollectionId, { shouldValidate: true });
    }, [selectedDefaultCollectionId, collectionOptions, setValue]);

    const { submitSuccess, submissionError, onSubmit } = useFormSubmission(trigger, formState);

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
        const { defaultTaxiiConfigName } = advancedSettings;
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
                    {DEBUG && <DebugForm advancedSettings={advancedSettings}/>}
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
