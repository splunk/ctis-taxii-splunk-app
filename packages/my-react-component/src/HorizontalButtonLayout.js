import styled from "styled-components";
import {variables} from "@splunk/themes";

export const HorizontalButtonLayout = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: ${props => props.justifyContent || "flex-end"};
    gap: ${props => (props.gap ?? 0)};
    width: 100%;
`
export const HorizontalActionButtonLayout = styled(HorizontalButtonLayout)`
    gap: ${variables.spacingXSmall};
`;
