import React from 'react';

import { DataTableV2 } from "@splunk/my-page/src/ExpandableDataTable";
import {AppContainer, createErrorToast} from "@splunk/my-page/src/AppContainer";
import Plus from '@splunk/react-icons/Plus';
import {getGroupings} from "@splunk/my-page/src/ApiClient";
import {editGroupingPage, GroupingIdLink, IdentityIdLink, NEW_GROUPING_PAGE} from "@splunk/my-page/src/urls";
import useModal from "@splunk/my-page/src/useModal";
import {DeleteGroupingModal} from "@splunk/my-page/src/DeleteModal";
import EditIconOnlyButton from "@splunk/my-page/src/buttons/EditIconOnlyButton";
import DeleteIconOnlyButton from "@splunk/my-page/src/buttons/DeleteIconOnlyButton";
import Tooltip from "@splunk/react-ui/Tooltip";
import {HorizontalActionButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import {GroupingsSearchBar} from "@splunk/my-page/src/SearchBar";
import {SubmitGroupingButton} from "@splunk/my-page/src/buttons/SubmitGroupingButton";
import {IndicatorCardLayout} from "@splunk/my-page/src/IndicatorCard";
import {SubmissionCardLayout} from "@splunk/my-page/src/SubmissionCard";
import PropTypes from "prop-types";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import BaseButton from "@splunk/my-page/src/BaseButton";
import {formatTimestampForDisplay} from "@splunk/my-page/src/date_utils";
import { PaginatedRecords } from '@splunk/my-page/src/PaginatedDataTable';
import {layoutWithTheme} from "../../common/theme";
import GroupingForm from "../../common/GroupingForm";
import {getUrlQueryParams} from "../../common/queryParams";
import {FIELD_LABEL_TLP_V2_MARKING} from "../../common/tlp";

function SubmitToTaxiiButton({row}) {
    const disabled = row.indicators.length === 0;
    const tooltipContent = disabled ? "No indicators to submit" : "Submit to TAXII Server";
    return (<Tooltip content={tooltipContent}>
        <SubmitGroupingButton noBorder noMargin groupingId={row.grouping_id} disabled={disabled}/>
    </Tooltip>);
}

SubmitToTaxiiButton.propTypes = {
    row: PropTypes.object.isRequired
}

function GroupingActionButtons({row}) {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (
        <HorizontalActionButtonLayout>
            <SubmitToTaxiiButton row={row} />
            <EditIconOnlyButton to={editGroupingPage(row.grouping_id)} />
            <DeleteIconOnlyButton onClick={handleRequestOpen} />
            <DeleteGroupingModal open={open} onRequestClose={handleRequestClose} grouping={row} />
        </HorizontalActionButtonLayout>
    );
}

GroupingActionButtons.propTypes = {
    row: PropTypes.object.isRequired
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
    [FIELD_LABEL_TLP_V2_MARKING]: row => row.tlp_v2_rating,
    "Confidence" : row => row.confidence,
    "Created At (UTC)": (row) => formatTimestampForDisplay(row.created),
    "Modified At (UTC)": (row) => formatTimestampForDisplay(row.modified),
    "Created By": (row) => <IdentityIdLink identityId={row.created_by_ref}/>,
    "Indicators": (row) => <IndicatorCardLayout groupingId={row.grouping_id}/>,
    "Submissions": (row) => <SubmissionCardLayout groupingId={row.grouping_id}/>,
}

function ListGroupings() {
    const [query, setQuery] = React.useState({});

    return (
        <>
            <PageHeadingContainer>
                <PageHeading level={1}>Groupings</PageHeading>
                <BaseButton
                    inline
                    icon={<Plus />}
                    label="New Grouping"
                    appearance="primary"
                    to={NEW_GROUPING_PAGE}
                />
            </PageHeadingContainer>
            <GroupingsSearchBar onQueryChange={setQuery} />
            <PaginatedRecords fetchData={getGroupings} onError={createErrorToast} query={query}>
                <DataTableV2
                    rowKeyFunction={(row) => row.grouping_id}
                    expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                    mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}
                    rowActionPrimary={GroupingActionButtons}
                    actionsColumnWidth={200}
                />
            </PaginatedRecords>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('grouping_id') && queryParams.has('action', 'edit')) {
        const groupingId = queryParams.get('grouping_id');
        return <GroupingForm groupingId={groupingId}/>
    }
    return (
        <ListGroupings/>
    );

}

layoutWithTheme(
    <AppContainer>
        <Router/>
    </AppContainer>
);
