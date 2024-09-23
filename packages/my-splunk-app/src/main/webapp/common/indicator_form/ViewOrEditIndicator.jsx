import React from "react";
import Heading from "@splunk/react-ui/Heading";
import {getIndicator, useGetRecord} from "@splunk/my-react-component/src/ApiClient";

export default function ViewOrEditIndicator({indicatorId, editMode}){
    const title = editMode ? `Edit Indicator ${indicatorId}` : `View Indicator ${indicatorId}`;
    const {record, loading, error} = useGetRecord({
        restGetFunction: getIndicator,
        restFunctionQueryArgs: {indicatorId},
    })
    return (<div>
        <Heading level={1}>{title}</Heading>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        <code>
            {JSON.stringify(record)}
        </code>
    </div>)

}
