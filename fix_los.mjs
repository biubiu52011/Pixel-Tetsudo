const fs = require("fs");
const path = "data/core/line-operation-systems.js";
let c = fs.readFileSync(path, "utf8");
const start = c.indexOf(`code: "JC"`);
console.log(c.substring(start, start + 350));

