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
