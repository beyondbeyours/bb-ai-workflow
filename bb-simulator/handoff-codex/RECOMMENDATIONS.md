# BB Simulator · Recommendations to finish it well

Ordered by value to แม่ and by dependency. Each item has a done-when. Prices, plans and API capabilities must be checked in official current docs before use; nothing here is a verified claim about a third-party API.

## P0 · Make what exists solid (no new accounts, no cost)

1. **Project tooling**: add `package.json` (Playwright as devDependency, scripts `serve`, `test:unit`, `test:browser`), a GitHub Actions workflow running unit + browser tests at 390 and 1440. Done when CI is green on every push.
2. **One state store**: replace DOM-moving in `order.js` and global wrapping in `timeline.js` with a small store (`brief`, `visualSpec`, `timeline`, `review`) and render functions. Keep the localStorage/IndexedDB keys compatible (write a migration test with an old saved brief). Done when no file reassigns another file's global function.
3. **CSS cleanup**: one tokens file (wine `#4f0208`, deep `#350207`, pink `#f6e0e3`, yellow `#f7cb3f`, ivory), remove dead rules from `style.css`/`simulator.css`, drop the unused `#crew` section. Done when screenshots at 360/390/1366/1440 match the current ones.
4. **Real-device QA**: iPhone Safari + Android Chrome: stage drag vs page scroll, pinch, video playback (H.264 MP4), file picker, IndexedDB quota messages. Fix what breaks.
5. **Accessibility**: keyboard path through Order Builder cards (radio-group arrows), focus states, contrast on pink cards, reduced-motion for stage camera. Run an axe audit.
6. **Assets**: convert large PNG sprites to WebP with alpha (same crops), lazy-load lookbook images. Done when first load on mobile 4G is under ~3 s.
7. **Cover preview fix**: let BB upload or pick a clean frame (from Footage / Timeline cover shot) for the live mock instead of text-baked Style Board covers.

## P1 · Turn it into a shared production system (needs แม่ approval for accounts/cost)

8. **Backend + auth** (propose one option with current pricing, e.g. Supabase or Firebase; ask before creating anything): users, roles (BB approver, crew), brands, projects, briefs, timelines, review rounds, pins, files in storage, event log. Per-brand access enforced server-side. Migrate browser data with an import button.
9. **Team review links**: crew open a review round on their own device, mark "ทีมแก้แล้ว", upload v2; BB gets the pins back live. Keep the rule: pass only when every pin passed.
10. **Content Builder (Canva lane)**: brand templates with text/image slots, live preview, then create an editable Canva design from the template. Check Canva Connect API docs and the account plan (brand templates/autofill availability) first. BB approves in Canva; export only from the approved revision (rules already in `workflow.js`).
11. **Video handoff**: CapCut has no verified public project API here. Offer (a) Shot List + SRT + media folder for the editor, (b) optional draft MP4 assembled in-browser (ffmpeg.wasm) clearly labelled "Draft · ไม่ใช่ CapCut Project". Test whatever import CapCut supports on the target device before claiming it.
12. **Drive**: OAuth, verify access, read/download footage into the bin; show permission errors in plain Thai.
13. **Brand Kit per brand**: CI colours, fonts, logos, tone, banned items; palette and style cards read from the brand kit, not BB defaults.

## P2 · Fewer revision rounds (the main goal แม่ named)

14. **AI pre-check before BB sees it** (Chicha): compare the preview against the brief, subtitles text, brand kit and the Avoid list; produce suggested pins BB can accept or delete.
15. **AI assist in the brief**: suggest 3 hooks, 3 cover headlines, Super keywords and a shot order from the footage transcript; BB picks, nothing auto-applied. Show cost per call before enabling.
16. **Footage helpers**: transcription → editable SRT; scene detection → suggested In/Out marks in the timeline.
17. **Review power-ups**: draw a box/arrow on the frame, voice note per pin, frame snapshot attached to the pin, due date per pin, version diff slider, per-person filter in the revision sheet.
18. **Metrics that prove it works**: revisions per job, time from brief to pass, % briefs complete at first submit, pins per category. Show on the Simulator KPIs once real data exists.

## P3 · Delight

19. Simulator statuses driven by real jobs from the backend (who is working on what, waiting on BB).
20. Character motion (typing, camera raise) only with approved sprite sheets that keep identity; ask before generating.
21. Content Calendar lane UI: month view per brand, drag to schedule, approval gate before publishing; publishing only after explicit approval of each post.

## Guardrails that must stay

No fake success states; Demo always labelled; no MP4/media bundle called a CapCut project; nothing posted or exported without BB approval in Canva/CapCut; per-brand data never mixed; brand name "Y&Z Stories" (internal id `yaadz`); original logo and approved character identity unchanged; no hearts, nested frames, yellow outlines or harsh bright red.
