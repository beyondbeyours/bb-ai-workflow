"use strict";
// Living cabin: quiet motion and one status line per person over the approved jet scene.
// Ambient: clouds stream under the jet, beacons blink, engines and screens glow.
// Demo: the brief travels along the aisle with a trail; nothing real changes.
// Log, global status and the person card live in the side panel (simulator.js), not here.
(function () {
  const scene = $("simScene"),
    sky = $("simSky"),
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Positions are % of the 1024x1536 aircraft image.
  const AISLE_X = 51.8;
  // Handoff drop point beside each station (BB, Leo, Kitty, Tidy, Chicha).
  const drop = [
    [50, 64.5],
    [46.5, 57],
    [49.5, 46],
    [55.5, 47],
    [51.5, 34.5],
  ];

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
    ["beacon isRed", 50, 2.6],
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
  $("simCam").insertBefore(lights, $("simActors"));

  const NS = "http://www.w3.org/2000/svg",
    trail = document.createElementNS(NS, "svg");
  trail.setAttribute("viewBox", "0 0 100 150");
  trail.setAttribute("preserveAspectRatio", "none");
  trail.setAttribute("class", "simTrail");
  trail.setAttribute("aria-hidden", "true");
  const trailPath = document.createElementNS(NS, "polyline");
  trail.append(trailPath);
  $("simCam").insertBefore(trail, $("simActors"));

  // ---------- mode chip + view toggles ----------
  const hud = document.createElement("span");
  hud.className = "simHudChip";
  const bar = document.createElement("div");
  bar.className = "simToolbar";
  scene.append(hud, bar);
  function toggleButton(label, key) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-pressed", "true");
    b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      scene.classList.toggle("hide-" + key, !on);
    };
    bar.append(b);
  }
  toggleButton("ชื่อ", "names");
  toggleButton("สถานะ", "status");
  bar.append($("simSound"));

  // ---------- status line in each name chip ----------
  let demo = { running: false, owner: -1, text: "", waiting: false };
  const actorEls = [...document.querySelectorAll(".simActor")];
  const statusEls = actorEls.map((a) => {
    const chip = a.querySelector(".simName"),
      wrap = document.createElement("span"),
      st = document.createElement("small");
    wrap.className = "simChipText";
    st.className = "simStatus";
    wrap.append(chip.querySelector("img"), st);
    chip.append(wrap);
    return st;
  });
  function render() {
    const s = window.BBStatus.snapshot();
    statusEls.forEach((el, i) => {
      const working = demo.running && demo.owner === i && !demo.waiting;
      el.textContent = demo.running ? (demo.owner === i ? demo.text : i === 0 && demo.waiting ? "รอแม่ตรวจ" : "ว่าง") : s.text[i];
      actorEls[i].classList.toggle("isWorking", working);
      actorEls[i].classList.toggle("isWaiting", i === 0 && demo.waiting);
    });
    hud.textContent = demo.running ? "DEMO · ไม่บันทึกงานจริง" : "Workspace";
    hud.classList.toggle("isDemo", demo.running);
  }

  // ---------- Demo handoff along the aisle ----------
  const parcel = $("simParcel");
  let paused = reduced || scene.classList.contains("simPaused"),
    anim = null;
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
  function moveParcel(points) {
    cancelAnimationFrame(anim);
    parcel.hidden = false;
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
    if (paused || !total) return put(points[points.length - 1]);
    const dur = Math.min(1500, 500 + total * 22),
      t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur),
        e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      put(at(total * e));
      if (p < 1) anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  }
  document.addEventListener("bbsim:demo", (e) => {
    const d = e.detail;
    if (!d.running) {
      demo = { running: false, owner: -1, text: "", waiting: false };
      cancelAnimationFrame(anim);
      parcel.hidden = true;
      scene.classList.remove("isDemo");
      render();
      return;
    }
    scene.classList.add("isDemo");
    demo = { running: true, owner: d.step.owner, waiting: !!d.step.pause, text: d.step.text.replace(/^(BB|Leo|Kitty|Tidy|Chicha)\s*/, "") };
    const path = pathBetween(d.from, d.step.owner);
    trailPath.setAttribute("points", path.map(([x, y]) => x + "," + y * 1.5).join(" "));
    moveParcel(path);
    render();
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
  }).observe(scene, { attributes: true, attributeFilter: ["class"] });
  render();
})();
