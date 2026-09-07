/*
 * Pixel Tetsudo - Through Service (直通運転) Provider
 *
 * Single source of truth for through-service (相互直通運転) relationships.
 * Provider: ThroughService
 * Consumers: DataFusion (timetable expansion), RouteSearch (transfer penalty), TrainsPage (display)
 *
 * Semantics of THROUGH_SERVICE_MAP:
 *   A -> [B, C] means a train can run through DIRECTLY between A and B/C
 *   (no intermediate line). Multi-hop chains are resolved by getThroughServiceLines()
 *   via BFS. Keys/values are real railway_data lineIds.
 */
(function() {
  "use strict";

  var THROUGH_SERVICE_MAP = {
    // 東武スカイツリーライン・伊勢崎線
    "TobuSkytree": ["Hibiya", "Hanzomon", "Asakusa"],
    "TobuIsesaki": ["Hibiya", "Hanzomon"],
    // 東京メトロ
    "Hibiya": ["TobuSkytree", "TobuIsesaki"],
    "Hanzomon": ["TobuSkytree", "TobuIsesaki", "TokyuDenEn"],
    "Namboku": ["TokyuMeguro"],
    "Chiyoda": ["JobanLocal", "OdakyuTama"],
    "Tozai": ["ChuoSobuLocal"],
    "Yurakucho": ["Ikebukuro", "Tojo"],
    "Fukutoshin": ["TokyuToyoko", "Ikebukuro", "Tojo"],
    "Mita": ["TokyuMeguro"],
    "Asakusa": ["Keikyu", "Keisei", "KeiseiOshiage", "TobuSkytree"],
    "Shinjuku": ["Keio", "KeioMain"],
    // 東急
    "TokyuToyoko": ["MinatoMirai", "Fukutoshin"],
    "MinatoMirai": ["TokyuToyoko"],
    "TokyuMeguro": ["Mita", "Namboku"],
    "TokyuDenEn": ["Hanzomon"],
    // 西武池袋線
    "Ikebukuro": ["Fukutoshin", "Yurakucho"],
    // 東武東上線
    "Tojo": ["Fukutoshin", "Yurakucho"],
    // 京成・京急
    "Keikyu": ["Asakusa"],
    "Keisei": ["Asakusa", "KeiseiOshiage"],
    "KeiseiOshiage": ["Asakusa", "Keisei"],
    // 相鉄
    "SotetsuMain": ["Saikyo", "TokyuToyoko"],
    "SotetsuIzumino": ["SotetsuMain"],
    "SotetsuShin-Yokohama": ["SotetsuMain"],
    // JR
    "Saikyo": ["Kawagoe", "Rinkai", "SotetsuMain"],
    "Kawagoe": ["Saikyo"],
    "Rinkai": ["Saikyo"],
    "ShonanShinjuku": ["Utsunomiya", "Takasaki", "Yokosuka"],
    "ChuoRapid": ["Ome", "Itsukaichi"],
    "SobuRapid": ["Yokosuka"],
    "Yokosuka": ["SobuRapid"],
    "JobanLocal": ["Chiyoda"],
    "Joban": ["Narita"],
    "Narita": ["Joban"],
    "Keiyo": ["Uchibo", "Sotobo"],
    "Uchibo": ["Keiyo"],
    "Sotobo": ["Keiyo"],
    "OdakyuTama": ["Chiyoda"],
    "ChuoSobuLocal": ["Tozai"]
  };

  /** Direct through-service neighbours of a line (1 hop). */
  function getDirectThroughLines(lineId) {
    try {
      var t = THROUGH_SERVICE_MAP[lineId];
      return (t && Array.isArray(t)) ? t.slice() : [];
    } catch(e) { return []; }
  }

  /** BFS closure: every line reachable through any number of through runs. */
  function getThroughServiceLines(lineId) {
    try {
      var result = [];
      var visited = {};
      var queue = [lineId];
      visited[lineId] = true;
      while (queue.length > 0) {
        var current = queue.shift();
        var through = THROUGH_SERVICE_MAP[current];
        if (through && Array.isArray(through)) {
          through.forEach(function(lid) {
            if (!visited[lid]) {
              visited[lid] = true;
              result.push(lid);
              queue.push(lid);
            }
          });
        }
      }
      return result;
    } catch(e) { return []; }
  }

  function getMap() {
    return THROUGH_SERVICE_MAP;
  }

  window.ThroughService = {
    getMap: getMap,
    getDirectThroughLines: getDirectThroughLines,
    getThroughServiceLines: getThroughServiceLines
  };
})();
