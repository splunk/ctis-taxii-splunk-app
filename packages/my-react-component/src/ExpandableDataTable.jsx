import styled from "styled-components";
import React from 'react';
import Table from '@splunk/react-ui/Table';

const TableCell = styled(Table.Cell)`
    padding: 0;
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

function ExpandedDataRecord({mapping}) {
    return (<Table>
        <TableHead>
            <TableHeadCell width={200}></TableHeadCell>
            <TableHeadCell></TableHeadCell>
        </TableHead>
        <Table.Body>
            {Object.entries(mapping).map(([term, description]) => (
                <Table.Row key={term}>
                    <TableCell><strong>{term}</strong></TableCell>
                    <TableCell>{description}</TableCell>
                </Table.Row>
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
    const totalColumns = mappingOfColumnNameToCellValue.length + 1;
    return (
        <Table stripeRows rowExpansion="multi" actionsColumnWidth={actionsColumnWidth}>
            <Table.Head>
                {mappingOfColumnNameToCellValue.map(({columnName}) => (
                    <Table.HeadCell key={columnName}><strong>{columnName}</strong></Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body>
                {data && data.map((row) => (
                    <Table.Row key={rowKeyFunction(row)}
                               actionPrimary={RowActionPrimary && <RowActionPrimary row={row}/>}
                               actionsSecondary={RowActionsSecondary && <RowActionsSecondary row={row}/>}
                               expansionRow={
                                   getExpansionRow(row, rowKeyFunction, expansionRowFieldNameToCellValue, totalColumns)
                               }>
                        {mappingOfColumnNameToCellValue.map(({columnName, getCellContent}) => (
                            <Table.Cell key={columnName}>
                                <ContainerWithFixedMaxWidth>{getCellContent(row)}</ContainerWithFixedMaxWidth>
                            </Table.Cell>
                        ))}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}

export default ExpandableDataTable;
