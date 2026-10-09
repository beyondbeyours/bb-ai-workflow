# Review priorities and acceptance

## Known observations from actual user feedback

1. BB ถูกเปลี่ยนเป็นครึ่งตัว แต่ลูกทีมยังเป็นเต็มตัวจิ๋ว ทำให้ใบหน้าคนละ scale — เปลี่ยนเป็น half-body แล้วใน v20 แต่ต้องตรวจ rendered scale จริง
2. ท่าเท้าคางซ้ำ — เปลี่ยนเป็น working props ใน v20
3. ทุกคนหัน/ก้มองศาใกล้กัน — เปลี่ยน body/head angles ใน v21
4. Kitty เป็น side profile จนซ่อนหน้า — เปลี่ยนให้เห็นสองตาใน v22
5. ภาพเครื่องบินเดิมขาดหัว/ท้าย — เปลี่ยน full aircraft ใน v19
6. แบรนด์ผิด — ปัจจุบัน visible name Y&Z Stories, legacy key yaadz คงไว้
7. ผู้ใช้พบ UI ครอปภาพ, text-heavy Work Zone, video preview มีแถบแดง, Thumbnail ไม่สวย, ขาด Avatar, เรียง role ผิด และ Brief ไม่ละเอียดเพียงพอในรอบก่อนหน้า ต้องตรวจว่าไม่มี regression

## Not yet visually verified

ไม่มี browser/device visual QA ใน environment ที่ทำ snapshot นี้ ผล 9 automated tests ไม่พิสูจน์ typography, hit area, actor placement, clipping หรือ mobile behavior

ต้อง inspect ภาพ sprite sheet เป็น alpha จริงบน background ใช้งาน ไม่ใช่ดู RGB preview อย่างเดียว ภาพแต่ละคนต้องไม่ bleed เข้าจาก cell ข้างเคียง ไม่หั่นมือ/prop ตอนจัดลง cell

## Code risks to audit

- `dist/index.html`, `style.css`, `app.js` มีบรรทัดยาว/logic รวมหลาย feature ยากต่อ review จัดรูปแบบและแยก component/module ตามความคุ้มค่าโดยคง behavior
- CSS หลายรอบ append override; ตรวจ cascade desktop/mobile ไม่ให้ geometry เก่ากลับมา
- Sprite sheet crop กับ CSS aspect ratio ต้องไม่ stretch หน้า/ลำตัว และไม่ใช้ mask เพื่อซ่อนงานที่ผิดจนดูขาด
- Absolute station coordinates ต้องสัมพันธ์กับ rendered image ในทุกขนาดหน้าจอ
- Cockpit foreground duplicate image + polygon clipping ต้องไม่บัง face/name/action และไม่รับ pointer events
- Legacy team wording ใน app.js อาจยังบอกหัวหน้าคิดก่อนให้แม่อนุมัติ ซึ่งขัดกับ BB คือผู้สั่ง/อนุมัติ ให้รวม semantic role mapping แหล่งเดียว
- Actor portrait and identity panel crop ต้องตรงกัน ไม่มีคน/ชื่อ/บทบาทสลับ
- `simulator.js` ครอบ save handler / renderReferences global; ตรวจ load order, missing IDs, duplicate handlers และเลือก brand/lane ระหว่าง Demo
- selected reference/source blob lifetime, object URL revoke, IndexedDB failure/quota, refresh/session loss ต้องแจ้งตรงจริง
- Step tabs ที่กดข้ามอาจไม่ใช้ validation เดียวกับ Next; ตรวจไม่ให้ส่งผลิตได้ทั้งที่ field สำคัญขาด
- User input rendered safely; handle malformed storage; don't log tokens/private media

## UI acceptance

- Mobile widths 360, 390, 430 CSS px และ laptop 1366/1440: no horizontal overflow; no image stretching; airplane overview nose/wing tips/tail fully visible
- Portrait scale coherent across all five; clear both eyes; separate head/body/action directions; no repeated chin-resting
- Stations visible and characters integrated with seats/desks, not standing on screens or floating
- Every scene hit target obvious, usable ~44px or larger where possible; accessible via keyboard; labels and selected state clear
- Face/name visible together at first use; tools opened correspond to clicked person
- Brief main action visible immediately; menus don't force long explanatory reading
- Selected state, loading, missing asset, offline/quota errors are meaningful; font sizes read on mobile
- Reduced motion respected; motion control works; no layout jumps/scroll traps

## Functional acceptance scenarios

1. New requested video: choose brand → Brief including subtitle/Super/Cover → choose style/Reference → add Footage → Review → save → refresh → resume with documented persistence.
2. Content request: switch lane → irrelevant video requirements hidden/disabled → Canva editable deliverable clearly stated → ready for integration without fake completed status.
3. Y&Z Stories ↔ Beyond: references, jobs, style memory and destination accounts do not bleed; legacy yaadz jobs still visible with corrected display name.
4. Choose visual preset → manually adjust palette/layout → change platform → preserve explicit manual values.
5. Subtitle off/on, custom language, bilingual, Super language, Cover auto/manual behave consistently and survive draft save.
6. Reference upload vs footage separate, correct video aspect without forced red padding/cropped frames. Thumbnail chosen deliberately from cover/keyframe, not random media frame.
7. Demo: clearly labelled, no real job counts or approval/export/publish state changed, stops at BB approval; seated crew don't walk across desks.
8. Browser close/reopen and cross-device limitations tested; add export/import or persistent backend as appropriate rather than falsely claiming sync.

## Production acceptance

- Open actual Canva design; editable text/elements; actual BB review/approval evidence; exact approved revision export.
- Open actual CapCut project on target device; video/audio/text/graphics editable separately; media links resolve; save/reopen succeeds. Give exact CapCut version/device and source of evidence.
- Any revision change revokes prior approval; wrong editor/source cannot pass; export without approval fails; retry cannot create duplicate post.
- Auth and per-brand access verified server-side, no secrets in client.
- Do not mark these passed until integration exists and was tested. Client-only test suite is not sufficient.

## Quality reporting

แม่ขอให้ตรวจงานให้รอบคอบและไม่ส่งงานที่ต่ำกว่า 9.5/10 ให้ประเมินจากเกณฑ์ข้างต้นพร้อมหลักฐาน ไม่ให้คะแนนตัวเองสูงเพื่อเลี่ยงจุดที่ยังไม่ผ่าน รายงาน UI, functionality, integration และ unverified areas แยกกัน ไม่อ้างว่า perfect ถ้ายังไม่เทสต์
