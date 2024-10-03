import Modal from "@splunk/react-ui/Modal";
import React, {useState} from "react";
import Button from "@splunk/react-ui/Button";
import Message from "@splunk/react-ui/Message";
import BaseButton from "./BaseButton";

export default function ActionModal({
                                        open,
                                        disabled = false,
                                        disabledReason,
                                        titleConfirm,
                                        titleCannotProceed="Cannot Proceed",
                                        onRequestClose,
                                        actionButtonComponent = BaseButton,
                                        proceedActionButtonLabel,
                                        cancelButtonLabel = 'Cancel',
                                        endpointFunction,
                                        endpointFunctionArgs,
                                        modalBodyContent,
                                        actionSuccessUrl,
                                    }) {
    const [loading, setLoading] = useState(false);
    const ActionButton = actionButtonComponent;
    const callEndpoint = async () => {
        setLoading(true);
        await endpointFunction({
            ...endpointFunctionArgs,
            successHandler: (resp) => {
                console.log(resp);
                setLoading(false);
                onRequestClose();
                // Refresh the page or redirect to a new page
                window.location = actionSuccessUrl ?? window.location;
            },
            errorHandler: (e) => {
                console.error(e);
                setLoading(false);
            }
        });
    }
    return (
        <Modal onRequestClose={onRequestClose} open={open}>
            <Modal.Header title={disabled ? titleCannotProceed : titleConfirm} onRequestClose={onRequestClose}/>
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
                    label={cancelButtonLabel}
                />

                {!disabled &&
                    <ActionButton label={proceedActionButtonLabel} disabled={loading}
                                  submitting={loading} onClick={callEndpoint}/>}
            </Modal.Footer>
        </Modal>
    )
}

