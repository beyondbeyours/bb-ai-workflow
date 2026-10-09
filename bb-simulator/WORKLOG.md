# BB Simulator · Work Log (Claude)

Baseline: Gigi handoff `d3f9ec1` imported unchanged in commit "Import BB Simulator baseline".
Source of truth for the app: `project/dist` (buildless HTML/CSS/vanilla JS).
Return package for Gigi is on hold until แม่ asks for it.

## Round 01 · 2026-10-09

Review findings (rendered in Chromium at 360/390 mobile, 1366/1440 laptop):

- Leo's face hidden behind Kitty; crew portraits oversized, floating over the fuselage and seats.
- Name chips sat on BB's chest and the crew's hands.
- Laptop 1366x768: Cockpit and BB below the fold.
- Crew dock had names only, no faces.
- Brand/lane picker only existed in Simulator; Brief and Projects did not show which brand was active.
- Brief: no autosave (refresh lost work); saving a reopened brief created a duplicate project.
- Projects: a brand with no projects showed a blank list; Reference list blank instead of empty state when only other brands had references.
- Mobile Style Board was a ~2,500px tall grid.
- Malformed `</button` close in Work Zone launch markup.

Changes:

- Scene: each person sits on their real station seat in the v19 aircraft (Chicha rear review desk, Kitty dual-monitor edit desk, Tidy tablet desk, Leo camera desk, BB cockpit chair). One shared portrait height; BB 1.1x for perspective only. Labels moved beside portraits, never over faces. Removed duplicate cockpit foreground image.
- Aircraft sized to fit the screen on laptop; chrome compacted. Crew roster with face avatars (cropped from the same sprites) beside the aircraft on laptop, under it on mobile.
- Brand + lane picker follows the user into Simulator, Brief and Projects (one element, one state).
- Draft autosave (`bb-simulator-draft-v1`, new key; existing keys untouched), Continue Brief after refresh, `+ บรีฟใหม่` (two-tap confirm, resets in place) to start clean. Save updates the same project ID instead of duplicating.
- Per-brand empty states for Projects and References.
- Mobile Style Board as a swipe row.
- Source formatted with Prettier for review (separate commit, no behavior change).

Tests:

- `node --test tests/workflow.test.cjs tests/simulator.test.cjs` → 10/10 (added face-overlap / scale test).
- `node tests/browser.smoke.cjs` (Playwright, mobile 390) → 57/57: tap each person opens the right tools, hit targets ≥ 44px, labels clear of faces, Demo leaves counts unchanged, draft survives reload, save upserts, Y&Z vs Beyond isolation, new brief (two-tap, in-page reset) keeps saved projects and saves separately, no page errors.
- No horizontal overflow at 360/390/1366/1440.

Not done / limits:

- Kanit could not load in this sandbox (Google Fonts blocked), so screenshots use a fallback Thai font. The real site loads Kanit.
- Cover Preview still overlays a headline on cover frames that already contain text.
- No backend, sync, Canva, CapCut, Drive or publishing integration (unchanged from baseline).

Preview (private Artifact, browser-local data only): https://claude.ai/artifact/NQ1C4JfABSTtptHN2V923W
Rendered screenshots: `PREVIEW/round-01/`

## Round 02 · 2026-10-09 · BB Town

แม่ asked for a living, game-like town (reference: the "AI agent 16 ตัว ทำงานใน marketing agency" reel) and chose: town + BB's jet parked as the Cockpit; art drawn in code.

Changes:

- New default view `town.js` / `town.css`: isometric floating island in CI colours, S-shaped road, one building per crew (Footage Studio · Leo, Edit House · Kitty, Graphics Lab · Tidy, Review Office · Chicha), Export Gate shown locked ("ยังไม่เชื่อม"), BB's jet parked at the airfield as the Cockpit.
- Jet: `assets/bb-jet-cutout-v1.png`, the approved v19 aircraft with its plain background removed by colour flood fill (no regeneration), projected flat onto the ground.
- Crew tokens use the same face crops as the roster. Tap token, building or jet → that person's tools.
- Bubbles in Workspace mode come only from this browser's data (brief title, Reference/Footage counts, subtitle/Super settings, Chicha's open review points). HUD shows Workspace counts; Demo shows "DEMO · ไม่บันทึกงานจริง".
- Demo: the previous owner carries the brief along the road to the next owner and walks home; road flow animates; stops at BB for แม่'s approval. Freeze/reduced-motion respected.
- Cabin view kept: "ในเครื่องบิน" button switches, "← กลับเมือง" returns; choice remembered in this browser.
- simulator.js emits `bbsim:select`, `bbsim:demo`, `bbsim:refresh` events and exposes `BBSimSelect` for other views.

Tests: unit 10/10; browser smoke 83/83 (town default view, every token/building/jet opens the right person, Workspace HUD, locked Export Gate, cabin switch and back, Demo labelled in HUD, plus all round-01 checks). No horizontal overflow at 360/390/1366/1440.

Limits: on laptop the town is height-limited (about 340-420px wide), so faces are small there; the roster beside it carries the large faces.

Screenshots: `PREVIEW/round-02/`

## Round 03 · 2026-10-10 · Living cabin (town reverted)

แม่: the town was the wrong direction. Keep the approved cabin; make it move, feel cute and alive, and give it an overview with buttons to follow status (Log etc.) like the reference reel.

Changes:

- Removed `town.js` / `town.css` (kept in git history, commit 64c8f7e). Cabin is the main view again.
- Jet now renders as `assets/bb-jet-cutout-v19.webp` (same v19 render, plain background removed, 190 KB) over a sky layer, so clouds stream under the aircraft as if it is flying.
- `cabin-live.js` / `cabin-live.css`: blinking wing and tail beacons, engine glow, soft screen glow at each station, tap "hop" on the selected person.
- Name chips now show a role icon, the name and one status line built only from this browser's data. Toggle with "ชื่อ" and "สถานะ".
- HUD: Workspace counts, or DEMO + "ไม่บันทึกงานจริง".
- Toolbar: Log (activity list) and Board (Status Board: brief progress Brief → Reference → Footage → Review, each crew's status, Export not connected; tap a row to open that person).
- Demo: the brief moves along the aisle between stations with a glowing dotted trail; the working person's chip turns yellow and role icons float up; stops at BB for แม่'s approval.
- simulator.js: emits `bbsim:log`; the old diagonal parcel jump was removed.

Tests: unit 10/10; browser smoke 67/67 (cabin main view, Workspace HUD, five status lines, Board rows and Export note, Board row opens Tidy, Log, panel close, status toggle, Demo HUD, plus round-01 checks). No horizontal overflow at 360/390/1366/1440.

Screenshots: `PREVIEW/round-03/`

## Round 04 · 2026-10-10 · 2.5D stage, overview panels, Work Zone home

แม่: more dimension like the WareTrack reference (rotate, pick zones); take the useful parts of the agent-studio reference (global status, person card, execution log) without its icon clutter; Work Zone looked unfinished.

Changes:

- `cabin-cam.js`: CSS 3D camera, no library (cdnjs is blocked in this sandbox, and the page needs none). The approved jet render is the floor; crew are billboards that always face the camera. Drag to rotate (mouse also tilts), pinch or ctrl+wheel to zoom, buttons for zoom / rotate / top view / overview. Tap a person → camera flies to that station; Demo follows the working station. Phones start nearly straight-on so faces stay large.
- Clouds moved below the floor plane, so they parallax and rotate with the aircraft.
- Removed clutter: floating role icons and Demo sparks, the separate crew roster under the stage, in-scene Log/Board buttons and sheet, duplicate Projects/Activity blocks.
- Simulator layout: KPI tiles (saved briefs, Reference, Footage, "กำลังผลิตจริง 0 · ยังไม่เชื่อมระบบผลิต"), production tracking under the stage (7 steps per lane, real states from the brief; Demo marked), person card with crew tabs (the only roster), state chip, "งานตอนนี้" + brief progress, tools; brand/lane card; Execution Log with type tags (OPEN/SAVE/START/SEND/WAIT/DONE/STOP) and filters (all / Workspace / Demo, per person).
- `status.js`: one shared snapshot of browser-local truth for the chips, side panel and Work Zone.
- Work Zone home rebuilt (`workzone.js`): banner with brand · lane; "งานที่กำลังทำ" with the 4 steps (tap to open), what is still missing (from the real review checks), Continue / New brief; one start card per lane (Video → CapCut, Content → Canva, Calendar → Canva + schedule, not connected); recent projects of the brand. Actions that would clear a draft ask for a second tap.

Tests: unit 10/10; browser smoke 74/74 at 390 mobile, 1366 and 1440 laptop (camera rotate/top view, KPIs, tracking, log filter, tabs, labels clear of faces in overview, Work Zone draft / missing / lanes / two-tap, plus earlier checks). No horizontal overflow at 360/390/1366/1440.

Limits: true 3D (walking around, seeing the back of seats) would need a modelled cabin; this is the approved 2D render tilted in 3D. When rotated far, a nearer person can cover a farther person's label (real depth). Screenshots: `PREVIEW/round-04/`

## Round 05 · 2026-10-10 · Video Builder + Review room

แม่: let BB build the order herself (DIY) so less is lost to guessing and long AI waits; for review, pin fixes point by point; reduce revision rounds. Decisions (grill): production = AI draft + human finishing; Video Builder v1 = rough timeline; review inside BB Simulator; a version passes only when every pin passes; footage from local files and Drive links; sharing with the team = copyable sheet (no backend yet, no cost).

Changes:

- `timeline.js` (Work Zone → Footage step, video lane only): clip bin from local footage + Drive links (listed as "ยังไม่ได้ตรวจสิทธิ์", not read); set In/Out from the player or by typing; per-shot subtitle, Super, note, cover frame; proportional timeline strip, reorder, edit, delete; total vs target length; sequential preview with subtitle/Super overlay; copy Shot List (timecodes in the final cut + source in/out); SRT built from shot order. Saved with the brief/draft (`timeline` field); local files must be re-attached after reload and the UI says so. Not a CapCut project; it is the spec an editor or AI assembles from.
- `review.js` + new Review tab: review rounds per brand (IndexedDB `bb-simulator-review`, separate from the existing reference DB); upload preview v1, v2…; tap the video/image to pin a spot (+ timecode for video) or "ปักหมุดที่วินาทีนี้"; category auto-routes to a person (ข้อความ/ซับ, สี/CI, หน้าปก → Tidy; จังหวะ, เพลง → Kitty; ภาพ/ช็อต → Leo) and can be changed; must-fix vs nice-to-have; statuses ต้องแก้ → ทีมแก้แล้ว → ผ่าน / ยังไม่ผ่าน; markers on the video track; compare with the previous version (synced); "คัดลอกใบสั่งแก้" grouped by person with timecodes; "ผ่านการตรวจ Preview" only on the latest version when every pin has passed, with a note that final approval stays in CapCut / Canva.
- Person tools now link here (BB: ตรวจงาน, Chicha: ห้องตรวจงาน, Leo: Footage + Timeline ร่าง).
- `tests/browser.review.cjs` + `tests/fixtures/*.webm` (generated test patterns).

Tests: unit 10/10; smoke 74/74 at 390 / 1366 / 1440; builder + review 21/21 at 390 and 1440. No horizontal overflow.

Limits: no backend, so files and pins stay in this browser (team cannot open them from their own device yet); Drive clips are not read or played; SRT download is blocked inside the claude.ai preview frame (works on a normal site); browser must be able to play the file (H.264 MP4 or WebM).

## Round 06 · 2026-10-10 · Order Builder (picture-card Brief)

แม่: the brief intake is not friendly; it needs layouts, looks and tones to pick from with pictures, not just dropdowns; think of it as the production control center.

Changes:

- `order.js` / `order.css`: the Brief step is now six short chapters with a progress bar: 1 งานอะไร (name, quick presets, content type, platform) · 2 เป้าหมาย (objective, audience, key message, CTA + destination) · 3 หน้าตา & โทน (looks from the real Style Board thumbnails, design style shown with real covers, mood as colour tiles, palettes, title position) · 4 ข้อความบนจอ (subtitle language / position / file, Super language / style / text, cover mode / text / image) · 5 เสียง & จังหวะ (pace, opening, music, audio, graphics; video lane only except graphics) · 6 ส่งมอบ (length, ratio, deliverable, deadline, Include / Keep / Avoid, rules, direction).
- Every option is a card with a small line illustration drawn in code (CI colours, no icon set, no generation cost) or a real thumbnail. Each card writes to the original form control, so drafts, save, review checks, Projects and older briefs keep working. "กำหนดเอง" shows the custom field right under its cards.
- Live preview beside the chapters (on phones above them): a mock of the piece in the chosen ratio with look image, title position, Super in the palette accent, subtitle language/position, platform + length tag; an order ticket of the picks; and what is still missing (from the real review checks).
- The old long form stays under "ตั้งค่าแบบละเอียดทั้งหมด (ฟอร์มเดิม)". The generic Back/Next bar is hidden on the Brief step because chapters have their own.

Tests: unit 10/10; smoke 79/79 at 390 / 1366 / 1440 (adds card picks → form values, selected state, live ticket, palette card, palette survives reload); builder + review 21/21 at 390 and 1440. No horizontal overflow.

Limits: the live mock is a layout sketch on Style Board covers that already carry their own text, not a render of the final piece. Screenshots: `PREVIEW/round-06/`
