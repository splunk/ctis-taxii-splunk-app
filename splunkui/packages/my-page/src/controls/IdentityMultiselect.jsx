import React, { useEffect, useState } from 'react';
import Multiselect from '@splunk/react-ui/Multiselect';

import Message from '@splunk/react-ui/Message';
import { isArray } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { getIdentities, useGetRecord } from '../ApiClient';

const StyledMultiselect = styled(Multiselect)`
    width: 100% !important;
`
export default function IdentityMultiselect({ selectedIdentityIds, setSelectedIdentityIds }) {
    // GET all identities in one request. Most environments will have a small (<30) number of identities.
    // Even with larger number (say 1000), this is pretty fast.
    const { loading, error, record } = useGetRecord({
        restGetFunction: getIdentities,
        restFunctionQueryArgs: {}
    });
    const [allIdentities, setAllIdentities] = useState([]);

    const handleChange = (e, { values }) => {
        setSelectedIdentityIds(values);
    };

    useEffect(() => {
        if (isArray(record?.records)) {
            setAllIdentities(record.records);
        }

    }, [record]);
    if (error) {
        return (<Message type="error" appearance="fill">
            {JSON.stringify(error)}
        </Message>);
    }
    return (<StyledMultiselect inline isLoadingOptions={loading} values={selectedIdentityIds} onChange={handleChange}>
        {allIdentities.map(identity => (
            <Multiselect.Option label={`${identity.name} (${identity.identity_id})`} value={identity.identity_id} key={identity.identity_id} />
        ))}
    </StyledMultiselect>);
}
IdentityMultiselect.propTypes = {
    selectedIdentityIds: PropTypes.array.isRequired,
    setSelectedIdentityIds: PropTypes.func.isRequired
};
