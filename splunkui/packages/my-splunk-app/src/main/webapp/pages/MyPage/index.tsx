import React, { useState } from 'react';
import layout from '@splunk/react-page/18';
import { getUserTheme } from '@splunk/splunk-utils/themes';
import Button from '@splunk/react-ui/Button';
import ControlGroup from '@splunk/react-ui/ControlGroup';

import Text from '@splunk/react-ui/Text';
import Heading from '@splunk/react-ui/Heading';


// @ts-ignore
import { postCreateIndicator } from '@splunk/my-page/src/ApiClient.js';
import { ContentContainer, StyledContainer } from './Styles';

function generateCreateIndicatorsPayload(groupingId: String, n: Number = 10) {
    const indicator = {
        indicator_value: '111.122.133.144',
        indicator_category: 'source_ipv4',
        stix_pattern:
            "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '111.122.133.144']",
        name: 'ipv4',
        description: 'ipv4',
    };
    // @ts-ignore
    const indicators = Array.from({ length: n }, () => ({ ...indicator }));
    return {
        grouping_id: groupingId,
        tlp_v2_rating: 'TLP:AMBER',
        confidence: 50,
        valid_from: '2026-06-17T04:37:37.000',
        indicators,
    };
}

const createIndicatorsForGrouping = async (groupingId: String) => {
    await postCreateIndicator(generateCreateIndicatorsPayload(groupingId, 10), (resp: Object) => {
        console.log(resp);
    });
};

function Component(){
    const [groupingId, setGroupingId] = useState<string>('');
    const handleTextChange = (e:any) => {
        setGroupingId(e.target.value);
    }

    return (
        <StyledContainer>
            <ContentContainer>
                <Heading level={1}>Internal Testing Tool</Heading>

                <Heading level={2}>Grouping</Heading>
                <ControlGroup label="Grouping ID">
                    <Text canClear value={groupingId} onChange={handleTextChange} />
                </ControlGroup>
                <Heading level={3}>Operations</Heading>
                <ControlGroup label="Add indicators to grouping">
                    <Button
                        label={`Add 10 indicators to grouping: ${groupingId}`}
                        disabled={!groupingId}
                        appearance="primary"
                        onClick={() => createIndicatorsForGrouping(groupingId)}
                    />
                </ControlGroup>
                <ControlGroup label="Purge indicators on grouping">
                    <Button
                        label={`Delete all indicators in grouping: ${groupingId}`}
                        disabled={!groupingId}
                        appearance="destructive"
                        onClick={() => console.warn('TODO')}
                    />
                </ControlGroup>
            </ContentContainer>
        </StyledContainer>
    );
}
getUserTheme()
    .then((theme) => {
        layout(
            <Component />,
            {
                theme,
            }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
