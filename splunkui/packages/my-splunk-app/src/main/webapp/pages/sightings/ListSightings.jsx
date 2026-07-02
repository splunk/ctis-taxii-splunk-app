import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import React, { useState } from 'react';
import { SightingsSearchBar } from '@splunk/my-page/src/SearchBar';
import { usePageTitle } from '../../common/utils';

const PAGE_TITLE = 'Sightings';
export default function ListSightings() {
    usePageTitle(PAGE_TITLE);
    const [query, setQuery] = useState('');

    return (
        <div>
            <PageHeadingContainer>
                <PageHeading level={1}>{PAGE_TITLE}</PageHeading>
            </PageHeadingContainer>
            <SightingsSearchBar onQueryChange={setQuery} />
            <code>{JSON.stringify(query, null, 2)}</code>
        </div>
    );
}
