import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';


function DefinitionListFromMapping({mapping}) {
    return (
        <DL>
            {Object.entries(mapping).map(([term, description]) => (
                <React.Fragment key={term}>
                    <DL.Term>{term}</DL.Term>
                    <DL.Description>{description}</DL.Description>
                </React.Fragment>
            ))}
        </DL>
    );

}
function getExpansionRow(row, fieldNameToCellValue, numTableColumns) {
    const mapping = Object.entries(fieldNameToCellValue).reduce((acc, [fieldName, getCellValue]) => {
        acc[fieldName] = getCellValue(row);
        return acc;
    }, {});
    const definitionList = <DefinitionListFromMapping mapping={mapping}/>;
    return (
        <Table.Row key={`${row.email}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={numTableColumns}>
                {definitionList}
            </Table.Cell>
        </Table.Row>
    );
}
function ExpandableDataTable({data, rowKeyFunction, mappingOfColumnNameToCellValue, expansionRowFieldNameToCellValue}) {
    return (
        <Table stripeRows rowExpansion="multi">
            <Table.Head>
                {mappingOfColumnNameToCellValue.map(({columnName}) => (
                    <Table.HeadCell key={columnName}>{columnName}</Table.HeadCell>
                ))}
            </Table.Head>
            <Table.Body>
                {data.map((row) => (
                    <Table.Row key={rowKeyFunction(row)} expansionRow={getExpansionRow(row, expansionRowFieldNameToCellValue, mappingOfColumnNameToCellValue.length)}>
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
