const test = require("node:test"),
  assert = require("node:assert/strict");
require("../dist/simulator-model.js");
const s = globalThis.BBSimulator;
test("crew faces, names and roles are one-to-one; BB leads from Cockpit", () => {
  assert.equal(s.crew[0].name, "BB");
  assert.equal(s.crew[0].role, "Cockpit");
  assert.equal(new Set(s.crew.map((c) => c.name)).size, 5);
  assert.equal(new Set(s.crew.map((c) => c.sprite)).size, 5);
  assert.equal(s.crew.find((c) => c.name === "Kitty").member, 3);
  assert.equal(s.crew.find((c) => c.name === "Tidy").member, 2);
});
test("demo stops at BB approval in every production lane", () => {
  for (const lane of ["video", "content", "scheduled"]) {
    const j = s.journey(lane),
      p = j.filter((x) => x.pause);
    assert.equal(p.length, 1);
    assert.equal(p[0].owner, 0);
    assert.equal(p[0].state, "Approval");
    assert(j.findIndex((x) => x.pause) < j.findIndex((x) => x.state === "Export"));
    assert.equal(j.at(-1).state, "Complete");
  }
});
test("dashboard counts real browser records for the selected brand only", () => {
  const jobs = [{ brand: { id: "beyond" } }, { brand: { id: "yaadz" } }, {}],
    refs = [{ brandId: "yaadz" }, {}];
  assert.deepEqual(s.metrics(jobs, refs, "beyond"), { jobs: 2, references: 1 });
  assert.deepEqual(s.metrics(jobs, refs, "yaadz"), { jobs: 1, references: 1 });
  assert.deepEqual(s.metrics([], [], "beyond"), { jobs: 0, references: 0 });
});
test("all character hit targets stay inside the portrait scene", () => {
  for (const c of s.crew) {
    assert(c.x > 15 && c.x < 85);
    assert(c.y > 10 && c.y < 95);
  }
});
test("crew portraits share one face scale and no face is covered by another portrait", () => {
  // Scene is the 1024x1536 aircraft; work in width units (1 height % = 1.5 width %).
  const box = (c) => {
    const h = s.portraitHeight * (c.scale || 1) * 1.5,
      w = (h * 2) / 3,
      bottom = c.y * 1.5;
    return { x: c.x - w / 2, y: bottom - h, w, h };
  };
  const face = (b) => ({ x: b.x + b.w * 0.25, y: b.y + b.h * 0.08, w: b.w * 0.5, h: b.h * 0.3 });
  const overlap = (a, b) =>
    Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const scales = s.crew.map((c) => c.scale || 1);
  assert(Math.max(...scales) / Math.min(...scales) <= 1.15, "BB may only be slightly larger (perspective), never giant");
  for (const a of s.crew)
    for (const b of s.crew) {
      if (a === b) continue;
      // A portrait drawn in front (lower on screen) must not cover the face of one behind it.
      if (b.y > a.y) assert.equal(overlap(face(box(a)), box(b)), 0, b.name + " covers " + a.name + "'s face");
    }
});
