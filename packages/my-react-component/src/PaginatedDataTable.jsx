import React, {useEffect, useMemo, useState} from 'react';
import SearchPaginator from "./paginator";
import P from '@splunk/react-ui/Paragraph';
import {useDebounceMultiple} from "./debounce";

function usePaginatedData({getDataPaginated, skip, limit, onError, query, sort=""}) {
    const [records, setRecords] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedValues = useDebounceMultiple([skip, limit, query], 100);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // TODO: handle cancel? E.g. if pagination changes before data loads
        getDataPaginated({
            skip, limit, query, sort,
            successHandler: (data) => {
                console.log(skip, limit, data)
                setRecords(data.records);
                setTotalRecords(data.total);
                setLoading(false);
            }, errorHandler: (error) => {
                setLoading(false);
                setError(error);
                console.error(error);
                onError(error);
            }
        });
    }, [debouncedValues]);
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

export default function PaginatedDataTable({renderData: RenderData, fetchData, onError, query, sort=""}) {
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
