IMPORTANT — latest working instruction: Iterate with the user, show actual previews, accept feedback and keep improving until satisfied. Do not create a return ZIP for Gigi until the user explicitly requests it. This overrides earlier automatic packaging/return instructions below.

# Development contract

Read the handoff docs before implementation. The latest user requirements in MASTER_BRIEF.md override older project design notes. Inspect actual files; historical documents record prior work, not current capabilities.

## Working scope

Review and improve the existing production-tool prototype. Keep the private-jet simulator and original identity/branding. Implement reversible local changes autonomously. Do not purchase services, change account permissions, publish social posts, or deploy to a new account as part of this handoff.

## Architecture

Buildless static HTML/CSS/vanilla JS in `project/dist`. Script order and globals matter: workflow.js → app.js → simulator-model.js → simulator.js. Review index.html for exact order. No package manifest, bundler or npm dependencies currently required. Use existing tests in project/tests.

Do not migrate frameworks just for aesthetics. If a backend or build tool becomes necessary, document why, migration steps and data compatibility. Keep secrets on the server; never put them in browser code or ZIP.

Keep `ai-video-studio-briefs-v1`, IndexedDB `bb-private-studio`, and internal brand ID `yaadz` compatible. Its visible name must be Y&Z Stories. Changing the internal ID loses associations unless migrated deliberately.

## Visual guardrails

Character identity and original BB logo are fixed. Use current approved assets first. All five characters need coherent visible face scale; body/hand poses differ. No repeated chin-resting, severe side profiles, hearts, yellow outlines or nested decorative frames. Make desktop and mobile interactions accessible and visually test them.

## Truthful runtime

Demo remains visibly distinct from actual production. Local browser counts are not server metrics. Client approval booleans are not external approval verification. Workflow tests do not prove Canva or CapCut integration. Do not label an MP4/media bundle as an editable CapCut project.

## Validation and return

Run existing tests, add meaningful coverage for changed behavior, perform real browser checks on mobile and desktop when available. Explicitly report untested areas. Return complete source/assets, screenshots, validation and the next-action handoff specified in RETURN_TO_GIGI.md.
