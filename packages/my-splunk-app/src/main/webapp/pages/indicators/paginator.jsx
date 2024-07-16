import React, { useState } from 'react';
import Paginator from '@splunk/react-ui/Paginator';

function SearchPaginator() {
    const [pageNum, setPageNum] = useState(3);

    const handleChange = (event, { page }) => {
        setPageNum(page);
    };

    return (
        <Paginator
            onChange={handleChange}
            current={pageNum}
            alwaysShowLastPageLink
            totalPages={30}
         />
    );
}

export default SearchPaginator;
