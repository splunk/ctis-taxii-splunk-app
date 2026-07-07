import React, { useEffect, useMemo, useState } from 'react';
import Select from '@splunk/react-ui/Select';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';
import { useGetRecord } from '../ApiClient';
import { generateRegexQueryForFields } from './util';
import { shouldUseDebugMode } from '../queryParams';

export function useSelectOptionsFromApi({
                                            restGetFunction,
                                            restFunctionQueryArgs,
                                            selectedKeyValue,
                                            primaryKey,
                                            recordToOptionLabel
                                        }) {
    // Two separate GET requests are required.
    // One request is for querying the collection with a given query / page size.
    // The second request is for fetching the record associated with the currently selected option.
    const { loading, error, record } = useGetRecord({ restGetFunction, restFunctionQueryArgs });
    const pageOfSearchResults = useMemo(() => {
        if (record?.records) {
            return record.records;
        }
        return [];

    }, [record]);
    const { loading: loading2, error: error2, record: recordSelectEntry } = useGetRecord({
        restGetFunction, restFunctionQueryArgs: {
            limit: 1,
            query: selectedKeyValue
        }
    });
    const selectedRecord = useMemo(() => {
        if (recordSelectEntry?.records && recordSelectEntry.records.length > 0) {
            return recordSelectEntry.records[0];
        }
        return null;

    }, [recordSelectEntry]);
    const options = useMemo(() => {
        const allRecords = [];
        allRecords.push(...pageOfSearchResults);
        if (selectedRecord !== null) {
            allRecords.push(selectedRecord);
        }
        const uniqRecords = uniqBy(allRecords, primaryKey);
        return uniqRecords.map(
            (r) => ({
                label: recordToOptionLabel(r),
                value: r[primaryKey]
            })
        );
    }, [pageOfSearchResults, selectedRecord, primaryKey, recordToOptionLabel]);

    return { options, loading: (loading || loading2), error: (error || error2) };
}

export default function SearchableSelectV2({
                                               primaryKey,
                                               recordToOptionLabel,
                                               searchableFields,
                                               restGetFunction,
                                               selectedValue,
    setSelectedValue,
                                               apiPageSize = 10
                                           }) {
    const [searchFilter, setSearchFilter] = useState('');
    const query = useMemo(() => {
        return generateRegexQueryForFields(searchableFields, searchFilter);
    }, [searchFilter, searchableFields]);
    const restFunctionQueryArgs = {
        limit: apiPageSize, query
    };
    const { options, loading, error } = useSelectOptionsFromApi({
        restGetFunction,
        restFunctionQueryArgs,
        selectedKeyValue: {
            [primaryKey]: selectedValue
        },
        primaryKey,
        recordToOptionLabel
    });

    const handleFilterChange = (e, { keyword }) => {
        console.log('handleFilterChange', keyword, e);
        setSearchFilter(keyword);
    };
    const handleOnChange = (e, { value: newValue }) => {
        console.log('handleOnChange', newValue, e);
        setSelectedValue(newValue);
    };

    useEffect(() => {
        console.log('searchFilter', searchFilter);
    }, [searchFilter]);

    const selectComponent =
        <Select value={selectedValue}
                filter="controlled"
                onFilterChange={handleFilterChange}
                onChange={handleOnChange}
                isLoadingOptions={loading}
        >
            {options && options.map(
                option => <Select.Option key={option.value} label={option.label} value={option.value} />
            )}
        </Select>;
    const isDebugMode = shouldUseDebugMode();
    if (isDebugMode) {
        return (<div>
            <div>query: <code>{JSON.stringify(query)}</code></div>
            <div>Loading: {JSON.stringify(loading)}</div>
            <div>Error: {JSON.stringify(error)}</div>
            <div>
                Search filter: {JSON.stringify(searchFilter)}
            </div>
            <div>
                Selected Value: {JSON.stringify(selectedValue)}
            </div>
            <div>
                <code>{JSON.stringify(options)}</code>
            </div>
            <div>
                {selectComponent}
            </div>
        </div>);
    }
    return selectComponent;
}
SearchableSelectV2.propTypes = {
    primaryKey: PropTypes.string.isRequired,
    recordToOptionLabel: PropTypes.func.isRequired,
    searchableFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    restGetFunction: PropTypes.func.isRequired,
    selectedValue: PropTypes.string.isRequired,
    setSelectedValue: PropTypes.func.isRequired,
    apiPageSize: PropTypes.number
};
