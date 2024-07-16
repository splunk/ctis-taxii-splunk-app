import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';

const data = [
    {   indicator_id: 'indicator--4a6fb8ca-6e63-420c-b755-52254f96164b',
        created_at: '2024-07-16T01:43:45Z' ,
        pattern_type: 'stix',
        pattern: "[domain-name:value = 'site.of.interest.zaz']",
        splunk_field_name: "host",
        splunk_field_value: "site.of.interest.zaz",
        tlp_rating: "GREEN",
    },
    {   indicator_id: 'indicator--8d8821ad-821b-4f39-a3a7-68bb9eb2be4a',
        created_at: '2024-01-15T01:43:45Z' ,
        pattern_type: 'stix',
        pattern: "[network-traffic:dst_ref.value = '198.51.100.1']",
        splunk_field_name: "dest_ip",
        splunk_field_value: "198.51.100.1",
        tlp_rating: "RED",
    },
    {   indicator_id: 'indicator--595876e2-9427-4084-b5f0-f147e94f708e',
        created_at: '2023-06-01T00:12:34Z' ,
        pattern_type: 'stix',
        pattern: "[url:value = 'https://example.com/abc']",
        splunk_field_name: "url",
        splunk_field_value: "https://example.com/abc",
        tlp_rating: "AMBER",
    },
];

function getExpansionRow(row) {
    return (
        <Table.Row key={`${row.email}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={2}>
                <DL>
                    <DL.Term>Indicator ID</DL.Term>
                    <DL.Description>{row.indicator_id}</DL.Description>
                    <DL.Term>Created At</DL.Term>
                    <DL.Description>{row.created_at}</DL.Description>
                    <DL.Term>Splunk Field Name</DL.Term>
                    <DL.Description>{row.splunk_field_name}</DL.Description>
                    <DL.Term>Splunk Field Value</DL.Term>
                    <DL.Description>{row.splunk_field_value}</DL.Description>
                </DL>
            </Table.Cell>
        </Table.Row>
    );
}

function ExpandableRows() {
    return (
        <Table stripeRows rowExpansion="single">
            <Table.Head>
                <Table.HeadCell>Indicator ID</Table.HeadCell>
                <Table.HeadCell>Created At</Table.HeadCell>
                <Table.HeadCell>Splunk Field Name</Table.HeadCell>
                <Table.HeadCell>Splunk Field Value</Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {data.map((row) => (
                    <Table.Row key={row.indicator_id} expansionRow={getExpansionRow(row)}>
                        <Table.Cell>{row.indicator_id}</Table.Cell>
                        <Table.Cell>{row.created_at}</Table.Cell>
                        <Table.Cell>{row.splunk_field_name}</Table.Cell>
                        <Table.Cell>{row.splunk_field_value}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}

export default ExpandableRows;
