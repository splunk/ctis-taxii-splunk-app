import React from 'react';
import Message from '@splunk/react-ui/Message';
import PropTypes from 'prop-types';

export default function ErrorMessage({message, ...props}) {
    return <Message appearance='fill' type='error' {...props}>
        {message}
    </Message>
}

ErrorMessage.propTypes = {
    message: PropTypes.string.isRequired
}
