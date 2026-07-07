import React from 'react';
import PropTypes from 'prop-types';
import { CustomControlGroup } from '../CustomControlGroup';
import SearchableSelect from '../search/SearchableSelect';
import { getIndicators } from '../ApiClient';

export default function IndicatorSelectControlGroup({
                                                        label,
                                                        value,
                                                        onChange,
                                                        error,
                                                        readOnly = false,
                                                        disabled = false
                                                    }) {
    return (
        <CustomControlGroup label={label} error={error} value={value} readOnly={readOnly}>
            <SearchableSelect
                error={error}
                showAnyOption={false}
                searchableFields={['name', 'indicator_id']}
                onChange={onChange}
                disabled={disabled}
                placeholder="Indicator..."
                restGetFunction={getIndicators}
                queryFilterField="indicator_id"
                value={value}
                initialSelection={value}
                selectOptionLabelFunction={(record) => `${record.name} (${record.indicator_id})`}
            />
        </CustomControlGroup>
    );
}

IndicatorSelectControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.string,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool
};
