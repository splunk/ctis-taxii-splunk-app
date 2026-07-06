import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import React from 'react';
import { usePageTitle } from '../../common/utils';
import {Form} from './form';

const PAGE_TITLE = 'New Sighting';
export default function CreateSighting() {
    usePageTitle(PAGE_TITLE);

    return (
        <div>
            <PageHeadingContainer>
                <PageHeading level={1}>{PAGE_TITLE}</PageHeading>
            </PageHeadingContainer>
            <Form/>
        </div>
    );
}
