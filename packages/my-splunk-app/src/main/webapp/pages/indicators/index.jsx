import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import {StyledContainer, StyledGreeting} from './styles';
import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import SearchPaginator from "./paginator";
import {SearchBar} from "@splunk/my-react-component/src/SearchBar";
import Button from "@splunk/react-ui/Button";
import Plus from '@splunk/react-icons/Plus';
import Pencil from '@splunk/react-icons/Pencil';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import mockIndicatorData from "./mockIndicatorData";
import {GroupingsLinks} from "./groupingsLinks";

const handleChange = (e, {value: searchValue}) => {
    console.log(searchValue);
};
const SEARCH_FIELD_OPTIONS = [
    {label: 'Any Field', value: '1'},
    {label: 'Indicator ID', value: '2'},
    {label: 'Splunk Field', value: '3'},
    {label: 'TLP Rating', value: '4'},
];

function IndicatorActionButtons({row}){
    return (<div>
        <Button icon={<Plus/>} label="Add to Grouping" appearance="primary" />
        <Button icon={<Pencil/>} label={`Edit`} appearance="secondary" />
        <Button icon={<TrashCanCross/>} label={`Delete`} appearance="destructive" />
    </div>)
}
const mappingOfColumnNameToCellValue = [
    {columnName: "Indicator ID", getCellContent: (row) => row.indicator_id},
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Splunk Field", getCellContent: (row) => `${row.splunk_field_name}=${row.splunk_field_value}`},
    {columnName: "Created At", getCellContent: (row) => row.created_at},
    {columnName: "Actions", getCellContent: (row) => <IndicatorActionButtons row={row}/>},
]

const expansionFieldNameToCellValue = {
    "Indicator ID": (row) => row.indicator_id,
    "Name": (row) => row.name,
    "New field" : (row) => "New value",
    "Description": (row) => row?.description || "No description provided",
    "STIX Pattern": (row) => row.pattern,
    "Created At": (row) => row.created_at,
    "Groupings": (row) => <GroupingsLinks groupings={row.referenced_in_groupings}/>,
    "Splunk Field Name": (row) => row.splunk_field_name,
    "Splunk Field Value": (row) => row.splunk_field_value,
    "TLP Rating": (row) => row.tlp_rating,
}
getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Indicators of Compromise (IoC)</StyledGreeting>
                <div>
                    {/*// TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page*/}
                    <Button icon={<Plus/>} label="New Indicator" appearance="primary" />
                </div>
                <SearchBar handleChange={handleChange} searchFieldDropdownOptions={SEARCH_FIELD_OPTIONS}/>
                <ExpandableDataTable data={mockIndicatorData}
                                     rowKeyFunction={(row) => row.indicator_id}
                                     expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                     mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue} />
                <SearchPaginator />
            </StyledContainer>,
            {
                theme,
            }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
