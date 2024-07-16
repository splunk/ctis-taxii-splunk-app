import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import Button from "@splunk/react-ui/Button";
import {GroupingsLinks} from "./groupingsLinks";
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import Pencil from '@splunk/react-icons/Pencil';
import Plus from '@splunk/react-icons/Plus';


const data = [
    {   indicator_id: 'indicator--4a6fb8ca-6e63-420c-b755-52254f96164b',
        name: 'Suspicious Domain: site.of.interest.zaz',
        created_at: '2024-07-16T01:43:45Z' ,
        pattern_type: 'stix',
        pattern: "[domain-name:value = 'site.of.interest.zaz']",
        splunk_field_name: "host",
        splunk_field_value: "site.of.interest.zaz",
        tlp_rating: "GREEN",
        referenced_in_groupings: [
            "grouping--25c127c3-8009-43cb-8989-dafa4a4be162"
        ],
    },
    {   indicator_id: 'indicator--8d8821ad-821b-4f39-a3a7-68bb9eb2be4a',
        name: 'Destination IPv4 for C2 traffic',
        created_at: '2024-01-15T01:43:45Z' ,
        pattern_type: 'stix',
        pattern: "[network-traffic:dst_ref.value = '198.51.100.1']",
        splunk_field_name: "dest_ip",
        splunk_field_value: "198.51.100.1",
        tlp_rating: "RED",
        referenced_in_groupings: [
            "grouping--25c127c3-8009-43cb-8989-dafa4a4be162",
            "grouping--596b22bc-5bb6-41c5-801a-7208368ce5c6"
        ],
    },
    {   indicator_id: 'indicator--595876e2-9427-4084-b5f0-f147e94f708e',
        name: 'URL for Example',
        created_at: '2023-06-01T00:12:34Z' ,
        pattern_type: 'stix',
        pattern: "[url:value = 'https://example.com/abc']",
        splunk_field_name: "url",
        splunk_field_value: "https://example.com/abc",
        tlp_rating: "AMBER",
        referenced_in_groupings: [],
    },
];

const NUM_TABLE_COLUMNS = 6;

function getExpansionRow(row) {
    return (
        <Table.Row key={`${row.email}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={NUM_TABLE_COLUMNS}>
                <DL>
                    <DL.Term>Indicator ID</DL.Term>
                    <DL.Description>{row.indicator_id}</DL.Description>

                    <DL.Term>Name</DL.Term>
                    <DL.Description>{row.name}</DL.Description>

                    <DL.Term>STIX Pattern</DL.Term>
                    <DL.Description>{row.pattern}</DL.Description>

                    <DL.Term>Created At</DL.Term>
                    <DL.Description>{row.created_at}</DL.Description>

                    <DL.Term>Groupings</DL.Term>
                    <DL.Description><GroupingsLinks groupings={row.referenced_in_groupings}/></DL.Description>

                    <DL.Term>Splunk Field Name</DL.Term>
                    <DL.Description>{row.splunk_field_name}</DL.Description>

                    <DL.Term>Splunk Field Value</DL.Term>
                    <DL.Description>{row.splunk_field_value}</DL.Description>

                    <DL.Term>TLP Rating</DL.Term>
                    <DL.Description>{row.tlp_rating}</DL.Description>
                </DL>
            </Table.Cell>
        </Table.Row>
    );
}
function IndicatorActionButtons({row}){
    return (<div>
        <Button icon={<Plus/>} label="Add to Grouping" appearance="primary" />
        <Button icon={<Pencil/>} label={`Edit`} appearance="secondary" />
        <Button icon={<TrashCanCross/>} label={`Delete`} appearance="destructive" />
    </div>)
}
function ExpandableRows() {
    return (
        <Table stripeRows rowExpansion="multi">
            <Table.Head>
                <Table.HeadCell>Indicator ID</Table.HeadCell>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Splunk Field</Table.HeadCell>
                <Table.HeadCell>Created At</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {data.map((row) => (
                    <Table.Row key={row.indicator_id} expansionRow={getExpansionRow(row)}>
                        <Table.Cell>{row.indicator_id}</Table.Cell>
                        <Table.Cell>{row.name}</Table.Cell>
                        <Table.Cell>{`${row.splunk_field_name}=${row.splunk_field_value}`}</Table.Cell>
                        <Table.Cell>{row.created_at}</Table.Cell>
                        <Table.Cell><IndicatorActionButtons row={row}/></Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}

export default ExpandableRows;
