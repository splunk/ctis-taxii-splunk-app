import {createSlice} from "@reduxjs/toolkit";

export const commonPropertiesSlice = createSlice({
    name: 'commonProperties',
    initialState: {
        data : {},
        signal: null,
        lastSignalRespondedTo: null,
        errors: {}
    },
    reducers: {
        submitData: (state, action) => {
            state.data = action.payload;
        },
        triggerValidationSignal: (state) => {
            state.signal = state.signal === null ? 0 : state.signal + 1;
        },
        validationDone: (state, action) => {
            state.lastSignalRespondedTo = action.payload.signal;
            state.errors = action.payload.errors;
        },
    },
    selectors: {
        waitingForValidation: (state) => {
            return state.signal !== state.lastSignalRespondedTo;
        },
        getValidationSignal: (state) => {
            return state.signal;
        }
    }
});

export const {submitData, triggerValidationSignal, validationDone} = commonPropertiesSlice.actions;
export const {waitingForValidation, getValidationSignal} = commonPropertiesSlice.selectors;
