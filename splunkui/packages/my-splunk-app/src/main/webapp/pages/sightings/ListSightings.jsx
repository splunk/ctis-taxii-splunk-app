import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import React, { useState } from 'react';
import { SightingsSearchBar } from '@splunk/my-page/src/SearchBar';
import { PaginatedRecords } from '@splunk/my-page/src/PaginatedDataTable';
import { getSightings } from '@splunk/my-page/src/ApiClient';
import { createErrorToast } from '@splunk/my-page/src/AppContainer';
import { DataTableV2 } from '@splunk/my-page/src/ExpandableDataTable';
import { formatTimestampForDisplay } from '@splunk/my-page/src/date_utils';
import { IndicatorIdLink, IdentityIdLink } from '@splunk/my-page/src/urls';
import PropTypes from 'prop-types';
import List from '@splunk/react-ui/List';
import { NoValuePresent, BooleanValue, StixLabels } from '@splunk/my-page/src/data_table/values';
import { usePageTitle } from '../../common/utils';
import { FIELD_LABEL_TLP_V2_MARKING } from '../../common/tlp';


const PAGE_TITLE = 'Sightings';

function WhereSightedRefs({ identities }) {
    if(identities.length === 0){
        return <NoValuePresent />;
    }
    return (
        <List>
            {identities.map((identity) => (
                <List.Item key={identity}>
                    <IdentityIdLink identityId={identity}/>
                </List.Item>
            ))}
        </List>
    );
}
WhereSightedRefs.propTypes = {
    identities: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const EXPANSION_ROW_FIELD_NAME_TO_CELL_VALUE = {
    "Sighting ID": (row) => row.sighting_id,
    "Sighting of Ref": (row) => <IndicatorIdLink indicatorId={row.sighting_of_ref} />,
    "Description": (row) => row.description,
    "First Seen": (row) => row.first_seen,
    "Last Seen": (row) => row.last_seen,
    "Count": (row) => row.count,
    "Where Sighted Refs": row => <WhereSightedRefs identities={row.where_sighted_refs} />,
    "Created By Ref": row => row.created_by_ref ? <IdentityIdLink identityId={row.created_by_ref} /> : <NoValuePresent/>,
    "Summary": row => <BooleanValue value={row.summary}/>,
    [FIELD_LABEL_TLP_V2_MARKING]: row => row.tlp_v2_rating,
    "Confidence": row => row.confidence,
    "Revoked": row => <BooleanValue value={row.revoked}/>,
    "Labels": row => <StixLabels labels={row.labels}/>,
    "Created At (UTC)": (row) => formatTimestampForDisplay(row.created),
    "Updated At (UTC)": (row) => formatTimestampForDisplay(row.modified),
}

const mappingOfColumnNameToCellValue = [
    { columnName: 'Sighting ID', getCellContent: (row) => row.sighting_id },
    { columnName: 'Sighting of Ref', getCellContent: (row) => row.sighting_of_ref },
    {
        columnName: 'Created At (UTC)',
        getCellContent: (row) => formatTimestampForDisplay(row.created),
    },
    {
        columnName: 'Updated At (UTC)',
        getCellContent: (row) => formatTimestampForDisplay(row.modified),
    },
];

export default function ListSightings() {
    usePageTitle(PAGE_TITLE);
    const [query, setQuery] = useState({});

    return (
        <div>
            <PageHeadingContainer>
                <PageHeading level={1}>{PAGE_TITLE}</PageHeading>
            </PageHeadingContainer>
            <SightingsSearchBar onQueryChange={setQuery} />
            <PaginatedRecords fetchData={getSightings} onError={createErrorToast} query={query}>
                <DataTableV2 rowKeyFunction={(row) => row.sighting_id}
                             expansionRowFieldNameToCellValue={EXPANSION_ROW_FIELD_NAME_TO_CELL_VALUE}
                             mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}

                />
            </PaginatedRecords>
        </div>
    );
}
