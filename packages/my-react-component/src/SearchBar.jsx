import React, {useEffect} from 'react';
import Search from '@splunk/react-ui/Search';
import Magnifier from '@splunk/react-icons/Magnifier';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';

import styled from 'styled-components';
import {SearchFieldDropdown} from "./SearchFieldDropdown";
import BaseButton from "./BaseButton";
import Dropdown from "@splunk/react-ui/Dropdown";
import ControlGroup from "@splunk/react-ui/ControlGroup";
import {without} from "lodash";
import Text from "@splunk/react-ui/Text";
import Button from "@splunk/react-ui/Button";
import RadioList from '@splunk/react-ui/RadioList';
import P from "@splunk/react-ui/Paragraph";

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
    max-width: 150px;
`;

function LastUpdatedDropdown({onQueryChange, ...props}) {
    const toggle = <MyDropdownButton inline label="Last Modified" isMenu/>;

    const closeReasons = without(Dropdown.possibleCloseReasons, 'contentClick');
    const [selected, setSelected] = React.useState('');
    const [query, setQuery] = React.useState({});
    const SELECTION_ANY = '';
    const SELECTION_LAST_24_HOURS = 'last 24 hours';
    const onSelected = (e, {value}) => {
        setSelected(value);
        if (value === SELECTION_ANY) {
            setQuery({});
        }else if (value === SELECTION_LAST_24_HOURS) {
            setQuery({"$gt" : "value"});
        }
    }

    useEffect(() => {
        onQueryChange(query);
    }, [query]);

    return (<StyledDropdown toggle={toggle} retainFocus closeReasons={closeReasons} {...props}>
        <div style={{padding: 20, width: '300px'}}>
            <P>Selected: {selected}</P>
            <RadioList value={selected} onChange={onSelected}>
                <RadioList.Option value={SELECTION_ANY}>Any</RadioList.Option>
                <RadioList.Option value={SELECTION_LAST_24_HOURS}>Last 24 hours</RadioList.Option>
            </RadioList>
        </div>
    </StyledDropdown>);
}

// TODO: this is effectively a form, so can use react-hook-form to manage state
export const SearchBar = ({handleChange}) => {

    return (
        <SearchControlContainer>
            <Search
                onChange={handleChange}
                style={{flex: 8}}
            />
            <LastUpdatedDropdown onQueryChange={console.log}/>
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
            <BaseButton inline noMargin icon={<Magnifier/>} appearance="primary" label="Search"/>
        </SearchControlContainer>
    );
}

