import React from 'react';
import { useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';
import { CustomControlGroup } from '../CustomControlGroup';
import { IdentitySelect } from './IdentitySelect';

export default function CreatedByRef({ fieldName }) {
    const { setValue, watch, formState: {errors} } = useFormContext();
    const identityId = watch(fieldName);
    const setIdentityId = (id) => setValue(fieldName, id, { shouldValidate: true });
    const fieldError = errors?.[fieldName]?.message;

    return (<CustomControlGroup label="Created By Ref" error={fieldError}>
        <IdentitySelect selectedIdentityId={identityId} setSelectedIdentityId={setIdentityId} error={!!fieldError} />
    </CustomControlGroup>);
}

CreatedByRef.propTypes = {
    fieldName: PropTypes.string.isRequired
};
