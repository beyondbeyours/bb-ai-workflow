"use strict";
(function () {
  const model = window.BBSimulator,
    scene = $("simScene"),
    actors = [],
    dock = [];
  let selected = 0,
    timer = null,
    returnTimer = null,
    demoIndex = -1,
    demoSteps = [],
    demoRunning = false,
    log = [];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) scene.classList.add("simPaused");
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
      el = document.createElement("span");
    el.className = "simAvatar";
    el.setAttribute("aria-hidden", "true");
    el.style.width = el.style.height = size + "px";
    el.style.backgroundImage = 'url("' + (sheet ? "assets/bb-crew-visible-faces-v22.png" : "assets/bb-cockpit-seated-v19.png") + '")';
    el.style.backgroundSize = (sheet ? 2048 : 1024) * scale + "px " + (sheet ? 768 : 1536) * scale + "px";
    el.style.backgroundPosition = -((sheet ? (index - 1) * 512 : 0) + cx - r) * scale + "px " + -(cy - r) * scale + "px";
    return el;
  }
  scene.style.setProperty("--h", model.portraitHeight);
  model.crew.forEach((person, index) => {
    const actor = document.createElement("button");
    actor.className = "simActor";
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
    const sprite = document.createElement("span");
    sprite.className = "simSprite";
    sprite.append(spriteImage(index));
    const label = document.createElement("span");
    label.className = "simName";
    const dot = document.createElement("i");
    dot.className = "simDot";
    dot.setAttribute("aria-hidden", "true");
    label.append(dot, nameImage(person.name));
    actor.append(sprite, label);
    actor.onclick = () => select(index, true);
    $("simActors").append(actor);
    actors.push(actor);
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-pressed", String(index === 0));
    b.setAttribute("aria-label", person.name + " · " + person.role);
    b.append(avatar(index, 48), nameImage(person.name));
    const role = document.createElement("small");
    role.textContent = person.role;
    b.append(role);
    b.onclick = () => select(index, true);
    $("simCrewDock").append(b);
    dock.push(b);
  });
  function makeAction(label, action, secondary = false) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = secondary ? "secondary" : "";
    b.append(typeImage(label));
    b.onclick = action;
    return b;
  }
  function openStep(n, group) {
    tab("workspace");
    setStep(n);
    if (group) {
      $(group).open = true;
      $(group).scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    } else $("workEditor").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  // Other views (town map) follow the simulator through these DOM events.
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent("bbsim:" + name, { detail }));
  function select(index, scroll = false) {
    selected = index;
    emit("select", { index });
    const p = model.crew[index];
    actors.forEach((a, i) => a.setAttribute("aria-pressed", String(i === index)));
    dock.forEach((a, i) => a.setAttribute("aria-pressed", String(i === index)));
    const identity = $("simIdentity");
    identity.replaceChildren();
    const face = avatar(index, 76);
    const titles = document.createElement("div");
    const h = document.createElement("h1");
    h.append(nameImage(p.name));
    const role = document.createElement("strong");
    role.append(typeImage(p.role));
    const sub = document.createElement("small");
    sub.textContent = p.sub;
    titles.append(h, role, sub);
    identity.append(face, titles);
    const actions = $("simActions");
    actions.replaceChildren();
    const tasks = [
      ["Brief", () => openStep(0), "Reference", () => openStep(1)],
      ["Footage", () => openStep(2), "Reference", () => openStep(1)],
      [
        "Creative",
        () => openStep(0, "creativeGroup"),
        "Style Board",
        () => {
          tab("workspace");
          $("openStyleBoard").click();
        },
      ],
      [
        "Sound & Graphics",
        () => openStep(0, "soundGroup"),
        "Cover Preview",
        () => {
          tab("workspace");
          $("openStyleBoard").click();
        },
      ],
      ["Review", () => openStep(3), "Projects", () => tab("history")],
    ][index];
    actions.append(makeAction(tasks[0], tasks[1]), makeAction(tasks[2], tasks[3], true));
    if (index === 0) {
      const b = document.createElement("button");
      b.className = "secondary";
      b.textContent = "คิวผลิต →";
      b.onclick = () => {
        tab("production");
        renderProduction(0);
      };
      actions.append(b);
    }
    const taskText = [
      "เริ่มงานจาก BB · เลือกแบรนด์และสายงาน แล้วเปิด Brief",
      "แนบไฟล์ต้นฉบับและ Reference ของแบรนด์นี้",
      "จัดสไตล์ จังหวะภาพ และไฟล์ที่ต้องส่งเข้า Canva / CapCut",
      "ตั้งภาษา Subtitles, Super, Graphics และ Cover",
      "ตรวจบรีฟและไฟล์ก่อนส่งกลับให้ BB อนุมัติ",
    ];
    $("simTask").textContent = demoRunning ? "Demo · " + (demoSteps[demoIndex]?.text || "") : taskText[index];
    if (scroll && window.innerWidth <= 680) $("simCommand").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  function addLog(text) {
    log.unshift({ text, time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) });
    log = log.slice(0, 4);
    $("simLog").replaceChildren();
    for (const item of log) {
      const li = document.createElement("li"),
        time = document.createElement("time"),
        span = document.createElement("span");
      time.textContent = item.time;
      span.textContent = item.text;
      li.append(time, span);
      $("simLog").append(li);
    }
  }
  function refresh() {
    emit("refresh", {});
    const brand = currentBrand(),
      saved = readSaved(),
      refs = referenceRecords;
    const m = model.metrics(saved, refs, brand.id);
    $("simJobCount").textContent = m.jobs;
    $("simRefCount").textContent = m.references;
    $("simBrandLabel").textContent = brand.name || "เลือกแบรนด์";
    $("simJobs").replaceChildren();
    const jobs = saved.filter((j) => (j.brand?.id || "beyond") === brand.id).slice(0, 3);
    if (!jobs.length) {
      const p = document.createElement("p");
      p.className = "simEmpty";
      p.textContent = "ยังไม่มีโปรเจกต์ · เริ่มที่ Cockpit ของ BB";
      $("simJobs").append(p);
    }
    for (const j of jobs) {
      const b = document.createElement("button");
      b.className = "simJob";
      const name = document.createElement("strong"),
        status = document.createElement("small");
      name.textContent = j.title;
      status.textContent = "Brief saved";
      b.append(name, status);
      b.onclick = () => {
        tab("history");
      };
      $("simJobs").append(b);
    }
  }
  function clearMotion() {
    clearTimeout(timer);
    clearTimeout(returnTimer);
    actors.forEach((a, i) => {
      a.classList.remove("isWorking", "isWalking");
      a.style.setProperty("--x", model.crew[i].x);
      a.style.setProperty("--y", model.crew[i].y);
    });
    $("simParcel").hidden = true;
  }
  function stopDemo() {
    demoRunning = false;
    emit("demo", { running: false });
    clearMotion();
    $("simContinue").hidden = true;
    $("simDemo").textContent = "▶ ทดลอง Journey";
    $("simMode").textContent = "Workspace";
    select(selected);
    addLog("หยุด Demo · ไม่มีผลกับโปรเจกต์จริง");
  }
  function advance() {
    if (!demoRunning) return;
    demoIndex++;
    const step = demoSteps[demoIndex];
    if (!step) {
      stopDemo();
      return;
    }
    const person = model.crew[step.owner];
    emit("demo", { running: true, step, index: demoIndex, from: demoSteps[demoIndex - 1]?.owner ?? step.owner });
    actors.forEach((a) => a.classList.remove("isWorking"));
    actors[step.owner].classList.add("isWorking");
    select(step.owner);
    $("simTask").textContent = "Demo · " + step.text;
    $("simMode").textContent = "Demo · " + step.state;
    addLog("Demo · " + step.text);
    const parcel = $("simParcel");
    parcel.hidden = false;
    parcel.style.left = person.x + 7 + "%";
    parcel.style.top = person.y - 13 + "%";
    // Seated crew stay at their stations; only the handoff token travels.

    if (step.pause) {
      $("simContinue").hidden = false;
      actors[step.owner].classList.remove("isWorking");
      return;
    }
    if (step.state === "Complete") {
      demoRunning = false;
      emit("demo", { running: false, complete: true });
      clearMotion();
      $("simDemo").textContent = "↻ ทดลองอีกครั้ง";
      $("simContinue").hidden = true;
      return;
    }
    timer = setTimeout(advance, 2300);
  }
  $("simDemo").onclick = () => {
    if (demoRunning) {
      stopDemo();
      return;
    }
    clearMotion();
    demoSteps = model.journey($("productionLane").value);
    demoIndex = -1;
    demoRunning = true;
    log = [];
    $("simDemo").textContent = "■ หยุด Demo";
    $("simContinue").hidden = true;
    advance();
  };
  $("simContinue").onclick = () => {
    $("simContinue").hidden = true;
    advance();
  };
  $("simSound").setAttribute("aria-pressed", String(reduced));
  $("simSound").textContent = reduced ? "เปิดภาพเคลื่อนไหว" : "หยุดภาพเคลื่อนไหว";
  $("simSound").onclick = () => {
    const paused = scene.classList.toggle("simPaused");
    $("simSound").setAttribute("aria-pressed", String(paused));
    $("simSound").textContent = paused ? "เปิดภาพเคลื่อนไหว" : "หยุดภาพเคลื่อนไหว";
  };
  $("simOpenQueue").onclick = () => tab("history");
  const oldSave = $("save").onclick;
  $("save").onclick = (e) => {
    oldSave(e);
    refresh();
    if ($("saveStatus").textContent.startsWith("บันทึกโปรเจกต์แล้ว")) addLog("บันทึก Brief · " + $("title").value.trim());
  };
  $("brandSelect").addEventListener("change", () => {
    if (demoRunning) stopDemo();
    refresh();
    select(selected);
  });
  $("customBrand").addEventListener("input", refresh);
  $("productionLane").addEventListener("change", () => {
    if (demoRunning) stopDemo();
    select(selected);
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
  window.BBSimSelect = (index, scroll) => select(index, scroll);
  select(0);
  refresh();
  addLog("เปิด Cockpit · " + currentBrand().name);
  tab("simulator");
})();
