# BB Simulator — simulator v18

## Interaction

Default entrance is the Studio scene. BB controls the front Cockpit. Leo handles footage, Kitty editing, Tidy subtitles and graphics, Chicha QA. The portrait scene fits mobile; desktop places controls and dashboard beside it. Selecting a character opens its tools. The actual project/reference counts come from browser records for the selected brand. No fabricated production metrics.

Journey is an explicitly labelled, transient demo. The parcel travels between stations; character layers breathe and move independently. The demo pauses at BB approval and requires an explicit demo continuation. It never writes approvals, exports media, calls Canva/CapCut or publishes content. Reduced-motion styling and a motion toggle are included. This is a 2.5D interactive scene, not a WebGL 3D engine.

## Assets and generation

Built-in Imagegen used; original files retained. Project assets:

- `dist/assets/bb-simulator-cockpit-v18.png`
- `dist/assets/bb-crew-sprites-v18.png` (transparent RGBA sheet; five equal-width cells)

Final environment prompt: Keep the portrait 2:3 camera, jet silhouette, cream curved architecture and the four production workstations in upper/middle cabin. Change the large lower/front workstation at the airplane nose into BB's cockpit command center: panoramic windshield with clouds, wraparound ivory instrument console, three understated production timeline screens, steering yoke, large wine seat and space for an animated BB. Head is lower/front; rear QA remains top. No people, text, logo, labels, hearts or UI overlays. Solid deep wine backdrop. Clean simulator diorama art. Preserve the original crew identities separately.

Final crew prompt: Five separate full-body characters in one horizontal row, equal-width cells, transparent background, without furniture or text. BB with original bob-haired face and fitted black suit, white shirt and dark necktie holding a tablet; Leo wavy-haired man in cream overshirt with camera; Kitty long-haired woman in ivory blazer and wide-leg trousers; Tidy glasses and headphones, black outfit and tablet; Chicha chestnut bob, sleeveless ivory mock-neck and wide-leg trousers. Preserve recognizable faces from approved references, adult slim natural proportions, no uniforms, no cropped heads/hands/feet.

## Validation

Syntax checks, model tests, approval-pause tests, per-brand count tests, HTML IDs/asset references and click-binding references verified. Original browser-local brief/reference functionality retained. Browser interaction/layout QA could not be run: this managed environment has no supported control-browser skill. Device-specific visual behavior is therefore unverified. Deployment success proves hosting, not browser QA or production integration.


## V19 — complete aircraft and seated captain

### Imagegen prompts

```text
Use case: precise-object-edit. Edit target: image 1 is the current BB Simulator aircraft cutaway. Create a portrait 1024x1536 complete aircraft cutaway asset by PULLING CAMERA BACK and completing the missing airframe. Show ENTIRE private jet from rounded nose at bottom through tail fin and BOTH rear horizontal stabilizers at top, with BOTH full main wings visible inside the image. Leave at least 5% wine background margin beyond nose, tail and wing tips. Nothing touches image edges. Retain elevated frontal overhead camera, lengthwise portrait cabin layout, cream ivory curved walls and wine seating, front cockpit with broad console and captain seat, camera workstation lower left, editing desk middle left, graphics desk middle right, quality desk rear. Full nose exterior below windshield, full recognizable T-tail above engines. Premium intelligent 3D game simulator diorama, restrained satin materials and soft light, deep wine #350207 background. No people, no labels, no text, no frames. Keep workstation order and architecture as close to reference as possible; complete whole aircraft, do not just add wine bars to cropped picture.

Use case: identity-preserve and background-extraction. Image 1 is BB identity reference. Create a single transparent PNG game character cutout of THIS EXACT woman, preserve distinctive bob haircut, brown eyes, face, slim shoulders, black tailored suit, white shirt and charcoal tie. Seated upper-body portrait from head through waist, arms naturally bent forward resting on invisible cockpit console, facing viewer with confident friendly expression. Slight overhead angle to match elevated diorama game. Balanced slightly stylized large expressive head as original, not chibi, not full body. No legs, no chair, no console, no red background, no surrounding objects, no text. Fill canvas with head and upper torso, modest clear alpha margin, genuine transparent background. Polished 3D anime-realistic mascot style exactly like reference.
```

Built-in Imagegen edited the environment into a full portrait airframe with visible nose, tail and wings: `dist/assets/bb-simulator-full-aircraft-v19.png`. BB now uses an identity-referenced transparent seated upper-body asset: `dist/assets/bb-cockpit-seated-v19.png`. Foreground windshield occludes the captain at the lower cabin edge; every station target was repositioned for the new camera. BB stays at the Cockpit during the Demo.

Brand display and legacy job display normalize to Y&Z Stories; the existing `yaadz` storage identifier stays intact.

Validation: nine workflow/simulator tests, JavaScript syntax, local asset references, duplicate IDs. Browser/device visual verification unavailable in this environment.


## V20 — working crew proportion correction

Final built-in Imagegen prompt:
```text
Use case: precise-object-edit, identity-preserve. Edit this transparent four-character horizontal sprite sheet. Preserve EXACT four faces hairstyles clothing, left-to-right identities, canvas 2048x768, equal four 512x768 cells. Change ONLY poses and props. These are four SEATED waist-up professionals ACTIVELY WORKING, not posing. LEFT Leo cream jacket: looks at camera display, left hand supports camera right hand adjusts lens, alert. SECOND Kitty long dark hair white blazer: eyes directed to invisible editing screen, right hand reaches computer mouse at desk edge, left hand rests on compact keyboard. THIRD Tidy black shirt glasses headphones: focused on drawing tablet held horizontally, right hand draws with stylus, head upright. FOURTH Chicha short brown bob sleeveless ivory top: holds checklist clipboard at waist, points pen at checklist while reviewing it, head upright looking slightly at clipboard. Distinct pose for each, expressive engaged faces. No hand touching cheek/chin/face, NO chin-resting, NO identical crossed arms, no glamour pose. Hands and props inside individual cells with clear transparent gutters. Clear crown-to-waist half-body silhouettes, no legs, no chairs, no background or tabletop, no screens other than tiny camera display/tablet. Same polished semi-realistic 3D anime style. Genuine transparent alpha output.
```

Four new identity-referenced seated upper-body working portraits replace the miniature standing crew. All scene portraits have comparable visible head scales. Leo checks camera, Kitty edits with mouse/keyboard, Tidy uses stylus/tablet, Chicha reviews checklist. No chin-rest poses. Seated crew no longer walk across stations in the Demo.
Asset: `dist/assets/bb-crew-working-v20.png`, 2048x768 RGBA, built-in Imagegen.
Browser/device visual QA remains unavailable; supplied mobile screenshot was reviewed directly.


## V21 — differentiated body and head orientations

Built-in Imagegen final edit prompt:
```text
Use case: identity-preserve / precise-object-edit. Edit reference sprite sheet, KEEP 2048x768 transparent PNG, four equal 512x768 cells, exact faces/hairstyles/clothing/roles. MAIN CORRECTION: drastically DIFFERENT torso orientation and head angles for all FOUR. The current sheet has everybody facing same diagonal right; REMOVE THAT REPETITION. Left to right: (1) LEO man cream jacket, TORSO TURNED 40 degrees LEFT (viewer-left), head turned LEFT and looking DOWN at compact camera raised near chest, left shoulder visually recedes, adjusting lens. (2) KITTY long black hair ivory blazer, distinctly SIDE PROFILE facing RIGHT, body turned 65 degrees right; chin level eyes looking RIGHT at editing screen outside frame, hands low on mouse/keyboard. Nose points right, profile silhouette unlike all others. (3) TIDY glasses black shirt headphones, FRONT-FACING square shoulders, HEAD UPRIGHT STRAIGHT, eyes looking FORWARD, stylus right hand held over horizontal tablet at waist, absolutely no tilted head. (4) CHICHA bob ivory sleeveless, torso turned 25 degrees LEFT, slight relaxed lean BACK, head looking DOWN-LEFT toward checklist clipboard low on left side, right hand pointing pen at checklist. Clearly different shoulder lines, gaze directions and body poses. All seated waist-up. Do not make everyone look down/right. Nobody touches face/chin. Keep comparable crown-to-waist size and visual head scale. Polished semi-realistic anime 3D. Each complete character with hands and props contained WITHIN its assigned 512px cell; minimum 24px transparent empty gutter EACH side of each cell, no neighboring character bleed, no cropped shoulder/hand/prop. No background, no desks/chairs, no text.
```

Identity-referenced crew edit: Leo angled down-left to camera, Kitty right-facing side profile at keyboard, Tidy upright frontal with drawing tablet, Chicha angled three-quarter down toward checklist. Inspected generated output: shoulder lines and head/gaze orientations differ. Asset `dist/assets/bb-crew-angles-v21.png` (2048x768 RGBA) preserves transparent spritesheet geometry. Only asset reference/cache version changes, no workflow changes. Browser visual QA remains unavailable.


## V22 — visible faces with differentiated working poses

Built-in Imagegen edit prompt:
```text
Use case: precise-object-edit, identity-preserve. Correct FACE VISIBILITY on this exact transparent 2048x768 four-cell crew sprite sheet. Preserve all four recognizable identities, hairstyles, outfits, original props, unique working hand poses, and distinct shoulder/body orientations. Critical: every character shows BOTH EYES clearly, entire face and recognizable expression. NO side profile. Change the SECOND woman Kitty from side profile to near-frontal face gently turned only 10 degrees right, eyes toward viewer, preserving torso turned right and active mouse/keyboard hands. Also FIRST man Leo lifts chin slightly, turns face toward viewer to a mild 15-degree left three-quarter angle, both eyes clearly visible while maintaining left-angled shoulders and checking camera. THIRD Tidy stays upright frontal with drawing tablet. FOURTH Chicha preserves gently tilted head and diagonal clipboard posture but turns gaze up toward viewer so face visible. All four head orientations distinct but subtle; difference comes from shoulders, hands and props, NOT obscuring beautiful faces. Keep exact identity of each, head scales matching current sheet. Waist-up seated working portraits. No hand touching face/chin, no duplicated pose. Precisely four equal 512x768 cells, 24px transparent gutters on each side, do not cross cell boundaries. Genuine alpha transparent background, no objects behind them, no text.
```

Corrected Kitty's excessive side profile to a mild three-quarter face; Leo lifts face, Chicha looks up, Tidy stays frontal. All four show both eyes. Unique shoulders, hands and props provide pose variety. Inspected final generated asset `dist/assets/bb-crew-visible-faces-v22.png`, 2048x768 RGBA. Geometry and workflow unchanged. Browser/device visual validation remains unavailable.
