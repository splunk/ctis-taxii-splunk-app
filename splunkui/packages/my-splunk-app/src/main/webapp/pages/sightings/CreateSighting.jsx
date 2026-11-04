import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import React from 'react';
import PropTypes from 'prop-types';
import { usePageTitle } from '../../common/utils';
import {Form} from './form';

const PAGE_TITLE = 'New Sighting';
export default function CreateSighting({defaults}) {
    usePageTitle(PAGE_TITLE);

    return (
        <div>
            <PageHeadingContainer>
                <PageHeading level={1}>{PAGE_TITLE}</PageHeading>
            </PageHeadingContainer>
            <Form defaults={defaults}/>
        </div>
    );
}

CreateSighting.propTypes = {
    defaults: PropTypes.shape({
        tlpV2Rating: PropTypes.string,
        confidence: PropTypes.number,
    }),
};
