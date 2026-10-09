// Video Builder + Review room browser test.
// Usage: python3 -m http.server 4173 --directory dist  then  node tests/browser.review.cjs [outDir]  (W=1440 for laptop)
// Needs Playwright + Chromium. Fixtures: tests/fixtures/*.webm (generated test patterns).
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const path = require("node:path");
const assert = require("node:assert/strict");
(async () => {
  const out = process.argv[2] || ".",
    SP = path.join(__dirname, "fixtures");
  const w = Number(process.env.W || 390),
    m = !process.env.W;
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: w, height: 900 },
    deviceScaleFactor: m ? 2 : 1,
    isMobile: m,
    hasTouch: m,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  const res = [];
  const ok = (n, f) => {
    try {
      f();
      res.push("PASS " + n);
    } catch (e) {
      res.push("FAIL " + n + " :: " + e.message);
    }
  };
  await p.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  // --- Video Builder
  await p.click('[data-tab="workspace"]');
  await p.click("#startBrief");
  await p.fill("#title", "Builder Test");
  await p.click('[data-step="2"]');
  await p.setInputFiles("#files", [SP + "/test-clip.webm", SP + "/test-clip2.webm"]);
  await p.waitForTimeout(500);
  const clips = await p.$$eval(".vbClip", (e) => e.length);
  ok("two clips in bin", () => assert.equal(clips, 2));
  await p.click(".vbClip >> nth=0");
  await p.waitForTimeout(500);
  await p.fill(".vbMarks input >> nth=0", "00:01.0");
  await p.fill(".vbMarks input >> nth=1", "00:03.5");
  await p.fill('input[aria-label="ซับของช็อต"]', "สวัสดีค่ะ");
  await p.fill('input[aria-label="Super ของช็อต"]', "เปิดร้านวันแรก");
  await p.click(".vbForm .primary");
  await p.click(".vbClip >> nth=1");
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const v = document.getElementById("vbPlayer");
    v.currentTime = 2;
  });
  await p.waitForTimeout(300);
  await p.click(".vbMarks button >> nth=0");
  await p.evaluate(() => {
    const v = document.getElementById("vbPlayer");
    v.currentTime = 4.5;
  });
  await p.waitForTimeout(300);
  await p.click(".vbMarks button >> nth=1");
  await p.fill('input[aria-label="ซับของช็อต"]', "ช็อตที่สอง");
  await p.click(".vbForm .primary");
  const shots = await p.$$eval(".vbList li", (e) => e.length);
  ok("two shots on timeline", () => assert.equal(shots, 2));
  const totals = await p.textContent(".vbTotals");
  ok("total duration 5.0s", () => assert.match(totals, /5\.0 วินาที/));
  // wrong order: out before in
  await p.fill(".vbMarks input >> nth=0", "00:04.0");
  await p.fill(".vbMarks input >> nth=1", "00:02.0");
  await p.click(".vbForm .primary");
  const err = await p.textContent(".vbForm .hint");
  ok("rejects out before in", () => assert.match(err, /จุดออกต้องอยู่หลังจุดเข้า/));
  await p.click('.vbRowCtl button[aria-label="เลื่อนช็อตลง"] >> nth=0');
  const first = await p.textContent(".vbList li:first-child strong");
  ok("reorder moves shot", () => assert.match(first, /test-clip2/));
  await p.fill(".vbDrive input >> nth=0", "https://drive.google.com/file/d/abc/view");
  await p.fill(".vbDrive input >> nth=1", "ช็อตจาก Drive");
  await p.click(".vbDrive button");
  const drive = await p.textContent(".vbBin");
  ok("drive link listed as not verified", () => assert.match(drive, /ยังไม่ได้ตรวจสิทธิ์/));
  await p.click(".vbActions .primary");
  await p.waitForTimeout(1200);
  const ov = await p.textContent(".vbOverlay");
  ok("sequence preview shows shot text", () => assert(ov.trim().length > 0, ov));
  await p.click(".vbActions .primary");
  await p.click('.vbActions button:has-text("คัดลอก Shot List")');
  await p.waitForTimeout(200);
  const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  ok("shot list copied with timecodes", () => assert.match(clip, /#1 \[00:00\.0–/));
  await p.screenshot({ path: out + "/builder.png", fullPage: true });
  // persists in draft
  await p.waitForTimeout(700);
  await p.reload({ waitUntil: "networkidle" });
  await p.click('[data-tab="workspace"]');
  await p.click("#resumeBrief");
  await p.click('[data-step="2"]');
  const after = await p.$$eval(".vbList li", (e) => e.length);
  const warn = await p.textContent(".vbList");
  ok("timeline survives reload", () => assert.equal(after, 2));
  ok("asks to re-attach local files", () => assert.match(warn, /ต้องแนบไฟล์/));
  // --- Review room
  await p.click('[data-tab="review"]');
  await p.waitForTimeout(300);
  await p.click(".rvBar button");
  await p.setInputFiles(".rvUpload input", SP + "/test-clip.webm");
  await p.waitForTimeout(800);
  const v1 = await p.$$eval(".rvVersions button", (e) => e.map((x) => x.textContent));
  ok("version v1 listed", () => assert.deepEqual(v1, ["v1"]));
  await p.evaluate(() => {
    const v = document.querySelector(".rvFrame video");
    v.currentTime = 2.4;
  });
  await p.waitForTimeout(300);
  const box = await p.locator(".rvLayer").boundingBox();
  await p.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.2);
  await p.click('.rvCats button:has-text("จังหวะ")');
  const owner = await p.inputValue(".rvForm select");
  ok("cut pin routes to Kitty", () => assert.equal(owner, "2"));
  await p.fill(".rvForm textarea", "ตัดช็อตนี้ให้สั้นลงครึ่งวินาที");
  await p.click(".rvForm .primary");
  await p.waitForTimeout(300);
  await p.click(".rvMedia > .primary");
  await p.click('.rvCats button:has-text("ข้อความ")');
  await p.fill(".rvForm textarea", "ซับสะกดผิด แก้เป็น สวัสดีค่ะ");
  await p.click(".rvForm .primary");
  await p.waitForTimeout(300);
  const pins = await p.$$eval(".rvList li", (e) => e.length);
  ok("two pins listed", () => assert.equal(pins, 2));
  const passDisabled = await p.isDisabled(".rvFoot .primary");
  ok("cannot pass with open pins", () => assert(passDisabled));
  await p.click(".rvFoot .textbutton");
  await p.waitForTimeout(200);
  const sheet = await p.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  ok("revision sheet grouped by person with timecode", () => {
    assert.match(sheet, /Kitty/);
    assert.match(sheet, /Tidy/);
    assert.equal((sheet.match(/\[00:02\.4\]/g) || []).length, 2);
  });
  await p.screenshot({ path: out + "/review-open.png", fullPage: true });
  // team fixes, new version, BB passes
  for (let i = 0; i < 2; i++) (await p.click(".rvList li >> nth=" + i + ' >> button:has-text("ทีมแก้แล้ว")'), await p.waitForTimeout(250));
  await p.setInputFiles(".rvUpload input", SP + "/test-clip2.webm");
  await p.waitForTimeout(800);
  const vers = await p.$$eval(".rvVersions button", (e) => e.length);
  ok("v2 uploaded", () => assert.equal(vers, 2));
  await p.click('.rvList li >> nth=0 >> button:text-is("ผ่าน")');
  await p.waitForTimeout(250);
  const stillDisabled = await p.isDisabled(".rvFoot .primary");
  ok("still blocked with one pin left", () => assert(stillDisabled));
  await p.click('.rvList li >> nth=1 >> button:text-is("ผ่าน")');
  await p.waitForTimeout(250);
  const enabled = await p.isEnabled(".rvFoot .primary");
  ok("can pass when every pin passed", () => assert(enabled));
  await p.click(".rvFoot .primary");
  await p.waitForTimeout(250);
  const st = await p.textContent(".rvStatus");
  ok("pass notes final approval stays in CapCut", () => assert.match(st, /CapCut/));
  await p.screenshot({ path: out + "/review-passed.png", fullPage: true });
  // brand isolation
  await p.selectOption("#brandSelect", "yaadz");
  await p.waitForTimeout(400);
  const yz = await p.textContent("#reviewApp");
  ok("Y&Z has no Beyond review", () => assert.match(yz, /ยังไม่มีรอบตรวจของแบรนด์นี้/));
  ok("no page errors", () => assert.deepEqual(errs, []));
  console.log(res.join("\n"));
  const failed = res.filter((r) => r.startsWith("FAIL")).length;
  console.log(res.length - failed + "/" + res.length + " passed");
  if (failed) process.exitCode = 1;
  await b.close();
})();
