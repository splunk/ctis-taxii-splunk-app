import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import Button from "@splunk/react-ui/Button";
import Pencil from '@splunk/react-icons/Pencil';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import PaperPlane from '@splunk/react-icons/PaperPlane';
import {createURL} from "@splunk/splunk-utils/url";
import {app} from "@splunk/splunk-utils/config";
import {ListOfLinks} from "@splunk/my-react-component/src/ListOfLinks";
import {getUrlQueryParams} from "../../common/queryParams";
import GroupingForm from "../../common/GroupingForm";
import Heading from "@splunk/react-ui/Heading";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import {getGroupings} from "@splunk/my-react-component/src/ApiClient";
import {editGroupingPage} from "@splunk/my-react-component/src/urls";


function GroupingActionButtons({row}) {
    return (<div>
        <Button icon={<PaperPlane/>} label="Submit to CTIS" appearance="primary"/>
        <Button icon={<Pencil/>} label="Edit" appearance="secondary" to={editGroupingPage(row.grouping_id)}/>
        <Button icon={<TrashCanCross/>} label="Delete" appearance="destructive"/>
    </div>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Grouping ID", getCellContent: (row) => row.grouping_id},
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Description", getCellContent: (row) => row.description},
    {columnName: "Actions", getCellContent: (row) => <GroupingActionButtons row={row}/>},
]

function indicatorIdsToMappingOfTitleToUrl(indicatorIds) {
    return indicatorIds.reduce((acc, groupingId) => {
        acc[groupingId] = createURL(`app/${app}/indicators`, {id: groupingId});
        return acc;
    }, {})
}

const expansionFieldNameToCellValue = {
    "Grouping ID": (row) => row.grouping_id,
    "Name": (row) => row.name,
    "Description": (row) => row?.description,
    "Context": (row) => row.context,
    "Created At (UTC)": (row) => row.created,
    "Modified At (UTC)": (row) => row.modified,
    "Created By": (row) => row.created_by_ref,
    "Object Refs": (row) => <ListOfLinks titleToUrl={indicatorIdsToMappingOfTitleToUrl([])}/>,
}

function renderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.grouping_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}/>
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function ListGroupings() {
    return (
        <>
            <Heading level={1}>Groupings</Heading>
            <PaginatedDataTable renderData={renderDataTable} fetchData={getGroupings} onError={(e) => {
                createErrorToast(e);
            }}/>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('action', 'edit') && queryParams.has('grouping_id')) {
        const groupingId = queryParams.get('grouping_id');
        return <GroupingForm editMode={true} groupingId={groupingId}/>
    } else {
        return (
            <ListGroupings/>
        );
    }
}

getUserTheme()
    .then((theme) => {
        layout(
            <AppContainer>
                <Router/>
            </AppContainer>,
            {theme,}
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
