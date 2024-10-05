import React from "react";
import PropTypes from "prop-types";
import Link from "@splunk/react-ui/Link";
import {CustomControlGroup} from "../CustomControlGroup";
import SearchableSelect from "../search/SearchableSelect";
import {getGroupings} from "../ApiClient";
import {NEW_GROUPING_PAGE} from "../urls";

export default function GroupingSelectControlGroup({
                                                       label,
                                                       value,
                                                       onChange,
                                                       error,
                                                       readOnly = false,
                                                       disabled = false,
                                                   }) {
    const helpContent = <Link openInNewContext to={NEW_GROUPING_PAGE}>Create New Grouping</Link>;
    return (
        <CustomControlGroup label={label} help={helpContent} error={error} value={value} readOnly={readOnly}>
            <SearchableSelect
                error={error}
                showAnyOption={false}
                searchableFields={['name', 'grouping_id']}
                onChange={onChange}
                disabled={disabled}
                placeholder="Grouping..."
                restGetFunction={getGroupings}
                queryFilterField="grouping_id"
                value={value}
                selectOptionLabelFunction={(record) => `${record.name} (${record.grouping_id})`}
            />
        </CustomControlGroup>
    );
}

GroupingSelectControlGroup.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.string,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
}
