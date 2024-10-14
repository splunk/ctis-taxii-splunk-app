import {createSlice} from "@reduxjs/toolkit";
import {v4 as uuidv4} from 'uuid';

export const indicatorsSlice = createSlice({
    name: 'indicators',
    initialState: {
        indicators : {},
        signal: null,
        lastSignalRespondedTo: {},
        errors: {}
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
        }
    },
    selectors: {
        waitingForValidation: (state) => {
            return Object.values(state.lastSignalRespondedTo).some(x => x !== state.signal);
        },
        getValidationSignal: (state) => {
            return state.signal;
        }
    }
});

export const {submitData, triggerValidationSignal, validationDone, addIndicator, removeIndicator} = indicatorsSlice.actions;
export const {waitingForValidation, getValidationSignal} = indicatorsSlice.selectors;
