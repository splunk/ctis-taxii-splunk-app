import React, {useState} from 'react';
import Search from '@splunk/react-ui/Search';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import Magnifier from '@splunk/react-icons/Magnifier';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';


import styled from 'styled-components';

const SearchControlContainer = styled.div`
    display: flex;
    gap: 0;
`;

const StyledButtonGroup = styled(ButtonGroup)`
    flex: 0.25 1 200px;
`;


// Control group for search: field drop down, search box and submit button
const SearchControlGroup = () => {
    const [value, setValue] = useState('');

    const handleChange = (e, {value: searchValue}) => {
        setValue(searchValue);
    };

    return (
        <SearchControlContainer>
            <Search
                onChange={handleChange}
                value={value}
                style={{flex: 8}}
            />
            <StyledButtonGroup>
                <Select defaultValue="1">
                    <Select.Option label="Any Field" value="1"/>
                    <Select.Option label="Indicator ID" value="2"/>
                    <Select.Option label="Splunk Field" value="3"/>
                </Select>
                <Button icon={<Magnifier/>} appearance="primary" label="Search"/>
            </StyledButtonGroup>
        </SearchControlContainer>
    );
}

export default SearchControlGroup;
