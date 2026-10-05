const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "data/core/line-service-relations.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { timeout: 1000 });
const relations = sandbox.window.LineServiceRelations;

function relation(a, b) {
  return relations.find(r => (r.lineA === a && r.lineB === b) || (r.lineA === b && r.lineB === a));
}
function through(a, b) {
  const r = relation(a, b);
  assert(r, a + " <-> " + b + " relation missing");
  assert.strictEqual(r.relation, "THROUGH_SERVICE", a + " <-> " + b + " must be passenger through service");
  assert.strictEqual(r.direction, "BIDIRECTIONAL", a + " <-> " + b + " must be bidirectional");
  return r;
}

// JR East Tokyo-area passenger map: service systems, not track-register boundaries.
through("Yokosuka", "SobuRapid");
through("UenoTokyo", "UtsunomiyaJR");
through("UenoTokyo", "Takasaki");
through("UenoTokyo", "Joban");
through("UenoTokyo", "Tokaido");
through("ShonanShinjuku", "UtsunomiyaJR");
through("ShonanShinjuku", "Takasaki");
through("ShonanShinjuku", "Yokosuka");
through("ShonanShinjuku", "Tokaido");

const jo = relation("Yokosuka", "SobuRapid");
assert.strictEqual(jo.displayGroup, "横須賀線・総武線快速");

console.log("jr-east-tokyo-passenger-service: PASS");
