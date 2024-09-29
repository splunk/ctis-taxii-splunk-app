import React from 'react';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import Button from "@splunk/react-ui/Button";
import {deleteIdentity, getIdentities} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import IdentityForm from "../../common/IdentityForm";
import {editIdentityPage, NEW_IDENTITY_PAGE} from "@splunk/my-react-component/src/urls";
import Heading from "@splunk/react-ui/Heading";
import Plus from '@splunk/react-icons/Plus';
import DeleteModal from "@splunk/my-react-component/src/DeleteModal";
import {getUrlQueryParams} from "../../common/queryParams";
import useModal from "@splunk/my-react-component/src/useModal";
import {layoutWithTheme} from "../../common/theme";
import {HorizontalActionButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import EditIconOnlyButton from "@splunk/my-react-component/src/buttons/EditIconOnlyButton";
import DeleteIconOnlyButton from "@splunk/my-react-component/src/buttons/DeleteIconOnlyButton";
import {IdentitiesSearchBar} from "@splunk/my-react-component/src/SearchBar";


function Actions({row}) {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<HorizontalActionButtonLayout>
        <EditIconOnlyButton to={editIdentityPage(row.identity_id)}/>
        <DeleteIconOnlyButton onClick={handleRequestOpen}/>
        <DeleteModal open={open} onRequestClose={handleRequestClose}
                     deleteEndpointFunction={deleteIdentity}
                     deleteEndpointArgs={{identityId: row.identity_id}}
                     modalBodyContent={<P>Are you sure you want to delete this
                         identity: <strong>{row.name} ({row.identity_id})</strong>?</P>}
        />
    </HorizontalActionButtonLayout>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Identity Class", getCellContent: (row) => row.identity_class},
    {columnName: "Identity ID", getCellContent: (row) => row.identity_id},
]

const expansionFieldNameToCellValue = {
    "Name": (row) => row.name,
    "Identity Class": (row) => row.identity_class,
    "Identity ID": (row) => row.identity_id,
    "Created At (UTC)": (row) => row.created,
    "Modified At (UTC)": (row) => row.modified,
}


function renderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.identity_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}
                                       rowActionPrimary={Actions}
    />
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function ListIdentities() {
    const [query, setQuery] = React.useState({});
    return (
        <>
            <Heading level={1}>Identities</Heading>
            <div>
                <Button icon={<Plus/>} label="New Identity" appearance="primary" to={NEW_IDENTITY_PAGE}/>
            </div>
            <IdentitiesSearchBar onQueryChange={setQuery} />
            <PaginatedDataTable renderData={renderDataTable} fetchData={getIdentities} query={query} onError={(e) => {
                createErrorToast(e);
            }}/>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('action', 'edit') && queryParams.has('identity_id')) {
        const identityId = queryParams.get('identity_id');
        return <IdentityForm editMode={true} identityId={identityId}/>
    } else {
        return (
            <ListIdentities/>
        );
    }
}

layoutWithTheme(
    <AppContainer>
        <Router/>
    </AppContainer>
);
