import styled from 'styled-components';
import { variables, mixins } from '@splunk/themes';

export const StyledContainer = styled.div`
    ${mixins.reset('inline')};
    display: block;
    font-size: ${variables.fontSizeLarge};
    line-height: 200%;
    margin: ${variables.spacingXXLarge} ${variables.spacingXXLarge};
`;

export const ContentContainer = styled.div`
    max-width: 800px;

    & > * {
        margin-top: 10px;
        margin-bottom: 10px;
    }
`;
