import React from 'react';
import PropTypes from "prop-types";
import {AppContainer, createErrorToast} from "@splunk/my-page/src/AppContainer";
import {SubmissionsSearchBar} from "@splunk/my-page/src/SearchBar";
import {getSubmissions} from "@splunk/my-page/src/ApiClient";
import { DataTableV2 } from "@splunk/my-page/src/ExpandableDataTable";
import {SubmissionStatusChip} from "@splunk/my-page/src/SubmissionStatusChip";
import {HorizontalActionButtonLayout} from "@splunk/my-page/src/HorizontalButtonLayout";
import {SubmitGroupingButton} from "@splunk/my-page/src/buttons/SubmitGroupingButton";
import {CancelSubmissionButton} from "@splunk/my-page/src/buttons/CancelSubmissionButton";
import useModal from "@splunk/my-page/src/useModal";

import {CancelSubmissionModal} from "@splunk/my-page/src/CancelSubmissionModal";
import {PageHeading, PageHeadingContainer} from "@splunk/my-page/src/PageHeading";
import {formatTimestampForDisplay} from "@splunk/my-page/src/date_utils";
import { PaginatedRecords } from '@splunk/my-page/src/PaginatedDataTable';
import {SUBMISSION_MAPPING_OF_FIELD_NAME_TO_RENDER} from "./ViewSubmissionRecord";
import {Form} from "./form";
import {getUrlQueryParams} from "../../common/queryParams";
import {layoutWithTheme} from "../../common/theme";
import {usePageTitle} from "../../common/utils";

const mappingOfColumnNameToCellValue = [
    {columnName: "Grouping ID", getCellContent: (row) => row.grouping_id},
    {columnName: "Collection ID", getCellContent: (row) => row.collection_id},
    {columnName: "TAXII Config Name", getCellContent: (row) => row.taxii_config_name},
    {columnName: "Scheduled/Sent At (UTC)", getCellContent: (row) => formatTimestampForDisplay(row.scheduled_at)},
    {columnName: "Status", getCellContent: (row) => <SubmissionStatusChip status={row.status}/>},
]

const RowActionPrimary = ({row}) => {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<HorizontalActionButtonLayout>
        {row.status === "FAILED" &&
            <SubmitGroupingButton inline={false} label="Retry Submission" groupingId={row.grouping_id}/>}
        {row.status === "SCHEDULED" && <CancelSubmissionButton inline={false} onClick={handleRequestOpen}/>}
        <CancelSubmissionModal open={open} onRequestClose={handleRequestClose} submission={row}/>
    </HorizontalActionButtonLayout>);
}
RowActionPrimary.propTypes = {
    row: PropTypes.object.isRequired
}

function ListSubmissions() {
    const [query, setQuery] = React.useState({});
    const title = "Submissions";
    usePageTitle(title);
    return (
        <>
            <PageHeadingContainer>
                <PageHeading level={1}>Submissions</PageHeading>
            </PageHeadingContainer>
            <SubmissionsSearchBar onQueryChange={setQuery}/>
            <PaginatedRecords fetchData={getSubmissions} onError={createErrorToast} query={query}>
                <DataTableV2 rowKeyFunction={row => row.submission_id}
                             expansionRowFieldNameToCellValue={SUBMISSION_MAPPING_OF_FIELD_NAME_TO_RENDER}
                             mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}
                             rowActionPrimary={RowActionPrimary} />
            </PaginatedRecords>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('grouping_id') && queryParams.has('action', 'submit')) {
        const groupingId = queryParams.get('grouping_id');
        return <Form groupingId={groupingId}/>
    }
    return <ListSubmissions/>;

}

function MyPage() {
    return <AppContainer><Router/></AppContainer>
}

layoutWithTheme(<MyPage/>);
