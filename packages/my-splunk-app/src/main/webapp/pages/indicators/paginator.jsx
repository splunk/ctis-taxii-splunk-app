import React, { useState } from 'react';
import Paginator from '@splunk/react-ui/Paginator';

function SearchPaginator({totalPages, pageNum, onChangePage}) {
    const handleChange = (event, { page }) => {
        // setPageNum(page);
        // setSkip((page - 1) * resultsPerPage);
        // setLimit(resultsPerPage);
        onChangePage(page);
    };
    return (
        <Paginator
            onChange={handleChange}
            current={pageNum}
            alwaysShowLastPageLink
            totalPages={totalPages}
         />
    );
}

export default SearchPaginator;
