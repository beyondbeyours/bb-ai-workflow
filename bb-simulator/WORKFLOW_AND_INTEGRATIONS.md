# Workflow and integration handoff

## สิ่งที่มีจริงใน snapshot

- Static Web UI: Simulator, Work Zone, Projects และ production preparation
- แตะ crew เปิด tools/menu, รวบรวม Brief, preset/dropdown, Style Board และ palette preview
- บันทึก metadata ของงานใน localStorage; Reference ใช้ IndexedDB; ดู Footage ที่แนบใน browser session
- Demo Journey แยกจากงานจริง และหยุดที่ BB approval
- workflow.js มี gate model และ tests สำหรับ revision/source/approval/export
- เว็บยังไม่มี authenticated production backend, cross-device sync หรือ multi-user permission enforcement
- ไม่ได้มี AI อ่าน Reference Clip หรือจดจำรสนิยมแบบ production service เพียงเก็บ reference/notes/selection ใน browser
- ไม่มีระบบผลิต Canva/CapCut, Export, Social Publishing หรือ scheduler ที่เชื่อมจริงใน deployed website

## กระบวนการที่ต้องทำให้เกิดจริง

### Content Calendar

Brand plan + schedule → เตรียม copy/visual → สร้าง editable Canva design → Tidy จัด text/cover/CI → Chicha QA → BB ตรวจและอนุมัติใน Canva → Export จาก approved Canva revision → จัดเก็บไฟล์ → โพสต์ไปบัญชีของแบรนด์นั้น → เก็บ provider post ID/URL และผลการส่ง

### Requested Content

BB brief + reference → ผลิต content/visual → editable Canva design → graphics/cover → QA → BB approval in Canva → approved revision export → publish ตามคำสั่ง/เวลา

### Requested Video

BB brief + footage + reference → shot/timecode selection → editable CapCut Timeline → Subtitles/Super/Graphics/Cover แยก tracks/elements → QA → BB review in CapCut → ส่ง project + linked media ที่เปิด/แก้/บันทึก/เปิดใหม่ได้จริง

Video ไม่ต้องโพสต์อัตโนมัติ ค่า default คือส่งแก้ต่อใน CapCut การ Export MP4 หรือโพสต์ต้องมีคำสั่งและ approval ของงานนั้น

## Role boundaries

BB สั่งและอนุมัติ; Leo คัด source; Kitty ตัดและประกอบ; Tidy จัดซับ/กราฟิก/cover; Chicha ตรวจ ไม่ควรมีสองคนอ้างเป็นผู้รับผิดชอบหลักของขั้นเดียวกัน รายละเอียด Canva/CapCut ต่างกันตาม lane แต่ role เดิมไม่สลับ

## Runtime design requirements

- Job identity: project ID, brand ID, channel ID, lane, owner/assignment, revision
- Persistent assets: source file identity, storage location, provenance, MIME/size, access rights; ห้ามใช้ object URL เป็น durable URL
- Reference memory: style fields ที่สกัดได้ + source/timecode + confidence + BB confirmation/version ไม่อ้างว่าโมเดลฝึก permanent memory โดยไม่มีระบบรองรับ
- Approval: exact editor project/design ID, revision, approver, timestamp, verified origin; checkbox/link ที่ผู้ใช้พิมพ์ไม่ใช่ verified receipt
- Edit invalidates approval/export ของ revision เก่า
- Export identity ต้องตรง approved revision และมาจาก Canva/CapCut จริง เก็บ bytes ก่อน URL หมดอายุ
- Publish: brand-specific account, caption/hashtags, timezone Asia/Bangkok, schedule, idempotency key, retries/error handling, provider post ID/URL
- บันทึก audit/event log; failed task ไม่แสดงเป็น done; retry ไม่สร้างโพสต์ซ้ำ
- แยก per-brand credentials และ authorization ที่ server ไม่ใช้ dropdown เป็น security boundary
- เก็บ secrets server-side มี reconnect/permission errors ที่เข้าใจง่าย

## Integration evidence and boundaries

`project/PRODUCTION-WORKFLOW.md` บันทึกการทดลอง Canva ใน session ก่อนหน้า: แก้ text layer ใน draft ได้แล้ว cancel เพื่อไม่เปลี่ยนต้นฉบับ นี่ไม่พิสูจน์ว่า deployed website สร้าง design, อ่าน approval หรือ export ได้

อย่านำการที่ ChatGPT/Codex มี connector มาเท่ากับเว็บ local มี connector นั้นด้วย การติดตั้ง skill ไม่ทำให้เว็บเรียก API ได้เอง

Canva: ตรวจ official current documentation, account eligibility/scopes, approved templates และ editable elements ก่อน implement runtime path ทดลองการแก้/ตรวจ/approve/export เป็นวงจรหนึ่งงานจริง ยังไม่มี credentials หรือ verified integration ใน ZIP

CapCut: ยังไม่มี connector/API/project-writer ที่พิสูจน์แล้วในงานนี้ ห้ามแต่ง endpoint หรือ format ต้องพิสูจน์กับ CapCut version/device จริงว่าพร้อมแยก tracks/text/audio/media และเปิดใหม่ได้ SRT/EDL/media bundle/MP4 ไม่ใช่ CapCut project ที่ verified

Drive: URL ใน Brief เป็น input ข้อมูล ไม่ใช่ authorization ต้องตรวจ access แล้วทดสอบ download/read จริงก่อนสถานะ ready

Social: ต้องระบุ platform/account ของแต่ละ brand และ supported publishing route ทดลองโพสต์เฉพาะรายการที่แม่อนุมัติ การขอพัฒนาระบบนี้ไม่ได้อนุญาตโพสต์ test public อัตโนมัติ

Hosting: ปัจจุบันอยู่บน ChatGPT Sites แบบ owner-private manifest `.openai/hosting.json` ระบุ project ID เดิม GitHub/Netlify เป็นความต้องการที่เคยพูดถึง แต่ ZIP นี้ไม่มีหลักฐานบัญชี/permission/site config ที่ตรวจยืนยัน ไม่อ้างว่าเชื่อมแล้ว ไม่ซื้อ domain/service

## ลำดับพัฒนา

1. รีวิวและแก้ UI/interaction บน mobile + laptop พร้อมหลักฐาน screenshot
2. ตรวจ draft/Reference/source persistence, origin changes, brand isolation และ legacy data migration
3. ทำ typed integration boundaries + job state/events + backend/auth/storage เมื่อ stack และ access ชัด
4. พิสูจน์ Canva loop หนึ่งงานและ CapCut editable handoff หนึ่งงาน
5. ต่อ publishing และ schedule ที่รอ approval และทดสอบ retry/idempotency
6. Pilot ใช้งานจริงสองเคส: requested video และ requested Canva content แล้วค่อยขยาย calendar/multiple brands

## ค่าใช้จ่าย

ยังไม่มีค่าใช้จ่ายใหม่ที่อนุมัติจากงานนี้ Claude ต้องเสนอเฉพาะบริการจำเป็นหลังตรวจ account ปัจจุบัน และใช้ราคาจาก official current sources พร้อม quota/usage/bandwidth/storage/AI/API/export อธิบายต้นทุนตามใช้งานจริง ห้ามใส่ราคาคาดเดาเป็น fact ห้ามซื้อก่อนแม่อนุมัติ
