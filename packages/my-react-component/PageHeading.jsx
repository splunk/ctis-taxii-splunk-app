import styled from 'styled-components';
import Heading from '@splunk/react-ui/Heading';
import {variables} from '@splunk/themes';

export const PageHeading = styled(Heading)`
    margin-top: 0;
    margin-bottom: 0;
`;

export const PageHeadingContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${variables.spacingSmall};
`;
