import React from 'react';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import Button from "@splunk/react-ui/Button";
import {getUrlQueryParams} from "../../common/queryParams";
import GroupingForm from "../../common/GroupingForm";
import Heading from "@splunk/react-ui/Heading";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import Plus from '@splunk/react-icons/Plus';
import {getGroupings} from "@splunk/my-react-component/src/ApiClient";
import {editGroupingPage, GroupingIdLink, IdentityIdLink, NEW_GROUPING_PAGE} from "@splunk/my-react-component/src/urls";
import useModal from "@splunk/my-react-component/src/useModal";
import {DeleteGroupingModal} from "@splunk/my-react-component/src/DeleteModal";
import {layoutWithTheme} from "../../common/theme";
import EditIconOnlyButton from "@splunk/my-react-component/src/buttons/EditIconOnlyButton";
import DeleteIconOnlyButton from "@splunk/my-react-component/src/buttons/DeleteIconOnlyButton";
import Tooltip from "@splunk/react-ui/Tooltip";
import {HorizontalActionButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import {GroupingsSearchBar} from "@splunk/my-react-component/src/SearchBar";
import {SubmitGroupingButton} from "@splunk/my-react-component/src/SubmitGroupingButton";
import {IndicatorCardLayout} from "@splunk/my-react-component/src/IndicatorCard";
import {SubmissionCardLayout} from "@splunk/my-react-component/src/SubmissionCard";

function SubmitToTaxiiButton({row}) {
    const disabled = row.indicators.length === 0;
    const tooltipContent = disabled ? "No indicators to submit" : "Submit to TAXII Server";
    return (<Tooltip content={tooltipContent}>
        <SubmitGroupingButton noBorder noMargin groupingId={row.grouping_id} disabled={disabled}/>
    </Tooltip>);
}

function GroupingActionButtons({row}) {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<HorizontalActionButtonLayout>
        <SubmitToTaxiiButton row={row}/>
        <EditIconOnlyButton to={editGroupingPage(row.grouping_id)}/>
        <DeleteIconOnlyButton onClick={handleRequestOpen}/>
        <DeleteGroupingModal open={open} onRequestClose={handleRequestClose} grouping={row}/>
    </HorizontalActionButtonLayout>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Grouping ID", getCellContent: (row) => <GroupingIdLink groupingId={row.grouping_id}/>},
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "Description", getCellContent: (row) => row.description},
    {columnName: "No. Indicators", getCellContent: (row) => row.indicators.length},
]

const expansionFieldNameToCellValue = {
    "Grouping ID": (row) => <GroupingIdLink groupingId={row.grouping_id}/>,
    "Name": (row) => row.name,
    "Description": (row) => row?.description,
    "Context": (row) => row.context,
    "Created At (UTC)": (row) => row.created,
    "Modified At (UTC)": (row) => row.modified,
    "Created By": (row) => <IdentityIdLink identityId={row.created_by_ref}/>,
    "Indicators": (row) => <IndicatorCardLayout indicatorIds={row.indicators}/>,
    "Submissions" : (row) => <SubmissionCardLayout groupingId={row.grouping_id}/>,
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
    if (queryParams.has('grouping_id')) {
        const groupingId = queryParams.get('grouping_id');
        const readOnly = !queryParams.has('action', 'edit')
        return <GroupingForm readOnly={readOnly} groupingId={groupingId}/>
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
