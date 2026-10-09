"use strict";
(function (root) {
  const crew = [
    { name: "BB", role: "Cockpit", sub: "Direction & Approval", x: 50, y: 75.5, sprite: 0, member: 0 },
    { name: "Leo", role: "Footage", sub: "Source & Selection", x: 39, y: 61.5, sprite: 1, member: 1 },
    { name: "Kitty", role: "Edit", sub: "Video Editor", x: 39, y: 50.5, sprite: 2, member: 3 },
    { name: "Tidy", role: "Graphics", sub: "Subtitles & Graphics", x: 64, y: 51, sprite: 3, member: 2 },
    { name: "Chicha", role: "Review", sub: "Quality Review", x: 52, y: 34.5, sprite: 4, member: 4 },
  ];
  function journey(lane) {
    const video = lane === "video";
    return [
      { owner: 0, text: "BB ส่งโจทย์จาก Cockpit", state: "Brief", pause: false },
      {
        owner: 1,
        text: video ? "Leo คัด Footage และช็อตเด่น" : "Leo เตรียมข้อมูลและวัตถุดิบ",
        state: video ? "Footage" : "Creative",
        pause: false,
      },
      {
        owner: 2,
        text: video ? "Kitty เรียง Timeline ใน CapCut" : "Kitty จัดองค์ประกอบใน Canva",
        state: video ? "CapCut" : "Canva",
        pause: false,
      },
      { owner: 3, text: "Tidy จัดข้อความ กราฟิก และหน้าปก", state: "Graphics", pause: false },
      { owner: 4, text: "Chicha ตรวจเทียบ Brief และ Reference", state: "Review", pause: false },
      { owner: 0, text: video ? "รอแม่ตรวจใน CapCut" : "รอแม่ตรวจและอนุมัติใน Canva", state: "Approval", pause: true },
      {
        owner: 0,
        text: video ? "จำลองการส่งโปรเจกต์แก้ต่อและ Export" : "จำลอง Export จากงาน Canva ที่อนุมัติ",
        state: "Export",
        pause: false,
      },
      { owner: 0, text: "จบ Journey ตัวอย่าง · ไม่มีไฟล์ถูก Export หรือโพสต์จริง", state: "Complete", pause: false },
    ];
  }
  function metrics(jobs, references, brandId) {
    return {
      jobs: jobs.filter((j) => (j.brand?.id || "beyond") === brandId).length,
      references: references.filter((r) => (r.brandId || "beyond") === brandId).length,
    };
  }
  root.BBSimulator = { crew, journey, metrics };
})(typeof window === "undefined" ? globalThis : window);
