import styled from "styled-components";
import Card from "@splunk/react-ui/Card";
import {variables} from "@splunk/themes";

export const StyledCard = styled(Card)`
    flex-basis: 100%;
    border-radius: 4px;
    &:hover {
        background-color: ${variables.backgroundColorHover};
    }
`;
export const CardContainer = styled.div`
    max-width: 1200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: ${variables.spacingSmall};
`;
