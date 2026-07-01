import { CustomControlGroup } from '@splunk/my-page/src/CustomControlGroup';
import Switch from '@splunk/react-ui/Switch';
import React from 'react';
import PropTypes from 'prop-types';
import { SwitchContainer } from './switchContainer';

export function IncludeSightingsControlGroup({ selected, handleOnClick }) {
    return (
        <CustomControlGroup label="Include Sightings?">
            <SwitchContainer>
                <Switch
                    key="switchIncludeSightings"
                    onClick={handleOnClick}
                    selected={selected}
                    appearance="toggle"
                >
                    {selected ? 'Will include sightings' : 'Will exclude sightings'}
                </Switch>
            </SwitchContainer>
        </CustomControlGroup>
    );
}
IncludeSightingsControlGroup.propTypes = {
    selected: PropTypes.bool,
    handleOnClick: PropTypes.func,
};
