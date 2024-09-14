import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import Button from "@splunk/react-ui/Button";
import Pencil from '@splunk/react-icons/Pencil';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import {StyledGreeting} from './styles';
import {getIdentities} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import EditIdentityForm from "./EditIdentityForm";

function IndicatorActionButtons() {
    return (<div>
        <Button icon={<Pencil/>} label="Edit" appearance="secondary"/>
        <Button icon={<TrashCanCross/>} label="Delete" appearance="destructive"/>
    </div>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Identity Class", getCellContent: (row) => row.identity_class},
    {columnName: "Identity ID", getCellContent: (row) => row.identity_id},
    {columnName: "Actions", getCellContent: (row) => <IndicatorActionButtons row={row}/>},
]

const expansionFieldNameToCellValue = {
    "Name": (row) => row.name,
    "Identity Class": (row) => row.identity_class,
    "Identity ID": (row) => row.identity_id,
    "Created At": (row) => row.created,
    "Modified At": (row) => row.modified,
}


function renderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.identity_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}/>
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function ListIdentities() {
    return (
        <AppContainer>
            <StyledGreeting>List of identities</StyledGreeting>
            <PaginatedDataTable renderData={renderDataTable} fetchData={getIdentities} onError={(e) => {
                createErrorToast(e);
            }}/>
        </AppContainer>
    );
}

function getUrlQueryParams() {
    return new URLSearchParams(window.location.search);
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('action', 'edit') && queryParams.has('identity_id')) {
        const identityId = queryParams.get('identity_id');
        return <EditIdentityForm identityId={identityId}/>
    } else {
        return (
            <ListIdentities/>
        );
    }
}

getUserTheme()
    .then((theme) => {
        layout(<Router/>,
            {theme,}
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
