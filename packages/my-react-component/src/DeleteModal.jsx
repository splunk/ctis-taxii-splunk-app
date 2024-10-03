import React from "react";
import DeleteButton from "./DeleteButton";
import P from "@splunk/react-ui/Paragraph";
import {deleteGrouping, deleteIndicator} from "./ApiClient";
import {VIEW_GROUPINGS_PAGE, VIEW_INDICATORS_PAGE} from "./urls";
import ActionModal from "./ActionModal";

export default function DeleteModal({
                                        open,
                                        disabled = false,
                                        disabledReason,
                                        titleConfirm = "Confirm Deletion",
                                        titleCannotProceed = "Cannot Delete",
                                        onRequestClose,
                                        proceedActionButtonLabel = "Delete",
                                        deleteEndpointFunction,
                                        deleteEndpointArgs,
                                        modalBodyContent,
                                        deletionSuccessUrl,
                                    }) {
    return <ActionModal open={open}
                        disabled={disabled}
                        disabledReason={disabledReason}
                        titleConfirm={titleConfirm}
                        titleCannotProceed={titleCannotProceed}
                        onRequestClose={onRequestClose}
                        actionButtonComponent={DeleteButton}
                        proceedActionButtonLabel={proceedActionButtonLabel}
                        cancelButtonLabel="Cancel"
                        endpointFunction={deleteEndpointFunction}
                        endpointFunctionArgs={deleteEndpointArgs}
                        modalBodyContent={modalBodyContent}
                        actionSuccessUrl={deletionSuccessUrl}/>
}

export function DeleteGroupingModal({open, onRequestClose, grouping}) {
    return <DeleteModal open={open}
                        onRequestClose={onRequestClose}
                        deletionSuccessUrl={VIEW_GROUPINGS_PAGE}
                        disabled={grouping.indicators.length > 0}
                        disabledReason={<P>There is/are {grouping.indicators.length} indicators associated with this
                            grouping.
                            <br/>
                            Delete them or associate them with another grouping before deleting this grouping.</P>}
                        deleteEndpointFunction={deleteGrouping}
                        deleteEndpointArgs={{groupingId: grouping.grouping_id}}
                        modalBodyContent={<P>Are you sure you want to delete this
                            grouping: <strong>{grouping.name} ({grouping.grouping_id})</strong>?</P>}/>
}

export function DeleteIndicatorModal({open, onRequestClose, indicator}) {
    return <DeleteModal open={open}
                        onRequestClose={onRequestClose}
                        deletionSuccessUrl={VIEW_INDICATORS_PAGE}
                        deleteEndpointFunction={deleteIndicator}
                        deleteEndpointArgs={{indicatorId: indicator.indicator_id}}
                        modalBodyContent={<P>Are you sure you want to delete this
                            indicator: <strong>{indicator.name} ({indicator.indicator_id})</strong>?</P>}/>
}

