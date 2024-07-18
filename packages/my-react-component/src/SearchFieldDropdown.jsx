import Select from "@splunk/react-ui/Select";
import React from "react";

export const SearchFieldDropdown = ({ options }) => {
    return (
        <Select defaultValue="1">
            {
                options.map((option) => (
                    <Select.Option label={option.label} value={option.value}/>
                ))
            }
        </Select>
    )
}
