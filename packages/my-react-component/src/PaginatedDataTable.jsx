import React, {useEffect} from 'react';
import {useState, useMemo} from "react";
import SearchPaginator from "./paginator";
import P from '@splunk/react-ui/Paragraph';

/**
 * @callback onError - Callback to handle error. Accepts a single error argument.
 * @param {error} error - Error object
 */
/**
 * @callback fetchData
 * @param {int} skip - Number of records to skip (offset)
 * @param {int} limit - Number of records to return
 * @param {onError} onError - Error callback
 */
/**
 * @callback renderData
 * @param {Object} props - Props
 * @param {Array} props.records - Array of records
 * @param {Boolean} props.loading - Loading state
 * @param {Error} props.error - Error object
 */

/**
 * Hook to fetch paginated data
 * @param getDataPaginated
 * @param {int} skip
 * @param {int} limit
 * @param {onError} onError
 * @returns {{totalRecords: number, records: *[], loading: boolean, error: Object}}
 */
function usePaginatedData(getDataPaginated, skip, limit, onError) {
    const [records, setRecords] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        setLoading(true);
        setError(null);
        // TODO: handle cancel? E.g. if pagination changes before data loads
        getDataPaginated(skip, limit, (data) => {
            console.log(skip, limit, data)
            setRecords(data.records);
            setTotalRecords(data.total);
            setLoading(false);
        }, (error) => {
            setLoading(false);
            setError(error);
            console.error(error);
            onError(error);
        });
    }, [skip, limit]);
    return {records, totalRecords, loading, error};
}
/**
 * Render Paginated Data Table
 *
 * @param {Object} props
 * @param {renderData} props.renderData - Function which accepts records, loading, error and returns JSX
 * @param {fetchData} props.fetchData - Function which fetches data from server. Accepts skip, limit, onError and returns {records, totalRecords, loading, error}
 * @param {onError} props.onError - Callback to handle error. Accepts a single error argument.
 *
 */
export default function PaginatedDataTable({renderData, fetchData, onError}) {
    const [resultsPerPage, setResultsPerPage] = useState(10);
    const [pageNum, setPageNum] = useState(1);
    const skip = useMemo(() => (pageNum - 1) * resultsPerPage, [pageNum, resultsPerPage]);
    const {records, totalRecords, loading, error} = usePaginatedData(fetchData, skip, resultsPerPage, onError);
    const numPages = useMemo(() => Math.ceil(totalRecords / resultsPerPage), [totalRecords, resultsPerPage]);
    // TODO: results per page dropdown / input
    return (
        <>
            {renderData({records, loading, error})}
            <P>{`Total Records: ${totalRecords}. Page: ${pageNum} out of ${numPages}`}</P>
            <SearchPaginator totalPages={numPages} pageNum={pageNum} onChangePage={setPageNum}/>

        </>
    );

}
