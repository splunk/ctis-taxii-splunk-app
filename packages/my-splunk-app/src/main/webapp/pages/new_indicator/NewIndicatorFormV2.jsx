import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Provider, useDispatch, useSelector} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";
import Loader from "@splunk/my-react-component/src/Loader";
import styled from "styled-components";
import {variables} from "@splunk/themes";
import Divider from "@splunk/react-ui/Divider";
import CommonPropertiesForm from "./CommonPropertiesForm";

import {addIndicator, indicatorsSlice, removeIndicator} from "./Indicators.slice";
import {commonPropertiesSlice} from "./CommonProperties.slice";
import IndicatorSubForm from "./IndicatorSubFormV2";
import Submission from "./Submission";
import useIndicatorCategories from "../../common/indicator_form/indicatorCategories";
import {FIELD_SPLUNK_FIELD_NAME} from "../../common/indicator_form/fieldNames";

export const MaxWidthContainer = styled.div`
    max-width: 1200px;
    margin-bottom: ${variables.spacingLarge};
`

const store = configureStore({
    reducer: {
        commonProperties: commonPropertiesSlice.reducer,
        indicators: indicatorsSlice.reducer
    }
});
const DisplayState = () => {
    const data = useSelector((state) => state.commonProperties.data);
    const errors = useSelector((state) => state.commonProperties.errors);
    const indicators = useSelector((state) => state.indicators.indicators);
    const indicatorsErrors = useSelector((state) => state.indicators.errors);
    const submissionErrors = useSelector((state) => state.indicators.submissionErrors);
    const validationSignal = useSelector((state) => state.indicators.signal);
    const validationSignalsResponded = useSelector((state) => state.indicators.lastSignalRespondedTo);
    return <div>
        <h2>Common Props - Data</h2>
        <code>
            {JSON.stringify(data, null, 2)}
        </code>

        <h2>Common Props - Errors</h2>
        <code>
            {JSON.stringify(errors, null, 2)}
        </code>

        <h2>Indicators</h2>
        <code>
            {JSON.stringify(indicators, null, 2)}
        </code>

        <h2>Indicators - Validation Errors</h2>
        <code>
            {JSON.stringify(indicatorsErrors, null, 2)}
        </code>
        <h2>Indicators - Validation Errors - Signals</h2>
        <div>Current validation signal: {String(validationSignal)}</div>
        <code>
            {JSON.stringify(validationSignalsResponded, null, 2)}
        </code>
        <h2>Indicators - Submission Errors</h2>
        <code>
            {JSON.stringify(submissionErrors, null, 2)}
        </code>
    </div>
}

const DisplayIndicators = ({splunkEvent, initialSplunkFieldName, indicatorCategories}) => {
    const dispatch = useDispatch();
    const indicators = useSelector((state) => state.indicators.indicators);
    const submissionErrors = useSelector((state) => state.indicators.submissionErrors);
    const numIndicators = Object.keys(indicators).length;
    const [initialised, setInitialised] = useState(false);

    useEffect(() => {
        if (!initialised) {
            if (splunkEvent && initialSplunkFieldName) {
                dispatch(addIndicator({
                    [FIELD_SPLUNK_FIELD_NAME]: initialSplunkFieldName,
                }));
            } else {
                dispatch(addIndicator()); // Blank form
            }
        }
        setInitialised(true);
    }, [initialised, setInitialised, dispatch, splunkEvent, initialSplunkFieldName]);

    return <>
        {Object.keys(indicators).map((key, index) =>
            <IndicatorSubForm key={key} index={index} id={key}
                              removeSelfEnabled={numIndicators > 1}
                              removeSelf={() => dispatch(removeIndicator({id: key}))}
                              splunkEvent={splunkEvent}
                              indicatorCategories={indicatorCategories}
                              submissionErrors={submissionErrors[key] || []}
            />
        )}
        <div>
            <button type="button" onClick={() => dispatch(addIndicator())}>Add an indicator</button>
        </div>
    </>
}

DisplayIndicators.propTypes = {
    splunkEvent: PropTypes.object,
    initialSplunkFieldName: PropTypes.string,
    indicatorCategories: PropTypes.array
};

const debugMode = false;

function ComponentWithStoreContext({splunkEvent, initialSplunkFieldName}) {
    const {indicatorCategories, loading: loadingCategories} = useIndicatorCategories();
    return <MaxWidthContainer>
        <Loader loading={loadingCategories}>
            <CommonPropertiesForm/>
            <Divider/>
            <DisplayIndicators splunkEvent={splunkEvent} initialSplunkFieldName={initialSplunkFieldName}
                               indicatorCategories={indicatorCategories}/>
            {debugMode && <DisplayState/>}
            <Submission debugMode={debugMode}/>
        </Loader>
    </MaxWidthContainer>
}

ComponentWithStoreContext.propTypes = {
    splunkEvent: PropTypes.object,
    initialSplunkFieldName: PropTypes.string,
};

export function NewIndicatorFormV2({initialSplunkFieldName, initialSplunkFieldValue, event}) {
    console.log('NewIndicatorFormV2', {initialSplunkFieldName, initialSplunkFieldValue, event});
    return <>
        <Provider store={store}>
            <ComponentWithStoreContext splunkEvent={event} initialSplunkFieldName={initialSplunkFieldName}/>
        </Provider>

    </>
}

NewIndicatorFormV2.propTypes = {
    initialSplunkFieldName: PropTypes.string,
    initialSplunkFieldValue: PropTypes.string,
    event: PropTypes.object
};
