// Line Service Relations - Canonical Line-to-Line Service Relation Layer
// SOLE AUTHORITY for service relations between canonical lines.
// DO NOT confuse with: LOS (Display Group), railway_data.json (Identity), stationLines (Topology)

/* global window */
window.LineServiceRelations = [
  { lineA: "Hachiko", lineB: "KawagoeWest", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Komagawa"], evidence: { source: "JR East Hachiko/Kawagoe continuous operation boundary at Komagawa", confidence: "HIGH" } },
  { lineA: "Joban", lineB: "NaritaAbikoBranch", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Abiko"], evidence: { source: "JR East Tokyo-area passenger map: 常磐線快速・成田線 through service via Abiko", confidence: "HIGH" } },
  { lineA: "Gono", lineB: "Ou", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Kawabe"], evidence: { source: "adjacent network boundary at Kawabe; through-running varies by service and is not assumed globally", confidence: "MEDIUM" } },
  { lineA: "Kamaishi", lineB: "Tohoku", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Hanamaki"], evidence: { source: "adjacent network boundary at Hanamaki; physical connection alone is not global through identity", confidence: "MEDIUM" } },
  { lineA: "Ou", lineB: "Tazawako", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Omagari"], evidence: { source: "adjacent network boundary at Omagari; service-specific through running must be evidenced separately", confidence: "MEDIUM" } },
  { lineA: "OsakaLoop", lineB: "Hanwa", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Tennoji"], evidence: { source: "JR West timetable: Kanku/Kishu Rapid continues between Osaka Loop and Hanwa at Tennoji", confidence: "HIGH" } },
  { lineA: "OsakaLoop", lineB: "KansaiMain", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Tennoji"], evidence: { source: "JR West timetable: Yamatoji Rapid continues between Osaka Loop and Kansai Main at Tennoji", confidence: "HIGH" } },
  { lineA: "KansaiMain", lineB: "Nara", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy edge at Kizu conflates Kansai Main/Yamatoji operation with Nara Line; no direct migration without train-path evidence", confidence: "LOW" } },
  { lineA: "Gakkentoshi", lineB: "OsakaHigashi", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy edge at Kyobashi-Osaka requires path verification; not migrated as direct through", confidence: "LOW" } },
  { lineA: "ChuoRapid", lineB: "Chuo", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Takao"], evidence: { source: "adjacent operational boundary at Takao; legacy direct edge retained as local adjacency", confidence: "HIGH" } },
  { lineA: "Chuo", lineB: "ChuoTatsuno", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Okaya"], evidence: { source: "Tatsuno route is a branch/alternate section of Chuo Main, not an independent through operator boundary", confidence: "HIGH" } },
  { lineA: "Chuo", lineB: "Shinonoi", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Shiojiri"], evidence: { source: "adjacent Chuo Main/Shinonoi operation boundary at Shiojiri", confidence: "HIGH" } },
  { lineA: "Shinonoi", lineB: "Shinetsu", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Shinonoi"], evidence: { source: "adjacent Shinonoi/Shinetsu operation boundary at Shinonoi", confidence: "HIGH" } },
  { lineA: "Ome", lineB: "Itsukaichi", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Haijima"], evidence: { source: "JR East route/timetable path: Itsukaichi services enter Ome Line at Haijima", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "UtsunomiyaJR", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Ueno", "Tokyo"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Utsunomiya Line services continue through Ueno-Tokyo corridor", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "Takasaki", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Ueno", "Tokyo"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Takasaki Line services continue through Ueno-Tokyo corridor", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "Joban", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Ueno", "Tokyo", "Shinagawa"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Joban services continue via Tokyo to Shinagawa", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "Tokaido", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Tokyo"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Utsunomiya and Takasaki services continue onto Tokaido Line", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "UtsunomiyaJR", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Omiya", "Akabane", "Ikebukuro", "Shinjuku"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line service corridor", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "Takasaki", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Omiya", "Akabane", "Ikebukuro", "Shinjuku"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line service corridor", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "Yokosuka", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Osaki", "Musashi-Kosugi", "Yokohama", "Totsuka"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line: Utsunomiya-Yokosuka service path", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "Tokaido", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Osaki", "Musashi-Kosugi", "Yokohama", "Totsuka"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line: Takasaki-Tokaido service path", confidence: "HIGH" } },
  { lineA: "Yokosuka", lineB: "SobuRapid", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Tokyo"], displayGroup: "横須賀線・総武線快速", evidence: { source: "JR East Tokyo-area passenger map and JO station numbering define Yokosuka Line / Sobu Line Rapid as one passenger service corridor", confidence: "HIGH" } },
  { lineA: "Tokaido", lineB: "Ito", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Atami"], evidence: { source: "continuous Tokaido/Ito operation through Atami", confidence: "HIGH" } },
  { lineA: "Asakusa", lineB: "Keisei", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy shortcut skips Keisei Oshiage Line; direct adjacency is Asakusa <-> KeiseiOshiage at Oshiage", confidence: "HIGH" } },
  { lineA: "Hanzomon", lineB: "TobuIsesaki", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy shortcut duplicates path via TobuSkytree; do not infer direct adjacency", confidence: "HIGH" } },
  { lineA: "Hibiya", lineB: "TobuIsesaki", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy shortcut duplicates path via TobuSkytree; do not infer direct adjacency", confidence: "HIGH" } },
  { lineA: "SotetsuMain", lineB: "TokyuToyoko", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy shortcut skips Sotetsu/Tokyu Shin-Yokohama lines; do not infer direct adjacency", confidence: "HIGH" } },
  { lineA: "Keikyu", lineB: "KeikyuAirport", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Keikyu-Kamata"], evidence: { source: "legacy through map reclassified as same-operator branch", confidence: "HIGH" } },
  { lineA: "Keikyu", lineB: "KeikyuKurihama", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Horinouchi"], evidence: { source: "legacy through map reclassified as same-operator branch", confidence: "HIGH" } },
  { lineA: "Keikyu", lineB: "KeikyuZushi", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Kanazawa-Hakkei"], evidence: { source: "legacy through map reclassified as same-operator branch", confidence: "HIGH" } },
  { lineA: "SotetsuMain", lineB: "SotetsuIzumino", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Futamatagawa"], evidence: { source: "legacy through map reclassified as same-operator branch", confidence: "HIGH" } },
  { lineA: "SotetsuMain", lineB: "SotetsuShinYokohama", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Nishiya"], evidence: { source: "legacy through map reclassified as same-operator branch", confidence: "HIGH" } },
  { lineA: "Chiyoda", lineB: "OdakyuTama", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Yoyogi-Uehara"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "Tozai", lineB: "ChuoSobuLocal", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Nakano"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "Yurakucho", lineB: "Tojo", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Wakoshi"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "Yurakucho", lineB: "SeibuYurakucho", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kotake-Mukaihara"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "TokyuMeguro", lineB: "SotetsuShinYokohama", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy map skips missing Tokyu Shin-Yokohama Line entity; do not infer direct adjacency", confidence: "LOW" } },
  { lineA: "Keiyo", lineB: "Uchibo", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Soga"], evidence: { source: "JR East timetable/route network + legacy join station", confidence: "HIGH" } },
  { lineA: "Keiyo", lineB: "Sotobo", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Soga"], evidence: { source: "JR East timetable/route network + legacy join station", confidence: "HIGH" } },
  { lineA: "Keiyo", lineB: "Musashino", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Nishi-Funabashi"], displayAnchors: { "Musashino": ["Nishi-Funabashi"], "Keiyo": ["Ichikawa-Shiohama", "Minami-Funabashi"] }, evidence: { source: "ThroughService direct relation; Musashino joins Keiyo operation at Nishi-Funabashi", confidence: "HIGH" } },
  { lineA: "Rinkai", lineB: "Saikyo", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Osaki"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Hanzomon", lineB: "TokyuDenEnToshi", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Shibuya"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Hanzomon", lineB: "TobuSkytree", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Oshiage"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Hibiya", lineB: "TobuSkytree", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kita-Senju"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Chiyoda", lineB: "JobanLocal", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Ayase"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Chiyoda", lineB: "Odawara", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Yoyogi-Uehara"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Fukutoshin", lineB: "TokyuToyoko", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Shibuya"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Fukutoshin", lineB: "Tojo", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Wakoshi"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Fukutoshin", lineB: "SeibuYurakucho", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kotake-Mukaihara"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "TokyuToyoko", lineB: "MinatoMirai", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Yokohama"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Namboku", lineB: "TokyuMeguro", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Meguro"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Mita", lineB: "TokyuMeguro", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Meguro"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Asakusa", lineB: "Keikyu", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Sengakuji"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Asakusa", lineB: "KeiseiOshiage", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Oshiage"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Shinjuku", lineB: "KeioMain", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Shinjuku"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Saikyo", lineB: "Kawagoe", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Omiya"], evidence: { source: "LOS JA stationLines shared 1", confidence: "HIGH" } },
  { lineA: "Kawagoe", lineB: "KawagoeWest", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kawagoe"], evidence: { source: "川越線運転系統 川越駅以東/以西 直通", confidence: "HIGH" } },
  { lineA: "SeibuIkebukuro", lineB: "Ikebukuro", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "LOS SI stationLines shared 18 subset", confidence: "HIGH" } },
  { lineA: "Marunouchi", lineB: "MarunouchiBranch", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Nakano-Sakaue"], evidence: { source: "stationLines shared 1 (Nakano-Sakaue)", confidence: "HIGH" } },
  { lineA: "Ikebukuro", lineB: "SeibuToshima", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Nerima"], evidence: { source: "LOS SI stationLines shared 1", confidence: "MEDIUM" } },
  { lineA: "KeikyuMain", lineB: "Sakuragi", relation: "ALIAS_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "stationLines identical sets 7", confidence: "HIGH" } },
  { lineA: "Agatsuma", lineB: "Takasaki", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Takasaki"], evidence: { source: "branchOf stationLines shared 1", confidence: "HIGH" } },
  { lineA: "SuigunBranch", lineB: "Suigun", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [""], evidence: { source: "branchOf stationLines shared 1", confidence: "HIGH" } },
  { lineA: "Ome", lineB: "ChuoRapid", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Tachikawa"], evidence: { source: "JR East timetable shows continuous Ome-Tokyo trains across Tachikawa", confidence: "HIGH" } },
  { lineA: "Itsukaichi", lineB: "ChuoRapid", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy shortcut skips Ome Line between Tachikawa and Haijima; direct adjacency is invalid", confidence: "HIGH" } },
  { lineA: "ChuoKonosu", lineB: "ChuoRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "Sotobo", lineB: "SobuRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "Uchibo", lineB: "SobuRapid", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "branchOf only shared 0 data gap", confidence: "LOW" } },
  { lineA: "TobuIsesaki", lineB: "TobuNikko", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Tobu-Dobutsu-Koen"], evidence: { source: "Tobu Railway network/timetable: direct trains continue from the Skytree/Isesaki corridor onto the Nikko Line at Tobu-Dobutsu-Koen", confidence: "HIGH" } },
  { lineA: "Keisei", lineB: "KeiseiOshiage", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Aoto"], evidence: { source: "Keisei Oshiage Line branches from the Keisei Main Line at Aoto; not a separate inter-line through boundary", confidence: "HIGH" } },
  { lineA: "Keisei", lineB: "NaritaSkyAccess", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Keisei-Takasago"], evidence: { source: "legacy boundary at Keisei-Takasago represents network/path connection; service-specific running chain must come from train evidence", confidence: "MEDIUM" } },
  { lineA: "TokyuDenEnToshi", lineB: "TokyuOimachi", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Futako-Tamagawa"], evidence: { source: "shared/connected Tokyu corridor at Futako-Tamagawa; do not globally merge train identity", confidence: "HIGH" } },
  { lineA: "OdakyuTama", lineB: "Odawara", relation: "BRANCH_OF", direction: "BIDIRECTIONAL", handoverStations: ["Shin-Yurigaoka"], evidence: { source: "Odakyu Tama Line branches from the Odawara Line at Shin-Yurigaoka", confidence: "HIGH" } },
  { lineA: "KagoshimaMain", lineB: "NagasakiMain", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Tosu"], evidence: { source: "JR Kyushu route/timetable services continue between Hakata/Kagoshima Main corridor and Nagasaki Main at Tosu", confidence: "HIGH" } },
  { lineA: "KagoshimaMain", lineB: "Nippo", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kokura"], evidence: { source: "JR Kyushu timetable: Sonic and other services run from Hakata/Kagoshima Main corridor onto Nippo Main via Kokura", confidence: "HIGH" } },
  { lineA: "TobuNikko", lineB: "Kinugawa", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "LOS TN 0 shared different sets", confidence: "UNKNOWN" } },
  { lineA: "Asakusa", lineB: "TobuSkytree", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy edge conflates Toei Asakusa with Tobu Asakusa/Skytree naming; no direct rail handover between these entities", confidence: "HIGH" } },
  { lineA: "TobuSkytree", lineB: "TobuIsesaki", relation: "ALIAS_OF", direction: "BIDIRECTIONAL", handoverStations: ["Tobu-Dobutsu-Koen"], evidence: { source: "Tobu states Skytree Line is the nickname/corridor from Asakusa/Oshiage to Tobu-Dobutsu-Koen within the Isesaki system", confidence: "HIGH" } },
  { lineA: "Shinjuku", lineB: "Keio", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "Keio legacy entity is not canonical KeioMain; canonical Toei Shinjuku through relation is Shinjuku <-> KeioMain", confidence: "HIGH" } },
  { lineA: "Ikebukuro", lineB: "SeibuYurakucho", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Nerima"], evidence: { source: "Seibu Yurakucho Line connects Kotake-mukaihara to Nerima and through trains continue onto Seibu Ikebukuro corridor", confidence: "HIGH" } },
  { lineA: "Fukutoshin", lineB: "Ikebukuro", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy shortcut skips Seibu Yurakucho Line between Kotake-mukaihara and Nerima", confidence: "HIGH" } },
  { lineA: "SeibuChichibu", lineB: "SeibuYurakucho", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "legacy shortcut skips Seibu Ikebukuro corridor; not adjacent line entities", confidence: "HIGH" } },
  { lineA: "Saikyo", lineB: "SotetsuMain", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "Sotetsu-JR through service runs via Sotetsu Shin-Yokohama/JR connecting route at Hazawa-Yokohama-Kokudai; direct Saikyo-SotetsuMain adjacency is false", confidence: "HIGH" } },
  { lineA: "UtsunomiyaJR", lineB: "Tokaido", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "continuous trains use the Ueno-Tokyo service path; do not encode distant physical lines as a direct boundary", confidence: "HIGH" } },
  { lineA: "Takasaki", lineB: "Tokaido", relation: "UNKNOWN", direction: "UNKNOWN", handoverStations: [], evidence: { source: "continuous trains use the Ueno-Tokyo service path; do not encode distant physical lines as a direct boundary", confidence: "HIGH" } },
  { lineA: "TokaidoKansai", lineB: "SanyoMain", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kobe"], evidence: { source: "JR West continuous Tokaido/Sanyo operation across Kobe", confidence: "HIGH" } },
  { lineA: "SanyoMain", lineB: "KagoshimaMain", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Moji"], evidence: { source: "adjacent Sanyo/Kagoshima Main boundary at Moji with continuous services", confidence: "HIGH" } },
  { lineA: "KagoshimaMain", lineB: "Hohi", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kumamoto"], evidence: { source: "adjacent JR Kyushu service boundary at Kumamoto; through services continue onto Hohi", confidence: "HIGH" } },
  { lineA: "Nippo", lineB: "Kyudai", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Oita"], evidence: { source: "adjacent JR Kyushu service boundary at Oita; through services continue onto Kyudai", confidence: "HIGH" } },
  { lineA: "Nippo", lineB: "Hohi", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Oita"], evidence: { source: "adjacent JR Kyushu service boundary at Oita; through services continue onto Hohi", confidence: "HIGH" } },
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