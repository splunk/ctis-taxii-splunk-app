import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import {StyledContainer, StyledGreeting} from './styles';
import ExpandableRows from "./expandableRows";
import SearchPaginator from "./paginator";
import {SearchBar} from "@splunk/my-react-component/src/SearchBar";
import Button from "@splunk/react-ui/Button";
import Plus from '@splunk/react-icons/Plus';


const handleChange = (e, {value: searchValue}) => {
    console.log(searchValue);
};
const SEARCH_FIELD_OPTIONS = [
    {label: 'Any Field', value: '1'},
    {label: 'Indicator ID', value: '2'},
    {label: 'Splunk Field', value: '3'},
    {label: 'TLP Rating', value: '4'},
];
getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Indicators of Compromise (IoC)</StyledGreeting>
                <div>
                    {/*// TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page*/}
                    <Button icon={<Plus/>} label="New Indicator" appearance="primary" />
                </div>
                <SearchBar handleChange={handleChange} searchFieldDropdownOptions={SEARCH_FIELD_OPTIONS}/>
                <ExpandableRows />
                <SearchPaginator />
            </StyledContainer>,
            {
                theme,
            }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });
