"use strict";
// Review room: BB checks a preview (video or image), pins each fix at a timecode or a spot,
// assigns it to the right person, and tracks every pin to "ผ่าน". A version can pass review only
// when every pin has passed. Files and pins live in this browser (IndexedDB) until a backend
// exists; the revision sheet is copied out to LINE or an AI. Final approval of the editable work
// still happens in Canva / CapCut.
(function () {
  const model = window.BBSimulator,
    app = $("reviewApp");
  const CATS = [
    { id: "text", label: "ข้อความ / ซับ", owner: 3 },
    { id: "ci", label: "สี / CI", owner: 3 },
    { id: "cut", label: "จังหวะ / ตัดต่อ", owner: 2 },
    { id: "shot", label: "ภาพ / ช็อต", owner: 1 },
    { id: "audio", label: "เพลง / เสียง", owner: 2 },
    { id: "cover", label: "หน้าปก", owner: 3 },
    { id: "other", label: "อื่น ๆ", owner: 2 },
  ];
  const STATUS = { open: "ต้องแก้", fixed: "ทีมแก้แล้ว รอตรวจ", pass: "ผ่าน", fail: "ยังไม่ผ่าน" };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    return String(m).padStart(2, "0") + ":" + (s - m * 60).toFixed(1).padStart(4, "0");
  };

  // ---------- storage (separate DB so the existing reference store is untouched) ----------
  let dbp;
  function db() {
    if (!dbp)
      dbp = new Promise((res, rej) => {
        const r = indexedDB.open("bb-simulator-review", 1);
        r.onupgradeneeded = () => {
          r.result.createObjectStore("sessions", { keyPath: "id" });
          r.result.createObjectStore("files", { keyPath: "id" });
        };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    return dbp;
  }
  async function op(store, mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const tx = d.transaction(store, mode);
      let out;
      const q = fn(tx.objectStore(store));
      q.onsuccess = () => (out = q.result);
      tx.oncomplete = () => res(out);
      tx.onerror = tx.onabort = () => rej(tx.error);
    });
  }
  const putSession = (s) => op("sessions", "readwrite", (st) => st.put(s));

  let sessions = [],
    cur = null,
    verIndex = 0,
    fileURL = null,
    compareURL = null,
    draftPin = null,
    filter = "all",
    status = "";

  async function load() {
    try {
      sessions = (await op("sessions", "readonly", (s) => s.getAll())) || [];
    } catch {
      status = "เปิดที่เก็บงานตรวจไม่ได้ อาจอยู่ในโหมดส่วนตัวหรือปิดการเก็บข้อมูล";
    }
    const mine = brandSessions();
    if (!cur || !mine.includes(cur)) cur = mine[0] || null;
    verIndex = cur ? cur.versions.length - 1 : 0;
    await loadMedia();
    render();
  }
  const brandSessions = () => sessions.filter((s) => s.brandId === currentBrand().id).sort((a, b) => b.updated.localeCompare(a.updated));
  async function loadMedia() {
    [fileURL, compareURL].forEach((u) => u && URL.revokeObjectURL(u));
    fileURL = compareURL = null;
    const v = cur?.versions[verIndex];
    if (!v) return;
    try {
      const f = await op("files", "readonly", (s) => s.get(v.fileId));
      if (f) fileURL = URL.createObjectURL(f.blob);
      const p = cur.versions[verIndex - 1];
      if (p) {
        const pf = await op("files", "readonly", (s) => s.get(p.fileId));
        if (pf) compareURL = URL.createObjectURL(pf.blob);
      }
    } catch {
      status = "เปิดไฟล์ Preview ไม่ได้";
    }
  }

  // ---------- actions ----------
  async function newSession() {
    const title = $("title").value.trim() || "งานตรวจ " + new Date().toLocaleDateString("th-TH");
    cur = {
      id: crypto.randomUUID(),
      brandId: currentBrand().id,
      brandName: currentBrand().name,
      title,
      lane: $("productionLane").value,
      versions: [],
      pins: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      passed: null,
    };
    sessions.push(cur);
    await putSession(cur);
    verIndex = 0;
    status = "สร้างรอบตรวจ " + title + " แล้ว · อัปโหลด Preview v1";
    render();
  }
  async function addVersion(file) {
    if (!file || !(file.type.startsWith("video/") || file.type.startsWith("image/")))
      return ((status = "เลือกไฟล์วิดีโอหรือภาพ"), render());
    const id = crypto.randomUUID();
    try {
      await op("files", "readwrite", (s) => s.put({ id, blob: file }));
    } catch {
      status = "บันทึกไฟล์ไม่ได้ พื้นที่เบราว์เซอร์อาจเต็ม";
      return render();
    }
    cur.versions.push({
      n: cur.versions.length + 1,
      fileId: id,
      name: file.name,
      kind: file.type.startsWith("video/") ? "video" : "image",
      created: new Date().toISOString(),
    });
    cur.passed = null;
    // Pins the team marked fixed now need BB to check them on the new version.
    cur.updated = new Date().toISOString();
    await putSession(cur);
    verIndex = cur.versions.length - 1;
    status =
      "อัปโหลด v" + cur.versions.length + " แล้ว" + (cur.pins.some((p) => p.status !== "pass") ? " · ตรวจหมุดที่ค้างในเวอร์ชันนี้" : "");
    await loadMedia();
    render();
  }
  async function savePin(p) {
    cur.pins.push(p);
    cur.passed = null;
    cur.updated = new Date().toISOString();
    await putSession(cur);
    status = "ปักหมุด #" + cur.pins.length + " แล้ว · ส่งให้ " + model.crew[p.owner].name;
    render();
  }
  async function setStatus(p, s) {
    p.status = s;
    p.log.push({ s, at: new Date().toISOString(), v: cur.versions[verIndex]?.n });
    cur.updated = new Date().toISOString();
    if (s !== "pass") cur.passed = null;
    await putSession(cur);
    render();
  }
  async function passVersion() {
    cur.passed = { version: cur.versions[verIndex].n, at: new Date().toISOString() };
    await putSession(cur);
    status = "Preview v" + cur.passed.version + " ผ่านการตรวจแล้ว · อนุมัติขั้นสุดท้ายใน " + (cur.lane === "video" ? "CapCut" : "Canva");
    render();
  }
  function sheet() {
    const lines = ["ใบสั่งแก้ · " + cur.title + " · " + cur.brandName + " · ตรวจจาก v" + (cur.versions[verIndex]?.n || "-"), ""];
    for (let i = 0; i < model.crew.length; i++) {
      const mine = cur.pins.map((p, k) => [p, k]).filter(([p]) => p.owner === i && p.status !== "pass");
      if (!mine.length) continue;
      lines.push(model.crew[i].name + " (" + model.crew[i].role + ")");
      for (const [p, k] of mine)
        lines.push(
          "  #" +
            (k + 1) +
            " " +
            (p.t != null ? "[" + fmt(p.t) + "] " : "") +
            CATS.find((c) => c.id === p.cat).label +
            (p.must ? " · ต้องแก้" : " · ถ้าทำได้") +
            " · " +
            STATUS[p.status] +
            "\n     " +
            p.note,
        );
      lines.push("");
    }
    if (lines.length === 2) lines.push("ไม่มีหมุดค้าง");
    return lines.join("\n");
  }

  // ---------- render ----------
  let mediaEl = null,
    keep = null;
  function render() {
    // Re-rendering rebuilds the player; keep the moment BB was looking at.
    if (mediaEl?.tagName === "VIDEO" && cur) keep = { id: cur.id, v: verIndex, t: mediaEl.currentTime };
    app.replaceChildren();
    const bar = el("div", "rvBar");
    const pick = el("select");
    pick.setAttribute("aria-label", "เลือกรอบตรวจ");
    const mine = brandSessions();
    if (!mine.length) pick.append(new Option("ยังไม่มีรอบตรวจของแบรนด์นี้", ""));
    mine.forEach((s) => pick.append(new Option(s.title + " · v" + s.versions.length + (s.passed ? " · ผ่านแล้ว" : ""), s.id)));
    pick.value = cur?.id || "";
    pick.onchange = async () => {
      cur = sessions.find((s) => s.id === pick.value) || null;
      verIndex = cur ? Math.max(0, cur.versions.length - 1) : 0;
      draftPin = null;
      await loadMedia();
      render();
    };
    const add = el("button", "textbutton", "+ รอบตรวจใหม่จากบรีฟ");
    add.type = "button";
    add.onclick = newSession;
    bar.append(pick, add);
    app.append(bar);
    if (status) {
      const st = el("p", "rvStatus", status);
      st.setAttribute("role", "status");
      app.append(st);
    }
    if (!cur) {
      app.append(el("div", "rvEmpty", "กด “รอบตรวจใหม่จากบรีฟ” แล้วอัปโหลด Preview ที่ทีมส่งมา (คลิปหรือภาพ) เพื่อเริ่มปักหมุดสั่งแก้"));
      return;
    }
    // Version tabs + upload
    const vers = el("div", "rvVersions");
    cur.versions.forEach((v, i) => {
      const b = el("button", "", "v" + v.n);
      b.type = "button";
      b.setAttribute("aria-pressed", String(i === verIndex));
      b.onclick = async () => {
        verIndex = i;
        draftPin = null;
        await loadMedia();
        render();
      };
      vers.append(b);
    });
    const up = el("label", "rvUpload", cur.versions.length ? "+ อัปโหลดเวอร์ชันใหม่" : "+ อัปโหลด Preview v1");
    const input = el("input");
    input.type = "file";
    input.accept = "video/*,image/*";
    input.hidden = true;
    input.onchange = () => addVersion(input.files[0]);
    up.append(input);
    vers.append(up);
    app.append(vers);

    const grid = el("div", "rvGrid");
    const left = el("div", "rvMedia");
    const right = el("div", "rvPins");
    grid.append(left, right);
    app.append(grid);

    const v = cur.versions[verIndex];
    if (!v || !fileURL) {
      left.append(el("div", "rvEmpty", v ? "เปิดไฟล์นี้ไม่ได้" : "ยังไม่มีไฟล์ Preview · อัปโหลดด้านบน"));
    } else {
      const frame = el("div", "rvFrame");
      if (v.kind === "video") {
        mediaEl = el("video");
        mediaEl.controls = true;
        mediaEl.playsInline = true;
      } else mediaEl = el("img");
      mediaEl.src = fileURL;
      mediaEl.alt = v.name;
      frame.append(mediaEl);
      const layer = el("div", "rvLayer");
      frame.append(layer);
      // Click on the picture pins a spot (and the current time for video).
      layer.onclick = (e) => {
        const r = layer.getBoundingClientRect();
        if (v.kind === "video") mediaEl.pause();
        draftPin = {
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
          t: v.kind === "video" ? mediaEl.currentTime : null,
        };
        renderPinForm(right);
        drawPins(layer, v);
      };
      left.append(frame);
      if (v.kind === "video") {
        const track = el("div", "rvTrack");
        left.append(track);
        const drawTrack = () => {
          track.replaceChildren();
          if (!isFinite(mediaEl.duration)) return;
          cur.pins.forEach((p, k) => {
            if (p.t == null) return;
            const m = el("button", "rvMark is-" + p.status, String(k + 1));
            m.type = "button";
            m.style.left = (p.t / mediaEl.duration) * 100 + "%";
            m.title = fmt(p.t) + " " + p.note;
            m.onclick = () => ((mediaEl.currentTime = p.t), mediaEl.pause());
            track.append(m);
          });
        };
        mediaEl.onloadedmetadata = () => {
          if (keep && keep.id === cur.id && keep.v === verIndex) mediaEl.currentTime = keep.t;
          drawTrack();
        };
        mediaEl.ontimeupdate = () => drawPins(layer, v);
        const quick = el("button", "primary", "ปักหมุดที่วินาทีนี้");
        quick.type = "button";
        quick.onclick = () => {
          mediaEl.pause();
          draftPin = { x: 50, y: 50, t: mediaEl.currentTime };
          renderPinForm(right);
          drawPins(layer, v);
        };
        left.append(quick);
      }
      left.append(el("p", "hint", "แตะบนภาพหรือวิดีโอ ณ จุดที่ต้องแก้ เพื่อปักหมุด"));
      drawPins(layer, v);
      if (compareURL) {
        const prev = cur.versions[verIndex - 1];
        const cmp = el("details", "rvCompare");
        cmp.append(el("summary", "", "เทียบกับ v" + prev.n));
        const pm = el(prev.kind === "video" ? "video" : "img");
        pm.src = compareURL;
        if (prev.kind === "video") {
          pm.muted = true;
          pm.playsInline = true;
          if (v.kind === "video") {
            // Follow the main player so both show the same moment.
            mediaEl.addEventListener(
              "timeupdate",
              () =>
                Math.abs(pm.currentTime - mediaEl.currentTime) > 0.3 && (pm.currentTime = Math.min(mediaEl.currentTime, pm.duration || 0)),
            );
            mediaEl.addEventListener("play", () => pm.play().catch(() => {}));
            mediaEl.addEventListener("pause", () => pm.pause());
          }
        }
        cmp.append(pm);
        left.append(cmp);
      }
    }
    renderPinList(right);
  }
  function drawPins(layer, v) {
    layer.replaceChildren();
    const now = v.kind === "video" && mediaEl ? mediaEl.currentTime : null;
    cur.pins.forEach((p, k) => {
      if (p.x == null) return;
      if (v.kind === "video" && (p.t == null || Math.abs(p.t - now) > 0.6)) return;
      const d = el("span", "rvPin is-" + p.status, String(k + 1));
      d.style.left = p.x + "%";
      d.style.top = p.y + "%";
      layer.append(d);
    });
    if (draftPin && draftPin.x != null) {
      const d = el("span", "rvPin isDraft", "+");
      d.style.left = draftPin.x + "%";
      d.style.top = draftPin.y + "%";
      layer.append(d);
    }
  }
  function renderPinForm(right) {
    right.querySelector(".rvForm")?.remove();
    const f = el("form", "rvForm");
    f.append(el("strong", "", "หมุดใหม่" + (draftPin.t != null ? " · " + fmt(draftPin.t) : "")));
    const cats = el("div", "rvCats");
    let cat = CATS[0];
    const owner = el("select");
    owner.setAttribute("aria-label", "ส่งให้ใคร");
    model.crew.forEach((p, i) => owner.append(new Option("ส่งให้ " + p.name + " · " + p.role, String(i))));
    CATS.forEach((c, i) => {
      const b = el("button", "", c.label);
      b.type = "button";
      b.setAttribute("aria-pressed", String(i === 0));
      b.onclick = () => {
        cat = c;
        cats.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        owner.value = String(c.owner);
      };
      cats.append(b);
    });
    owner.value = String(cat.owner);
    const note = el("textarea");
    note.rows = 3;
    note.required = true;
    note.placeholder = "ต้องการให้แก้อะไร ให้ชัดว่าเปลี่ยนจากอะไรเป็นอะไร";
    note.setAttribute("aria-label", "รายละเอียดที่ต้องแก้");
    const mustL = el("label", "togglelabel");
    const must = el("input");
    must.type = "checkbox";
    must.checked = true;
    mustL.append(must, el("span", "", "ต้องแก้ก่อนผ่าน (ไม่ติ๊ก = ถ้าทำได้)"));
    const row = el("div", "rvFormBtns");
    const save = el("button", "primary", "ปักหมุด");
    const cancel = el("button", "textbutton", "ยกเลิก");
    cancel.type = "button";
    cancel.onclick = () => {
      draftPin = null;
      render();
    };
    row.append(save, cancel);
    f.append(cats, owner, note, mustL, row);
    f.onsubmit = (e) => {
      e.preventDefault();
      if (!note.value.trim()) return note.focus();
      const p = {
        id: crypto.randomUUID(),
        v: cur.versions[verIndex].n,
        t: draftPin.t,
        x: draftPin.x,
        y: draftPin.y,
        cat: cat.id,
        owner: Number(owner.value),
        note: note.value.trim(),
        must: must.checked,
        status: "open",
        log: [{ s: "open", at: new Date().toISOString(), v: cur.versions[verIndex].n }],
      };
      draftPin = null;
      savePin(p);
    };
    right.prepend(f);
    note.focus();
  }
  function renderPinList(right) {
    const counts = { open: 0, fixed: 0, pass: 0, fail: 0 };
    cur.pins.forEach((p) => counts[p.status]++);
    const sum = el("div", "rvSummary");
    for (const [k, label] of [
      ["all", "ทั้งหมด " + cur.pins.length],
      ["open", "ต้องแก้ " + (counts.open + counts.fail)],
      ["fixed", "รอตรวจ " + counts.fixed],
      ["pass", "ผ่าน " + counts.pass],
    ]) {
      const b = el("button", "", label);
      b.type = "button";
      b.setAttribute("aria-pressed", String(filter === k));
      b.onclick = () => {
        filter = k;
        render();
      };
      sum.append(b);
    }
    right.append(sum);
    const ol = el("ol", "rvList");
    const shown = cur.pins
      .map((p, k) => [p, k])
      .filter(([p]) => filter === "all" || p.status === filter || (filter === "open" && p.status === "fail"));
    if (!shown.length)
      ol.append(el("li", "rvEmptyRow", cur.pins.length ? "ไม่มีหมุดในกลุ่มนี้" : "ยังไม่มีหมุด · แตะบน Preview เพื่อเริ่มสั่งแก้"));
    for (const [p, k] of shown) {
      const li = el("li", "is-" + p.status);
      const top = el("div", "rvRowTop");
      const num = el("button", "rvNum", String(k + 1));
      num.type = "button";
      num.title = "ไปที่จุดนี้";
      num.onclick = () => {
        if (p.t != null && mediaEl?.tagName === "VIDEO") {
          mediaEl.currentTime = p.t;
          mediaEl.pause();
        }
      };
      top.append(
        num,
        el("span", "rvTime", p.t != null ? fmt(p.t) : "ภาพ"),
        el("span", "rvCat", CATS.find((c) => c.id === p.cat).label),
        window.BBAvatar(p.owner, 22),
        el("span", "rvOwner", model.crew[p.owner].name),
        el("em", "rvState is-" + p.status, STATUS[p.status]),
      );
      li.append(top, el("p", "rvNote", (p.must ? "" : "(ถ้าทำได้) ") + p.note), el("small", "rvMeta", "ปักใน v" + p.v));
      const acts = el("div", "rvActs");
      const act = (label, s, cls = "") => {
        const b = el("button", cls, label);
        b.type = "button";
        b.onclick = () => setStatus(p, s);
        acts.append(b);
      };
      if (p.status === "open" || p.status === "fail") act("ทีมแก้แล้ว", "fixed");
      if (p.status !== "pass") act("ผ่าน", "pass", "isPass");
      if (p.status === "fixed") act("ยังไม่ผ่าน", "fail");
      if (p.status === "pass") act("เปิดหมุดใหม่", "open");
      li.append(acts);
      ol.append(li);
    }
    right.append(ol);
    const blockers = cur.pins.filter((p) => p.status !== "pass" && p.must).length,
      soft = cur.pins.filter((p) => p.status !== "pass" && !p.must).length;
    const foot = el("div", "rvFoot");
    const copy = el("button", "textbutton", "คัดลอกใบสั่งแก้");
    copy.type = "button";
    copy.onclick = async () => {
      const text = sheet();
      try {
        await navigator.clipboard.writeText(text);
        status = "คัดลอกใบสั่งแก้แล้ว · วางใน LINE หรือส่งให้ AI ได้";
        render();
      } catch {
        foot.append(el("pre", "vbPre", text));
      }
    };
    const pass = el(
      "button",
      "primary",
      cur.passed ? "Preview v" + cur.passed.version + " ผ่านแล้ว" : "ผ่านการตรวจ Preview v" + (cur.versions[verIndex]?.n || "-"),
    );
    pass.type = "button";
    pass.disabled = !!cur.passed || !cur.versions.length || blockers + soft > 0 || verIndex !== cur.versions.length - 1;
    pass.onclick = passVersion;
    const why = el(
      "small",
      "rvWhy",
      !cur.versions.length
        ? "อัปโหลด Preview ก่อน"
        : verIndex !== cur.versions.length - 1
          ? "ผ่านได้เฉพาะเวอร์ชันล่าสุด"
          : blockers + soft
            ? "ยังมีหมุดค้าง " + (blockers + soft) + " จุด · ทุกหมุดต้องผ่านก่อน"
            : cur.passed
              ? "อนุมัติขั้นสุดท้ายยังต้องทำใน " + (cur.lane === "video" ? "CapCut" : "Canva")
              : "ทุกหมุดผ่านแล้ว",
    );
    foot.append(copy, pass, why);
    right.append(foot);
    if (draftPin) renderPinForm(right);
  }

  $("brandSelect").addEventListener("change", () => {
    cur = null;
    load();
  });
  document.querySelectorAll('[data-tab="review"]').forEach((b) => b.addEventListener("click", () => load()));
  window.BBReview = { open: () => tab("review") };
  load();
})();
