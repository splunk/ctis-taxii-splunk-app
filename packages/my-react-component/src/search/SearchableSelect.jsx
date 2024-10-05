import React, {useEffect, useState} from 'react';
import Select from "@splunk/react-ui/Select";
import {useDebounce} from "../debounce";
import {useGetRecord} from "../ApiClient";
import {generateRegexQueryForFields} from "./util";
import {getUrlQueryParams} from "@splunk/my-splunk-app/src/main/webapp/common/queryParams";

export default function SearchableSelect({
                                             showAnyOption = true,
                                             searchableFields,
                                             queryFilterField,
                                             restGetFunction,
                                             placeholder,
                                             onQueryChange,
                                             onChange,
                                             initialSelection = '',
                                             initialSelectionQueryParamName,
                                             selectOptionLabelFunction,
                                             ...props
                                         }) {
    let initialSelectionValue = initialSelection;
    if (initialSelectionQueryParamName) {
        initialSelectionValue = getUrlQueryParams().get(initialSelectionQueryParamName) ?? initialSelection;
    }
    const [selectedValue, setSelectedValue] = useState(initialSelectionValue);
    const handleChange = (e, {value}) => {
        setSelectedValue(value);
        if (onChange) {
            onChange(e, {value});
        }
    };
    const [options, setOptions] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const handleFilterChange = (e, {keyword}) => {
        setSearchFilter(keyword);
    }
    const debouncedSearchFilter = useDebounce(searchFilter, 200);
    const {loading, record: response, error} = useGetRecord({
        restGetFunction: restGetFunction,
        restFunctionQueryArgs: {
            limit: 100,
            query: generateRegexQueryForFields(searchableFields, debouncedSearchFilter),
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
        if (onQueryChange) {
            if (selectedValue) {
                onQueryChange({[queryFilterField]: selectedValue});
            } else {
                onQueryChange({});
            }
        }
    }, [selectedValue]);

    return (
        <Select
            placeholder={placeholder}
            value={selectedValue}
            filter="controlled"
            onChange={handleChange}
            onFilterChange={handleFilterChange}
            animateLoading={true}
            isLoadingOptions={loading}
            {...props}
        >
            {showAnyOption && <Select.Option label="Any" value=""/>}
            {options.map((option) => (
                <Select.Option key={option[queryFilterField]}
                               label={selectOptionLabelFunction(option)}
                               value={option[queryFilterField]}/>
            ))}
        </Select>
    );
}
