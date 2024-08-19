import React, {useEffect, useMemo, useState} from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import {SearchBar} from "@splunk/my-react-component/src/SearchBar";
import Button from "@splunk/react-ui/Button";
import Plus from '@splunk/react-icons/Plus';
import Pencil from '@splunk/react-icons/Pencil';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import {app} from '@splunk/splunk-utils/config';
import {createURL} from '@splunk/splunk-utils/url';
import SearchPaginator from "./paginator";
import {StyledContainer, StyledGreeting} from './styles';
import {getIndicators} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import Message from '@splunk/react-ui/Message';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';


const SEARCH_FIELD_OPTIONS = [
    {label: 'Any Field', value: '1'},
    {label: 'Indicator ID', value: '2'},
    {label: 'Splunk Field', value: '3'},
    {label: 'TLP Rating', value: '4'},
];

function IndicatorActionButtons() {
    return (<div>
        <Button icon={<Plus/>} label="Add to Grouping" appearance="primary"/>
        <Button icon={<Pencil/>} label="Edit" appearance="secondary"/>
        <Button icon={<TrashCanCross/>} label="Delete" appearance="destructive"/>
    </div>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Indicator ID", getCellContent: (row) => row.indicator_id},
    {columnName: "Grouping ID", getCellContent: (row) => row.grouping_id},
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Splunk Field", getCellContent: (row) => `${row.splunk_field_name}=${row.splunk_field_value}`},
    {columnName: "Valid From (UTC)", getCellContent: (row) => row.valid_from},
    {columnName: "Actions", getCellContent: (row) => <IndicatorActionButtons row={row}/>},
]

function groupingIdsToMappingOfTitleToUrl(groupingIds) {
    return groupingIds.reduce((acc, groupingId) => {
        acc[groupingId] = createURL(`app/${app}/groupings`, {id: groupingId});
        return acc;
    }, {})
}

const expansionFieldNameToCellValue = {
    "Indicator ID": (row) => row.indicator_id,
    "Grouping ID": (row) => row.grouping_id,
    "Name": (row) => row.name,
    "Description": (row) => row?.description || "No description provided",
    "STIX v2.1 Pattern": (row) => row.stix_pattern,
    "Valid From (UTC)": (row) => row.valid_from,
    // "Groupings": (row) => <ListOfLinks titleToUrl={groupingIdsToMappingOfTitleToUrl(row.referenced_in_groupings)}/>,
    "Splunk Field Name": (row) => row.splunk_field_name,
    "Splunk Field Value": (row) => row.splunk_field_value,
    "TLP Rating": (row) => row.tlp_v1_rating,
}

function useIndicatorsData({skip, limit, onError}) {
    const [records, setRecords] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        // TODO: handle cancel? E.g. if pagination changes before data loads
        getIndicators(skip, limit, (data) => {
            console.log(data)
            setRecords(data.records);
            setTotalRecords(data.total);
            setLoading(false);
        }, (error) => {
            setLoading(false);
            onError(error);
        });
    }, [skip, limit]);
    return {records, totalRecords, loading};
}

function PaginatedDataTable({renderData, fetchData, onError}) {
    const [resultsPerPage, setResultsPerPage] = useState(10);
    const [pageNum, setPageNum] = useState(1);
    const skip = useMemo(() => (pageNum - 1) * resultsPerPage, [pageNum, resultsPerPage]);
    const {records, totalRecords, loading} = fetchData({skip, limit: resultsPerPage, onError});
    const numPages = useMemo(() => Math.ceil(totalRecords / resultsPerPage), [totalRecords, resultsPerPage]);
    // TODO: results per page dropdown / input
    return (
        <>
            {renderData({records, loading})}
            <P>{`Total Records: ${totalRecords}. Page: ${pageNum} out of ${numPages}`}</P>
            <SearchPaginator totalPages={numPages} pageNum={pageNum} onChangePage={setPageNum}/>
        </>
    );

}

function renderDataTable({records, loading}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    return (
        loading ? loadingElement :
        <ExpandableDataTable data={records}
                             rowKeyFunction={(row) => row.indicator_id}
                             expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                             mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}/>
    );
}


function MyStyledContainer() {
    const [error, setError] = useState(null);
    return (
        <StyledContainer>
            <StyledGreeting>Indicators of Compromise (IoC)</StyledGreeting>
            <div>
                {/* // TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page */}
                <Button icon={<Plus/>} label="New Indicator" appearance="primary"/>
            </div>
            <SearchBar handleChange={(e) => {
            }} searchFieldDropdownOptions={SEARCH_FIELD_OPTIONS}/>

            {/*// TODO: Replace with Toast Error message. Make it reusable*/}
            {error && <Message appearance="fill" type="error" onRequestRemove={() => {}}>
                <P><strong>Something went wrong!</strong></P>
                <P>{error}</P>
            </Message> }
            <PaginatedDataTable renderData={renderDataTable} fetchData={useIndicatorsData} onError={(e) => setError(`${e}`)}/>
        </StyledContainer>
    );
}

getUserTheme()
    .then((theme) => {
        layout(<MyStyledContainer/>,
            {theme,}
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
