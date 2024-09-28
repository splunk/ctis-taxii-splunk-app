import styled from "styled-components";
import moment from "moment/moment";
import React, {useEffect, useState} from "react";
import {dateToIsoStringWithoutTimezone} from "./date_utils";
import {without} from "lodash";
import Dropdown from "@splunk/react-ui/Dropdown";
import RadioList from "@splunk/react-ui/RadioList";
import {DatetimeInput} from "./DateTimeControlGroup";
import Button from "@splunk/react-ui/Button";

const DateRangeLayout = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
`;

const MyDropdownButton = styled(Button)`
    min-width: 150px;
    flex-grow: 0;
`;
function useDateRangePicker() {
    const now = moment().milliseconds(0).toDate();
    const twoDaysAgo = moment().milliseconds(0).subtract(2, 'days').toDate();

    const [startDate, setStartDate] = useState(twoDaysAgo);
    const startDateIsoString = dateToIsoStringWithoutTimezone(startDate);

    const [endDate, setEndDate] = useState(now);
    const endDateIsoString = dateToIsoStringWithoutTimezone(endDate);

    const handleStartDateChange = (e) => {
        const val = e.target.value;
        console.log(JSON.stringify(val));
        if (!val) {
            setStartDate(twoDaysAgo);
        } else {
            setStartDate(moment.utc(val));
        }
    }
    const handleEndDateChange = (e) => {
        const val = e.target.value;
        console.log(JSON.stringify(val));
        if (!val) {
            setEndDate(now);
        } else {
            setEndDate(moment.utc(val));
        }
    }
    useEffect(() => {
        if (endDate < startDate) {
            setEndDate(startDate);
        }
    }, [startDate, endDate]);
    return {startDateIsoString, endDateIsoString, handleStartDateChange, handleEndDateChange};
}

export function DatetimeRangePicker({labelPrefix, fieldName, onQueryChange, ...props}) {
    const SELECTION_ANY = 'Any Time';
    const SELECTION_LAST_24_HOURS = 'In the last 24 hours';
    const SELECTION_LAST_7_DAYS = 'In the last 7 days';
    const SELECTION_LAST_30_DAYS = 'In the last 30 days';
    const SELECTION_DATE_RANGE = 'Between Dates (UTC)';

    const closeReasons = without(Dropdown.possibleCloseReasons, 'contentClick');
    const [selected, setSelected] = React.useState(SELECTION_ANY);
    const showDateRange = selected === SELECTION_DATE_RANGE;
    const [query, setQuery] = React.useState({});
    const {startDateIsoString, endDateIsoString, handleStartDateChange, handleEndDateChange} = useDateRangePicker();

    const onSelected = (e, {value}) => {
        setSelected(value);
        if (value === SELECTION_ANY) {
            setQuery({});
        } else if (value === SELECTION_LAST_24_HOURS) {
            const nowMinus24Hours = moment().subtract(24, 'hours');
            setQuery({"$gt": dateToIsoStringWithoutTimezone(nowMinus24Hours.toDate())});
        } else if (value === SELECTION_LAST_7_DAYS) {
            const nowMinus7Days = moment().subtract(7, 'days');
            setQuery({"$gt": dateToIsoStringWithoutTimezone(nowMinus7Days.toDate())});
        } else if (value === SELECTION_LAST_30_DAYS) {
            const nowMinus30Days = moment().subtract(30, 'days');
            setQuery({"$gt": dateToIsoStringWithoutTimezone(nowMinus30Days.toDate())});
        }
    }
    useEffect(() => {
        if (selected === SELECTION_DATE_RANGE) {
            setQuery({
                "$gte": startDateIsoString,
                "$lte": endDateIsoString
            });
        }
    }, [selected, startDateIsoString, endDateIsoString]);

    useEffect(() => {
        // Check if object is empty (https://stackoverflow.com/a/20374145/23523267)
        if (Object.keys(query).length === 0) {
            onQueryChange({});
        } else {
            onQueryChange({[fieldName]: query});
        }
    }, [query])

    const toggle = <MyDropdownButton inline label={`${labelPrefix}: ${selected}`} isMenu/>;

    return (<Dropdown toggle={toggle} retainFocus closeReasons={closeReasons} {...props}>
        <div style={{padding: 20}}>
            <RadioList value={selected} onChange={onSelected}>
                <RadioList.Option value={SELECTION_ANY}>{SELECTION_ANY}</RadioList.Option>
                <RadioList.Option value={SELECTION_LAST_24_HOURS}>{SELECTION_LAST_24_HOURS}</RadioList.Option>
                <RadioList.Option value={SELECTION_LAST_7_DAYS}>{SELECTION_LAST_7_DAYS}</RadioList.Option>
                <RadioList.Option value={SELECTION_LAST_30_DAYS}>{SELECTION_LAST_30_DAYS}</RadioList.Option>
                <RadioList.Option value={SELECTION_DATE_RANGE}>{SELECTION_DATE_RANGE}</RadioList.Option>
                {showDateRange && <DateRangeLayout>
                    <DatetimeInput type="datetime-local" value={startDateIsoString} onChange={handleStartDateChange}/>
                    <span>and</span>
                    <DatetimeInput type="datetime-local" value={endDateIsoString} onChange={handleEndDateChange}/>
                </DateRangeLayout>}
            </RadioList>
        </div>
    </Dropdown>);
}
