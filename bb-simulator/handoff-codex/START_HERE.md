# BB Simulator · Codex Handoff

For แม่: open this folder in Codex and send the whole text of `CODEX_PROMPT.md`.

## Contents

- `project/` full source (`dist/` = the web app, `tests/` = unit + browser tests + video fixtures, design notes)
- `CODEX_PROMPT.md` the instruction to give Codex (Thai)
- `HANDOFF_STATE.md` architecture, file map, storage keys, what is real / Demo / not connected, known issues
- `RECOMMENDATIONS.md` prioritized next work (P0 → P3) with done-when, and guardrails
- `WORKLOG.md` every review round with แม่: feedback, decisions, changes, test results
- `PREVIEW/` rendered screenshots of the latest rounds (real browser renders, not mockups)
- `docs/original-handoff/` Gigi's original brief, workflow and acceptance documents

## Quick start

```bash
cd project
python3 -m http.server 4173 --directory dist
node --test tests/workflow.test.cjs tests/simulator.test.cjs
```

Git: `beyondbeyours/bb-ai-workflow`, branch `claude/bb-simulator-review-eedejv`, folder `bb-simulator/` (same content plus older screenshots).
Private preview used during review: https://claude.ai/artifact/NQ1C4JfABSTtptHN2V923W (owner-only; data in that preview is browser-local).

## Status in one paragraph

The jet cabin Simulator (rotatable 2.5D stage, live statuses, execution log, production tracking), Work Zone home, picture-card Order Builder with live mock, Video Builder timeline with Shot List and SRT, and a Review room with timecode pins and a pass-only-when-all-pins-pass rule all work in one browser. There is no backend, no team sharing, and no Canva, CapCut, Drive or publishing integration yet.
