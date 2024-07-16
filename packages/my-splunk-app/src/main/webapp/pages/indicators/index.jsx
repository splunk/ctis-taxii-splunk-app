import React from 'react';

import layout from '@splunk/react-page';
import { getUserTheme } from '@splunk/splunk-utils/themes';

import { StyledContainer, StyledGreeting } from './StartStyles';
import ExpandableRows from "./expandableRows";
import SearchControlGroup from "./search";
import SearchPaginator from "./paginator";
getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Indicators of Compromise (IoC)</StyledGreeting>
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
