IMPORTANT — latest working instruction: Iterate with the user, show actual previews, accept feedback and keep improving until satisfied. Do not create a return ZIP for Gigi until the user explicitly requests it. This overrides earlier automatic packaging/return instructions below.

ให้รีวิวและพัฒนา BB Simulator จากโปรเจกต์ในโฟลเดอร์นี้ต่อจนพร้อมทดลองใช้งานจริง โดยรักษาบรีฟและ Asset ที่อนุมัติแล้ว

อ่าน START_HERE.md, CLAUDE.md, MASTER_BRIEF.md, WORKFLOW_AND_INTEGRATIONS.md, REVIEW_AND_ACCEPTANCE.md และ RETURN_TO_GIGI.md ก่อนแก้ จากนั้นตรวจโค้ด ภาพ และ UI จริงใน project/ อย่าใช้เอกสารแทนการตรวจซอร์ส

เริ่มจากเปิดเว็บบน local preview ตรวจมือถือและ laptop ให้เห็นปัญหาจริง แล้วแก้ให้ครบในรอบเดียว: สัดส่วนตัวละคร จุดกด การจัดวางไม่ทับกัน รูปเต็มลำ ความต่อเนื่องของ Workflow ความง่ายของการกรอก Brief และการแยกข้อมูลแต่ละแบรนด์

นี่คือเครื่องมือผลิต Content และ Video ที่มี Simulator เป็นหน้าควบคุม ไม่ใช่คู่มือสอน ไม่ใช่ภาพเกมโชว์อย่างเดียว ห้ามลดกลับเป็น Dashboard ที่มีแต่ตัวหนังสือ

หน้าตาหลักคือเครื่องบิน Private Jet แนวตั้งเต็มลำ BB คุมงานที่ Cockpit ลูกทีมทำงานประจำสถานี แตะตัวละครแล้วเปิดเครื่องมือที่เกี่ยวข้อง ชื่อทีมและหน้าตาต้องจับคู่ชัดเจน สมาชิกคือ BB, Leo, Kitty, Tidy, Chicha ส่วนแบรนด์ต้องสะกด Y&Z Stories

ทำความต่างของตัวละครจากท่าทำงาน แนวไหล่ แขน และอุปกรณ์ ทุกคนต้องเห็นหน้าชัด ไม่หันข้างเต็มตัว ไม่เท้าคางซ้ำกัน ไม่ทำให้ BB ใหญ่คนเดียวจนลูกทีมเป็นตัวจิ๋ว ห้ามเปลี่ยนใบหน้า ชุด โลโก้ หรือ CI ไปเอง

ทำ Brief ให้ฉลาดและกรอกง่าย ใช้ dropdown, multi-select, preset และภาพตัวอย่างที่กดเลือกได้ มี Reference Clip, Style Board, Brand Kit, Footage/Drive, Mood & Tone, Palette, Include/Keep/Avoid, Subtitles, Super และ Cover พร้อมภาษาและตัวเลือกให้ช่วยคิดข้อความเอง เก็บสถานะและกลับมาแก้ต่อได้โดยไม่สูญข้อมูล

ระบบผลิตมีสามสาย: Content Calendar, Content ตามคำสั่ง และ Video ตามคำสั่ง แต่ละแบรนด์แยกโปรเจกต์ CI Reference ช่องทางและทีมดูแล ภาพ/Content ต้องจัดใน Canva แบบแก้ไขได้ แม่ตรวจและอนุมัติใน Canva ก่อน Export และโพสต์ ส่วน Video ต้องส่งโปรเจกต์ที่เปิดและแก้ Timeline ต่อใน CapCut ได้จริง ห้ามใช้ MP4 หรือ media bundle แล้วเรียกว่า CapCut Project

รีวิวว่าระบบปัจจุบันทำอะไรจริงและอะไรเป็น Demo จากนั้น implement สิ่งที่ทำได้ใน local ให้ครบ ห้ามทำปุ่มสำเร็จปลอมหรืออ้างว่าเชื่อม connector แล้วถ้ายังไม่ได้ทดสอบจริง ถ้าการเชื่อมต้องใช้บัญชี สิทธิ์ หรือ API ที่ยังไม่มี ให้สร้างขอบเขต integration ที่ตรวจสอบได้และระบุสิ่งที่ขาดให้ชัด ห้ามแต่ง API หรือ documentation

ไม่ซื้อบริการ ไม่เปิด automation โพสต์จริง ไม่เปลี่ยนสิทธิ์เว็บไซต์ ไม่ deploy ไปบัญชีใหม่เอง งานนี้คือพัฒนาต่อและส่งชุดกลับให้แม่กับ Gigi

reuse Asset และโค้ดเมื่อเหมาะสม ไม่เพิ่ม dependency หรือเจนภาพซ้ำโดยไม่มีเหตุผล ถ้าต้องสร้างภาพใหม่ ให้รักษา identity และส่ง source/prompt ด้วย ไม่ต้องถามยืนยันรายละเอียดเล็กน้อยที่ตัดสินใจจากบรีฟได้

ส่งกลับเป็น ZIP โปรเจกต์ที่เปิดต่อได้ พร้อมภาพ preview มือถือ/laptop, changelog, test report, รายการ integration ที่ยังไม่เชื่อม, และ GIGI_NEXT_STEPS.md ระบุสิ่งที่จีจี้ต้องทำต่อ ห้ามส่งเพียงคำแนะนำหรือแผน
