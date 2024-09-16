import Modal from "@splunk/react-ui/Modal";
import React, {useState} from "react";
import DeleteButton from "./DeleteButton";
import Button from "@splunk/react-ui/Button";

export default function DeleteModal({open, onRequestClose, deleteEndpointFunction, deleteEndpointArgs, modalBodyContent}) {
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
                window.location = window.location;
            },
            errorHandler: (e) => {
                console.error(e);
                setLoading(false);
            }
        });
    }
    return (
        <Modal onRequestClose={onRequestClose} open={open}>
            <Modal.Header title="Confirm Deletion" onRequestClose={onRequestClose}/>
            <Modal.Body>
                {modalBodyContent}
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
