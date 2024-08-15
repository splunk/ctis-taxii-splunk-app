# CTIS TAXII ES Integration - TODO
## Backend
### Unknowns
- [X] Logging: https://dev.splunk.com/enterprise/docs/developapps/addsupport/logging/loggingsplunkextensions
- [X] Read from kvstore collection
- [X] Write to kvstore collection
- [ ] Read config saved by UCC
### Endpoints
- [X] Suggest a conversion from splunk_field=value => STIX2 Pattern
  - [ ] Handle CIDR slash range for IPv4: e.g. 10.2.4.5/24 
- [ ] Indicator Model
    - [ ] Create
        - [ ] Find a good library to handle JSON schema validation & maybe Dataclass compatibility 
        - [ ] Schema versioning: to handle updates/breaking changes to the app
        - [ ] https://dev.splunk.com/enterprise/docs/developapps/manageknowledge/kvstore/usetherestapitomanagekv/ 
    - [ ] Read One
      - [ ] Query by _key=indicator_id?
    - [ ] List
      - [ ] Query by keyword / regex on one or more fields
        - Use mongodb query format: e.g. for substring search: `{"field": {"$regex": "substring"}}`
      - [ ] Pagination
    - [ ] Update
    - [ ] Delete
- [ ] Grouping Model
    - [ ] Create
    - [ ] Read One
    - [ ] List
    - [ ] Update
    - [ ] Delete
- Submissions
    - [ ] Read One
    - [ ] List
- Scheduled Submissions
    - [ ] Read One
    - [ ] List
      - [ ] Filter by status (submitted, pending, failed)
    - [ ] Delete/Cancel
- [ ] Submit grouping to TAXII
- [ ] Schedule submission of grouping to TAXII
- 
## Frontend
- New Indicator Form
    - [X] Autopopulate STIX pattern upon Splunk field name/value change (if text field is blank)
    - [X] Fix bug, clearing a text field with the 'x' doesn't clear the value
    - [X] Use TLP version 1: https://www.first.org/tlp/v1/
      - make sure form field says that it expecting TLPv1
      - seems to be just RED, AMBER, GREEN, WHITE
    - [ ] Populate Groupings dropdown from REST endpoint
- [ ] Stretch feature: Event-level workflow action -> Add Multiple IOCs to Grouping

