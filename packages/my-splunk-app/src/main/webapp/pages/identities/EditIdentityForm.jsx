import React from "react";
import {AppContainer} from "@splunk/my-react-component/src/AppContainer";
import Heading from "@splunk/react-ui/Heading";

const EditIdentityForm = ({identityId}) => {
    return <AppContainer>
        <Heading>Edit Identity {identityId}</Heading>
    </AppContainer>;
}
export default EditIdentityForm;
