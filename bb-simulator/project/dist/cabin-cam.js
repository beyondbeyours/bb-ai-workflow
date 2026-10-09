"use strict";
// 2.5D camera for the jet stage (CSS 3D, no library). The approved jet render is the floor;
// crew stand up as billboards that always face the camera, so faces stay visible at any angle.
// Drag to rotate (mouse: rotate + tilt, touch: rotate), pinch / ctrl+wheel / buttons to zoom,
// tap a person to fly the camera to that station, "ภาพรวม" to return.
(function () {
  const model = window.BBSimulator,
    scene = $("simScene"),
    cam = $("simCam"),
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = 600,
    H = 900;
  // Clouds live below the floor so they rotate and parallax with the aircraft.
  cam.prepend($("simSky"));

  // Phones start almost straight-on so faces stay large; laptops get the angled overview.
  const narrow = () => scene.clientWidth < 560;
  const HOME = narrow() ? { yaw: 0, pitch: 22, zoom: 1.04, fx: 50, fy: 52 } : { yaw: -22, pitch: 38, zoom: 1, fx: 50, fy: 50 };
  let cur = { ...HOME },
    target = { ...HOME },
    fit = 1,
    anim = null;

  function fitScale(v) {
    // Fit the rotated, tilted floor (plus wings) inside the stage.
    const r = scene.getBoundingClientRect(),
      y = (v.yaw * Math.PI) / 180,
      p = (v.pitch * Math.PI) / 180;
    // Worst case over the overview angles, so rotating never clips the wings or changes the size.
    let best = Infinity;
    for (const yy of narrow() ? [y] : [y, y + 0.4, y - 0.4]) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const [cx, cy] of [
        [-W / 2, -H / 2],
        [W / 2, -H / 2],
        [W / 2, H / 2],
        [-W / 2, H / 2],
      ]) {
        const x1 = cx * Math.cos(yy) - cy * Math.sin(yy),
          y1 = (cx * Math.sin(yy) + cy * Math.cos(yy)) * Math.cos(p);
        minX = Math.min(minX, x1);
        maxX = Math.max(maxX, x1);
        minY = Math.min(minY, y1);
        maxY = Math.max(maxY, y1);
      }
      best = Math.min(best, (r.width * 0.98) / (maxX - minX), (r.height * 0.96) / (maxY - minY));
    }
    return best;
  }
  function apply() {
    const s = fit * cur.zoom;
    cam.style.transform = `scale(${s}) rotateX(${cur.pitch}deg) rotateZ(${cur.yaw}deg) translate(${(-cur.fx * W) / 100}px, ${(-cur.fy * H) / 100}px)`;
    scene.style.setProperty("--yaw", cur.yaw + "deg");
    scene.style.setProperty("--pitch", cur.pitch + "deg");
    scene.style.setProperty("--inv", (1 / s).toFixed(3));
    scene.classList.toggle("isTopView", cur.pitch < 6);
  }
  function go(next, instant) {
    target = { ...target, ...next };
    target.pitch = Math.max(0, Math.min(58, target.pitch));
    target.zoom = Math.max(0.8, Math.min(3, target.zoom));
    fit = fitScale({ yaw: HOME.yaw, pitch: target.pitch });
    cancelAnimationFrame(anim);
    if (instant || reduced) {
      cur = { ...target };
      return apply();
    }
    const from = { ...cur },
      t0 = performance.now(),
      dur = 650;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur),
        e = 1 - Math.pow(1 - t, 3);
      for (const k of Object.keys(target)) cur[k] = from[k] + (target[k] - from[k]) * e;
      apply();
      if (t < 1) anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  }
  function focusOn(index, zoom = 1.9) {
    const p = model.crew[index];
    go({ fx: p.x, fy: p.y - model.portraitHeight * 0.45, zoom });
  }

  // ---------- controls ----------
  const ctl = $("simCamCtl");
  const button = (label, title, fn) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.title = title;
    b.setAttribute("aria-label", title);
    b.onclick = fn;
    ctl.append(b);
    return b;
  };
  button("+", "ซูมเข้า", () => go({ zoom: target.zoom * 1.3 }));
  button("−", "ซูมออก", () => go({ zoom: target.zoom / 1.3 }));
  button("↺", "หมุนซ้าย", () => go({ yaw: target.yaw - 30 }));
  button("↻", "หมุนขวา", () => go({ yaw: target.yaw + 30 }));
  const tilt = button("มุมบน", "สลับมุมบนกับมุมเอียง", () => go({ pitch: target.pitch < 6 ? HOME.pitch : 0 }));
  button("ภาพรวม", "กลับภาพรวมทั้งลำ", () => go({ ...HOME }));
  new MutationObserver(() => (tilt.textContent = scene.classList.contains("isTopView") ? "มุมเอียง" : "มุมบน")).observe(scene, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // ---------- drag / pinch ----------
  const pts = new Map();
  let start = null,
    pinch = null;
  scene.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".simCamCtl, .simToolbar, .simHudChip")) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    scene.dataset.dragged = "false";
    if (pts.size === 1) start = { x: e.clientX, y: e.clientY, yaw: target.yaw, pitch: target.pitch, touch: e.pointerType === "touch" };
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: target.zoom };
    }
  });
  scene.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()];
      go({ zoom: (pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d }, true);
      scene.dataset.dragged = "true";
      return;
    }
    if (!start) return;
    const dx = e.clientX - start.x,
      dy = e.clientY - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) scene.dataset.dragged = "true";
    if (scene.dataset.dragged !== "true") return;
    if (!scene.hasPointerCapture(e.pointerId)) scene.setPointerCapture(e.pointerId);
    go({ yaw: start.yaw + dx * 0.4, pitch: start.touch ? start.pitch : start.pitch - dy * 0.25 }, true);
  });
  const end = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!pts.size) {
      start = null;
      // Let the click that follows a drag be ignored, then clear.
      setTimeout(() => (scene.dataset.dragged = "false"), 0);
    }
  };
  scene.addEventListener("pointerup", end);
  scene.addEventListener("pointercancel", end);
  scene.addEventListener(
    "wheel",
    (e) => {
      if (!e.ctrlKey) return; // plain wheel keeps scrolling the page; trackpad pinch arrives as ctrl+wheel
      e.preventDefault();
      go({ zoom: target.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08) }, true);
    },
    { passive: false },
  );

  // ---------- follow selection and Demo ----------
  document.addEventListener("bbsim:select", (e) => {
    if (e.detail.fromStage) focusOn(e.detail.index);
  });
  document.addEventListener("bbsim:demo", (e) => {
    if (e.detail.running) focusOn(e.detail.step.owner, 1.45);
    else go({ ...HOME, yaw: target.yaw });
  });
  addEventListener("resize", () => {
    fit = fitScale({ yaw: HOME.yaw, pitch: target.pitch });
    apply();
  });
  document.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.tab === "simulator")
        requestAnimationFrame(() => {
          fit = fitScale({ yaw: HOME.yaw, pitch: target.pitch });
          apply();
        });
    }),
  );
  window.BBCamera = { go, focusOn, home: () => go({ ...HOME }) };
  fit = fitScale({ yaw: HOME.yaw, pitch: HOME.pitch });
  apply();
})();
