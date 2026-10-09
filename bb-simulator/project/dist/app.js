"use strict";
const specLabels = {
  objective: "Objective",
  audience: "Audience",
  contentType: "Content Type",
  cta: "Call To Action",
  designStyle: "Design Style",
  mood: "Mood & Tone",
  palette: "Color Palette",
  pace: "Edit Pace",
  hook: "Opening",
  subtitles: "Subtitles",
  graphics: "Graphics",
  music: "Music",
  audio: "Audio",
  referenceMode: "Reference Direction",
  resolution: "Resolution",
  fps: "Frame Rate",
  revisions: "Revision Rounds",
  rights: "Usage Rights",
  captionsFile: "Caption File",
};
Object.assign(specLabels, {
  superLanguage: "Super Language",
  superStyle: "Super Style",
  coverMode: "Cover Headline",
  coverLanguage: "Cover Language",
  coverShot: "Cover Image",
  coverStyle: "Cover Style",
  subtitlePosition: "Subtitle Position",
});
const extraFields = ["keyMessage", "ctaDestination", "deadline", "approver", "assetsLink", "coverText", "superText"];
let visualSpec = {
  look: null,
  palette: ["#4f0208", "#f6e0e3", "#f7cb3f"],
  paletteName: "BB Signature",
  layout: "bottom",
  previewImage: "assets/lookbook/cover-06-v15.jpg",
  previewHeadline: "เรียนรู้แล้วทำได้จริง",
};
let workStep = 0;
let activeMember = 0;
const $ = (id) => document.getElementById(id);
let footage = [];
let selectedURL = null;
const key = "ai-video-studio-briefs-v1";
// Work-in-progress brief, autosaved in this browser so refresh/close does not lose it.
const draftKey = "bb-simulator-draft-v1";
let currentProjectId = null,
  currentProjectCreated = null,
  pendingReferenceIds = null;
function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]").map((j) =>
      j.brand?.id === "yaadz" ? { ...j, brand: { ...j.brand, name: "Y&Z Stories" } } : j,
    );
  } catch {
    return [];
  }
}
function tab(name) {
  // Brand + lane picker is one element that follows the user, so every screen states which brand it is working on.
  const slot = document.querySelector('[data-routing-slot="' + name + '"]'),
    routing = document.querySelector(".routing");
  if (slot && routing && routing.parentElement !== slot) slot.append(routing);
  document.querySelectorAll(".tabcontent").forEach((e) => (e.hidden = e.id !== name));
  document.querySelectorAll("[data-tab]").forEach((e) => e.classList.toggle("selected", e.dataset.tab === name));
  if (name === "history") renderHistory();
}
document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => tab(b.dataset.tab)));
const presets = {
  review: "ทำคลิปรีวิวสินค้า เปิดด้วยช็อตสินค้าชัด ๆ ตัดกระชับ ใส่ข้อความไทยสั้น ๆ และปิดด้วย CTA ที่ฉันระบุ ห้ามแต่งคุณสมบัติหรือราคา",
  lesson: "ทำคลิปสอนจากไฟล์ที่แนบ เปิดด้วยสิ่งที่ผู้ชมจะทำได้ เรียงขั้นตอนให้เข้าใจง่าย ใส่ซับไทย และคงความหมายของผู้พูด",
  vlog: "ทำ Vlog จากไฟล์ที่แนบ เล่าเรื่องตามเหตุการณ์ เลือกจังหวะเด่น ตัดกระชับ และคงบรรยากาศของสถานที่",
};
document.querySelectorAll("[data-preset]").forEach(
  (b) =>
    (b.onclick = () => {
      applyPreset(b.dataset.preset);
    }),
);
$("title").oninput = () => ($("projectName").textContent = $("title").value.trim() || "โปรเจกต์ใหม่");
function duration() {
  return $("length").value === "custom" ? Number($("customLength").value) : Number($("length").value);
}
$("length").onchange = () => {
  $("customLength").hidden = $("length").value !== "custom";
  $("durationLabel").textContent = duration() || "—";
};
$("customLength").oninput = () => ($("durationLabel").textContent = duration() || "—");
$("add").onclick = $("drop").onclick = () => $("files").click();
function addFiles(files) {
  let rejected = 0;
  for (const f of files) {
    if (!f.type.startsWith("video/") && !f.type.startsWith("image/") && !/\.(mp4|mov|webm|m4v|png|jpg|jpeg|webp)$/i.test(f.name)) {
      rejected++;
      continue;
    }
    footage.push({ file: f, url: URL.createObjectURL(f) });
  }
  renderFiles();
  if (footage.length && !selectedURL) playFile(footage[0]);
  if (rejected) $("saveStatus").textContent = "ข้าม " + rejected + " ไฟล์ที่ไม่ใช่ภาพหรือวิดีโอ";
}
$("files").onchange = (e) => {
  addFiles(e.target.files);
  e.target.value = "";
};
$("drop").ondragover = (e) => e.preventDefault();
$("drop").ondrop = (e) => {
  e.preventDefault();
  addFiles(e.dataTransfer.files);
};
function playFile(f) {
  selectedURL = f.url;
  const image = f.file.type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(f.file.name);
  $("video").pause();
  $("video").hidden = image;
  $("imagePreview").hidden = !image;
  if (image) $("imagePreview").src = f.url;
  else $("video").src = f.url;
  $("emptyPreview").hidden = true;
  $("videoName").textContent = f.file.name;
}
function renderFiles() {
  $("fileList").replaceChildren();
  $("count").textContent = footage.length;
  footage.forEach((f, i) => {
    const row = document.createElement("div");
    row.className = "fileitem";
    const open = document.createElement("button");
    open.textContent = "▷ " + f.file.name;
    const info = document.createElement("small");
    info.textContent = (f.file.size / 1048576).toFixed(1) + " MB";
    open.append(info);
    open.onclick = () => playFile(f);
    const del = document.createElement("button");
    del.className = "remove";
    del.textContent = "×";
    del.setAttribute("aria-label", "นำ " + f.file.name + " ออก");
    del.onclick = () => {
      URL.revokeObjectURL(f.url);
      footage.splice(i, 1);
      if (selectedURL === f.url) {
        selectedURL = null;
        $("video").pause();
        $("video").removeAttribute("src");
        $("video").load();
        $("video").hidden = true;
        $("imagePreview").hidden = true;
        $("emptyPreview").hidden = false;
        $("videoName").textContent = "";
        if (footage.length) playFile(footage[0]);
      }
      renderFiles();
    };
    row.append(open, del);
    $("fileList").append(row);
  });
}
const crew = [
  [
    "Team Lead",
    "หัวหน้าทีม",
    "#f7cb3f",
    "กำหนดเป้าหมาย รูปแบบ Hook และ CTA เลือก Reference ที่ต้องยึด สั่งงานและแจกหน้าที่ให้ทีม แล้วตัดสินใจด้านครีเอทีฟก่อนส่งให้แม่อนุมัติ",
    "รอหัวหน้าทีมกำหนดงาน",
    "หัวหน้าชุดดำ",
  ],
  [
    "Footage Curator",
    "คัดวัตถุดิบ",
    "#f6e0e3",
    "ดูคลิปต้นฉบับ คัดช่วงที่ใช้ได้ และระบุ timecode ส่งให้ผู้ตัดต่อ",
    "รอระบบวิเคราะห์คลิป",
    "ผู้ชายถือกล้อง",
  ],
  [
    "Subtitle & Graphics",
    "ซับและกราฟิก",
    "#f6e0e3",
    "ทำซับ ใส่กราฟิก จัดข้อความ และตกแต่งภาพตาม Brand Voice และ CI",
    "รอระบบซับและกราฟิก",
    "ผู้ชายใส่แว่น",
  ],
  [
    "Video Editor",
    "ตัดต่อวิดีโอ",
    "#f6e0e3",
    "นำช็อตที่คัดแล้วมาเรียงบน Timeline ตัดภาพ จัดจังหวะ เสียงและเพลงตามแผน",
    "รอระบบตัดต่อ",
    "ผู้หญิงผมยาว",
  ],
  [
    "Quality Reviewer",
    "ตรวจคุณภาพ",
    "#f6e0e3",
    "ตรวจคำผิด ความชัดของเสียง การแสดงซับ สัดส่วน ความยาว และไฟล์ส่งออก แล้วแจ้งจุดแก้ไข",
    "รอผลงานตัดต่อ",
    "ผู้หญิงผมบ๊อบสีน้ำตาล",
  ],
];
const crewNames = ["BB", "Leo", "Tidy", "Kitty", "Chicha"];
const stationOrder = [0, 1, 3, 2, 4];
const stationRegions = [
  [57, 43],
  [37, 20],
  [24, 13],
  [12, 12],
  [0, 12],
];
stationOrder.forEach((i, n) => {
  const a = crew[i];
  const target = document.createElement("button");
  target.className = "cabinTarget";
  target.style.top = stationRegions[n][0] + "%";
  target.style.height = stationRegions[n][1] + "%";
  target.setAttribute("aria-label", crewNames[i] + " · " + a[1]);
  target.onclick = () => {
    showAgent(i);
    $("agentDetail").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("agents").append(target);
  const button = document.createElement("button");
  button.className = "station";
  button.dataset.member = i;
  const number = document.createElement("small");
  number.textContent = a[1];
  const title = document.createElement("strong");
  title.textContent = crewNames[i];
  button.append(portrait(i), title, number);
  button.onclick = () => {
    showAgent(i);
    $("agentDetail").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("stationNav").append(button);
});
function showAgent(i) {
  document.querySelectorAll("[data-member]").forEach((b) => {
    const active = Number(b.dataset.member) === i;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  $("agentDetail").replaceChildren();
  const h = document.createElement("h2");
  h.append(portrait(i));
  const name = document.createElement("span");
  name.textContent = crewNames[i] + " · " + crew[i][1];
  h.append(name);
  const p = document.createElement("p");
  p.textContent = crew[i][3];
  const s = document.createElement("p");
  s.className = "hint";
  s.textContent = "สถานะ: " + (i === 0 && readSaved().length ? "มีบรีฟที่บันทึกแล้ว • ยังไม่เริ่มประมวลผล" : crew[i][4]);
  $("agentDetail").append(h, p, s);
  renderAgentActions(i);
  if (false) {
    const team = document.createElement("p");
    team.className = "hint";
    team.textContent = "ขั้นตอน: คัดวัตถุดิบ → ตัดต่อวิดีโอ → ซับและกราฟิก → ตรวจคุณภาพ";
    $("agentDetail").append(team);
  }
}
showAgent(0);
document.querySelectorAll("[data-agent]").forEach(
  (b) =>
    (b.onclick = () => {
      showAgent(Number(b.dataset.agent));
      $("agentDetail").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }),
);
$("save").onclick = () => {
  const issues = blockingIssues();
  if (issues.length) {
    $("saveStatus").textContent = issues.join(" · ");
    return;
  }
  const record = collectProject();
  try {
    const saved = readSaved(),
      existing = saved.findIndex((x) => x.id === record.id);
    if (existing >= 0) saved.splice(existing, 1);
    saved.unshift(record);
    localStorage.setItem(key, JSON.stringify(saved.slice(0, 50)));
    currentProjectCreated = record.created;
    saveDraft();
    $("saveStatus").textContent = (existing >= 0 ? "อัปเดตโปรเจกต์เดิมแล้ว" : "บันทึกโปรเจกต์แล้ว") + " · ยังไม่เริ่มผลิต";
    showAgent(0);
    $("openProduction").hidden = false;
  } catch {
    $("saveStatus").textContent = "บันทึกไม่ได้ พื้นที่เบราว์เซอร์อาจเต็ม";
  }
};
function download(record) {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "video-brief-" + record.id.slice(0, 8) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function loadProject(r) {
  restoreRouting(r);
  currentProjectId = r.id || null;
  currentProjectCreated = r.created || null;
  $("title").value = r.title || "";
  $("title").oninput();
  $("brief").value = r.brief || "";
  for (const field of ["objective", "audience", "cta", "restrictions", "referenceNotes", "styleName"]) $(field).value = r[field] || "";
  if (r.platform) $("platform").value = r.platform;
  pendingReferenceIds = (r.references || []).map((x) => x.id);
  referenceRecords.forEach((ref) => (ref.selected = pendingReferenceIds.includes(ref.id)));
  renderReferences();
  const standard = ["15", "30", "60"].includes(String(r.seconds));
  $("length").value = standard ? String(r.seconds) : "custom";
  $("customLength").value = r.seconds;
  $("length").onchange();
  if (r.ratio) $("ratio").value = r.ratio;
  if (r.delivery) $("delivery").value = r.delivery;
  footage.forEach((f) => URL.revokeObjectURL(f.url));
  footage = [];
  selectedURL = null;
  $("video").pause();
  $("video").removeAttribute("src");
  $("video").load();
  $("video").hidden = true;
  $("imagePreview").hidden = true;
  $("emptyPreview").hidden = false;
  $("videoName").textContent = "";
  renderFiles();
  restoreSpecs(r);
  $("ratio").dataset.manual = "true";
}
function saveDraft() {
  try {
    if (!$("title").value.trim() && !$("brief").value.trim() && !currentProjectId) return;
    localStorage.setItem(draftKey, JSON.stringify({ project: collectProject(), step: workStep, savedAt: new Date().toISOString() }));
    $("draftStatus").textContent =
      "บันทึก Draft อัตโนมัติ " + new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  } catch {
    $("draftStatus").textContent = "บันทึก Draft ไม่ได้ เบราว์เซอร์อาจปิดการเก็บข้อมูล";
  }
}
function readDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(draftKey) || "null");
    return d && d.project ? d : null;
  } catch {
    return null;
  }
}
function renderHistory() {
  const list = $("historyList");
  list.replaceChildren();
  const saved = readSaved().filter((r) => (r.brand?.id || "beyond") === currentBrand().id);
  if (!saved.length) {
    const p = document.createElement("p");
    p.textContent = "ยังไม่มีบรีฟที่บันทึกของ " + (currentBrand().name || "แบรนด์นี้") + " เริ่มจากสร้างงานใหม่";
    list.append(p);
    return;
  }
  saved.forEach((r) => {
    const item = document.createElement("article");
    item.className = "historyitem";
    const h = document.createElement("h2");
    h.textContent = r.title;
    const meta = document.createElement("p");
    meta.className = "hint";
    meta.textContent =
      new Date(r.created).toLocaleString("th-TH") +
      " · " +
      (r.lane && r.lane !== "video" ? "Canva Editable Design" : r.seconds + " วินาที · " + r.ratio + " · CapCut Editable Project");
    const p = document.createElement("p");
    p.textContent = r.brief + (r.referenceNotes ? "\nReference: " + r.referenceNotes : "");
    const note = document.createElement("p");
    note.className = "hint";
    note.textContent = "เตรียมบรีฟแล้ว • " + r.files.length + " รายชื่อคลิป • ต้องแนบไฟล์ใหม่เมื่อเปิดงาน";
    const actions = document.createElement("div");
    actions.className = "historyactions";
    const load = document.createElement("button");
    load.textContent = "เปิดบรีฟ";
    load.onclick = () => {
      loadProject(r);
      tab("workspace");
      setStep(0);
      $("saveStatus").textContent = "เปิดบรีฟแล้ว • แนบไฟล์ที่ต้องการใช้สำหรับงานนี้";
    };
    const dl = document.createElement("button");
    dl.textContent = "ดาวน์โหลดบรีฟ";
    dl.onclick = () => download(r);
    const del = document.createElement("button");
    del.textContent = "ลบ";
    del.onclick = () => {
      try {
        localStorage.setItem(key, JSON.stringify(readSaved().filter((x) => x.id !== r.id)));
        renderHistory();
      } catch {
        del.textContent = "ลบไม่ได้";
      }
    };
    actions.append(load, dl, del);
    item.append(h, meta, p, note, actions);
    list.append(item);
  });
}
$("video").onerror = () => ($("videoName").textContent = "เบราว์เซอร์นี้เปิดไฟล์ไม่ได้ ลองไฟล์ MP4 ที่ใช้ H.264");

// Browser-local reference memory; no server upload or automatic AI learning.
let referenceRecords = [];
const referenceURLs = new Map();
let referenceDBPromise;
function referenceDB() {
  if (!referenceDBPromise)
    referenceDBPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("bb-private-studio", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("references", { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  return referenceDBPromise;
}
async function referenceOperation(mode, action) {
  const db = await referenceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("references", mode);
    let result;
    const request = action(tx.objectStore("references"));
    request.onsuccess = () => (result = request.result);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Reference transaction aborted"));
  });
}
function renderReferences() {
  for (const url of referenceURLs.values()) URL.revokeObjectURL(url);
  referenceURLs.clear();
  $("referenceList").replaceChildren();
  if (!referenceRecords.some((ref) => (ref.brandId || "beyond") === currentBrand().id)) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "ยังไม่มีคลิป Reference";
    $("referenceList").append(empty);
    return;
  }
  referenceRecords
    .filter((ref) => (ref.brandId || "beyond") === currentBrand().id)
    .forEach((ref) => {
      const row = document.createElement("article");
      row.className = "referenceItem";
      const label = document.createElement("label");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = ref.selected;
      check.onchange = () => (ref.selected = check.checked);
      label.append(check, document.createTextNode(ref.name));
      const isImage = ref.blob.type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(ref.name);
      const video = document.createElement(isImage ? "img" : "video");
      if (isImage) video.alt = ref.name;
      const url = URL.createObjectURL(ref.blob);
      referenceURLs.set(ref.id, url);
      video.src = url;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.onerror = () => ($("referenceStatus").textContent = "เบราว์เซอร์เปิด Reference นี้ไม่ได้ ลอง MP4 ที่ใช้ H.264");
      const del = document.createElement("button");
      del.className = "textbutton";
      del.textContent = "ลบ Reference";
      del.onclick = async () => {
        try {
          await referenceOperation("readwrite", (store) => store.delete(ref.id));
          referenceRecords = referenceRecords.filter((r) => r.id !== ref.id);
          renderReferences();
          $("referenceStatus").textContent = "ลบ Reference จากความจำแล้ว";
        } catch {
          $("referenceStatus").textContent = "ลบ Reference ไม่สำเร็จ ลองอีกครั้ง";
        }
      };
      row.append(label, video, del);
      $("referenceList").append(row);
    });
}
$("addReference").onclick = () => $("referenceFiles").click();
$("referenceFiles").onchange = async (event) => {
  const files = [...event.target.files];
  event.target.value = "";
  $("addReference").disabled = true;
  let saved = 0,
    failed = 0;
  for (const file of files) {
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/") && !/\.(mp4|mov|webm|m4v|png|jpg|jpeg|webp)$/i.test(file.name)) {
      failed++;
      continue;
    }
    const record = { id: crypto.randomUUID(), name: file.name, brandId: currentBrand().id, blob: file, created: new Date().toISOString() };
    try {
      await referenceOperation("readwrite", (store) => store.put(record));
      referenceRecords.push({ ...record, selected: true });
      saved++;
    } catch {
      failed++;
    }
  }
  renderReferences();
  $("addReference").disabled = false;
  $("referenceStatus").textContent =
    "จำ Reference แล้ว " +
    saved +
    " คลิป" +
    (failed ? " • บันทึกไม่ได้ " + failed + " ไฟล์ อาจเกินพื้นที่เบราว์เซอร์หรือไฟล์ไม่รองรับ" : "") +
    " • ยังไม่ได้วิเคราะห์ด้วย AI";
};
$("saveStyle").onclick = () => {
  const notes = $("referenceNotes").value.trim();
  if (!notes) {
    $("referenceStatus").textContent = "ระบุสิ่งที่ต้องยึดจากต้นแบบก่อนบันทึก";
    return;
  }
  try {
    localStorage.setItem("bb-studio-style:" + currentBrand().id, JSON.stringify({ name: $("styleName").value.trim(), notes }));
    $("referenceStatus").textContent = "จำชื่อสไตล์และโน้ตแล้ว เปิดครั้งถัดไปในเบราว์เซอร์นี้ได้ • AI ยังไม่ได้เรียนรู้คลิป";
  } catch {
    $("referenceStatus").textContent = "บันทึกสไตล์ไม่ได้ เบราว์เซอร์อาจปิดการเก็บข้อมูล";
  }
};
(async () => {
  try {
    const profile = JSON.parse(
      localStorage.getItem("bb-studio-style:" + currentBrand().id) ||
        (currentBrand().id === "beyond" ? localStorage.getItem("bb-studio-style") : null) ||
        "null",
    );
    if (profile) {
      $("styleName").value = profile.name || "";
      $("referenceNotes").value = profile.notes || "";
    }
    const saved = await referenceOperation("readonly", (store) => store.getAll());
    referenceRecords = saved.map((ref) => ({ ...ref, selected: pendingReferenceIds ? pendingReferenceIds.includes(ref.id) : true }));
    renderReferences();
  } catch {
    $("referenceStatus").textContent = "เปิดความจำ Reference ไม่ได้ อาจอยู่ในโหมดส่วนตัวหรือปิดการเก็บข้อมูล";
  }
})();

function portrait(i) {
  const wrap = document.createElement("span");
  wrap.className = "portrait portrait-" + crewNames[i].toLowerCase();
  const img = document.createElement("img");
  img.src = "assets/bb-cabin-journey-v11.png";
  img.alt = crewNames[i];
  wrap.append(img);
  return wrap;
}
function typeImage(text) {
  const img = document.createElement("img");
  img.className = "type";
  img.src = "assets/type/" + text.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".svg";
  img.alt = text;
  return img;
}
function renderAgentActions(i) {
  activeMember = i;
  const actions = document.createElement("div");
  actions.className = "agentactions";
  const routes = [
    ["Brief", 0],
    ["Footage", 2],
    ["Sound & Graphics", 0],
    ["Creative", 0],
    ["Review", 3],
  ];
  const open = document.createElement("button");
  open.className = "action";
  open.append(typeImage(routes[i][0]));
  open.onclick = () => {
    tab("workspace");
    setStep(routes[i][1]);
    if (i === 2 || i === 3) {
      const g = $(i === 2 ? "soundGroup" : "creativeGroup");
      if (g) {
        g.open = true;
        g.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };
  const ref = document.createElement("button");
  ref.className = "textbutton";
  ref.append(typeImage("Reference"));
  ref.onclick = () => {
    tab("workspace");
    setStep(1);
  };
  actions.append(open, ref);
  $("agentDetail").append(actions);
}
function choiceValue(id) {
  return $(id).value === "กำหนดเอง" ? $(id + "Custom").value.trim() : $(id).value;
}
function checkedValues(name) {
  return [...document.querySelectorAll('input[name="' + name + '"]:checked')].map((e) => e.value);
}
function collectSpecs() {
  const specs = { visual: { ...visualSpec, palette: [...visualSpec.palette] } };
  for (const id of Object.keys(specLabels)) specs[id] = choiceValue(id);
  for (const id of extraFields) specs[id] = $(id).value.trim();
  for (const name of ["wanted", "preserve", "avoid"]) specs[name] = checkedValues(name);
  return specs;
}
function collectProject() {
  const specs = collectSpecs();
  return {
    brand: currentBrand(),
    lane: $("productionLane").value,
    handoff: collectHandoff(),
    workflow: BBWorkflow.initial($("productionLane").value),
    id: currentProjectId || (currentProjectId = crypto.randomUUID()),
    title: $("title").value.trim(),
    brief: $("brief").value.trim(),
    seconds: duration(),
    objective: specs.objective,
    audience: specs.audience,
    cta: specs.cta,
    platform: $("platform").value,
    restrictions: $("restrictions").value.trim(),
    referenceNotes: $("referenceNotes").value.trim(),
    styleName: $("styleName").value.trim(),
    references: referenceRecords
      .filter((r) => r.selected && (r.brandId || "beyond") === currentBrand().id)
      .map((r) => ({ id: r.id, name: r.name })),
    ratio: $("ratio").value,
    delivery: $("delivery").value,
    files: footage.map((f) => ({ name: f.file.name, size: f.file.size, type: f.file.type })),
    specs,
    created: currentProjectCreated || new Date().toISOString(),
    updated: new Date().toISOString(),
    status: "brief_ready",
  };
}
function restoreSpecs(r) {
  $("subtitleEnabled").checked = (r.specs?.subtitles || "ไทย") !== "ไม่ใส่ซับ";
  const specs = r.specs || { objective: r.objective, audience: r.audience, cta: r.cta };
  for (const id of Object.keys(specLabels)) {
    const value = specs[id];
    if (value === undefined) continue;
    const options = [...$(id).options].map((x) => x.value);
    if (options.includes(value)) {
      $(id).value = value;
      $(id + "Custom").hidden = true;
    } else {
      $(id).value = "กำหนดเอง";
      $(id + "Custom").value = value;
      $(id + "Custom").hidden = false;
    }
  }
  for (const id of extraFields) $(id).value = specs[id] || "";
  visualSpec = specs.visual
    ? { ...visualSpec, ...specs.visual }
    : {
        look: null,
        palette: ["#4f0208", "#f6e0e3", "#f7cb3f"],
        paletteName: "BB Signature",
        layout: "bottom",
        previewImage: "assets/lookbook/cover-06-v15.jpg",
        previewHeadline: "เรียนรู้แล้วทำได้จริง",
      };
  renderVisual();
  for (const name of ["wanted", "preserve", "avoid"])
    if (specs[name]) document.querySelectorAll('input[name="' + name + '"]').forEach((e) => (e.checked = specs[name].includes(e.value)));
}
function blockingIssues() {
  const problems = [];
  if ($("brandSelect").value === "custom" && !$("customBrand").value.trim()) problems.push("ระบุชื่อแบรนด์");
  if (!$("title").value.trim()) problems.push("ระบุชื่อโปรเจกต์");
  if (!Number.isFinite(duration()) || duration() < 1 || duration() > 3600) problems.push("ความยาวต้องเป็น 1–3,600 วินาที");
  for (const id of Object.keys(specLabels)) if ($(id).value === "กำหนดเอง" && !choiceValue(id)) problems.push("ระบุ " + specLabels[id]);
  if (choiceValue("superStyle") === "ข้อความที่กำหนด" && !$("superText").value.trim()) problems.push("ระบุข้อความ Super");
  if (choiceValue("coverMode") === "ใช้ข้อความที่กำหนด" && !$("coverText").value.trim()) problems.push("ระบุคำบนหน้าปก");
  return problems;
}
function reviewWarnings() {
  const s = collectSpecs(),
    notes = [];
  if (s.superLanguage === "ไม่ใส่ Super" && $("superText").value.trim()) notes.push("เลือกไม่ใส่ Super แต่ยังมีข้อความ Super");
  if (s.coverMode === "ไม่ใส่ข้อความ" && $("coverText").value.trim()) notes.push("หน้าปกไม่ใส่ข้อความ แต่ยังมี Headline");
  if (!s.keyMessage) notes.push("ยังไม่มี Key Message");
  if (
    $("productionLane").value === "video" &&
    !footage.some((f) => f.file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(f.file.name)) &&
    !s.assetsLink
  )
    notes.push("ยังไม่มีคลิปต้นฉบับหรือลิงก์ไฟล์");
  if (!s.approver) notes.push("ยังไม่ระบุผู้อนุมัติ");
  if (!s.deadline) notes.push("ยังไม่กำหนดส่ง");
  if (s.cta !== "ไม่มี CTA" && !s.ctaDestination) notes.push("CTA ยังไม่มีปลายทาง");
  if (s.rights !== "ยืนยันสิทธิ์ไฟล์ เพลง และบุคคลแล้ว") notes.push("สิทธิ์ใช้งานยังไม่ยืนยัน");
  if (
    [s.designStyle, s.pace, s.hook, s.palette, s.graphics].includes("ตาม Reference") &&
    !referenceRecords.some((r) => r.selected && (r.brandId || "beyond") === currentBrand().id)
  )
    notes.push("เลือกตาม Reference แต่ยังไม่ได้แนบต้นแบบ");
  if (s.subtitles === "ไม่ใส่ซับ" && s.captionsFile !== "ไม่ต้องการ") notes.push("ไม่ใส่ซับ แต่ขอไฟล์ซับ: เลือก Caption File ให้ตรงกัน");
  if (s.avoid.includes("เพลงไม่มีสิทธิ์") && s.music === "ใช้เพลงที่แนบ" && s.rights !== "ยืนยันสิทธิ์ไฟล์ เพลง และบุคคลแล้ว")
    notes.push("เพลงที่แนบยังต้องยืนยันสิทธิ์");
  return [...new Set(notes)];
}
function renderReview() {
  const r = collectProject(),
    list = $("projectReview");
  list.replaceChildren();
  const issues = [...blockingIssues(), ...reviewWarnings()];
  const status = document.createElement("p");
  status.className = "reviewstatus";
  status.textContent = issues.length ? "ต้องตรวจ " + issues.length + " จุด" : "ข้อมูลพร้อมตรวจรับบรีฟ · ยังไม่ได้ตรวจคลิป";
  list.append(status);
  if (issues.length) {
    const ul = document.createElement("ul");
    issues.forEach((x) => {
      const li = document.createElement("li");
      li.textContent = x;
      ul.append(li);
    });
    list.append(ul);
  }
  const dl = document.createElement("dl");
  const rows = [
    ["Brand", r.brand.name],
    ["Lane", BBWorkflow.laneName(r.lane)],
    ["Project", r.title],
    ["Format", r.platform + " · " + r.ratio + " · " + r.seconds + " วินาที"],
    ...Object.entries(specLabels).map(([id, title]) => [title, r.specs[id]]),
    ...extraFields.map((id) => [id, r.specs[id]]),
    ["Include", r.specs.wanted.join(", ")],
    ["Keep", r.specs.preserve.join(", ")],
    ["Avoid", r.specs.avoid.join(", ")],
    ["Look", r.specs.visual.look || "ยังไม่เลือก"],
    ["Palette", r.specs.visual.palette.join(" / ")],
    ["Text Layout", r.specs.visual.layout],
    ["Direction", r.brief],
    ["Rules", r.restrictions],
    ["Reference", r.references.map((x) => x.name).join(", ")],
    ["Style Notes", r.referenceNotes],
    ["Footage", r.files.map((x) => x.name).join(", ")],
    [
      "Deliverables",
      r.lane === "video" ? "CapCut Project + Media · ต้องทดสอบเปิด Timeline" : "Canva Editable Design · รอ BB อนุมัติใน Canva",
    ],
    ["Approval", "ตรวจชิ้นงานใน " + (r.lane === "video" ? "CapCut" : "Canva") + " ก่อน Export"],
    ["Publishing", "ยังไม่ได้เชื่อมช่องทางโพสต์"],
  ];
  for (const [label, value] of rows) {
    if (!value) continue;
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    dl.append(dt, dd);
  }
  list.append(dl);
}
function setStep(n) {
  $("workLaunch").hidden = true;
  $("workEditor").hidden = false;
  workStep = Math.max(0, Math.min(3, n));
  document.querySelectorAll("[data-work-step]").forEach((e) => (e.hidden = Number(e.dataset.workStep) !== workStep));
  document.querySelectorAll("[data-step]").forEach((e) => {
    e.classList.toggle("active", Number(e.dataset.step) === workStep);
    e.setAttribute("aria-current", Number(e.dataset.step) === workStep ? "step" : "false");
  });
  $("stepCount").textContent = "0" + (workStep + 1) + " / 04";
  $("stepBack").disabled = workStep === 0;
  $("stepNext").hidden = workStep === 3;
  $("stepStatus").textContent = "";
  if (workStep === 3) renderReview();
}
$("stepNext").onclick = () => {
  if (workStep === 0) {
    const issues = blockingIssues();
    if (issues.length) {
      $("stepStatus").textContent = issues.join(" · ");
      return;
    }
  }
  setStep(workStep + 1);
};
$("stepBack").onclick = () => setStep(workStep - 1);
document.querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => setStep(Number(b.dataset.step))));
document.querySelectorAll("[data-choice]").forEach(
  (e) =>
    (e.onchange = () => {
      $(e.id + "Custom").hidden = e.value !== "กำหนดเอง";
    }),
);
function applyPreset(name) {
  const settings = {
    review: { contentType: "รีวิวสินค้า", objective: "ขายสินค้า / บริการ", hook: "ช็อตเด่นที่สุด", pace: "กระชับ สมดุล" },
    lesson: { contentType: "Tutorial", objective: "สอน / อธิบาย", hook: "ผลลัพธ์ก่อน", pace: "กระชับ สมดุล" },
    vlog: { contentType: "Vlog", objective: "เล่าเรื่อง / สร้างภาพลักษณ์", hook: "ช็อตเด่นที่สุด", pace: "กระชับ สมดุล" },
  };
  for (const [id, value] of Object.entries(settings[name])) {
    $(id).value = value;
    $(id + "Custom").hidden = true;
  }
}
$("platform").onchange = () => {
  if (!$("ratio").dataset.manual) $("ratio").value = $("platform").value === "YouTube" ? "16:9 แนวนอน" : "9:16 แนวตั้ง";
};
$("ratio").onchange = () => {
  $("ratio").dataset.manual = "true";
};
setStep(0);
showWorkLaunch();

function showWorkLaunch() {
  $("workLaunch").hidden = false;
  $("workEditor").hidden = true;
  $("resumeBrief").hidden = !$("title").value.trim();
  $("resumeInfo").textContent = $("title").value.trim() + " · ขั้น " + (workStep + 1) + "/4";
}
$("startBrief").onclick = $("sceneStart").onclick = () => {
  setStep(0);
  $("title").focus();
  $("workEditor").scrollIntoView({ behavior: "smooth", block: "start" });
};
$("resumeBrief").onclick = () => setStep(workStep);
$("backWorkZone").onclick = () => {
  showWorkLaunch();
  $("workLaunch").scrollIntoView({ behavior: "smooth", block: "start" });
};
document.querySelectorAll("[data-launch-step]").forEach(
  (b) =>
    (b.onclick = () => {
      setStep(Number(b.dataset.launchStep));
      $("workEditor").scrollIntoView({ behavior: "smooth", block: "start" });
    }),
);
$("subtitleEnabled").onchange = () => {
  $("subtitles").value = $("subtitleEnabled").checked ? "ไทย" : "ไม่ใส่ซับ";
  $("subtitlesCustom").hidden = true;
  if (!$("subtitleEnabled").checked) {
    $("captionsFile").value = "ไม่ต้องการ";
    $("captionsFileCustom").hidden = true;
  }
  renderVisual();
};
$("subtitles").onchange = () => {
  $("subtitlesCustom").hidden = $("subtitles").value !== "กำหนดเอง";
  $("subtitleEnabled").checked = $("subtitles").value !== "ไม่ใส่ซับ";
  renderVisual();
};

const lookProfiles = [
  {
    id: "outfit",
    name: "Outfit Collage",
    clip: 2,
    note: "พื้นหลังลายตาราง ภาพตัดขอบ และหัวเรื่องหลายระดับ",
    mood: "สนุก มีพลัง",
    design: "Editorial",
    pace: "เร็ว มีพลัง",
    layout: "top",
    image: "assets/lookbook/cover-02-v15.jpg",
    source: "watermark(2).mp4",
    coverTime: 4.6,
  },
  {
    id: "collage",
    name: "Creator Intro",
    clip: 3,
    note: "ภาพบุคคลตัดขอบบนพื้นลายทาง พร้อมหัวเรื่องชัด",
    mood: "สนุก มีพลัง",
    design: "Editorial",
    pace: "เร็ว มีพลัง",
    layout: "split",
    image: "assets/lookbook/cover-03-v15.jpg",
    source: "watermark(1).mp4",
    coverTime: 1.9,
  },
  {
    id: "type",
    name: "Text Focus",
    clip: 4,
    note: "คัดเฟรมที่หัวเรื่องขึ้นครบ ใช้คำหลักตัวใหญ่เป็นจุดเด่น",
    mood: "มั่นใจ ฉลาด เป็นกันเอง",
    design: "Bold / Dynamic",
    pace: "กระชับ สมดุล",
    layout: "center",
    image: "assets/lookbook/cover-04-v15.jpg",
    source: "watermark.mp4",
    coverTime: 1.9,
  },
  {
    id: "screen",
    name: "Screen Demo",
    clip: 5,
    note: "หน้าจอจริงกับหัวเรื่องแบบโน้ตสั้น",
    mood: "จริงจัง น่าเชื่อถือ",
    design: "เรียบ เท่ พรีเมียม",
    pace: "กระชับ สมดุล",
    layout: "top",
    image: "assets/lookbook/cover-05-v15.jpg",
    source: "1c2aba4f72984d17bdcff96d6573c717.mp4",
    coverTime: 0.9,
  },
  {
    id: "workshop",
    name: "Workshop Story",
    clip: 6,
    note: "เฟรมเปิดผู้พูดและหัวเรื่องเวิร์กชอป ก่อนสลับบรรยากาศจริง",
    mood: "จริงใจ เป็นธรรมชาติ",
    design: "Documentary",
    pace: "กระชับ สมดุล",
    layout: "bottom",
    image: "assets/lookbook/cover-06-v15.jpg",
    source: "c81342cd33354ce0abda2c3d4efc96fd.mp4",
    coverTime: 1.9,
  },
  {
    id: "classroom",
    name: "Classroom Collage",
    clip: 7,
    note: "ช็อตคลาสกับภาพบุคคลตัดขอบและหัวเรื่อง",
    mood: "สนุก มีพลัง",
    design: "Editorial",
    pace: "กระชับ สมดุล",
    layout: "split",
    image: "assets/lookbook/cover-07-v15.jpg",
    source: "copy_2C02EF7A-4509-4A48-89E8-D5775C2F593E.mp4",
    coverTime: 0.8,
  },
  {
    id: "onsite",
    name: "Workshop Campaign",
    clip: 8,
    note: "หน้าผู้พูด ชื่อเวิร์กชอป และกลุ่มผู้ชมเด่น",
    mood: "มั่นใจ ฉลาด เป็นกันเอง",
    design: "Bold / Dynamic",
    pace: "กระชับ สมดุล",
    layout: "bottom",
    image: "assets/lookbook/cover-08-v15.jpg",
    source: "70ffc7310720461db6e9794b8ac5cadb.mp4",
    coverTime: 2.5,
  },
  {
    id: "mission",
    name: "Creator Mission",
    clip: 9,
    note: "ผู้พูดเป็นตัวหลัก คำสั้นตัวใหญ่ สีชมพูและเหลือง",
    mood: "สนุก มีพลัง",
    design: "Bold / Dynamic",
    pace: "เร็ว มีพลัง",
    layout: "bottom",
    image: "assets/lookbook/cover-09-v15.jpg",
    source: "copy_90C9D2FA-E6E0-4D21-BB61-4166D04CDAD1.mp4",
    coverTime: 1.8,
  },
  {
    id: "learning",
    name: "Learn By Doing",
    clip: 10,
    note: "ภาพการลงมือทำกับข้อความเปิดสร้างแรงบันดาลใจ",
    mood: "อบอุ่น สร้างแรงบันดาลใจ",
    design: "Editorial",
    pace: "กระชับ สมดุล",
    layout: "center",
    image: "assets/lookbook/cover-10-v15.jpg",
    source: "58396af34c324129996e8bd9db324c0f.mp4",
    coverTime: 1.5,
  },
  {
    id: "bilingual",
    name: "Bilingual Lesson",
    clip: 11,
    note: "เฟรมเปิดสถานการณ์จริงและชื่อบทเรียนสองภาษา",
    mood: "อบอุ่น สร้างแรงบันดาลใจ",
    design: "Documentary",
    pace: "กระชับ สมดุล",
    layout: "bottom",
    image: "assets/lookbook/cover-11-v15.jpg",
    source: "Order food in Thai with Thailista.mp4",
    coverTime: 2.8,
  },
];
const paletteProfiles = [
  { name: "BB Signature", colors: ["#4f0208", "#f6e0e3", "#f7cb3f"] },
  { name: "Pink Pop", colors: ["#f6e0e3", "#e2a5b3", "#f7cb3f"] },
  { name: "Ivory Ink", colors: ["#ebe4d8", "#29262b", "#ffffff"] },
  { name: "Green Rose", colors: ["#215b49", "#dd95ab", "#fff4d8"] },
];
function renderVisual() {
  document.querySelectorAll("[data-look]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.look === visualSpec.look)));
  document.querySelectorAll("[data-layout]").forEach((b) => {
    if (b.tagName === "BUTTON") b.setAttribute("aria-pressed", String(b.dataset.layout === visualSpec.layout));
  });
  document
    .querySelectorAll("[data-palette]")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.palette === visualSpec.paletteName)));
  const profile = lookProfiles.find((p) => p.id === visualSpec.look);
  if (visualSpec.previewImage && visualSpec.previewImage.startsWith("assets/lookbook/clip-")) {
    const id = Number(visualSpec.previewImage.match(/clip-(\d+)/)?.[1]);
    visualSpec.previewImage = "assets/lookbook/cover-" + String(id).padStart(2, "0") + "-v15.jpg";
  }
  const preview = $("stylePreview");
  preview.dataset.layout = visualSpec.layout;
  preview.style.setProperty("--preview-main", visualSpec.palette[0]);
  preview.style.setProperty("--preview-soft", visualSpec.palette[1]);
  preview.style.setProperty("--preview-accent", visualSpec.palette[2]);
  $("stylePreviewPhoto").src = visualSpec.previewImage;
  $("previewPhoto").value = visualSpec.previewImage;
  $("previewHeadline").value = visualSpec.previewHeadline;
  $("previewTitle").textContent = visualSpec.previewHeadline;
  $("previewSubtitle").hidden = choiceValue("subtitles") === "ไม่ใส่ซับ";
  $("previewSubtitle").textContent =
    choiceValue("subtitles") === "อังกฤษ"
      ? "Example Subtitle"
      : choiceValue("subtitles") === "ไทย + อังกฤษ"
        ? "ตัวอย่างซับ / Example Subtitle"
        : "ตัวอย่าง Subtitle";
  $("previewSuper").hidden = choiceValue("superLanguage") === "ไม่ใส่ Super";
  $("previewSuper").textContent =
    $("superText").value.trim() ||
    (choiceValue("superLanguage") === "อังกฤษ"
      ? "Key Message"
      : choiceValue("superLanguage") === "ไทย + อังกฤษ"
        ? "ประเด็นสำคัญ / Key Message"
        : "ประเด็นสำคัญ");
  $("previewSubtitle").style.top = choiceValue("subtitlePosition") === "กลางภาพ" ? "58%" : "auto";
  $("previewSubtitle").style.bottom = choiceValue("subtitlePosition") === "กลางภาพ" ? "auto" : "10%";
  $("customPrimary").value = visualSpec.palette[0];
  $("customSecondary").value = visualSpec.palette[1];
  $("customAccent").value = visualSpec.palette[2];
}
function chooseLook(id) {
  const profile = lookProfiles.find((x) => x.id === id);
  if (!profile) return;
  visualSpec.look = id;
  visualSpec.layout = profile.layout;
  visualSpec.previewImage = profile.image;
  for (const [field, value] of Object.entries({ mood: profile.mood, designStyle: profile.design, pace: profile.pace })) {
    $(field).value = value;
    $(field + "Custom").hidden = true;
  }
  $("lookStatus").textContent = profile.name + " · คลิป " + String(profile.clip).padStart(2, "0") + " · ปรับต่อได้";
  renderVisual();
}
function choosePalette(name, colors) {
  visualSpec.paletteName = name;
  visualSpec.palette = [...colors];
  $("palette").value = "กำหนดเอง";
  $("paletteCustom").value = name + " " + colors.join(" / ");
  $("paletteCustom").hidden = false;
  renderVisual();
}
paletteProfiles.forEach((profile) => {
  const b = document.createElement("button");
  b.dataset.palette = profile.name;
  b.setAttribute("aria-pressed", "false");
  const dots = document.createElement("span");
  dots.className = "paletteswatches";
  profile.colors.forEach((color) => {
    const dot = document.createElement("i");
    dot.style.backgroundColor = color;
    dots.append(dot);
  });
  const text = document.createElement("span");
  text.textContent = profile.name;
  b.append(dots, text);
  b.onclick = () => choosePalette(profile.name, profile.colors);
  $("paletteTiles").append(b);
});
document.querySelectorAll("[data-look]").forEach((b) => (b.onclick = () => chooseLook(b.dataset.look)));
document.querySelectorAll("button[data-layout]").forEach(
  (b) =>
    (b.onclick = () => {
      visualSpec.layout = b.dataset.layout;
      renderVisual();
    }),
);
for (const id of ["customPrimary", "customSecondary", "customAccent"])
  $(id).oninput = () => choosePalette("Custom", [$("customPrimary").value, $("customSecondary").value, $("customAccent").value]);
$("previewHeadline").oninput = () => {
  visualSpec.previewHeadline = $("previewHeadline").value;
  $("previewTitle").textContent = visualSpec.previewHeadline;
};
$("previewPhoto").onchange = () => {
  visualSpec.previewImage = $("previewPhoto").value;
  renderVisual();
};
$("openStyleBoard").onclick = () => {
  setStep(0);
  const board = document.querySelector(".visualgroup");
  board.open = true;
  board.scrollIntoView({ behavior: "smooth", block: "start" });
};
renderVisual();

const superChange = $("superLanguage").onchange;
$("superLanguage").onchange = () => {
  superChange();
  renderVisual();
};
$("superText").oninput = () => renderVisual();

const paletteChange = $("palette").onchange;
$("palette").onchange = () => {
  paletteChange();
  const selected = $("palette").value;
  if (selected.startsWith("BB:")) {
    visualSpec.paletteName = "BB Signature";
    visualSpec.palette = ["#4f0208", "#f6e0e3", "#f7cb3f"];
    renderVisual();
  } else if (selected === "ขาวดำ") {
    visualSpec.paletteName = "Monochrome";
    visualSpec.palette = ["#111111", "#ffffff", "#bdbdbd"];
    renderVisual();
  } else if (selected === "สีธรรมชาติ") {
    visualSpec.paletteName = "Natural";
    visualSpec.palette = ["#514c43", "#eee5d7", "#bda889"];
    renderVisual();
  }
};
const subtitlePositionChange = $("subtitlePosition").onchange;
$("subtitlePosition").onchange = () => {
  subtitlePositionChange();
  renderVisual();
};

$("briefOwner").append(portrait(0));

// Preparation only: no client-side button grants production approval.
function currentBrand() {
  const id = $("brandSelect").value;
  return {
    id: id === "custom" ? "custom:" + ($("customBrand").value.trim() || "unnamed") : id,
    name: id === "custom" ? $("customBrand").value.trim() : $("brandSelect").selectedOptions[0].textContent,
  };
}
function handoffKey() {
  return "bb-handoff:" + currentBrand().id + ":" + $("productionLane").value + ":" + $("title").value.trim();
}
function collectHandoff() {
  return {
    editorUrl: $("editorUrl").value.trim(),
    version: $("handoffVersion").value.trim(),
    notes: $("handoffNotes").value.trim(),
    verified: false,
  };
}
function restoreRouting(r) {
  const id = r.brand?.id || "beyond";
  $("brandSelect").value = id.startsWith("custom:") ? "custom" : id;
  $("customBrand").value = id.startsWith("custom:") ? r.brand.name || "" : "";
  $("productionLane").value = r.lane || "video";
  const h = r.handoff || {};
  $("editorUrl").value = h.editorUrl || "";
  $("handoffVersion").value = h.version || "";
  $("handoffNotes").value = h.notes || "";
  updateRouting();
}
function updateRouting(restoreHandoff = false) {
  const video = $("productionLane").value === "video";
  if (!video && $("contentType").value === "รีวิวสินค้า") $("contentType").value = "Single Post";
  $("customBrand").hidden = $("brandSelect").value !== "custom";
  for (const id of ["length", "fps", "delivery", "pace", "audio", "captionsFile", "music"]) {
    const control = $(id);
    if (control) control.closest("div").hidden = !video;
  }
  document.querySelectorAll("img.type").forEach((img) => {
    if (["Footage", "Brand Assets"].includes(img.alt)) {
      img.src = "assets/type/" + (video ? "footage" : "brand-assets") + ".svg";
      img.alt = video ? "Footage" : "Brand Assets";
    }
  });
  const delivery = $("delivery");
  if (video && ![...delivery.options].some((o) => o.value === delivery.value)) delivery.value = "edit";
  $("openProduction").hidden = false;
  if (restoreHandoff) {
    let h = {};
    try {
      h = JSON.parse(localStorage.getItem(handoffKey()) || "{}");
    } catch {}
    $("editorUrl").value = h.editorUrl || "";
    $("handoffVersion").value = h.version || "";
    $("handoffNotes").value = h.notes || "";
  }
  renderProduction(0);
}
function renderProduction(selected = 0) {
  const lane = $("productionLane").value,
    steps = BBWorkflow.steps(lane);
  $("productionRoute").textContent = currentBrand().name + " · " + BBWorkflow.laneName(lane);
  const nav = $("productionSteps");
  nav.replaceChildren();
  steps.forEach((step, i) => {
    const b = document.createElement("button");
    b.className = "productionStation";
    b.setAttribute("aria-pressed", String(i === selected));
    const member = crewNames.indexOf(step.owner);
    if (member >= 0) b.append(portrait(member));
    const n = document.createElement("small");
    n.textContent = String(i + 1).padStart(2, "0");
    const title = document.createElement("strong");
    if (
      [
        "Content Plan",
        "Brief",
        "Footage",
        "Creative",
        "CapCut",
        "Canva",
        "Graphics",
        "Design",
        "Review",
        "Approval",
        "Export",
        "Publish",
      ].includes(step.title)
    )
      title.append(typeImage(step.title));
    else title.textContent = step.title;
    const who = document.createElement("span");
    who.textContent = step.owner;
    b.append(n, title, who);
    b.onclick = () => renderProduction(i);
    nav.append(b);
  });
  const step = steps[selected],
    detail = $("productionDetail");
  detail.replaceChildren();
  const h = document.createElement("h2");
  h.append(typeImage(step.title));
  const p = document.createElement("p");
  p.textContent = step.detail;
  const status = document.createElement("p");
  status.className = "hint";
  status.textContent = step.status;
  detail.append(h, p, status);
  if (selected === 0) {
    const b = document.createElement("button");
    b.className = "textbutton";
    b.textContent = "เปิดบรีฟ →";
    b.onclick = () => {
      tab("workspace");
      setStep(0);
    };
    detail.append(b);
  } else if (step.editor) {
    const url = $("editorUrl").value.trim();
    if (BBWorkflow.validEditorUrl(lane, url)) {
      const a = document.createElement("a");
      a.textContent = "เปิดงานใน " + (lane === "video" ? "CapCut" : "Canva") + " →";
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      detail.append(a);
    } else {
      const note = document.createElement("p");
      note.className = "hint";
      note.textContent = "ยังไม่มีลิงก์งานใน " + (lane === "video" ? "CapCut" : "Canva");
      detail.append(note);
    }
  }
}
$("brandSelect").onchange = () => {
  updateRouting(true);
  renderHistory();
  renderReferences();
  let profile = {};
  try {
    profile = JSON.parse(localStorage.getItem("bb-studio-style:" + currentBrand().id) || "{}");
  } catch {}
  $("styleName").value = profile.name || "";
  $("referenceNotes").value = profile.notes || "";
};
$("customBrand").oninput = () => renderProduction(0);
$("productionLane").onchange = () => updateRouting(true);
$("openProduction").onclick = () => {
  tab("production");
  renderProduction(0);
};
$("backToBrief").onclick = () => {
  tab("workspace");
  setStep(0);
};
$("editorUrl").onchange = () => renderProduction(0);
$("saveHandoff").onclick = () => {
  const h = collectHandoff(),
    lane = $("productionLane").value;
  if (!$("title").value.trim()) {
    $("handoffStatus").textContent = "ตั้งชื่อโปรเจกต์ในบรีฟก่อนบันทึกการส่งต่อ";
    return;
  }
  if (!h.editorUrl || !BBWorkflow.validEditorUrl(lane, h.editorUrl)) {
    $("handoffStatus").textContent = "ใส่ลิงก์ " + (lane === "video" ? "CapCut" : "Canva") + " ของงานนี้";
    return;
  }
  if (!h.version) {
    $("handoffStatus").textContent = "ระบุเวอร์ชันงานก่อนบันทึก";
    return;
  }
  try {
    localStorage.setItem(handoffKey(), JSON.stringify(h));
    $("handoffStatus").textContent =
      "บันทึกลิงก์และเวอร์ชันแล้ว · ยังไม่ได้ตรวจไฟล์หรือรับผลอนุมัติจาก " + (lane === "video" ? "CapCut" : "Canva");
    renderProduction(0);
  } catch {
    $("handoffStatus").textContent = "บันทึกไม่ได้";
  }
};
updateRouting(true);

// Draft autosave: every edit in the brief or routing is kept in this browser until a new brief is started.
let draftTimer = null;
function queueDraft() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraft, 400);
}
for (const area of [$("workEditor"), document.querySelector(".routing")]) {
  area.addEventListener("input", queueDraft);
  area.addEventListener("change", queueDraft);
  area.addEventListener("click", (e) => {
    if (e.target.closest("[data-look], [data-palette], [data-layout], [data-preset]")) queueDraft();
  });
}
$("newBrief").onclick = () => {
  if (!confirm("เริ่มบรีฟใหม่? บรีฟที่บันทึกใน Projects ยังอยู่ แต่ Draft ที่ยังไม่บันทึกและไฟล์ Footage ที่แนบไว้จะถูกล้าง")) return;
  try {
    localStorage.removeItem(draftKey);
  } catch {}
  location.hash = "new-brief";
  location.reload();
};
(function restoreDraft() {
  const d = readDraft();
  if (d) {
    loadProject(d.project);
    workStep = Math.max(0, Math.min(3, Number(d.step) || 0));
    $("draftStatus").textContent =
      "Draft ล่าสุด " + new Date(d.savedAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
    showWorkLaunch();
  }
})();
