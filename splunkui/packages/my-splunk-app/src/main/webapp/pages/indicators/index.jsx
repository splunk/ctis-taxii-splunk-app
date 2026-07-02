import React, { useEffect } from 'react';
import { IndicatorsSearchBar } from '@splunk/my-page/src/SearchBar';
import Plus from '@splunk/react-icons/Plus';
import { getIndicators } from '@splunk/my-page/src/ApiClient';
import { AppContainer, createErrorToast } from '@splunk/my-page/src/AppContainer';
import { PaginatedRecords } from '@splunk/my-page/src/PaginatedDataTable';
import { GroupingIdLink, IndicatorIdLink, NEW_INDICATOR_PAGE, urlForEditIndicator } from '@splunk/my-page/src/urls';
import useModal from '@splunk/my-page/src/useModal';
import { DeleteIndicatorModal } from '@splunk/my-page/src/DeleteModal';
import { useViewportBreakpoints } from '@splunk/my-page/src/viewportBreakpoints';
import EditIconOnlyButton from '@splunk/my-page/src/buttons/EditIconOnlyButton';
import DeleteIconOnlyButton from '@splunk/my-page/src/buttons/DeleteIconOnlyButton';
import { HorizontalActionButtonLayout } from '@splunk/my-page/src/HorizontalButtonLayout';
import PropTypes from 'prop-types';
import { PageHeading, PageHeadingContainer } from '@splunk/my-page/src/PageHeading';
import BaseButton from '@splunk/my-page/src/BaseButton';
import { formatTimestampForDisplay } from '@splunk/my-page/src/date_utils';
import { DataTableV2 } from '@splunk/my-page/src/ExpandableDataTable';
import { layoutWithTheme } from '../../common/theme';
import ViewOrEditIndicator from '../../common/indicator_form/ViewOrEditIndicator';
import { getUrlQueryParams } from '../../common/queryParams';
import { usePageTitle } from '../../common/utils';
import { FIELD_LABEL_TLP_V2_MARKING } from '../../common/tlp';

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
    "Description": (row) => row.description,
    "STIX Pattern": (row) => row.stix_pattern,
    "Valid From (UTC)": (row) => formatTimestampForDisplay(row.valid_from),
    "Indicator Category": (row) => row.indicator_category,
    "Indicator Value": (row) => row.indicator_value,
    [FIELD_LABEL_TLP_V2_MARKING]: (row) => row.tlp_v2_rating,
    "Created At (UTC)": (row) => formatTimestampForDisplay(row.created),
    "Modified At (UTC)": (row) => formatTimestampForDisplay(row.modified),
    "Confidence": (row) => row.confidence,
}

const RowActionPrimary = ({row}) => {
    const {open, handleRequestClose, handleRequestOpen} = useModal();
    return (<HorizontalActionButtonLayout>
        <EditIconOnlyButton to={urlForEditIndicator(row.indicator_id)}/>
        <DeleteIconOnlyButton onClick={handleRequestOpen}/>
        <DeleteIndicatorModal open={open} onRequestClose={handleRequestClose} indicator={row}/>
    </HorizontalActionButtonLayout>);
}
RowActionPrimary.propTypes = {
    row: PropTypes.object.isRequired
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
    const title = "Indicators";
    usePageTitle(title);

    const columns = useResponsiveColumns();
    const columnNameToCellValue = mappingOfColumnNameToCellValue.filter((column) =>
        columns.includes(column.columnName),
    );

    return (
        <>
            <PageHeadingContainer>
                <PageHeading level={1}>{title}</PageHeading>
                <BaseButton
                    inline
                    icon={<Plus />}
                    label="New Indicator"
                    appearance="primary"
                    to={NEW_INDICATOR_PAGE}
                />
            </PageHeadingContainer>
            <IndicatorsSearchBar onQueryChange={setQuery} />
            <PaginatedRecords fetchData={getIndicators} onError={createErrorToast} query={query}>
                <DataTableV2
                    rowKeyFunction={(row) => row.indicator_id}
                    expansionRowFieldNameToCellValue={expansionFieldNameToCellValue}
                    mappingOfColumnNameToCellValue={columnNameToCellValue}
                    rowActionPrimary={RowActionPrimary}
                    actionsColumnWidth={120}
                />
            </PaginatedRecords>
        </>
    );
}

function Router() {
    const queryParams = getUrlQueryParams();
    if (queryParams.has('indicator_id') && queryParams.has('action', 'edit')) {
        const indicatorId = queryParams.get('indicator_id');
        return <ViewOrEditIndicator editMode indicatorId={indicatorId}/>
    }
    return (
        <ListIndicators/>
    );

}

layoutWithTheme(<AppContainer><Router/></AppContainer>);
