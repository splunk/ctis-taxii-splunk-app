import React, {useEffect, useState} from 'react';
import Search from '@splunk/react-ui/Search';

import styled from 'styled-components';
import {SearchFieldDropdown} from "./SearchFieldDropdown";
import {useDebounce} from "./debounce";
import {DatetimeRangePicker} from "./DatetimeRangePicker";
import {useListGroupings} from "@splunk/my-splunk-app/src/main/webapp/common/indicator_form/GroupingsDropdown";
import {getUrlQueryParams} from "@splunk/my-splunk-app/src/main/webapp/common/queryParams";
import {variables} from "@splunk/themes";
import SearchableSelect from "./search/SearchableSelect";
import {generateRegexQueryForFields} from "./search/util";
import {getGroupings, getIdentities, getSubmissions} from "./ApiClient";

const SearchControlContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: ${variables.spacingXSmall};

    // Reset margin for children (set by Splunk UI)

    & > * {
        margin: 0 !important;
    }

    margin-top: ${variables.spacingSmall};
    margin-bottom: ${variables.spacingSmall};
`;

export const SearchBar = ({onQueryChange, fullTextSearchFields, subqueries, children}) => {
    if (!fullTextSearchFields) {
        throw new Error("fullTextSearchFields array is required!");
    }

    const queryParams = getUrlQueryParams();
    const initialSearch = queryParams.get('search') || '';

    const [query, setQuery] = React.useState({});
    const [searchValue, setSearchValue] = React.useState(initialSearch);
    const debouncedSearchValue = useDebounce(searchValue, 300);

    const handleSearchChange = (e, {value}) => {
        setSearchValue(value);
    }

    useEffect(() => {
        let all_subqueries = subqueries.filter(subquery => subquery !== null && Object.keys(subquery).length > 0);
        if (debouncedSearchValue) {
            all_subqueries.push(generateRegexQueryForFields(fullTextSearchFields, debouncedSearchValue));
        }
        if (all_subqueries.length === 0) {
            setQuery({});
        } else {
            setQuery({'$and': all_subqueries});
        }
    }, [JSON.stringify(subqueries), debouncedSearchValue, initialSearch]);

    useEffect(() => {
        console.log('Query is now:', JSON.stringify(query));
        onQueryChange(query);
    }, [query]);

    return (
        <SearchControlContainer>
            <Search style={{flex: 8}} onChange={handleSearchChange} value={searchValue}/>
            {children}
        </SearchControlContainer>
    );
}

export const IndicatorsSearchBar = ({onQueryChange}) => {
    const TEXT_SEARCH_FIELDS = ['name', 'description', 'stix_pattern', 'indicator_value', 'indicator_category', 'indicator_id', 'grouping_id'];
    const [lastUpdatedQuery, setLastUpdatedQuery] = useState({});
    const [groupingQuery, setGroupingQuery] = useState({});
    const [tlpRatingQuery, setTlpRatingQuery] = useState({});

    const subqueries = [lastUpdatedQuery, groupingQuery, tlpRatingQuery];
    const {optionsGroupings, loading} = useListGroupings();
    return (
        <SearchBar onQueryChange={onQueryChange} fullTextSearchFields={TEXT_SEARCH_FIELDS} subqueries={subqueries}>
            <DatetimeRangePicker labelPrefix="Last Updated" fieldName={"modified"} onQueryChange={setLastUpdatedQuery}/>
            <SearchFieldDropdown onQueryChange={setGroupingQuery} fieldName={'grouping_id'} defaultValue={""}
                                 prefixLabel="Grouping" options={optionsGroupings} isLoadingOptions={loading}/>
            <SearchFieldDropdown prefixLabel="TLP Rating" fieldName="tlp_v1_rating" onQueryChange={setTlpRatingQuery}
                                 options={[
                                     {label: "GREEN", value: "GREEN"},
                                     {label: "RED", value: "RED"},
                                     {label: "AMBER", value: "AMBER"},
                                     {label: "WHITE", value: "WHITE"},
                                 ]}/>
        </SearchBar>
    );
}

export const GroupingsSearchBar = ({onQueryChange}) => {
    const TEXT_SEARCH_FIELDS = ['name', 'description', 'grouping_id', 'context'];
    const [lastUpdatedQuery, setLastUpdatedQuery] = useState({});
    const [lastSubmittedQuery, setLastSubmittedQuery] = useState(null);
    const [groupingFilter, setGroupingFilter] = useState(null);
    const subqueries = [lastUpdatedQuery, lastSubmittedQuery, groupingFilter];

    return (
        <SearchBar onQueryChange={onQueryChange} fullTextSearchFields={TEXT_SEARCH_FIELDS} subqueries={subqueries}>
            <SearchableSelect searchableFields={['name', 'grouping_id']}
                              prefixLabel="Grouping"
                              placeholder={"Grouping..."}
                              restGetFunction={getGroupings}
                              queryFilterField={"grouping_id"}
                              initialSelectionQueryParamName={"grouping_id"}
                              selectOptionLabelFunction={(record) => `${record.name} (${record.grouping_id})`}
                              onQueryChange={setGroupingFilter}/>
            <DatetimeRangePicker labelPrefix="Last Updated" fieldName={"modified"} onQueryChange={setLastUpdatedQuery}/>
            <DatetimeRangePicker optional={true} labelPrefix="Last Submitted" fieldName={"last_submission_at"}
                                 onQueryChange={setLastSubmittedQuery}/>
        </SearchBar>
    );
}

export const IdentitiesSearchBar = ({onQueryChange}) => {
    const TEXT_SEARCH_FIELDS = ['name', 'identity_id', 'identity_class'];
    const [identityFilter, setIdentityFilter] = useState(null);
    return (
        <SearchBar onQueryChange={onQueryChange} fullTextSearchFields={TEXT_SEARCH_FIELDS}
                   subqueries={[identityFilter]}>
            <SearchableSelect searchableFields={['name', 'identity_id']}
                              prefixLabel="Identity"
                              placeholder={"Identity..."}
                              restGetFunction={getIdentities}
                              queryFilterField={"identity_id"}
                              initialSelectionQueryParamName={"identity_id"}
                              selectOptionLabelFunction={(record) => `${record.name} (${record.identity_id})`}
                              onQueryChange={setIdentityFilter}/>
        </SearchBar>
    );
}

export const SubmissionsSearchBar = ({onQueryChange}) => {
    const TEXT_SEARCH_FIELDS = ['submission_id', 'grouping_id', 'status', 'taxii_config_name',
        'collection_id', 'error_message', 'response_json', 'bundle_json_sent'];
    const [statusQuery, setStatusQuery] = useState({});
    const [scheduledAtQuery, setScheduledAtQuery] = useState({});
    const [submissionFilter, setSubmissionFilter] = useState(null);
    return (
        <SearchBar onQueryChange={onQueryChange} fullTextSearchFields={TEXT_SEARCH_FIELDS}
                   subqueries={[statusQuery, scheduledAtQuery, submissionFilter]}>
            <SearchableSelect searchableFields={['submission_id']}
                              prefixLabel="Submission"
                              placeholder={"Submission..."}
                              restGetFunction={getSubmissions}
                              queryFilterField={"submission_id"}
                              initialSelectionQueryParamName={"submission_id"}
                              selectOptionLabelFunction={(record) => record.submission_id}
                              onQueryChange={setSubmissionFilter}/>
            <SearchFieldDropdown prefixLabel="Status" fieldName="status" onQueryChange={setStatusQuery}
                                 options={[
                                     {label: "SENT", value: "SENT"},
                                     {label: "SCHEDULED", value: "SCHEDULED"},
                                     {label: "FAILED", value: "FAILED"},
                                     {label: "CANCELLED", value: "CANCELLED"},
                                 ]}/>
            <DatetimeRangePicker labelPrefix="Scheduled/Sent At" fieldName={"scheduled_at"}
                                 onQueryChange={setScheduledAtQuery}/>
        </SearchBar>
    );
}
