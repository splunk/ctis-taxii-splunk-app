import React, {useEffect, useMemo, useState} from 'react';
import SearchPaginator from "./paginator";
import P from '@splunk/react-ui/Paragraph';
import {useDebounceMultiple} from "./debounce";
import {v4 as uuidv4} from 'uuid';
import {SORT_MODIFIED_DESC} from "./ApiClient";

function usePaginatedData({getDataPaginated, skip, limit, onError, query, sort = ""}) {
    const [records, setRecords] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastRequestId, setLastRequestId] = useState(null);
    const [requestIdToResponse, setRequestIdToResponse] = useState({});

    const debouncedValues = useDebounceMultiple([skip, limit, query], 100);

    useEffect(() => {
        const newRequestId = uuidv4();
        console.log("Setting new request ID:", newRequestId, "for request:", JSON.stringify(debouncedValues));
        setLastRequestId(newRequestId);
    }, [debouncedValues]);

    useEffect(() => {
        if (lastRequestId) {
            console.log("Latest request ID:", lastRequestId)
            setLoading(true);
            setError(null);
            getDataPaginated({
                skip, limit, query, sort,
                requestId: lastRequestId,
                successHandler: (data, {requestId: responseRequestId}) => {
                    setRequestIdToResponse((prev) => ({...prev, [responseRequestId]: data}));
                }, errorHandler: (error) => {
                    setLoading(false);
                    setError(error);
                    console.error(error);
                    onError(error);
                }
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

    return {records, totalRecords, loading, error};
}

/**
 * Render Paginated Data Table
 *
 * @param {Object} props
 * @param {renderData} props.renderData - Component Function which accepts records, loading, error and returns JSX
 * @param {fetchData} props.fetchData - Function which fetches data from server. Accepts skip, limit, onError and returns {records, totalRecords, loading, error}
 * @param {onError} props.onError - Callback to handle error. Accepts a single error argument.
 *
 */
const OPTIONS_RESULTS_PER_PAGE = [10, 20, 50, 100, 200];
const DEFAULT_RESULTS_PER_PAGE = 10;

export default function PaginatedDataTable({renderData: RenderData, fetchData, onError, query, sort=SORT_MODIFIED_DESC}) {
    const [resultsPerPage, setResultsPerPage] = useState(DEFAULT_RESULTS_PER_PAGE);
    const [pageNum, setPageNum] = useState(1);
    const skip = useMemo(() => (pageNum - 1) * resultsPerPage, [pageNum, resultsPerPage]);
    const {records, totalRecords, loading, error} = usePaginatedData({
        getDataPaginated: fetchData,
        skip,
        limit: resultsPerPage,
        query,
        sort,
        onError
    });
    const numPages = useMemo(() => Math.ceil(totalRecords / resultsPerPage), [totalRecords, resultsPerPage]);

    useEffect(() => {
        console.log("Setting page num to 1");
        setPageNum(1);
    }, [resultsPerPage]);

    useEffect(() => {
        // Reset page number when query changes
        console.log("Setting page num to 1 due to query change");
        setPageNum(1);
    }, [query]);

    return (
        <>
            <RenderData records={records} loading={loading} error={error}/>
            <P>{`Records found: ${totalRecords}. Page: ${pageNum} out of ${numPages}`}</P>
            <SearchPaginator totalPages={numPages}
                             pageNum={pageNum}
                             onChangePage={setPageNum}
                             resultsPerPage={resultsPerPage}
                             setResultsPerPage={setResultsPerPage}
                             optionsResultsPerPage={OPTIONS_RESULTS_PER_PAGE}/>

        </>
    );

}
