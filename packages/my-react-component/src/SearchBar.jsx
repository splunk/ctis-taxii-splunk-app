import React, {useEffect} from 'react';
import Search from '@splunk/react-ui/Search';

import styled from 'styled-components';
import {SearchFieldDropdown} from "./SearchFieldDropdown";
import {escapeRegExp} from "lodash";
import {useDebounce} from "./debounce";
import {DatetimeRangePicker} from "./DatetimeRangePicker";

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

export const IndicatorsSearchBar = ({onQueryChange, fullTextSearchFields}) => {
    if (!fullTextSearchFields) {
        throw new Error("fullTextSearchFields array is required!");
    }
    const [query, setQuery] = React.useState({});
    const [lastUpdatedQuery, setLastUpdatedQuery] = React.useState({});
    const [searchValue, setSearchValue] = React.useState('');
    const debouncedSearchValue = useDebounce(searchValue, 300);

    const handleSearchChange = (e, {value}) => {
        setSearchValue(value);
    }

    useEffect(() => {
        let subqueries = [lastUpdatedQuery];
        if (debouncedSearchValue) {
            subqueries.push(generateRegexQueryForFields(fullTextSearchFields, debouncedSearchValue));
        }
        setQuery({'$and': subqueries});
    }, [lastUpdatedQuery, debouncedSearchValue]);

    useEffect(() => {
        console.log('Query is now:', JSON.stringify(query));
        onQueryChange(query);
    }, [query]);

    return (
        <SearchControlContainer>
            <Search style={{flex: 8}} onChange={handleSearchChange} value={searchValue}/>
            <DatetimeRangePicker labelPrefix="Last Updated" fieldName={"modified"}
                                 onQueryChange={setLastUpdatedQuery}/>
            <SearchFieldDropdown defaultValue={""} prefixLabel="Grouping" options={[
                {label: "Any", value: ""},
                {label: "Grouping 1", value: "1"},
                {label: "Grouping 2", value: "2"},
                {label: "Grouping 3", value: "3"},
            ]}/>
            <SearchFieldDropdown defaultValue={""} prefixLabel="TLP Rating" options={[
                {label: "Any", value: ""},
                {label: "GREEN", value: "GREEN"},
                {label: "RED", value: "RED"},
                {label: "AMBER", value: "AMBER"},
                {label: "WHITE", value: "WHITE"},
            ]}/>
        </SearchControlContainer>
    );
}

