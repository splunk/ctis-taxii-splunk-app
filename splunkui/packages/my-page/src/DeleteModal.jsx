import React from "react";
import P from "@splunk/react-ui/Paragraph";
import PropTypes from 'prop-types';
import DeleteButton from "./DeleteButton";
import { deleteGrouping, deleteIndicator, deleteSighting } from './ApiClient';
import { VIEW_GROUPINGS_PAGE, VIEW_INDICATORS_PAGE, VIEW_SIGHTINGS_PAGE } from './urls';
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

export function DeleteSightingModal({open, onRequestClose, sighting}){
    return <DeleteModal open={open}
        onRequestClose={onRequestClose}
                        deletionSuccessUrl={VIEW_SIGHTINGS_PAGE}
                        deleteEndpointFunction={deleteSighting}
                        deleteEndpointArgs={{sightingId: sighting.sighting_id}}
                        modalBodyContent={<P>Are you sure you want to delete this sighting: <strong>{sighting.sighting_id}</strong>?</P>}
    />
}
DeleteSightingModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    sighting: PropTypes.object.isRequired,
}

