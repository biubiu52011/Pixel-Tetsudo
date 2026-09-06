/*
 * Transfer Station Hints Database
 * 换乘站提示数据库
 * 
 * 记录站外换乘和换乘站名不一致的情况
 * type: "outside" = 站外换乘, "name_mismatch" = 站名不一致
 * note: 具体说明文字（多语言）
 */

window.TRANSFER_HINTS = {
  // 站名不一致的换乘站
  "Akasaka-Mitsuke": {
    type: "name_mismatch",
    note: {
      ja: "（永田町駅連絡）",
      zh: "（连络永田町站）",
      en: "(Connects to Nagatacho)",
      ko: "（나가타초역 연결）"
    },
    connects: ["Nagatacho"]
  },
  "Nagatacho": {
    type: "name_mismatch",
    note: {
      ja: "（赤坂見附駅連絡）",
      zh: "（连络赤坂见附站）",
      en: "(Connects to Akasaka-Mitsuke)",
      ko: "（아카사카미츠케역 연결）"
    },
    connects: ["Akasaka-Mitsuke"]
  },
  "Omotesando": {
    type: "name_mismatch",
    note: {
      ja: "（明治神宮前駅連絡・要出站）",
      zh: "（连络明治神宫前站・需出站）",
      en: "(Connects to Meiji-Jingumae, outside transfer)",
      ko: "（메이지진구마에역 연결・역외 환승）"
    },
    connects: ["Meiji-Jingumae"],
    outside: true
  },
  "Meiji-Jingumae": {
    type: "name_mismatch",
    note: {
      ja: "（表参道駅連絡・要出站）",
      zh: "（连络表参道站・需出站）",
      en: "(Connects to Omotesando, outside transfer)",
      ko: "（오모테산도역 연결・역외 환승）"
    },
    connects: ["Omotesando"],
    outside: true
  },
  "Nishi-Shinjuku": {
    type: "name_mismatch",
    note: {
      ja: "（新宿西口駅連絡・要出站）",
      zh: "（连络新宿西口站・需出站）",
      en: "(Connects to Shinjuku-Nishiguchi, outside transfer)",
      ko: "（신주쿠니시구치역 연결・역외 환승）"
    },
    connects: ["Shinjuku-Nishiguchi"],
    outside: true
  },
  "Shinjuku-Nishiguchi": {
    type: "name_mismatch",
    note: {
      ja: "（西新宿駅連絡・要出站）",
      zh: "（连络西新宿站・需出站）",
      en: "(Connects to Nishi-Shinjuku, outside transfer)",
      ko: "（니시신주쿠역 연결・역외 환승）"
    },
    connects: ["Nishi-Shinjuku"],
    outside: true
  },
  "Tochomae": {
    type: "name_mismatch",
    note: {
      ja: "（新宿三丁目駅連絡・要出站）",
      zh: "（连络新宿三丁目站・需出站）",
      en: "(Connects to Shinjuku-Sanchome, outside transfer)",
      ko: "（신주쿠산초메역 연결・역외 환승）"
    },
    connects: ["Shinjuku-Sanchome"],
    outside: true
  },
  "Shinjuku-Sanchome": {
    type: "name_mismatch",
    note: {
      ja: "（都庁前駅連絡・要出站）",
      zh: "（连络都厅前站・需出站）",
      en: "(Connects to Tochomae, outside transfer)",
      ko: "（토쵸마에역 연결・역외 환승）"
    },
    connects: ["Tochomae"],
    outside: true
  },
  "Kodemmacho": {
    type: "name_mismatch",
    note: {
      ja: "（人形町駅連絡・要出站）",
      zh: "（连络人形町站・需出站）",
      en: "(Connects to Ningyocho, outside transfer)",
      ko: "（닝교초역 연결・역외 환승）"
    },
    connects: ["Ningyocho"],
    outside: true
  },
  "Ningyocho": {
    type: "name_mismatch",
    note: {
      ja: "（小伝馬町駅連絡・要出站）",
      zh: "（连络小传马町站・需出站）",
      en: "(Connects to Kodemmacho, outside transfer)",
      ko: "（코덴마초역 연결・역외 환승）"
    },
    connects: ["Kodemmacho"],
    outside: true
  },
  
  // 站外换乘（站名一致但需要出站）
  "Ueno": {
    type: "outside",
    note: {
      ja: "（JR・地下鉄連絡、一部要出站）",
      zh: "（JR・地铁连络，部分需出站）",
      en: "(JR/Subway connection, some outside transfer)",
      ko: "（JR・지하철 연결, 일부 역외 환승）"
    }
  },
  "Shinjuku": {
    type: "outside",
    note: {
      ja: "（JR・私鉄・地下鉄連絡、一部要出站）",
      zh: "（JR・私铁・地铁连络，部分需出站）",
      en: "(JR/Private/Subway connection, some outside transfer)",
      ko: "（JR・사철・지하철 연결, 일부 역외 환승）"
    }
  },
  "Shibuya": {
    type: "outside",
    note: {
      ja: "（JR・私鉄・地下鉄連絡、一部要出站）",
      zh: "（JR・私铁・地铁连络，部分需出站）",
      en: "(JR/Private/Subway connection, some outside transfer)",
      ko: "（JR・사철・지하철 연결, 일부 역외 환승）"
    }
  },
  "Ikebukuro": {
    type: "outside",
    note: {
      ja: "（JR・私鉄・地下鉄連絡、一部要出站）",
      zh: "（JR・私铁・地铁连络，部分需出站）",
      en: "(JR/Private/Subway connection, some outside transfer)",
      ko: "（JR・사철・지하철 연결, 일부 역외 환승）"
    }
  },
  
  // 特殊换乘说明
  "Hamamatsucho": {
    type: "outside",
    note: {
      ja: "（東京モノレール連絡・要出站）",
      zh: "（连络东京单轨・需出站）",
      en: "(Connects to Tokyo Monorail, outside transfer)",
      ko: "（도쿄 모노레일 연결・역외 환승）"
    }
  },
  "Shinagawa": {
    type: "outside",
    note: {
      ja: "（京急連絡・要出站）",
      zh: "（连络京急・需出站）",
      en: "(Connects to Keikyu, outside transfer)",
      ko: "（케이큐 연결・역외 환승）"
    }
  },
  "Osaki": {
    type: "outside",
    note: {
      ja: "（りんかい線連絡・要出站）",
      zh: "（连络临海线・需出站）",
      en: "(Connects to Rinkai Line, outside transfer)",
      ko: "（린카이선 연결・역외 환승）"
    }
  },
  "Shibuya": {
    type: "outside",
    note: {
      ja: "（みなとみらい線・副都心線連絡）",
      zh: "（连络港未来线・副都心线）",
      en: "(Connects to Minatomirai/Fukutoshin)",
      ko: "（미나토미라이선・후쿠토신선 연결）"
    }
  }
};

// 获取换乘提示
window.getTransferHint = function(stationId, lang) {
  if (!window.TRANSFER_HINTS || !window.TRANSFER_HINTS[stationId]) return null;
  var hint = window.TRANSFER_HINTS[stationId];
  var l = lang || "ja";
  if (hint.note && hint.note[l]) return hint.note[l];
  if (hint.note && hint.note.ja) return hint.note.ja;
  return null;
};
