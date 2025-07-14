import React from 'react';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import {deleteIdentity, getIdentities} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {editIdentityPage, NEW_IDENTITY_PAGE} from "@splunk/my-react-component/src/urls";
import Plus from '@splunk/react-icons/Plus';
import DeleteModal from "@splunk/my-react-component/src/DeleteModal";
import useModal from "@splunk/my-react-component/src/useModal";
import {HorizontalActionButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import EditIconOnlyButton from "@splunk/my-react-component/src/buttons/EditIconOnlyButton";
import DeleteIconOnlyButton from "@splunk/my-react-component/src/buttons/DeleteIconOnlyButton";
import {IdentitiesSearchBar} from "@splunk/my-react-component/src/SearchBar";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-react-component/PageHeading";
import BaseButton from "@splunk/my-react-component/src/BaseButton";
import {formatTimestampForDisplay} from "@splunk/my-react-component/src/date_utils";
import {layoutWithTheme} from "../../common/theme";
import {getUrlQueryParams} from "../../common/queryParams";
import IdentityForm from "../../common/IdentityForm";
import {FIELD_LABEL_TLP_V2_MARKING} from "../../common/tlp";

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

Actions.propTypes = {
    row: PropTypes.object.isRequired
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
    [FIELD_LABEL_TLP_V2_MARKING]: row => row.tlp_v2_rating,
    "Confidence" : row => row.confidence,
    "Created At (UTC)": (row) => formatTimestampForDisplay(row.created),
    "Modified At (UTC)": (row) => formatTimestampForDisplay(row.modified),
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
    if (error) {
        return errorElement;
    }
    return loading ? loadingElement : table;
}

function ListIdentities() {
    const [query, setQuery] = React.useState({});
    return (
        <>
            <PageHeadingContainer>
                <PageHeading level={1}>Identities</PageHeading>
                <BaseButton inline icon={<Plus/>} label="New Identity" appearance="primary" to={NEW_IDENTITY_PAGE}/>
            </PageHeadingContainer>
            <IdentitiesSearchBar onQueryChange={setQuery}/>
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
        return <IdentityForm editMode identityId={identityId}/>
    }
    return (
        <ListIdentities/>
    );

}

layoutWithTheme(
    <AppContainer>
        <Router/>
    </AppContainer>
);
