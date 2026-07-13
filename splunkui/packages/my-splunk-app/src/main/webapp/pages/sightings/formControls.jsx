import React from 'react';
import PropTypes from 'prop-types';
import TextAreaControlGroup from '@splunk/my-page/src/TextAreaControlGroup';
import { useFormContext } from 'react-hook-form';
import { IndicatorSelectControlGroup } from '@splunk/my-page/src/controls/IndicatorSelectControlGroup';
import DatetimeControlGroup from '@splunk/my-page/src/DateTimeControlGroup';
import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import Number from '@splunk/react-ui/Number';
import IdentityMultiselect from '@splunk/my-page/src/controls/IdentityMultiselect';
import { IdentitySelect } from '@splunk/my-page/src/controls/IdentitySelect';
import Checkbox from '@splunk/react-ui/Checkbox';
import Multiselect from '@splunk/react-ui/Multiselect';
import { useFormInputProps } from '../../common/formInputProps';

export function FirstSeen({fieldName}){
    const inputProps = useFormInputProps(fieldName);
    return (<DatetimeControlGroup label='First Seen (UTC)' setHelpTextAsRelativeTime {...inputProps}/>)
}
FirstSeen.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function LastSeen({fieldName}){
    const inputProps = useFormInputProps(fieldName);
    return (<DatetimeControlGroup label='Last Seen (UTC)' setHelpTextAsRelativeTime {...inputProps}/>)
}
LastSeen.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function SightingOfRef({fieldName}){
    const {setValue, watch, formState: {errors}} = useFormContext();
    const selectedIndicatorId = watch(fieldName);
    return (<IndicatorSelectControlGroup label='Sighting of Ref'
                                 error={errors[fieldName]?.message}
                                 selectedIndicatorId={selectedIndicatorId}
                                 setSelectedIndicatorId={(x) => setValue(fieldName, x, {shouldValidate: true}) } />);
}
SightingOfRef.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function DescriptionField({fieldName, ...props}) {
    return <TextAreaControlGroup label="Description" {...useFormInputProps(fieldName)} {...props}/>
}

DescriptionField.propTypes = {
    fieldName: PropTypes.string.isRequired
}

export function Count({fieldName}){
    const {setValue, watch} = useFormContext();
    const value = watch(fieldName);
    const onChange = (e, {value: newValue}) => {
        setValue(fieldName, newValue, {shouldValidate: true});
    }
    return <CustomControlGroup label="Count">
        <Number value={value} onChange={onChange} min={0} max={999_999_999} step={1}/>
    </CustomControlGroup>
}
Count.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function WhereSightedRefs({fieldName}) {
    const {setValue, watch} = useFormContext();
    const identityIds = watch(fieldName);
    const setIdentityIds = (ids) => setValue(fieldName, ids, {shouldValidate: true});

    return (<CustomControlGroup label='Where Sighted Refs'>
        <IdentityMultiselect selectedIdentityIds={identityIds} setSelectedIdentityIds={setIdentityIds} />
    </CustomControlGroup>)
}
WhereSightedRefs.propTypes = {
    fieldName: PropTypes.string.isRequired,
}

export function CreatedByRef({ fieldName }) {
    const { setValue, watch } = useFormContext();
    const identityId = watch(fieldName);
    const setIdentityId = (id) => setValue(fieldName, id, { shouldValidate: true });

    return (<CustomControlGroup label="Created By Ref">
        <IdentitySelect selectedIdentityId={identityId} setSelectedIdentityId={setIdentityId} />
    </CustomControlGroup>);
}

CreatedByRef.propTypes = {
    fieldName: PropTypes.string.isRequired
};

export function CheckboxControlGroup({fieldName, label, controlGroupHelp}){
    const {setValue, watch} = useFormContext();
    const isChecked = watch(fieldName);
    return (<CustomControlGroup label={label} help={controlGroupHelp}>
        <Checkbox checked={isChecked} onChange={(e, {checked}) => setValue(fieldName, checked, {shouldValidate: true})}/>
    </CustomControlGroup>)
}
CheckboxControlGroup.propTypes = {
    fieldName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    controlGroupHelp: PropTypes.string.isRequired
}

export function LabelsControlGroup({fieldName}) {
    const {setValue, watch} = useFormContext();
    const labels = watch(fieldName);
    const handleOnChange = (e, {values}) => {
        setValue(fieldName, values, {shouldValidate: true});
    }

    return (<CustomControlGroup label='Labels' help='Type to add a label. Click on a label to remove it.'>
        <Multiselect allowNewValues values={labels} onChange={handleOnChange}/>
    </CustomControlGroup>);
}
LabelsControlGroup.propTypes = {
    fieldName: PropTypes.string.isRequired,
}
