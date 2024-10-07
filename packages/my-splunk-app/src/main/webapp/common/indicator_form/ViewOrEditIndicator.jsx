import React, {useEffect} from "react";
import {editIndicator, getIndicator, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import {FormProvider, useForm} from "react-hook-form";
import Loader from "@splunk/my-react-component/src/Loader";
import {reduceIsoStringPrecisionToSeconds} from "@splunk/my-react-component/src/date_utils";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import DeleteButton from "@splunk/my-react-component/src/DeleteButton";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import EditButton from "@splunk/my-react-component/src/EditButton";
import {urlForEditIndicator, viewIndicator} from "@splunk/my-react-component/src/urls";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import CancelButton from "@splunk/my-react-component/src/CancelButton";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {DeleteIndicatorModal} from "@splunk/my-react-component/src/DeleteModal";
import useModal from "@splunk/my-react-component/src/useModal";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-react-component/PageHeading";
import {useOnFormSubmit} from "../formSubmit";
import {PatternSuggester} from "../../pages/new_indicator/patternSuggester";
import useIndicatorCategories from "./indicatorCategories";
import {
    ConfidenceField,
    IndicatorCategoryField,
    IndicatorDescriptionField,
    IndicatorIdField,
    IndicatorNameField,
    IndicatorValueField,
    TLPv1RatingField,
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
    FIELD_INDICATOR_VALUE,
    FIELD_STIX_PATTERN,
    FIELD_TLP_RATING,
    FIELD_VALID_FROM,
    REGISTER_FIELD_OPTIONS
} from "./fieldNames";
import {GroupingIdFieldV2} from "./GroupingsDropdown";
import {usePageTitle} from "../utils";

const FORM_FIELD_NAMES = [FIELD_INDICATOR_ID,
    FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM,
    FIELD_INDICATOR_CATEGORY, FIELD_INDICATOR_VALUE,
    FIELD_STIX_PATTERN, FIELD_INDICATOR_NAME, FIELD_INDICATOR_DESCRIPTION];

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
    const {watch, register, formState, handleSubmit, setValue} = methods;
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
            setValue(FIELD_TLP_RATING, record.tlp_v1_rating);
        }
    }, [setValue, record]);

    const {indicatorCategories} = useIndicatorCategories();
    const indicatorCategory = watch(FIELD_INDICATOR_CATEGORY);
    const indicatorValue = watch(FIELD_INDICATOR_VALUE);

    return (<div>
        <PageHeadingContainer>
            <PageHeading>{title}</PageHeading>
        </PageHeadingContainer>
        <Loader loading={loading} error={error}>
            <FormProvider {...methods}>
                <StyledForm onSubmit={handleSubmit(onSubmit)}>
                    {submissionError?.json?.errors && <Message appearance="fill" type="error">
                        <div>
                            <P>Form submission error</P>
                            {submissionError.json.errors.map(submissionErrorToDisplay =>
                                <P>{submissionErrorToDisplay}</P>)}
                        </div>
                    </Message>}
                    <section>
                        <IndicatorIdField fieldName={FIELD_INDICATOR_ID} readOnly={readOnly} disabled/>
                        <GroupingIdFieldV2 fieldName={FIELD_GROUPING_ID} readOnly={readOnly}/>
                        <IndicatorNameField fieldName={FIELD_INDICATOR_NAME} readOnly={readOnly}/>
                        <IndicatorDescriptionField fieldName={FIELD_INDICATOR_DESCRIPTION} readOnly={readOnly}/>
                        <ConfidenceField fieldName={FIELD_CONFIDENCE} readOnly={readOnly}/>
                        <TLPv1RatingField fieldName={FIELD_TLP_RATING} readOnly={readOnly}/>
                        <ValidFromField fieldName={FIELD_VALID_FROM} readOnly={readOnly}/>
                        <IndicatorValueField fieldName={FIELD_INDICATOR_VALUE} readOnly={readOnly}/>
                        <IndicatorCategoryField fieldName={FIELD_INDICATOR_CATEGORY} options={indicatorCategories}
                                                readOnly={readOnly}/>
                        <PatternSuggester indicatorCategory={indicatorCategory}
                                          indicatorValue={indicatorValue}
                                          stixPatternFieldName={FIELD_STIX_PATTERN}
                                          readOnly={readOnly}/>
                    </section>
                    <section>
                        <CustomControlGroup>
                            {!editMode && <ButtonsForViewMode indicator={record}/>}
                            {editMode && <ButtonsForEditMode submitting={formState.isSubmitting}
                                                             submitButtonDisabled={submitButtonDisabled}/>}
                        </CustomControlGroup>
                    </section>

                </StyledForm>
            </FormProvider>
        </Loader>
    </div>)

}
ViewOrEditIndicator.propTypes = {
    indicatorId: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
}
