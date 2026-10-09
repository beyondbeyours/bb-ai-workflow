# BB Simulator — Claude Code Handoff

สำหรับแม่: แตก ZIP นี้ เปิดโฟลเดอร์ `BB-Simulator-Claude-Handoff-Under30MB` ใน Claude Code แล้วส่งข้อความใน `PROMPT_CLAUDE_CODE.md` ทั้งหมด

## ในชุดนี้

- `project/` ซอร์สเว็บล่าสุดครบชุด รวมภาพปัจจุบัน โลโก้ Thumbnail, SVG ตัวหนังสือ และ tests
- `CLAUDE.md` กติกาทำงานและลำดับการรีวิว
- `MASTER_BRIEF.md` ข้อกำหนดล่าสุดที่รวบรวมจากคำสั่งแม่ รวมข้อที่ห้ามทำ
- `WORKFLOW_AND_INTEGRATIONS.md` กระบวนการผลิตจริง เป้าหมายระบบหลังบ้าน และจุดที่ต้องพิสูจน์
- `REVIEW_AND_ACCEPTANCE.md` ปัญหาที่พบ เกณฑ์ตรวจรับ และรายการทดสอบมือถือ/แล็ปท็อป
- `RETURN_TO_GIGI.md` สิ่งที่ Claude ต้องส่งกลับเพื่อให้จีจี้รับช่วงต่อ
- `SOURCE_SNAPSHOT.json` เวอร์ชันและ commit ที่ใช้เป็นต้นทาง
- `ASSET_INVENTORY.json` รายการไฟล์พร้อม SHA-256
- `BRIEF_FIELDS.json` ช่องและตัวเลือกในหน้าบรีฟปัจจุบัน
- `REFERENCE_LOOKS.json` ข้อมูล Style Board ที่อยู่ในโค้ด
- `VALIDATION_REPORT.md` ผลตรวจชุดส่งต่อ

## ขอบเขตไฟล์

รวมซอร์สและไฟล์ที่เว็บใช้ใน `dist/` พร้อม `tests/` พร้อมเอกสารโปรเจกต์และ hosting manifest ที่ไม่มี secret ไม่รวม `.git`, credential, API key หรือ browser data ส่วนตัว

คลิป Reference ต้นฉบับและ Style Board ที่แม่อัปโหลดไว้ในเบราว์เซอร์ไม่ได้อยู่ใน repository ชุดนี้จึงรวม Thumbnail และ metadata ที่มีในโปรเจกต์ แต่ไม่อ้างว่ามีไฟล์วิดีโอต้นฉบับครบ ต้องนำต้นฉบับจากแม่มาเชื่อมอีกครั้งก่อนวิเคราะห์วิดีโอจริง

บรีฟ/Reference ที่บันทึกใน localStorage หรือ IndexedDB บนเครื่องแม่ไม่ได้ติดมากับ ZIP และไม่ sync ข้ามอุปกรณ์โดยอัตโนมัติ

## เปิดดูและตรวจโค้ด

จากโฟลเดอร์ `project/` ใช้:

```bash
python3 -m http.server 4173 --directory dist
```

เปิด `http://localhost:4173` บนเครื่องที่รัน จาก terminal อีกหน้าหนึ่งใน `project/`:

```bash
node --check dist/app.js
node --check dist/simulator.js
node --check dist/simulator-model.js
node --check dist/workflow.js
node --test tests/workflow.test.cjs tests/simulator.test.cjs
```

ไม่มีขั้นตอน `npm install` หรือ build ในต้นแบบนี้ ใช้ Node.js สำหรับ tests และ Python 3 สำหรับ local preview

## สถานะล่าสุด

เว็บ: https://bb-private-studio.nextniza.chatgpt.site

ชื่อปัจจุบัน: **BB Simulator** เว็บไซต์เดิมยังใช้ slug `bb-private-studio` การมีหน้าเว็บเผยแพร่แล้วไม่ได้หมายความว่า production integrations เชื่อมแล้ว

ต้นทาง commit: `d3f9ec1ab85bee9d12f981da9791f00f2d623aa3` การส่งต่อนี้ไม่ได้แก้หรือ deploy เว็บเพิ่ม


## รุ่นขนาดต่ำกว่า 30 MB

ตัดเฉพาะภาพ render เวอร์ชันเก่า 11 ไฟล์ที่ runtime ไม่อ้างถึง รายการอยู่ใน OMITTED_HISTORY.json เก็บ master identity, current simulator assets และ source/tests ครบ

คำสั่งล่าสุด: ทำงานกับแม่เป็นรอบ ส่ง Preview ให้ตรวจและแก้จนแม่พอใจ ยังไม่ต้องสร้างชุดส่งกลับ Gigi จนแม่สั่ง คำสั่งนี้ override RETURN_TO_GIGI.md และคำสั่งส่ง ZIP อัตโนมัติในเอกสารเก่า
