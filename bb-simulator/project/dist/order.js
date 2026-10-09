"use strict";
// Order Builder: the Brief as a production control panel. Six short chapters of picture cards
// replace the long dropdown form; every card writes to the original form control, so saving,
// drafts, review checks and older briefs keep working. A live mock of the piece updates on every
// pick. The full form stays available under "ตั้งค่าแบบละเอียดทั้งหมด".
(function () {
  const step = document.querySelector('[data-work-step="0"]');
  const W = "#4f0208",
    P = "#f6e0e3",
    Y = "#f7cb3f",
    I = "#fffaf5",
    D = "#350207";
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  // ---------- small line illustrations (64x64), CI colours only ----------
  const phone = (inner, w = 30, h = 50) =>
    `<rect x="${32 - w / 2}" y="${32 - h / 2}" width="${w}" height="${h}" rx="5" fill="${I}"/>` + inner;
  const R = (x, y, w, h, f, r = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"/>`;
  const C = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
  const L = (d, s = W, w = 2.5) =>
    `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const T = (x, y, t, s = 11, f = W) =>
    `<text x="${x}" y="${y}" font-size="${s}" font-weight="700" text-anchor="middle" fill="${f}" font-family="Kanit, sans-serif">${t}</text>`;
  const person = (x, y, f = W) => C(x, y - 6, 4.5, f) + `<path d="M${x - 8} ${y + 8} q8 -12 16 0z" fill="${f}"/>`;
  const ART = {
    review: phone(R(22, 14, 20, 18, P) + R(26, 18, 12, 10, W) + R(22, 36, 20, 4, W) + R(22, 43, 12, 4, Y)),
    tutorial: phone(
      T(25, 22, "1", 8) + R(29, 17, 12, 4, P) + T(25, 32, "2", 8) + R(29, 27, 12, 4, P) + T(25, 42, "3", 8) + R(29, 37, 12, 4, Y),
    ),
    carousel: R(14, 18, 26, 30, P, 3) + R(19, 14, 26, 30, I, 3) + R(24, 10, 26, 30, W, 3) + R(29, 15, 16, 10, Y),
    single: R(14, 14, 36, 36, I, 3) + R(18, 18, 28, 20, P) + R(18, 41, 18, 4, W),
    article: R(14, 10, 36, 44, I, 3) + R(18, 14, 28, 8, W) + [26, 31, 36, 41, 46].map((y) => R(18, y, y === 46 ? 16 : 28, 2.5, P)).join(""),
    vlog: phone(R(19, 13, 26, 26, P) + C(32, 26, 6, W) + C(32, 26, 2.5, I) + R(19, 43, 26, 4, W) + R(19, 43, 10, 4, Y)),
    interview: R(10, 16, 44, 32, I, 4) + person(23, 34) + person(41, 34, D) + R(16, 40, 32, 4, Y),
    ad: phone(R(19, 13, 26, 14, W) + R(22, 30, 20, 3, P) + R(22, 35, 16, 3, P) + R(22, 42, 20, 6, Y, 3)),
    podcast: R(26, 12, 12, 22, W, 6) + L("M20 28 q12 16 24 0") + L("M32 38 v10") + L("M25 49 h14"),
    launch: phone(T(32, 30, "NEW", 9, W) + R(20, 34, 24, 3, P) + R(20, 40, 24, 6, Y, 3)),
    aware: C(32, 32, 18, P) + C(32, 32, 11, I) + C(32, 32, 5, W),
    sell: `<path d="M14 30 L30 14 H48 V32 L32 48z" fill="${P}"/>` + C(41, 21, 3, W) + R(22, 30, 14, 4, W),
    follow: person(26, 36) + R(40, 26, 12, 3.5, Y) + R(44.25, 21.75, 3.5, 12, Y),
    lead: R(16, 12, 32, 40, I, 3) + R(20, 18, 24, 5, P) + R(20, 27, 24, 5, P) + R(20, 38, 24, 7, W, 3),
    teach: R(12, 14, 40, 26, W, 2) + L("M18 22 h16 M18 28 h22 M18 34 h12", P, 2.5) + L("M26 40 l-6 10 M38 40 l6 10", W),
    story: `<path d="M12 18 q10 -4 20 2 v30 q-10 -6 -20 -2z" fill="${P}"/><path d="M52 18 q-10 -4 -20 2 v30 q10 -6 20 -2z" fill="${I}"/>`,
    newAud: person(32, 36, P) + L("M24 52 h16", W),
    oldAud: person(32, 36, W) + C(45, 20, 5, Y),
    owner: R(36, 16, 16, 32, P) + R(39, 20, 4, 4, W) + R(45, 20, 4, 4, W) + R(39, 28, 4, 4, W) + person(24, 38),
    worker: person(24, 34) + R(34, 34, 20, 13, W, 2) + R(31, 47, 26, 3, P),
    student: person(32, 38) + `<path d="M20 24 L32 18 L44 24 L32 30z" fill="${W}"/>`,
    course: R(10, 14, 44, 28, I, 3) + C(32, 28, 7, P) + `<path d="M30 24 l6 4 -6 4z" fill="${W}"/>` + R(24, 46, 16, 3, W),
    vertical: phone("" + R(22, 14, 20, 30, P), 26, 46),
    square: R(16, 16, 32, 32, I, 3) + R(20, 20, 24, 18, P),
    portrait: R(18, 12, 28, 38, I, 3) + R(22, 16, 20, 24, P),
    landscape: R(8, 20, 48, 27, I, 3) + R(12, 24, 40, 16, P) + `<path d="M28 28 l9 4 -9 4z" fill="${W}"/>`,
    classroom: R(12, 14, 40, 26, W) + R(16, 18, 32, 18, P) + person(32, 52, D),
    none: L("M22 22 L42 42 M42 22 L22 42", P, 3),
    custom: L("M18 44 L22 32 L40 14 L48 22 L30 40z M36 18 l8 8", W, 2.5),
    subBottom: phone(R(19, 13, 26, 28, P) + R(20, 43, 24, 5, W)),
    subMiddle: phone(R(19, 13, 26, 34, P) + R(20, 29, 24, 5, W)),
    fast: [14, 20, 26, 32, 38, 44, 50].map((x, i) => R(x, i % 2 ? 22 : 16, 4, i % 2 ? 20 : 32, i === 3 ? Y : W, 1)).join(""),
    balanced: [14, 26, 38, 50].map((x) => R(x - 2, 18, 8, 28, W, 2)).join(""),
    slow: R(10, 18, 22, 28, W, 3) + R(36, 18, 18, 28, P, 3),
    bestShot: phone(R(19, 13, 26, 34, W) + `<path d="M32 22 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="${Y}"/>`),
    question: phone(R(19, 13, 26, 34, P) + T(32, 36, "?", 20)),
    result: phone(R(19, 13, 26, 34, P) + L("M24 31 l6 6 11 -12", W, 3.5)),
    problem: phone(R(19, 13, 26, 34, P) + T(32, 37, "!", 20)),
    speaker: phone(R(19, 13, 26, 34, P) + person(32, 34)),
    music: L("M24 44 V18 l20 -4 v26", W, 3) + C(20, 44, 5, W) + C(40, 40, 5, W),
    voice: L("M14 32 h4 M20 24 v16 M26 18 v28 M32 26 v12 M38 20 v24 M44 28 v8 M50 32 h2", W, 3),
    original: R(10, 18, 44, 28, I, 3) + L("M14 32 q6 -10 12 0 t12 0 t12 0", W, 2.5),
    silent: L("M18 26 h8 l10 -8 v28 l-10 -8 h-8z", W, 2.5) + L("M42 26 l8 12 M50 26 l-8 12", P, 3),
    gfxMin: phone(R(19, 13, 26, 34, P) + R(22, 40, 10, 4, W)),
    gfxText: phone(R(19, 13, 26, 34, P) + R(21, 18, 22, 6, W) + R(21, 26, 16, 4, Y)),
    gfxCI: phone(R(19, 13, 26, 34, W) + R(22, 38, 20, 6, Y) + C(39, 19, 3, P)),
    file: `<path d="M18 10 h18 l10 10 v34 h-28z" fill="${I}"/>` + R(22, 30, 20, 4, W) + R(22, 38, 14, 4, P),
    folder: `<path d="M10 20 h16 l4 4 h24 v24 h-44z" fill="${P}"/>` + R(18, 32, 28, 4, W),
    ref: R(14, 14, 36, 36, I, 3) + L("M20 40 l8 -10 6 6 4 -4 6 8", W),
    brand: R(14, 16, 12, 32, W, 2) + R(26, 16, 12, 32, P, 0) + R(38, 16, 12, 32, Y, 2),
    lines: [18, 28, 38].map((y) => R(14, y, 36, 5, W)).join(""),
    oneIdea: phone(R(19, 13, 26, 34, P) + R(21, 27, 22, 7, W)),
    th: T(32, 38, "ไทย", 14),
    en: T(32, 38, "EN", 16),
    thEn: T(24, 30, "ไทย", 10) + T(40, 44, "EN", 12, D),
  };
  const art = (k) => `<svg viewBox="0 0 64 64" aria-hidden="true">${ART[k] || ART.custom}</svg>`;

  // ---------- picker definitions: select id → cards ----------
  const pick = {
    contentType: {
      รีวิวสินค้า: "review",
      Tutorial: "tutorial",
      Carousel: "carousel",
      "Single Post": "single",
      Article: "article",
      Vlog: "vlog",
      สัมภาษณ์: "interview",
      โฆษณา: "ad",
      Podcast: "podcast",
      คลิปเปิดตัว: "launch",
    },
    platform: { "Reels / TikTok / Shorts": "vertical", "Facebook / Instagram": "portrait", YouTube: "landscape", สื่อการสอน: "classroom" },
    objective: {
      เพิ่มการรับรู้: "aware",
      "ขายสินค้า / บริการ": "sell",
      เพิ่มผู้ติดตาม: "follow",
      "เก็บลีด / รับสมัคร": "lead",
      "สอน / อธิบาย": "teach",
      "เล่าเรื่อง / สร้างภาพลักษณ์": "story",
    },
    audience: {
      ผู้ชมใหม่: "newAud",
      ลูกค้าเดิม: "oldAud",
      เจ้าของธุรกิจ: "owner",
      คนทำงาน: "worker",
      "นักเรียน / นักศึกษา": "student",
      ผู้เรียนคอร์ส: "course",
    },
    cta: null,
    designStyle: null,
    mood: null,
    subtitles: { ไทย: "th", อังกฤษ: "en", "ไทย + อังกฤษ": "thEn", ภาษาเดิม: "voice", ไม่ใส่ซับ: "none" },
    subtitlePosition: { "ล่างใน Safe Area": "subBottom", กลางภาพ: "subMiddle", "ตาม Reference": "ref" },
    captionsFile: { ฝังซับในคลิป: "subBottom", "ฝังซับ + SRT": "file", "SRT แยก": "file", ไม่ต้องการ: "none" },
    superLanguage: { ไทย: "th", อังกฤษ: "en", "ไทย + อังกฤษ": "thEn", "ไม่ใส่ Super": "none" },
    superStyle: { เน้นคำสำคัญ: "gfxText", "สั้น หนึ่งประเด็นต่อช็อต": "oneIdea", "ตาม Reference": "ref", ข้อความที่กำหนด: "lines" },
    coverMode: { "ให้ทีมเสนอ 3 แบบ": "carousel", ใช้ข้อความที่กำหนด: "lines", ไม่ใส่ข้อความ: "none" },
    coverShot: { ช็อตเด่นจากคลิป: "bestShot", "ผู้พูด / บุคคล": "speaker", "สินค้า / ผลลัพธ์": "result", "เลือกภาพใน Style Board": "ref" },
    pace: { "กระชับ สมดุล": "balanced", "เร็ว มีพลัง": "fast", "ช้า มีพื้นที่หายใจ": "slow", "ตาม Reference": "ref" },
    hook: {
      ช็อตเด่นที่สุด: "bestShot",
      คำถาม: "question",
      ผลลัพธ์ก่อน: "result",
      "ปัญหา / Pain point": "problem",
      เปิดด้วยผู้พูด: "speaker",
      "ตาม Reference": "ref",
    },
    music: { เพลงที่มีสิทธิ์ใช้งาน: "music", ใช้เพลงที่แนบ: "file", "คงเสียงต้นฉบับ ไม่เพิ่มเพลง": "original", ไม่มีเพลง: "silent" },
    audio: { "เสียงพูดชัด เพลงอยู่ด้านหลัง": "voice", คงเสียงต้นฉบับ: "original", Voiceover: "speaker", เพลงเป็นหลัก: "music" },
    graphics: {
      "น้อย เฉพาะจุดสำคัญ": "gfxMin",
      "ตาม CI แบรนด์": "gfxCI",
      "ตาม Reference": "ref",
      เน้นข้อความ: "gfxText",
      ไม่ใส่กราฟิก: "none",
    },
    ratio: { "9:16 แนวตั้ง": "vertical", "16:9 แนวนอน": "landscape", "1:1 จัตุรัส": "square", "4:5 โพสต์": "portrait" },
    delivery: { "CapCut Project + ไฟล์ต้นฉบับ": "folder", "CapCut Project + MP4 หลังอนุมัติ": "file" },
  };
  const moods = {
    "มั่นใจ ฉลาด เป็นกันเอง": [W, P],
    "สงบ มีระดับ": ["#ebe4d8", "#8a7f74"],
    "สนุก มีพลัง": [Y, "#e2a5b3"],
    "จริงใจ เป็นธรรมชาติ": ["#c9b8a2", "#f3ead9"],
    "จริงจัง น่าเชื่อถือ": ["#29262b", "#cfc6bd"],
    "อบอุ่น สร้างแรงบันดาลใจ": ["#d98c5f", "#f6e0e3"],
  };
  const styles = {
    "ตามแบรนด์ BB": { look: null, colors: [W, P, Y] },
    "ตาม Reference": { art: "ref" },
    "เรียบ เท่ พรีเมียม": { look: "type" },
    Editorial: { look: "outfit" },
    Cinematic: { look: "workshop" },
    Documentary: { look: "classroom" },
    "Bold / Dynamic": { look: "mission" },
  };

  // ---------- chapters ----------
  const chapters = [
    { id: "job", title: "งานอะไร", hint: "ตั้งชื่อ เลือกประเภทงานและช่องทาง" },
    { id: "goal", title: "เป้าหมาย", hint: "ทำเพื่ออะไร ใครดู และให้คนดูทำอะไรต่อ" },
    { id: "look", title: "หน้าตา & โทน", hint: "เลือกลุคจากภาพจริง สไตล์ อารมณ์ และชุดสี" },
    { id: "text", title: "ข้อความบนจอ", hint: "ซับ Super และหน้าปก" },
    { id: "sound", title: "เสียง & จังหวะ", hint: "จังหวะตัด เปิดเรื่อง เพลง และกราฟิก" },
    { id: "deliver", title: "ส่งมอบ", hint: "ความยาว สัดส่วน กำหนดส่ง และข้อห้าม" },
  ];
  let current = 0;
  const ob = el("div", "ob");
  const nav = el("nav", "obNav");
  nav.setAttribute("aria-label", "ขั้นตอนสั่งผลิต");
  const body = el("div", "obBody");
  const preview = el("aside", "obPreview");
  ob.append(nav, preview, body);
  step.querySelector(".routingslot").after(ob);

  // Everything that was in the long form moves into one "advanced" drawer.
  const adv = el("details", "obAdvanced");
  adv.append(el("summary", "", "ตั้งค่าแบบละเอียดทั้งหมด (ฟอร์มเดิม)"));
  [...step.children].forEach((c) => {
    if (c === ob || c.matches("h2, .routingslot")) return;
    adv.append(c);
  });
  ob.after(adv);
  const titleBlock = $("title").closest("div"),
    presets = adv.querySelector(".chips");
  const keepBlock = el("div", "obRules");
  adv.querySelectorAll(".choicegroup").forEach((f) => keepBlock.append(f));
  for (const id of ["restrictions", "brief"]) {
    keepBlock.append(document.querySelector('label[for="' + id + '"]'), $(id));
  }

  function setValue(id, value) {
    const s = $(id);
    s.value = value;
    s.dispatchEvent(new Event("change", { bubbles: true }));
    if (id === "subtitles") $("subtitleEnabled").checked = value !== "ไม่ใส่ซับ";
    renderAll();
  }
  function cards(id, map, opts = {}) {
    const wrap = el("div", "obGroup");
    wrap.dataset.for = id;
    const head = el("div", "obGroupHead");
    head.append(el("h4", "", opts.title || id));
    if (opts.note) head.append(el("small", "", opts.note));
    wrap.append(head);
    const grid = el("div", "obCards" + (opts.wide ? " isWide" : ""));
    grid.setAttribute("role", "radiogroup");
    const s = $(id);
    [...s.options].forEach((o) => {
      const v = o.value;
      const b = el("button", "obCard");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.dataset.value = v;
      const pic = el("span", "obArt");
      if (v === "กำหนดเอง") pic.innerHTML = art("custom");
      else if (opts.render) opts.render(v, pic);
      else pic.innerHTML = art(map?.[v]);
      b.append(pic, el("span", "obLabel", o.textContent));
      b.onclick = () => {
        if (opts.onPick) opts.onPick(v);
        setValue(id, v);
        if (v === "กำหนดเอง") $(id + "Custom")?.focus();
      };
      grid.append(b);
    });
    wrap.append(grid);
    const custom = $(id + "Custom");
    if (custom) wrap.append(custom);
    return wrap;
  }
  const moodArt = (v, pic) => {
    const [a, b] = moods[v] || [P, I];
    pic.style.background = `linear-gradient(135deg, ${a} 0 55%, ${b} 55% 100%)`;
  };
  const styleArt = (v, pic) => {
    const s = styles[v] || {};
    const look = s.look && lookProfiles.find((l) => l.id === s.look);
    if (look) {
      const img = el("img");
      img.src = look.image;
      img.alt = "";
      img.loading = "lazy";
      pic.append(img);
      pic.classList.add("isPhoto");
    } else if (s.colors) pic.style.background = `linear-gradient(90deg, ${s.colors[0]} 0 50%, ${s.colors[1]} 50% 80%, ${s.colors[2]} 80%)`;
    else pic.innerHTML = art(s.art);
  };
  const ctaArt = (v, pic) => {
    pic.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">${R(10, 24, 44, 16, v === "ไม่มี CTA" ? P : W, 8)}${v === "ไม่มี CTA" ? "" : T(32, 36, v.length > 7 ? v.slice(0, 6) + "…" : v, 8, I)}</svg>`;
  };

  function lookCards() {
    const wrap = el("div", "obGroup");
    const head = el("div", "obGroupHead");
    head.append(
      el("h4", "", "ลุคจากงานจริง (Style Board)"),
      el("small", "", "แตะเพื่อใช้เป็นแนวทาง ตั้งสไตล์ อารมณ์ และ Layout ให้อัตโนมัติ"),
    );
    wrap.append(head);
    const row = el("div", "obLooks");
    lookProfiles.forEach((l) => {
      const b = el("button", "obLook");
      b.type = "button";
      b.dataset.look = l.id;
      b.setAttribute("aria-pressed", String(visualSpec.look === l.id));
      const img = el("img");
      img.src = l.image;
      img.alt = "";
      img.loading = "lazy";
      b.append(img, el("span", "", l.name));
      b.onclick = () => {
        chooseLook(l.id);
        document.getElementById("workEditor").dispatchEvent(new Event("change", { bubbles: true }));
        renderAll();
      };
      row.append(b);
    });
    wrap.append(row);
    return wrap;
  }
  function paletteCards() {
    const wrap = el("div", "obGroup");
    const head = el("div", "obGroupHead");
    head.append(el("h4", "", "ชุดสี"));
    wrap.append(head);
    const grid = el("div", "obCards");
    paletteProfiles.forEach((p) => {
      const b = el("button", "obCard");
      b.type = "button";
      b.dataset.palette = p.name;
      b.setAttribute("aria-pressed", String(visualSpec.paletteName === p.name));
      const pic = el("span", "obArt");
      pic.style.background = `linear-gradient(90deg, ${p.colors[0]} 0 45%, ${p.colors[1]} 45% 78%, ${p.colors[2]} 78%)`;
      b.append(pic, el("span", "obLabel", p.name));
      b.onclick = () => {
        choosePalette(p.name, p.colors);
        document.getElementById("workEditor").dispatchEvent(new Event("change", { bubbles: true }));
        renderAll();
      };
      grid.append(b);
    });
    wrap.append(grid);
    return wrap;
  }
  function layoutCards() {
    const wrap = el("div", "obGroup");
    const head = el("div", "obGroupHead");
    head.append(el("h4", "", "ตำแหน่งหัวข้อบนจอ"));
    wrap.append(head);
    const grid = el("div", "obCards");
    const kinds = { top: "หัวด้านบน", center: "คำหลักกลางภาพ", bottom: "ข้อความด้านล่าง", split: "หัวบน + ซับล่าง" };
    for (const [k, label] of Object.entries(kinds)) {
      const b = el("button", "obCard");
      b.type = "button";
      b.dataset.layoutPick = k;
      const y = { top: 16, center: 28, bottom: 40, split: 16 }[k];
      const pic = el("span", "obArt");
      pic.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">${phone(R(19, 13, 26, 38, P) + R(21, y, 22, 6, W) + (k === "split" ? R(21, 43, 22, 4, W) : ""))}</svg>`;
      b.append(pic, el("span", "obLabel", label));
      b.onclick = () => {
        document.querySelector('.layoutoptions button[data-layout="' + k + '"], button[data-layout="' + k + '"]')?.click();
        renderAll();
      };
      grid.append(b);
    }
    wrap.append(grid);
    return wrap;
  }
  function durationCards() {
    const wrap = el("div", "obGroup");
    const head = el("div", "obGroupHead");
    head.append(el("h4", "", "ความยาว"));
    wrap.append(head);
    const row = el("div", "obChips");
    [...$("length").options].forEach((o) => {
      const b = el("button", "", o.textContent);
      b.type = "button";
      b.dataset.len = o.value;
      b.onclick = () => {
        $("length").value = o.value;
        $("length").onchange();
        $("length").dispatchEvent(new Event("change", { bubbles: true }));
        renderAll();
        if (o.value === "custom") $("customLength").focus();
      };
      row.append(b);
    });
    wrap.append(row, $("customLength"));
    return wrap;
  }
  const moveField = (id, label) => {
    document.querySelector('label[for="' + id + '"]')?.remove();
    const box = el("div", "obField");
    box.append(el("label", "", label), $(id));
    box.querySelector("label").htmlFor = id;
    return box;
  };

  function buildChapter(i) {
    const c = chapters[i],
      video = $("productionLane").value === "video",
      sec = el("section", "obChapter");
    const h = el("div", "obChapterHead");
    h.append(el("h3", "", i + 1 + " · " + c.title), el("p", "", c.hint));
    sec.append(h);
    if (c.id === "job") {
      sec.append(titleBlock);
      if (presets) {
        const pre = el("div", "obGroup");
        pre.append(el("h4", "", "เริ่มเร็วจากแบบสำเร็จ"), presets);
        sec.append(pre);
      }
      sec.append(
        cards("contentType", pick.contentType, { title: "ประเภทงาน" }),
        cards("platform", pick.platform, { title: "ลงที่ไหน", note: "สัดส่วนภาพตั้งให้อัตโนมัติ เปลี่ยนได้ในขั้นส่งมอบ" }),
      );
    } else if (c.id === "goal") {
      sec.append(
        cards("objective", pick.objective, { title: "เป้าหมาย" }),
        cards("audience", pick.audience, { title: "คนดูหลัก" }),
        moveField("keyMessage", "สารหลักที่ต้องพูด"),
        cards("cta", null, { title: "ให้คนดูทำอะไรต่อ (CTA)", render: ctaArt }),
        moveField("ctaDestination", "ปลายทางของ CTA"),
      );
    } else if (c.id === "look") {
      sec.append(
        lookCards(),
        cards("designStyle", null, { title: "สไตล์งานออกแบบ", render: styleArt }),
        cards("mood", null, { title: "อารมณ์ & โทน", render: moodArt }),
        paletteCards(),
        layoutCards(),
      );
    } else if (c.id === "text") {
      sec.append(
        cards("subtitles", pick.subtitles, { title: "ซับไตเติล" }),
        cards("subtitlePosition", pick.subtitlePosition, { title: "ตำแหน่งซับ" }),
      );
      if (video) sec.append(cards("captionsFile", pick.captionsFile, { title: "ไฟล์ซับ" }));
      sec.append(
        cards("superLanguage", pick.superLanguage, { title: "Super (คำเน้นบนจอ)" }),
        cards("superStyle", pick.superStyle, { title: "รูปแบบ Super" }),
        moveField("superText", "ข้อความ Super / Keyword"),
        cards("coverMode", pick.coverMode, { title: "หน้าปก", note: "ให้ทีมเสนอ 3 แบบ ถ้ายังคิดไม่ออก" }),
        moveField("coverText", "คำบนหน้าปก"),
        cards("coverShot", pick.coverShot, { title: "ภาพหน้าปก" }),
      );
    } else if (c.id === "sound") {
      if (video)
        sec.append(
          cards("pace", pick.pace, { title: "จังหวะตัด" }),
          cards("hook", pick.hook, { title: "เปิดเรื่องด้วย" }),
          cards("music", pick.music, { title: "เพลง" }),
          cards("audio", pick.audio, { title: "เสียง" }),
        );
      sec.append(cards("graphics", pick.graphics, { title: "กราฟิก" }));
      if (!video) sec.append(el("p", "hint", "งาน Content ไม่ต้องตั้งจังหวะตัดและเสียง"));
    } else {
      if (video) sec.append(durationCards());
      sec.append(cards("ratio", pick.ratio, { title: "สัดส่วนภาพ" }));
      if (video) sec.append(cards("delivery", pick.delivery, { title: "ส่งมอบเป็น" }));
      else sec.append(el("p", "obNote", "ส่งมอบเป็นงาน Canva ที่แก้ได้ · Export จากงานที่แม่อนุมัติใน Canva"));
      sec.append(moveField("deadline", "กำหนดส่ง"), keepBlock);
    }
    const foot = el("div", "obFoot");
    if (i > 0) {
      const back = el("button", "textbutton", "← " + chapters[i - 1].title);
      back.type = "button";
      back.onclick = () => go(i - 1);
      foot.append(back);
    }
    const next = el("button", "primary", i < chapters.length - 1 ? "ถัดไป: " + chapters[i + 1].title + " →" : "ไปขั้น Reference →");
    next.type = "button";
    next.onclick = () => (i < chapters.length - 1 ? go(i + 1) : $("stepNext").click());
    foot.append(next);
    sec.append(foot);
    return sec;
  }
  // All chapters stay in the document (only one shown), so moved form fields keep working
  // with getElementById while hidden.
  function buildAll() {
    const secs = chapters.map((_, i) => buildChapter(i));
    body.replaceChildren(...secs);
  }
  function go(i, scroll = true) {
    current = i;
    [...body.children].forEach((sec, k) => (sec.hidden = k !== i));
    renderAll();
    if (scroll) ob.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- state + live mock ----------
  const done = () => {
    const v = (id) => $(id).value;
    return [
      !!$("title").value.trim(),
      !!$("keyMessage").value.trim(),
      !!visualSpec.look || v("designStyle") !== "ตามแบรนด์ BB" || visualSpec.paletteName !== "BB Signature",
      true,
      true,
      $("productionLane").value !== "video" || !!$("deadline").value,
    ];
  };
  function renderNav() {
    nav.replaceChildren();
    const d = done();
    chapters.forEach((c, i) => {
      const b = el("button", (i === current ? "isOn " : "") + (d[i] ? "isDone" : ""));
      b.type = "button";
      b.append(el("b", "", String(i + 1)), el("span", "", c.title));
      b.setAttribute("aria-current", i === current ? "step" : "false");
      b.onclick = () => go(i);
      nav.append(b);
    });
  }
  function renderPicks() {
    body.querySelectorAll(".obGroup[data-for]").forEach((g) => {
      const v = $(g.dataset.for).value;
      g.querySelectorAll(".obCard").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.value === v)));
    });
    body.querySelectorAll("[data-look]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.look === visualSpec.look)));
    body
      .querySelectorAll("[data-palette]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.palette === visualSpec.paletteName)));
    body
      .querySelectorAll("[data-layout-pick]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.layoutPick === visualSpec.layout)));
    body.querySelectorAll("[data-len]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.len === $("length").value)));
  }
  function renderPreview() {
    const s = window.BBStatus.snapshot(),
      ratio = $("ratio").value,
      [c1, c2, c3] = visualSpec.palette,
      subs = choiceValue("subtitles"),
      sup = choiceValue("superLanguage"),
      layout = visualSpec.layout;
    preview.replaceChildren();
    const frame = el("div", "obMock");
    frame.dataset.ratio = ratio.split(" ")[0];
    const img = el("img");
    img.src = visualSpec.previewImage;
    img.alt = "";
    frame.append(img);
    const head = el("strong", "obMockTitle", $("coverText").value.trim() || s.title || "หัวข้อของงาน");
    head.style.background = c1;
    head.style.color = c1 === "#f6e0e3" || c1 === "#ebe4d8" ? "#29262b" : "#fff";
    head.dataset.pos = layout;
    frame.append(head);
    if (sup !== "ไม่ใส่ Super") {
      const sp = el("span", "obMockSuper", ($("superText").value.trim().split("\n")[0] || "คำเน้น").slice(0, 28));
      sp.style.background = c3;
      frame.append(sp);
    }
    if (subs !== "ไม่ใส่ซับ") {
      const sb = el(
        "span",
        "obMockSub",
        subs === "อังกฤษ" ? "Subtitle sample" : subs === "ไทย + อังกฤษ" ? "ตัวอย่างซับ · Subtitle" : "ตัวอย่างซับไตเติล",
      );
      sb.dataset.pos = choiceValue("subtitlePosition") === "กลางภาพ" ? "middle" : "bottom";
      frame.append(sb);
    }
    const tag = el("span", "obMockTag", choiceValue("platform") + (s.video ? " · " + (duration() || "-") + " วิ" : ""));
    frame.append(tag);
    const ticket = el("dl", "obTicket");
    const rows = [
      ["งาน", choiceValue("contentType")],
      ["เป้าหมาย", choiceValue("objective")],
      ["คนดู", choiceValue("audience")],
      ["ลุค", visualSpec.look ? lookProfiles.find((l) => l.id === visualSpec.look)?.name : choiceValue("designStyle")],
      ["อารมณ์", choiceValue("mood")],
      ["สี", visualSpec.paletteName],
      ...(s.video
        ? [
            ["จังหวะ", choiceValue("pace")],
            ["เปิดด้วย", choiceValue("hook")],
          ]
        : []),
      ["CTA", choiceValue("cta")],
    ];
    for (const [k, v] of rows) {
      ticket.append(el("dt", "", k), el("dd", "", v || "-"));
    }
    const missing = el(
      "p",
      "obMissing",
      s.issues.length
        ? "ยังขาด " + s.issues.length + " จุด · " + s.issues.slice(0, 2).join(" · ")
        : s.title
          ? "ข้อมูลครบสำหรับสั่งผลิต"
          : "ตั้งชื่องานเพื่อเริ่ม",
    );
    missing.classList.toggle("isOk", !!s.title && !s.issues.length);
    preview.append(el("span", "obPreviewLabel", "ตัวอย่างงาน · อัปเดตตามที่เลือก"), frame, ticket, missing);
  }
  function renderAll() {
    renderNav();
    renderPicks();
    renderPreview();
  }
  let t = null;
  const later = () => {
    clearTimeout(t);
    t = setTimeout(renderAll, 200);
  };
  step.addEventListener("input", later);
  step.addEventListener("change", later);
  document.querySelector(".routing").addEventListener("change", (e) => {
    if (e.target.id === "productionLane") buildAll();
    go(current, false);
  });
  // Brief loaded or reset elsewhere → redraw.
  for (const name of ["loadProject", "resetBrief"]) {
    const base = window[name];
    window[name] = function (...a) {
      const r = base.apply(this, a);
      go(0, false);
      return r;
    };
  }
  // The chapters carry their own next/back; hide the editor's generic bar while on the Brief step.
  const editor = $("workEditor");
  const syncBar = () => editor.classList.toggle("isOrder", !step.hidden);
  new MutationObserver(syncBar).observe(step, { attributes: true, attributeFilter: ["hidden"] });
  syncBar();
  buildAll();
  go(0, false);
})();
