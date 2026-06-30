import { useFormContext } from 'react-hook-form';
import React from 'react';
import { FIELD_SCHEDULED_AT } from './formFields';

export function DebugForm() {
    const { formState, getFieldState, watch } = useFormContext();
    const formData = watch();
    return (
        <>
            <section>
                <code>{JSON.stringify(formData, null, 2)}</code>
            </section>
            <section>
                <code>{JSON.stringify(formState.errors, null, 2)}</code>
            </section>
            <section>
                <code>{JSON.stringify(getFieldState(FIELD_SCHEDULED_AT), null, 2)}</code>
            </section>
        </>
    );
}
