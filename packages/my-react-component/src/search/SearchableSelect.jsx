import React, {useEffect, useState} from 'react';
import Select from "@splunk/react-ui/Select";
import {useDebounce} from "../debounce";
import {useGetRecord} from "../ApiClient";
import {generateRegexQueryForFields} from "./util";
import {getUrlQueryParams} from "@splunk/my-splunk-app/src/main/webapp/common/queryParams";

export default function SearchableSelect({
                                             prefixLabel,
                                             recordFields,
                                             queryFilterField,
                                             restGetFunction,
                                             placeholder,
                                             onQueryChange,
                                             initialSelectionQueryParamName
                                         }) {
    let initialSelection = '';
    if (initialSelectionQueryParamName) {
        initialSelection = getUrlQueryParams().get(initialSelectionQueryParamName) ?? initialSelection;
    }
    const [selectedValue, setSelectedValue] = useState(initialSelection);
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
        restGetFunction: restGetFunction,
        restFunctionQueryArgs: {
            limit: 100,
            query: generateRegexQueryForFields(recordFields, debouncedSearchFilter),
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
            onQueryChange({[queryFilterField]: selectedValue});
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
                <Select.Option key={option[queryFilterField]}
                               label={`${option.name} (${option[queryFilterField]})`}
                               value={option[queryFilterField]}/>
            ))}
        </Select>
    );
}
