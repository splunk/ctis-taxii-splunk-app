import {getAllGroupings} from "@splunk/my-react-component/src/ApiClient";
import React, {useEffect, useMemo, useState} from "react";
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import {useFormInputProps} from "../formInputProps";
import GroupingSelectControlGroup from "@splunk/my-react-component/src/controls/GroupingSelectControlGroup";

export const useListGroupings = () => {
    const [groupings, setGroupings] = useState([]);
    const [loading, setLoading] = useState(true);
    const optionsGroupings = useMemo(() => groupings.map((grouping) => ({
        label: `${grouping.name} (${grouping.grouping_id})`,
        value: grouping.grouping_id
    })), [groupings]);
    useEffect(() => {
        setLoading(true);
        getAllGroupings((resp) => {
            console.log("Response json:", resp);
            setGroupings(resp);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setGroupings([]);
            setLoading(false);
        }).then();
    }, []);
    return {groupings, optionsGroupings, loading};
}

// TODO: remove unused function
export function GroupingIdField({fieldName, ...props}) {
    const {optionsGroupings, loading} = useListGroupings();
    const label = "Grouping ID";
    return <SelectControlGroup label={label} loading={loading}
                               options={optionsGroupings} {...useFormInputProps(fieldName)} {...props}/>
}

export function GroupingIdFieldV2({fieldName, ...props}) {
    return <GroupingSelectControlGroup label="Grouping" {...useFormInputProps(fieldName)} {...props}/>
}
