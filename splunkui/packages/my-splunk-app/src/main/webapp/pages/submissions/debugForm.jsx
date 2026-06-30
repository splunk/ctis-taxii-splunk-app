import { useFormContext } from 'react-hook-form';
import React from 'react';
import Heading from '@splunk/react-ui/Heading';
import PropTypes from 'prop-types';
import { FIELD_SCHEDULED_AT } from './formFields';

export function DebugForm({advancedSettings}) {
    const { formState, getFieldState, watch } = useFormContext();
    const formData = watch();
    return (
        <>
            <section>
                <Heading level={3}>Advanced Settings</Heading>
                <code>{JSON.stringify(advancedSettings, null, 2)}</code>
            </section>
            <section>
                <Heading level={3}>Form Data</Heading>
                <code>{JSON.stringify(formData, null, 2)}</code>
            </section>
            <section>
                <Heading level={3}>Form Errors</Heading>
                <code>{JSON.stringify(formState.errors, null, 2)}</code>
            </section>
            <section>
                <Heading level={3}>Debug One Field</Heading>
                <code>{JSON.stringify(getFieldState(FIELD_SCHEDULED_AT), null, 2)}</code>
            </section>
        </>
    );
}

DebugForm.propTypes = {
    advancedSettings: PropTypes.object.isRequired,
}
