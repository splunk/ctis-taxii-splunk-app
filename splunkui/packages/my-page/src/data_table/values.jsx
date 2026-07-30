import P from '@splunk/react-ui/Paragraph';
import React from 'react';
import PropTypes from 'prop-types';
import List from '@splunk/react-ui/List';

export function NoValuePresent() {
    return (
        <P>
            <i>None</i>
        </P>
    );
}
export function BooleanValue({ value }) {
    if (value) {
        return 'true';
    }
    return 'false';
}

export function StixLabels({ labels }) {
    if (!labels || labels.length === 0) {
        return <NoValuePresent />;
    }
    return (
        <List>
            {labels.map((label) => (
                <List.Item key={label}>{label}</List.Item>
            ))}
        </List>
    );
}
StixLabels.propTypes = {
    labels: PropTypes.arrayOf(PropTypes.string),
};
