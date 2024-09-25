import {getTheme} from "@splunk/themes";
import layout from "@splunk/react-page";

export const theme = getTheme({colorScheme: 'dark'});

export const layoutWithTheme = (component) => {
    return layout(component, {theme})
};

