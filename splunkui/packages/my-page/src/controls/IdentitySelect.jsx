import React from 'react';
import PropTypes from 'prop-types';
import { getIdentities } from '../ApiClient';
import SearchableSelectV2 from '../search/SearchableSelectV2';


export function IdentitySelect({ selectedIdentityId, setSelectedIdentityId }) {
    return <SearchableSelectV2 searchableFields={['name', 'identity_id']}
                               primaryKey="identity_id"
                               recordToOptionLabel={(r) => `${r.name} (${r.identity_id})`}
                               restGetFunction={getIdentities}
                               selectedValue={selectedIdentityId}
                               setSelectedValue={setSelectedIdentityId}
                               placeholder="Search for an identity by id or name..."
    />;
}

IdentitySelect.propTypes = {
    selectedIdentityId: PropTypes.string.isRequired,
    setSelectedIdentityId: PropTypes.func.isRequired
};

