// Line Boundary Relations - Runtime boundary evidence between canonical lines.
// Static through-service membership lives only in railway_data.json line.throughServices.
// This file supplies handover stations and non-through structural relations for realtime resolution.

/* global window */
window.LineServiceRelations = [
  { lineA: "Hachiko", lineB: "KawagoeWest", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Komagawa"], evidence: { source: "JR East Hachiko/Kawagoe continuous operation boundary at Komagawa", confidence: "HIGH" } },
  { lineA: "Joban", lineB: "NaritaAbikoBranch", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Abiko"], evidence: { source: "JR East Tokyo-area passenger map: 常磐線快速・成田線 through service via Abiko", confidence: "HIGH" } },
  { lineA: "OsakaLoop", lineB: "Hanwa", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Tennoji"], evidence: { source: "JR West timetable: Kanku/Kishu Rapid continues between Osaka Loop and Hanwa at Tennoji", confidence: "HIGH" } },
  { lineA: "OsakaLoop", lineB: "KansaiMain", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Tennoji"], evidence: { source: "JR West timetable: Yamatoji Rapid continues between Osaka Loop and Kansai Main at Tennoji", confidence: "HIGH" } },
  { lineA: "ChuoRapid", lineB: "ChuoMain", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Takao"], evidence: { source: "adjacent operational boundary at Takao; legacy direct edge retained as local adjacency", confidence: "HIGH" } },
  { lineA: "ChuoMain", lineB: "Shinonoi", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Shiojiri"], evidence: { source: "adjacent Chuo Main/Shinonoi operation boundary at Shiojiri", confidence: "HIGH" } },
  { lineA: "Shinonoi", lineB: "Shinetsu", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Shinonoi"], evidence: { source: "adjacent Shinonoi/Shinetsu operation boundary at Shinonoi", confidence: "HIGH" } },
  { lineA: "Ome", lineB: "Itsukaichi", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Haijima"], evidence: { source: "JR East route/timetable path: Itsukaichi services enter Ome Line at Haijima", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "UtsunomiyaJR", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Ueno", "Tokyo"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Utsunomiya Line services continue through Ueno-Tokyo corridor", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "Takasaki", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Ueno", "Tokyo"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Takasaki Line services continue through Ueno-Tokyo corridor", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "Joban", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Ueno", "Tokyo", "Shinagawa"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Joban services continue via Tokyo to Shinagawa", confidence: "HIGH" } },
  { lineA: "UenoTokyo", lineB: "Tokaido", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Tokyo"], evidence: { source: "JR East passenger service map / Ueno-Tokyo Line: Utsunomiya and Takasaki services continue onto Tokaido Line", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "UtsunomiyaJR", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Omiya", "Akabane", "Ikebukuro", "Shinjuku"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line service corridor", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "Takasaki", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Omiya", "Akabane", "Ikebukuro", "Shinjuku"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line service corridor", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "Yokosuka", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Osaki", "Musashi-Kosugi", "Yokohama", "Totsuka"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line: Utsunomiya-Yokosuka service path", confidence: "HIGH" } },
  { lineA: "ShonanShinjuku", lineB: "Tokaido", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Osaki", "Musashi-Kosugi", "Yokohama", "Totsuka"], evidence: { source: "JR East passenger service map / Shonan-Shinjuku Line: Takasaki-Tokaido service path", confidence: "HIGH" } },
  { lineA: "Yokosuka", lineB: "SobuRapid", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Tokyo"], displayGroup: "横須賀線・総武線快速", evidence: { source: "JR East Tokyo-area passenger map and JO station numbering define Yokosuka Line / Sobu Line Rapid as one passenger service corridor", confidence: "HIGH" } },
  { lineA: "Tokaido", lineB: "Ito", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Atami"], evidence: { source: "continuous Tokaido/Ito operation through Atami", confidence: "HIGH" } },
  { lineA: "Chiyoda", lineB: "OdakyuTama", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Yoyogi-Uehara"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "Tozai", lineB: "ChuoSobuLocal", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Nakano"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "Yurakucho", lineB: "Tojo", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Wakoshi"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "Yurakucho", lineB: "Yurakucho_Seibu", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Kotake-Mukaihara"], evidence: { source: "Tokyo Metro through-service network + legacy join station", confidence: "HIGH" } },
  { lineA: "Keiyo", lineB: "Uchibo", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Soga"], evidence: { source: "JR East timetable/route network + legacy join station", confidence: "HIGH" } },
  { lineA: "Keiyo", lineB: "Sotobo", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Soga"], evidence: { source: "JR East timetable/route network + legacy join station", confidence: "HIGH" } },
  { lineA: "Keiyo", lineB: "Musashino", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Nishi-Funabashi"], displayAnchors: { "Musashino": ["Nishi-Funabashi"], "Keiyo": ["Ichikawa-Shiohama", "Minami-Funabashi"] }, evidence: { source: "ThroughService direct relation; Musashino joins Keiyo operation at Nishi-Funabashi", confidence: "HIGH" } },
  { lineA: "Rinkai", lineB: "Saikyo", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Osaki"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Hanzomon", lineB: "TokyuDenEn", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Shibuya"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Hanzomon", lineB: "TobuSkytree", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Oshiage"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Hibiya", lineB: "TobuSkytree", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Kita-Senju"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Chiyoda", lineB: "JobanLocal", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Ayase"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Chiyoda", lineB: "Odawara", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Yoyogi-Uehara"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Fukutoshin", lineB: "TokyuToyoko", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Shibuya"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Fukutoshin", lineB: "Tojo", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Wakoshi"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Fukutoshin", lineB: "Yurakucho_Seibu", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Kotake-Mukaihara"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "TokyuToyoko", lineB: "MinatoMirai", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Yokohama"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Namboku", lineB: "TokyuMeguro", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Meguro"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Mita", lineB: "TokyuMeguro", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Meguro"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Asakusa", lineB: "Keikyu", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Sengakuji"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Asakusa", lineB: "KeiseiOshiage", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Oshiage"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Shinjuku", lineB: "KeioMain", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Shinjuku"], evidence: { source: "ThroughService direct relation + join station", confidence: "HIGH" } },
  { lineA: "Saikyo", lineB: "Kawagoe", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Omiya"], evidence: { source: "LOS JA stationLines shared 1", confidence: "HIGH" } },
  { lineA: "Kawagoe", lineB: "KawagoeWest", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Kawagoe"], evidence: { source: "川越線運転系統 川越駅以東/以西 直通", confidence: "HIGH" } },
  { lineA: "Ome", lineB: "ChuoRapid", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Tachikawa"], evidence: { source: "JR East timetable shows continuous Ome-Tokyo trains across Tachikawa", confidence: "HIGH" } },
  { lineA: "TobuIsesaki", lineB: "TobuNikko", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Tobu-Dobutsu-Koen"], evidence: { source: "Tobu Railway network/timetable: direct trains continue from the Skytree/Isesaki corridor onto the Nikko Line at Tobu-Dobutsu-Koen", confidence: "HIGH" } },
  { lineA: "KagoshimaMain", lineB: "NagasakiMain", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Tosu"], evidence: { source: "JR Kyushu route/timetable services continue between Hakata/Kagoshima Main corridor and Nagasaki Main at Tosu", confidence: "HIGH" } },
  { lineA: "KagoshimaMain", lineB: "Nippo", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Kokura"], evidence: { source: "JR Kyushu timetable: Sonic and other services run from Hakata/Kagoshima Main corridor onto Nippo Main via Kokura", confidence: "HIGH" } },
  { lineA: "Ikebukuro", lineB: "Yurakucho_Seibu", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Nerima"], evidence: { source: "Seibu Yurakucho Line connects Kotake-mukaihara to Nerima and through trains continue onto Seibu Ikebukuro corridor", confidence: "HIGH" } },
  { lineA: "TokaidoKansai", lineB: "SanyoMain", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Kobe"], evidence: { source: "JR West continuous Tokaido/Sanyo operation across Kobe", confidence: "HIGH" } },
  { lineA: "SanyoMain", lineB: "KagoshimaMain", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Moji"], evidence: { source: "adjacent Sanyo/Kagoshima Main boundary at Moji with continuous services", confidence: "HIGH" } },
  { lineA: "KagoshimaMain", lineB: "Hohi", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Kumamoto"], evidence: { source: "adjacent JR Kyushu service boundary at Kumamoto; through services continue onto Hohi", confidence: "HIGH" } },
  { lineA: "Nippo", lineB: "Kyudai", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Oita"], evidence: { source: "adjacent JR Kyushu service boundary at Oita; through services continue onto Kyudai", confidence: "HIGH" } },
  { lineA: "Nippo", lineB: "Hohi", relation: "SERVICE_BOUNDARY", direction: "BIDIRECTIONAL", handoverStations: ["Oita"], evidence: { source: "adjacent JR Kyushu service boundary at Oita; through services continue onto Hohi", confidence: "HIGH" } },
];

(function() {
  "use strict";
  var L = window.LineServiceRelations || [];
  L.getRelatedLines = function(lid) {
    if (!lid) return [];
    return L.filter(function(r) { return r.lineA === lid || r.lineB === lid; });
  };
  L.getBoundary = function(a, b) {
    if (!a || !b) return null;
    for (var i = 0; i < L.length; i++) {
      var r = L[i];
      if ((r.lineA === a && r.lineB === b) || (r.lineA === b && r.lineB === a)) return r;
    }
    return null;
  };
})();