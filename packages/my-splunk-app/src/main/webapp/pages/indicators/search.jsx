// https://splunkui.splunk.com/Packages/react-ui/Search
import React, {useState} from 'react';
import Search from '@splunk/react-ui/Search';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import Magnifier from '@splunk/react-icons/Magnifier';




// Control group for search: field drop down, search box and submit button
const SearchControlGroup = () => {
    const [value, setValue] = useState('');

    const handleChange = (e, { value: searchValue }) => {
        setValue(searchValue);
    };

    return (
        <ControlGroup label="Search" controlsLayout="none">
            <Select defaultValue="1">
                <Select.Option label="Any Field" value="1" />
                <Select.Option label="Indicator ID" value="2" />
                <Select.Option label="Splunk Field" value="3" />
            </Select>
            <Search
                inline
                onChange={handleChange}
                value={value}
            />
            <Button icon={<Magnifier />} label="Search" />
        </ControlGroup>
    );
}

export default SearchControlGroup;
