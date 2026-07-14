import React from 'react';
import PropTypes from 'prop-types';
import { getIndicators } from '../ApiClient';
import SearchableSelectV2 from '../search/SearchableSelectV2';
import { CustomControlGroup } from '../CustomControlGroup';


export function IndicatorSelect({ selectedIndicatorId, setSelectedIndicatorId }) {
    return <SearchableSelectV2 searchableFields={['name', 'indicator_id']}
                               primaryKey="indicator_id"
                               recordToOptionLabel={(r) => `${r.name} (${r.indicator_id})`}
                               restGetFunction={getIndicators}
                               selectedValue={selectedIndicatorId}
                               setSelectedValue={setSelectedIndicatorId}
                               placeholder="Search for an indicator by id or name..."
    />;
}

IndicatorSelect.propTypes = {
    selectedIndicatorId: PropTypes.string,
    setSelectedIndicatorId: PropTypes.func.isRequired,
}

export function IndicatorSelectControlGroup({selectedIndicatorId, setSelectedIndicatorId, label, ...props}) {
    return (<CustomControlGroup label={label} {...props}>
        <IndicatorSelect selectedIndicatorId={selectedIndicatorId} setSelectedIndicatorId={setSelectedIndicatorId}/>
    </CustomControlGroup>)
}
IndicatorSelectControlGroup.propTypes = {
    selectedIndicatorId: PropTypes.string,
    setSelectedIndicatorId: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
}


