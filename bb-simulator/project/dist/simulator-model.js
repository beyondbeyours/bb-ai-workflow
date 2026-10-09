"use strict";
(function (root) {
  // Station anchors are the bottom-centre of each portrait, in % of the full aircraft
  // image (1024x1536). Every portrait uses the same height (h) so faces share one scale.
  // BB sits nearest the viewer in the Cockpit, so a slight perspective scale (1.1) only.
  // avatar = face crop in source pixels: [cx, cy, radius] within the sprite cell.
  const crew = [
    {
      name: "BB",
      role: "Cockpit",
      sub: "Direction & Approval",
      x: 50,
      y: 73.2,
      label: "right",
      sprite: 0,
      member: 0,
      avatar: [512, 470, 330],
      scale: 1.1,
    },
    {
      name: "Leo",
      role: "Footage",
      sub: "Source & Timecode",
      x: 38.6,
      y: 59.6,
      label: "left",
      sprite: 1,
      member: 1,
      avatar: [330, 250, 190],
    },
    { name: "Kitty", role: "Edit", sub: "CapCut & Canva", x: 44.4, y: 48.2, label: "left", sprite: 2, member: 3, avatar: [290, 250, 190] },
    {
      name: "Tidy",
      role: "Graphics",
      sub: "Subtitles · Super · Cover",
      x: 59.8,
      y: 49.5,
      label: "right",
      sprite: 3,
      member: 2,
      avatar: [252, 245, 190],
    },
    {
      name: "Chicha",
      role: "Review",
      sub: "Quality Review",
      x: 51.3,
      y: 32.9,
      label: "right",
      sprite: 4,
      member: 4,
      avatar: [215, 265, 185],
    },
  ];
  const portraitHeight = 13;
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
  root.BBSimulator = { crew, portraitHeight, journey, metrics };
})(typeof window === "undefined" ? globalThis : window);
