import React from 'react';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import Loader from "@splunk/my-react-component/src/Loader";
import Heading from "@splunk/react-ui/Heading";
import {SubmissionsSearchBar} from "@splunk/my-react-component/src/SearchBar";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {getSubmissions} from "@splunk/my-react-component/src/ApiClient";
import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import {SubmissionStatusChip} from "@splunk/my-react-component/src/SubmissionStatusChip";
import {HorizontalActionButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import {SubmitGroupingButton} from "@splunk/my-react-component/src/buttons/SubmitGroupingButton";
import {CancelSubmissionButton} from "@splunk/my-react-component/src/buttons/CancelSubmissionButton";
import useModal from "@splunk/my-react-component/src/useModal";

import {CancelSubmissionModal} from "@splunk/my-react-component/src/CancelSubmissionModal";
import {formatScheduledAt, SUBMISSION_MAPPING_OF_FIELD_NAME_TO_RENDER} from "./ViewSubmissionRecord";
import {Form} from "./form";
import {getUrlQueryParams} from "../../common/queryParams";
import {layoutWithTheme} from "../../common/theme";

const mappingOfColumnNameToCellValue = [
    {columnName: "Grouping ID", getCellContent: (row) => row.submission_id},
    {columnName: "Scheduled/Sent At (UTC)", getCellContent: (row) => formatScheduledAt(row.scheduled_at)},
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

function RenderDataTable({records, loading, error}) {
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.submission_id}
                                       expansionRowFieldNameToCellValue={SUBMISSION_MAPPING_OF_FIELD_NAME_TO_RENDER}
                                       mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}
                                       rowActionPrimary={RowActionPrimary}
    />
    return <Loader error={error} loading={loading}>
        {table}
    </Loader>
}

function ListSubmissions() {
    const [query, setQuery] = React.useState({});
    return (
        <>
            <Heading level={1}>Submissions</Heading>
            <SubmissionsSearchBar onQueryChange={setQuery}/>
            <PaginatedDataTable renderData={RenderDataTable} fetchData={getSubmissions} sort="scheduled_at:-1"
                                query={query} onError={(e) => {
                createErrorToast(e);
            }}/>
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
