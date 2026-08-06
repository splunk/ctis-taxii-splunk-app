import React, { useState } from 'react';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import { useValidateStixIdentities } from '@splunk/my-page/src/hooks/useValidateStixObjects';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { errorToText, postSubmitStixIdentitiesToImport } from '@splunk/my-page/src/ApiClient';
import ErrorMessage from '@splunk/my-page/src/ErrorMessage';
import Modal from '@splunk/react-ui/Modal';
import { StyledButton } from '@splunk/my-page/src/StyledButton';
import { VIEW_IDENTITIES_PAGE } from '@splunk/my-page/src/urls';
import Container from './container';
import { IdentitiesFileUploader } from './FileUploader';
import ValidationSummary from './ValidationSummary';
import { GenericSubmitSection } from './GenericSubmitSection';


const Form = styled.form`
    max-width: 1000px;
`;

function SuccessModal({ submissionWasSuccessful = false }) {
    return (<Modal open={submissionWasSuccessful}>
        <Modal.Header
            title="Successfully Imported Identities"
        />
        <Modal.Body>
            <StyledButton to={VIEW_IDENTITIES_PAGE} label="Go to Identities Page" />
        </Modal.Body>
    </Modal>);
}

SuccessModal.propTypes = {
    submissionWasSuccessful: PropTypes.bool.isRequired
};

function SubmissionForm({ identities, numExisting }) {
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const formMethods = useForm({
        mode: 'all',
        defaultValues: {}
    });

    const { handleSubmit } = formMethods;

    const responseSuccessHandler = (resp) => {
        console.log(resp);
        setSubmitting(false);
        setSubmitSuccess(true);
        setErrorMessage('');
    };

    const responseErrorHandler = async (error) => {
        console.error(error);
        setSubmitting(false);
        setSubmitSuccess(false);
        setErrorMessage(await errorToText(error));
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        console.log(data);

        await postSubmitStixIdentitiesToImport({
            identities,
            overwriteExisting: true,
            successHandler: responseSuccessHandler,
            errorHandler: responseErrorHandler
        });
    };

    return (<FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
            <GenericSubmitSection numExistingRecords={numExisting}
                                  numNewRecords={identities.length - numExisting}
                                  submitting={submitting} />
            {errorMessage && <ErrorMessage message={errorMessage} />}
            {submitSuccess && <SuccessModal submissionWasSuccessful={submitSuccess} />}
        </Form>
    </FormProvider>);
}

SubmissionForm.propTypes = {
    identities: PropTypes.array.isRequired,
    numExisting: PropTypes.number.isRequired
};

export default function ImportIdentitiesPage() {
    const [identities, setIdentities] = useState([]);
    const [filename, setFilename] = useState('');
    const { loading: validationLoading, validationError, existingIds } = useValidateStixIdentities(identities);
    return (<Container>
            <PageHeadingContainer>
                <PageHeading level={1}>Bulk Import Identities</PageHeading>
            </PageHeadingContainer>
            <IdentitiesFileUploader setIdentities={setIdentities} filename={filename} setFilename={setFilename} />
            <ValidationSummary
                stixObjects={identities}
                stixObjectType="identity"
                validationLoading={validationLoading}
                validationError={validationError}
                existingIds={existingIds}
            />
            {!validationLoading && validationError === null && identities.length > 0 &&
                <SubmissionForm identities={identities} numExisting={existingIds.length} />
            }
        </Container>
    );
}
