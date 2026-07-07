import React from 'react';
import { getIndicators } from '@splunk/my-page/src/ApiClient';
import SearchableSelectV2 from '@splunk/my-page/src/search/SearchableSelectV2';
import {useForm} from 'react-hook-form';

export function DropdownTest() {
    const {setValue, register, watch} = useForm({
        mode: 'all',
    })
    register('indicator_id', {required: 'indicator_id is required', value: 'indicator--7bd7c959-936a-4e44-a629-bfd898e9a979'});

    const formValues = watch();
    const formIndicatorId = watch('indicator_id');

    return (<div>
        Testing Dropdown

        <div>
            <div>
                <code>{JSON.stringify(formValues)}</code>
            </div>

            <SearchableSelectV2 searchableFields={['name', 'indicator_id']}
                                primaryKey='indicator_id'
                                recordToOptionLabel={(r) => `${r.name} (${r.indicator_id})`}
                                restGetFunction={getIndicators}
                                selectedValue={formIndicatorId}
                                setSelectedValue={val => setValue('indicator_id', val)}
                                />
        </div>
    </div>);
}
