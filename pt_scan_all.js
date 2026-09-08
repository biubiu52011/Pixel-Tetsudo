const https = require("https");
function fetchJson(url) {
  return new Promise(function(res, rej) {
    https.get(url, function(r) {
      let d = "";
      r.on("data", function(c) { d += c; });
      r.on("end", function() { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
(async function() {
  const keys = {
    challenge: "gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
    main: "jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz"
  };
  for (const env of Object.keys(keys)) {
    const host = env === "challenge" ? "api-challenge.odpt.org" : "api.odpt.org";
    const url = "https://" + host + "/api/v4/odpt:TrainInformation?acl:consumerKey=" + keys[env];
    try {
      const data = await fetchJson(url);
      const byOp = {};
      const byRail = {};
      data.forEach(function(r) {
        const op = r["odpt:operator"] || "(none)";
        const rw = r["odpt:railway"] || "(none)";
        byOp[op] = (byOp[op] || 0) + 1;
        byRail[rw] = (byRail[rw] || 0) + 1;
      });
      console.log("==== " + env + " total=" + data.length + " ====");
      console.log("-- operators --");
      console.log(JSON.stringify(byOp, null, 1));
      console.log("-- railways (keys) --");
      console.log(Object.keys(byRail).join("\n"));
    } catch (e) {
      console.log(env + " ERROR: " + e.message);
    }
  }
})();
