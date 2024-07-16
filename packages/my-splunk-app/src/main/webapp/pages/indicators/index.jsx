import React from 'react';

import layout from '@splunk/react-page';
import { getUserTheme } from '@splunk/splunk-utils/themes';

import { StyledContainer, StyledGreeting } from './styles';
import ExpandableRows from "./expandableRows";
import SearchControlGroup from "./search";
import SearchPaginator from "./paginator";
import Button from "@splunk/react-ui/Button";
import Plus from '@splunk/react-icons/Plus';

getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Indicators of Compromise (IoC)</StyledGreeting>
                <div>
                    {/*// TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page*/}
                    <Button icon={<Plus/>} label="New Indicator" appearance="primary" />
                </div>
                <SearchControlGroup />
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
