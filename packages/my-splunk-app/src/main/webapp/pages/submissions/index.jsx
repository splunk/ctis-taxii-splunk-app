import React, {useEffect, useMemo, useState} from 'react';
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";
import {layoutWithTheme} from "../../common/theme";
import {
    getGrouping,
    getTaxiiConfigs,
    listTaxiiCollections,
    useGetRecord
} from "@splunk/my-react-component/src/ApiClient";
import Loader from "@splunk/my-react-component/src/Loader";
import {FormProvider, useForm} from "react-hook-form";
import styled from "styled-components";
import {GroupingId, TaxiiCollectionId, TaxiiConfigField} from "../../common/submission_form/fields";
import SubmitButton from "@splunk/my-react-component/src/SubmitButton";
import {CustomControlGroup} from "@splunk/my-react-component/src/CustomControlGroup";
import {HorizontalButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";
import {getUrlQueryParams} from "../../common/queryParams";
import CollapsiblePanel from "@splunk/react-ui/CollapsiblePanel";

const FIELD_TAXII_CONFIG_NAME = 'taxii_config_name';
const FIELD_TAXII_COLLECTION_ID = 'taxii_collection_id';
const FIELD_GROUPING_ID = 'grouping_id';

const StyledForm = styled.form`
    max-width: 1000px;
`;

function collectionToOption(collection) {
    let label = `${collection.title} (${collection.id})`;
    if (collection.can_write === false) {
        label += " [Cannot Write]";
    }
    return {
        label: label,
        value: collection.id,
        disabled: collection.can_write === false
    }
}

function useTaxiiCollections({selectedTaxiiConfig}) {
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        console.log("Selected TAXII Config:", selectedTaxiiConfig);
        if (selectedTaxiiConfig) {
            setLoading(true);
            listTaxiiCollections({
                taxiiConfigName: selectedTaxiiConfig,
                successHandler: (resp) => {
                    console.log("Collections:", resp);
                    const options = resp.collections.map(collection => collectionToOption(collection));
                    setCollectionOptions(options);
                    setLoading(false);
                },
                errorHandler: (error) => {
                    console.error("Error getting collections", error);
                    setLoading(false);
                }
            }).then();
        }
    }, [selectedTaxiiConfig]);
    return {collectionOptions, loading};

}

function Form({groupingId}) {
    const methods = useForm({
        mode: 'all',
        defaultValues: {
            [FIELD_TAXII_CONFIG_NAME]: null,
            [FIELD_TAXII_COLLECTION_ID]: null,
            [FIELD_GROUPING_ID]: groupingId
        }
    });
    const {watch, register, trigger, handleSubmit, formState, control} = methods;

    const {loading: loadingGrouping, record: groupingRecord, error: groupingError} = useGetRecord({
        restGetFunction: getGrouping,
        restFunctionQueryArgs: {groupingId}
    });

    const {loading: loadingTaxiiConfigs, record: taxiiConfig, error: taxiiConfigError} = useGetRecord({
        restGetFunction: getTaxiiConfigs,
        restFunctionQueryArgs: {}
    })
    const loading = loadingGrouping || loadingTaxiiConfigs;
    const error = groupingError || taxiiConfigError;
    const taxiiConfigEntries = taxiiConfig?.entry || [];
    const taxiiConfigOptions = taxiiConfigEntries.map(entry => ({label: entry.name, value: entry.name}));

    register(FIELD_GROUPING_ID, {required: 'Grouping ID is required'});
    register(FIELD_TAXII_CONFIG_NAME, {required: 'TAXII Config is required'});
    register(FIELD_TAXII_COLLECTION_ID, {required: 'TAXII Collection is required'});

    const selectedTaxiiConfig = watch(FIELD_TAXII_CONFIG_NAME);
    const {loading: collectionOptionsLoading, collectionOptions} = useTaxiiCollections({selectedTaxiiConfig});

    const [submitSuccess, setSubmitSuccess] = useState(false);
    const submitButtonDisabled = useMemo(() => Object.keys(formState.errors).length > 0 || formState.isSubmitting || submitSuccess,
        [submitSuccess, formState]);

    const onSubmit = async (data) => {
        debugger;
        console.log(data);
        await trigger();
    }

    return (
        <FormProvider {...methods}>
            <StyledForm name="SubmitGrouping" onSubmit={handleSubmit(onSubmit)}>
                <Heading level={1}>Submit Grouping as STIX Bundle to TAXII Server</Heading>
                <Loader error={error} loading={loading}>
                    <section>
                        <GroupingId fieldName={FIELD_GROUPING_ID}/>
                        <TaxiiConfigField fieldName={FIELD_TAXII_CONFIG_NAME} options={taxiiConfigOptions}/>
                        <TaxiiCollectionId loading={collectionOptionsLoading} disabled={selectedTaxiiConfig === null}
                                           fieldName={FIELD_TAXII_COLLECTION_ID} options={collectionOptions}/>
                    </section>
                    <section>
                        <CustomControlGroup>
                            <CollapsiblePanel title="Preview of STIX Bundle JSON">
                                <code>
                                    TODO: Fetch STIX Bundle JSON from endpoint
                                </code>
                            </CollapsiblePanel>
                        </CustomControlGroup>
                    </section>
                    <CustomControlGroup>
                        <HorizontalButtonLayout>
                            <SubmitButton disabled={submitButtonDisabled} submitting={formState.isSubmitting}/>
                        </HorizontalButtonLayout>
                    </CustomControlGroup>
                </Loader>
            </StyledForm>
        </FormProvider>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('grouping_id') && queryParams.has('action', 'submit')) {
        const groupingId = queryParams.get('grouping_id');
        return <Form groupingId={groupingId}/>
    } else {
        return <Loader error={'Invalid URL'} loading={false}/>
    }
}

function MyPage() {
    return <AppContainer><Router/></AppContainer>
}

layoutWithTheme(<MyPage/>);
