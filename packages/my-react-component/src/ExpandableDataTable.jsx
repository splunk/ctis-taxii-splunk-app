import styled from "styled-components";
import React, {useEffect} from 'react';
import Table from '@splunk/react-ui/Table';
import {variables} from "@splunk/themes";

const TableCell = styled(Table.Cell)`
    padding: ${variables.spacingXSmall} 0;
`
const TableHeadCell = styled(Table.HeadCell)`
    padding: 0;

    & > div {
        padding: 0;
    }
`
const TableHead = styled(Table.Head)`
    height: 0; // Hide the table header
`
const TableRow = styled(Table.Row)`
    & > ${TableCell}:first-child {
        font-weight: ${variables.fontWeightBold};
    }

    & > ${TableCell} {
        font-size: ${variables.fontSizeLarge};
    }
`;

const LargeBoldText = styled.span`
    font-weight: ${variables.fontWeightBold};
    font-size: ${variables.fontSizeLarge};
`;

const LargeText = styled.span`
    font-size: ${variables.fontSizeLarge};
`;

function ExpandedDataRecord({mapping}) {
    return (<Table>
        <TableHead>
            <TableHeadCell width={200}></TableHeadCell>
            <TableHeadCell></TableHeadCell>
        </TableHead>
        <Table.Body>
            {Object.entries(mapping).map(([term, description]) => (
                <TableRow key={term}>
                    <TableCell>{term}</TableCell>
                    <TableCell>{description}</TableCell>
                </TableRow>
            ))}
        </Table.Body>
    </Table>)
}

function getExpansionRow(row, rowKeyFunction, fieldNameToCellValue, numTableColumns) {
    const mapping = Object.entries(fieldNameToCellValue).reduce((acc, [fieldName, getCellValue]) => {
        acc[fieldName] = getCellValue(row);
        return acc;
    }, {});
    const expandedDataRecord = <ExpandedDataRecord mapping={mapping}/>;
    return (
        <Table.Row key={`${rowKeyFunction(row)}-expansion`}>
            <Table.Cell style={{borderTop: 'none'}} colSpan={numTableColumns}>
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
            setExpandedRows(prev => {
                const newSet = new Set(prev);
                newSet.delete(rowKey);
                return newSet;
            });
        } else {
            setExpandedRows(prev => {
                return new Set(prev).add(rowKey);
            });
        }
    }

    useEffect(() => {
        if (data.length === 1) {
            const rowKeyOfFirstRow = rowKeyFunction(data[0]);
            setExpandedRows(new Set([rowKeyOfFirstRow]));
        }
    }, [JSON.stringify(data)]);

    return (
        <Table stripeRows rowExpansion="controlled" actionsColumnWidth={hasActionsColumn ? actionsColumnWidth : null}>
            <Table.Head>
                {mappingOfColumnNameToCellValue.map(({columnName}) => (
                    <Table.HeadCell key={columnName}>
                        <LargeBoldText>{columnName}</LargeBoldText>
                    </Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body>
                {data && data.map((row) => (
                    <Table.Row key={rowKeyFunction(row)}
                               actionPrimary={RowActionPrimary && <RowActionPrimary row={row}/>}
                               actionsSecondary={RowActionsSecondary && <RowActionsSecondary row={row}/>}
                               onExpansion={() => toggleRowExpansion(rowKeyFunction(row))}
                               expanded={expandedRows.has(rowKeyFunction(row))}
                               expansionRow={
                                   getExpansionRow(row, rowKeyFunction, expansionRowFieldNameToCellValue, totalColumns)
                               }>
                        {mappingOfColumnNameToCellValue.map(({columnName, getCellContent}) => (
                            <Table.Cell key={columnName}>
                                <ContainerWithFixedMaxWidth>
                                    <LargeText>{getCellContent(row)}</LargeText>
                                </ContainerWithFixedMaxWidth>
                            </Table.Cell>
                        ))}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}

export default ExpandableDataTable;
