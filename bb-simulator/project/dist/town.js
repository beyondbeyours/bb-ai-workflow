"use strict";
// BB Town: an animated isometric map of the production team. Drawn in code (SVG + HTML overlay),
// so colours follow the CI and nothing here needs generated art. BB's jet is parked at the airfield
// as the Cockpit. Status bubbles in Workspace mode come only from data in this browser; walking
// handoffs happen only in Demo, which never changes real projects.
(function () {
  const model = window.BBSimulator,
    VB = { w: 600, h: 980 },
    NS = "http://www.w3.org/2000/svg",
    town = $("simTown"),
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Isometric grid: one step along u/v moves 44px across and 22px down.
  const iso = (u, v) => [300 + u * 44, 40 + v * 22];
  // Road from BB's cockpit (under the jet) out of the nose and up the S-curve to the Export gate.
  const road = [
    [353, 850],
    [424, 814],
    [250, 727],
    [410, 647],
    [250, 567],
    [410, 487],
    [250, 407],
    [390, 337],
    [300, 312],
  ];
  // Crew index → road point they work beside (BB inside the jet cockpit).
  const homeNode = [0, 2, 3, 4, 5];
  const buildings = [
    { crew: 1, at: [112, 707], size: [3.1, 2.6], h: 80, roof: "#6b1019", title: "Footage Studio", icon: "camera" },
    { crew: 2, at: [500, 627], size: [3.2, 2.7], h: 92, roof: "#8a1d2a", title: "Edit House", icon: "timeline" },
    { crew: 3, at: [112, 547], size: [3.1, 2.6], h: 76, roof: "#c98f98", title: "Graphics Lab", icon: "pen" },
    { crew: 4, at: [500, 467], size: [3.1, 2.8], h: 104, roof: "#5a0c14", title: "Review Office", icon: "check" },
    { crew: -1, at: [300, 250], size: [2.8, 2.2], h: 58, roof: "#9b8e86", title: "Export Gate", icon: "lock" },
  ];
  const trees = [
    [52, 800],
    [186, 806],
    [548, 770],
    [330, 690],
    [176, 640],
    [330, 528],
    [56, 438],
    [176, 436],
    [548, 396],
    [470, 330],
    [112, 300],
    [486, 236],
    [404, 168],
    [188, 196],
    [560, 548],
  ];
  const lamps = [
    [330, 780],
    [330, 700],
    [330, 620],
    [330, 540],
    [330, 460],
    [322, 385],
  ];

  // ---------- road geometry ----------
  const seg = [];
  let total = 0;
  for (let i = 1; i < road.length; i++) {
    const [x1, y1] = road[i - 1],
      [x2, y2] = road[i],
      len = Math.hypot(x2 - x1, y2 - y1);
    seg.push({ x1, y1, x2, y2, len, start: total });
    total += len;
  }
  const nodeS = road.map((_, i) => (i === 0 ? 0 : seg[i - 1].start + seg[i - 1].len));
  function pointAt(s) {
    s = Math.max(0, Math.min(total, s));
    const g = seg.find((g) => s <= g.start + g.len) || seg[seg.length - 1],
      t = (s - g.start) / g.len;
    return [g.x1 + (g.x2 - g.x1) * t, g.y1 + (g.y2 - g.y1) * t];
  }

  // ---------- SVG scene ----------
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  };
  const pts = (list) => list.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
  function smoothPath(points) {
    // Closed Catmull-Rom spline through the points.
    let d = "M" + points[0].join(",");
    for (let i = 0; i < points.length; i++) {
      const p0 = points[(i - 1 + points.length) % points.length],
        p1 = points[i],
        p2 = points[(i + 1) % points.length],
        p3 = points[(i + 2) % points.length];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
        c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += "C" + [c1, c2, p2].map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
    }
    return d + "Z";
  }

  const svg = el("svg", { viewBox: `0 0 ${VB.w} ${VB.h}`, class: "townMap", "aria-hidden": "true" });
  const defs = el("defs", {}, svg);
  const glow = el("radialGradient", { id: "townSky", cx: "50%", cy: "45%", r: "70%" }, defs);
  el("stop", { offset: "0%", "stop-color": "#6a0a14" }, glow);
  el("stop", { offset: "100%", "stop-color": "#350207" }, glow);
  el("rect", { width: VB.w, height: VB.h, fill: "url(#townSky)" }, svg);

  const islandPts = [
    [300, 108],
    [470, 136],
    [585, 290],
    [556, 450],
    [590, 600],
    [540, 760],
    [566, 880],
    [430, 958],
    [170, 958],
    [36, 880],
    [62, 760],
    [10, 600],
    [44, 450],
    [14, 290],
    [128, 150],
  ];
  const island = smoothPath(islandPts);
  el("path", { d: island, fill: "#1f0105", opacity: "0.45", transform: "translate(0 34)" }, svg);
  el("path", { d: island, fill: "#b89a8a", transform: "translate(0 16)" }, svg);
  el("path", { d: island, fill: "#cdb4a4", transform: "translate(0 8)" }, svg);
  el("path", { d: island, fill: "#efe6dc" }, svg);
  // Soft tile grid on the ground.
  const grid = el("g", { opacity: "0.35", stroke: "#e2d4c7", "stroke-width": "1" }, svg);
  for (let k = -14; k <= 46; k += 2) {
    const [ax, ay] = iso(k, -6),
      [bx, by] = iso(k, 46);
    el("line", { x1: ax, y1: ay, x2: bx, y2: by }, grid);
    const [cx, cy] = iso(-14, k),
      [dx, dy] = iso(30, k);
    el("line", { x1: cx, y1: cy, x2: dx, y2: dy }, grid);
  }
  grid.setAttribute("clip-path", "url(#islandClip)");
  el("path", { d: island }, el("clipPath", { id: "islandClip" }, defs));

  // Airfield apron + runway under the jet.
  el(
    "polygon",
    {
      points: pts([
        [300, 780],
        [540, 900],
        [300, 1020],
        [60, 900],
      ]),
      fill: "#ddd0c5",
      "clip-path": "url(#islandClip)",
    },
    svg,
  );
  el(
    "polyline",
    {
      points: pts([
        [120, 990],
        [520, 790],
      ]),
      stroke: "#fff",
      "stroke-width": "3",
      "stroke-dasharray": "16 12",
      opacity: "0.6",
      fill: "none",
      "clip-path": "url(#islandClip)",
    },
    svg,
  );

  // Road.
  const roadD = "M" + road.map((p) => p.join(",")).join("L");
  el(
    "path",
    { d: roadD, fill: "none", stroke: "#d7b3ba", "stroke-width": "36", "stroke-linejoin": "round", "stroke-linecap": "round" },
    svg,
  );
  el(
    "path",
    { d: roadD, fill: "none", stroke: "#f2d9dd", "stroke-width": "30", "stroke-linejoin": "round", "stroke-linecap": "round" },
    svg,
  );
  el("path", { d: roadD, fill: "none", stroke: "#ffffff", "stroke-width": "2", "stroke-dasharray": "10 10", opacity: "0.9" }, svg);
  const flow = el(
    "path",
    {
      d: roadD,
      fill: "none",
      stroke: "#f7cb3f",
      "stroke-width": "3",
      "stroke-dasharray": "2 22",
      "stroke-linecap": "round",
      class: "townFlow",
    },
    svg,
  );
  flow.style.setProperty("--len", Math.round(total));

  // Jet parked flat on the airfield: image axes mapped onto the iso ground plane.
  const jet = el("g", { class: "townJet" }, svg);
  // Mirrored mapping so the nose points up-right toward the road (the jet is symmetric).
  const k = 0.37;
  el("ellipse", { cx: 292, cy: 885, rx: 215, ry: 74, fill: "#4f0208", opacity: "0.18" }, jet);
  el(
    "image",
    { href: "assets/bb-jet-cutout-v1.png", width: 500, height: 714, transform: `matrix(${k} ${k * 0.5} ${k} ${-k * 0.5} 67.4 899.8)` },
    jet,
  );

  // Buildings, painted back to front.
  function face(points, fill, parent) {
    return el("polygon", { points: pts(points), fill }, parent);
  }
  const I = [22, 11],
    J = [-22, 11];
  const add = (p, a, b = [0, 0], m = 1, n = 1) => [p[0] + a[0] * m + b[0] * n, p[1] + a[1] * m + b[1] * n];
  function icon(g, kind, x, y) {
    const c = el(
      "g",
      {
        transform: `translate(${x} ${y})`,
        fill: "none",
        stroke: "#4f0208",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      g,
    );
    el("circle", { r: 12, fill: "#f6e0e3", stroke: "none" }, c);
    if (kind === "camera") {
      el("rect", { x: -7, y: -4, width: 14, height: 10, rx: 2 }, c);
      el("circle", { cx: 0, cy: 1, r: 3 }, c);
      el("path", { d: "M-3 -4 L-1 -7 H3 L5 -4" }, c);
    } else if (kind === "timeline") {
      el("path", { d: "M-7 -4 H3 M-7 1 H7 M-7 6 H0" }, c);
      el("path", { d: "M4 -7 V9", stroke: "#af0e28" }, c);
    } else if (kind === "pen") {
      el("path", { d: "M-6 6 L-4 0 L4 -8 L8 -4 L0 4 Z" }, c);
      el("path", { d: "M-6 6 L-1 5" }, c);
    } else if (kind === "check") {
      el("rect", { x: -6, y: -7, width: 12, height: 15, rx: 2 }, c);
      el("path", { d: "M-3 1 L-1 4 L4 -2" }, c);
    } else {
      el("rect", { x: -5, y: -1, width: 10, height: 8, rx: 1.5 }, c);
      el("path", { d: "M-3 -1 V-4 A3 3 0 0 1 3 -4 V-1" }, c);
    }
  }
  const buildingGroups = [];
  [...buildings]
    .sort((a, b) => a.at[1] - b.at[1])
    .forEach((b) => {
      const g = el("g", { class: "townBuilding" + (b.crew < 0 ? " isLocked" : ""), "data-crew": b.crew }, svg);
      const [a, d] = b.size,
        c = b.at,
        top = add(c, I, J, -a / 2, -d / 2),
        right = add(c, I, J, a / 2, -d / 2),
        bottom = add(c, I, J, a / 2, d / 2),
        left = add(c, I, J, -a / 2, d / 2),
        up = (p, h = b.h) => [p[0], p[1] - h];
      el("ellipse", { cx: c[0], cy: c[1] + 6, rx: (a + d) * 15, ry: (a + d) * 6, fill: "#4f0208", opacity: "0.14" }, g);
      face([left, bottom, up(bottom), up(left)], "#f8f1ea", g);
      face([bottom, right, up(right), up(bottom)], "#e3d4c6", g);
      // Windows (warm light) on the left face, door near the front corner.
      for (let r = 0; r < 2; r++)
        for (let w = 0; w < 2; w++) {
          const base = add(left, I, [0, 0], 0.35 + w * 0.6 * (a / 2.4), 0);
          const y0 = b.h * (0.42 + r * 0.3);
          face(
            [
              [base[0], base[1] - y0],
              [base[0] + 9, base[1] - y0 + 4.5],
              [base[0] + 9, base[1] - y0 - 9.5],
              [base[0], base[1] - y0 - 14],
            ],
            "#f7cb3f",
            g,
          ).setAttribute("class", "townWindow");
        }
      const door = add(bottom, J, [0, 0], -0.75, 0);
      face([door, [door[0] + 12, door[1] - 6], [door[0] + 12, door[1] - 30], [door[0], door[1] - 24]], "#4f0208", g);
      // Pyramid roof.
      const apex = [c[0], c[1] - b.h - 30];
      face([up(left), up(bottom), apex], b.roof, g);
      const shade = el("polygon", { points: pts([up(bottom), up(right), apex]), fill: b.roof }, g);
      el("polygon", { points: shade.getAttribute("points"), fill: "#000", opacity: "0.18" }, g);
      face([up(top), up(left), apex], b.roof, g).setAttribute("opacity", "0.9");
      icon(g, b.icon, (bottom[0] + right[0]) / 2, (bottom[1] + right[1]) / 2 - b.h * 0.55);
      buildingGroups.push({ b, g });
    });

  // Trees and lamps.
  for (const [x, y] of trees) {
    const t = el("g", { class: "townTree" }, svg);
    el("ellipse", { cx: x, cy: y + 2, rx: 11, ry: 4, fill: "#4f0208", opacity: "0.15" }, t);
    el("rect", { x: x - 1.5, y: y - 10, width: 3, height: 11, fill: "#7a5a48" }, t);
    el("circle", { cx: x, cy: y - 18, r: 11, fill: "#8fa08a" }, t);
    el("circle", { cx: x - 4, cy: y - 21, r: 6, fill: "#a7b7a1" }, t);
  }
  for (const [x, y] of lamps) {
    el("rect", { x: x - 1, y: y - 22, width: 2, height: 22, fill: "#4f0208" }, svg);
    el("circle", { cx: x, cy: y - 24, r: 3.5, fill: "#f7cb3f", class: "townLamp" }, svg);
  }
  // Drifting clouds above everything.
  const clouds = el("g", { class: "townClouds" }, svg);
  for (const [x, y, s] of [
    [80, 70, 1],
    [430, 260, 0.8],
    [200, 610, 0.7],
    [520, 780, 0.9],
  ]) {
    const c = el("g", { transform: `translate(${x} ${y}) scale(${s})`, opacity: "0.5" }, clouds);
    el("ellipse", { cx: 0, cy: 0, rx: 40, ry: 12, fill: "#fff" }, c);
    el("ellipse", { cx: 18, cy: -8, rx: 22, ry: 11, fill: "#fff" }, c);
  }
  town.append(svg);

  // ---------- HTML overlay: hit areas, tokens, labels, bubbles ----------
  const overlay = document.createElement("div");
  overlay.className = "townOverlay";
  town.append(overlay);
  const pct = ([x, y]) => ({ left: (x / VB.w) * 100 + "%", top: (y / VB.h) * 100 + "%" });

  function crewAvatar(index) {
    // Reuse the simulator's face crop so town tokens match the cabin and roster one-to-one.
    const [cx, cy, r] = model.crew[index].avatar,
      sheet = index !== 0,
      span = document.createElement("span");
    span.className = "townFace";
    span.style.backgroundImage = 'url("' + (sheet ? "assets/bb-crew-visible-faces-v22.png" : "assets/bb-cockpit-seated-v19.png") + '")';
    // Percent-based crop so the token can resize with the map.
    const srcW = sheet ? 2048 : 1024,
      srcH = sheet ? 768 : 1536,
      ox = (sheet ? (index - 1) * 512 : 0) + cx - r,
      oy = cy - r;
    span.style.backgroundSize = (srcW / (2 * r)) * 100 + "% " + (srcH / (2 * r)) * 100 + "%";
    span.style.backgroundPosition = (ox / (srcW - 2 * r)) * 100 + "% " + (oy / (srcH - 2 * r)) * 100 + "%";
    return span;
  }

  // Building hit areas with signs.
  for (const { b } of buildingGroups) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "townSpot" + (b.crew < 0 ? " isLocked" : "");
    Object.assign(btn.style, pct([b.at[0], b.at[1] - b.h / 2 - 8]));
    const sign = document.createElement("span");
    sign.className = "townSign";
    sign.textContent = b.title;
    btn.append(sign);
    if (b.crew >= 0) {
      btn.setAttribute("aria-label", b.title + " · " + model.crew[b.crew].name + " · เปิดเครื่องมือ");
      btn.onclick = () => window.BBSimSelect(b.crew, true);
    } else {
      btn.setAttribute("aria-label", "Export Gate · Canva / CapCut / โพสต์ ยังไม่เชื่อม");
      btn.onclick = () => {
        tab("production");
        renderProduction(0);
      };
    }
    overlay.append(btn);
  }
  // Jet = Cockpit hit area.
  const jetSpot = document.createElement("button");
  jetSpot.type = "button";
  jetSpot.className = "townSpot townJetSpot";
  Object.assign(jetSpot.style, pct([292, 878]));
  jetSpot.setAttribute("aria-label", "BB Jet · Cockpit · เปิดเครื่องมือ BB");
  const jetSign = document.createElement("span");
  jetSign.className = "townSign isCockpit";
  jetSign.textContent = "BB Jet · Cockpit";
  jetSpot.append(jetSign);
  jetSpot.onclick = () => window.BBSimSelect(0, true);
  overlay.append(jetSpot);

  // Crew tokens.
  const tokens = model.crew.map((person, index) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "townToken";
    b.dataset.index = index;
    b.setAttribute("aria-label", person.name + " · " + person.role + " · เปิดเครื่องมือ");
    const bubble = document.createElement("span");
    bubble.className = "townBubble";
    const name = document.createElement("span");
    name.className = "townName";
    name.textContent = person.name;
    const parcel = document.createElement("span");
    parcel.className = "townParcel";
    parcel.hidden = true;
    parcel.setAttribute("aria-hidden", "true");
    b.append(bubble, crewAvatar(index), parcel, name);
    b.onclick = () => window.BBSimSelect(index, true);
    overlay.append(b);
    return { el: b, bubble, parcel, s: nodeS[homeNode[index]], home: nodeS[homeNode[index]], anim: null };
  });
  function place(t) {
    const [x, y] = pointAt(t.s);
    Object.assign(t.el.style, pct([x, y]));
    t.el.style.zIndex = String(Math.round(y));
  }
  tokens.forEach(place);

  // ---------- HUD + toolbar ----------
  const hud = document.createElement("div");
  hud.className = "townHud";
  town.append(hud);
  const bar = document.createElement("div");
  bar.className = "townBar";
  town.append(bar);
  const toggles = { names: true, bubbles: true };
  function toggle(label, key) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-pressed", "true");
    b.onclick = () => {
      toggles[key] = !toggles[key];
      b.setAttribute("aria-pressed", String(toggles[key]));
      town.classList.toggle("hide-" + key, !toggles[key]);
    };
    bar.append(b);
  }
  toggle("ชื่อ", "names");
  toggle("บับเบิล", "bubbles");
  const cabin = document.createElement("button");
  cabin.type = "button";
  cabin.textContent = "ในเครื่องบิน";
  cabin.onclick = () => setView("cabin");
  bar.append(cabin);

  // ---------- statuses from this browser's data ----------
  let demo = { running: false, owner: -1, text: "" };
  function safe(fn, fallback) {
    try {
      return fn();
    } catch {
      return fallback;
    }
  }
  function realStatus() {
    const brand = currentBrand(),
      jobs = safe(() => readSaved().filter((j) => (j.brand?.id || "beyond") === brand.id).length, 0),
      refs = safe(() => referenceRecords.filter((r) => (r.brandId || "beyond") === brand.id).length, 0),
      clips = safe(() => footage.length, 0),
      hasBrief = !!$("title").value.trim(),
      video = $("productionLane").value === "video",
      issues = hasBrief ? safe(() => blockingIssues().length + reviewWarnings().length, 0) : 0,
      subs = safe(() => choiceValue("subtitles"), ""),
      sup = safe(() => choiceValue("superLanguage"), "");
    return {
      counts: { jobs, refs },
      text: [
        hasBrief ? "บรีฟ: " + $("title").value.trim() : jobs ? "บรีฟ " + jobs + " งาน" : "สั่งงานใหม่",
        "Ref " + refs + " · Footage " + clips,
        hasBrief ? (video ? "รอประกอบใน CapCut" : "รอจัดใน Canva") : "รอบรีฟจาก BB",
        hasBrief ? "ซับ " + (subs || "-") + " · Super " + (sup || "-") : "รอบรีฟจาก BB",
        hasBrief ? (issues ? "ต้องตรวจ " + issues + " จุด" : "บรีฟครบ รอชิ้นงาน") : "รอบรีฟจาก BB",
      ],
    };
  }
  function render() {
    const st = realStatus();
    tokens.forEach((t, i) => {
      const working = demo.running && demo.owner === i;
      t.bubble.textContent = demo.running ? (working ? demo.text : i === 0 && demo.waitingBB ? "รอแม่ตรวจ" : "") : st.text[i];
      t.bubble.hidden = !t.bubble.textContent;
      t.el.classList.toggle("isWorking", working);
    });
    hud.replaceChildren();
    const chip = (text, cls = "") => {
      const s = document.createElement("span");
      s.className = "townChip " + cls;
      s.textContent = text;
      hud.append(s);
    };
    if (demo.running) {
      chip("DEMO · ไม่บันทึกงานจริง", "isDemo");
      chip("ทำงาน " + (demo.owner >= 0 && !demo.waitingBB ? 1 : 0) + " · รอแม่ " + (demo.waitingBB ? 1 : 0));
    } else {
      chip("Workspace", "isLive");
      chip("บรีฟ " + st.counts.jobs + " · Ref " + st.counts.refs);
    }
  }

  // ---------- walking ----------
  let paused = reduced || $("simScene").classList.contains("simPaused");
  function walk(t, to, done) {
    const from = t.s;
    if (paused || Math.abs(to - from) < 1) {
      t.s = to;
      place(t);
      done && done();
      return;
    }
    const dur = Math.min(1700, 300 + Math.abs(to - from) * 3),
      t0 = performance.now();
    t.el.classList.add("isWalking");
    cancelAnimationFrame(t.anim);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur),
        e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      t.s = from + (to - from) * e;
      place(t);
      if (p < 1) t.anim = requestAnimationFrame(step);
      else {
        t.el.classList.remove("isWalking");
        done && done();
      }
    };
    t.anim = requestAnimationFrame(step);
  }
  function resetTokens() {
    tokens.forEach((t) => {
      cancelAnimationFrame(t.anim);
      t.el.classList.remove("isWalking");
      t.parcel.hidden = true;
      t.s = t.home;
      place(t);
    });
  }

  document.addEventListener("bbsim:demo", (e) => {
    const d = e.detail;
    if (!d.running) {
      demo = { running: false, owner: -1, text: "" };
      resetTokens();
      town.classList.remove("isDemo");
      render();
      return;
    }
    town.classList.add("isDemo");
    const owner = d.step.owner,
      from = d.from;
    demo = { running: true, owner, text: d.step.text.replace(/^(BB|Leo|Kitty|Tidy|Chicha)\s*/, ""), waitingBB: !!d.step.pause };
    render();
    // The previous owner carries the work along the road to the next owner, then walks home.
    if (from !== owner) {
      const carrier = tokens[from];
      carrier.parcel.hidden = false;
      walk(carrier, tokens[owner].home + (tokens[owner].home > carrier.home ? -24 : 24), () => {
        carrier.parcel.hidden = true;
        walk(carrier, carrier.home);
      });
    }
  });
  document.addEventListener("bbsim:select", (e) => {
    tokens.forEach((t, i) => t.el.setAttribute("aria-pressed", String(i === e.detail.index)));
    buildingGroups.forEach(({ g, b }) => g.classList.toggle("isSelected", b.crew === e.detail.index));
    jet.classList.toggle("isSelected", e.detail.index === 0);
  });
  document.addEventListener("bbsim:refresh", render);
  let renderTimer = null;
  document.addEventListener("input", () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 300);
  });
  document.addEventListener("change", () => {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 300);
  });
  // Follow the simulator's motion switch.
  new MutationObserver(() => {
    paused = reduced || $("simScene").classList.contains("simPaused");
    town.classList.toggle("isPaused", paused);
  }).observe($("simScene"), { attributes: true, attributeFilter: ["class"] });
  town.classList.toggle("isPaused", paused);

  // ---------- view switch: town (default) or cabin ----------
  function setView(view) {
    const isTown = view !== "cabin";
    town.hidden = !isTown;
    $("simScene").hidden = isTown;
    $("simTownBack").hidden = isTown;
    try {
      localStorage.setItem("bb-simulator-view", isTown ? "town" : "cabin");
    } catch {}
  }
  $("simTownBack").onclick = () => setView("town");
  let saved = "town";
  try {
    saved = localStorage.getItem("bb-simulator-view") || "town";
  } catch {}
  setView(saved);
  render();
  document.dispatchEvent(new CustomEvent("bbsim:select", { detail: { index: 0 } }));
})();
