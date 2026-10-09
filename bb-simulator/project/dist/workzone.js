"use strict";
// Work Zone home: the brief in progress, what is still missing, a start button per production
// lane and the brand's recent projects. All data comes from this browser (BBStatus / saved briefs).
(function () {
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const lanes = [
    {
      id: "video",
      title: "Video ตามคำสั่ง",
      flow: "BB → Leo คัด Footage → Kitty ประกอบใน CapCut → Tidy ซับ/กราฟิก → Chicha ตรวจ → แม่ตรวจ",
      out: "ส่ง: โปรเจกต์ CapCut ที่แก้ Timeline ต่อได้",
    },
    {
      id: "content",
      title: "Content ตามคำสั่ง",
      flow: "BB → เตรียมข้อมูล → Kitty จัดใน Canva → Tidy ข้อความ/ปก → Chicha ตรวจ → แม่อนุมัติใน Canva",
      out: "ส่ง: งาน Canva ที่แก้ได้ แล้ว Export จากงานที่อนุมัติ",
    },
    {
      id: "scheduled",
      title: "Content Calendar",
      flow: "แผนของแบรนด์ → จัดใน Canva → ตรวจ → แม่อนุมัติใน Canva → โพสต์ตามเวลา",
      out: "ส่ง: งาน Canva ตามตาราง · การโพสต์ยังไม่เชื่อม",
    },
  ];
  // Two-tap confirm when an action would clear the brief in progress.
  let armed = null;
  function confirmTwice(button, label, fn) {
    if (!$("title").value.trim() || armed === button) {
      clearTimeout(button._t);
      armed = null;
      return fn();
    }
    armed = button;
    const old = button.dataset.label || button.textContent;
    button.dataset.label = old;
    button.classList.add("isArmed");
    button.querySelector(".wzConfirm")?.remove();
    button.append(el("span", "wzConfirm", label));
    button._t = setTimeout(() => {
      armed = null;
      button.classList.remove("isArmed");
      button.querySelector(".wzConfirm")?.remove();
    }, 4000);
  }
  function openEditor(step) {
    setStep(step);
    $("workEditor").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function startLane(id) {
    resetBrief();
    $("productionLane").value = id;
    $("productionLane").dispatchEvent(new Event("change", { bubbles: true }));
    openEditor(0);
  }
  $("startBrief").onclick = $("sceneStart").onclick = () => {
    if (!$("title").value.trim()) return openEditor(0);
    confirmTwice($("startBrief"), "แตะอีกครั้งเพื่อล้าง Draft นี้แล้วเริ่มใหม่", () => {
      resetBrief();
      openEditor(0);
    });
  };
  $("wzAllProjects").onclick = () => tab("history");

  function render() {
    const s = window.BBStatus.snapshot();
    $("wzContext").textContent = (s.brand.name || "เลือกแบรนด์") + " · " + BBWorkflow.laneName(s.lane);
    $("wzDraftTitle").textContent = s.title || "ยังไม่มีบรีฟที่เปิดอยู่";
    $("wzDraftTitle").classList.toggle("isEmpty", !s.title);
    $("wzDraftMeta").textContent = s.title ? $("draftStatus").textContent || "Draft ในเบราว์เซอร์นี้" : "";
    document.querySelectorAll(".wzSteps [data-launch-step]").forEach((b, i) => {
      const st = s.steps[i];
      b.querySelector("span").textContent = st.label;
      b.querySelector("small").textContent = st.done ? "ครบ" : s.title || i === 0 ? "ยังไม่ครบ" : "รอบรีฟ";
      b.classList.toggle("isDone", st.done);
    });
    const missing = $("wzMissing");
    missing.replaceChildren();
    const items = s.title ? s.issues : ["ตั้งชื่อโปรเจกต์", "เลือกประเภทงาน เป้าหมาย และกลุ่มผู้ชม"];
    if (!items.length) missing.append(el("li", "isOk", "บรีฟครบแล้ว · ไปที่ Review แล้วบันทึกโปรเจกต์"));
    items.slice(0, 5).forEach((t) => missing.append(el("li", "", t)));
    if (items.length > 5) missing.append(el("li", "isMore", "และอีก " + (items.length - 5) + " จุดในหน้า Review"));
    $("startBrief").textContent = s.title ? "เริ่มบรีฟใหม่" : "เริ่มบรีฟกับ BB →";
    $("startBrief").classList.toggle("isSecondary", !!s.title);

    const laneList = $("wzLanes");
    laneList.replaceChildren();
    for (const lane of lanes) {
      const b = el("button", "wzLane" + (lane.id === s.lane ? " isCurrent" : ""));
      b.type = "button";
      b.append(el("strong", "", lane.title), el("span", "", lane.flow), el("small", "", lane.out));
      b.onclick = () => confirmTwice(b, "แตะอีกครั้ง: ล้าง Draft ปัจจุบันแล้วเริ่มงาน " + lane.title, () => startLane(lane.id));
      laneList.append(b);
    }

    const recent = $("wzRecent");
    recent.replaceChildren();
    if (!s.saved.length) recent.append(el("li", "wzEmpty", "ยังไม่มีโปรเจกต์ของ " + (s.brand.name || "แบรนด์นี้")));
    for (const r of s.saved.slice(0, 4)) {
      const li = el("li");
      const b = el("button");
      b.type = "button";
      b.append(
        el("strong", "", r.title),
        el(
          "span",
          "",
          BBWorkflow.laneName(r.lane || "video") +
            " · " +
            new Date(r.updated || r.created).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
        ),
        el("small", "", "บรีฟพร้อม · ยังไม่เริ่มผลิต"),
      );
      b.onclick = () =>
        confirmTwice(b, "แตะอีกครั้งเพื่อเปิดงานนี้แทน Draft ปัจจุบัน", () => {
          loadProject(r);
          openEditor(0);
        });
      li.append(b);
      recent.append(li);
    }
  }
  let t = null;
  const later = () => {
    clearTimeout(t);
    t = setTimeout(render, 300);
  };
  document.addEventListener("input", later);
  document.addEventListener("change", later);
  document.addEventListener("bbsim:refresh", later);
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => b.dataset.tab === "workspace" && render()));
  $("backWorkZone").addEventListener("click", render);
  render();
})();
