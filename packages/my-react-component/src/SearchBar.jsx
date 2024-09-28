import React, {useEffect, useState} from 'react';
import Search from '@splunk/react-ui/Search';

import styled from 'styled-components';
import {SearchFieldDropdown} from "./SearchFieldDropdown";
import {escapeRegExp} from "lodash";
import {useDebounce} from "./debounce";
import {DatetimeRangePicker} from "./DatetimeRangePicker";
import {useListGroupings} from "@splunk/my-splunk-app/src/main/webapp/common/indicator_form/GroupingsDropdown";

const SearchControlContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
`;

const generateRegexQuery = (field, value) => {
    return {[field]: {'$regex': escapeRegExp(value), '$options': 'i'}};
}

const generateRegexQueryForFields = (fields, value) => {
    return {'$or': fields.map(field => generateRegexQuery(field, value))};
}

export const SearchBar = ({onQueryChange, fullTextSearchFields, subqueries, children}) => {
    if (!fullTextSearchFields) {
        throw new Error("fullTextSearchFields array is required!");
    }
    const [query, setQuery] = React.useState({});
    const [searchValue, setSearchValue] = React.useState('');
    const debouncedSearchValue = useDebounce(searchValue, 300);

    const handleSearchChange = (e, {value}) => {
        setSearchValue(value);
    }

    useEffect(() => {
        let all_subqueries = subqueries.filter(subquery => Object.keys(subquery).length > 0);
        if (debouncedSearchValue) {
            all_subqueries.push(generateRegexQueryForFields(fullTextSearchFields, debouncedSearchValue));
        }
        if (all_subqueries.length === 0) {
            setQuery({});
        } else {
            setQuery({'$and': all_subqueries});
        }
    }, [JSON.stringify(subqueries), debouncedSearchValue]);

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

