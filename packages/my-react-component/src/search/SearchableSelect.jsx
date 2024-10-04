import React, {useEffect, useState} from 'react';
import Select from "@splunk/react-ui/Select";
import {useDebounce} from "../debounce";
import {getIdentities, useGetRecord} from "../ApiClient";
import {generateRegexQueryForFields} from "./util";

export default function SearchableSelect({prefixLabel, placeholder, onQueryChange}) {
    const [selectedValue, setSelectedValue] = useState(null);
    const handleChange = (e, {value}) => {
        setSelectedValue(value);
    };
    const [options, setOptions] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const handleFilterChange = (e, {keyword}) => {
        setSearchFilter(keyword);
    }
    const debouncedSearchFilter = useDebounce(searchFilter, 300);
    const {loading, record: response, error} = useGetRecord({
        restGetFunction: getIdentities,
        restFunctionQueryArgs: {
            limit: 100,
            query: generateRegexQueryForFields(['name', 'identity_id'], debouncedSearchFilter),
        }
    })
    useEffect(() => {
        console.log('Searching for:', debouncedSearchFilter);
    }, [debouncedSearchFilter])
    useEffect(() => {
        if (response?.records) {
            setOptions(response.records);
        }
    }, [response])

    useEffect(() => {
        if (selectedValue) {
            onQueryChange({identity_id: selectedValue});
        } else {
            onQueryChange({});
        }
    }, [selectedValue]);

    return (
        <Select
            prefixLabel={prefixLabel}
            placeholder={placeholder}
            value={selectedValue}
            filter="controlled"
            onChange={handleChange}
            onFilterChange={handleFilterChange}
        >
            <Select.Option label="Any" value=""/>
            {options.map((option) => (
                <Select.Option key={option.identity_id}
                               label={`${option.name} (${option.identity_id})`}
                               value={option.identity_id}/>
            ))}
        </Select>
    );
}
