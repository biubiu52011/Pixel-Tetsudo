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
  const key = "gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din";
  try {
    const ops = await fetchJson("https://api-challenge.odpt.org/api/v4/odpt:Operator?acl:consumerKey=" + key);
    console.log("==== challenge odpt:Operator total=" + ops.length + " ====");
    const targets = ["Odakyu", "JR West", "JR_West", "jr-w", "Yurikamome", "MinatoMirai", "YokohamaMinatomirai", "ShonanMonorail", "SaitamaNewUrbanTransit", "ChibaUrbanMonorail", "IGR", "Aoimori", "Kominato", "Tobu", "Seibu", "Keikyu", "TokyoMetro", "Toei", "TWR", "MIR", "YokohamaMunicipal", "Sotetsu", "Tokyu", "Keio", "TamaMonorail", "Keisei", "TokyoMonorail", "Enoshima", "Shonan", "Senzan", "Hakone"];
    const names = {};
    ops.forEach(function(o) {
      const id = o["owl:sameAs"] || o["@id"] || "";
      const n = (o["odpt:operatorName"] || {}).ja || o["odpt:operatorName"] || "";
      names[id] = n;
    });
    console.log("-- ALL operators (sameAs | ja name) --");
    Object.keys(names).sort().forEach(function(id) { console.log(id + " | " + names[id]); });
    console.log("-- target match --");
    targets.forEach(function(t) {
      const hit = Object.keys(names).filter(function(id) { return id.toLowerCase().indexOf(t.toLowerCase()) >= 0; });
      console.log(t + " -> " + (hit.length ? hit.join(", ") : "NOT IN ODPT OPERATOR LIST"));
    });
  } catch (e) {
    console.log("ERROR: " + e.message);
  }
})();
