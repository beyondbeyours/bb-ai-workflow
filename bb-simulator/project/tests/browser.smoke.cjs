// Functional browser test: draft autosave/resume, save upsert, brand isolation, crew tap mapping, demo safety.
// Usage: python3 -m http.server 4173 --directory dist  then  node tests/browser.smoke.cjs [outDir] [url]
// Needs Playwright + Chromium (not a project dependency; run where available).
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const out = process.argv[2] || ".",
    url = process.argv[3] || "http://localhost:4173/";
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  const results = [];
  const ok = (name, fn) => {
    try {
      fn();
      results.push("PASS " + name);
    } catch (e) {
      results.push("FAIL " + name + " :: " + e.message);
    }
  };
  const crewList = [
    [1, "Leo"],
    [2, "Kitty"],
    [3, "Tidy"],
    [4, "Chicha"],
    [0, "BB"],
  ];
  // Living cabin: HUD, toolbar, Log and Status Board.
  const cabinShown = await p.isVisible("#simScene");
  ok("cabin is the main view", () => assert(cabinShown));
  const hud = await p.textContent(".simHud");
  ok("HUD says Workspace, not live production", () => {
    assert.match(hud, /Workspace/);
    assert.doesNotMatch(hud, /LIVE/);
  });
  const statusCount = await p.$$eval(".simStatus", (e) => e.filter((x) => x.textContent.trim()).length);
  ok("every crew chip has a status line", () => assert.equal(statusCount, 5));
  await p.click('.simToolbar [data-panel="board"]');
  const boardRows = await p.$$eval(".simBoardList li", (e) => e.length);
  const boardText = await p.textContent(".simPanel");
  ok("Status Board lists all five crew", () => assert.equal(boardRows, 5));
  ok("Status Board states Export is not connected", () => assert.match(boardText, /ยังไม่เชื่อม/));
  await p.click(".simBoardList li:nth-child(4)");
  const fromBoard = await p.getAttribute("#simIdentity h1 img", "alt");
  ok("Board row opens Tidy", () => assert.equal(fromBoard, "Tidy"));
  await p.click('.simToolbar [data-panel="log"]');
  const logText = await p.textContent(".simPanel");
  ok("Log shows activity", () => assert.match(logText, /เปิด Cockpit/));
  await p.click(".simPanelHead button");
  const panelHidden = await p.isHidden(".simPanel");
  ok("panel closes", () => assert(panelHidden));
  await p.click('.simToolbar button:has-text("สถานะ")');
  const statusHidden = await p.isHidden(".simStatus >> nth=0");
  ok("status toggle hides status lines", () => assert(statusHidden));
  await p.click('.simToolbar button:has-text("สถานะ")');
  for (const [i, name] of crewList) {
    await p.tap(`.simActor[data-index="${i}"]`);
    const h = await p.getAttribute("#simIdentity h1 img", "alt");
    ok(`tap cabin ${name} opens ${name}`, () => assert.equal(h, name));
    const box = await p.locator(`.simActor[data-index="${i}"]`).boundingBox();
    ok(`${name} hit target >= 44px`, () => assert(box.width >= 44 && box.height >= 44, JSON.stringify(box)));
  }
  await p.tap("#simCrewDock button:nth-child(3)");
  const dockName = await p.getAttribute("#simIdentity h1 img", "alt");
  ok("dock avatar 3 -> Kitty", () => assert.equal(dockName, "Kitty"));
  // overlap check: faces (top 45% of each portrait) must not be covered by another actor's box
  const boxes = await p.$$eval(".simActor", (els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      const n = e.querySelector(".simName").getBoundingClientRect();
      return { i: e.dataset.index, x: r.x, y: r.y, w: r.width, h: r.height, n: { x: n.x, y: n.y, w: n.width, h: n.height } };
    }),
  );
  const inter = (a, c) =>
    Math.max(0, Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x)) * Math.max(0, Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y));
  for (const a of boxes) {
    const face = { x: a.x + a.w * 0.2, y: a.y + a.h * 0.05, w: a.w * 0.6, h: a.h * 0.4 };
    for (const c of boxes)
      if (c !== a) {
        ok(`label ${c.i} clear of face ${a.i}`, () => assert.equal(inter(face, c.n), 0));
      }
    ok(`own label clear of face ${a.i}`, () => assert.equal(inter(face, a.n), 0));
  }
  // demo does not change real counts
  const before = await p.textContent("#simJobCount");
  await p.click("#simDemo");
  await p.waitForTimeout(500);
  const mode = await p.textContent("#simMode");
  ok("demo labelled", () => assert.match(mode, /Demo/));
  const demoHud = await p.textContent(".simHud");
  ok("HUD marks Demo as not saving real work", () => {
    assert.match(demoHud, /DEMO/);
    assert.match(demoHud, /ไม่บันทึกงานจริง/);
  });
  await p.click("#simDemo");
  const after = await p.textContent("#simJobCount");
  ok("job count unchanged by demo", () => assert.equal(after, before));
  // Brief: draft autosave
  await p.click('[data-tab="workspace"]');
  await p.click("#startBrief");
  await p.fill("#title", "Draft Test Clip");
  await p.fill("#brief", "คำสั่งทดสอบ draft");
  await p.selectOption("#audience", { index: 2 });
  const mood = await p.inputValue("#audience");
  await p.click("#stepNext");
  await p.waitForTimeout(600);
  await p.reload({ waitUntil: "networkidle" });
  await p.click('[data-tab="workspace"]');
  const resumeVisible = await p.isVisible("#resumeBrief");
  ok("resume visible after reload", () => assert(resumeVisible));
  await p.click("#resumeBrief");
  const t = await p.inputValue("#title"),
    m = await p.inputValue("#audience"),
    step = await p.textContent("#stepCount");
  ok("draft title restored", () => assert.equal(t, "Draft Test Clip"));
  ok("draft mood restored", () => assert.equal(m, mood));
  ok("draft step restored (02)", () => assert.match(step, /^02/));
  await p.screenshot({ path: out + "/func-resume.png" });
  // save twice -> one project
  await p.click('[data-step="3"]');
  await p.click("#save");
  await p.waitForTimeout(200);
  const s1 = await p.textContent("#saveStatus");
  await p.click('[data-step="0"]');
  await p.fill("#brief", "แก้ครั้งที่สอง");
  await p.click('[data-step="3"]');
  await p.click("#save");
  const s2 = await p.textContent("#saveStatus");
  const n = await p.evaluate(() => JSON.parse(localStorage.getItem("ai-video-studio-briefs-v1")).length);
  ok("first save creates", () => assert.match(s1, /บันทึกโปรเจกต์แล้ว/));
  ok("second save updates same project", () => assert.match(s2, /อัปเดต/));
  ok("only one stored project", () => assert.equal(n, 1));
  // brand isolation
  await p.click('[data-tab="history"]');
  const beyondItems = await p.$$eval("#historyList .historyitem", (e) => e.length);
  await p.selectOption("#brandSelect", "yaadz");
  const yzItems = await p.$$eval("#historyList .historyitem", (e) => e.length);
  const yzEmpty = await p.textContent("#historyList");
  ok("beyond shows its project", () => assert.equal(beyondItems, 1));
  ok("Y&Z does not show Beyond project", () => assert.equal(yzItems, 0));
  ok("Y&Z empty state names brand", () => assert.match(yzEmpty, /Y&Z Stories/));
  await p.click('[data-tab="simulator"]');
  const yzCount = await p.textContent("#simJobCount");
  ok("simulator Y&Z count 0", () => assert.equal(yzCount, "0"));
  const label = await p.textContent("#simBrandLabel");
  ok("brand label Y&Z Stories", () => assert.equal(label, "Y&Z Stories"));
  // new brief clears draft
  await p.selectOption("#brandSelect", "beyond");
  await p.click('[data-tab="workspace"]');
  if (await p.isVisible("#resumeBrief")) await p.click("#resumeBrief");
  await p.click("#newBrief");
  const armed = await p.textContent("#newBrief");
  ok("new brief asks for a second tap", () => assert.match(armed, /แตะอีกครั้ง/));
  await p.click("#newBrief");
  await p.waitForTimeout(500);
  const t2 = await p.inputValue("#title");
  const vis = await p.isVisible("#workEditor");
  ok("new brief empty title", () => assert.equal(t2, ""));
  ok("new brief opens editor", () => assert(vis));
  const n2 = await p.evaluate(() => JSON.parse(localStorage.getItem("ai-video-studio-briefs-v1")).length);
  ok("saved project kept after new brief", () => assert.equal(n2, 1));
  const draftGone = await p.evaluate(() => localStorage.getItem("bb-simulator-draft-v1"));
  ok("draft cleared after new brief", () => assert.equal(draftGone, null));
  await p.fill("#title", "Second Clip");
  await p.click('[data-step="3"]');
  await p.click("#save");
  const n3 = await p.evaluate(() => JSON.parse(localStorage.getItem("ai-video-studio-briefs-v1")).length);
  ok("new brief saves as a separate project", () => assert.equal(n3, 2));
  ok("no page errors", () => assert.deepEqual(errs, []));
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(results.length - failed + "/" + results.length + " passed");
  if (failed) process.exitCode = 1;
  await b.close();
})();
