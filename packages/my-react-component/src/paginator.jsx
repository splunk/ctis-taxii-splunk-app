import React from "react";
import Paginator from '@splunk/react-ui/Paginator';
import Select from "@splunk/react-ui/Select";
import styled from "styled-components";
import {variables} from "@splunk/themes";

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: ${variables.spacingMedium};
`

function SearchPaginator({
                             totalPages,
                             pageNum,
                             onChangePage,
                             resultsPerPage,
                             setResultsPerPage,
                             optionsResultsPerPage
                         }) {
    const handleChange = (event, {page}) => {
        onChangePage(page);
    };
    const handleSelectChange = (event, {value}) => {
        console.log(value);
        setResultsPerPage(parseInt(value));
    }
    return (
        <Container>
            <Paginator
                onChange={handleChange}
                current={pageNum}
                alwaysShowLastPageLink
                totalPages={totalPages}
            />
            <Select prefixLabel="Results per page" value={resultsPerPage} onChange={handleSelectChange}>
                {optionsResultsPerPage.map((option) =>
                    <Select.Option label={String(option)} value={option}/>
                )}
            </Select>
        </Container>
    );
}

export default SearchPaginator;
