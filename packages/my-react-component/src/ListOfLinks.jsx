import React from "react";
import List from '@splunk/react-ui/List';
import styled from 'styled-components';
import PropTypes from "prop-types";

const StyledList = styled(List)`
    list-style-type: none;
    margin: 0;
    padding: 0;
`;

export function ListOfLinks({links}) {
    return (<div><StyledList ordered>
        {links.map(({title, url}) => (
            <List.Item>
                <a key={title} href={url}>{title}</a>
            </List.Item>
        ))}
    </StyledList></div>);
}
ListOfLinks.propTypes = {
    titleToUrl : PropTypes.objectOf(PropTypes.string)
}
