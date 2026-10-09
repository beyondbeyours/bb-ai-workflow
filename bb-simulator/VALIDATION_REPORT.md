# Handoff validation

Baseline: `d3f9ec1ab85bee9d12f981da9791f00f2d623aa3` (deployed successfully before this export).

## Passed

- Existing Node test suite: 9/9 passed on 9 October 2026 while preparing this handoff.
- Tested contracts: crew/name/role mapping, Demo stops at BB approval for all lanes, per-brand browser counts, actor target coordinates, approval/export/publish gates, revision/source checks, editor URL validation.
- Source files copied byte-for-byte from baseline working tree; SHA-256 inventory supplied.
- All runtime assets and tests retained; 11 unreferenced historical render variants omitted for the 30 MB limit.
- Local static asset references, unique HTML IDs, simulator literal DOM references, and JavaScript syntax checked for this package.
- ZIP file integrity and inventory inclusion checked after packaging.
- Credentials, Git auth config, API keys, browser data and .git omitted.

## Not verified

- Rendered UI on mobile/laptop; touch usability; screenshot comparison; role-pose placement; sprite clipping; typography quality.
- Canva approval/export runtime, actual editable CapCut project, Drive permissions, social publishing, scheduling, backend authentication/storage or cross-device sync.
- Original Reference video bytes are not in this package; thumbnails/metadata cannot substitute for video analysis.

## Important interpretation

Passing client-side tests verifies limited preparation logic. It does not establish production readiness, real approval verification or live integrations. Claude must supply rendered browser evidence and real integration evidence before reporting those complete.
