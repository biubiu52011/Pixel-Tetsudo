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
 *
 * THROUGH_JOIN_STATIONS (industry-standard 接続駅):
 *   A -> { B: [s1, s2] } means the A<->B through run joins at station s1/s2.
 *   This gates the through-service marker on line maps: a partner line only gets
 *   the ∧/∨/< marker at its actual join station, never at every shared station.
 *   Semantics of the value:
 *     undefined entry  -> not defined (fall back to all shared stations)
 *     null             -> same as undefined (fall back)
 *     []               -> defined but NO join station (marker suppressed)
 *     [s1, s2]         -> marker only at these stations
 */
(function() {
  "use strict";

  var THROUGH_SERVICE_MAP = {
    // 東武スカイツリーライン・伊勢崎線（東武動物公園で相互直通）
    "TobuSkytree": ["Hibiya", "Hanzomon", "Asakusa", "TobuIsesaki"],
    "TobuIsesaki": ["Hibiya", "Hanzomon", "TobuSkytree"],
    // 東京メトロ
    "Hibiya": ["TobuSkytree", "TobuIsesaki"],
    "Hanzomon": ["TobuSkytree", "TobuIsesaki", "TokyuDenEn"],
    "Namboku": ["TokyuMeguro"],
    "Chiyoda": ["JobanLocal", "OdakyuTama", "Odawara"],
    "Tozai": ["ChuoSobuLocal"],
    "Yurakucho": ["Tojo"],
    "Fukutoshin": ["TokyuToyoko", "Tojo", "Yurakucho_Seibu"],
    "Mita": ["TokyuMeguro"],
    "Asakusa": ["Keikyu", "Keisei", "KeiseiOshiage", "TobuSkytree"],
    "Shinjuku": ["Keio", "KeioMain"],
    // 東急
    "TokyuToyoko": ["MinatoMirai", "Fukutoshin"],
    "MinatoMirai": ["TokyuToyoko"],
    "TokyuMeguro": ["Mita", "Namboku"],
    "TokyuDenEn": ["Hanzomon"],
    // 西武有楽町線（小竹向原-練馬）— the through path to 西武池袋線 runs via this line
    "Yurakucho_Seibu": ["Fukutoshin", "Ikebukuro"],
    // 西武池袋線（データ線ではない——BFS 中継のみ、表示対象外）
    "Ikebukuro": ["Yurakucho_Seibu"],
    // 東武東上線
    "Tojo": ["Fukutoshin", "Yurakucho"],
    // 京成・京急
    "Keikyu": ["Asakusa"],
    "Keisei": ["Asakusa", "KeiseiOshiage", "NaritaSkyAccess"],
    "KeiseiOshiage": ["Asakusa", "Keisei"],
    "NaritaSkyAccess": ["Keisei"],
    // 相鉄
    "SotetsuMain": ["Saikyo", "TokyuToyoko", "SotetsuIzumino", "SotetsuShin-Yokohama"],
    "SotetsuIzumino": ["SotetsuMain"],
    "SotetsuShin-Yokohama": ["SotetsuMain"],
    // JR
    "Saikyo": ["Kawagoe", "Rinkai", "SotetsuMain"],
    "Kawagoe": ["Saikyo", "KawagoeWest"],
    "KawagoeWest": ["Kawagoe", "Hachiko"],
    "Rinkai": ["Saikyo"],
    "UtsunomiyaJR": ["ShonanShinjuku", "Tokaido"],
    "Takasaki": ["ShonanShinjuku", "Tokaido"],
    "Tokaido": ["UtsunomiyaJR", "Takasaki", "Ito"],
    "Ito": ["Tokaido"],
    "ShonanShinjuku": ["UtsunomiyaJR", "Takasaki", "Yokosuka"],
    "ChuoRapid": ["Ome", "Itsukaichi", "ChuoMain"],
    "ChuoMain": ["ChuoRapid"],
    "SobuRapid": ["Yokosuka"],
    "Yokosuka": ["SobuRapid", "ShonanShinjuku"],
    "JobanLocal": ["Chiyoda"],
    "Joban": ["Narita"],
    "Narita": ["Joban"],
    "Keiyo": ["Uchibo", "Sotobo", "Musashino"],
    "Musashino": ["Keiyo"],
    "Uchibo": ["Keiyo"],
    "Sotobo": ["Keiyo"],
    "Hachiko": ["KawagoeWest"],
    "OdakyuTama": ["Chiyoda", "Odawara"],
    "Odawara": ["Chiyoda", "OdakyuTama"],
    "ChuoSobuLocal": ["Tozai"]
  };

  // 接続駅（線路図の直通マーカーを実際の接続駅のみに限定）
  var THROUGH_JOIN_STATIONS = {
    // 埼京
    "Saikyo": { "Kawagoe": ["Omiya"], "Rinkai": ["Osaki"], "SotetsuMain": [] },
    "Kawagoe": { "Saikyo": ["Omiya"], "KawagoeWest": ["Kawagoe"] },
    "Rinkai": { "Saikyo": ["Osaki"] },
    // 副都心・有楽町・西武・東上・東横
    "Fukutoshin": { "Tojo": ["Wakoshi"], "TokyuToyoko": ["Shibuya"], "Yurakucho_Seibu": ["Kotake-Mukaihara"] },
    "Yurakucho": { "Tojo": ["Wakoshi"], "Yurakucho_Seibu": ["Kotake-Mukaihara"] },
    "Yurakucho_Seibu": { "Fukutoshin": ["Kotake-Mukaihara"], "Yurakucho": ["Kotake-Mukaihara"] },
    "Tojo": { "Fukutoshin": ["Wakoshi"], "Yurakucho": ["Wakoshi"] },
    "TokyuToyoko": { "Fukutoshin": ["Shibuya"], "MinatoMirai": ["Yokohama"] },
    "MinatoMirai": { "TokyuToyoko": ["Yokohama"] },
    // 半蔵門・日比谷・東武
    "Hanzomon": { "TobuSkytree": ["Oshiage"], "TobuIsesaki": ["Oshiage"], "TokyuDenEn": ["Shibuya"] },
    // 東武スカイツリー・伊勢崎（東武動物公園）
    "TobuSkytree": { "Hanzomon": ["Oshiage"], "Hibiya": ["Kita-Senju"], "Asakusa": ["Oshiage"], "TobuIsesaki": ["Tobu-Dobutsu-Koen"] },
    "TobuIsesaki": { "Hibiya": ["Kita-Senju"], "Hanzomon": ["Oshiage"], "TobuSkytree": ["Tobu-Dobutsu-Koen"] },
    "Hibiya": { "TobuSkytree": ["Kita-Senju"], "TobuIsesaki": ["Kita-Senju"] },
    // 浅草・京成・京急
    "Asakusa": { "Keikyu": ["Sengakuji"], "Keisei": ["Oshiage"], "KeiseiOshiage": ["Oshiage"], "TobuSkytree": ["Oshiage"] },
    "Keikyu": { "Asakusa": ["Sengakuji"] },
    "Keisei": { "Asakusa": ["Oshiage"], "KeiseiOshiage": ["Aoto"], "NaritaSkyAccess": ["Keisei-Takasago"] },
    "KeiseiOshiage": { "Asakusa": ["Oshiage"], "Keisei": ["Aoto"] },
    "NaritaSkyAccess": { "Keisei": ["Keisei-Takasago"] },
    // 千代田
    "Chiyoda": { "JobanLocal": ["Ayase"], "OdakyuTama": ["Yoyogi-Uehara"], "Odawara": ["Yoyogi-Uehara"] },
    "JobanLocal": { "Chiyoda": ["Ayase"] },
    "OdakyuTama": { "Chiyoda": ["Yoyogi-Uehara"], "Odawara": [] },
    "Odawara": { "Chiyoda": ["Yoyogi-Uehara"], "OdakyuTama": ["Shin-Yurigaoka"] },
    // 東西
    "Tozai": { "ChuoSobuLocal": ["Nakano"] },
    "ChuoSobuLocal": { "Tozai": ["Nakano"] },
    // 新宿線×京王（京王線はデータにないため表示されない）
    "Shinjuku": { "Keio": ["Shinjuku"], "KeioMain": ["Shinjuku"] },
    // 湘南新宿ライン
    "ShonanShinjuku": { "UtsunomiyaJR": ["Omiya"], "Takasaki": ["Omiya"], "Yokosuka": ["Ofuna"] },
    "Takasaki": { "ShonanShinjuku": ["Omiya"] },
    "Yokosuka": { "ShonanShinjuku": ["Ofuna"], "SobuRapid": ["Tokyo"] },
    "UtsunomiyaJR": { "ShonanShinjuku": ["Omiya"], "Tokaido": ["Tokyo"] },
    "Takasaki": { "ShonanShinjuku": ["Omiya"], "Tokaido": ["Tokyo"] },
    "Tokaido": { "UtsunomiyaJR": ["Tokyo"], "Takasaki": ["Tokyo"], "Ito": ["Atami"] },
    "Ito": { "Tokaido": ["Atami"] },
    // 中央線
    "ChuoRapid": { "Ome": ["Tachikawa"], "Itsukaichi": ["Haijima"], "ChuoMain": ["Takao"] },
    "ChuoMain": { "ChuoRapid": ["Takao"] },
    "Ome": { "ChuoRapid": ["Tachikawa"] },
    "Itsukaichi": { "ChuoRapid": ["Haijima"] },
    // 総武快速×横須賀
    "SobuRapid": { "Yokosuka": ["Tokyo"] },
    // 京葉
    // 京葉（武蔵野⇄京葉は西船橋で直通するが、京葉線の駅表に西船橋は無い→京葉側マーカー抑制）
    "Keiyo": { "Uchibo": ["Soga"], "Sotobo": ["Soga"], "Musashino": [] },
    "Musashino": { "Keiyo": ["Nishi-Funabashi"] },
    "Uchibo": { "Keiyo": ["Soga"] },
    "Sotobo": { "Keiyo": ["Soga"] },
    // 八高・川越線西（高麗川）
    "Hachiko": { "KawagoeWest": ["Komagawa"] },
    "KawagoeWest": { "Kawagoe": ["Kawagoe"], "Hachiko": ["Komagawa"] },
    // 南北・三田・目黒
    "Namboku": { "TokyuMeguro": ["Meguro"] },
    "Mita": { "TokyuMeguro": ["Meguro"] },
    "TokyuMeguro": { "Mita": ["Meguro"], "Namboku": ["Meguro"] },
    // 相鉄（埼京・東横とはデータ上接続駅なし→マーカー非表示）
    "SotetsuMain": { "Saikyo": [], "TokyuToyoko": [], "SotetsuIzumino": ["Futamatagawa", "Futamatagawa"], "SotetsuShin-Yokohama": ["Nishiya"] },
    "SotetsuIzumino": { "SotetsuMain": ["Futamatagawa", "Futamatagawa"] },
    "SotetsuShin-Yokohama": { "SotetsuMain": ["Nishiya"] }
  };

  /** Direct through-service neighbours of a line (1 hop). */
  function getDirectThroughLines(lineId) {
    try {
      var t = THROUGH_SERVICE_MAP[lineId];
      return (t && Array.isArray(t)) ? t.slice() : [];
    } catch(e) { return []; }
  }

  /** Join stations for a line pair, or null when not defined (fall back to all shared stations). */
  function getJoinStations(lineId, partnerId) {
    try {
      var m = THROUGH_JOIN_STATIONS[lineId];
      if (!m) return null;
      return (m[partnerId] !== undefined) ? m[partnerId] : null;
    } catch(e) { return null; }
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
    getJoinStations: getJoinStations,
    getThroughServiceLines: getThroughServiceLines
  };
})();
