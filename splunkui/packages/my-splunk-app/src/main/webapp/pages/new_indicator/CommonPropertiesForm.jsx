import React, {useEffect} from 'react';
import {FormProvider, useForm} from "react-hook-form"
import Heading from "@splunk/react-ui/Heading";
import {useDispatch, useSelector} from 'react-redux'

import P from "@splunk/react-ui/Paragraph";
import {dateNowInSecondsPrecision, dateToIsoStringWithoutTimezone} from "@splunk/my-page/src/date_utils";
import styled from "styled-components";
import {variables} from "@splunk/themes";
import {DEFAULT_CONFIDENCE_FALLBACK} from "@splunk/my-page/src/hooks/useAdvancedSettings";
import {formDefaultsPropType} from "../../common/formDefaults";
import {getValidationSignal, submitData, validationDone} from './CommonProperties.slice'
import {useRespondToValidationSignal} from "./formUtils";
import {GroupingIdFieldV2} from "../../common/indicator_form/GroupingsDropdown";
import {ValidFromField} from "../../common/indicator_form/formControls";
import {
    FIELD_CONFIDENCE,
    FIELD_GROUPING_ID,
    FIELD_TLP_RATING,
    FIELD_VALID_FROM,
    REGISTER_FIELD_OPTIONS
} from "../../common/indicator_form/fieldNames";
import {TLPv2RatingField} from "../../common/tlp";
import {ConfidenceField} from "../../common/confidence";

const StyledSection = styled.section`
    margin-bottom: ${variables.spacingLarge};
`

const COMMON_PROPERTIES_FIELDS = [FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM];
const CommonPropertiesForm = ({defaults}) => {
    const formMethods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_GROUPING_ID]: '',
            [FIELD_TLP_RATING]: defaults?.tlpV2Rating ?? '',
            [FIELD_CONFIDENCE]: defaults?.confidence ?? DEFAULT_CONFIDENCE_FALLBACK,
            [FIELD_VALID_FROM]: dateToIsoStringWithoutTimezone(dateNowInSecondsPrecision())
        }
    })
    const {
        register,
        handleSubmit,
        formState: {errors},
        formState,
        getValues,
        trigger
    } = formMethods;
    COMMON_PROPERTIES_FIELDS.forEach(fieldName => {
        register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]);
    });

    const dispatch = useDispatch();
    const validationSignal = useSelector(getValidationSignal);

    useEffect(() => {
        dispatch(submitData(getValues()));
    }, [getValues, dispatch, formState]);

    useRespondToValidationSignal({
        validationSignal,
        formErrors: errors,
        trigger,
        validationDoneActionCreator: validationDone
    });
    const onSubmit = (data) => console.log(data);

    return (
        <StyledSection>
            <Heading level={2}>Common Properties</Heading>
            <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <P>These properties will be shared by all indicators created on this form.</P>
                    <GroupingIdFieldV2 fieldName={FIELD_GROUPING_ID}/>
                    <ConfidenceField fieldName={FIELD_CONFIDENCE}/>
                    <TLPv2RatingField fieldName={FIELD_TLP_RATING}/>
                    <ValidFromField fieldName={FIELD_VALID_FROM}/>
                </form>
            </FormProvider>
        </StyledSection>
    );
};

CommonPropertiesForm.propTypes = {
    defaults: formDefaultsPropType,
};

export default CommonPropertiesForm;
