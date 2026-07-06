import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Loader from '@splunk/my-page/src/Loader';
import { getSighting, useGetRecord } from '@splunk/my-page/src/ApiClient';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { shouldUseDebugMode } from '@splunk/my-page/src/queryParams';
import { usePageTitle } from '../../common/utils';
import { FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION } from '../../common/confidence';

const FORM_FIELD_SIGHTING_ID = 'sighting_id';
const FORM_FIELD_SIGHTING_OF_REF = 'sighting_of_ref';

const MyForm = styled.form`
    max-width: 800px;
`;

function useExistingSighting(sightingId) {
    const { record: sighting, loading, error } = useGetRecord(
        {
            restGetFunction: getSighting,
            restFunctionQueryArgs: { sightingId }
        }
    );
    return { sighting, loading, error };
}

export function Form({ existingSighting = null }) {
    // Pass in an existingSighting object to use edit mode.
    // Otherwise, assumed to be in create-new mode.
    const pageTitle = existingSighting ? `Edit Sighting ${existingSighting.sighting_id}` : 'New Sighting';
    usePageTitle(pageTitle);

    const formMethods = useForm({
        mode: 'all', defaultValues: {
            [FIELD_CONFIDENCE]: 100

        }
    });
    const { register, setValue, watch } = formMethods;

    register(FORM_FIELD_SIGHTING_OF_REF, { required: 'sighting_of_ref is required', value: null });
    register(FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION);

    useEffect(() => {
        if (existingSighting !== null) {
            register(FORM_FIELD_SIGHTING_ID, {
                required: 'sighting_id is required',
                value: existingSighting.sighting_id
            });
            setValue(FORM_FIELD_SIGHTING_OF_REF, existingSighting.sighting_of_ref);
            setValue(FIELD_CONFIDENCE, existingSighting.confidence);
        }
    }, [existingSighting, register, setValue]);

    const isDebugMode = shouldUseDebugMode();
    const formValues = watch();

    return (<FormProvider {...formMethods}>
        <MyForm>
            Form
        </MyForm>
        {isDebugMode && <div>
            <div><code>{JSON.stringify(formValues)}</code></div>
        </div>}
    </FormProvider>);
}

Form.propTypes = {
    existingSighting: PropTypes.object
};

export function EditSightingForm({ existingSightingId = null }) {
    const { sighting, loading, error } = useExistingSighting(existingSightingId);
    return (<Loader loading={loading} error={error}>
        {sighting && <Form existingSighting={sighting} />}
    </Loader>);
}

EditSightingForm.propTypes = {
    existingSightingId: PropTypes.string
};
