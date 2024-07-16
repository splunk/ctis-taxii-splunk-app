// https://splunkui.splunk.com/Packages/react-ui/Search
import React, {useState} from 'react';
import Search from '@splunk/react-ui/Search';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import Magnifier from '@splunk/react-icons/Magnifier';

import styled from 'styled-components';

// TODO: Use flex or grid to organise components horizontally
const SearchControlContainer = styled.div`
    display: inline-block;
`;



// Control group for search: field drop down, search box and submit button
const SearchControlGroup = () => {
    const [value, setValue] = useState('');

    const handleChange = (e, { value: searchValue }) => {
        setValue(searchValue);
    };

    return (
        <SearchControlContainer>
            <Select defaultValue="1">
                <Select.Option label="Any Field" value="1" />
                <Select.Option label="Indicator ID" value="2" />
                <Select.Option label="Splunk Field" value="3" />
            </Select>
            <Search
                onChange={handleChange}
                value={value}
            />
            <Button icon={<Magnifier />} label="Search" />
        </SearchControlContainer>
    );
}

export default SearchControlGroup;
