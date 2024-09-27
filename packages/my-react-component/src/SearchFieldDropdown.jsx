import Select from "@splunk/react-ui/Select";
import React from "react";
import styled from "styled-components";

const StyledSelect = styled(Select)`
    margin-left: 0 !important;
`;

export const SearchFieldDropdown = ({ options, ...props }) => {
    return (
        <StyledSelect {...props}>
            {
                options.map((option) => (
                    <Select.Option label={option.label} value={option.value}/>
                ))
            }
        </StyledSelect>
    )
}
