import React, {useEffect} from "react";
import Heading from "@splunk/react-ui/Heading";
import {getIndicator, useGetRecord} from "@splunk/my-react-component/src/ApiClient";
import {FormProvider, useForm} from "react-hook-form";
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
import {StyledForm} from "./StyledForm";
import {
    ConfidenceField,
    GroupingIdField,
    IndicatorCategoryField,
    IndicatorDescriptionField,
    IndicatorIdField,
    IndicatorNameField,
    IndicatorValueField,
    TLPv1RatingField,
    ValidFromField
} from "./formControls";
import Loader from "@splunk/my-react-component/src/Loader";
import {MyHeading} from "@splunk/my-react-component/MyHeading";
import useIndicatorCategories from "./indicatorCategories";
import {reduceIsoStringPrecisionToSeconds} from "../date_utils";
import {HorizontalButtonLayout} from "@splunk/my-react-component/HorizontalButtonLayout";
import DeleteButton from "@splunk/my-react-component/src/DeleteButton";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import EditButton from "@splunk/my-react-component/src/EditButton";
import {editIndicator} from "@splunk/my-react-component/src/urls";

const FORM_FIELD_NAMES = [FIELD_INDICATOR_ID,
    FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM,
    FIELD_INDICATOR_CATEGORY, FIELD_INDICATOR_VALUE,
    FIELD_STIX_PATTERN, FIELD_INDICATOR_NAME, FIELD_INDICATOR_DESCRIPTION];


export default function ViewOrEditIndicator({indicatorId, editMode}) {
    const title = editMode ? `Edit Indicator (${indicatorId})` : `Indicator (${indicatorId})`;
    useEffect(() => {
        document.title = title;
    }, []);
    const {record, loading, error} = useGetRecord({
        restGetFunction: getIndicator,
        restFunctionQueryArgs: {indicatorId},
    })

    const methods = useForm({
        mode: 'all',
    })
    const {watch, register, formState, handleSubmit, setValue, getValues} = methods;
    for (const fieldName of FORM_FIELD_NAMES) {
        register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]);
    }

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
    }, [record]);

    const {indicatorCategories} = useIndicatorCategories();
    return (<div>
        <MyHeading level={1}>{title}</MyHeading>
        <Loader loading={loading} error={error}>
            <FormProvider {...methods}>
                <StyledForm>
                    <section>
                        <IndicatorIdField fieldName={FIELD_INDICATOR_ID} readOnly={!editMode} disabled={true}/>
                        <GroupingIdField fieldName={FIELD_GROUPING_ID} readOnly={!editMode}/>
                        <IndicatorNameField fieldName={FIELD_INDICATOR_NAME} readOnly={!editMode}/>
                        <IndicatorDescriptionField fieldName={FIELD_INDICATOR_DESCRIPTION} readOnly={!editMode}/>
                        <ConfidenceField fieldName={FIELD_CONFIDENCE} readOnly={!editMode}/>
                        <TLPv1RatingField fieldName={FIELD_TLP_RATING} readOnly={!editMode}/>
                        <ValidFromField fieldName={FIELD_VALID_FROM} readOnly={!editMode}/>
                        <IndicatorValueField fieldName={FIELD_INDICATOR_VALUE} readOnly={!editMode}/>
                        <IndicatorCategoryField fieldName={FIELD_INDICATOR_CATEGORY} options={indicatorCategories}
                                                readOnly={!editMode}/>
                    </section>
                    <section>
                        <CustomControlGroup label="">
                            <HorizontalButtonLayout>
                                <DeleteButton inline={true} onClick={() => {
                                }}/>
                                <EditButton inline={true} to={editIndicator(indicatorId)}/>
                            </HorizontalButtonLayout>
                        </CustomControlGroup>
                    </section>

                </StyledForm>
            </FormProvider>
        </Loader>
        <section>
            <Heading level={4}>Form State</Heading>
            <div>
                <code>{JSON.stringify(getValues())}</code>
            </div>
            <div>
                <code>Edit Mode: {JSON.stringify(editMode)}</code>
            </div>
        </section>
    </div>)

}
