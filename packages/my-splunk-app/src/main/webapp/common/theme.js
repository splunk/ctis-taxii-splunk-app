import layout from "@splunk/react-page";
import {getUserTheme} from "@splunk/splunk-utils/themes";

// https://dev.splunk.com/enterprise/docs/developapps/createapps/buildapps/adduithemes/
// You can also specify page title with layout()
export const layoutWithTheme = (component) => {
    getUserTheme().then((theme) => {
        return layout(component, {theme})
    });
};

