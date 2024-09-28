import React, {useEffect} from 'react';
import Search from '@splunk/react-ui/Search';
import Magnifier from '@splunk/react-icons/Magnifier';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';

import styled from 'styled-components';
import {SearchFieldDropdown} from "./SearchFieldDropdown";
import BaseButton from "./BaseButton";
import Dropdown from "@splunk/react-ui/Dropdown";
import {without} from "lodash";
import Button from "@splunk/react-ui/Button";
import RadioList from '@splunk/react-ui/RadioList';
import P from "@splunk/react-ui/Paragraph";
import moment from "moment";
import {dateToIsoStringWithoutTimezone} from "./date_utils";

const SearchControlContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
`;

const StyledButtonGroup = styled(ButtonGroup)`
    flex: 0.25 1 200px;
`;
const StyledDropdown = styled(Dropdown)`
`;
const MyDropdownButton = styled(Button)`
    //max-width: 250px;
    min-width: 150px;
    flex-grow: 0;
`;

function LastUpdatedDropdown({labelPrefix, fieldName, onQueryChange, ...props}) {
    const SELECTION_ANY = 'Any Time';
    const SELECTION_LAST_24_HOURS = 'Last 24 hours';

    const closeReasons = without(Dropdown.possibleCloseReasons, 'contentClick');
    const [selected, setSelected] = React.useState(SELECTION_ANY);
    const [query, setQuery] = React.useState({});
    const onSelected = (e, {value}) => {
        setSelected(value);
        if (value === SELECTION_ANY) {
            setQuery({});
        } else if (value === SELECTION_LAST_24_HOURS) {
            const nowMinus24Hours = moment().subtract(24, 'hours');
            setQuery({"$gt": dateToIsoStringWithoutTimezone(nowMinus24Hours.toDate())});
        }
    }

    useEffect(() => {
        // Check if object is empty (https://stackoverflow.com/a/20374145/23523267)
        if (Object.keys(query).length === 0) {
            onQueryChange({});
        } else {
            onQueryChange({[fieldName]: query});
        }
    }, [query])

    const toggle = <MyDropdownButton inline label={`${labelPrefix}: ${selected}`} isMenu/>;

    return (<StyledDropdown toggle={toggle} retainFocus closeReasons={closeReasons} {...props}>
        <div style={{padding: 20, width: '300px'}}>
            <P>Selected: {selected}</P>
            <RadioList value={selected} onChange={onSelected}>
                <RadioList.Option value={SELECTION_ANY}>Any Time</RadioList.Option>
                <RadioList.Option value={SELECTION_LAST_24_HOURS}>Last 24 hours</RadioList.Option>
            </RadioList>
        </div>
    </StyledDropdown>);
}

// TODO: this is effectively a form, so can use react-hook-form to manage state
export const SearchBar = ({onSubmit}) => {
    const [query, setQuery] = React.useState({});
    const [lastUpdatedQuery, setLastUpdatedQuery] = React.useState({});
    useEffect(() => {
        setQuery({'$and': [lastUpdatedQuery]})
    }, [lastUpdatedQuery]);

    return (
        <SearchControlContainer>
            <Search style={{flex: 8}}/>
            <LastUpdatedDropdown labelPrefix="Modified" fieldName={"modified"} onQueryChange={setLastUpdatedQuery}/>
            <SearchFieldDropdown defaultValue={""} prefixLabel="Grouping" options={[
                {label: "Any", value: ""},
                {label: "Grouping 1", value: "1"},
                {label: "Grouping 2", value: "2"},
                {label: "Grouping 3", value: "3"},
            ]}/>
            <SearchFieldDropdown defaultValue={""} prefixLabel="TLP Rating" options={[
                {label: "Any", value: ""},
                {label: "GREEN", value: "GREEN"},
                {label: "RED", value: "RED"},
                {label: "AMBER", value: "AMBER"},
                {label: "WHITE", value: "WHITE"},
            ]}/>
            <BaseButton inline noMargin icon={<Magnifier/>} appearance="primary" label="Search"
                        onClick={() => onSubmit(query)}/>
        </SearchControlContainer>
    );
}

