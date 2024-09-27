import React from 'react';
import Search from '@splunk/react-ui/Search';
import Magnifier from '@splunk/react-icons/Magnifier';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';

import styled from 'styled-components';
import {SearchFieldDropdown} from "./SearchFieldDropdown";
import BaseButton from "./BaseButton";

const SearchControlContainer = styled.div`
    display: flex;
    gap: 0;
`;

const StyledButtonGroup = styled(ButtonGroup)`
    flex: 0.25 1 200px;
`;


export const SearchBar = ({handleChange, searchFieldDropdownOptions}) => {
    return (
        <SearchControlContainer>
            <Search
                onChange={handleChange}
                style={{flex: 8}}
            />
            <StyledButtonGroup>
                <SearchFieldDropdown options={searchFieldDropdownOptions}/>
                <BaseButton icon={<Magnifier/>} appearance="primary" label="Search"/>
            </StyledButtonGroup>
        </SearchControlContainer>
    );
}

