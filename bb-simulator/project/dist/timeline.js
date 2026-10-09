"use strict";
// Video Builder: BB lays out a rough timeline herself before anyone edits.
// Shots come from local footage (playable here) or Drive links (listed, not read: access is not
// verified). Output is a precise spec: shot list with timecodes, per-shot subtitle/Super, cover
// frame, and an SRT built from the shot order. It is not a CapCut project; an editor or AI
// assembles the editable CapCut timeline from this spec.
(function () {
  const root = $("vbBuilder");
  let tl = { shots: [], drive: [] },
    clip = null, // { kind: "local", f } or { kind: "drive", d }
    mark = { in: null, out: null },
    playing = null;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const fmt = (s) => {
    if (s == null || !isFinite(s)) return "--:--.-";
    const m = Math.floor(s / 60),
      r = s - m * 60;
    return String(m).padStart(2, "0") + ":" + r.toFixed(1).padStart(4, "0");
  };
  const parse = (v) => {
    const m = String(v)
      .trim()
      .match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
    return m ? Number(m[1] || 0) * 60 + Number(m[2]) : null;
  };
  const srtTime = (s) => {
    const ms = Math.round(s * 1000),
      h = Math.floor(ms / 3600000),
      m = Math.floor((ms % 3600000) / 60000),
      sec = Math.floor((ms % 60000) / 1000);
    return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":") + "," + String(ms % 1000).padStart(3, "0");
  };
  const localVideos = () => footage.filter((f) => f.file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.file.name));
  const findLocal = (shot) => footage.find((f) => f.file.name === shot.clipName && f.file.size === shot.clipSize);
  const len = (s) => Math.max(0, (s.out ?? 0) - (s.in ?? 0));

  // ---------- layout ----------
  root.innerHTML = "";
  const head = el("div", "vbHead");
  head.append(
    el("h3", "", "Timeline ร่าง"),
    el(
      "p",
      "hint",
      "เลือกช็อต ตั้งจุดเข้า/ออก ใส่ซับและ Super ทีละช็อต แล้วเล่นดูต่อกันได้ · ส่งออกเป็น Spec ให้คนหรือ AI ประกอบใน CapCut",
    ),
  );
  const bin = el("div", "vbBin");
  const driveRow = el("div", "vbDrive");
  const driveInput = el("input");
  driveInput.type = "url";
  driveInput.placeholder = "วางลิงก์ Google Drive ของคลิป";
  driveInput.setAttribute("aria-label", "ลิงก์ Google Drive");
  const driveName = el("input");
  driveName.placeholder = "ชื่อคลิป";
  driveName.setAttribute("aria-label", "ชื่อคลิปจาก Drive");
  const driveAdd = el("button", "textbutton", "+ เพิ่มลิงก์ Drive");
  driveAdd.type = "button";
  driveRow.append(driveInput, driveName, driveAdd);

  const stage = el("div", "vbStage");
  const player = el("video");
  player.id = "vbPlayer";
  player.controls = true;
  player.playsInline = true;
  player.preload = "metadata";
  const overlay = el("div", "vbOverlay");
  const ovSuper = el("span", "vbOvSuper"),
    ovSub = el("span", "vbOvSub");
  overlay.append(ovSuper, ovSub);
  const empty = el("div", "vbEmpty", "เลือกคลิปจากด้านบน · ใส่ไฟล์ใน Footage ก่อน หรือเพิ่มลิงก์ Drive");
  const playerWrap = el("div", "vbPlayerWrap");
  playerWrap.append(player, overlay, empty);

  const form = el("div", "vbForm");
  const clipLabel = el("strong", "vbClipName", "ยังไม่ได้เลือกคลิป");
  const inBtn = el("button", "", "ตั้งจุดเข้า"),
    outBtn = el("button", "", "ตั้งจุดออก");
  inBtn.type = outBtn.type = "button";
  const inField = el("input"),
    outField = el("input");
  inField.placeholder = "เข้า 00:00.0";
  outField.placeholder = "ออก 00:00.0";
  inField.setAttribute("aria-label", "จุดเข้า");
  outField.setAttribute("aria-label", "จุดออก");
  const marks = el("div", "vbMarks");
  marks.append(inBtn, inField, outBtn, outField);
  const sub = el("input"),
    sup = el("input"),
    note = el("input");
  sub.placeholder = "ซับของช็อตนี้ (ถ้ามี)";
  sup.placeholder = "Super / คำเน้นบนจอ (ถ้ามี)";
  note.placeholder = "โน้ตถึงคนตัด เช่น ตัดตามจังหวะเพลง ซูมเข้า";
  sub.setAttribute("aria-label", "ซับของช็อต");
  sup.setAttribute("aria-label", "Super ของช็อต");
  note.setAttribute("aria-label", "โน้ตถึงคนตัด");
  const coverLabel = el("label", "togglelabel");
  const cover = el("input");
  cover.type = "checkbox";
  coverLabel.append(cover, el("span", "", "ใช้เฟรมจุดเข้าเป็นภาพหน้าปก"));
  const addShot = el("button", "primary", "เพิ่มช็อตลง Timeline");
  addShot.type = "button";
  const formStatus = el("p", "hint");
  formStatus.setAttribute("aria-live", "polite");
  form.append(clipLabel, marks, sub, sup, note, coverLabel, addShot, formStatus);
  stage.append(playerWrap, form);

  const strip = el("div", "vbStrip");
  const totals = el("p", "vbTotals");
  const list = el("ol", "vbList");
  const actions = el("div", "vbActions");
  const playAll = el("button", "primary", "▶ เล่น Timeline");
  const copySpec = el("button", "textbutton", "คัดลอก Shot List");
  const srt = el("button", "textbutton", "ดาวน์โหลด SRT");
  [playAll, copySpec, srt].forEach((b) => (b.type = "button"));
  const actionStatus = el("p", "hint");
  actionStatus.setAttribute("aria-live", "polite");
  actions.append(playAll, copySpec, srt);
  root.append(head, bin, driveRow, stage, strip, totals, list, actions, actionStatus);

  // ---------- clip bin ----------
  function renderBin() {
    bin.replaceChildren();
    const vids = localVideos();
    if (!vids.length && !tl.drive.length) bin.append(el("span", "hint", "ยังไม่มีคลิป · ใส่ไฟล์ด้านบน หรือเพิ่มลิงก์ Drive"));
    vids.forEach((f) => {
      const b = el("button", "vbClip" + (clip?.f === f ? " isOn" : ""), f.file.name);
      b.type = "button";
      b.onclick = () => selectClip({ kind: "local", f });
      bin.append(b);
    });
    tl.drive.forEach((d) => {
      const b = el("button", "vbClip isDrive" + (clip?.d === d ? " isOn" : ""), d.name);
      b.type = "button";
      b.title = d.url;
      b.append(el("small", "", "Drive · ยังไม่ได้ตรวจสิทธิ์"));
      b.onclick = () => selectClip({ kind: "drive", d });
      bin.append(b);
    });
  }
  function selectClip(c) {
    stopSequence();
    clip = c;
    mark = { in: null, out: null };
    inField.value = outField.value = "";
    if (c.kind === "local") {
      player.src = c.f.url;
      player.hidden = false;
      empty.hidden = true;
      clipLabel.textContent = c.f.file.name;
    } else {
      player.removeAttribute("src");
      player.load();
      player.hidden = true;
      empty.hidden = false;
      empty.textContent = "คลิปจาก Drive เปิดเล่นในหน้านี้ไม่ได้ (ยังไม่ได้เชื่อม Drive) · พิมพ์จุดเข้า/ออกเองได้";
      clipLabel.textContent = c.d.name + " · Drive";
    }
    inBtn.disabled = outBtn.disabled = c.kind !== "local";
    renderBin();
  }
  driveAdd.onclick = () => {
    const url = driveInput.value.trim();
    if (!/^https:\/\/(drive|docs)\.google\.com\//.test(url)) {
      formStatus.textContent = "ใส่ลิงก์ที่ขึ้นต้นด้วย https://drive.google.com/";
      return;
    }
    tl.drive.push({ url, name: driveName.value.trim() || "คลิป Drive " + (tl.drive.length + 1) });
    driveInput.value = driveName.value = "";
    renderBin();
    changed();
  };

  // ---------- marking + adding shots ----------
  inBtn.onclick = () => {
    mark.in = player.currentTime;
    inField.value = fmt(mark.in);
  };
  outBtn.onclick = () => {
    mark.out = player.currentTime;
    outField.value = fmt(mark.out);
  };
  let editing = null;
  addShot.onclick = () => {
    if (!clip) return (formStatus.textContent = "เลือกคลิปก่อน");
    const a = parse(inField.value),
      b = parse(outField.value);
    if (a == null || b == null) return (formStatus.textContent = "ตั้งจุดเข้าและจุดออก (นาที:วินาที)");
    if (b <= a) return (formStatus.textContent = "จุดออกต้องอยู่หลังจุดเข้า");
    if (clip.kind === "local" && isFinite(player.duration) && b > player.duration + 0.05)
      return (formStatus.textContent = "จุดออกเกินความยาวคลิป (" + fmt(player.duration) + ")");
    const shot = {
      id: editing?.id || crypto.randomUUID(),
      source: clip.kind,
      clipName: clip.kind === "local" ? clip.f.file.name : clip.d.name,
      clipSize: clip.kind === "local" ? clip.f.file.size : 0,
      driveUrl: clip.kind === "drive" ? clip.d.url : "",
      in: a,
      out: b,
      sub: sub.value.trim(),
      super: sup.value.trim(),
      note: note.value.trim(),
      cover: cover.checked,
    };
    if (shot.cover) tl.shots.forEach((s) => (s.cover = false));
    if (editing) tl.shots[tl.shots.findIndex((s) => s.id === editing.id)] = shot;
    else tl.shots.push(shot);
    formStatus.textContent = editing ? "แก้ช็อตแล้ว" : "เพิ่มช็อต #" + tl.shots.length + " แล้ว";
    editing = null;
    addShot.textContent = "เพิ่มช็อตลง Timeline";
    sub.value = sup.value = note.value = "";
    cover.checked = false;
    renderTimeline();
    changed();
  };

  // ---------- timeline ----------
  function renderTimeline() {
    strip.replaceChildren();
    list.replaceChildren();
    const total = tl.shots.reduce((t, s) => t + len(s), 0),
      target = duration();
    tl.shots.forEach((s, i) => {
      const block = el("button", "vbBlock" + (s.source === "drive" ? " isDrive" : "") + (s.cover ? " isCover" : ""));
      block.type = "button";
      block.style.flexGrow = String(Math.max(0.4, len(s)));
      block.append(el("b", "", "#" + (i + 1)), el("small", "", len(s).toFixed(1) + "s"));
      block.title = s.clipName + " " + fmt(s.in) + "–" + fmt(s.out);
      block.onclick = () => playShot(i);
      strip.append(block);
      const li = el("li");
      const info = el("div", "vbInfo");
      info.append(
        el("strong", "", "#" + (i + 1) + " · " + s.clipName + (s.source === "drive" ? " (Drive)" : "")),
        el("span", "", fmt(s.in) + " → " + fmt(s.out) + " · " + len(s).toFixed(1) + " วินาที" + (s.cover ? " · หน้าปก" : "")),
      );
      if (s.sub) info.append(el("span", "vbTxt", "ซับ: " + s.sub));
      if (s.super) info.append(el("span", "vbTxt", "Super: " + s.super));
      if (s.note) info.append(el("span", "vbTxt", "โน้ต: " + s.note));
      if (s.source === "local" && !findLocal(s))
        info.append(el("span", "vbWarn", "ต้องแนบไฟล์ " + s.clipName + " ใหม่ใน Footage (ไฟล์ไม่ได้เก็บข้ามการรีเฟรช)"));
      const ctl = el("div", "vbRowCtl");
      const btn = (t, label, fn, dis) => {
        const b = el("button", "", t);
        b.type = "button";
        b.setAttribute("aria-label", label);
        b.disabled = !!dis;
        b.onclick = fn;
        ctl.append(b);
      };
      btn("↑", "เลื่อนช็อตขึ้น", () => move(i, -1), i === 0);
      btn("↓", "เลื่อนช็อตลง", () => move(i, 1), i === tl.shots.length - 1);
      btn("แก้", "แก้ช็อต", () => edit(s));
      btn("ลบ", "ลบช็อต", () => {
        tl.shots.splice(i, 1);
        renderTimeline();
        changed();
      });
      li.append(info, ctl);
      list.append(li);
    });
    if (!tl.shots.length) strip.append(el("span", "hint", "ยังไม่มีช็อตใน Timeline"));
    const diff = target ? total - target : 0;
    totals.textContent =
      "รวม " +
      tl.shots.length +
      " ช็อต · " +
      total.toFixed(1) +
      " วินาที" +
      (target
        ? " · เป้าหมาย " +
          target +
          " วินาที" +
          (Math.abs(diff) > 1 ? (diff > 0 ? " · ยาวเกิน " : " · ขาดอีก ") + Math.abs(diff).toFixed(1) + " วินาที" : " · พอดี")
        : "");
    totals.classList.toggle("isWarn", !!target && Math.abs(diff) > 1);
    playAll.disabled = copySpec.disabled = srt.disabled = !tl.shots.length;
  }
  function move(i, d) {
    const [s] = tl.shots.splice(i, 1);
    tl.shots.splice(i + d, 0, s);
    renderTimeline();
    changed();
  }
  function edit(s) {
    const local = s.source === "local" ? findLocal(s) : null;
    const d = tl.drive.find((x) => x.url === s.driveUrl);
    if (local) selectClip({ kind: "local", f: local });
    else if (d) selectClip({ kind: "drive", d });
    else return (formStatus.textContent = "แนบไฟล์ " + s.clipName + " ใน Footage ก่อนแก้ช็อตนี้");
    inField.value = fmt(s.in);
    outField.value = fmt(s.out);
    sub.value = s.sub;
    sup.value = s.super;
    note.value = s.note;
    cover.checked = s.cover;
    editing = s;
    addShot.textContent = "บันทึกการแก้ช็อต";
    if (local) player.currentTime = s.in;
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ---------- sequence preview ----------
  function showText(s) {
    ovSuper.textContent = s?.super || "";
    ovSub.textContent = s?.sub || "";
  }
  function stopSequence() {
    playing = null;
    player.ontimeupdate = null;
    showText(null);
    playAll.textContent = "▶ เล่น Timeline";
  }
  function playShot(i, chain = false) {
    const s = tl.shots[i];
    if (!s) return stopSequence();
    const f = s.source === "local" ? findLocal(s) : null;
    if (!f) {
      actionStatus.textContent =
        "ข้ามช็อต #" + (i + 1) + " · " + (s.source === "drive" ? "คลิป Drive เล่นในหน้านี้ไม่ได้" : "ต้องแนบไฟล์ใหม่");
      return chain ? playShot(i + 1, true) : null;
    }
    playing = { i, chain };
    if (player.src !== f.url) player.src = f.url;
    player.hidden = false;
    empty.hidden = true;
    clipLabel.textContent = s.clipName;
    showText(s);
    const start = () => {
      player.currentTime = s.in;
      player.play().catch(() => {});
    };
    if (player.readyState >= 1) start();
    else player.onloadedmetadata = start;
    player.ontimeupdate = () => {
      if (!playing || player.currentTime < s.out) return;
      player.pause();
      if (playing.chain) playShot(i + 1, true);
      else stopSequence();
    };
  }
  playAll.onclick = () => {
    if (playing) {
      player.pause();
      return stopSequence();
    }
    actionStatus.textContent = "";
    playAll.textContent = "■ หยุด";
    playShot(0, true);
  };

  // ---------- export ----------
  function specText() {
    const s = window.BBStatus.snapshot();
    const lines = [
      "Timeline ร่าง · " + (s.title || "ไม่มีชื่อโปรเจกต์") + " · " + s.brand.name,
      "อัตราส่วน " + $("ratio").value + " · เป้าหมาย " + duration() + " วินาที",
      "",
    ];
    let t = 0;
    tl.shots.forEach((x, i) => {
      lines.push(
        "#" +
          (i + 1) +
          " [" +
          fmt(t) +
          "–" +
          fmt(t + len(x)) +
          " ในคลิปจบ] " +
          x.clipName +
          (x.source === "drive" ? " (" + x.driveUrl + ")" : "") +
          " · ใช้ " +
          fmt(x.in) +
          "–" +
          fmt(x.out),
      );
      if (x.sub) lines.push("   ซับ: " + x.sub);
      if (x.super) lines.push("   Super: " + x.super);
      if (x.note) lines.push("   โน้ต: " + x.note);
      if (x.cover) lines.push("   ใช้เฟรมจุดเข้าเป็นหน้าปก");
      t += len(x);
    });
    lines.push("", "ประกอบใน CapCut ให้แก้ Timeline ต่อได้ · แยก Track ซับ / Super / เพลง");
    return lines.join("\n");
  }
  copySpec.onclick = async () => {
    const text = specText();
    try {
      await navigator.clipboard.writeText(text);
      actionStatus.textContent = "คัดลอก Shot List แล้ว · วางใน LINE หรือส่งให้ AI ได้";
    } catch {
      actionStatus.textContent = "คัดลอกอัตโนมัติไม่ได้ · เลือกข้อความด้านล่างแล้วคัดลอกเอง";
      const pre = el("pre", "vbPre", text);
      actionStatus.after(pre);
    }
  };
  srt.onclick = () => {
    let t = 0,
      n = 0;
    const out = [];
    for (const x of tl.shots) {
      if (x.sub) out.push(++n + "\n" + srtTime(t) + " --> " + srtTime(t + len(x)) + "\n" + x.sub + "\n");
      t += len(x);
    }
    if (!out.length) return (actionStatus.textContent = "ยังไม่มีช็อตที่ใส่ซับ");
    const blob = new Blob([out.join("\n")], { type: "application/x-subrip" }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ($("title").value.trim() || "timeline") + ".srt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    actionStatus.textContent = "สร้าง SRT " + n + " บรรทัดแล้ว · เวลาอิงจากลำดับช็อตใน Timeline ร่าง";
  };

  // ---------- persistence with the brief ----------
  function changed() {
    document.getElementById("workEditor").dispatchEvent(new Event("change", { bubbles: true }));
  }
  const baseCollect = collectProject;
  collectProject = function () {
    const r = baseCollect();
    r.timeline = JSON.parse(JSON.stringify(tl));
    return r;
  };
  const baseLoad = loadProject;
  loadProject = function (r) {
    baseLoad(r);
    tl = r.timeline ? JSON.parse(JSON.stringify(r.timeline)) : { shots: [], drive: [] };
    clip = null;
    renderBin();
    renderTimeline();
  };
  const baseReset = resetBrief;
  resetBrief = function () {
    baseReset();
    tl = { shots: [], drive: [] };
    clip = null;
    stopSequence();
    renderBin();
    renderTimeline();
  };
  const baseRenderFiles = renderFiles;
  renderFiles = function () {
    baseRenderFiles();
    renderBin();
    renderTimeline();
  };
  // Only the video lane gets a timeline.
  function laneVisibility() {
    root.hidden = $("productionLane").value !== "video";
  }
  $("productionLane").addEventListener("change", laneVisibility);
  laneVisibility();
  // The draft may have been restored before this script loaded.
  try {
    const d = JSON.parse(localStorage.getItem("bb-simulator-draft-v1") || "null");
    if (d?.project?.timeline && (!d.project.id || d.project.id === currentProjectId)) tl = d.project.timeline;
  } catch {}
  window.BBTimeline = { get: () => tl, specText };
  renderBin();
  renderTimeline();
})();
