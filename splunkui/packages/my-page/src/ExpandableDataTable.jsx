import styled from 'styled-components';
import React, { useContext, useEffect } from 'react';
import Table from '@splunk/react-ui/Table';
import { variables } from '@splunk/themes';
import DL from '@splunk/react-ui/DefinitionList';
import PropTypes from 'prop-types';
import P from '@splunk/react-ui/Paragraph';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import { RecordsLoaderContext } from './PaginatedDataTable';
import { NoValuePresent } from './data_table/values';

const LargeBoldText = styled.span`
    font-weight: ${variables.fontWeightBold};
    font-size: ${variables.fontSizeLarge};
`;

const LargeText = styled.span`
    font-size: ${variables.fontSizeLarge};
`;

const StyledDL = styled(DL)`
    & > * {
        padding-bottom: 0.5em;
    }
`;

function Description({ description }) {
    if (description === null || description === undefined || description === '') {
        return <NoValuePresent />;
    }
    return <P>{description}</P>;
}
Description.propTypes = {
    description: PropTypes.string,
}

function ExpandedDataRecord({ mapping }) {
    return (
        <StyledDL layout="fixed" termWidth="200px">
            {Object.entries(mapping).map(([term, description]) => (
                <>
                    <StyledDL.Term>{term}</StyledDL.Term>
                    <StyledDL.Description><Description description={description} /></StyledDL.Description>
                </>
            ))}
        </StyledDL>
    );
}
ExpandedDataRecord.propTypes = {
    mapping: PropTypes.object.isRequired,
};

function getExpansionRow(row, rowKeyFunction, fieldNameToCellValue, numTableColumns) {
    const mapping = Object.entries(fieldNameToCellValue).reduce(
        (acc, [fieldName, getCellValue]) => {
            acc[fieldName] = getCellValue(row);
            return acc;
        },
        {},
    );
    const expandedDataRecord = <ExpandedDataRecord mapping={mapping} />;
    return (
        <Table.Row key={`${rowKeyFunction(row)}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={numTableColumns}>
                {expandedDataRecord}
            </Table.Cell>
        </Table.Row>
    );
}

const ContainerWithFixedMaxWidth = styled.div`
    max-width: 600px;
`;

function ExpandableDataTable({
    data,
    rowKeyFunction,
    mappingOfColumnNameToCellValue,
    expansionRowFieldNameToCellValue,
    rowActionPrimary: RowActionPrimary,
    rowActionsSecondary: RowActionsSecondary,
    actionsColumnWidth = 150,
}) {
    // Adding one to include actions column
    let totalColumns = mappingOfColumnNameToCellValue.length;
    const hasActionsColumn = RowActionPrimary || RowActionsSecondary;
    if (hasActionsColumn) {
        totalColumns += 1;
    }
    const [expandedRows, setExpandedRows] = React.useState(() => new Set());
    const toggleRowExpansion = (rowKey) => {
        if (expandedRows.has(rowKey)) {
            setExpandedRows((prev) => {
                const newSet = new Set(prev);
                newSet.delete(rowKey);
                return newSet;
            });
        } else {
            setExpandedRows((prev) => {
                return new Set(prev).add(rowKey);
            });
        }
    };

    useEffect(() => {
        if (data.length === 1) {
            const rowKeyOfFirstRow = rowKeyFunction(data[0]);
            setExpandedRows(new Set([rowKeyOfFirstRow]));
        }
    }, [JSON.stringify(data)]);

    return (
        <Table
            stripeRows
            rowExpansion="controlled"
            actionsColumnWidth={hasActionsColumn ? actionsColumnWidth : null}
        >
            <Table.Head>
                {mappingOfColumnNameToCellValue.map(({ columnName }) => (
                    <Table.HeadCell key={columnName}>
                        <LargeBoldText>{columnName}</LargeBoldText>
                    </Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body>
                {data &&
                    data.map((row) => (
                        <Table.Row
                            key={rowKeyFunction(row)}
                            actionPrimary={RowActionPrimary && <RowActionPrimary row={row} />}
                            actionsSecondary={
                                RowActionsSecondary && <RowActionsSecondary row={row} />
                            }
                            onExpansion={() => toggleRowExpansion(rowKeyFunction(row))}
                            expanded={expandedRows.has(rowKeyFunction(row))}
                            expansionRow={getExpansionRow(
                                row,
                                rowKeyFunction,
                                expansionRowFieldNameToCellValue,
                                totalColumns,
                            )}
                        >
                            {mappingOfColumnNameToCellValue.map(
                                ({ columnName, getCellContent }) => (
                                    <Table.Cell key={columnName}>
                                        <ContainerWithFixedMaxWidth>
                                            <LargeText>{getCellContent(row)}</LargeText>
                                        </ContainerWithFixedMaxWidth>
                                    </Table.Cell>
                                ),
                            )}
                        </Table.Row>
                    ))}
            </Table.Body>
        </Table>
    );
}

export default ExpandableDataTable;

export function DataTableV2({
    rowKeyFunction,
    expansionRowFieldNameToCellValue,
    mappingOfColumnNameToCellValue,
    rowActionPrimary,
    rowActionsSecondary,
    actionsColumnWidth = 150,
}) {
    const { loading, error, records } = useContext(RecordsLoaderContext);
    const loadingElement = (
        <div>
            <P>Loading...</P>
            <WaitSpinner size="large" />
        </div>
    );
    const errorElement = <P>{`Error: ${error}`}</P>;
    const table = (
        <ExpandableDataTable
            data={records}
            rowKeyFunction={rowKeyFunction}
            expansionRowFieldNameToCellValue={expansionRowFieldNameToCellValue}
            mappingOfColumnNameToCellValue={mappingOfColumnNameToCellValue}
            rowActionPrimary={rowActionPrimary}
            rowActionsSecondary={rowActionsSecondary}
            actionsColumnWidth={actionsColumnWidth}
        />
    );
    if (error) {
        return errorElement;
    }
    return loading ? loadingElement : table;
}
DataTableV2.propTypes = {
    rowKeyFunction: PropTypes.func.isRequired,
    rowActionPrimary: PropTypes.func,
    rowActionsSecondary: PropTypes.func,
    expansionRowFieldNameToCellValue: PropTypes.object.isRequired,
    mappingOfColumnNameToCellValue: PropTypes.array.isRequired,
    actionsColumnWidth: PropTypes.number,
};
