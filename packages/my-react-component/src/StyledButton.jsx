import styled from "styled-components";
import Button from "@splunk/react-ui/Button";

export const StyledButton = styled(Button)`
    flex-grow: 1;
    margin: 0 !important; //Is there a better way to override the default left margin of 10px?
    max-width: 200px;
`;
