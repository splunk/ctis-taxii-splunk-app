const data = [
    {
        indicator_id: 'indicator--4a6fb8ca-6e63-420c-b755-52254f96164b',
        name: 'Suspicious Domain: site.of.interest.zaz',
        created_at: '2024-07-16T01:43:45Z',
        pattern_type: 'stix',
        pattern: "[domain-name:value = 'site.of.interest.zaz']",
        splunk_field_name: "host",
        splunk_field_value: "site.of.interest.zaz",
        tlp_rating: "GREEN",
        referenced_in_groupings: [
            "grouping--25c127c3-8009-43cb-8989-dafa4a4be162"
        ],
    },
    {
        indicator_id: 'indicator--8d8821ad-821b-4f39-a3a7-68bb9eb2be4a',
        name: 'Destination IPv4 for C2 traffic',
        created_at: '2024-01-15T01:43:45Z',
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
    {
        indicator_id: 'indicator--595876e2-9427-4084-b5f0-f147e94f708e',
        name: 'URL for Example',
        created_at: '2023-06-01T00:12:34Z',
        pattern_type: 'stix',
        pattern: "[url:value = 'https://example.com/abc']",
        splunk_field_name: "url",
        splunk_field_value: "https://example.com/abc",
        tlp_rating: "AMBER",
        referenced_in_groupings: [],
    },
];
export default data;
