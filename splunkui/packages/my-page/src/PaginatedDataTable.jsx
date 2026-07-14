import React, { createContext, useEffect, useMemo, useState } from 'react';
import P from '@splunk/react-ui/Paragraph';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { variables } from '@splunk/themes';
import SearchPaginator from './paginator';
import { useDebounceMultiple } from './debounce';
import { SORT_MODIFIED_DESC } from './ApiClient';

const Container = styled.div`
    margin-top: ${variables.spacingLarge};
    margin-bottom: ${variables.spacingLarge};
`
function usePaginatedData({ getDataPaginated, skip, limit, onError, query, sort = '' }) {
    const [records, setRecords] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastRequestId, setLastRequestId] = useState(null);
    const [requestIdToResponse, setRequestIdToResponse] = useState({});

    const debouncedValues = useDebounceMultiple([skip, limit, query], 100);

    useEffect(() => {
        const newRequestId = uuidv4();
        console.log(
            'Setting new request ID:',
            newRequestId,
            'for request:',
            JSON.stringify(debouncedValues),
        );
        setLastRequestId(newRequestId);
    }, [debouncedValues]);

    useEffect(() => {
        if (lastRequestId) {
            console.log('Latest request ID:', lastRequestId);
            setLoading(true);
            setError(null);
            getDataPaginated({
                skip,
                limit,
                query,
                sort,
                requestId: lastRequestId,
                successHandler: (data, { requestId: responseRequestId }) => {
                    setRequestIdToResponse((prev) => ({ ...prev, [responseRequestId]: data }));
                },
                errorHandler: (_error) => {
                    setLoading(false);
                    setError(_error);
                    console.error(_error);
                    onError(_error);
                },
            }).then();
        }
    }, [lastRequestId]);

    useEffect(() => {
        if (lastRequestId && requestIdToResponse[lastRequestId]) {
            const response = requestIdToResponse[lastRequestId];
            console.log(`Settings records for request ID: ${lastRequestId}`);
            setRecords(response.records);
            setTotalRecords(response.total);
            setLoading(false);
        }
    }, [requestIdToResponse, lastRequestId]);

    return { records, totalRecords, loading, error };
}

const OPTIONS_RESULTS_PER_PAGE = [10, 20, 50, 100, 200];
const DEFAULT_RESULTS_PER_PAGE = 10;

export function useDataPages({
    fetchData,
    query,
    pageNum,
    onError = null,
    sort = SORT_MODIFIED_DESC,
    resultsPerPage = DEFAULT_RESULTS_PER_PAGE,
}) {
    const skip = useMemo(() => (pageNum - 1) * resultsPerPage, [pageNum, resultsPerPage]);
    const { records, totalRecords, loading, error } = usePaginatedData({
        getDataPaginated: fetchData,
        skip,
        limit: resultsPerPage,
        query,
        sort,
        onError: (e) => {
            if (onError !== null && typeof onError === 'function') {
                return onError(e);
            }
            console.error(e);
            return null;
        },
    });
    const numPages = useMemo(
        () => Math.max(Math.ceil(totalRecords / resultsPerPage), 1),
        [totalRecords, resultsPerPage],
    );

    return { records, totalRecords, numPages, loading, error };
}

export const RecordsLoaderContext = createContext({ records: [], loading: true, error: null });

export function PaginatedRecords({
    fetchData,
    onError,
    query,
    sort = SORT_MODIFIED_DESC,
    children,
}) {
    const [pageNum, setPageNum] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(DEFAULT_RESULTS_PER_PAGE);
    const { records, loading, error, numPages, totalRecords } = useDataPages({
        fetchData,
        query,
        pageNum,
        onError,
        sort,
        resultsPerPage,
    });

    useEffect(() => {
        console.log('Setting page num to 1 due to change in results per page');
        setPageNum(1);
    }, [resultsPerPage]);

    useEffect(() => {
        // Reset page number when query changes
        console.log('Setting page num to 1 due to query change');
        setPageNum(1);
    }, [query]);

    const contextValue = useMemo(() => ({ records, loading, error }), [records, loading, error]);

    return (
        <RecordsLoaderContext.Provider value={contextValue}>
            {children}
            <Container>
                <P>{`Records found: ${totalRecords}. Page: ${pageNum} out of ${numPages}`}</P>
                <SearchPaginator
                    totalPages={numPages}
                    pageNum={pageNum}
                    onChangePage={setPageNum}
                    resultsPerPage={resultsPerPage}
                    setResultsPerPage={setResultsPerPage}
                    optionsResultsPerPage={OPTIONS_RESULTS_PER_PAGE}
                />
            </Container>
        </RecordsLoaderContext.Provider>
    );
}
PaginatedRecords.propTypes = {
    fetchData: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired,
    sort: PropTypes.string,
    children: PropTypes.node.isRequired,
};
