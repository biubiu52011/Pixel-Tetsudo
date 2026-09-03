// Line Service Relations - Canonical Line-to-Line Service Relation Layer
// SOLE AUTHORITY for service relations between canonical lines.
// DO NOT confuse with: LOS (Display Group), railway_data.json (Identity), stationLines (Topology)

/* global window */
window.LineServiceRelations = [
  { lineA: "Saikyo", lineB: "Kawagoe", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Omiya"], evidence: { source: "LOS JA stationLines shared 1", confidence: "HIGH" } },
  { lineA: "SeibuIkebukuro", lineB: "Ikebukuro", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "LOS SI stationLines shared 18 subset", confidence: "HIGH" } },
  { lineA: "Marunouchi", lineB: "MarunouchiBranch", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Yurakucho","Shibuya","Shin-juku","Shinbashi","Akasaka-mitsuke","Otemachi","Mitsukoshimae"], evidence: { source: "LOS M stationLines shared 7", confidence: "HIGH" } },
  { lineA: "Ikebukuro", lineB: "SeibuToshima", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Nerima"], evidence: { source: "LOS SI stationLines shared 1", confidence: "MEDIUM" } },
  { lineA: "KeikyuMain", lineB: "Sakuragi", relation: "ALIAS_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "stationLines identical sets 7", confidence: "HIGH" } },
  { lineA: "Agatsuma", lineB: "Takasaki", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Takasaki"], evidence: { source: "branchOf stationLines shared 1", confidence: "HIGH" } },
  { lineA: "SuigunBranch", lineB: "Suigun", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [""], evidence: { source: "branchOf stationLines shared 1", confidence: "HIGH" } },
  { lineA: "Ome", lineB: "ChuoRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "Itsukaichi", lineB: "ChuoRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "ChuoKonosu", lineB: "ChuoRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "Sotobo", lineB: "SobuRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "Uchibo", lineB: "SobuRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "TobuNikko", lineB: "Nikkoku", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "LOS TN 0 shared different sets", confidence: "UNKNOWN" } },
  { lineA: "Tojo", lineB: "Utsunomiya", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "LOS TTJ 0 shared unprovable", confidence: "UNKNOWN" } },
];

(function() {
  "use strict";
  var L = window.LineServiceRelations || [];
  L.getRelatedLines = function(lid) {
    if (!lid) return [];
    return L.filter(function(r) { return r.lineA === lid || r.lineB === lid; });
  };
  L.isThroughService = function(a, b) {
    if (!a || !b) return false;
    return L.some(function(r) {
      return r.relation === "THROUGH_SERVICE" &&
        ((r.lineA === a && r.lineB === b) || (r.lineA === b && r.lineB === a));
    });
  };
  L.getServiceChains = function() {
    var rs = L.filter(function(r) { return r.relation === "THROUGH_SERVICE"; });
    var nodes = {};
    rs.forEach(function(r) {
      nodes[r.lineA] = nodes[r.lineA] || [];
      nodes[r.lineB] = nodes[r.lineB] || [];
      nodes[r.lineA].push(r.lineB);
      nodes[r.lineB].push(r.lineA);
    });
    var visited = {};
    var chains = [];
    Object.keys(nodes).forEach(function(start) {
      if (visited[start]) return;
      var chain = [];
      var queue = [start];
      visited[start] = true;
      while (queue.length > 0) {
        var cur = queue.shift();
        chain.push(cur);
        (nodes[cur] || []).forEach(function(n) {
          if (!visited[n]) { visited[n] = true; queue.push(n); }
        });
      }
      if (chain.length > 1) chains.push(chain);
    });
    return chains;
  };
})();