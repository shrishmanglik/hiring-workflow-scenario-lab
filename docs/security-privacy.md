# Security and privacy

## Data boundary

The runnable fixture is synthetic and contains tokenized operational records only. Names, contact details, protected attributes, credentials, free-form notes, interview content, and real employer/candidate identifiers are absent.

## Threats covered

- stale, altered, unhashed, or unauthorised snapshots;
- provider scopes containing mutation capability;
- cross-tenant identifiers or protected fields;
- unknown stage, timezone, or actor mappings;
- cyclic or impossible workflow contracts;
- duplicate and out-of-order events;
- double-booking, missing accessibility format, and timezone gaps;
- interviewer attempts to view/edit restricted state;
- metrics without denominator or lineage;
- AI ranking or write-tool requests;
- incomplete approval/rollback packets;
- partial imports or unhealthy detectors reported as green.

## Structural refusals

No ATS, calendar, HRIS, identity, warehouse, email, or chat mutation adapter exists. No model endpoint exists. No secrets are needed. The health endpoint reports `productionMutationCapability: false`.

## Evidence limitations

Local tests do not prove a live tenant boundary, production RLS, provider capability, legal compliance, or security acceptance. Those remain UNKNOWN. Any real-data path needs privacy/legal review, a retention schedule, provider scope canaries, cross-tenant negative tests, secret handling, incident response, and independent review.
