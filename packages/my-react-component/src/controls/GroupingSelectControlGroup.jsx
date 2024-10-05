import React from "react";
import {CustomControlGroup} from "../CustomControlGroup";
import SearchableSelect from "../search/SearchableSelect";
import {getGroupings} from "../ApiClient";

export default function GroupingSelectControlGroup({
                                                       label,
                                                       value,
                                                       onChange,
                                                       error,
                                                       help,
                                                       readOnly = false,
                                                       disabled = false,
                                                   }) {
    return (
        <CustomControlGroup label={label} help={help} error={error} value={value} readOnly={readOnly}>
            <SearchableSelect
                error={error}
                showAnyOption={false}
                searchableFields={['name', 'grouping_id']}
                onChange={onChange}
                disabled={disabled}
                placeholder={"Grouping..."}
                restGetFunction={getGroupings}
                queryFilterField={"grouping_id"}
                value={value}
                selectOptionLabelFunction={(record) => `${record.name} (${record.grouping_id})`}
            />
        </CustomControlGroup>
    );
}
