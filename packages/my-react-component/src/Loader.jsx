import styled from "styled-components";
import Heading from "@splunk/react-ui/Heading";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import React from "react";
import PropTypes from "prop-types";

const MessageContent = styled.div`
    flex-direction: column;
    display: flex;
`;

function Loading({loadingText = "Loading..."}) {
    return (<Heading>
        {loadingText}
        <WaitSpinner size="large"/>
    </Heading>);
}

Loading.propTypes = {
    loadingText: PropTypes.string
}

export default function Loader({error, loading, children, loadingText = "Loading..."}) {
    return (
        <>
            {error && <Message appearance="fill" type="error">
                <MessageContent>
                    <div>
                        <Message.Title><strong>Something went wrong</strong></Message.Title>
                    </div>
                    <div>
                        <P>{error}</P>
                    </div>
                </MessageContent>
            </Message>}
            {!error && (loading ? <Loading loadingText={loadingText}/> : children)}
        </>
    )
}
Loader.propTypes = {
    error: PropTypes.string,
    loading: PropTypes.bool,
    children: PropTypes.node,
    loadingText: PropTypes.string
}
