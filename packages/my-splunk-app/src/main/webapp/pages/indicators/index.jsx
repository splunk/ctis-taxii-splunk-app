import React, {useEffect} from 'react';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import {IndicatorsSearchBar} from "@splunk/my-react-component/src/SearchBar";
import Button from "@splunk/react-ui/Button";
import Plus from '@splunk/react-icons/Plus';
import {getIndicators} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {
    GroupingIdLink,
    IndicatorIdLink,
    NEW_INDICATOR_PAGE,
    urlForEditIndicator
} from "@splunk/my-react-component/src/urls";
import useModal from "@splunk/my-react-component/src/useModal";
import {DeleteIndicatorModal} from "@splunk/my-react-component/src/DeleteModal";
import Heading from "@splunk/react-ui/Heading";
import {getUrlQueryParams} from "../../common/queryParams";
import ViewOrEditIndicator from "../../common/indicator_form/ViewOrEditIndicator";
import {useViewportBreakpoints} from "@splunk/my-react-component/viewportBreakpoints";
import {layoutWithTheme} from "../../common/theme";
import Menu from "@splunk/react-ui/Menu";
import EditIconOnlyButton from "@splunk/my-react-component/src/buttons/EditIconOnlyButton";
import DeleteIconOnlyButton from "@splunk/my-react-component/src/buttons/DeleteIconOnlyButton";
import {HorizontalActionButtonLayout} from "@splunk/my-react-component/src/HorizontalButtonLayout";

const mappingOfColumnNameToCellValue = [
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "STIX Pattern", getCellContent: (row) => row.stix_pattern},
    {columnName: "Indicator ID", getCellContent: (row) => <IndicatorIdLink indicatorId={row.indicator_id}/>},
    {columnName: "Grouping ID", getCellContent: (row) => <GroupingIdLink groupingId={row.grouping_id}/>},
]

const expansionFieldNameToCellValue = {
    "Indicator ID": (row) => <IndicatorIdLink indicatorId={row.indicator_id}/>,
    "Grouping ID": (row) => <GroupingIdLink groupingId={row.grouping_id}/>,
    "Name": (row) => row.name,
    "Description": (row) => row?.description || "No description provided",
    "STIX Pattern": (row) => row.stix_pattern,
    "Valid From (UTC)": (row) => row.valid_from,
    "Indicator Category": (row) => row.indicator_category,
    "Indicator Value": (row) => row.indicator_value,
    "TLP Rating": (row) => row.tlp_v1_rating,
    "Created At (UTC)": (row) => row.created,
    "Modified At (UTC)": (row) => row.modified,
}

const RowActionPrimary = ({row}) => {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<HorizontalActionButtonLayout>
        <EditIconOnlyButton to={urlForEditIndicator(row.indicator_id)}/>
        <DeleteIconOnlyButton onClick={handleRequestOpen}/>
        <DeleteIndicatorModal open={open} onRequestClose={handleRequestClose} indicator={row}/>
    </HorizontalActionButtonLayout>);
}
const RowActionsSecondary = ({row}) => (
    <Menu>
        {/*<Menu.Item onClick={() => console.log(row)}>Delete</Menu.Item>*/}
        {/*<Menu.Item onClick={() => console.log(row)}>Something else</Menu.Item>*/}
    </Menu>
);

function RenderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const columns = useResponsiveColumns();
    const columnNameToCellValue = mappingOfColumnNameToCellValue.filter((column) => columns.includes(column.columnName));
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.indicator_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={columnNameToCellValue}
                                       rowActionPrimary={RowActionPrimary}
        // rowActionsSecondary={RowActionsSecondary}
                                       actionsColumnWidth={120}
    />
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function useResponsiveColumns() {
    const {isSmallScreen, isMediumScreen, isLargeScreen, isXLargeScreen} = useViewportBreakpoints();
    const [columns, setColumns] = React.useState(["Name", "STIX Pattern", "Indicator ID"]);
    useEffect(() => {
        if (isXLargeScreen) {
            setColumns(["Name", "STIX Pattern", "Indicator ID", "Grouping ID"]);
        } else if (isLargeScreen) {
            setColumns(["Name", "STIX Pattern", "Indicator ID"]);
        } else if (isMediumScreen) {
            setColumns(["Name", "STIX Pattern"]);
        } else {
            setColumns(["Name"]);
        }
    }, [isSmallScreen, isMediumScreen, isLargeScreen, isXLargeScreen]);
    return columns;
}

function ListIndicators() {
    const [query, setQuery] = React.useState({});

    return (
        <>
            <Heading level={1}>Indicators of Compromise (IoC)</Heading>
            <div>
                <Button icon={<Plus/>} label="New Indicator" appearance="primary" to={NEW_INDICATOR_PAGE}/>
            </div>
            <IndicatorsSearchBar onQueryChange={setQuery}/>
            <PaginatedDataTable renderData={RenderDataTable} fetchData={getIndicators} query={query} onError={(e) => {
                createErrorToast(e);
            }}/>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('indicator_id') && queryParams.has('action', 'edit')) {
        const indicatorId = queryParams.get('indicator_id');
        return <ViewOrEditIndicator editMode={true} indicatorId={indicatorId}/>
    } else {
        return (
            <ListIndicators/>
        );
    }
}

layoutWithTheme(<AppContainer><Router/></AppContainer>);
