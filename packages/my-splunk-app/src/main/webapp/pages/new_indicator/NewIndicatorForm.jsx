import {postCreateIndicator} from "@splunk/my-react-component/src/ApiClient";
import React, {useMemo, useState} from "react";
import PropTypes from "prop-types";
import {FormProvider, useFieldArray, useForm} from "react-hook-form";

import Button from "@splunk/react-ui/Button";
import Modal from '@splunk/react-ui/Modal';
import P from '@splunk/react-ui/Paragraph';
import PlusCircle from '@splunk/react-icons/PlusCircle';

import {VIEW_INDICATORS_PAGE} from "@splunk/my-react-component/src/urls";

import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {IndicatorSubForm} from "./IndicatorSubForm";
import Heading from "@splunk/react-ui/Heading";
import Divider from "@splunk/react-ui/Divider";
import CollapsiblePanel from "@splunk/react-ui/CollapsiblePanel";
import {
    ConfidenceField,
    GroupingIdField,
    TLPv1RatingField,
    ValidFromField
} from "../../common/indicator_form/formControls";
import {
    FIELD_CONFIDENCE,
    FIELD_GROUPING_ID,
    FIELD_INDICATORS,
    FIELD_TLP_RATING,
    FIELD_VALID_FROM,
    REGISTER_FIELD_OPTIONS
} from "../../common/indicator_form/fieldNames";
import useIndicatorCategories from "../../common/indicator_form/indicatorCategories";
import {StyledForm} from "../../common/indicator_form/StyledForm";
import {dateNowInSecondsPrecision, dateToIsoStringWithoutTimezone} from "../../common/date_utils";
import {HorizontalButtonLayout} from "@splunk/my-react-component/HorizontalButtonLayout";
import BaseButton from "@splunk/my-react-component/src/BaseButton";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";

function GotoIndicatorsPageButton() {
    // TODO: this should probs change to viewing the indicator created?
    return (<Button to={VIEW_INDICATORS_PAGE} appearance="secondary" label="Go to Indicators"/>);
}

function GotoGroupingPageButton({groupingId}) {
    return (<Button to={`#${groupingId}`} appearance="primary" label={`Go to Grouping ${groupingId}`}/>);
}

// TODO: change this to use a single object with keys as param
const newIndicatorObject = ({splunk_field_name = '', indicator_value = ''} = {}) => ({
    splunk_field_name: splunk_field_name,
    indicator_value: indicator_value,
    indicator_category: '',
    stix_pattern: '',
    name: '',
    description: '',
});

function getErrorsByIndex(errorsArray, index) {
    if (!errorsArray) return null;

    // Find the error object that matches the given index
    const errorForIndex = errorsArray.find(error => error.index === index);

    // Check if the error object for the specified index exists
    if (!errorForIndex) {
        return null;
    }

    // Return the errors array for the specified index
    return [...errorForIndex.errors];
}

export function NewIndicatorForm({initialSplunkFieldName, initialSplunkFieldValue, event}) {
    const firstIndicator = newIndicatorObject({
        splunk_field_name: initialSplunkFieldName,
        indicator_value: initialSplunkFieldValue
    })
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_GROUPING_ID]: null,
            [FIELD_CONFIDENCE]: 100,
            [FIELD_TLP_RATING]: "GREEN",
            [FIELD_VALID_FROM]: dateToIsoStringWithoutTimezone(dateNowInSecondsPrecision()),
            [FIELD_INDICATORS]: [firstIndicator]
        }
    });
    const {watch, register, trigger, handleSubmit, formState, control} = methods;
    const {fields, append, remove} = useFieldArray({
        control,
        name: FIELD_INDICATORS,
        rules: {
            required: "At least one indicator is required."
        }
    });
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);
    const [submissionErrors, setSubmissionErrors] = useState(null);


    for (const fieldName of [FIELD_GROUPING_ID, FIELD_TLP_RATING, FIELD_CONFIDENCE, FIELD_VALID_FROM]) {
        register(fieldName, REGISTER_FIELD_OPTIONS[fieldName]);
    }

    const [indicators, groupingId] = watch([FIELD_INDICATORS, FIELD_GROUPING_ID]);

    const onSubmit = async (data) => {
        console.log(data);
        const formIsValid = await trigger();
        setSubmissionErrors(null);
        if (formIsValid) {
            await postCreateIndicator(data, (resp) => {
                console.log(resp);
                setSubmitSuccess(true);
                setSubmissionErrors(null);
            }, async (error) => {
                const error_json = await error.json();
                console.error("Error creating indicator", error_json);
                setSubmissionErrors(error_json.errors);
            });
        } else {
            console.error(formState.errors);
        }
    }

    const {indicatorCategories} = useIndicatorCategories();

    return (
        <FormProvider {...methods}>
            <StyledForm name="newIndicator" onSubmit={handleSubmit(onSubmit)}>
                <section>
                    <Heading level={2}>Common Properties</Heading>
                    <P>These properties will be shared by all indicators created on this form.</P>
                    <GroupingIdField fieldName={FIELD_GROUPING_ID}/>
                    <ConfidenceField fieldName={FIELD_CONFIDENCE}/>
                    <TLPv1RatingField fieldName={FIELD_TLP_RATING}/>
                    <ValidFromField fieldName={FIELD_VALID_FROM}/>
                </section>
                <Divider/>
                {fields.map((field, index) => {
                    return <IndicatorSubForm field={field} index={index} register={register}
                                             splunkEvent={event}
                                             removeSelf={() => remove(index)}
                                             indicatorCategories={indicatorCategories}
                                             submissionErrors={getErrorsByIndex(submissionErrors, index)}/>
                })
                }
                <CustomControlGroup>
                    <HorizontalButtonLayout>
                        <BaseButton appearance="secondary" icon={<PlusCircle/>} inline label='Add Another Indicator'
                                    onClick={() => append(newIndicatorObject())}/>
                        <SubmitButton inline disabled={submitButtonDisabled} submitting={formState.isSubmitting}
                                      label={`Create Indicators (${indicators.length})`}/>
                    </HorizontalButtonLayout>
                </CustomControlGroup>

                <CollapsiblePanel title="Debug info">
                    <div style={{color: 'green'}}>
                        <code>
                            {JSON.stringify(indicators)}
                        </code>
                    </div>
                    <div style={{color: 'red'}}>
                        <code>
                            {JSON.stringify(formState.errors)}
                        </code>
                    </div>
                    <div>
                        {event && <code>{JSON.stringify(event)}</code>}
                    </div>
                </CollapsiblePanel>


                {/*// TODO: Move Modal to a separate component*/}
                <Modal open={submitSuccess}>
                    <Modal.Header
                        title={"Successfully Created New Indicator" + (indicators.length > 1 ? "s" : "")}
                    />
                    <Modal.Body>
                        <P>To submit to CTIS, proceed to submit the Grouping.</P>
                        <GotoIndicatorsPageButton/>
                        <GotoGroupingPageButton groupingId={groupingId}/>
                    </Modal.Body>
                </Modal>
            </StyledForm>
        </FormProvider>
    );
}

NewIndicatorForm.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
};
