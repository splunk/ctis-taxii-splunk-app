import styled from "styled-components";
import Button from "@splunk/react-ui/Button";

export const StyledButton = styled(Button)`
    flex-grow: 0;
    margin-left: ${props => (props.noMargin ? 0 : undefined)} !important;
`;
