# BB Simulator · Handoff State (for Codex)

Date: 2026-10-10 · Prepared by Claude Code after 6 review rounds with แม่ (BB, the owner).
Source of truth: `project/dist` (buildless static HTML/CSS/vanilla JS). Git branch: `claude/bb-simulator-review-eedejv` in `beyondbeyours/bb-ai-workflow`, folder `bb-simulator/`.
Baseline received from Gigi: commit `d3f9ec1` (see `docs/original-handoff/`). Full round history: `WORKLOG.md`.

## 1. What the product is

BB Simulator is a web app (mobile + laptop) to order, track and review Content and Video production for several brands (Beyond Beyours, Thailista, Maemore AI, Y&Z Stories, custom). BB (แม่) directs from the Cockpit of a private jet; the crew are Leo (footage), Kitty (CapCut / Canva assembly), Tidy (subtitles, Super, graphics, cover), Chicha (QA). It is a working control center, not a tutorial and not a decorative game.

## 2. Run, test

```bash
cd project
python3 -m http.server 4173 --directory dist        # open http://localhost:4173
node --test tests/workflow.test.cjs tests/simulator.test.cjs      # 10 unit tests
# Browser tests need Playwright + Chromium (not a project dependency yet):
node tests/browser.smoke.cjs  [outDir]               # 79 checks, mobile 390 (W=1366 / W=1440 for laptop)
node tests/browser.review.cjs [outDir]               # 21 checks, Video Builder + Review (W=1440 for laptop)
```
`PLAYWRIGHT_PATH` env can point to a global Playwright install. Last results: unit 10/10, smoke 79/79 at 390/1366/1440, review 21/21 at 390/1440, no horizontal overflow at 360/390/1366/1440.

## 3. Script order and responsibilities (`dist/index.html`)

| File | Role |
|---|---|
| `workflow.js` | Pure gate model: lanes, steps, approval/export/publish rules, editor URL validation (unit-tested). |
| `app.js` | Original app: brief form, footage list, references (IndexedDB), save/load projects, drafts, review checks (`blockingIssues`, `reviewWarnings`), Style Board looks/palettes/layout preview, production queue + handoff links, Projects tab. Global functions are reused by later files. |
| `status.js` | `BBStatus.snapshot()`: single browser-local truth (brand, lane, saved briefs, refs, footage, title, issues, step completion, per-crew status text). |
| `simulator-model.js` | Crew data (names, roles, seat anchors on the jet image, avatar crops), Demo journey per lane, metrics (unit-tested). |
| `simulator.js` | Simulator tab: billboard crew on stage, crew tabs, person card, KPI tiles, production tracking (7 steps), execution log with filters, Demo engine. Emits `bbsim:select`, `bbsim:demo`, `bbsim:log`, `bbsim:refresh`; exposes `BBSimSelect`, `BBAvatar`. |
| `cabin-live.js/.css` | Ambient motion (clouds under the jet, beacons, engine/screen glow), status line in each name chip, mode chip, view toggles, Demo parcel along the aisle with trail. |
| `cabin-cam.js` | CSS-3D camera (no library): rotate, tilt, zoom, top view, overview, fly to a station; crew are billboards facing the camera. |
| `workzone.js` | Work Zone home: brief in progress, 4 steps, what is missing, Continue / New brief (two-tap), start per lane, recent projects. |
| `timeline.js` | Video Builder ("Timeline ร่าง") in the Footage step: clip bin (local + Drive links), In/Out, per-shot sub/Super/note/cover, reorder, preview playback, Shot List copy, SRT. Saved as `timeline` in the brief. Wraps `collectProject`, `loadProject`, `resetBrief`, `renderFiles`. |
| `review.js` | Review tab: review rounds per brand, versions v1..vn, pins by timecode + spot, category → owner routing, statuses, compare with previous version, revision sheet copy, pass only when every pin passed. |
| `order.js/.css` | Order Builder: Brief step as 6 picture-card chapters bound to the original form controls, live mock + order ticket. Moves some original fields into chapters; old form kept under "ตั้งค่าแบบละเอียดทั้งหมด". |
| `style.css`, `simulator.css` | Base + legacy styles with layered overrides (cleanup recommended). |

Hidden legacy sections still in `index.html`: `#crew` (old station view, unused), `#production` (queue + handoff links, reachable from "ดูคิวผลิต").

## 4. Storage (browser only, per device)

| Key | Content |
|---|---|
| localStorage `ai-video-studio-briefs-v1` | Saved projects (max 50). Keep compatible. Legacy brand id `yaadz` shown as "Y&Z Stories". |
| localStorage `bb-simulator-draft-v1` | Brief in progress `{project, step, savedAt}` (autosave). |
| localStorage `bb-studio-style:<brandId>` | Style name + notes per brand. |
| localStorage `bb-handoff:<brand>:<lane>:<title>` | Editor link + version from production queue. |
| IndexedDB `bb-private-studio` / `references` | Reference clips (blobs) per brand. Keep version 1 compatible. |
| IndexedDB `bb-simulator-review` / `sessions`, `files` | Review rounds, pins, preview file blobs. |

Footage files are object URLs for the session only; the timeline asks to re-attach them after reload.

## 5. What is real, what is Demo, what is not connected

Real (in this browser): brief capture via cards/forms, drafts, save/update projects, per-brand isolation, references, Style Board looks, palettes, Video Builder timeline + Shot List + SRT, Review pins/versions/pass rule, revision sheet, execution log of local actions, KPIs from local data.

Demo only (clearly labelled "DEMO · ไม่บันทึกงานจริง"): the journey across stations, crew "working" states, parcel animation.

Not connected / not built: backend, auth, team sharing, cross-device sync, Canva (create/approve/export), CapCut (no editable project is produced; the timeline is a spec), Google Drive reading, social publishing/scheduling, AI generation, notifications. "กำลังผลิตจริง" KPI is always 0 and says so.

## 6. Known issues / debt

- Cover/live mock overlays text on Style Board covers that already contain text (layout sketch only).
- Fonts: Kanit via Google Fonts (not verifiable in the build sandbox); no Coolvetica binary, so dynamic English text uses Kanit; static English labels are outlined SVGs in `assets/type/`.
- `order.js` and `timeline.js` move/wrap original DOM and globals; works and is tested, but should become a proper state store + components.
- CSS has many layered overrides across `style.css`, `simulator.css`, `cabin-live.css`.
- No `package.json`; browser tests rely on a globally installed Playwright.
- Not tested on physical iOS/Android; only Chromium device emulation.
- Unreferenced historical images remain in `dist/assets` (mascot-*, assistant-team-v10, bb-crew-sprites-v18); keep as identity references or move out of `dist`.
- When the camera is rotated far, a nearer person can cover a farther person's label (true depth).
- In the claude.ai Artifact preview, downloads (SRT, brief JSON) are blocked by the frame; they work on a normal site.
