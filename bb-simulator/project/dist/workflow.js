'use strict';
(function(root){
 const laneName=lane=>({video:'Video',content:'Content',scheduled:'Content Calendar'}[lane]||'Video');
 function validEditorUrl(lane,value){try{const u=new URL(value);return u.protocol==='https:'&&(lane==='video'?['capcut.com','www.capcut.com']:['canva.com','www.canva.com']).includes(u.hostname)}catch{return false}}
 const initial=lane=>({lane,stage:'draft',revision:1,approval:null,export:null,publishing:'not_connected'});
 function exportAllowed(job){return Boolean(job.approval&&job.approval.source===(job.lane==='video'?'capcut':'canva')&&job.approval.revision===job.revision&&job.approval.verified===true)}
 function publishAllowed(job){return exportAllowed(job)&&Boolean(job.export&&job.export.revision===job.revision&&job.export.origin===(job.lane==='video'?'capcut':'canva')&&job.export.verified===true)}
 function steps(lane){const video=lane==='video';return [
  {title:lane==='scheduled'?'Content Plan':'Brief',owner:'BB',detail:lane==='scheduled'?'กำหนดหัวข้อ แบรนด์ ช่องทางและรอบผลิต งานทุกชิ้นยังต้องผ่านแม่ก่อนโพสต์':'กำหนดโจทย์ Reference และผลลัพธ์ที่ต้องการ',status:'บันทึกบรีฟได้ · ยังไม่เริ่มผลิต'},
  {title:video?'Footage':'Creative',owner:'Leo',detail:video?'คัดช็อตและ Timecode จากไฟล์ต้นฉบับ':'เตรียมข้อมูล Copy และภาพตาม CI ของแบรนด์นี้',status:'ยังไม่ได้เชื่อมระบบผลิต'},
  {title:video?'CapCut':'Canva',owner:'Kitty',editor:true,detail:video?'ประกอบ Timeline พร้อม Media, Subtitles และ Graphics แยกส่วนให้แก้ต่อได้':'จัดวางใน Canva ให้ข้อความและองค์ประกอบแก้ไขได้ ไม่ใช้ภาพแบนทั้งหน้าแทนไฟล์ออกแบบ',status:video?'ต้องทดสอบเปิดโปรเจกต์จริงก่อนส่งมอบ':'ทดสอบแก้ข้อความผ่าน Canva แล้ว · เว็บยังไม่ได้เชื่อม'},
  {title:video?'Graphics':'Design',owner:'Tidy',editor:true,detail:video?'ตรวจภาษา Subtitles, Super และหน้าปกให้ตรงบรีฟ':'ตรวจหน้าปก ขนาดภาพ ฟอนต์และการวางข้อความใน Canva',status:'รอไฟล์งาน'},
  {title:'Review',owner:'Chicha',editor:true,detail:'ตรวจชิ้นงานเทียบบรีฟและ Reference ส่งจุดแก้ให้ทีม แม่เป็นผู้ตัดสินใจสุดท้าย',status:'รอไฟล์งาน · ไม่ใช่ผู้อนุมัติแทน BB'},
  {title:'Approval',owner:'BB',editor:true,detail:video?'แม่เปิดและแก้ใน CapCut ก่อนอนุมัติเวอร์ชันนั้น':'แม่ตรวจ แก้ และอนุมัติใน Canva ผูกผลอนุมัติกับไฟล์และเวอร์ชันที่ตรวจ',status:'ยังไม่ได้รับผลอนุมัติจากเครื่องมือ'},
  {title:'Export',owner:'BB',editor:true,detail:video?'เก็บโปรเจกต์ CapCut ที่เปิดแก้ได้พร้อมไฟล์ต้นฉบับ Export MP4 เมื่อแม่ต้องการ':'Export จาก Canva หลังอนุมัติ หากแก้งานใหม่ต้องตรวจและอนุมัติอีกครั้ง',status:'ล็อกไว้ · ยังไม่ได้เชื่อม Export'},
  {title:'Publish',owner:'BB',detail:'เลือกบัญชีของแบรนด์ Caption วันเวลาและเขตเวลา ใช้ไฟล์ที่ Export จากงานที่อนุมัติเท่านั้น เก็บลิงก์โพสต์และผลส่งจริง',status:video?'ตามคำสั่งแม่ · ยังไม่ได้เชื่อมช่องทางโพสต์':'รออนุมัติและ Export · ยังไม่ได้เชื่อมช่องทางโพสต์'}
 ]}
 root.BBWorkflow={laneName,validEditorUrl,initial,exportAllowed,publishAllowed,steps};
})(typeof window==='undefined'?globalThis:window);
