import styled from "styled-components";
import Heading from "@splunk/react-ui/Heading";
import WaitSpinner from "@splunk/react-ui/WaitSpinner";
import Message from "@splunk/react-ui/Message";
import P from "@splunk/react-ui/Paragraph";
import React from "react";

const MessageContent = styled.div`
    flex-direction: column;
    display: flex;
`;

function Loading() {
    return (<Heading>Loading...<WaitSpinner size="large"/></Heading>);

}
export default function Loader({error, loading, children}) {
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
            {!error && (loading ? <Loading/> : children)}
        </>
    )
}
