/*
 * Pixel Tetsudo - 2026 Toyoko/Fukutoshin through-operation evidence
 * v4.3.1056
 *
 * C-grade curated timetable source:
 * Chokopy's Train-Page, 2026-03-14 timetable revision.
 * This provider maps published operation IDs to the responsible rolling-stock
 * operator. It does NOT guess a formation within an operator's multi-model pool.
 */
(function() {
  "use strict";

  var SOURCE = "https://www.train.chokopy.net/unyo-search/Toyoko/2026-03-14/weekday";
  var EFFECTIVE = "2026-03-14";

  var weekday = {
    TOKYU:["001","002","003","004","005","006","007","008","009","010","011","012","013","014","015","016","017","018","019","020","021","022","023","024","025","026","027","028","029","030","031","051","052","053","054","055","056","057","058","059","060","061","062","063","064","065"],
    TokyoMetro:["701","702","703","704","705","707","709","711","713","715","717","719","723","725","729","731","733","741","745","747","753","763","767","771","775","777","779","781","785","787","789","791"],
    Seibu:["102","104","106","110","114","118","120","122","124","128","130","134"],
    Tobu:["803","805","813","819","821","823"],
    Sotetsu:["991","992","993","994","995"]
  };
  var holiday = {
    TOKYU:["001","002","003","004","005","006","007","008","009","010","011","012","013","014","015","016","017","018","019","020","021","022","023","024","051","052","053","054","055","056","057","058","059","060","061","062","063","064"],
    TokyoMetro:["701","702","703","704","705","707","709","711","713","717","719","723","725","729","731","733","739","743","745","747","749","753","755","757","761","767","773","775","785","787","789","791"],
    Seibu:["102","106","108","110","112","114","124","128","130","171","172","173","174","175"],
    Tobu:["803","805","811","813","817","819"],
    Sotetsu:["991","992","994"]
  };

  function serviceDay(dateText) {
    var d = new Date(String(dateText || EFFECTIVE).slice(0,10) + "T12:00:00+09:00");
    var day = d.getDay();
    return (day === 0 || day === 6) ? "holiday" : "weekday";
  }

  function operationCode(trainNumber) {
    var raw = String(trainNumber || "").toUpperCase().trim();
    // Metro/through working-number forms such as A1291G, B691G, 01K, 21S.
    var suffix = raw.match(/(?:^|[^0-9])(?:A|B)?(\d{1,2})([KSMTG])$/);
    if (suffix) {
      var n = String(parseInt(suffix[1],10)).padStart(2,"0");
      var letter = suffix[2];
      if (letter === "K") return { operator:"TOKYU", code:n };
      if (letter === "S") return { operator:"TokyoMetro", code:n };
      if (letter === "M") return { operator:"Seibu", code:n };
      if (letter === "T") return { operator:"Tobu", code:n };
      if (letter === "G") return { operator:"Sotetsu", code:n };
    }
    // Tokyu six-digit train numbers encode the published three-digit operation
    // in the leading digits, e.g. 991072 -> operation 991 (91G).
    var digits = raw.replace(/[^0-9]/g,"");
    if (digits.length >= 6) return { code:digits.slice(0,3) };
    if (digits.length === 3) return { code:digits };
    return null;
  }

  function inToyokoNetwork(ctx) {
    var s = [ctx.lineId,ctx.operator,ctx.railway,ctx.destinationStation].join("|");
    return /Fukutoshin|Yurakucho|TokyuToyoko|Toyoko|TokyuShinYokohama|ShinYokohama|Minatomirai|Sotetsu|Seibu|Tojo/i.test(s);
  }

  function resolveEvidence(trainNumber, ctx) {
    ctx = ctx || {};
    var date = String(ctx.serviceDate || "").slice(0,10);
    if (!date || date < EFFECTIVE || !inToyokoNetwork(ctx)) return null;
    var op = operationCode(trainNumber);
    if (!op) return null;

    var table = serviceDay(date) === "holiday" ? holiday : weekday;
    var owner = op.operator || "";
    if (!owner) {
      Object.keys(table).some(function(k) {
        if (table[k].indexOf(op.code) >= 0) { owner = k; return true; }
        return false;
      });
    }
    if (!owner) return null;

    // Suffix forms must also resolve to a published operation in this timetable.
    // Do not let a syntactically valid 21S/99M/etc bypass the dated operation set.
    if (op.operator) {
      var published = owner === "Sotetsu"
        ? ("9" + String(parseInt(op.code, 10) - 90).padStart(2, "0"))
        : ((owner === "TokyoMetro" ? "7" : owner === "Seibu" ? "1" :
            owner === "Tobu" ? "8" : "0") + op.code);
      if (table[owner].indexOf(published) < 0) return null;
      op.code = published;
    }

    var vehicleType = "";
    if (owner === "Sotetsu") {
      var sotetsuCode = op.code;
      if (table.Sotetsu.indexOf(sotetsuCode) < 0) return null;
      // 91G-95G Toyoko through workings are 20000-series-only in the dated
      // Sotetsu operation table. This is model-exact, not formation-exact.
      vehicleType = "相鉄20000系(10両)";
    }

    return {
      operator: owner,
      vehicleType: vehicleType,
      grade: "C",
      sourceUrl: SOURCE,
      provenance: "Chokopy 2026-03-14 Toyoko operation table",
      observedDate: date,
      operationCode: op.code
    };
  }

  var provider = {
    id:"chokopy-toyoko-20260314",
    grade:"C",
    sourceUrl:SOURCE,
    effectiveDate:EFFECTIVE,
    resolveEvidence:resolveEvidence
  };

  if (window.TrainOperationEvidence && typeof window.TrainOperationEvidence.register === "function") {
    window.TrainOperationEvidence.register(provider);
  } else {
    var list = window.TRAIN_OPERATION_EVIDENCE_PROVIDERS || (window.TRAIN_OPERATION_EVIDENCE_PROVIDERS=[]);
    list.push(provider);
  }
})();
