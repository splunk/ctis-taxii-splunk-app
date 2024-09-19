import React from 'react';
import SelectControlGroup from "@splunk/my-react-component/src/SelectControlGroup";
import NumberControlGroup from "@splunk/my-react-component/src/NumberControlGroup";
import DatetimeControlGroup from "@splunk/my-react-component/src/DateTimeControlGroup";

export function GroupingIdField({...props}) {
    return <SelectControlGroup label="Grouping ID" {...props}/>
}

export function ConfidenceField({...props}) {
    return <NumberControlGroup label="Confidence" max={100} min={0} step={1} {...props}/>
}

export function TLPv1RatingField({...props}) {
    return <SelectControlGroup label="TLP v1.0 Rating" options={[
        {label: "RED", value: "RED"},
        {label: "AMBER", value: "AMBER"},
        {label: "GREEN", value: "GREEN"},
        {label: "WHITE", value: "WHITE"}
    ]}
        {...props}
    />
}
export function ValidFromField({...props}) {
    return <DatetimeControlGroup label="Valid From (UTC)" {...props}/>
}

