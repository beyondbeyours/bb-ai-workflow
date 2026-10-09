"use strict";
// One source for "what is true right now" in this browser: used by the cabin chips,
// the Simulator side panel and the Work Zone. Nothing here is a server metric.
(function () {
  const safe = (fn, fallback) => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  };
  function snapshot() {
    const brand = currentBrand(),
      saved = safe(() => readSaved().filter((j) => (j.brand?.id || "beyond") === brand.id), []),
      refs = safe(() => referenceRecords.filter((r) => (r.brandId || "beyond") === brand.id).length, 0),
      clips = safe(() => footage.length, 0),
      title = $("title").value.trim(),
      lane = $("productionLane").value,
      video = lane === "video",
      blocking = title ? safe(() => blockingIssues(), []) : [],
      warnings = title ? safe(() => reviewWarnings(), []) : [],
      issues = [...blocking, ...warnings],
      subs = safe(() => choiceValue("subtitles"), ""),
      sup = safe(() => choiceValue("superLanguage"), ""),
      assets = safe(() => $("assetsLink").value.trim(), "");
    const steps = [
      { label: "Brief", done: !!title && !blocking.length },
      { label: "Reference", done: refs > 0 },
      { label: video ? "Footage" : "Brand Assets", done: clips > 0 || !!assets },
      { label: "Review", done: !!title && !issues.length },
    ];
    return {
      brand,
      lane,
      video,
      saved,
      jobs: saved.length,
      refs,
      clips,
      title,
      blocking,
      issues,
      steps,
      doneSteps: steps.filter((s) => s.done).length,
      text: [
        title ? "บรีฟ: " + title : saved.length ? "บรีฟ " + saved.length + " งาน" : "พร้อมสั่งงาน",
        "Ref " + refs + " · Footage " + clips,
        title ? (video ? "รอประกอบใน CapCut" : "รอจัดใน Canva") : "รอบรีฟจาก BB",
        title ? "ซับ " + (subs || "-") + " · Super " + (sup || "-") : "รอบรีฟจาก BB",
        title ? (issues.length ? "ต้องตรวจ " + issues.length + " จุด" : "บรีฟครบ รอชิ้นงาน") : "รอบรีฟจาก BB",
      ],
    };
  }
  window.BBStatus = { snapshot };
})();
