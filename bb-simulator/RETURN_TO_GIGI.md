# Return package contract

ส่งกลับให้แม่เป็น ZIP เปิดต่อได้ ไม่ใช่เพียงสรุปในแชต

## Required contents

- project source ที่แก้ทั้งหมด พร้อม assets/fonts ที่มีสิทธิ์ใช้, tests, dependency manifests/lockfile หากเพิ่ม, และ config ที่ไม่มี secret
- `CHANGELOG.md`: changed behavior + reason, เทียบ baseline commit `d3f9ec1ab85bee9d12f981da9791f00f2d623aa3`
- `TEST_REPORT.md`: commands, pass/fail, browser/device/viewport, screenshots, actual integration evidence, untested limitations
- `PREVIEW/`: mobile + laptop screenshots ที่เป็น rendered UI จริง แยกจาก imagegen mockup
- `INTEGRATION_STATUS.md`: Canva, CapCut, Drive, storage/auth, social, schedule มีอะไร connected/tested และยังขาด access/scopes/endpoint/job verification ใด
- `GIGI_NEXT_STEPS.md`: next actions เรียงลำดับ, source path/entry points, data migration, pending decisions, exact blockers, สิ่งที่แม่ต้องตรวจ
- `RUN_AND_DEPLOY.md`: local preview/test/build commands ที่รันผ่านแล้ว, server env names (values excluded), hosting options ที่รองรับจริง
- หากภาพเปลี่ยน: reference file, final asset, final prompt, generation method, และเหตุผลรักษา identity
- data migration/export/import scripts หาก schema หรือ localStorage/IndexedDB keys เปลี่ยน
- checksum manifest หรือ commit IDs และ patch/changes เมื่อทำได้

## Suggested closing summary

1. เปิดดูที่ไหน / เปิด local อย่างไร
2. แก้อะไรแล้ว
3. ทดสอบอะไรผ่าน พร้อมหลักฐาน
4. อะไรยังไม่เชื่อม/ทดสอบ
5. จีจี้ต้องรับช่วงทำอะไรต่อ

## Resume instruction for Gigi

แม่กลับมาให้จีจี้ทำต่อ: อ่าน source และเอกสาร return package ปัจจุบันก่อนแก้ อย่านำ snapshot เก่าทับผลงาน Claude เปรียบเทียบกับ baseline และนำ revision ใหม่เข้า repo เดิมโดยคง project ID/access ก่อนทดสอบและเผยแพร่ ห้ามนำ browser-local sample data มาเป็น production account data
