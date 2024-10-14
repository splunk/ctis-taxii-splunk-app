import {createSlice} from "@reduxjs/toolkit";
import {v4 as uuidv4} from 'uuid';

export const indicatorsSlice = createSlice({
    name: 'indicators',
    initialState: {
        indicators: {},
        signal: null,
        lastSignalRespondedTo: {},
        errors: {},
        submissionErrors: {}
    },
    reducers: {
        submitData: (state, action) => {
            state.indicators[action.payload.id] = action.payload.data;
        },
        triggerValidationSignal: (state) => {
            state.signal = state.signal === null ? 0 : state.signal + 1;
        },
        validationDone: (state, action) => {
            const {id} = action.payload;
            state.lastSignalRespondedTo[id] = action.payload.signal;
            state.errors[id] = action.payload.errors;
        },
        addIndicator: (state, action) => {
            const newId = uuidv4();
            state.indicators[newId] = action.payload || {};
        },
        removeIndicator: (state, action) => {
            delete state.indicators[action.payload.id];
            if(state.submissionErrors[action.payload.id]){
                delete state.submissionErrors[action.payload.id];
            }
            if(state.errors[action.payload.id]){
                delete state.errors[action.payload.id];
            }
            if(state.lastSignalRespondedTo[action.payload.id]){
                delete state.lastSignalRespondedTo[action.payload.id];
            }
        },
        addSubmissionError: (state, action) => {
            state.submissionErrors[action.payload.id] = action.payload.errors;
        },
        clearAllSubmissionErrors: (state) => {
            state.submissionErrors = {};
        }
    },
    selectors: {
        waitingForValidation: (state) => {
            const ids = new Set(Object.keys(state.indicators));
            const idsWithSignalRespondedTo = new Set(Object.keys(state.lastSignalRespondedTo));
            const intersection = ids.intersection(idsWithSignalRespondedTo);
            if(intersection.size !== ids.size){
                return true;
            }
            return Object.values(state.lastSignalRespondedTo).some(x => x !== state.signal);
        },
        getValidationSignal: (state) => {
            return state.signal;
        }
    }
});

export const {
    submitData,
    triggerValidationSignal,
    validationDone,
    addIndicator,
    removeIndicator,
    addSubmissionError,
    clearAllSubmissionErrors
} = indicatorsSlice.actions;
export const {waitingForValidation, getValidationSignal} = indicatorsSlice.selectors;
