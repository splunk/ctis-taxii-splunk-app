import React, {useEffect, useState} from 'react';

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

const handleChange = (e, {value: searchValue}) => {
    console.log(searchValue);
};
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

function useIndicatorsData(skip, limit) {
    const [data, setData] = useState({});
    useEffect(() => {
        // TODO: handle cancel? E.g. if pagination changes before data loads
        getIndicators(skip, limit, (data) => {
            console.log(data)
            setData(data);
        }, (error) => {
            console.error(error);
        });
    }, [skip, limit]);
    return data;
}

function IndicatorsDataTable({skip, limit}) {
    const data = useIndicatorsData(skip, limit);
    return (
        <ExpandableDataTable data={data?.records}
                             rowKeyFunction={(row) => row.indicator_id}
                             expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                             mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}/>
    );
}
function MyStyledContainer() {
    const resultsPerPage = 3;
    const [pageNum, setPageNum] = useState(1);
    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(resultsPerPage);
    const handleChange = (event, { page }) => {
        setPageNum(page);
        setSkip((page - 1) * resultsPerPage);
        setLimit(resultsPerPage);
    };
    return (
        <StyledContainer>
            <StyledGreeting>Indicators of Compromise (IoC)</StyledGreeting>
            <div>
                {/* // TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page */}
                <Button icon={<Plus/>} label="New Indicator" appearance="primary"/>
            </div>
            <SearchBar handleChange={handleChange} searchFieldDropdownOptions={SEARCH_FIELD_OPTIONS}/>
            <IndicatorsDataTable skip={skip} limit={limit}/>
            <SearchPaginator pageNum={pageNum} handleChange={handleChange}/>
        </StyledContainer>
    );
}
getUserTheme()
    .then((theme) => {
        layout(<MyStyledContainer />,
            { theme, }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
