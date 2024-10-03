import ActionModal from "./ActionModal";
import {cancelSubmission} from "./ApiClient";
import P from "@splunk/react-ui/Paragraph";
import React from "react";
import {CancelSubmissionButton} from "./buttons/CancelSubmissionButton";

export function CancelSubmissionModal({open, onRequestClose, submission}) {
    return <ActionModal open={open}
                        onRequestClose={onRequestClose}
                        endpointFunction={cancelSubmission}
                        endpointFunctionArgs={{submissionId: submission.submission_id}}
                        titleConfirm="Confirm Cancellation"
                        actionButtonComponent={CancelSubmissionButton}
                        proceedActionButtonLabel="Cancel Submission"
                        cancelButtonLabel="Keep Submission Scheduled"
                        modalBodyContent={<P>Are you sure you want to cancel this submission?</P>}/>
}
