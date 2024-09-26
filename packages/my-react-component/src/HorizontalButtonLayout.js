import styled from "styled-components";

export const HorizontalButtonLayout = styled.div`
    display: flex;
    justify-content: ${props => props.justifyContent || "flex-end"};
    gap: ${props => (props.gap ?? 0)};
    width: 100%;
`
