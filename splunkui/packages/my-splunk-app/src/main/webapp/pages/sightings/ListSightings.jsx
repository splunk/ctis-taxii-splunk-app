import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import React, { useContext, useState } from 'react';
import { SightingsSearchBar } from '@splunk/my-page/src/SearchBar';
import { PaginatedRecords, RecordsLoaderContext } from '@splunk/my-page/src/PaginatedDataTable';
import { getSightings } from '@splunk/my-page/src/ApiClient';
import { createErrorToast } from '@splunk/my-page/src/AppContainer';
import { usePageTitle } from '../../common/utils';

const PAGE_TITLE = 'Sightings';

function RenderDataTable() {
    const {loading, error, records} = useContext(RecordsLoaderContext);
    if (error){
        return <div>ERROR: {JSON.stringify(error)}</div>
    }
    if (loading) {
        return <div>Loading...</div>;
    }
    return <div>
        <code>{JSON.stringify(records, null, 2)}</code>
    </div>

}

export default function ListSightings() {
    usePageTitle(PAGE_TITLE);
    const [query, setQuery] = useState({});

    return (
        <div>
            <PageHeadingContainer>
                <PageHeading level={1}>{PAGE_TITLE}</PageHeading>
            </PageHeadingContainer>
            <SightingsSearchBar onQueryChange={setQuery} />
            <code>{JSON.stringify(query, null, 2)}</code>
            <PaginatedRecords fetchData={getSightings} onError={createErrorToast} query={query}>
                <RenderDataTable />
            </PaginatedRecords>
        </div>
    );
}
