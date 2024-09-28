import React from 'react';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import Button from "@splunk/react-ui/Button";
import PaperPlane from '@splunk/react-icons/PaperPlane';
import {ListOfLinks} from "@splunk/my-react-component/src/ListOfLinks";
import {getUrlQueryParams} from "../../common/queryParams";
import GroupingForm from "../../common/GroupingForm";
import Heading from "@splunk/react-ui/Heading";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import Plus from '@splunk/react-icons/Plus';
import {deleteGrouping, getGroupings} from "@splunk/my-react-component/src/ApiClient";
import {editGroupingPage, NEW_GROUPING_PAGE, viewIndicator} from "@splunk/my-react-component/src/urls";
import useModal from "@splunk/my-react-component/src/useModal";
import DeleteModal from "@splunk/my-react-component/src/DeleteModal";
import {layoutWithTheme} from "../../common/theme";
import EditIconOnlyButton from "@splunk/my-react-component/src/buttons/EditIconOnlyButton";
import BaseButton from "@splunk/my-react-component/src/BaseButton";
import DeleteIconOnlyButton from "@splunk/my-react-component/src/buttons/DeleteIconOnlyButton";
import Tooltip from "@splunk/react-ui/Tooltip";
import {HorizontalActionButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import {GroupingsSearchBar} from "@splunk/my-react-component/src/SearchBar";

function SubmitToTaxiiButton({row}) {
    return (<Tooltip content={"Submit to TAXII Server"}>
        <BaseButton noBorder noMargin inline icon={<PaperPlane/>} label="Submit" appearance="primary"
                    onClick={() => console.log(row)}/>
    </Tooltip>);
}

function GroupingActionButtons({row}) {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    const disableDeleteButton = row.indicators.length > 0;
    return (<HorizontalActionButtonLayout>
        <SubmitToTaxiiButton row={row}/>
        <EditIconOnlyButton to={editGroupingPage(row.grouping_id)}/>
        <DeleteIconOnlyButton onClick={handleRequestOpen}/>
        <DeleteModal open={open} onRequestClose={handleRequestClose}
                     disabled={disableDeleteButton}
                     disabledReason={<P>There is/are {row.indicators.length} indicators associated with this grouping.
                         <br/>
                         Delete them or associate them with another grouping before deleting this grouping.</P>}
                     deleteEndpointFunction={deleteGrouping}
                     deleteEndpointArgs={{groupingId: row.grouping_id}}
                     modalBodyContent={<P>Are you sure you want to delete this
                         grouping: <strong>{row.name} ({row.grouping_id})</strong>?</P>}/>
    </HorizontalActionButtonLayout>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Grouping ID", getCellContent: (row) => row.grouping_id},
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Description", getCellContent: (row) => row.description},
    {columnName: "No. Indicators", getCellContent: (row) => row.indicators.length},
]


const expansionFieldNameToCellValue = {
    "Grouping ID": (row) => row.grouping_id,
    "Name": (row) => row.name,
    "Description": (row) => row?.description,
    "Context": (row) => row.context,
    "Created At (UTC)": (row) => row.created,
    "Modified At (UTC)": (row) => row.modified,
    "Created By": (row) => row.created_by_ref,
    "Indicators": (row) => <ListOfLinks links={row.indicators.map(x => ({
        title: x,
        url: viewIndicator(x)
    }))
    }/>,
}

function renderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.grouping_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}
                                       rowActionPrimary={GroupingActionButtons}
                                       actionsColumnWidth={200}
    />
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function ListGroupings() {
    const [query, setQuery] = React.useState({});
    return (
        <>
            <Heading level={1}>Groupings</Heading>
            <div>
                <Button icon={<Plus/>} label="New Grouping" appearance="primary" to={NEW_GROUPING_PAGE}/>
            </div>
            <GroupingsSearchBar onQueryChange={setQuery}/>
            <PaginatedDataTable renderData={renderDataTable} fetchData={getGroupings} query={query} onError={(e) => {
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

layoutWithTheme(
    <AppContainer>
        <Router/>
    </AppContainer>
);
