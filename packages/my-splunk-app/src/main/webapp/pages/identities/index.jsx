import React, {useState} from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import Button from "@splunk/react-ui/Button";
import Pencil from '@splunk/react-icons/Pencil';
import {deleteIdentity, getIdentities} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import IdentityForm from "../../common/IdentityForm";
import {editIdentityPage} from "@splunk/my-react-component/src/urls";
import Heading from "@splunk/react-ui/Heading";
import Modal from "@splunk/react-ui/Modal";
import DeleteButton from "@splunk/my-react-component/src/DeleteButton";

// TODO: extract into common reusable component
function DeleteModal({identity, open, onRequestClose}) {
    const [loading, setLoading] = useState(false);

    const callDeleteEndpoint = async () => {
        console.log('Deleting identity', identity);
        setLoading(true);
        await deleteIdentity(identity.identity_id, (resp) => {
                console.log('Successfully deleted identity', resp);
                setLoading(false);
                onRequestClose();
                // TODO: find better way to trigger refresh of data
                window.location = window.location;
            },
            (e) => {
                console.error(e);
                setLoading(false);
            });
    }
    return (
        <Modal onRequestClose={onRequestClose} open={open}>
            <Modal.Header title="Confirm Deletion" onRequestClose={onRequestClose}/>
            <Modal.Body>
                Are you sure you want to delete this identity: <strong>{identity.name} ({identity.identity_id})</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button
                    appearance="secondary"
                    onClick={onRequestClose}
                    label="Cancel"
                />
                <DeleteButton disabled={loading} submitting={loading} onClick={callDeleteEndpoint}/>
            </Modal.Footer>
        </Modal>
    )
}

function Actions({row}) {
    const [open, setOpen] = useState(false);

    const handleRequestClose = () => setOpen(false);
    const handleRequestOpen = () => setOpen(true);

    return (<div>
        <Button icon={<Pencil/>} label="Edit" appearance="secondary" to={editIdentityPage(row.identity_id)}/>
        <DeleteButton onClick={handleRequestOpen}/>
        <DeleteModal identity={row} open={open} onRequestClose={handleRequestClose}/>
    </div>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Identity Class", getCellContent: (row) => row.identity_class},
    {columnName: "Identity ID", getCellContent: (row) => row.identity_id},
    {columnName: "Actions", getCellContent: (row) => <Actions row={row}/>},
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
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}/>
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function ListIdentities() {
    return (
        <>
            <Heading level={1}>Identities</Heading>
            <PaginatedDataTable renderData={renderDataTable} fetchData={getIdentities} onError={(e) => {
                createErrorToast(e);
            }}/>
        </>
    );
}

function getUrlQueryParams() {
    return new URLSearchParams(window.location.search);
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

getUserTheme()
    .then((theme) => {
        layout(<AppContainer><Router/></AppContainer>,
            {theme,}
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
