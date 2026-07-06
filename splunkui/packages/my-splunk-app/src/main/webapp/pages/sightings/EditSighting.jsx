import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import React from 'react';
import PropTypes from 'prop-types';
import Message from '@splunk/react-ui/Message';
import { usePageTitle } from '../../common/utils';
import { EditSightingForm } from './form';

export default function EditSighting({ sightingId }) {
    const PAGE_TITLE = `Edit Sighting ${sightingId}`;
    usePageTitle(PAGE_TITLE);
    if (!sightingId) {
        return (
            <Message appearance="fill" type="error">
                Missing query param for sighting_id
            </Message>
        );
    }
    return (
        <div>
            <PageHeadingContainer>
                <PageHeading level={1}>{PAGE_TITLE}</PageHeading>
            </PageHeadingContainer>
            <EditSightingForm existingSightingId={sightingId} />
        </div>
    );
}
EditSighting.propTypes = {
    sightingId: PropTypes.string.isRequired,
};
