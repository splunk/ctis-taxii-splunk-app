import React, { useState } from 'react';
import Paginator from '@splunk/react-ui/Paginator';

function SearchPaginator({pageNum, handleChange}) {
    return (
        <Paginator
            onChange={handleChange}
            current={pageNum}
            alwaysShowLastPageLink
            totalPages={10}
         />
    );
}

export default SearchPaginator;
