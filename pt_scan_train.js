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
  const ops = ["Odakyu", "JR-West", "Yurikamome", "Minatomirai", "ShonanMonorail", "ChibaMonorail", "SaitamaTransit", "JR-East"];
  for (const op of ops) {
    const results = {};
    for (const ep of ["odpt:Train", "odpt:TrainTimetable", "odpt:TrainInformation"]) {
      const url = "https://api-challenge.odpt.org/api/v4/" + ep + "?odpt:operator=odpt.Operator:" + op + "&acl:consumerKey=" + key;
      try {
        const data = await fetchJson(url);
        results[ep] = Array.isArray(data) ? data.length : ("non-array:" + typeof data);
      } catch (e) {
        results[ep] = "ERR:" + e.message;
      }
    }
    console.log(op + " => " + JSON.stringify(results));
  }
})();
