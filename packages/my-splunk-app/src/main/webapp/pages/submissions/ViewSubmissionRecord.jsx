import {SubmissionStatusChip} from "@splunk/my-react-component/src/SubmissionStatusChip";
import React from "react";
import Code from "@splunk/react-ui/Code";
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import {GroupingIdLink} from "@splunk/my-react-component/src/urls";
import {formatTimestampForDisplay} from "@splunk/my-react-component/src/date_utils";

const NO_CONTENT = "None";
export const SUBMISSION_MAPPING_OF_FIELD_NAME_TO_RENDER = {
    "Status": (record) => <SubmissionStatusChip status={record.status}/>,
    "Internal Submission ID": (record) => record.submission_id,
    "Grouping ID": (record) => <GroupingIdLink groupingId={record.grouping_id}/>,
    "Sent/Scheduled At (UTC)": (record) => formatTimestampForDisplay(record.scheduled_at),
    "TAXII Config Name": (record) => record.taxii_config_name,
    "TAXII Collection ID": (record) => record.collection_id,
    "Bundle JSON Sent": (record) => {
        if (record.bundle_json_sent === null) {
            return NO_CONTENT;
        }
        const formattedCode = JSON.stringify(JSON.parse(record.bundle_json_sent), null, 2);
        return <CollapsiblePanel title="Show JSON" defaultOpen={false}>
            <Code language='json' value={formattedCode}/>
        </CollapsiblePanel>

    },
    "Response from TAXII Server": (record) => {
        if (record.response_json === null) {
            return NO_CONTENT;
        }
        return <CollapsiblePanel defaultOpen={false} title="Show Response">
            <code>{record.response_json ?? NO_CONTENT}</code>
        </CollapsiblePanel>;

    },
    "Error Message": (record) => record.error_message ? <code>{record.error_message}</code> : NO_CONTENT,
}

