import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import React, { useState } from 'react';
import { SightingsSearchBar } from '@splunk/my-page/src/SearchBar';
import { PaginatedRecords } from '@splunk/my-page/src/PaginatedDataTable';
import { getSightings } from '@splunk/my-page/src/ApiClient';
import { createErrorToast } from '@splunk/my-page/src/AppContainer';
import { DataTableV2 } from '@splunk/my-page/src/ExpandableDataTable';
import { formatTimestampForDisplay } from '@splunk/my-page/src/date_utils';
import { IndicatorIdLink } from '@splunk/my-page/src/urls';
import { usePageTitle } from '../../common/utils';

const PAGE_TITLE = 'Sightings';

const EXPANSION_ROW_FIELD_NAME_TO_CELL_VALUE = {
    "Sighting ID": (row) => row.sighting_id,
    "Sighting of Ref": (row) => <IndicatorIdLink indicatorId={row.sighting_of_ref} />,
    "Created At (UTC)": (row) => formatTimestampForDisplay(row.created),
    "Updated At (UTC)": (row) => formatTimestampForDisplay(row.updated),
}

const mappingOfColumnNameToCellValue = [
    { columnName: 'Sighting ID', getCellContent: (row) => row.sighting_id },
    { columnName: 'Sighting of Ref', getCellContent: (row) => row.sighting_of_ref },
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
