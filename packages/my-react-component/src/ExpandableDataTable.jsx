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
const MyTable = styled(Table)`

`

function ExpandedDataRecord({mapping}) {
    return (<MyTable>
        <TableHead>
            <TableHeadCell width={200}></TableHeadCell>
            <TableHeadCell width={500}></TableHeadCell>
        </TableHead>
        <Table.Body>
            {Object.entries(mapping).map(([term, description]) => (
                <Table.Row key={term}>
                    <TableCell><strong>{term}</strong></TableCell>
                    <TableCell>{description}</TableCell>
                </Table.Row>
            ))}
        </Table.Body>
    </MyTable>)
}

function getExpansionRow(row, rowKeyFunction, fieldNameToCellValue, numTableColumns) {
    const mapping = Object.entries(fieldNameToCellValue).reduce((acc, [fieldName, getCellValue]) => {
        acc[fieldName] = getCellValue(row);
        return acc;
    }, {});
    const expandedDataRecord = <ExpandedDataRecord mapping={mapping}/>;
    return (
        <Table.Row key={`${rowKeyFunction(row)}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={numTableColumns}>
                {expandedDataRecord}
            </Table.Cell>
        </Table.Row>
    );
}
function ExpandableDataTable({data, rowKeyFunction, mappingOfColumnNameToCellValue, expansionRowFieldNameToCellValue}) {
    return (
        <Table stripeRows rowExpansion="multi">
            <Table.Head>
                {mappingOfColumnNameToCellValue.map(({columnName}) => (
                    <Table.HeadCell key={columnName}><strong>{columnName}</strong></Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body>
                {data.map((row) => (
                    <Table.Row key={rowKeyFunction(row)} expansionRow={
                        getExpansionRow(row, rowKeyFunction, expansionRowFieldNameToCellValue, mappingOfColumnNameToCellValue.length)
                    }>
                        {mappingOfColumnNameToCellValue.map(({columnName, getCellContent}) => (
                            <Table.Cell key={columnName}>{getCellContent(row)}</Table.Cell>
                        ))}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}

export default ExpandableDataTable;
