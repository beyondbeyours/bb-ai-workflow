# BB Private Studio — production contract

Updated 2026-10-09. This change is a preparation UI, not a working automated production backend.

## Routing

Every job has a brand, channel, lane, source assets, style reference and revision. Brand metadata, editor links, style notes and reference selections must stay scoped to that brand. The current browser-local workspace is not a multi-user permission boundary or cross-device sync.

- Scheduled content: calendar → creative → editable Canva → QA → BB approval in Canva → Canva export → publish.
- Requested content: BB brief → creative → editable Canva → QA → BB approval in Canva → Canva export → publish.
- Requested video: BB brief → source/timecode selection → CapCut timeline and graphics → QA → BB review in CapCut → editable handoff. MP4 export and publishing only when ordered.

## Approval and publishing

Approval must identify approver, exact external design/project, revision and timestamp. A typed link or a checked box in this preview does not prove external approval. Any edit invalidates prior approval. A verified export must come from the approved Canva/CapCut revision. Store the exported asset persistently; Canva export download URLs expire. Caption, destination account, schedule/timezone and exported asset belong to the same brand. Publishing needs idempotency, retry handling and an actual provider post ID/URL, not just a green UI state.

`workflow.js` describes these gates for later server-side enforcement. Client-side tests do not prove production authorization or actual export/publishing.

## Verified vs outstanding

Canva native connector: searched existing Beyond designs, copied page 1 of DAG8CqHj8jg to DAHXhO-Qguk, inspected editable elements, replaced a text layer successfully in draft, then cancelled the test edits. Original unchanged. This proves draft text editability, not automated design creation, export or approval receipt from the deployed website.

Canva official REST docs support export jobs. The native tool set in this session has no export action. The static website cannot invoke connectors. Sites plugin eligibility discovery is unavailable in this session, so no Canva app declaration or runtime integration has been fabricated.

CapCut: no callable connector is exposed here. Editable project creation, reopening timeline and mobile/desktop handoff are untested. A media bundle, SRT, EDL or MP4 must never be labelled a verified editable CapCut project. Start the integration test on the actual intended CapCut version/device, check separated text/audio/video tracks, linked media and save/reopen before accepting the route.

## Next engineering gate

1. Establish a supported authenticated Canva runtime path, inspect approved brand templates, test editable composition and export after approval.
2. Validate the actual CapCut project handoff path. Do not purchase a renderer or replace editable delivery with flattened MP4.
3. Add durable per-brand job/assets storage and signed-in access; keep keys server-side.
4. Integrate one chosen social account and test a single specifically approved Canva asset. Automated preparation may run on a schedule; publishing still waits for BB approval.

No paid service purchased and no post published by this change.
