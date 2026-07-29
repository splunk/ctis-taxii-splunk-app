import React, {useEffect} from "react";
import {editIndicator, getIndicator, useGetRecord} from "@splunk/my-page/src/ApiClient";
import {FormProvider, useForm} from "react-hook-form";
import Loader from "@splunk/my-page/src/Loader";
import {reduceIsoStringPrecisionToSeconds} from "@splunk/my-page/src/date_utils";
import {HorizontalButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import DeleteButton from "@splunk/my-page/src/DeleteButton";
import {CustomControlGroup} from "@splunk/my-page/src/CustomControlGroup";
import EditButton from "@splunk/my-page/src/EditButton";
import {urlForEditIndicator, viewIndicator} from "@splunk/my-page/src/urls";
import SubmitButton from "@splunk/my-page/src/SubmitButton";
import CancelButton from "@splunk/my-page/src/CancelButton";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {DeleteIndicatorModal} from "@splunk/my-page/src/DeleteModal";
import useModal from "@splunk/my-page/src/useModal";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import { LabelsControlGroup } from '@splunk/my-page/src/controls/LabelsControlGroup';
import { shouldUseDebugMode } from '@splunk/my-page/src/queryParams';
import { RevokedCheckboxControlGroup } from '@splunk/my-page/src/controls/CheckboxControlGroup';
import {useOnFormSubmit} from "../formSubmit";
import {usePatternSuggester} from "../../pages/new_indicator/patternSuggester";
import useIndicatorCategories from "./indicatorCategories";
import {
    IndicatorCategoryField,
    IndicatorDescriptionField,
    IndicatorIdField,
    IndicatorNameField,
    IndicatorValueField,
    StixPatternField,
    ValidFromField
} from "./formControls";
import {StyledForm} from "./StyledForm";
import {
    FIELD_CONFIDENCE,
    FIELD_GROUPING_ID,
    FIELD_INDICATOR_CATEGORY,
    FIELD_INDICATOR_DESCRIPTION,
    FIELD_INDICATOR_ID,
    FIELD_INDICATOR_NAME,
    FIELD_INDICATOR_VALUE, FIELD_LABELS, FIELD_REVOKED,
    FIELD_STIX_PATTERN,
    FIELD_TLP_RATING,
    FIELD_VALID_FROM, FIELD_VALID_UNTIL,
    REGISTER_FIELD_OPTIONS
} from './fieldNames';
import {GroupingIdFieldV2} from "./GroupingsDropdown";
import {usePageTitle} from "../utils";
import {TLPv2RatingField} from "../tlp";
import {ConfidenceField} from "../confidence";


const FORM_FIELD_NAMES = [FIELD_INDICATOR_ID,
    FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM,
    FIELD_INDICATOR_CATEGORY, FIELD_INDICATOR_VALUE,
    FIELD_STIX_PATTERN, FIELD_INDICATOR_NAME, FIELD_INDICATOR_DESCRIPTION,
    FIELD_VALID_UNTIL, FIELD_LABELS, FIELD_REVOKED
];

const ButtonsForViewMode = ({indicator}) => {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return <HorizontalButtonLayout justifyContent='space-between'>
        <DeleteButton inline onClick={handleRequestOpen}/>
        <EditButton inline to={urlForEditIndicator(indicator.indicator_id)}/>
        <DeleteIndicatorModal open={open} onRequestClose={handleRequestClose} indicator={indicator}/>
    </HorizontalButtonLayout>;
}
ButtonsForViewMode.propTypes = {
    indicator: PropTypes.object.isRequired
}

const ButtonsForEditMode = ({submitting, submitButtonDisabled}) => {
    return <HorizontalButtonLayout>
        <CancelButton/>
        <SubmitButton label="Save Changes" disabled={submitButtonDisabled} submitting={submitting}/>
    </HorizontalButtonLayout>;
}
ButtonsForEditMode.propTypes = {
    submitting: PropTypes.bool.isRequired,
    submitButtonDisabled: PropTypes.bool.isRequired
}


export default function ViewOrEditIndicator({indicatorId, editMode}) {
    const title = editMode ? `Edit Indicator` : `Indicator (${indicatorId})`;
    const readOnly = !editMode;

    usePageTitle(title);

    const {record, loading, error} = useGetRecord({
        restGetFunction: getIndicator,
        restFunctionQueryArgs: {indicatorId},
    })

    const methods = useForm({
        mode: 'all',
    })
    const {trigger, watch, register, formState, handleSubmit, setValue} = methods;
    FORM_FIELD_NAMES.forEach(fieldName => register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]));

    const {onSubmit, submitSuccess, submissionError, submitButtonDisabled} = useOnFormSubmit({
        formMethods: methods,
        submitToPostEndpoint: editIndicator,
        submissionSuccessCallback: (resp) => console.log(resp),
        submissionErrorCallback: (callbackError) => console.error(callbackError),
    })

    useEffect(() => {
        if (submitSuccess) {
            window.location = viewIndicator(indicatorId);
        }
    }, [indicatorId, submitSuccess]);

    useEffect(() => {
        if (record) {
            setValue(FIELD_INDICATOR_ID, record.indicator_id);
            setValue(FIELD_GROUPING_ID, record.grouping_id);
            setValue(FIELD_INDICATOR_NAME, record.name);
            setValue(FIELD_INDICATOR_DESCRIPTION, record.description);
            setValue(FIELD_STIX_PATTERN, record.stix_pattern);
            setValue(FIELD_INDICATOR_VALUE, record.indicator_value);
            setValue(FIELD_INDICATOR_CATEGORY, record.indicator_category);
            setValue(FIELD_VALID_FROM, reduceIsoStringPrecisionToSeconds(record.valid_from));
            setValue(FIELD_CONFIDENCE, record.confidence);
            setValue(FIELD_TLP_RATING, record.tlp_v2_rating);
            setValue(FIELD_LABELS, record.labels);
            if(record.valid_until){
                setValue(FIELD_VALID_UNTIL, reduceIsoStringPrecisionToSeconds(record.valid_until));
            }
            setValue(FIELD_REVOKED, record.revoked ?? false);
        }
    }, [setValue, record]);

    const {indicatorCategories} = useIndicatorCategories();
    const indicatorCategory = watch(FIELD_INDICATOR_CATEGORY);
    const indicatorValue = watch(FIELD_INDICATOR_VALUE);
    const {suggestedPattern, error: patternApiError} = usePatternSuggester(indicatorCategory, indicatorValue);

    useEffect(() => {
        if(suggestedPattern){
            setValue(FIELD_STIX_PATTERN, suggestedPattern, {shouldValidate: true});
        }
    }, [setValue, suggestedPattern]);

    const validFrom = watch(FIELD_VALID_FROM);
    const validUntil = watch(FIELD_VALID_UNTIL);

    useEffect(() => {
        trigger(['valid_from', 'valid_until']);
    }, [trigger, validFrom, validUntil]);

    useEffect(() => {
        // Handle when input is cleared
        if(validUntil === ''){
            setValue(FIELD_VALID_UNTIL, null, {shouldValidate: true})
        }
    }, [validUntil, setValue])

    const formValues = watch();
    const showDebug = shouldUseDebugMode();

    return (<div>
        <PageHeadingContainer>
            <PageHeading>{title}</PageHeading>
        </PageHeadingContainer>
        <Loader loading={loading} error={error}>
            <FormProvider {...methods}>
                <StyledForm onSubmit={handleSubmit(onSubmit)}>
                    <section>
                        <IndicatorIdField fieldName={FIELD_INDICATOR_ID} readOnly={readOnly} disabled/>
                        <GroupingIdFieldV2 fieldName={FIELD_GROUPING_ID} readOnly={readOnly}/>
                        <IndicatorNameField fieldName={FIELD_INDICATOR_NAME} readOnly={readOnly}/>
                        <IndicatorDescriptionField fieldName={FIELD_INDICATOR_DESCRIPTION} readOnly={readOnly}/>
                        <ConfidenceField fieldName={FIELD_CONFIDENCE} readOnly={readOnly}/>
                        <TLPv2RatingField fieldName={FIELD_TLP_RATING} readOnly={readOnly}/>
                        <ValidFromField fieldName={FIELD_VALID_FROM} readOnly={readOnly}/>
                        <IndicatorValueField fieldName={FIELD_INDICATOR_VALUE} readOnly={readOnly}/>
                        <IndicatorCategoryField fieldName={FIELD_INDICATOR_CATEGORY} options={indicatorCategories}
                                                readOnly={readOnly}/>
                        <StixPatternField suggestedPattern={suggestedPattern}
                                          fieldName={FIELD_STIX_PATTERN}
                                          patternApiError={patternApiError}
                                          readOnly={readOnly}/>
                        <CollapsiblePanel title='Advanced Fields'>
                            <ValidFromField fieldName={FIELD_VALID_UNTIL} label='Valid Until (UTC)'/>
                            <LabelsControlGroup fieldName={FIELD_LABELS}/>
                            <RevokedCheckboxControlGroup fieldName={FIELD_REVOKED} />
                        </CollapsiblePanel>
                    </section>
                    {submissionError?.json?.errors && <Message appearance="fill" type="error">
                        <div>
                            <P>Form submission error</P>
                            {submissionError.json.errors.map(submissionErrorToDisplay =>
                                <P>{submissionErrorToDisplay}</P>)}
                        </div>
                    </Message>}
                    <section>
                        <CustomControlGroup>
                            {!editMode && <ButtonsForViewMode indicator={record}/>}
                            {editMode && <ButtonsForEditMode submitting={formState.isSubmitting}
                                                             submitButtonDisabled={submitButtonDisabled}/>}
                        </CustomControlGroup>
                    </section>
                    {showDebug && <section>
                        <div><code>{JSON.stringify(formValues, null, 2)}</code></div>
                    </section>}
                </StyledForm>
            </FormProvider>
        </Loader>
    </div>)

}
ViewOrEditIndicator.propTypes = {
    indicatorId: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
}
