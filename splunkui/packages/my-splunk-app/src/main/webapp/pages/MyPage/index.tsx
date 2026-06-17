import React, {useState} from 'react';
import layout from '@splunk/react-page/18';
import { getUserTheme } from '@splunk/splunk-utils/themes';
import Button from '@splunk/react-ui/Button';
import ControlGroup from '@splunk/react-ui/ControlGroup';

import Text from '@splunk/react-ui/Text';
import Heading from '@splunk/react-ui/Heading';


import { StyledContainer, ContentContainer } from './Styles';

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
                <ControlGroup label="Operations on grouping">
                    <Button
                        label={`Add 10 indicators to grouping ${groupingId}`}
                        disabled={!groupingId}
                        appearance="primary"
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
