"use strict";
// Simulator tab: crew on the jet stage, person card, global status, production tracking and
// the execution log. Everything shown comes from this browser (BBStatus) or is labelled Demo.
(function () {
  const model = window.BBSimulator,
    scene = $("simScene"),
    actors = [],
    tabs = [];
  let selected = 0,
    timer = null,
    demoIndex = -1,
    demoSteps = [],
    demoRunning = false,
    log = [],
    logFilter = { mode: "all", owner: "all" };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) scene.classList.add("simPaused");
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent("bbsim:" + name, { detail }));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  function nameImage(name) {
    const img = typeImage(name);
    img.alt = name;
    return img;
  }
  function spriteImage(index) {
    const img = document.createElement("img");
    img.src = index === 0 ? "assets/bb-cockpit-seated-v19.png" : "assets/bb-crew-visible-faces-v22.png";
    img.alt = "";
    img.draggable = false;
    return img;
  }
  // Circular face crop from the same approved sprite the cabin uses, so face, name and role always match.
  function avatar(index, size) {
    const [cx, cy, r] = model.crew[index].avatar,
      scale = size / (2 * r),
      sheet = index !== 0,
      a = el("span", "simAvatar");
    a.setAttribute("aria-hidden", "true");
    a.style.width = a.style.height = size + "px";
    a.style.backgroundImage = 'url("' + (sheet ? "assets/bb-crew-visible-faces-v22.png" : "assets/bb-cockpit-seated-v19.png") + '")';
    a.style.backgroundSize = (sheet ? 2048 : 1024) * scale + "px " + (sheet ? 768 : 1536) * scale + "px";
    a.style.backgroundPosition = -((sheet ? (index - 1) * 512 : 0) + cx - r) * scale + "px " + -(cy - r) * scale + "px";
    return a;
  }
  window.BBAvatar = avatar;

  // ---------- crew on stage + crew tabs (the one roster) ----------
  scene.style.setProperty("--h", model.portraitHeight);
  model.crew.forEach((person, index) => {
    const actor = el("button", "simActor");
    actor.type = "button";
    actor.dataset.index = index;
    actor.dataset.label = person.label;
    actor.style.setProperty("--x", person.x);
    actor.style.setProperty("--y", person.y);
    actor.style.setProperty("--sprite", index === 0 ? 0 : index - 1);
    actor.style.setProperty("--scale", person.scale || 1);
    actor.style.zIndex = String(Math.round(person.y));
    actor.setAttribute("aria-label", person.name + " · " + person.role + " · เปิดเครื่องมือ");
    actor.setAttribute("aria-pressed", String(index === 0));
    const sprite = el("span", "simSprite");
    sprite.append(spriteImage(index));
    const label = el("span", "simName");
    const dot = el("i", "simDot");
    dot.setAttribute("aria-hidden", "true");
    label.append(dot, nameImage(person.name));
    actor.append(sprite, label);
    actor.onclick = () => {
      if (scene.dataset.dragged === "true") return;
      select(index, true);
    };
    $("simActors").append(actor);
    actors.push(actor);
    const t = el("button");
    t.type = "button";
    t.setAttribute("aria-pressed", String(index === 0));
    t.setAttribute("aria-label", person.name + " · " + person.role);
    t.append(avatar(index, 40), el("span", "", person.name));
    t.onclick = () => select(index, false);
    $("simCrewDock").append(t);
    tabs.push(t);
  });

  function openStep(n, group) {
    tab("workspace");
    setStep(n);
    if (group) {
      $(group).open = true;
      $(group).scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    } else $("workEditor").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  const tools = [
    [
      ["เปิด Brief", () => openStep(0)],
      ["ดูคิวผลิต", () => (tab("production"), renderProduction(0))],
    ],
    [
      ["Footage", () => openStep(2)],
      ["Reference", () => openStep(1)],
    ],
    [
      ["Creative", () => openStep(0, "creativeGroup")],
      ["Style Board", () => (tab("workspace"), $("openStyleBoard").click())],
    ],
    [
      ["Sound & Graphics", () => openStep(0, "soundGroup")],
      ["Text & Cover", () => openStep(0, "styleBoardGroup")],
    ],
    [
      ["Review", () => openStep(3)],
      ["Projects", () => tab("history")],
    ],
  ];

  // ---------- person card ----------
  function personState(index) {
    if (!demoRunning) return ["ว่าง", ""];
    const step = demoSteps[demoIndex];
    if (step?.pause && index === 0) return ["รอแม่ตรวจ", "isWaiting"];
    if (step?.owner === index) return ["Demo ทำอยู่", "isWorking"];
    return ["ว่าง", ""];
  }
  function renderPerson() {
    const index = selected,
      p = model.crew[index],
      s = window.BBStatus.snapshot();
    const identity = $("simIdentity");
    identity.replaceChildren();
    const titles = el("div");
    const h = el("h1");
    h.append(nameImage(p.name));
    const [stateText, stateCls] = personState(index);
    titles.append(h, el("strong", "", p.role), el("small", "", p.sub));
    identity.append(avatar(index, 64), titles, el("span", "simState " + stateCls, stateText));
    const now = $("simNow");
    now.replaceChildren();
    const step = demoSteps[demoIndex];
    const working = demoRunning && step && step.owner === index;
    now.append(el("span", "simNowLabel", demoRunning ? "Demo" : "งานตอนนี้"));
    now.append(el("p", "simNowText", working ? step.text : demoRunning ? "ว่าง ระหว่าง Demo" : s.text[index]));
    const bar = el("div", "simProgress");
    const fill = el("span");
    fill.style.width = (s.doneSteps / 4) * 100 + "%";
    bar.append(fill);
    now.append(
      bar,
      el("small", "simProgressText", s.title ? "บรีฟ " + s.title + " · พร้อม " + s.doneSteps + "/4 ขั้น" : "ยังไม่มีบรีฟที่เปิดอยู่"),
    );
    const actions = $("simActions");
    actions.replaceChildren();
    tools[index].forEach(([label, fn], i) => {
      const b = el("button", i ? "secondary" : "", label);
      b.type = "button";
      b.onclick = fn;
      actions.append(b);
    });
  }
  function select(index, fromStage = false) {
    selected = index;
    actors.forEach((a, i) => a.setAttribute("aria-pressed", String(i === index)));
    tabs.forEach((a, i) => a.setAttribute("aria-pressed", String(i === index)));
    renderPerson();
    emit("select", { index, fromStage });
    if (fromStage && window.innerWidth <= 680) $("simCommand").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  // ---------- global status (KPIs) + production tracking ----------
  function renderKpis() {
    const s = window.BBStatus.snapshot(),
      k = $("simKpis");
    k.replaceChildren();
    const tile = (value, label, id, note) => {
      const t = el("div", "simKpi");
      const v = el("strong", "", String(value));
      if (id) v.id = id;
      t.append(v, el("span", "", label));
      if (note) t.append(el("small", "", note));
      k.append(t);
    };
    tile(s.jobs, "บรีฟที่บันทึก", "simJobCount", s.brand.name);
    tile(s.refs, "Reference", "simRefCount", "ของแบรนด์นี้");
    tile(s.clips, s.video ? "Footage" : "ไฟล์แนบ", "", "ในเซสชันนี้");
    tile("0", "กำลังผลิตจริง", "", "ยังไม่เชื่อมระบบผลิต");
  }
  function renderTrack() {
    const s = window.BBStatus.snapshot(),
      tr = $("simTrack"),
      video = s.video;
    const flow = [
      { label: "Brief", who: "BB", done: s.steps[0].done },
      { label: video ? "Footage" : "Assets", who: "Leo", done: s.steps[2].done },
      { label: video ? "CapCut" : "Canva", who: "Kitty", done: false },
      { label: "Graphics", who: "Tidy", done: false },
      { label: "QA", who: "Chicha", done: false },
      { label: "แม่ตรวจ", who: "BB", done: false },
      { label: "Export", who: video ? "ส่งโปรเจกต์" : "จาก Canva", done: false },
    ];
    let active = flow.findIndex((f) => !f.done);
    if (demoRunning) {
      const step = demoSteps[demoIndex];
      active = step.pause ? 5 : step.state === "Export" || step.state === "Complete" ? 6 : step.owner === 0 ? 0 : step.owner;
      flow.forEach((f, i) => (f.done = i < active));
    }
    tr.replaceChildren();
    const head = el("div", "simTrackHead");
    head.append(el("strong", "", "ติดตามสายงาน"), el("small", "", (demoRunning ? "Demo · " : "") + BBWorkflow.laneName(s.lane)));
    const ol = el("ol");
    flow.forEach((f, i) => {
      const li = el("li", f.done ? "isDone" : i === active ? "isActive" : "");
      li.append(el("i"), el("span", "", f.label), el("small", "", f.who));
      ol.append(li);
    });
    tr.append(head, ol);
  }
  function refresh() {
    $("simBrandLabel").textContent = currentBrand().name || "เลือกแบรนด์";
    renderKpis();
    renderTrack();
    renderPerson();
    emit("refresh", {});
  }

  // ---------- execution log ----------
  const typeLabel = { open: "OPEN", save: "SAVE", start: "START", send: "SEND", wait: "WAIT", done: "DONE", stop: "STOP" };
  function addLog(text, type = "open", owner = 0, mode = "workspace") {
    log.unshift({
      text,
      type,
      owner,
      mode,
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    });
    log = log.slice(0, 40);
    emit("log", log[0]);
    renderLog();
  }
  function renderLogFilters() {
    const f = $("simLogFilters");
    f.replaceChildren();
    for (const [mode, label] of [
      ["all", "ทั้งหมด"],
      ["workspace", "Workspace"],
      ["demo", "Demo"],
    ]) {
      const b = el("button", "", label);
      b.type = "button";
      b.setAttribute("aria-pressed", String(logFilter.mode === mode));
      b.onclick = () => {
        logFilter.mode = mode;
        renderLogFilters();
        renderLog();
      };
      f.append(b);
    }
    const sel = el("select");
    sel.setAttribute("aria-label", "กรองตามคน");
    sel.append(new Option("ทุกคน", "all"));
    model.crew.forEach((p, i) => sel.append(new Option(p.name, String(i))));
    sel.value = logFilter.owner;
    sel.onchange = () => {
      logFilter.owner = sel.value;
      renderLog();
    };
    f.append(sel);
  }
  function renderLog() {
    const list = $("simLog");
    list.replaceChildren();
    const rows = log.filter(
      (r) => (logFilter.mode === "all" || r.mode === logFilter.mode) && (logFilter.owner === "all" || String(r.owner) === logFilter.owner),
    );
    if (!rows.length) list.append(el("li", "simLogEmpty", "ยังไม่มีรายการ"));
    for (const r of rows.slice(0, 12)) {
      const li = el("li");
      li.append(
        el("time", "", r.time),
        avatar(r.owner, 22),
        el("span", "simLogWho", model.crew[r.owner].name),
        el("em", "is-" + r.type, typeLabel[r.type]),
        el("span", "simLogText", r.text),
      );
      list.append(li);
    }
  }

  // ---------- demo ----------
  function stopDemo(silent) {
    demoRunning = false;
    clearTimeout(timer);
    emit("demo", { running: false });
    $("simContinue").hidden = true;
    $("simDemo").textContent = "▶ ทดลอง Journey";
    $("simMode").textContent = "Workspace";
    if (!silent) addLog("หยุด Demo · ไม่มีผลกับโปรเจกต์จริง", "stop", 0, "demo");
    refresh();
  }
  function advance() {
    if (!demoRunning) return;
    demoIndex++;
    const step = demoSteps[demoIndex];
    if (!step) return stopDemo(true);
    const prev = demoSteps[demoIndex - 1];
    if (prev && prev.owner !== step.owner) addLog("ส่งต่อให้ " + model.crew[step.owner].name, "send", prev.owner, "demo");
    emit("demo", { running: true, step, index: demoIndex, from: prev?.owner ?? step.owner });
    $("simMode").textContent = "Demo · " + step.state;
    addLog(step.text, step.pause ? "wait" : step.state === "Complete" ? "done" : "start", step.owner, "demo");
    select(step.owner);
    renderKpis();
    renderTrack();
    if (step.pause) {
      $("simContinue").hidden = false;
      return;
    }
    if (step.state === "Complete") {
      demoRunning = false;
      emit("demo", { running: false, complete: true });
      $("simDemo").textContent = "↻ ทดลองอีกครั้ง";
      $("simMode").textContent = "Workspace";
      refresh();
      return;
    }
    timer = setTimeout(advance, 2400);
  }
  $("simDemo").onclick = () => {
    if (demoRunning) return stopDemo();
    demoSteps = model.journey($("productionLane").value);
    demoIndex = -1;
    demoRunning = true;
    $("simDemo").textContent = "■ หยุด Demo";
    $("simContinue").hidden = true;
    advance();
  };
  $("simContinue").onclick = () => {
    $("simContinue").hidden = true;
    advance();
  };
  $("simSound").setAttribute("aria-pressed", String(reduced));
  $("simSound").textContent = reduced ? "เล่นภาพ" : "หยุดภาพ";
  $("simSound").onclick = () => {
    const paused = scene.classList.toggle("simPaused");
    $("simSound").setAttribute("aria-pressed", String(paused));
    $("simSound").textContent = paused ? "เล่นภาพ" : "หยุดภาพ";
  };

  // ---------- wiring ----------
  const oldSave = $("save").onclick;
  $("save").onclick = (e) => {
    oldSave(e);
    if (/^(บันทึกโปรเจกต์แล้ว|อัปเดตโปรเจกต์เดิมแล้ว)/.test($("saveStatus").textContent))
      addLog("บันทึก Brief · " + $("title").value.trim(), "save", 0);
    refresh();
  };
  $("brandSelect").addEventListener("change", () => {
    if (demoRunning) stopDemo(true);
    addLog("เปลี่ยนแบรนด์เป็น " + currentBrand().name, "open", 0);
    refresh();
  });
  $("customBrand").addEventListener("input", refresh);
  $("productionLane").addEventListener("change", () => {
    if (demoRunning) stopDemo(true);
    refresh();
  });
  const oldRenderRefs = renderReferences;
  renderReferences = function () {
    oldRenderRefs();
    refresh();
  };
  document.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.tab === "simulator") refresh();
    }),
  );
  let later = null;
  document.addEventListener("input", () => {
    clearTimeout(later);
    later = setTimeout(refresh, 400);
  });
  window.BBSimSelect = (index, fromStage) => select(index, fromStage);
  renderLogFilters();
  select(0);
  refresh();
  addLog("เปิด Cockpit · " + currentBrand().name, "open", 0);
  tab("simulator");
})();
