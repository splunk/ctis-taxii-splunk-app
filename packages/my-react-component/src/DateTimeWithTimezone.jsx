import React from 'react';
import Select from "@splunk/react-ui/Select";
import styled from "styled-components";

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    gap: 10px;
`;
const DatetimeInput = styled.input`
    flex-basis: 60%;
    flex-grow: 6;
`
const TimezoneDropdown = styled(Select)`
    flex-basis: 40%;
    flex-grow: 4;
`
const TIMEZONE_UTC_OFFSETS = [
    {'offset': '-12:00', 'timezones': []},
    {'offset': '-11:00', 'timezones': []},
    {'offset': '-10:00', 'timezones': []},
    {'offset': '-09:30', 'timezones': []},
    {'offset': '-09:00', 'timezones': []},
    {'offset': '-08:00', 'timezones': []},
    {'offset': '-07:00', 'timezones': []},
    {'offset': '-06:00', 'timezones': []},
    {'offset': '-05:00', 'timezones': []},
    {'offset': '-04:00', 'timezones': []},
    {'offset': '-03:30', 'timezones': []},
    {'offset': '-03:00', 'timezones': []},
    {'offset': '-02:00', 'timezones': []},
    {'offset': '-01:00', 'timezones': []},
    {'offset': '+00:00', 'timezones': []},
    {'offset': '+01:00', 'timezones': []},
    {'offset': '+02:00', 'timezones': []},
    {'offset': '+03:00', 'timezones': []},
    {'offset': '+03:30', 'timezones': []},
    {'offset': '+04:00', 'timezones': []},
    {'offset': '+04:30', 'timezones': []},
    {'offset': '+05:00', 'timezones': []},
    {'offset': '+05:30', 'timezones': []},
    {'offset': '+05:45', 'timezones': []},
    {'offset': '+06:00', 'timezones': []},
    {'offset': '+06:30', 'timezones': []},
    {'offset': '+07:00', 'timezones': []},
    {'offset': '+08:00', 'timezones': ["AWST"]},
    {'offset': '+08:45', 'timezones': ["ACWST"]},
    {'offset': '+09:00', 'timezones': []},
    {'offset': '+09:30', 'timezones': ["ACST"]},
    {'offset': '+10:00', 'timezones': ["AEST"]},
    {'offset': '+10:30', 'timezones': ["ACDT", "LHST"]},
    {'offset': '+11:00', 'timezones': ["AEDT", "LHDT"]},
    {'offset': '+12:00', 'timezones': []},
    {'offset': '+12:45', 'timezones': []},
    {'offset': '+13:00', 'timezones': []},
    {'offset': '+14:00', 'timezones': []}
]

function getTimeFromMins(totalMinutes) {
    // totalMinutes can be negative
    const absMinutes = Math.abs(totalMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    const sign = totalMinutes < 0 ? '-' : '+';
    const hoursString = hours.toString().padStart(2, '0');
    const minutesString = minutes.toString().padStart(2, '0');
    return `${sign}${hoursString}:${minutesString}`
}

// TODO: unit test this function
function getUserUTCOffset() {
    const userTimezoneOffsetInMinutes = new Date().getTimezoneOffset() * -1;
    return getTimeFromMins(userTimezoneOffsetInMinutes);
}

export const DateTimeWithTimezone = () => {
    return (
        <Wrapper>
            <DatetimeInput type="datetime-local"/>
            <TimezoneDropdown value={getUserUTCOffset()}>
                {TIMEZONE_UTC_OFFSETS.map(({offset, timezones}) => {
                    const timezoneString = timezones.length > 0 ? ` (${timezones.join(', ')})` : '';
                    return <Select.Option label={`UTC${offset}${timezoneString}`} value={offset}/>
                })}
            </TimezoneDropdown>
        </Wrapper>
    );
}

