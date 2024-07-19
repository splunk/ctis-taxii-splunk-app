import React from "react";
import List from '@splunk/react-ui/List';
import styled from 'styled-components';

const StyledList = styled(List)`
    list-style-type: none;
    margin: 0;
    padding: 0;
`;

export function GroupingsLinks({groupings}) {
    return (<div><StyledList ordered>
        {groupings.map((grouping) => (
            <List.Item>
                <a key={grouping} href={`/groupings/${grouping}`}>{grouping}</a>
            </List.Item>
        ))}
    </StyledList></div>);
}
