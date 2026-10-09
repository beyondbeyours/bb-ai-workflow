"use strict";
// Living cabin: motion and status layer over the approved jet scene.
// - Ambient flight: clouds stream under the jet, beacons blink, engines and screens glow.
// - Each crew chip shows a status line built only from data in this browser.
// - HUD + toolbar (names, status, Log, Status Board) like a game overview.
// - Demo: the brief travels along the aisle from station to station; nothing real changes.
(function () {
  const model = window.BBSimulator,
    scene = $("simScene"),
    sky = $("simSky"),
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Positions below are % of the 1024x1536 aircraft image.
  const AISLE_X = 51.8;
  // Where a handoff is dropped beside each station (crew order: BB, Leo, Kitty, Tidy, Chicha).
  const drop = [
    [50, 64.5],
    [46.5, 57],
    [49.5, 46],
    [55.5, 47],
    [51.5, 34.5],
  ];
  const roleIcon = ["command", "camera", "timeline", "pen", "check"];

  // ---------- ambient flight ----------
  for (let i = 0; i < 7; i++) {
    const c = document.createElement("span");
    c.className = "simCloud";
    c.style.setProperty("--cx", [8, 70, 34, 86, 18, 58, 44][i] + "%");
    c.style.setProperty("--cw", [46, 38, 52, 34, 40, 48, 30][i] + "%");
    c.style.setProperty("--delay", -i * 3.1 + "s");
    c.style.setProperty("--dur", 19 + (i % 3) * 4 + "s");
    sky.append(c);
  }
  const lights = document.createElement("div");
  lights.className = "simLights";
  lights.setAttribute("aria-hidden", "true");
  for (const [cls, x, y] of [
    ["beacon isGreen", 3.6, 26.6],
    ["beacon isRed", 96.3, 26.6],
    ["beacon isRed isTail", 50, 2.6],
    ["engine", 33, 18.6],
    ["engine", 66.8, 18.6],
    ["screen", 38.2, 63.4],
    ["screen", 49.8, 61.8],
    ["screen", 61.6, 63.4],
    ["screen small", 38.6, 41.6],
    ["screen small", 45.2, 41.4],
    ["screen small", 60.4, 42.6],
    ["screen small", 52.8, 25.2],
    ["screen small", 38, 53.4],
  ]) {
    const l = document.createElement("span");
    l.className = "simLight " + cls;
    l.style.left = x + "%";
    l.style.top = y + "%";
    l.style.setProperty("--d", ((x * 7 + y * 3) % 30) / 10 + "s");
    lights.append(l);
  }
  scene.insertBefore(lights, $("simActors"));

  // Aisle trail for Demo handoffs.
  const NS = "http://www.w3.org/2000/svg",
    trail = document.createElementNS(NS, "svg");
  trail.setAttribute("viewBox", "0 0 100 150");
  trail.setAttribute("preserveAspectRatio", "none");
  trail.setAttribute("class", "simTrail");
  trail.setAttribute("aria-hidden", "true");
  const trailPath = document.createElementNS(NS, "polyline");
  trailPath.setAttribute("points", `${AISLE_X},${34 * 1.5} ${AISLE_X},${66 * 1.5}`);
  trail.append(trailPath);
  scene.insertBefore(trail, $("simActors"));

  // ---------- HUD + toolbar ----------
  const hud = document.createElement("div");
  hud.className = "simHud";
  const bar = document.createElement("div");
  bar.className = "simToolbar";
  scene.append(hud, bar);
  const toggles = { names: true, status: true };
  function toggleButton(label, key) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-pressed", "true");
    b.onclick = () => {
      toggles[key] = !toggles[key];
      b.setAttribute("aria-pressed", String(toggles[key]));
      scene.classList.toggle("hide-" + key, !toggles[key]);
    };
    bar.append(b);
  }
  toggleButton("ชื่อ", "names");
  toggleButton("สถานะ", "status");
  const panelButton = (label, view) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.dataset.panel = view;
    b.onclick = () => openPanel(panel.dataset.view === view && !panel.hidden ? null : view);
    bar.append(b);
    return b;
  };
  panelButton("Log", "log");
  panelButton("Board", "board");

  // Bottom sheet for Log / Status Board.
  const panel = document.createElement("section");
  panel.className = "simPanel";
  panel.hidden = true;
  panel.setAttribute("aria-live", "polite");
  const panelHead = document.createElement("div");
  panelHead.className = "simPanelHead";
  const panelTitle = document.createElement("strong");
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "ปิด";
  close.onclick = () => openPanel(null);
  panelHead.append(panelTitle, close);
  const panelBody = document.createElement("div");
  panelBody.className = "simPanelBody";
  panel.append(panelHead, panelBody);
  scene.append(panel);
  function openPanel(view) {
    panel.hidden = !view;
    panel.dataset.view = view || "";
    bar.querySelectorAll("[data-panel]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.panel === view)));
    if (view) renderPanel();
  }

  // ---------- status from this browser's data ----------
  let demo = { running: false, owner: -1, text: "", waiting: false };
  const logItems = [...$("simLog").querySelectorAll("li")].map((li) => ({
    time: li.querySelector("time")?.textContent || "",
    text: li.querySelector("span")?.textContent || "",
  }));
  const safe = (fn, fallback) => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  };
  function snapshot() {
    const brand = currentBrand(),
      jobs = safe(() => readSaved().filter((j) => (j.brand?.id || "beyond") === brand.id).length, 0),
      refs = safe(() => referenceRecords.filter((r) => (r.brandId || "beyond") === brand.id).length, 0),
      clips = safe(() => footage.length, 0),
      title = $("title").value.trim(),
      video = $("productionLane").value === "video",
      issues = title ? safe(() => blockingIssues().length + reviewWarnings().length, 0) : 0,
      subs = safe(() => choiceValue("subtitles"), ""),
      sup = safe(() => choiceValue("superLanguage"), "");
    return {
      jobs,
      refs,
      clips,
      title,
      issues,
      steps: [
        ["Brief", !!title],
        ["Reference", refs > 0],
        [video ? "Footage" : "Assets", clips > 0 || !!safe(() => $("assetsLink").value.trim(), "")],
        ["Review", !!title && issues === 0],
      ],
      text: [
        title ? "บรีฟ: " + title : jobs ? "บรีฟ " + jobs + " งาน" : "พร้อมสั่งงาน",
        "Ref " + refs + " · Footage " + clips,
        title ? (video ? "รอประกอบใน CapCut" : "รอจัดใน Canva") : "รอบรีฟจาก BB",
        title ? "ซับ " + (subs || "-") + " · Super " + (sup || "-") : "รอบรีฟจาก BB",
        title ? (issues ? "ต้องตรวจ " + issues + " จุด" : "บรีฟครบ รอชิ้นงาน") : "รอบรีฟจาก BB",
      ],
    };
  }
  // Status line inside each name chip (outside the portrait, never over a face).
  const actorEls = [...document.querySelectorAll(".simActor")];
  const statusEls = actorEls.map((a, i) => {
    const chip = a.querySelector(".simName"),
      wrap = document.createElement("span"),
      st = document.createElement("small"),
      icon = document.createElement("i");
    wrap.className = "simChipText";
    st.className = "simStatus";
    icon.className = "simRole is-" + roleIcon[i];
    icon.setAttribute("aria-hidden", "true");
    chip.querySelector(".simDot")?.replaceWith(icon);
    const name = chip.querySelector("img");
    wrap.append(name, st);
    chip.append(wrap);
    return st;
  });
  function render() {
    const s = snapshot();
    statusEls.forEach((el, i) => {
      const working = demo.running && demo.owner === i;
      el.textContent = demo.running ? (working ? demo.text : i === 0 && demo.waiting ? "รอแม่ตรวจ" : "ว่าง") : s.text[i];
      actorEls[i].classList.toggle("isWorking", working && !demo.waiting);
      actorEls[i].classList.toggle("isWaiting", i === 0 && demo.waiting);
    });
    hud.replaceChildren();
    const chip = (text, cls = "") => {
      const c = document.createElement("span");
      c.className = "simHudChip " + cls;
      c.textContent = text;
      hud.append(c);
    };
    if (demo.running) {
      chip("DEMO", "isDemo");
      chip("ไม่บันทึกงานจริง · " + (demo.waiting ? "รอแม่อนุมัติ" : "กำลังทำ 1"));
    } else {
      chip("Workspace", "isLive");
      chip("บรีฟ " + s.jobs + " · Ref " + s.refs);
    }
    if (!panel.hidden) renderPanel();
  }
  function renderPanel() {
    panelBody.replaceChildren();
    if (panel.dataset.view === "log") {
      panelTitle.textContent = "Log · " + (demo.running ? "Demo" : "Workspace");
      const ol = document.createElement("ol");
      ol.className = "simPanelLog";
      if (!logItems.length) {
        const li = document.createElement("li");
        li.textContent = "ยังไม่มีความเคลื่อนไหว";
        ol.append(li);
      }
      for (const item of logItems) {
        const li = document.createElement("li"),
          t = document.createElement("time"),
          span = document.createElement("span");
        t.textContent = item.time;
        span.textContent = item.text;
        li.append(t, span);
        ol.append(li);
      }
      panelBody.append(ol);
      return;
    }
    const s = snapshot();
    panelTitle.textContent = "Status Board · " + currentBrand().name;
    const steps = document.createElement("div");
    steps.className = "simBoardSteps";
    s.steps.forEach(([label, done]) => {
      const st = document.createElement("span");
      st.className = done ? "isDone" : "";
      st.textContent = (done ? "✓ " : "· ") + label;
      steps.append(st);
    });
    const note = document.createElement("p");
    note.className = "simBoardNote";
    note.textContent = s.title ? "บรีฟที่เปิดอยู่: " + s.title : "ยังไม่มีบรีฟที่เปิดอยู่ · เริ่มที่ BB";
    panelBody.append(note, steps);
    const list = document.createElement("ul");
    list.className = "simBoardList";
    model.crew.forEach((p, i) => {
      const li = document.createElement("li");
      const face = document.querySelector("#simCrewDock button:nth-child(" + (i + 1) + ") .simAvatar")?.cloneNode(true);
      const who = document.createElement("span");
      who.className = "simBoardWho";
      const n = document.createElement("strong");
      n.textContent = p.name;
      const r = document.createElement("small");
      r.textContent = p.role;
      who.append(n, r);
      const st = document.createElement("span");
      st.className = "simBoardStatus";
      st.textContent = statusEls[i].textContent;
      const state = document.createElement("em");
      const working = demo.running && demo.owner === i && !demo.waiting;
      state.textContent = working ? "Demo ทำอยู่" : i === 0 && demo.waiting ? "รอแม่" : "ว่าง";
      state.className = working ? "isWorking" : i === 0 && demo.waiting ? "isWaiting" : "";
      if (face) li.append(face);
      li.append(who, st, state);
      li.onclick = () => window.BBSimSelect(i, true);
      list.append(li);
    });
    panelBody.append(list);
    const foot = document.createElement("p");
    foot.className = "simBoardNote";
    foot.textContent = "Export และการโพสต์ยังไม่เชื่อม · สถานะนี้มาจากข้อมูลในเบราว์เซอร์นี้เท่านั้น";
    panelBody.append(foot);
  }

  // ---------- Demo handoff along the aisle ----------
  const parcel = $("simParcel");
  let paused = reduced || scene.classList.contains("simPaused"),
    anim = null,
    sparkTimer = null;
  function pathBetween(a, b) {
    const [ax, ay] = drop[a],
      [bx, by] = drop[b];
    return [
      [ax, ay],
      [AISLE_X, ay],
      [AISLE_X, by],
      [bx, by],
    ];
  }
  function moveParcel(points, done) {
    cancelAnimationFrame(anim);
    parcel.hidden = false;
    parcel.style.transition = "none";
    const lens = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], (p[1] - points[i][1]) * 1.5)),
      total = lens.reduce((a, b) => a + b, 0);
    const at = (d) => {
      for (let i = 0; i < lens.length; i++) {
        if (d <= lens[i] || i === lens.length - 1) {
          const t = lens[i] ? Math.min(1, d / lens[i]) : 1;
          return [points[i][0] + (points[i + 1][0] - points[i][0]) * t, points[i][1] + (points[i + 1][1] - points[i][1]) * t];
        }
        d -= lens[i];
      }
    };
    const put = ([x, y]) => {
      parcel.style.left = x + "%";
      parcel.style.top = y + "%";
    };
    if (paused || !total) {
      put(points[points.length - 1]);
      done && done();
      return;
    }
    const dur = Math.min(1500, 500 + total * 22),
      t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur),
        e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      put(at(total * e));
      if (p < 1) anim = requestAnimationFrame(tick);
      else done && done();
    };
    anim = requestAnimationFrame(tick);
  }
  function sparks(i) {
    clearInterval(sparkTimer);
    if (i < 0 || paused) return;
    const emit = () => {
      const s = document.createElement("span");
      s.className = "simSpark simRole is-" + roleIcon[i];
      const p = model.crew[i];
      s.style.left = p.x + (Math.random() * 8 - 4) + "%";
      s.style.top = p.y - model.portraitHeight * 0.55 + "%";
      scene.append(s);
      setTimeout(() => s.remove(), 1600);
    };
    emit();
    sparkTimer = setInterval(emit, 700);
  }
  document.addEventListener("bbsim:demo", (e) => {
    const d = e.detail;
    if (!d.running) {
      demo = { running: false, owner: -1, text: "", waiting: false };
      cancelAnimationFrame(anim);
      parcel.hidden = true;
      sparks(-1);
      scene.classList.remove("isDemo");
      render();
      return;
    }
    scene.classList.add("isDemo");
    const owner = d.step.owner;
    demo = { running: true, owner, waiting: !!d.step.pause, text: d.step.text.replace(/^(BB|Leo|Kitty|Tidy|Chicha)\s*/, "") };
    trailPath.setAttribute(
      "points",
      pathBetween(d.from, owner)
        .map(([x, y]) => x + "," + y * 1.5)
        .join(" "),
    );
    moveParcel(pathBetween(d.from, owner), () => sparks(demo.waiting || d.step.state === "Complete" ? -1 : owner));
    render();
  });
  document.addEventListener("bbsim:log", (e) => {
    logItems.unshift(e.detail);
    logItems.splice(30);
    if (!panel.hidden && panel.dataset.view === "log") renderPanel();
  });
  document.addEventListener("bbsim:refresh", render);
  document.addEventListener("bbsim:select", (e) => {
    const a = actorEls[e.detail.index];
    if (!a || paused) return;
    a.classList.remove("isHop");
    void a.offsetWidth;
    a.classList.add("isHop");
  });
  let timerId = null;
  const later = () => {
    clearTimeout(timerId);
    timerId = setTimeout(render, 300);
  };
  document.addEventListener("input", later);
  document.addEventListener("change", later);
  new MutationObserver(() => {
    paused = reduced || scene.classList.contains("simPaused");
    if (paused) sparks(-1);
  }).observe(scene, { attributes: true, attributeFilter: ["class"] });
  render();
})();
