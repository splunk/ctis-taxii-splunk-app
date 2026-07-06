import React, {useEffect, useState} from 'react';
import Select from "@splunk/react-ui/Select";
import PropTypes from 'prop-types';
import {getUrlQueryParams} from "../queryParams";
import {useDebounce} from "../debounce";
import {useGetRecord} from "../ApiClient";
import {generateRegexQueryForFields} from "./util";

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
                                             apiPageSize = 20,
                                             ...props
                                         }) {
    let initialSelectionValue = initialSelection;
    // TODO: Extract this query param functionality. This component is used in both search bar and entity form contexts.
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
    const {loading, record: response} = useGetRecord({
        restGetFunction,
        restFunctionQueryArgs: {
            limit: apiPageSize,
            query: {
                "$or" : [
                    generateRegexQueryForFields(searchableFields, debouncedSearchFilter),
                    {[queryFilterField]: selectedValue}
                ]
            },
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

SearchableSelect.propTypes = {
    showAnyOption: PropTypes.bool,
    searchableFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    queryFilterField: PropTypes.string.isRequired,
    restGetFunction: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    selectOptionLabelFunction: PropTypes.func.isRequired,
    onQueryChange: PropTypes.func,
    initialSelection: PropTypes.string,
    initialSelectionQueryParamName: PropTypes.string,
    apiPageSize: PropTypes.number,
}
