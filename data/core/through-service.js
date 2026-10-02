/*
 * Pixel Tetsudo - Through Service (直通運転) Provider
 *
 * Single source of truth for through-service (相互直通運転) relationships.
 * Provider: ThroughService
 * Consumers: DataFusion (timetable expansion), RouteSearch (transfer penalty), TrainsPage (display)
 *
 */
(function() {
  "use strict";



  // 接続駅（線路図の直通マーカーを実際の接続駅のみに限定）
  var THROUGH_JOIN_STATIONS = {
    // 埼京
    "Saikyo": { "Kawagoe": ["Omiya"], "Rinkai": ["Osaki"], "SotetsuMain": [] },
    "Kawagoe": { "Saikyo": ["Omiya"], "KawagoeWest": ["Kawagoe"] },
    "Rinkai": { "Saikyo": ["Osaki"] },
    // 副都心・有楽町・西武・東上・東横
    "Fukutoshin": { "Tojo": ["Wakoshi"], "TokyuToyoko": ["Shibuya"], "SeibuYurakucho": ["Kotake-Mukaihara"] },
    "Yurakucho": { "Tojo": ["Wakoshi"], "SeibuYurakucho": ["Kotake-Mukaihara"] },
    "SeibuYurakucho": { "Fukutoshin": ["Kotake-Mukaihara"], "Yurakucho": ["Kotake-Mukaihara"], "SeibuChichibu": [] },
    "Tojo": { "Fukutoshin": ["Wakoshi"], "Yurakucho": ["Wakoshi"] },
    "TokyuToyoko": { "Fukutoshin": ["Shibuya"], "MinatoMirai": ["Yokohama"] },
    "MinatoMirai": { "TokyuToyoko": ["Yokohama"] },
    // 半蔵門・日比谷・東武
    "Hanzomon": { "TobuSkytree": ["Oshiage"], "TobuIsesaki": ["Oshiage"], "TokyuDenEn": ["Shibuya"] },
    // 東武スカイツリー・伊勢崎（東武動物公園）
    "TobuSkytree": { "Hanzomon": ["Oshiage"], "Hibiya": ["Kita-Senju"], "TobuIsesaki": ["Tobu-Dobutsu-Koen"] },
    "TobuIsesaki": { "Hibiya": ["Kita-Senju"], "Hanzomon": ["Oshiage"], "TobuSkytree": ["Tobu-Dobutsu-Koen"], "TobuNikko": ["Tobu-Dobutsu-Koen"] },
    "Hibiya": { "TobuSkytree": ["Kita-Senju"], "TobuIsesaki": ["Kita-Senju"] },
    // 浅草・京成・京急
    "Asakusa": { "Keikyu": ["Sengakuji"], "Keisei": ["Oshiage"], "KeiseiOshiage": ["Oshiage"] },
    "Keikyu": { "Asakusa": ["Sengakuji"], "KeikyuAirport": ["Keikyu-Kamata"], "KeikyuKurihama": ["Horinouchi"], "KeikyuZushi": ["Kanazawa-Hakkei"] },
    "KeikyuAirport": { "Keikyu": ["Keikyu-Kamata"] },
    "KeikyuKurihama": { "Keikyu": ["Horinouchi"] },
    "KeikyuZushi": { "Keikyu": ["Kanazawa-Hakkei"] },
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
    // 上野東京ライン
    "UenoTokyo": { "UtsunomiyaJR": ["Omiya"], "Takasaki": ["Omiya"], "Joban": ["Ueno"], "Tokaido": [] },
    "Takasaki": { "ShonanShinjuku": ["Omiya"], "UenoTokyo": ["Omiya"], "Tokaido": ["Tokyo"] },
    "Yokosuka": { "ShonanShinjuku": ["Ofuna"], "SobuRapid": ["Tokyo"] },
    "UtsunomiyaJR": { "ShonanShinjuku": ["Omiya"], "UenoTokyo": ["Omiya"], "Tokaido": ["Tokyo"] },
    "Joban": { "UenoTokyo": ["Ueno"] },
    "Tokaido": { "UtsunomiyaJR": ["Tokyo"], "Takasaki": ["Tokyo"], "UenoTokyo": ["Tokyo"], "Ito": ["Atami"] },
    "Ito": { "Tokaido": ["Atami"] },
    // 中央線
    "ChuoRapid": { "Ome": ["Tachikawa"], "Itsukaichi": ["Haijima"], "Chuo": ["Takao"] },
    "Chuo": { "ChuoRapid": ["Takao"], "Shinonoi": ["Shiojiri"], "ChuoTatsuno": ["Okaya"] },
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
    "TokyuMeguro": { "Mita": ["Meguro"], "Namboku": ["Meguro"], "SotetsuShinYokohama": [] },
    // 相鉄（埼京・東横とはデータ上接続駅なし→マーカー非表示）
    "SotetsuMain": { "Saikyo": [], "TokyuToyoko": [], "SotetsuIzumino": ["Futamatagawa"], "SotetsuShinYokohama": ["Nishiya"] },
    "SotetsuIzumino": { "SotetsuMain": ["Futamatagawa"] },
        "SotetsuShinYokohama": { "SotetsuMain": ["Nishiya"], "TokyuMeguro": ["Shin-Yokohama"] },
    // 地方線直通・大井町線直通（4.3.644 補完）
    "Gono": { "Ou": ["Kawabe"] },
    "Kamaishi": { "Tohoku": ["Hanamaki"] },
    "Ou": { "Gono": ["Kawabe"], "Tazawako": ["Omagari"] },
    "Tazawako": { "Ou": ["Omagari"] },
    "TokyuOimachi": { "TokyuDenEn": ["Futako-Tamagawa"] },
    "TokyuDenEn": { "TokyuOimachi": ["Futako-Tamagawa"] },
    // 直通 6 組補完 JOIN（4.3.711）
    "TobuNikko": { "TobuIsesaki": ["Tobu-Dobutsu-Koen"] },
    "ChuoTatsuno": { "Chuo": ["Okaya"] },
    "Shinonoi": { "Chuo": ["Shiojiri"], "Shinetsu": ["Shinonoi"] },
    "Shinetsu": { "Shinonoi": ["Shinonoi"] },
    "SeibuChichibu": { "SeibuYurakucho": [] },
    // JR-West 関西・JR-Kyushu 直通接続駅（4.3.1024）
    "OsakaLoop": { "Hanwa": ["Tennoji"], "KansaiMain": ["Tennoji"] },
    "Hanwa": { "OsakaLoop": ["Tennoji"] },
    "KansaiMain": { "OsakaLoop": ["Tennoji"], "Nara": ["Kizu"] },
    "Nara": { "KansaiMain": ["Kizu"] },
    "TokaidoKansai": { "SanyoMain": ["Kobe"] },
    "SanyoMain": { "TokaidoKansai": ["Kobe"], "KagoshimaMain": ["Moji"] },
    "Gakkentoshi": { "OsakaHigashi": ["Kyobashi-Osaka"] },
    "OsakaHigashi": { "Gakkentoshi": ["Kyobashi-Osaka"] },
    "KagoshimaMain": { "SanyoMain": ["Moji"], "NagasakiMain": ["Tosu"], "Nippo": ["Kokura"], "Hohi": ["Kumamoto"] },
    "NagasakiMain": { "KagoshimaMain": ["Tosu"] },
    "Nippo": { "KagoshimaMain": ["Kokura"], "Kyudai": ["Oita"], "Hohi": ["Oita"] },
    "Kyudai": { "Nippo": ["Oita"] },
    "Hohi": { "KagoshimaMain": ["Kumamoto"], "Nippo": ["Oita"] }
  };

  function getCanonicalThroughRelation(lineId, partnerId) {
    var relations = window.LineServiceRelations;
    if (!relations || typeof relations.length !== "number") return null;
    for (var i = 0; i < relations.length; i++) {
      var rel = relations[i];
      if (!rel || rel.relation !== "THROUGH_SERVICE") continue;
      if ((rel.lineA === lineId && rel.lineB === partnerId) ||
          (rel.lineA === partnerId && rel.lineB === lineId)) return rel;
    }
    return null;
  }

  /** Direct canonical through-service neighbours of a line (1 hop). */
  function getDirectThroughLines(lineId) {
    try {
      var out = [];
      var relations = window.LineServiceRelations;
      if (relations && typeof relations.length === "number") {
        for (var i = 0; i < relations.length; i++) {
          var rel = relations[i];
          if (!rel || rel.relation !== "THROUGH_SERVICE") continue;
          var other = rel.lineA === lineId ? rel.lineB : (rel.lineB === lineId ? rel.lineA : null);
          if (other && out.indexOf(other) < 0) out.push(other);
        }
      }
      return out;
    } catch(e) { return []; }
  }

  /** Join stations for a line pair. Canonical handoverStations win when present. */
  function getJoinStations(lineId, partnerId) {
    try {
      var canonical = getCanonicalThroughRelation(lineId, partnerId);
      if (canonical && Array.isArray(canonical.handoverStations)) return canonical.handoverStations.slice();
      var m = THROUGH_JOIN_STATIONS[lineId];
      if (m && m[partnerId] !== undefined) return m[partnerId];
      // Legacy join data was historically populated asymmetrically even though
      // through-service pairs are bidirectional. Mirror the partner lookup so
      // both line views render the same handover marker without duplicating data.
      var reverse = THROUGH_JOIN_STATIONS[partnerId];
      return (reverse && reverse[lineId] !== undefined) ? reverse[lineId] : null;
    } catch(e) { return null; }
  }

  /** UI anchor stations for a through relation.
   * These may differ by side when a connector joins between passenger stations.
   * Physical/service truth remains in handoverStations.
   */
  function getDisplayAnchors(lineId, partnerId) {
    try {
      var canonical = getCanonicalThroughRelation(lineId, partnerId);
      if (canonical && canonical.displayAnchors && Array.isArray(canonical.displayAnchors[lineId])) {
        return canonical.displayAnchors[lineId].slice();
      }
      return getJoinStations(lineId, partnerId);
    } catch(e) { return null; }
  }
  window.ThroughService = {
    getDirectThroughLines: getDirectThroughLines,
    getJoinStations: getJoinStations,
    getDisplayAnchors: getDisplayAnchors,
  };
})();
