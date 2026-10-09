# BB Simulator — consolidated latest brief

Compiled from the user's instructions through 9 October 2026, 22:35 Asia/Bangkok. This is a consolidated development brief, not a verbatim chat transcript. Latest corrections below override older names, costume directions and design experiments.

## Product

- ชื่อ **BB Simulator** เปลี่ยนจาก AI Video Studio / BB Private Studio
- เป็น Web App ที่ใช้ผลิต Content และ Video หลายแบรนด์ บนมือถือและ laptop
- หน้าควบคุมเป็น Visualization คล้ายเกม/Simulator มีชีวิตชีวา ตัวละคร สถานี งานเคลื่อนผ่านสถานี และสถานะที่ตรงกับข้อมูลจริง
- ไม่ใช่คู่มือสอน ไม่เปิดมาด้วยข้อความอธิบายยาว ไม่ให้ผู้ใช้เดาว่าต้องกดตรงไหน
- BB เป็นเจ้าของและผู้สั่งงานที่ **Cockpit** ไม่ใช่คนรับบรีฟหรือลูกทีม และเป็นผู้อนุมัติงานสุดท้าย

## Space and visual hierarchy

- Private Jet แนวตั้ง/ยาว มีโซนทำงานที่มี Journey และ concept ชัดเจน
- เห็นครบทั้งหัวเครื่อง หาง และปีก ไม่มีส่วนของเครื่องบินถูกตัด
- มือถือยังเห็นคนและจุดกดชัด ต้องแก้ความขัดแย้งระหว่างภาพเต็มลำกับขนาดจุดกด เช่น overview + focus view โดยไม่ครอป overview
- เคบิน ivory/neutral สบายตา เท่ ฉลาด พรีเมียมมีรสนิยม ไม่แดงทั้งเคบิน ไม่ฟุ่มเฟือยแบบโชว์ความหรู
- Cockpit เป็นศูนย์บัญชาการที่เด่นที่สุด คนตรวจงานไม่อยู่ในตำแหน่ง/ห้องที่ดูสูงกว่าเจ้าของ
- ห้ามเอาการ์ดหน้าที่หรือข้อความยาววางทับจนมองไม่เห็นเคบินและคน
- ขนาดและตำแหน่งคนสัมพันธ์กับเก้าอี้/โต๊ะ ไม่ยืนบนจอ ไม่ลอย ไม่ถูกป้ายชื่อบังหน้า

## CI

- พื้นหลัก wine red `#4f0208` และฉาก deep wine `#350207`
- ตัวหนังสือขาว `#ffffff` ขนาดอ่านง่าย โดยเฉพาะมือถือ
- แทรก soft pink `#f6e0e3` และ yellow `#f7cb3f` เล็กน้อยอย่างมีหน้าที่ ไม่ใช่ขอบตกแต่ง
- ค่าอื่นใน CI เดิม: primary red `#af0e28`, accent red `#dd041a`, black `#000000` ไม่ให้สีแดงสดแสบตาเป็นพื้นหลัก
- ใช้โลโก้ BB/BeyondBeyours ต้นฉบับที่ project/dist/assets/bb-logo.png ห้ามวาดใหม่หรือเปลี่ยนสัดส่วน
- English: Coolvetica, Title Case ไม่ใช้ ALL CAPS เป็นหลัก Thai: Kanit ตาม CI ที่ส่งไว้
- โปรเจกต์มี outlined SVG สำหรับป้าย English และใช้ Kanit สำหรับข้อความอื่น ยังต้องตรวจ dynamic English text ว่าตรงฟอนต์หรือไม่ ไม่มีไฟล์ Coolvetica font binary/licence ในชุดนี้
- ไม่มีไอคอนหัวใจ ไม่ทำสไตล์หวานเด็ก ๆ ไม่ใส่กรอบซ้อนกรอบ/ขอบเหลือง
- CI ของแต่ละแบรนด์ต้องแยกจากสี shell ของ BB Simulator ไม่ใช้ palette BB บังคับทุกแบรนด์

## Team — definitive mapping

| Name | Character | Responsibility |
|---|---|---|
| BB | ผู้หญิง bob ชุดดำ เสื้อขาว ไทสีเข้ม | Cockpit, direction, สั่งงาน ตัดสินใจและอนุมัติ |
| Leo | ผู้ชายผมสีน้ำตาล jacket สีครีม ถือกล้อง | Source/Footage, คัดวัตถุดิบและ Timecode |
| Kitty | ผู้หญิงผมยาว blazer ivory | Video Edit / จัดงานแก้ต่อใน CapCut; จัด Content ใน Canva ตามสายงาน |
| Tidy | ผู้ชายแว่น เสื้อดำ headphones | Subtitles, Super, Graphics, Cover และการตกแต่ง |
| Chicha | ผู้หญิงผมสั้นสีน้ำตาล เสื้อ ivory แขนกุด | Quality Review เทียบ Brief, Reference และ CI |

- รักษาใบหน้า ชุด และสไตล์ 3D semi-realistic ที่แม่เลือก ไม่แต่งลูกทีมเป็นยูนิฟอร์มก๊อปปี้ BB ไม่ทำให้เหมือนเด็กเสิร์ฟ
- ปัจจุบันใช้ครึ่งตัวทั้งทีม เป็นคนประจำสถานี ขนาดหน้าใกล้เคียงกัน มี perspective เล็กน้อยได้ แต่ห้าม BB ใหญ่คนเดียวและลูกทีมจิ๋ว
- ทุกคนเห็นตาทั้งสองข้างและใบหน้าชัด ไม่มี side profile เต็ม ๆ
- ความต่างมาจากแนวไหล่ แขน อุปกรณ์ และ action ไม่ทำองศาเดียวกันทุกคน ไม่เท้าคางซ้ำ
- Leo เช็กกล้อง, Kitty ใช้เมาส์/คีย์บอร์ด, Tidy ใช้ปากกา/แท็บเล็ต, Chicha ตรวจเช็กลิสต์, BB คุมงาน
- แตะรูปคนหรือ avatar ที่คู่กับชื่อ → เปิด tools/menu ของคนนั้น รูปในเคบิน ชื่อ ป้าย avatar และหน้าที่ต้องสัมพันธ์กันหนึ่งต่อหนึ่ง
- Motion บอกงาน/สถานะอย่างมีประโยชน์ ไม่ใช่ animation ที่รบกวนหรือขัดท่านั่ง ลด motion ได้

## Brands and channels

- Beyond Beyours, Thailista, Maemore AI, **Y&Z Stories**, และแบรนด์อื่นเพิ่มได้
- ห้ามใช้ชื่อ YaadZ Stories อีก Internal storage ID `yaadz` ให้คงไว้จนมี migration
- แยก CI, Reference, Style Memory, projects, channel accounts, calendar และทีมดูแลตามแบรนด์
- ทีมหลักห้าคนคือ role ที่ใช้งานข้าม brand ได้ เป้าหมายต้องมี context/team assignment ของแต่ละ brand ชัดเจน ไม่ปนข้อมูล

## Work Zone and Brief

เข้าแล้วเริ่มงานได้ทันที ใช้ขั้นตอนที่กดทำงานจริง เช่น Brief → Reference → Footage/Brand Assets → Review ไม่ใช้หัวข้ออธิบายอย่าง “หนึ่งสตูดิโอ ห้าหน้าที่” เป็นเนื้อหาหลัก

ต้องมี:

1. Project name, brand/channel, production lane, content type, objective, audience, platform, CTA, deadline และผลลัพธ์
2. คำสั่ง BB ที่เขียนเองหรือใช้ voice/keyboard dictation พร้อม preset ที่แก้ต่อได้
3. Upload/Link Reference Clip และ Upload Style Board แยกจาก Footage ที่เอามาผลิต
4. Drive link และ direct file upload มีสถานะสิทธิ์/เข้าถึง ไม่อ้างว่าอ่านไฟล์ได้เพียงเพราะมี URL
5. Include / Keep / Avoid เลือกหลายข้อได้ พร้อมกำหนดเองและล็อกสิ่งห้ามเปลี่ยน
6. Design style, Mood & Tone, pace, hook, visual direction, music/audio, graphics
7. คลิกภาพ Style Board/Thumbnail ที่คัดหน้าปกหรือเฟรมสวย ไม่สุ่มซีนไม่สวย ไม่ใส่คลิปที่แม่สั่งเอาออก
8. คลิก swatch/palette ของแบรนด์และเลือกแนว Text Layout/Cover เห็นผล Preview ทันที
9. Subtitle on/off, ภาษา, รูปแบบ, ตำแหน่ง และไฟล์ SRT ตามต้องการ แยกจาก Super
10. Super language, ข้อความ/คำสำคัญ, style และให้ AI เสนอได้
11. Cover brief: ข้อความที่ต้องการหรือให้ช่วยคิด, ภาษา, ภาพ/ช็อต, layout/style
12. Duration, ratio, resolution, fps, deliverables, revisions, rights และข้อจำกัดที่เกี่ยวข้อง
13. ตัวเลือกสั้น อ่านง่าย dropdown/multi-select/preset ใช้ให้เหมาะสม มี Custom เสมอ ไม่ซ่อนรายละเอียดสำคัญจนผู้กรอกไม่รู้ว่าขาดอะไร
14. แสดงช่องตามประเภทงาน ตรวจข้อขัดแย้ง เช่น ไม่ใส่ซับแต่ขอ SRT, ระบุสองภาษาแต่ไม่ได้เลือกภาษาที่สอง และไม่ reset ค่าที่เลือกเอง
15. บันทึก draft, กลับมาต่อ, Review สรุปก่อนสั่งผลิต และ reference/style memory ที่แก้/ลบได้

## Production constraints

- Content Calendar และ Content ที่สั่งเอง: ทำงานใน Canva ให้แก้ได้ แม่ตรวจ/อนุมัติใน Canva ก่อน Export จาก Canva แล้วโพสต์
- Video: BB สั่งโจทย์ ผลลัพธ์ต้องแก้ต่อได้ใน CapCut ไม่ใช่ AI MP4 แบนพร้อมโพสต์
- ความอัตโนมัติของ Content หมายถึงเดินการผลิตได้หลังตั้งค่า แต่ยังต้องหยุดรอแม่อนุมัติใน Canva ก่อนโพสต์
- ไม่โพสต์ output จาก AI โดยตรง ไม่ข้าม editor review
- ข้อมูลการส่งงาน: revision, ผู้ทำ, ไฟล์/ลิงก์แก้ได้, ข้อที่ตรง brief, จุดที่ยังไม่ผ่าน, ภาษาซับ/Super/Cover, เวลา/ปลายทางโพสต์ และสถานะอนุมัติ

## Rejected directions — do not reintroduce

Text-heavy portal instead of simulator; cropped aircraft; red cabin everywhere; over-luxurious decorations; bright red glare; hearts; nested frames/yellow outlines; tiny English/Thai copy; duplicate jobs; uniform copied outfits; generic replacement names; BB receiving brief instead of issuing direction; QA person positioned as chairman; full-body tiny crew with giant BB; identical chin-rest/head angles; side profiles hiding faces; UI claiming actual render/export/post while only Demo exists.
