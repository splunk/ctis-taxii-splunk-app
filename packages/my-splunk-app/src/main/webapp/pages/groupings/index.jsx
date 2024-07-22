import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import {SearchBar} from "@splunk/my-react-component/src/SearchBar";
import Button from "@splunk/react-ui/Button";
import Plus from '@splunk/react-icons/Plus';
import Pencil from '@splunk/react-icons/Pencil';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import PaperPlane from '@splunk/react-icons/PaperPlane';
import {createURL} from "@splunk/splunk-utils/url";
import {app} from "@splunk/splunk-utils/config";
import {ListOfLinks} from "@splunk/my-react-component/src/ListOfLinks";
import mockGroupingsData from "./mockGroupingsData";
import SearchPaginator from "./paginator";
import {StyledContainer, StyledGreeting} from './styles';


const handleChange = (e, {value: searchValue}) => {
    console.log(searchValue);
};
const SEARCH_FIELD_OPTIONS = [
    {label: 'Any Field', value: '1'},
    {label: 'Indicator ID', value: '2'},
    {label: 'Splunk Field', value: '3'},
    {label: 'TLP Rating', value: '4'},
];

function GroupingActionButtons(){
    return (<div>
        <Button icon={<PaperPlane/>} label="Submit to CTIS" appearance="primary" />
        <Button icon={<Pencil/>} label="Edit" appearance="secondary" />
        <Button icon={<TrashCanCross/>} label="Delete" appearance="destructive" />
    </div>)
}
const mappingOfColumnNameToCellValue = [
    {columnName: "Grouping ID", getCellContent: (row) => row.grouping_id},
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Description", getCellContent: (row) => row.description},
    {columnName: "Created At", getCellContent: (row) => row.created_at},
    {columnName: "Actions", getCellContent: (row) => <GroupingActionButtons row={row}/>},
]

function indicatorIdsToMappingOfTitleToUrl(indicatorIds){
    return indicatorIds.reduce((acc, groupingId) => {
        acc[groupingId] = createURL(`app/${app}/indicators`, {id: groupingId});
        return acc;
    }, {})
}
const expansionFieldNameToCellValue = {
    "Grouping ID": (row) => row.grouping_id,
    "Name": (row) => row.name,
    "Description": (row) => row?.description || "No description provided",
    "Created At": (row) => row.created_at,
    "Created By": (row) => row.created_by_ref,
    "Modified At": (row) => row.modified_at,
    "Context": (row) => row.context,
    "Object Refs": (row) => <ListOfLinks titleToUrl={indicatorIdsToMappingOfTitleToUrl(row.object_refs)} />,
}
getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Groupings</StyledGreeting>
                <div>
                    {/* // TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page */}
                    <Button icon={<Plus/>} label="New Grouping" appearance="primary" />
                </div>
                <SearchBar handleChange={handleChange} searchFieldDropdownOptions={SEARCH_FIELD_OPTIONS}/>
                <ExpandableDataTable data={mockGroupingsData}
                                     rowKeyFunction={(row) => row.grouping_id}
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
