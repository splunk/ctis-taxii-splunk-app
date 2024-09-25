import React, {useEffect} from 'react';

import ExpandableDataTable from "@splunk/my-react-component/src/ExpandableDataTable";
import {SearchBar} from "@splunk/my-react-component/src/SearchBar";
import Button from "@splunk/react-ui/Button";
import Plus from '@splunk/react-icons/Plus';
import Pencil from '@splunk/react-icons/Pencil';
import {app} from '@splunk/splunk-utils/config';
import {createURL} from '@splunk/splunk-utils/url';
import {deleteIndicator, getIndicators} from "@splunk/my-react-component/src/ApiClient";
import P from "@splunk/react-ui/Paragraph";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import {AppContainer, createErrorToast} from "@splunk/my-react-component/src/AppContainer";
import PaginatedDataTable from "@splunk/my-react-component/src/PaginatedDataTable";
import {editIndicator, NEW_INDICATOR_PAGE} from "@splunk/my-react-component/src/urls";
import useModal from "@splunk/my-react-component/src/useModal";
import DeleteButton from "@splunk/my-react-component/src/DeleteButton";
import DeleteModal from "@splunk/my-react-component/src/DeleteModal";
import Heading from "@splunk/react-ui/Heading";
import {getUrlQueryParams} from "../../common/queryParams";
import ViewOrEditIndicator from "../../common/indicator_form/ViewOrEditIndicator";
import {useViewportBreakpoints} from "@splunk/my-react-component/viewportBreakpoints";
import {layoutWithTheme} from "../../common/theme";

const SEARCH_FIELD_OPTIONS = [
    {label: 'Any Field', value: '1'},
    {label: 'Indicator ID', value: '2'},
    {label: 'Splunk Field', value: '3'},
    {label: 'TLP Rating', value: '4'},
];

function IndicatorActionButtons({row}) {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<div>
        <Button icon={<Pencil/>} label="Edit" appearance="secondary" to={editIndicator(row.indicator_id)}/>
        <DeleteButton onClick={handleRequestOpen}/>
        <DeleteModal open={open} onRequestClose={handleRequestClose}
                     deleteEndpointFunction={deleteIndicator}
                     deleteEndpointArgs={{indicatorId: row.indicator_id}}
                     modalBodyContent={<P>Are you sure you want to delete this
                         indicator: <strong>{row.name} ({row.indicator_id})</strong>?</P>}/>
    </div>)
}

const mappingOfColumnNameToCellValue = [
    {columnName: "Name", getCellContent: (row) => row.name},
    {columnName: "STIX Pattern", getCellContent: (row) => row.stix_pattern},
    {columnName: "Indicator ID", getCellContent: (row) => row.indicator_id},
    {columnName: "Grouping ID", getCellContent: (row) => row.grouping_id},
    {columnName: "Actions", getCellContent: (row) => <IndicatorActionButtons row={row}/>},
]

function groupingIdsToMappingOfTitleToUrl(groupingIds) {
    return groupingIds.reduce((acc, groupingId) => {
        acc[groupingId] = createURL(`app/${app}/groupings`, {id: groupingId});
        return acc;
    }, {})
}

const expansionFieldNameToCellValue = {
    "Indicator ID": (row) => row.indicator_id,
    "Grouping ID": (row) => row.grouping_id,
    "Name": (row) => row.name,
    "Description": (row) => row?.description || "No description provided",
    "STIX Pattern": (row) => row.stix_pattern,
    "Valid From (UTC)": (row) => row.valid_from,
    "Indicator Category": (row) => row.indicator_category,
    "Indicator Value": (row) => row.indicator_value,
    "TLP Rating": (row) => row.tlp_v1_rating,
}


function RenderDataTable({records, loading, error}) {
    // TODO: pass in isLoading, error?
    const loadingElement = <P>Loading...<WaitSpinner size='large'/></P>;
    const errorElement = <P>{`Error: ${error}`}</P>
    const columns = useResponsiveColumns();
    const columnNameToCellValue = mappingOfColumnNameToCellValue.filter((column) => columns.includes(column.columnName));
    const table = <ExpandableDataTable data={records}
                                       rowKeyFunction={(row) => row.indicator_id}
                                       expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                                       mappingOfColumnNameToCellValue={columnNameToCellValue}/>
    return (
        error ? errorElement : (loading ? loadingElement : table)
    );
}

function useResponsiveColumns() {
    const {isSmallScreen, isMediumScreen, isLargeScreen, isXLargeScreen} = useViewportBreakpoints();
    const [columns, setColumns] = React.useState(["Name", "STIX Pattern", "Indicator ID", "Actions"]);
    useEffect(() => {
        if (isXLargeScreen) {
            setColumns(["Name", "STIX Pattern", "Indicator ID", "Grouping ID", "Actions"]);
        } else if (isLargeScreen) {
            setColumns(["Name", "STIX Pattern", "Indicator ID", "Actions"]);
        } else if (isMediumScreen) {
            setColumns(["Name", "STIX Pattern", "Actions"]);
        } else {
            setColumns(["Name", "Actions"]);
        }
    }, [isSmallScreen, isMediumScreen, isLargeScreen, isXLargeScreen]);
    return columns;
}

function ListIndicators() {
    return (
        <>
            <Heading level={1}>Indicators of Compromise (IoC)</Heading>
            <div>
                {/* // TODO: Move this to own file. Containing the button in a div prevents button expanding entire width page */}
                <Button icon={<Plus/>} label="New Indicator" appearance="primary" to={NEW_INDICATOR_PAGE}/>
            </div>
            <SearchBar handleChange={(e) => {
            }} searchFieldDropdownOptions={SEARCH_FIELD_OPTIONS}/>

            {/*
            // TODO: what else needs to be considered for handling search and filters?
            */}
            <PaginatedDataTable renderData={RenderDataTable} fetchData={getIndicators} onError={(e) => {
                createErrorToast(e);
            }}/>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('indicator_id')) {
        const indicatorId = queryParams.get('indicator_id');
        const editMode = queryParams.has('action', 'edit');
        return <ViewOrEditIndicator editMode={editMode} indicatorId={indicatorId}/>
    } else {
        return (
            <ListIndicators/>
        );
    }
}

layoutWithTheme(<AppContainer><Router/></AppContainer>);
