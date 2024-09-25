import styled from "styled-components";
import React from 'react';
import Table from '@splunk/react-ui/Table';
import Pencil from "@splunk/react-icons/Pencil";
import Button from "@splunk/react-ui/Button";
import Menu from "@splunk/react-ui/Menu";

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
            <TableHeadCell width={1000}></TableHeadCell>
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
    const rowActionPrimary = (row) => <Button appearance="secondary" icon={<Pencil hideDefaultTooltip /> } onClick={() => console.log(row)}/>;
    const rowActionsSecondary = (row) => (
        <Menu>
            <Menu.Item onClick={() => console.log(row)}>Delete</Menu.Item>
            <Menu.Item onClick={() => console.log(row)}>Something else</Menu.Item>
        </Menu>
    );
    return (
        <Table stripeRows rowExpansion="multi" actionsColumnWidth={100}>
            <Table.Head>
                {mappingOfColumnNameToCellValue.map(({columnName}) => (
                    <Table.HeadCell key={columnName}><strong>{columnName}</strong></Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body>
                {data && data.map((row) => (
                    <Table.Row key={rowKeyFunction(row)}
                               actionPrimary={rowActionPrimary(row)}
                               actionsSecondary={rowActionsSecondary(row)}
                               expansionRow={
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
