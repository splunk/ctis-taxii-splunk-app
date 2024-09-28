import Select from "@splunk/react-ui/Select";
import React from "react";
import styled from "styled-components";

const StyledSelect = styled(Select)`
    margin-left: 0 !important;
    max-width: 600px;
`;

export const SearchFieldDropdown = ({options, fieldName, onQueryChange, defaultValue = "", ...props}) => {
    const [selectedValue, setSelectedValue] = React.useState('');
    const handleChange = (e, {value}) => {
        console.log("Selected:", value);
        setSelectedValue(value);
        if (value) {
            onQueryChange({
                [fieldName]: value
            });
        } else {
            onQueryChange({});
        }
    }
    return (
        <StyledSelect {...props} value={selectedValue} defaultValue={defaultValue} onChange={handleChange}>
            <Select.Option label="Any" value=""/>
            {
                options.map((option) => (
                    <Select.Option label={option.label} value={option.value}/>
                ))
            }
        </StyledSelect>
    )
}
