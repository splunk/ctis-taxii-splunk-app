import React from 'react';

import layout from '@splunk/react-page';
import {getUserTheme} from '@splunk/splunk-utils/themes';

import ControlGroup from '@splunk/react-ui/ControlGroup';
import {v4 as uuidv4} from 'uuid';
import Text from '@splunk/react-ui/Text';
import TextArea from '@splunk/react-ui/TextArea';

import PropTypes from 'prop-types';
import Select from "@splunk/react-ui/Select";
import Number from '@splunk/react-ui/Number';
import Button from "@splunk/react-ui/Button";
import {DateTimeWithTimezone} from "@splunk/my-react-component/src/DateTimeWithTimezone";
import {StyledContainer, StyledGreeting} from './styles';

function NewIndicatorForm({initialIndicatorId, splunkFieldName, splunkFieldValue}) {
    return (
        <form>
            <ControlGroup label="Grouping ID">
                <Select placeholder="Select…">
                    <Select.Option label="Grouping A" value="1" />
                    <Select.Option label="Grouping B" value="2" />
                </Select>
            </ControlGroup>
            <ControlGroup label="Indicator ID">
                <Text canClear value={initialIndicatorId} />
            </ControlGroup>
            <ControlGroup label="Splunk Field Name">
                <Text canClear value={splunkFieldName} />
            </ControlGroup>
            <ControlGroup label="Splunk Field Value">
                <Text canClear value={splunkFieldValue} />
            </ControlGroup>
            <ControlGroup label="Name">
                <Text canClear />
            </ControlGroup>
            <ControlGroup label="Description">
                <TextArea />
            </ControlGroup>
            <ControlGroup label="STIX v2 Pattern">
                <TextArea />
            </ControlGroup>
            <ControlGroup label="Confidence">
                <Number defaultValue={100} max={100} min={0} step={1} />
            </ControlGroup>
            <ControlGroup label="TLP Rating">
                <Select>
                    <Select.Option label="RED" value="RED" />
                    <Select.Option label="AMBER" value="AMBER" />
                    <Select.Option label="GREEN" value="GREEN" />
                    <Select.Option label="WHITE" value="WHITE" />
                </Select>
            </ControlGroup>
            <ControlGroup label="Valid From">
                <DateTimeWithTimezone />
            </ControlGroup>
            <ControlGroup>
                <Button label="Submit" appearance="primary" onClick={() => console.log("Submitted")}/>
            </ControlGroup>

        </form>
    );
}

NewIndicatorForm.propTypes = {
    initialIndicatorId: PropTypes.string,
    splunkFieldName: PropTypes.string,
    splunkFieldValue: PropTypes.string,
};

function getUrlQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const splunkFieldName = urlParams.get('splunkFieldName');
    const splunkFieldValue = urlParams.get('splunkFieldValue');
    return {splunkFieldName, splunkFieldValue}
}

getUserTheme()
    .then((theme) => {
        const {splunkFieldName, splunkFieldValue} = getUrlQueryParams();
        layout(
            <StyledContainer>
                <StyledGreeting>New Indicator of Compromise (IoC)</StyledGreeting>
                <NewIndicatorForm initialIndicatorId={`indicator--${uuidv4()}`}
                        splunkFieldName={splunkFieldName}
                        splunkFieldValue={splunkFieldValue}
                />

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
