import React from 'react';

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
import {StyledGreeting} from './styles';
import {getIndicators} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {NEW_INDICATOR_PAGE} from "@splunk/my-react-component/src/urls";


const SEARCH_FIELD_OPTIONS = [
    {label: 'Any Field', value: '1'},
    {label: 'Indicator ID', value: '2'},
    {label: 'Splunk Field', value: '3'},
    {label: 'TLP Rating', value: '4'},
];

function IndicatorActionButtons() {
    return (<div>
        <Button icon={<Pencil/>} label="Edit" appearance="secondary"/>
        <Button icon={<TrashCanCross/>} label="Delete" appearance="destructive"/>
    </div>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Indicator ID", getCellContent: (row) => row.indicator_id},
    {columnName: "Grouping ID", getCellContent: (row) => row.grouping_id},
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "STIX Pattern", getCellContent: (row) => row.stix_pattern},
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
    "STIX Pattern": (row) => row.stix_pattern,
    "Valid From (UTC)": (row) => row.valid_from,
    // "Groupings": (row) => <ListOfLinks titleToUrl={groupingIdsToMappingOfTitleToUrl(row.referenced_in_groupings)}/>,
    "Indicator Category": (row) => row.indicator_category,
    "Indicator Value": (row) => row.indicator_value,
    "TLP Rating": (row) => row.tlp_v1_rating,
}


function renderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.indicator_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}/>
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function MyStyledContainer() {
    return (
        <AppContainer>
            <StyledGreeting>Indicators of Compromise (IoC)</StyledGreeting>
            <div>
                {/* // TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page */}
                <Button icon={<Plus/>} label="New Indicator" appearance="primary" to={NEW_INDICATOR_PAGE}/>
            </div>
            <SearchBar handleChange={(e) => {
            }} searchFieldDropdownOptions={SEARCH_FIELD_OPTIONS}/>

            <PaginatedDataTable renderData={renderDataTable} fetchData={getIndicators} onError={(e) => {
                createErrorToast(e);
            }}/>
        </AppContainer>
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
