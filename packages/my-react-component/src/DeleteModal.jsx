import Modal from "@splunk/react-ui/Modal";
import React, {useState} from "react";
import DeleteButton from "./DeleteButton";
import Button from "@splunk/react-ui/Button";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import {deleteGrouping, deleteIndicator} from "./ApiClient";
import {VIEW_GROUPINGS_PAGE, VIEW_INDICATORS_PAGE} from "./urls";

export default function DeleteModal({
                                        open,
                                        disabled = false,
                                        disabledReason,
                                        onRequestClose,
                                        deleteEndpointFunction,
                                        deleteEndpointArgs,
                                        modalBodyContent,
                                        deletionSuccessUrl,
                                    }) {
    const [loading, setLoading] = useState(false);

    const callDeleteEndpoint = async () => {
        setLoading(true);
        await deleteEndpointFunction({
            ...deleteEndpointArgs,
            successHandler: (resp) => {
                console.log('Successfully deleted record:', resp);
                setLoading(false);
                onRequestClose();
                // TODO: find better way to trigger refresh of data
                window.location = deletionSuccessUrl ?? window.location;
            },
            errorHandler: (e) => {
                console.error(e);
                setLoading(false);
            }
        });
    }
    return (
        <Modal onRequestClose={onRequestClose} open={open}>
            <Modal.Header title={disabled ? "Cannot Delete" : "Confirm Deletion"} onRequestClose={onRequestClose}/>
            <Modal.Body>
                {!disabled && modalBodyContent}
                {disabled && <Message appearance="fill" type="error">
                    {disabledReason}
                </Message>}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    appearance="secondary"
                    onClick={onRequestClose}
                    label="Cancel"
                />

                {!disabled && <DeleteButton disabled={loading} submitting={loading} onClick={callDeleteEndpoint}/>}
            </Modal.Footer>
        </Modal>
    )
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
