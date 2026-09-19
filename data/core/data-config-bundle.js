/* Pixel Tetsudo - Data Config Bundle (auto-merged).
 * Merged from: transfer-hints.js, runtime-config.js, through-service.js, line-operation-systems.js, platform-data.js, line-service-relations.js, train-type-defs.js.
 * Do not edit here; edit the source files and re-run node data/core/gen-config-bundle.js
 */

// ===== transfer-hints.js =====
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
      ja: "（表参道駅連絡・要出站／JR原宿駅連絡）",
      zh: "（连络表参道站・需出站／连络JR原宿站）",
      en: "(Connects to Omotesando, outside transfer / Harajuku JR)",
      ko: "（오모테산도역 연결・역외 환승／JR하라주쿠역 연결）"
    },
    connects: ["Omotesando", "Harajuku"],
    outside: true
  },
  "Harajuku": {
    type: "name_mismatch",
    note: {
      ja: "（明治神宮前〈原宿〉駅連絡）",
      zh: "（连络明治神宫前〈原宿〉站）",
      en: "(Connects to Meiji-Jingumae (Harajuku))",
      ko: "（메이지진구마에〈하라주쿠〉역 연결）"
    },
    connects: ["Meiji-Jingumae"]
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
      ja: "（小伝馬町駅・水天宮前駅連絡・要出站）",
      zh: "（连络小传马町站・水天宫前站・需出站）",
      en: "(Connects to Kodemmacho / Suitengumae, outside transfer)",
      ko: "（코덴마초역・스이텐구마에역 연결・역외 환승）"
    },
    connects: ["Kodemmacho", "Suitengumae"],
    outside: true
  },
  
  "Korakuen": {
    type: "name_mismatch",
    note: {
      ja: "（春日駅連絡・要出站）",
      zh: "（连络春日站・需出站）",
      en: "(Connects to Kasuga, outside transfer)",
      ko: "（카스가역 연결・역외 환승）"
    },
    connects: ["Kasuga"],
    outside: true
  },
  "Kasuga": {
    type: "name_mismatch",
    note: {
      ja: "（後楽園駅連絡・要出站）",
      zh: "（连络后乐园站・需出站）",
      en: "(Connects to Korakuen, outside transfer)",
      ko: "（코라쿠엔역 연결・역외 환승）"
    },
    connects: ["Korakuen"],
    outside: true
  },
  "Mita": {
    type: "name_mismatch",
    note: {
      ja: "（田町駅連絡・要出站）",
      zh: "（连络田町站・需出站）",
      en: "(Connects to Tamachi, outside transfer)",
      ko: "（타마치역 연결・역외 환승）"
    },
    connects: ["Tamachi"],
    outside: true
  },
  "Tamachi": {
    type: "name_mismatch",
    note: {
      ja: "（三田駅連絡・要出站）",
      zh: "（连络三田站・需出站）",
      en: "(Connects to Mita, outside transfer)",
      ko: "（미타역 연결・역외 환승）"
    },
    connects: ["Mita"],
    outside: true
  },
  "Ueno-Hirokoji": {
    type: "name_mismatch",
    note: {
      ja: "（仲御徒町・上野御徒町・御徒町駅連絡）",
      zh: "（连络仲御徒町・上野御徒町・御徒町站）",
      en: "(Connects to Naka-Okachimachi / Ueno-Okachimachi / Okachimachi)",
      ko: "（나카오카치마치・우에노오카치마치・오카치마치역 연결）"
    },
    connects: ["Naka-Okachimachi", "Ueno-Okachimachi", "Okachimachi"]
  },
  "Naka-Okachimachi": {
    type: "name_mismatch",
    note: {
      ja: "（上野広小路・上野御徒町・御徒町駅連絡）",
      zh: "（连络上野广小路・上野御徒町・御徒町站）",
      en: "(Connects to Ueno-Hirokoji / Ueno-Okachimachi / Okachimachi)",
      ko: "（우에노히로코지・우에노오카치마치・오카치마치역 연결）"
    },
    connects: ["Ueno-Hirokoji", "Ueno-Okachimachi", "Okachimachi"]
  },
  "Ueno-Okachimachi": {
    type: "name_mismatch",
    note: {
      ja: "（上野広小路・仲御徒町・御徒町駅連絡）",
      zh: "（连络上野广小路・仲御徒町・御徒町站）",
      en: "(Connects to Ueno-Hirokoji / Naka-Okachimachi / Okachimachi)",
      ko: "（우에노히로코지・나카오카치마치・오카치마치역 연결）"
    },
    connects: ["Ueno-Hirokoji", "Naka-Okachimachi", "Okachimachi"]
  },
  "Okachimachi": {
    type: "name_mismatch",
    note: {
      ja: "（上野広小路・仲御徒町・上野御徒町駅連絡）",
      zh: "（连络上野广小路・仲御徒町・上野御徒町站）",
      en: "(Connects to Ueno-Hirokoji / Naka-Okachimachi / Ueno-Okachimachi)",
      ko: "（우에노히로코지・나카오카치마치・우에노오카치마치역 연결）"
    },
    connects: ["Ueno-Hirokoji", "Naka-Okachimachi", "Ueno-Okachimachi"]
  },
  "Awajicho": {
    type: "name_mismatch",
    note: {
      ja: "（小川町・新御茶ノ水駅連絡）",
      zh: "（连络小川町・新御茶之水站）",
      en: "(Connects to Ogawamachi / Shin-Ochanomizu)",
      ko: "（오가와마치・신오차노미즈역 연결）"
    },
    connects: ["Ogawamachi", "Shin-Ochanomizu"]
  },
  "Ogawamachi": {
    type: "name_mismatch",
    note: {
      ja: "（淡路町・新御茶ノ水駅連絡）",
      zh: "（连络淡路町・新御茶之水站）",
      en: "(Connects to Awajicho / Shin-Ochanomizu)",
      ko: "（아와지초・신오차노미즈역 연결）"
    },
    connects: ["Awajicho", "Shin-Ochanomizu"]
  },
  "Shin-Ochanomizu": {
    type: "name_mismatch",
    note: {
      ja: "（淡路町・小川町駅連絡）",
      zh: "（连络淡路町・小川町站）",
      en: "(Connects to Awajicho / Ogawamachi)",
      ko: "（아와지초・오가와마치역 연결）"
    },
    connects: ["Awajicho", "Ogawamachi"]
  },
  "Bakuro-Yokoyama": {
    type: "name_mismatch",
    note: {
      ja: "（馬喰町・東日本橋駅連絡）",
      zh: "（连络马喰町・东日本桥站）",
      en: "(Connects to Bakurocho / Higashi-Nihombashi)",
      ko: "（바쿠로초・히가시니혼바시역 연결）"
    },
    connects: ["Bakurocho", "Higashi-Nihombashi"]
  },
  "Bakurocho": {
    type: "name_mismatch",
    note: {
      ja: "（馬喰横山・東日本橋駅連絡）",
      zh: "（连络马喰横山・东日本桥站）",
      en: "(Connects to Bakuro-Yokoyama / Higashi-Nihombashi)",
      ko: "（바쿠로요코야마・히가시니혼바시역 연결）"
    },
    connects: ["Bakuro-Yokoyama", "Higashi-Nihombashi"]
  },
  "Higashi-Nihombashi": {
    type: "name_mismatch",
    note: {
      ja: "（馬喰横山・馬喰町駅連絡）",
      zh: "（连络马喰横山・马喰町站）",
      en: "(Connects to Bakuro-Yokoyama / Bakurocho)",
      ko: "（바쿠로요코야마・바쿠로초역 연결）"
    },
    connects: ["Bakuro-Yokoyama", "Bakurocho"]
  },
  "Tameike-Sanno": {
    type: "name_mismatch",
    note: {
      ja: "（国会議事堂前駅連絡）",
      zh: "（连络国会议事堂前站）",
      en: "(Connects to Kokkai-Gijidomae)",
      ko: "（국회의사당앞역 연결）"
    },
    connects: ["Kokkai-Gijidomae"]
  },
  "Kokkai-Gijidomae": {
    type: "name_mismatch",
    note: {
      ja: "（溜池山王駅連絡）",
      zh: "（连络溜池山王站）",
      en: "(Connects to Tameike-Sanno)",
      ko: "（타메이케산노역 연결）"
    },
    connects: ["Tameike-Sanno"]
  },
  "Hibiya": {
    type: "name_mismatch",
    note: {
      ja: "（有楽町駅連絡）",
      zh: "（连络有乐町站）",
      en: "(Connects to Yurakucho)",
      ko: "（유라쿠초역 연결）"
    },
    connects: ["Yurakucho"]
  },
  "Yurakucho": {
    type: "name_mismatch",
    note: {
      ja: "（日比谷駅連絡）",
      zh: "（连络日比谷站）",
      en: "(Connects to Hibiya)",
      ko: "（히비야역 연결）"
    },
    connects: ["Hibiya"]
  },
  "Shiodome": {
    type: "name_mismatch",
    note: {
      ja: "（新橋駅連絡・要出站）",
      zh: "（连络新桥站・需出站）",
      en: "(Connects to Shimbashi, outside transfer)",
      ko: "（신바시역 연결・역외 환승）"
    },
    connects: ["Shimbashi"],
    outside: true
  },
  "Shimbashi": {
    type: "name_mismatch",
    note: {
      ja: "（汐留駅連絡・要出站）",
      zh: "（连络汐留站・需出站）",
      en: "(Connects to Shiodome, outside transfer)",
      ko: "（시오도메역 연결・역외 환승）"
    },
    connects: ["Shiodome"],
    outside: true
  },
  "Akihabara": {
    type: "name_mismatch",
    note: {
      ja: "（岩本町駅連絡）",
      zh: "（连络岩本町站）",
      en: "(Connects to Iwamotocho)",
      ko: "（이와모토초역 연결）"
    },
    connects: ["Iwamotocho"]
  },
  "Iwamotocho": {
    type: "name_mismatch",
    note: {
      ja: "（秋葉原駅連絡）",
      zh: "（连络秋叶原站）",
      en: "(Connects to Akihabara)",
      ko: "（아키하바라역 연결）"
    },
    connects: ["Akihabara"]
  },
  "Kanda": {
    type: "name_mismatch",
    note: {
      ja: "（岩本町駅連絡）",
      zh: "（连络岩本町站）",
      en: "(Connects to Iwamotocho)",
      ko: "（이와모토초역 연결）"
    },
    connects: ["Iwamotocho"]
  },
  "Tokyo": {
    type: "name_mismatch",
    note: {
      ja: "（大手町駅連絡）",
      zh: "（连络大手町站）",
      en: "(Connects to Otemachi)",
      ko: "（오테마치역 연결）"
    },
    connects: ["Otemachi"]
  },
  "Otemachi": {
    type: "name_mismatch",
    note: {
      ja: "（東京駅・二重橋前駅連絡）",
      zh: "（连络东京站・二重桥前站）",
      en: "(Connects to Tokyo / Nijubashimae)",
      ko: "（도쿄역・니주바시마에역 연결）"
    },
    connects: ["Tokyo", "Nijubashimae"]
  },
  "Nijubashimae": {
    type: "name_mismatch",
    note: {
      ja: "（大手町駅連絡）",
      zh: "（连络大手町站）",
      en: "(Connects to Otemachi)",
      ko: "（오테마치역 연결）"
    },
    connects: ["Otemachi"]
  },
  "Shin-Nihonbashi": {
    type: "name_mismatch",
    note: {
      ja: "（三越前駅連絡）",
      zh: "（连络三越前站）",
      en: "(Connects to Mitsukoshimae)",
      ko: "（미쓰코시마에역 연결）"
    },
    connects: ["Mitsukoshimae"]
  },
  "Mitsukoshimae": {
    type: "name_mismatch",
    note: {
      ja: "（新日本橋駅連絡）",
      zh: "（连络新日本桥站）",
      en: "(Connects to Shin-Nihonbashi)",
      ko: "（신니혼바시역 연결）"
    },
    connects: ["Shin-Nihonbashi"]
  },
  "Sengakuji": {
    type: "name_mismatch",
    note: {
      ja: "（高輪ゲートウェイ駅連絡）",
      zh: "（连络高轮Gateway站）",
      en: "(Connects to Takanawa-Gateway)",
      ko: "（타카나와게이트웨이역 연결）"
    },
    connects: ["Takanawa-Gateway"]
  },
  "Takanawa-Gateway": {
    type: "name_mismatch",
    note: {
      ja: "（泉岳寺駅連絡）",
      zh: "（连络泉岳寺站）",
      en: "(Connects to Sengakuji)",
      ko: "（센가쿠지역 연결）"
    },
    connects: ["Sengakuji"]
  },
  "Toranomon": {
    type: "name_mismatch",
    note: {
      ja: "（虎ノ門ヒルズ駅連絡）",
      zh: "（连络虎之门Hills站）",
      en: "(Connects to Toranomon-Hills)",
      ko: "（토라노몬힐즈역 연결）"
    },
    connects: ["Toranomon-Hills"]
  },
  "Toranomon-Hills": {
    type: "name_mismatch",
    note: {
      ja: "（虎ノ門駅連絡）",
      zh: "（连络虎之门站）",
      en: "(Connects to Toranomon)",
      ko: "（토라노몬역 연결）"
    },
    connects: ["Toranomon"]
  },
  "Suitengumae": {
    type: "name_mismatch",
    note: {
      ja: "（人形町駅連絡）",
      zh: "（连络人形町站）",
      en: "(Connects to Ningyocho)",
      ko: "（닌교초역 연결）"
    },
    connects: ["Ningyocho"]
  },
  "Ginza": {
    type: "name_mismatch",
    note: {
      ja: "（銀座一丁目駅連絡）",
      zh: "（连络银座一丁目站）",
      en: "(Connects to Ginza-Itchome)",
      ko: "（긴자잇쵸메역 연결）"
    },
    connects: ["Ginza-Itchome"]
  },
  "Ginza-Itchome": {
    type: "name_mismatch",
    note: {
      ja: "（銀座駅連絡）",
      zh: "（连络银座站）",
      en: "(Connects to Ginza)",
      ko: "（긴자역 연결）"
    },
    connects: ["Ginza"]
  },
  "Tachikawa": {
    type: "name_mismatch",
    note: {
      ja: "（立川北・立川南駅連絡・要出站）",
      zh: "（连络立川北・立川南站・需出站）",
      en: "(Connects to Tachikawa-Kita / Tachikawa-Minami, outside transfer)",
      ko: "（타치카와키타・타치카와미나미역 연결・역외 환승）"
    },
    connects: ["Tachikawa-Kita", "Tachikawa-Minami"],
    outside: true
  },
  "Tachikawa-Kita": {
    type: "name_mismatch",
    note: {
      ja: "（JR立川駅連絡・要出站）",
      zh: "（连络JR立川站・需出站）",
      en: "(Connects to Tachikawa JR, outside transfer)",
      ko: "（JR타치카와역 연결・역외 환승）"
    },
    connects: ["Tachikawa"],
    outside: true
  },
  "Tachikawa-Minami": {
    type: "name_mismatch",
    note: {
      ja: "（JR立川駅連絡・要出站）",
      zh: "（连络JR立川站・需出站）",
      en: "(Connects to Tachikawa JR, outside transfer)",
      ko: "（JR타치카와역 연결・역외 환승）"
    },
    connects: ["Tachikawa"],
    outside: true
  },
  "Akitsu": {
    type: "name_mismatch",
    note: {
      ja: "（新秋津駅連絡・要出站）",
      zh: "（连络新秋津站・需出站）",
      en: "(Connects to Shin-Akitsu, outside transfer)",
      ko: "（신아키츠역 연결・역외 환승）"
    },
    connects: ["Shin-Akitsu"],
    outside: true
  },
  "Shin-Akitsu": {
    type: "name_mismatch",
    note: {
      ja: "（秋津駅連絡・要出站）",
      zh: "（连络秋津站・需出站）",
      en: "(Connects to Akitsu, outside transfer)",
      ko: "（아키츠역 연결・역외 환승）"
    },
    connects: ["Akitsu"],
    outside: true
  },
  "Otsuka": {
    type: "name_mismatch",
    note: {
      ja: "（大塚駅前駅連絡・要出站）",
      zh: "（连络大塚站前站・需出站）",
      en: "(Connects to Otsuka-Ekimae, outside transfer)",
      ko: "（오츠카에키마에역 연결・역외 환승）"
    },
    connects: ["Otsuka_Eki_Mae"],
    outside: true
  },
  "Otsuka_Eki_Mae": {
    type: "name_mismatch",
    note: {
      ja: "（JR大塚駅連絡・要出站）",
      zh: "（连络JR大塚站・需出站）",
      en: "(Connects to Otsuka JR, outside transfer)",
      ko: "（JR오츠카역 연결・역외 환승）"
    },
    connects: ["Otsuka"],
    outside: true
  },
  "Togoshi": {
    type: "name_mismatch",
    note: {
      ja: "（戸越銀座駅連絡・要出站）",
      zh: "（连络户越银座站・需出站）",
      en: "(Connects to Togoshi-ginza, outside transfer)",
      ko: "（토고시긴자역 연결・역외 환승）"
    },
    connects: ["Togoshi-ginza"],
    outside: true
  },
  "Togoshi-ginza": {
    type: "name_mismatch",
    note: {
      ja: "（戸越駅連絡・要出站）",
      zh: "（连络户越站・需出站）",
      en: "(Connects to Togoshi, outside transfer)",
      ko: "（토고시역 연결・역외 환승）"
    },
    connects: ["Togoshi"],
    outside: true
  },
  "Ushida": {
    type: "name_mismatch",
    note: {
      ja: "（京成関屋駅連絡）",
      zh: "（连络京成关屋站）",
      en: "(Connects to Keisei-Sekiya)",
      ko: "（케이세이세키야역 연결）"
    },
    connects: ["Keisei-Sekiya"]
  },
  "Keisei-Sekiya": {
    type: "name_mismatch",
    note: {
      ja: "（牛田駅連絡）",
      zh: "（连络牛田站）",
      en: "(Connects to Ushida)",
      ko: "（우시다역 연결）"
    },
    connects: ["Ushida"]
  },
  "Moto-Yawata": {
    type: "name_mismatch",
    note: {
      ja: "（京成八幡駅連絡）",
      zh: "（连络京成八幡站）",
      en: "(Connects to Keisei-Yawata)",
      ko: "（케이세이야와타역 연결）"
    },
    connects: ["Keisei-Yawata"]
  },
  "Keisei-Yawata": {
    type: "name_mismatch",
    note: {
      ja: "（本八幡駅連絡）",
      zh: "（连络本八幡站）",
      en: "(Connects to Moto-Yawata)",
      ko: "（모토야와타역 연결）"
    },
    connects: ["Moto-Yawata"]
  },
  "Shin-Koshigaya": {
    type: "name_mismatch",
    note: {
      ja: "（南越谷駅連絡・要出站）",
      zh: "（连络南越谷站・需出站）",
      en: "(Connects to Minami-Koshigaya, outside transfer)",
      ko: "（미나미코시가야역 연결・역외 환승）"
    },
    connects: ["Minami-Koshigaya"],
    outside: true
  },
  "Minami-Koshigaya": {
    type: "name_mismatch",
    note: {
      ja: "（新越谷駅連絡・要出站）",
      zh: "（连络新越谷站・需出站）",
      en: "(Connects to Shin-Koshigaya, outside transfer)",
      ko: "（신코시가야역 연결・역외 환승）"
    },
    connects: ["Shin-Koshigaya"],
    outside: true
  },
  "Asakadai": {
    type: "name_mismatch",
    note: {
      ja: "（北朝霞駅連絡・要出站）",
      zh: "（连络北朝霞站・需出站）",
      en: "(Connects to Kita-Asaka, outside transfer)",
      ko: "（키타아사카역 연결・역외 환승）"
    },
    connects: ["Kita-Asaka"],
    outside: true
  },
  "Kita-Asaka": {
    type: "name_mismatch",
    note: {
      ja: "（朝霞台駅連絡・要出站）",
      zh: "（连络朝霞台站・需出站）",
      en: "(Connects to Asakadai, outside transfer)",
      ko: "（아사카다이역 연결・역외 환승）"
    },
    connects: ["Asakadai"],
    outside: true
  },
  "Musashi-Mizonokuchi": {
    type: "name_mismatch",
    note: {
      ja: "（溝の口駅連絡・要出站）",
      zh: "（连络沟之口站・需出站）",
      en: "(Connects to Mizonokuchi, outside transfer)",
      ko: "（미조노쿠치역 연결・역외 환승）"
    },
    connects: ["Mizonokuchi"],
    outside: true
  },
  "Mizonokuchi": {
    type: "name_mismatch",
    note: {
      ja: "（武蔵溝ノ口駅連絡・要出站）",
      zh: "（连络武藏沟之口站・需出站）",
      en: "(Connects to Musashi-Mizonokuchi, outside transfer)",
      ko: "（무사시미조노쿠치역 연결・역외 환승）"
    },
    connects: ["Musashi-Mizonokuchi"],
    outside: true
  },
  "Gotokuji": {
    type: "name_mismatch",
    note: {
      ja: "（山下駅連絡）",
      zh: "（连络山下站）",
      en: "(Connects to Yamashita)",
      ko: "（야마시타역 연결）"
    },
    connects: ["Yamashita"]
  },
  "Yamashita": {
    type: "name_mismatch",
    note: {
      ja: "（豪徳寺駅連絡）",
      zh: "（连络豪德寺站）",
      en: "(Connects to Gotokuji)",
      ko: "（고토쿠지역 연결）"
    },
    connects: ["Gotokuji"]
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
      ja: "（JR・私鉄・地下鉄連絡、一部要出站／みなとみらい線・副都心線連絡）",
      zh: "（JR・私铁・地铁连络，部分需出站／连络港未来线・副都心线）",
      en: "(JR/Private/Subway connection, some outside transfer / Minatomirai-Fukutoshin)",
      ko: "（JR・사철・지하철 연결, 일부 역외 환승／미나토미라이선・후쿠토신선 연결）"
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


// ===== runtime-config.js =====
/**
 * Pixel Tetsudo - Runtime Configuration
 * 
 * Centralized hardcoded mappings that govern system behavior at runtime.
 * All providers must read from this module; no copy-paste duplication.
 * 
 * Consumers:
 *   data-state.js        → TRUNK_MAIN_LINE_IDS
 *   data-fusion.js       → THROUGH_RAILWAY_FALLBACK, PRIORITY_OPS, STATION_ALIAS,
 *                          STATION_ALIAS_BY_RAILWAY, TRAIN_WARMUP_LINES, REFRESH_INTERVAL,
 *                          POSITION_INTERVAL
 *   odpt-unified.js      → API_RATE_LIMIT, API_MAX_CONCURRENCY, TT_TRUNCATE_LIMIT
 *   trains-page.js       → TRUNK_EXTENSION_ALLOW, TRANSFER_MAX_ROWS
 */
(function() {
  "use strict";

  // ========== 线路层级 ==========

  /**
   * 干线本名（非運行系統）不进线路一览；数据保留作换乘锚点/支线父线。
   * 信越本線(分断)/東海道本線/東北本線 — 类比京沪铁路，不是运行系统。
   * 中央本線已独立 CO 卡（4.3.414），不在此列。
   */
  var TRUNK_MAIN_LINE_IDS = ["Shinetsu", "TokaidoMain", "TohokuMain"];

  /**
   * 干线本名延伸白名单（显式登记，防止自动端点相接误判）。
   * 4.3.421：横須賀線誤延伸整条東海道本線 修复后改为空表，即不延伸任何干线本名。
   */
  var TRUNK_EXTENSION_ALLOW = {};

  // ========== 直通运行 ==========

  /**
   * 直通运行 railway → 归属优先表（跨 operator 放行）。
   * 解决：直通系统列车 fromStation 专属站，LINE_RAILWAY_CODE 反查无映射时 fallback "站数最多"
   * 导致误配（例：SotetsuDirect→Yamanote）。
   * 结构：exclude 排除环线；prefer 按优先级归属。
   */
  var THROUGH_RAILWAY_FALLBACK = {
    "SotetsuDirect": {
      exclude: ["Yamanote"],
      prefer: ["SotetsuShin-Yokohama", "Yokosuka", "Saikyo", "ShonanShinjuku"]
    }
  };

  /**
   * 时刻表按需加载优先运营商白名单。
   * 只有白名单内的 operator 才会触发 loadMissingTimetables 补拉。
   * JR-East 在 4.3.489 加入（地方线 ODPT 有 Railway 但无 Train/TT）。
   */
  var PRIORITY_OPS = [
    "JR-East", "TokyoMetro", "Toei", "YokohamaMunicipal", "Keio",
    "Sotetsu", "Tokyu", "Tobu", "TWR", "MIR", "TamaMonorail"
  ];

  // ========== ODPT 站 ID 别名映射（补丁式修复，随发现持续追加）==========

  /**
   * 全局站 ID 别名：ODPT 驼峰/连字符/拼写差异 → 本地冻结站表 ID。
   * v4.3.416 起积累，每次全量通查后追加。项目数据冻结（Freeze），不在数据层修，
   * 仅在此匹配层做归一化转换。
   */
  var STATION_ALIAS = {
    "MusashiHikida": "Musashi-Hikida",
    "Minowabashi": "Sannomi_Bashi",
    "ArakawaItchumae": "Arakawa_Ichi_Mae",
    "Arakawakuyakushomae": "Arakawa_Kuyakusho_Mae",
    "ArakawaNichome": "Arakawa_Ni",
    "ArakawaNanachome": "Arakawa_Nana",
    "MachiyaEkimae": "Machiya_Eki_Mae",
    "MachiyaNichome": "Machiya_Ni",
    "HigashiOguSanchome": "Higashi_Oku_San",
    "Kumanomae": "Kuma_Mae",
    "Miyanomae": "Miyano_Mae",
    "Odai": "Kodai",
    "ArakawaYuenchimae": "Arakawa_Yuengiei_Mae",
    "ArakawaShakomae": "Arakawa_Shako_Mae",
    "Sakaecho": "Eimachi",
    "OjiEkimae": "Oji_Eki_Mae",
    "TakinogawaItchome": "Takino_Kawa_Ichome",
    "NishigaharaYonchome": "Nishi_Kbara_Yon",
    "ShinKoshinzuka": "Shin_Kosenzuka",
    "Koshinzuka": "Kosenzuka",
    "Sugamoshinden": "Sugamo_Shimmachi",
    "OtsukaEkimae": "Otsuka_Eki_Mae",
    "Mukohara": "Mukaiohara",
    "HigashiIkebukuroYonchome": "Higashi_Ikebukuro_Yon",
    "TodenZoshigaya": "Toei_Zoshigaya",
    "Kishibojimmae": "Onishimogami_Mae",
    "Gakushuinshita": "Gakuin_Mae",
    "Kasumigaseki": "Kasumigaseki-Tojo",
    "Shimbamba": "Shin-Baba",
    "Umeyashiki": "Umayabashi",
    "Futamatashimmachi": "Futamata-Shinmachi",
    "KasaiRinkaiPark": "Kasai-Rinkai-Koen",
    "KitaKonosu": "Kita-Kounosu",
    "ShinNihombashi": "Shin-Nihonbashi",
    "Ozaku": "Kosaku",
    "Kawasakidaishi": "Kawasaki_Daishi",
    "YrpNobi": "YRP-Nohbi",
    "Misakiguchi": "Misasaki-Guchi",
    "ShimMatsudo": "Shin-Matsudo",
    "HanedaAirportTerminal1and2": "Haneda-Kuko-T1T2",
    "Yaita": "Yaida",
    "Konosu": "Kounosu",
    "Kojimashinden": "Kojima_Shinden",
    "Jimmuji": "Jinmuji",
    "Ryugasakishi": "Ryugasaki",
    "Omurai": "Komura_i",
    "ShimMisato": "Shin-Misato",
    "Kojiya": "Kokuji",
    "Motohasunuma": "Hon-Hasuneuma",
    "Daishimae": "Daishi_Mae",
    "Hamura": "Hamu",
    "HanedaAirportTerminal3": "Haneda-Kuko-T3",
    "Suzukicho": "Suzukimachi",
    "Daishibashi": "Daishi_Bashi",
    "MinamiSendai": "Minami-Sendai",
    "HigashiAbiko": "Higashi-Abiko",
    "ShimosaManzaki": "Shimosa-Manzaki",
    "NaritaAirportTerminal2and3": "Airport-Terminal-2",
    "NaritaAirportTerminal1": "Narita-Airport",
    "HamaKawasaki": "Hama-Kawasaki"
  };

  /**
   * Railway 感知别名：ODPT 同名站 ID 在不同线路指向不同本地站，需按 railway 区分。
   * Oyama（Tojo=大山/Ooyama, Utsunomiya=小山/Oyama）双义。
   * Kohoku（Nippori_Toneri=江北/Kohoku, NaritaAbikoBranch=湖北/Kohoku-Narita）双义。
   */
  var STATION_ALIAS_BY_RAILWAY = {
    "Tojo": { "Oyama": "Ooyama" },
    "NaritaAbikoBranch": { "Kohoku": "Kohoku-Narita" }
  };

  // ========== 性能调优参数 ==========

  /** ODPT API 最小请求间隔（毫秒）。实测 12 并发无间隔全 200（248ms），原 1000ms 串行放大 40 倍。v4.3.395 */
  var API_RATE_LIMIT = 150;

  /** ODPT API 每域最大并发数（滑动窗口）。实测 12 并发稳定。 */
  var API_MAX_CONCURRENCY = 3;

  /** ODPT 时刻表单请求 1000 条硬上限。恰 1000 条 = 截断信号，按日历拆分重拉合并。v4.3.589 */
  var TT_TRUNCATE_LIMIT = 1000;

  /** 时刻表按需加载批量上限。ODPT 150ms 间隔 × 3 并发，24 条约 1 秒完成。v4.3.446 */
  var TIMETABLE_LOAD_BATCH = 24;

  /** 实时数据轮询间隔（毫秒）。 */
  var REFRESH_INTERVAL = 15000;

  /** 列车位置轮询间隔（毫秒）。比延误轮询慢，位置变化频率较低。 */
  var POSITION_INTERVAL = 60000;

  /** trains 页后台预加载线路白名单（用户高频切换的线路）。打开 trains.html 后 2 秒开始后台加载。 */
  var TRAIN_WARMUP_LINES = ['Yamanote', 'ChuoRapid', 'KeihinTohoku', 'SeibuEn', 'Keikyu', 'Odawara'];

  // ========== UI 策略常量 ==========

  /** 换乘 chip 行数上限（per station）。v4.3.613: 2→3 行——JR 大站（东京/新宿）换乘超 8 条，2 行截断致"同一套系统无法区分"。 */
  var TRANSFER_MAX_ROWS = 3;

  window.RuntimeConfig = {
    // 线路层级
    TRUNK_MAIN_LINE_IDS: TRUNK_MAIN_LINE_IDS,
    TRUNK_EXTENSION_ALLOW: TRUNK_EXTENSION_ALLOW,
    // 直通运行
    THROUGH_RAILWAY_FALLBACK: THROUGH_RAILWAY_FALLBACK,
    PRIORITY_OPS: PRIORITY_OPS,
    // ODPT 站 ID 别名
    STATION_ALIAS: STATION_ALIAS,
    STATION_ALIAS_BY_RAILWAY: STATION_ALIAS_BY_RAILWAY,
    // 性能调优
    API_RATE_LIMIT: API_RATE_LIMIT,
    API_MAX_CONCURRENCY: API_MAX_CONCURRENCY,
    TT_TRUNCATE_LIMIT: TT_TRUNCATE_LIMIT,
    TIMETABLE_LOAD_BATCH: TIMETABLE_LOAD_BATCH,
    REFRESH_INTERVAL: REFRESH_INTERVAL,
    POSITION_INTERVAL: POSITION_INTERVAL,
    TRAIN_WARMUP_LINES: TRAIN_WARMUP_LINES,
    // UI 策略
    TRANSFER_MAX_ROWS: TRANSFER_MAX_ROWS
  };
})();

// ===== through-service.js =====
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
    "TobuIsesaki": ["Hibiya", "Hanzomon", "TobuSkytree", "TobuNikko"],
    // 東京メトロ
    "Hibiya": ["TobuSkytree", "TobuIsesaki"],
    "Hanzomon": ["TobuSkytree", "TobuIsesaki", "TokyuDenEn"],
    "Namboku": ["TokyuMeguro"],
    "Chiyoda": ["JobanLocal", "OdakyuTama", "Odawara"],
    "Tozai": ["ChuoSobuLocal"],
    "Yurakucho": ["Tojo"],
    "Fukutoshin": ["TokyuToyoko", "Tojo", "Yurakucho_Seibu"],
    "Mita": ["TokyuMeguro"],
    "Asakusa": ["Keikyu", "Keisei", "KeiseiOshiage"],
    "Shinjuku": ["Keio", "KeioMain"],
    // 東急
    "TokyuToyoko": ["MinatoMirai", "Fukutoshin"],
    "MinatoMirai": ["TokyuToyoko"],
    "TokyuMeguro": ["Mita", "Namboku", "SotetsuShin-Yokohama"],
    "TokyuDenEn": ["Hanzomon", "TokyuOimachi"],
    // 西武有楽町線（小竹向原-練馬）— the through path to 西武池袋線 runs via this line
    "Yurakucho_Seibu": ["Fukutoshin", "Ikebukuro", "SeibuChichibu", "Yurakucho"],
    // 西武池袋線（データ線ではない——BFS 中継のみ、表示対象外）
    "Ikebukuro": ["Yurakucho_Seibu", "Fukutoshin"],
    // 東武東上線
    "Tojo": ["Fukutoshin", "Yurakucho"],
    // 京成・京急
    "Keikyu": ["Asakusa"],
    "Keisei": ["Asakusa", "KeiseiOshiage", "NaritaSkyAccess"],
    "KeiseiOshiage": ["Asakusa", "Keisei"],
    "NaritaSkyAccess": ["Keisei"],
    // 京急支線（空港線/久里浜線/逗子線 → 本線直通）
    "KeikyuAirport": ["Keikyu"],
    "KeikyuKurihama": ["Keikyu"],
    "KeikyuZushi": ["Keikyu"],
    // 相鉄
    "SotetsuMain": ["Saikyo", "TokyuToyoko", "SotetsuIzumino", "SotetsuShin-Yokohama"],
    "SotetsuIzumino": ["SotetsuMain"],
    "SotetsuShin-Yokohama": ["SotetsuMain", "TokyuMeguro"],
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
    "UenoTokyo": ["UtsunomiyaJR", "Takasaki", "Joban", "Tokaido"],
    "ChuoRapid": ["Ome", "Itsukaichi", "ChuoMain"],
    "ChuoMain": ["ChuoRapid", "Shinonoi", "ChuoTatsuno"],
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
        "ChuoSobuLocal": ["Tozai"],
    // 地方線直通（4.3.644 補完）
    "Gono": ["OuMain"],
    "Kamaishi": ["TohokuMain"],
    "OuMain": ["Gono", "Tazawako"],
    "Tazawako": ["OuMain"],
    "TokyuOimachi": ["TokyuDenEn"],
    // 直通 6 組補完（4.3.711）
    "TobuNikko": ["TobuIsesaki"],
    "ChuoTatsuno": ["ChuoMain"],
    "Shinonoi": ["ChuoMain", "Shinetsu"],
    "Shinetsu": ["Shinonoi"],
    "SeibuChichibu": ["Yurakucho_Seibu"]
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
    "Yurakucho_Seibu": { "Fukutoshin": ["Kotake-Mukaihara"], "Yurakucho": ["Kotake-Mukaihara"], "SeibuChichibu": [] },
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
    "UenoTokyo": { "UtsunomiyaJR": ["Omiya"], "Takasaki": ["Omiya"], "Joban": ["Ueno"], "Tokaido": ["Tokyo"] },
    "Takasaki": { "ShonanShinjuku": ["Omiya"], "UenoTokyo": ["Omiya"], "Tokaido": ["Tokyo"] },
    "Yokosuka": { "ShonanShinjuku": ["Ofuna"], "SobuRapid": ["Tokyo"] },
    "UtsunomiyaJR": { "ShonanShinjuku": ["Omiya"], "UenoTokyo": ["Omiya"], "Tokaido": ["Tokyo"] },
    "Joban": { "UenoTokyo": ["Ueno"] },
    "Tokaido": { "UtsunomiyaJR": ["Tokyo"], "Takasaki": ["Tokyo"], "UenoTokyo": ["Tokyo"], "Ito": ["Atami"] },
    "Tokaido": { "UtsunomiyaJR": ["Tokyo"], "Takasaki": ["Tokyo"], "Ito": ["Atami"] },
    "Ito": { "Tokaido": ["Atami"] },
    // 中央線
    "ChuoRapid": { "Ome": ["Tachikawa"], "Itsukaichi": ["Haijima"], "ChuoMain": ["Takao"] },
    "ChuoMain": { "ChuoRapid": ["Takao"], "Shinonoi": ["Shiojiri"], "ChuoTatsuno": ["Okaya"] },
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
    "TokyuMeguro": { "Mita": ["Meguro"], "Namboku": ["Meguro"], "SotetsuShin-Yokohama": [] },
    // 相鉄（埼京・東横とはデータ上接続駅なし→マーカー非表示）
    "SotetsuMain": { "Saikyo": [], "TokyuToyoko": [], "SotetsuIzumino": ["Futamatagawa", "Futamatagawa"], "SotetsuShin-Yokohama": ["Nishiya"] },
    "SotetsuIzumino": { "SotetsuMain": ["Futamatagawa", "Futamatagawa"] },
        "SotetsuShin-Yokohama": { "SotetsuMain": ["Nishiya"], "TokyuMeguro": ["Shin-Yokohama"] },
    // 地方線直通・大井町線直通（4.3.644 補完）
    "Gono": { "OuMain": ["Kawabe"] },
    "Kamaishi": { "TohokuMain": ["Hanamaki"] },
    "OuMain": { "Gono": ["Kawabe"], "Tazawako": ["Omagari"] },
    "Tazawako": { "OuMain": ["Omagari"] },
    "TokyuOimachi": { "TokyuDenEn": ["Futako-Tamagawa"] },
    "TokyuDenEn": { "TokyuOimachi": ["Futako-Tamagawa"] },
    // 直通 6 組補完 JOIN（4.3.711）
    "TobuNikko": { "TobuIsesaki": ["Tobu-Dobutsu-Koen"] },
    "ChuoTatsuno": { "ChuoMain": ["Okaya"] },
    "Shinonoi": { "ChuoMain": ["Shiojiri"], "Shinetsu": ["Shinonoi"] },
    "Shinetsu": { "Shinonoi": ["Shinonoi"] },
    "SeibuChichibu": { "Yurakucho_Seibu": [] }
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


// ===== line-operation-systems.js =====
/*
 * Line Operation Systems - Presentation Layer
 * DO NOT MODIFY railway_data.json
 * This file defines how lines are displayed, grouped, and ordered.
 * line_id references are canonical identifiers from railway_data.json
 *
 * v4.3.122: Split all multi-line private railway systems into individual cards
 */

/* global window */
window.LineOperationSystems = {
  "JR_EAST": [
    {
      code: "JA",
      nameJa: "埼京線・川越線",
      nameZh: "埼京线・川越线",
      nameEn: "Saikyo Line / Kawagoe Line",
      nameKo: "사이쿄선・가와고에선",
      color: "#00ac9a",
      lineIds: ["Saikyo","Kawagoe"],
      icon: "../images/鉄道/JR東日本/埼京線.png",
      order: 1
    },
    {
      code: "JA",
      nameJa: "川越線（川越〜高麗川）",
      nameZh: "川越线（川越～高丽川）",
      nameEn: "Kawagoe Line (Kawagoe - Komagawa)",
      nameKo: "가와고에선（가와고에〜코마가와）",
      color: "#00ac47",
      lineIds: ["KawagoeWest"],
      // 川越線（川越〜高麗川）は東京近郊通勤記号列（JA-JY）に属さない郊外線。
      // 八高線（HAC order 22、高麗川接続）の直後に配置（CO 中央本線と同じ扱い：記号は残すが序列外）。
      order: 22.1
    },
    {
      code: "JB",
      nameJa: "中央・総武線（各駅停車）",
      nameZh: "中央・总武线（各站停车）",
      nameEn: "Chuo-Sobu Line (Local)",
      nameKo: "주오・소부선（각역정차）",
      color: "#ffd400",
      lineIds: ["ChuoSobuLocal"],
      icon: "../images/鉄道/JR東日本/中央・総武線各駅停車.png",
      order: 2
    },
    {
      code: "JC",
      nameJa: "中央線（快速）",
      nameZh: "中央线（快速）",
      nameEn: "Chuo Line (Rapid)",
      nameKo: "주오선（쾌속）",
      color: "#f15a22",
      lineIds: ["ChuoRapid"],
      icon: "../images/鉄道/JR東日本/中央快速線.png",
      order: 3
    },
    {
      code: "CO",
      nameJa: "中央本線",
      nameZh: "中央本线",
      nameEn: "Chuo Main Line",
      nameKo: "주오 본선",
      color: "#007ac0",
      lineIds: ["ChuoMain", "ChuoTatsuno"],
      order: 20
    },
    {
      code: "JC",
      nameJa: "青梅線",
      nameZh: "青梅线",
      nameEn: "Ome Line",
      nameKo: "오메선",
      color: "#f15a22",
      lineIds: ["Ome"],
      icon: "../images/鉄道/JR東日本/青梅線.png",
      order: 4
    },
    {
      code: "JC",
      nameJa: "五日市線",
      nameZh: "五日市线",
      nameEn: "Itsukaichi Line",
      nameKo: "이츠카이치선",
      color: "#f15a22",
      lineIds: ["Itsukaichi"],
      icon: "../images/鉄道/JR東日本/五日市線.png",
      order: 5
    },
    {
      code: "JE",
      nameJa: "京葉線",
      nameZh: "京叶线",
      nameEn: "Keiyo Line",
      nameKo: "게이요선",
      color: "#c9242f",
      lineIds: ["Keiyo"],
      icon: "../images/鉄道/JR東日本/京葉線.png",
      order: 6
    },
    {
      code: "JH",
      nameJa: "横浜線",
      nameZh: "横滨线",
      nameEn: "Yokohama Line",
      nameKo: "요코하마선",
      color: "#9fc21b",
      lineIds: ["Yokohama"],
      icon: "../images/鉄道/JR東日本/横浜線.png",
      order: 7
    },
    {
      code: "JI",
      nameJa: "鶴見線",
      nameZh: "鹤见线",
      nameEn: "Tsurumi Line",
      nameKo: "츠루미선",
      color: "#f2d01f",
      lineIds: ["Tsurumi","TsurumiUmiShibaura","TsurumiOkawa"],
      icon: "../images/鉄道/JR東日本/鶴見線.png",
      order: 8
    },
    {
      code: "JJ",
      nameJa: "常磐線（快速）",
      nameZh: "常磐线（快速）",
      nameEn: "Joban Line (Rapid)",
      nameKo: "조반선（쾌속）",
      color: "#00b261",
      lineIds: ["Joban"],
      icon: "../images/鉄道/JR東日本/常磐線快速.png",
      order: 9
    },
    {
      code: "JK",
      nameJa: "京浜東北線・根岸線",
      nameZh: "京滨东北线・根岸线",
      nameEn: "Keihin-Tohoku Line / Negishi Line",
      nameKo: "게이힌토호쿠선・네기시선",
      color: "#00b2e5",
      lineIds: ["KeihinTohoku"],
      icon: "../images/鉄道/JR東日本/京浜東北線.png",
      order: 10
    },
    {
      code: "JL",
      nameJa: "常磐線（各駅停車）",
      nameZh: "常磐线（各站停车）",
      nameEn: "Joban Line (Local)",
      nameKo: "조반선（각역정차）",
      color: "#808080",
      lineIds: ["JobanLocal"],
      icon: "../images/鉄道/JR東日本/常磐緩行線.png",
      order: 11
    },
    {
      code: "JM",
      nameJa: "武蔵野線",
      nameZh: "武藏野线",
      nameEn: "Musashino Line",
      nameKo: "무사시노선",
      color: "#f15a22",
      lineIds: ["Musashino"],
      icon: "../images/鉄道/JR東日本/武蔵野線.png",
      order: 12
    },
    {
      code: "JN",
      nameJa: "南武線",
      nameZh: "南武线",
      nameEn: "Nambu Line",
      nameKo: "난부선",
      color: "#ffd400",
      lineIds: ["Nambu", "NambuBranch"], // 4.3.479: 浜川崎支線并入南武線（规则二嵌套）
      icon: "../images/鉄道/JR東日本/南武線.png",
      order: 13
    },
    {
      code: "JO",
      nameJa: "横須賀線・総武快速線",
      nameZh: "横须贺线・总武快速线",
      nameEn: "Yokosuka Line / Sobu Line (Rapid)",
      nameKo: "요코스카선・소부 쾌속선",
      color: "#00347a",
      lineIds: ["Yokosuka","SobuRapid"],
      icon: "../images/鉄道/JR東日本/総武線快速横須賀線.png",
      order: 14
    },
    {
      code: "JS",
      nameJa: "湘南新宿ライン",
      nameZh: "湘南新宿线",
      nameEn: "Shonan-Shinjuku Line",
      nameKo: "쇼난신주쿠 라인",
      color: "#e21f26",
      lineIds: ["ShonanShinjuku"],
      subNameJa: "高崎線・宇都宮線 東海道線",
      subNameZh: "高崎线・宇都宫线 东海道线",
      subNameEn: "Takasaki・Utsunomiya  Tōkaidō",
      subNameKo: "다카사키・우쓰노미야  도카이도",
      icon: "../images/鉄道/JR東日本/湘南新宿ライン.png",
      order: 15
    },
    {
      code: "",
      nameJa: "上野東京ライン",
      nameZh: "上野东京线",
      nameEn: "Ueno-Tokyo Line",
      nameKo: "우에노도쿄 라인",
      color: "#9358b6",
      lineIds: ["UenoTokyo"],
      subNameJa: "東海道線～高崎線・宇都宮線 常磐線～品川",
      subNameZh: "东海道线～高崎线・宇都宫线 常磐线～品川",
      subNameEn: "Tōkaidō ~ Takasaki・Utsunomiya  Jōban ~ Shinagawa",
      subNameKo: "도카이도 ~ 다카사키・우쓰노미야  조반 ~ 시나가와",
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 15.5
    },
    {
      code: "JT",
      nameJa: "東海道線",
      nameZh: "东海道线",
      nameEn: "Tokaido Line",
      nameKo: "도카이도선",
      color: "#f68b1e",
      lineIds: ["Tokaido"],
      icon: "../images/鉄道/JR東日本/東海道線.png",
      order: 16
    },
    {
      code: "JU",
      nameJa: "高崎線",
      nameZh: "高崎线",
      nameEn: "Takasaki Line",
      nameKo: "타카사키선",
      color: "#f68b1e",
      lineIds: ["Takasaki"],
      icon: "../images/鉄道/JR東日本/高崎線.png",
      order: 17
    },
    {
      code: "JU",
      nameJa: "宇都宮線",
      nameZh: "宇都宫线",
      nameEn: "Utsunomiya Line",
      nameKo: "우츠노미야선",
      color: "#f68b1e",
      lineIds: ["UtsunomiyaJR"],
      icon: "../images/鉄道/JR東日本/宇都宮線.png",
      order: 18
    },
    {
      code: "JY",
      nameJa: "山手線",
      nameZh: "山手线",
      nameEn: "Yamanote Line",
      nameKo: "야마노테선",
      color: "#9acd32",
      lineIds: ["Yamanote"],
      icon: "../images/鉄道/JR東日本/山手線.png",
      order: 19
    },
    {
      code: "ITO",
      nameJa: "伊東線",
      nameZh: "伊东线",
      nameEn: "Ito Line",
      nameKo: "이토선",
      color: "#f68b1e",
      lineIds: ["Ito"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 21
    },
    {
      code: "HAC",
      nameJa: "八高線",
      nameZh: "八高线",
      nameEn: "Hachiko Line",
      nameKo: "하치코선",
      color: "#808080",
      lineIds: ["Hachiko"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 22
    },
    {
      code: "UCH",
      nameJa: "内房線",
      nameZh: "内房线",
      nameEn: "Uchibo Line",
      nameKo: "우치보선",
  color: "#0071C5",
      lineIds: ["Uchibo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 23
    },
    {
      code: "SOT",
      nameJa: "外房線",
      nameZh: "外房线",
      nameEn: "Sotobo Line",
      nameKo: "소토보선",
  color: "#F22335",
      lineIds: ["Sotobo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 24
    },
    {
      code: "NRT",
      nameJa: "成田線",
      nameZh: "成田线",
      nameEn: "Narita Line",
      nameKo: "나리타선",
  color: "#00BB85",
      lineIds: ["Narita", "NaritaAbikoBranch", "NaritaAirportBranch"], // 4.3.479: 我孫子支線・空港支線并入成田線（规则二嵌套，支线仅在父卡内展示）
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 25
    },
    {
      code: "TGN",
      nameJa: "東金線",
      nameZh: "东金线",
      nameEn: "Togane Line",
      nameKo: "토가네선",
      color: "#B31C31", // ODPT 官方
      lineIds: ["Togane"], // 4.3.479: 独立运营名"東金線"（规则一平级顶级）
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 26
    },
    {
      code: "SAG",
      nameJa: "相模線",
      nameZh: "相模线",
      nameEn: "Sagami Line",
      nameKo: "사가미선",
      color: "#009793",
      lineIds: ["Sagami"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 28
    },
    {
      code: "SOB",
      nameJa: "総武本線",
      nameZh: "总武本线",
      nameEn: "Sobu Main Line",
      nameKo: "소부 본선",
      color: "#fcc60d",
      lineIds: ["SobuMain"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 29
    },
    {
      code: "AG",
      nameJa: "吾妻線",
      nameZh: "吾妻线",
      nameEn: "Agatsuma Line",
      nameKo: "아가츠마선",
      color: "#0f5474",
      lineIds: ["Agatsuma"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 30
    },
    {
      code: "BNE",
      nameJa: "磐越東線",
      nameZh: "磐越东线",
      nameEn: "Banetsu East Line",
      nameKo: "반에츠토호쿠선",
      color: "#c71585",
      lineIds: ["BanetsuEast"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 31
    },
    {
      code: "BWE",
      nameJa: "磐越西線",
      nameZh: "磐越西线",
      nameEn: "Banetsu West Line",
      nameKo: "반에츠사이선",
      color: "#cb7b35",
      lineIds: ["BanetsuWest"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 32
    },
    {
      code: "ECH",
      nameJa: "越後線",
      nameZh: "越后线",
      nameEn: "Echigo Line",
      nameKo: "에치고선",
      color: "#40934d",
      lineIds: ["Echigo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 33
    },
    {
      code: "GON",
      nameJa: "五能線",
      nameZh: "五能线",
      nameEn: "Gono Line",
      nameKo: "고노선",
      color: "#0a7aab",
      lineIds: ["Gono"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 34
    },
    {
      code: "HAH",
      nameJa: "八戸線",
      nameZh: "八户线",
      nameEn: "Hachinohe Line",
      nameKo: "하치노헤선",
      color: "#e93920",
      lineIds: ["Hachinohe"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 35
    },
    {
      code: "HAK",
      nameJa: "白新線",
      nameZh: "白新线",
      nameEn: "Hakushin Line",
      nameKo: "하쿠신선",
      color: "#f38b7b",
      lineIds: ["Hakushin"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 36
    },
    {
      code: "IYA",
      nameJa: "飯山線",
      nameZh: "饭山线",
      nameEn: "Iiyama Line",
      nameKo: "이이야마선",
      color: "#7bc24b",
      lineIds: ["Iiyama"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 37
    },
    {
      code: "ISH",
      nameJa: "石巻線",
      nameZh: "石卷线",
      nameEn: "Ishinomaki Line",
      nameKo: "이시노마키선",
      color: "#ed77a4",
      lineIds: ["Ishinomaki"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 38
    },
    {
      code: "JOE",
      nameJa: "上越線",
      nameZh: "上越线",
      nameEn: "Joetsu Line",
      nameKo: "조에츠선",
      color: "#00b3e6",
      lineIds: ["Joetsu"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 39
    },
    {
      code: "KAM",
      nameJa: "釜石線",
      nameZh: "釜石线",
      nameEn: "Kamaishi Line",
      nameKo: "카마이시선",
      color: "#0073bf",
      lineIds: ["Kamaishi"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 40
    },
    {
      code: "KIT",
      nameJa: "北上線",
      nameZh: "北上线",
      nameEn: "Kitakami Line",
      nameKo: "키타카미선",
      color: "#851a72",
      lineIds: ["Kitakami"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 41
    },
    {
      code: "KRS",
      nameJa: "烏山線",
      nameZh: "乌山线",
      nameEn: "Karasuyama Line",
      nameKo: "카라스야마선",
      color: "#339966",
      lineIds: ["Karasuyama"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 42
    },
    {
      code: "KAS",
      nameJa: "鹿島線",
      nameZh: "鹿岛线",
      nameEn: "Kashima Line",
      nameKo: "카시마선",
      color: "#c56e2e",
      lineIds: ["Kashima"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 43
    },
    {
      code: "KES",
      nameJa: "気仙沼線",
      nameZh: "气仙沼线",
      nameEn: "Kesennuma Line",
      nameKo: "케센누마선",
      color: "#3b459b",
      lineIds: ["Kesennuma"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 44
    },
    {
      code: "KOI",
      nameJa: "小海線",
      nameZh: "小海线",
      nameEn: "Komii Line",
      nameKo: "코미선",
      color: "#41934c",
      lineIds: ["Komii"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 45
    },
    {
      code: "KON",
      nameJa: "花輪線",
      nameZh: "花轮线",
      nameEn: "Kounan Line",
      nameKo: "하나와선",
      color: "#aa1e30",
      lineIds: ["Kounan"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 46
    },
    {
      code: "KUR",
      nameJa: "久留里線",
      nameZh: "久留里线",
      nameEn: "Kururi Line",
      nameKo: "쿠루리선",
      color: "#00b5ad",
      lineIds: ["Kururi"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 47
    },
    {
      code: "MIT",
      nameJa: "水戸線",
      nameZh: "水户线",
      nameEn: "Mito Line",
      nameKo: "미토선",
      color: "#3333ff",
      lineIds: ["Mito"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 48
    },
    {
      code: "MIY",
      nameJa: "弥彦線",
      nameZh: "弥彦线",
      nameEn: "Miyo Line",
      nameKo: "야히코선",
      color: "#922790",
      lineIds: ["Miyo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 49
    },
    {
      code: "OFU",
      nameJa: "大船渡線",
      nameZh: "大船渡线",
      nameEn: "Ofunato Line",
      nameKo: "오후나토선",
      color: "#f18e44",
      lineIds: ["Ofunato"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 50
    },
    {
      code: "OGA",
      nameJa: "男鹿線",
      nameZh: "男鹿线",
      nameEn: "Oga Line",
      nameKo: "오가선",
      color: "#36823e",
      lineIds: ["Oga"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 51
    },
    {
      code: "OIT",
      nameJa: "大糸線",
      nameZh: "大糸线",
      nameEn: "Oito Line",
      nameKo: "오이토선",
      color: "#9370db",
      lineIds: ["Oito"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 52
    },
    {
      code: "OMI",
      nameJa: "大湊線",
      nameZh: "大凑线",
      nameEn: "Ominato Line",
      nameKo: "오미나토선",
      color: "#f1aa28",
      lineIds: ["Ominato"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 53
    },
    {
      code: "OUM",
      nameJa: "奥羽本線",
      nameZh: "奥羽本线",
      nameEn: "Ou Main Line",
      nameKo: "오우 본선",
      color: "#ee7b28",
      lineIds: ["OuMain"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 54
    },
    {
      code: "RIE",
      nameJa: "陸羽東線",
      nameZh: "陆羽东线",
      nameEn: "Rikuto East Line",
      nameKo: "리쿠토토호쿠선",
      color: "#888888",
      lineIds: ["RikutoEast"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 55
    },
    {
      code: "RIW",
      nameJa: "陸羽西線",
      nameZh: "陆羽西线",
      nameEn: "Rikuto West Line",
      nameKo: "리쿠토사이선",
      color: "#6fbf7f",
      lineIds: ["RikutsuWest"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 56
    },
    {
      code: "RYO",
      nameJa: "両毛線",
      nameZh: "两毛线",
      nameEn: "Ryomo Line",
      nameKo: "료모선",
      color: "#ffd400",
      lineIds: ["Ryomo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 57
    },
    {
      code: "SAN",
      nameJa: "山田線",
      nameZh: "山田线",
      nameEn: "Yamada Line",
      nameKo: "야마다선",
      color: "#cd7a1e",
      lineIds: ["Yamada"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 58
    },
    {
      code: "SEK",
      nameJa: "仙石線",
      nameZh: "仙石线",
      nameEn: "Senseki Line",
      nameKo: "센세키선",
      color: "#00aaee",
      lineIds: ["Senseki"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 59
    },
    {
      code: "SET",
      nameJa: "仙石東北ライン",
      nameZh: "仙石东北线",
      nameEn: "Senseki-Tohoku Line",
      nameKo: "센세키토호쿠 라인",
      color: "#3cb371",
      lineIds: ["SensekiTohoku"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 60
    },
    {
      code: "SEZ",
      nameJa: "仙山線",
      nameZh: "仙山线",
      nameEn: "Senzan Line",
      nameKo: "센잔선",
      color: "#72bc4a",
      lineIds: ["Senzan"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 61
    },
    {
      code: "SHN",
      nameJa: "篠ノ井線",
      nameZh: "篠之井线",
      nameEn: "Shinonoi Line",
      nameKo: "시노노이선",
      color: "#d56a29",
      lineIds: ["Shinonoi"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 63
    },
    {
      code: "SUI",
      nameJa: "水郡線",
      nameZh: "水郡线",
      nameEn: "Suigun Line",
      nameKo: "스이군선",
      color: "#368c44",
      lineIds: ["Suigun","SuigunBranch"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 64
    },
    {
      code: "TAD",
      nameJa: "只見線",
      nameZh: "只见线",
      nameEn: "Tadami Line",
      nameKo: "타다미선",
      color: "#008dd1",
      lineIds: ["Tadami"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 65
    },
    {
      code: "TAZ",
      nameJa: "田沢湖線",
      nameZh: "田泽湖线",
      nameEn: "Tazawako Line",
      nameKo: "타자와코선",
      color: "#9d72b0",
      lineIds: ["Tazawako"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 66
    },
    {
      code: "TSU",
      nameJa: "津軽線",
      nameZh: "津轻线",
      nameEn: "Tsugaru Line",
      nameKo: "츠가루선",
      color: "#15a2c4",
      lineIds: ["Tsugaru"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 67
    },
    {
      code: "UET",
      nameJa: "羽越本線",
      nameZh: "羽越本线",
      nameEn: "Uetsu Main Line",
      nameKo: "우에츠 본선",
      color: "#16c0e9",
      lineIds: ["Uetsu"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 68
    },
    {
      code: "YAM",
      nameJa: "山形線",
      nameZh: "山形线",
      nameEn: "Yamagata Line",
      nameKo: "야마가타선",
      color: "#ee7b28",
      lineIds: ["Yamagata"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 69
    },
    {
      code: "YON",
      nameJa: "米坂線",
      nameZh: "米坂线",
      nameEn: "Yonezawa Line",
      nameKo: "요네자와선",
      color: "#9b7eb9",
      lineIds: ["Yonezawa"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 70
    }
  ],
  "TOKYO_METRO": [
    {
      code: "C",
      nameJa: "千代田線",
      nameZh: "千代田线",
      nameEn: "Chiyoda Line",
      nameKo: "치요다선",
      color: "#009944",
      lineIds: ["Chiyoda", "ChiyodaBranch"],
      icon: "../images/鉄道/東京メトロ/千代田線.png",
      order: 1
    },
    {
      code: "F",
      nameJa: "副都心線",
      nameZh: "副都心线",
      nameEn: "Fukutoshin Line",
      nameKo: "후쿠토신선",
      color: "#9c5e31",
      lineIds: ["Fukutoshin"],
      icon: "../images/鉄道/東京メトロ/副都心線.png",
      order: 2
    },
    {
      code: "G",
      nameJa: "銀座線",
      nameZh: "银座线",
      nameEn: "Ginza Line",
      nameKo: "긴자선",
      color: "#ff9500",
      lineIds: ["Ginza"],
      icon: "../images/鉄道/東京メトロ/銀座線.png",
      order: 3
    },
    {
      code: "H",
      nameJa: "日比谷線",
      nameZh: "日比谷线",
      nameEn: "Hibiya Line",
      nameKo: "히비야선",
      color: "#b5b5ac",
      lineIds: ["Hibiya"],
      icon: "../images/鉄道/東京メトロ/日比谷線.png",
      order: 4
    },
    {
      code: "M",
      nameJa: "丸ノ内線",
      nameZh: "丸之内线",
      nameEn: "Marunouchi Line",
      nameKo: "마루노우치선",
      color: "#f31630",
      lineIds: ["Marunouchi", "MarunouchiBranch"],
      icon: "../images/鉄道/東京メトロ/丸ノ内線.png",
      order: 5
    },
    {
      code: "N",
      nameJa: "南北線",
      nameZh: "南北线",
      nameEn: "Namboku Line",
      nameKo: "난보쿠선",
      color: "#00ac9a",
      lineIds: ["Namboku"],
      icon: "../images/鉄道/東京メトロ/南北線.png",
      order: 6
    },
    {
      code: "T",
      nameJa: "東西線",
      nameZh: "东西线",
      nameEn: "Tozai Line",
      nameKo: "도자이선",
      color: "#00a7db",
      lineIds: ["Tozai"],
      icon: "../images/鉄道/東京メトロ/東西線.png",
      order: 7
    },
    {
      code: "Y",
      nameJa: "有楽町線",
      nameZh: "有乐町线",
      nameEn: "Yurakucho Line",
      nameKo: "유라쿠초선",
      color: "#c1a46e",
      lineIds: ["Yurakucho"],
      icon: "../images/鉄道/東京メトロ/有楽町線.png",
      order: 8
    },
    {
      code: "Z",
      nameJa: "半蔵門線",
      nameZh: "半藏门线",
      nameEn: "Hanzomon Line",
      nameKo: "한조몬선",
      color: "#8f76d6",
      lineIds: ["Hanzomon"],
      icon: "../images/鉄道/東京メトロ/半蔵門線.png",
      order: 9
    }
  ],
  "TOEI": [
    {
      code: "A",
      nameJa: "浅草線",
      nameZh: "浅草线",
      nameEn: "Asakusa Line",
      nameKo: "아사쿠사선",
      color: "#e8525b",
      lineIds: ["Asakusa"],
      icon: "../images/鉄道/都営地下鉄/都営浅草線.png",
      order: 1
    },
    {
      code: "E",
      nameJa: "大江戸線",
      nameZh: "大江户线",
      nameEn: "Oedo Line",
      nameKo: "오에도선",
      color: "#b6006a",
      lineIds: ["Oedo"],
      icon: "../images/鉄道/都営地下鉄/都営大江戸線.png",
      order: 2
    },
    {
      code: "I",
      nameJa: "三田線",
      nameZh: "三田线",
      nameEn: "Mita Line",
      nameKo: "미타선",
      color: "#0079c2",
      lineIds: ["Mita"],
      icon: "../images/鉄道/都営地下鉄/都営三田線.png",
      order: 3
    },
    {
      code: "S",
      nameJa: "新宿線",
      nameZh: "新宿线",
      nameEn: "Shinjuku Line",
      nameKo: "신주쿠선",
      color: "#6cbb5a",
      lineIds: ["Shinjuku"],
      icon: "../images/鉄道/都営地下鉄/都営新宿線.png",
      order: 4
    },
    {
      code: "K",
      nameJa: "都電荒川線",
      nameZh: "都电荒川线",
      nameEn: "Toden Arakawa Line",
      nameKo: "토덴 아라카와선",
      color: "#E040A0",
      lineIds: ["Arakawa"],
      icon: "../images/鉄道/都営地下鉄/都電荒川線.png",
      order: 5
    },
    {
      code: "NT",
      nameJa: "日暮里・舎人ライナー",
      nameZh: "日暮里・舍人Liner",
      nameEn: "Nippori-Toneri Liner",
      nameKo: "닛포리・토네리 라이너",
      color: "#ed6d00",
      lineIds: ["Nippori_Toneri"],
      icon: "../images/鉄道/都営地下鉄/日暮里・舎人ライナー.png",
      order: 6
    }
  ],
  "TOBU": [
    {
      code: "TD",
      nameJa: "野田線（アーバンパークライン）",
      nameZh: "野田线（都市公园线）",
      nameEn: "Noda Line (Urban Park Line)",
      nameKo: "노다선（어반 파크 라인）",
      color: "#0093d0",
      lineIds: ["Noda"],
      icon: "../images/鉄道/東武鉄道/野田線.png",
      order: 1
    },
    {
      code: "TS",
      nameJa: "東武スカイツリーライン",
      nameZh: "东武晴空塔线",
      nameEn: "Tobu Skytree Line",
      nameKo: "토부 스카이트리 라인",
      color: "#0f6cc3",
      lineIds: ["TobuSkytree"],
      icon: "../images/鉄道/東武鉄道/東武スカイツリーライン.png",
      order: 2
    },
    {
      code: "TI",
      nameJa: "伊勢崎線",
      nameZh: "伊势崎线",
      nameEn: "Tobu Isesaki Line",
      nameKo: "이세사키선",
      color: "#0f6cc3",
      lineIds: ["TobuIsesaki"],
      icon: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
      order: 2.5
    },
    {
      code: "TJ",
      nameJa: "東上線",
      nameZh: "东上线",
      nameEn: "Tojo Line",
      nameKo: "토조선",
      color: "#000099",
      lineIds: ["Tojo"],
      icon: "../images/鉄道/東武鉄道/東武東上線.png",
      order: 3
    },
    {
      code: "TN",
      nameJa: "日光線",
      nameZh: "日光线",
      nameEn: "Nikko Line",
      nameKo: "닛코선",
      color: "#ffa600",
      lineIds: ["TobuNikko"],
      icon: "../images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png",
      order: 4
    },
    {
      code: "TK",
      nameJa: "鬼怒川線",
      nameZh: "鬼怒川线",
      nameEn: "Kinugawa Line",
      nameKo: "키누가와선",
      color: "#ffa600",
      lineIds: ["Nikkoku"],
      icon: "../images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png",
      order: 5
    },
    {
      code: "TU",
      nameJa: "宇都宮線",
      nameZh: "宇都宫线",
      nameEn: "Utsunomiya Line",
      nameKo: "우츠노미야선",
      color: "#ffa600",
      lineIds: ["Utsunomiya"],
      icon: "../images/鉄道/東武鉄道/宇都宮線.png",
      order: 6
    },
    {
      code: "DTB",
      nameJa: "大師線",
      nameZh: "大师线",
      nameEn: "Daishi Line",
      nameKo: "다이시선",
      color: "#0f6cc3",
      lineIds: ["Daishi_Tobu"],
      icon: "../images/鉄道/東武鉄道/大師線.png",
      order: 7
    },
    {
      code: "TKM",
      nameJa: "亀戸線",
      nameZh: "龟户线",
      nameEn: "Kameido Line",
      nameKo: "카메이도선",
      color: "#0f6cc3",
      lineIds: ["Tobu_Kameido"],
      icon: "../images/鉄道/東武鉄道/亀戸線.png",
      order: 8
    },
    {
      code: "TOG",
      nameJa: "越生線",
      nameZh: "越生线",
      nameEn: "Ogose Line",
      nameKo: "오고세선",
      color: "#000099",
      lineIds: ["Ogose"],
      icon: "../images/鉄道/東武鉄道/越生線.png",
      order: 9
    },
    {
      code: "TQZ",
      nameJa: "小泉線",
      nameZh: "小泉线",
      nameEn: "Koizumi Line",
      nameKo: "코이즈미선",
      color: "#ff0000",
      lineIds: ["Koizumi"],
      icon: "../images/鉄道/東武鉄道/小泉線.png",
      order: 10
    },
    {
      code: "SAN",
      nameJa: "佐野線",
      nameZh: "佐野线",
      nameEn: "Sano Line",
      nameKo: "사노선",
      color: "#ff0000",
      lineIds: ["Sano"],
      icon: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
      order: 11
    },
    {
      code: "KIR",
      nameJa: "桐生線",
      nameZh: "桐生线",
      nameEn: "Kiryu Line",
      nameKo: "키류선",
      color: "#ff0000",
      lineIds: ["Kiryu"],
      icon: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
      order: 12
    }
  ],
  "SEIBU": [
    {
      code: "SI",
      nameJa: "池袋線",
      nameZh: "池袋线",
      nameEn: "Ikebukuro Line",
      nameKo: "이케부쿠로선",
      color: "#EF7A00",
      lineIds: ["Ikebukuro"],
      icon: "../images/鉄道/西武鉄道/西武池袋線.png",
      order: 1
    },
    {
      code: "STO",
      nameJa: "豊島線",
      nameZh: "丰岛线",
      nameEn: "Toshima Line",
      nameKo: "토시마선",
      color: "#EF7A00",
      lineIds: ["SeibuToshima"],
      icon: "../images/鉄道/西武鉄道/西武豊島線.png",
      order: 2
    },
    {
      code: "SCH",
      nameJa: "秩父線",
      nameZh: "秩父线",
      nameEn: "Chichibu Line",
      nameKo: "치치부선",
      color: "#EF7A00",
      lineIds: ["SeibuChichibu"],
      icon: "../images/鉄道/西武鉄道/西武秩父線.png",
      order: 3
    },
    {
      code: "SYU",
      nameJa: "西武有楽町線",
      nameZh: "西武有乐町线",
      nameEn: "Seibu Yurakucho Line",
      nameKo: "세이부 유라쿠초선",
      color: "#EF7A00",
      lineIds: ["Yurakucho_Seibu"],
      icon: "../images/鉄道/西武鉄道/西武有楽町線.png",
      order: 4
    },
    {
      code: "SSA",
      nameJa: "狭山線",
      nameZh: "狭山线",
      nameEn: "Sayama Line",
      nameKo: "사야마선",
      color: "#EF7A00",
      lineIds: ["Seibu_Sayama"],
      icon: "../images/鉄道/西武鉄道/西武狭山線.png",
      order: 5
    },
    {
      code: "SEN",
      nameJa: "西武園線",
      nameZh: "西武园线",
      nameEn: "Seibu-en Line",
      nameKo: "세이부엔선",
      color: "#1EAD4C",
      lineIds: ["SeibuEn"],
      icon: "../images/鉄道/西武鉄道/西武園線.png",
      order: 6
    },
    {
      code: "SK",
      nameJa: "国分寺線",
      nameZh: "国分寺线",
      nameEn: "Kokubunji Line",
      nameKo: "코쿠분지선",
      color: "#1EAD4C",
      lineIds: ["Kokubunji"],
      icon: "../images/鉄道/西武鉄道/西武国分寺線.png",
      order: 7
    },
    {
      code: "SS",
      nameJa: "新宿線",
      nameZh: "新宿线",
      nameEn: "Shinjuku Line",
      nameKo: "신주쿠선",
      color: "#01A6BF",
      lineIds: ["SeibuShinjuku"],
      icon: "../images/鉄道/西武鉄道/西武新宿線.png",
      order: 8
    },
    {
      code: "SHM",
      nameJa: "拝島線",
      nameZh: "拜岛线",
      nameEn: "Haijima Line",
      nameKo: "하이지마선",
      color: "#01A6BF",
      lineIds: ["Haijima"],
      icon: "../images/鉄道/西武鉄道/西武拝島線.png",
      order: 9
    },
    {
      code: "ST",
      nameJa: "多摩湖線",
      nameZh: "多摩湖线",
      nameEn: "Tamako Line",
      nameKo: "타마코선",
      color: "#F7AF0E",
      lineIds: ["SeibuTamako"],
      icon: "../images/鉄道/西武鉄道/西武多摩湖線.png",
      order: 10
    },
    {
      code: "SW",
      nameJa: "多摩川線",
      nameZh: "多摩川线",
      nameEn: "Tamagawa Line",
      nameKo: "타마가와선",
      color: "#EF7A00",
      lineIds: ["SeibuTamagawa"],
      icon: "../images/鉄道/西武鉄道/西武多摩川線.png",
      order: 11
    },
    {
      code: "SY",
      nameJa: "山口線",
      nameZh: "山口线",
      nameEn: "Yamaguchi Line",
      nameKo: "야마구치선",
      color: "#E83E2F",
      lineIds: ["SeibuYamaguchi"],
      icon: "../images/鉄道/西武鉄道/西武山口線.png",
      order: 12
    }
  ],
  "TOKYU": [
    {
      code: "DT",
      nameJa: "田園都市線",
      nameZh: "田园都市线",
      nameEn: "Den-en-toshi Line",
      nameKo: "덴엔토시선",
      color: "#00a850",
      lineIds: ["TokyuDenEn"],
      icon: "../images/鉄道/東急電鉄/田園都市線.png",
      order: 1
    },
    {
      code: "TM",
      nameJa: "東急多摩川線",
      nameZh: "东急多摩川线",
      nameEn: "Tokyu Tamagawa Line",
      nameKo: "도큐 타마가와선",
      color: "#ae0378",
      lineIds: ["TokyuTamagawa"],
      icon: "../images/鉄道/東急電鉄/東急多摩川線.png",
      order: 2
    },
    {
      code: "TY",
      nameJa: "東横線",
      nameZh: "东横线",
      nameEn: "Toyoko Line",
      nameKo: "토요코선",
      color: "#da0442",
      lineIds: ["TokyuToyoko"],
      icon: "../images/鉄道/東急電鉄/東横線.png",
      order: 3
    },
    {
      code: "OM",
      nameJa: "東急大井町線",
      nameZh: "东急大井町线",
      nameEn: "Tokyu Oimachi Line",
      nameKo: "도큐 오이마치선",
      color: "#f18c43",
      lineIds: ["TokyuOimachi"],
      icon: "../images/鉄道/東急電鉄/大井町線.png",
      order: 4
    },
    {
      code: "MG",
      nameJa: "東急目黒線",
      nameZh: "东急目黑线",
      nameEn: "Tokyu Meguro Line",
      nameKo: "도큐 메구로선",
      color: "#009cd2",
      lineIds: ["TokyuMeguro"],
      icon: "../images/鉄道/東急電鉄/目黒線.png",
      order: 5
    },
    {
      code: "IK",
      nameJa: "東急池上線",
      nameZh: "东急池上线",
      nameEn: "Tokyu Ikegami Line",
      nameKo: "도큐 이케가미선",
      color: "#ee86a7",
      lineIds: ["TokyuIkegami"],
      icon: "../images/鉄道/東急電鉄/池上線.png",
      order: 6
    },
    {
      code: "SG",
      nameJa: "東急世田谷線",
      nameZh: "东急世田谷线",
      nameEn: "Tokyu Setagaya Line",
      nameKo: "도큐 세타가야선",
      color: "#fcc70d",
      lineIds: ["TokyuSetagaya"],
      icon: "../images/鉄道/東急電鉄/世田谷線.png",
      order: 7
    },
    {
      code: "KD",
      nameJa: "東急こどもの国線",
      nameZh: "东急儿童国线",
      nameEn: "Tokyu Kodomonokuni Line",
      nameKo: "도큐 코도모노쿠니선",
      color: "#0068b7",
      lineIds: ["TokyuKodomonokuni"],
      icon: "../images/鉄道/東急電鉄/こどもの国線.png",
      order: 8
    }
  ],
  "YOKOHAMA_MUNICIPAL": [
    {
      code: "B",
      nameJa: "ブルーライン",
      nameZh: "蓝线",
      nameEn: "Blue Line",
      nameKo: "블루 라인",
      color: "#00A0C7",
      lineIds: ["YokohamaBlue"],
      icon: "../images/鉄道/横浜市交通局/ブルーライン.png",
      order: 1
    },
    {
      code: "GR",
      nameJa: "グリーンライン",
      nameZh: "绿线",
      nameEn: "Green Line",
      nameKo: "그린 라인",
      color: "#00A859",
      lineIds: ["YokohamaGreen"],
      icon: "../images/鉄道/横浜市交通局/グリーンライン.png",
      order: 2
    }
  ],
  "KEIO": [
    {
      code: "IN",
      nameJa: "井の頭線",
      nameZh: "井之头线",
      nameEn: "Inokashira Line",
      nameKo: "이노카시라선",
      color: "#000088",
      lineIds: ["KeioInokashira"],
      icon: "../images/鉄道/京王電鉄/井の頭線.png",
      order: 1
    },
    {
      code: "KO",
      nameJa: "京王線",
      nameZh: "京王线",
      nameEn: "Keio Line",
      nameKo: "케이오선",
      color: "#dd0076",
      lineIds: ["KeioMain"],
      icon: "../images/鉄道/京王電鉄/京王線.png",
      order: 2
    },
    {
      code: "KSN",
      nameJa: "京王新線",
      nameZh: "京王新线",
      nameEn: "Keio New Line",
      nameKo: "케이오 신선",
      color: "#dd0076",
      lineIds: ["KeioShin"],
      icon: "../images/鉄道/京王電鉄/京王新線.png",
      order: 3
    },
    {
      code: "KSM",
      nameJa: "相模原線",
      nameZh: "相模原线",
      nameEn: "Sagamihara Line",
      nameKo: "사가미하라선",
      color: "#dd0076",
      lineIds: ["KeioSagami"],
      icon: "../images/鉄道/京王電鉄/相模原線.png",
      order: 4
    },
    {
      code: "KTK",
      nameJa: "高尾線",
      nameZh: "高尾线",
      nameEn: "Takao Line",
      nameKo: "타카오선",
      color: "#dd0076",
      lineIds: ["KeioTakao"],
      icon: "../images/鉄道/京王電鉄/高尾線.png",
      order: 5
    },
    {
      code: "KKB",
      nameJa: "競馬場線",
      nameZh: "竞马场线",
      nameEn: "Keibajo Line",
      nameKo: "케이바조선",
      color: "#dd0076",
      lineIds: ["KeioKeibajo"],
      icon: "../images/鉄道/京王電鉄/競馬場線.png",
      order: 6
    },
    {
      code: "KZO",
      nameJa: "動物園線",
      nameZh: "动物园线",
      nameEn: "Dobutsuen Line",
      nameKo: "도부츠엔선",
      color: "#dd0076",
      lineIds: ["KeioZoo"],
      icon: "../images/鉄道/京王電鉄/動物園線.png",
      order: 7
    }
  ],
  "ODAKYU": [
    {
      code: "OH",
      nameJa: "小田原線",
      nameZh: "小田原线",
      nameEn: "Odawara Line",
      nameKo: "오다와라선",
      color: "#2288cc",
      lineIds: ["Odawara"],
      icon: "../images/鉄道/小田急電鉄/小田原線.png",
      order: 1
    },
    {
      code: "OE",
      nameJa: "江ノ島線",
      nameZh: "江之岛线",
      nameEn: "Enoshima Line",
      nameKo: "에노시마선",
      color: "#2288cc",
      lineIds: ["OdakyuEnoshima"],
      icon: "../images/鉄道/小田急電鉄/江ノ島線.png",
      order: 2
    },
    {
      code: "OT",
      nameJa: "多摩線",
      nameZh: "多摩线",
      nameEn: "Tama Line",
      nameKo: "타마선",
      color: "#2288cc",
      lineIds: ["OdakyuTama"],
      icon: "../images/鉄道/小田急電鉄/多摩線.png",
      order: 3
    }
  ],
  "KEISEI": [
    {
      code: "KS",
      nameJa: "本線",
      nameZh: "本线",
      nameEn: "Main Line",
      nameKo: "본선",
      color: "#0054a6",
      lineIds: ["Keisei"],
      icon: "../images/鉄道/京成電鉄/京成本線.png",
      order: 1
    },
    {
      code: "KOS",
      nameJa: "押上線",
      nameZh: "押上线",
      nameEn: "Oshiage Line",
      nameKo: "오시아게선",
      color: "#0054a6",
      lineIds: ["KeiseiOshiage"],
      icon: "../images/鉄道/京成電鉄/京成押上線.png",
      order: 2
    },
    {
      code: "KNS",
      nameJa: "金町線",
      nameZh: "金町线",
      nameEn: "Kanamachi Line",
      nameKo: "카나마치선",
      color: "#0054a6",
      lineIds: ["KeiseiKanamachi"],
      icon: "../images/鉄道/京成電鉄/京成金町線.png",
      order: 3
    },
    {
      code: "KCB",
      nameJa: "千葉線",
      nameZh: "千叶线",
      nameEn: "Chiba Line",
      nameKo: "치바선",
      color: "#0054a6",
      lineIds: ["KeiseiChiba"],
      icon: "../images/鉄道/京成電鉄/京成千葉線.png",
      order: 4
    },
    {
      code: "KCH",
      nameJa: "千原線",
      nameZh: "千原线",
      nameEn: "Chihara Line",
      nameKo: "치하라선",
      color: "#0054a6",
      lineIds: ["KeiseiChihara"],
      icon: "../images/鉄道/京成電鉄/京成千原線.png",
      order: 5
    },
    {
      code: "KSA",
      nameJa: "成田スカイアクセス線",
      nameZh: "成田机场Access线",
      nameEn: "Narita Sky Access Line",
      nameKo: "나리타 스카이 액세스선",
      color: "#f39800",
      lineIds: ["NaritaSkyAccess"],
      icon: "../images/鉄道/京成電鉄/成田スカイアクセス.png",
      order: 6
    }
  ],
  "KEIKYU": [
    {
      code: "KK",
      nameJa: "本線",
      nameZh: "本线",
      nameEn: "Main Line",
      nameKo: "본선",
      color: "#e60012",
      lineIds: ["Keikyu"],
      icon: "../images/鉄道/京急電鉄/京急本線.png",
      order: 1
    },
    {
      code: "KKA",
      nameJa: "空港線",
      nameZh: "机场线",
      nameEn: "Airport Line",
      nameKo: "공항선",
      color: "#F15A22",
      lineIds: ["KeikyuAirport"],
      icon: "../images/鉄道/京急電鉄/空港線.png",
      order: 2
    },
    {
      code: "KKU",
      nameJa: "久里浜線",
      nameZh: "久里滨线",
      nameEn: "Kurihama Line",
      nameKo: "쿠리하마선",
      color: "#e60012",
      lineIds: ["KeikyuKurihama"],
      icon: "../images/鉄道/京急電鉄/久里浜線.png",
      order: 3
    },
    {
      code: "KKZ",
      nameJa: "逗子線",
      nameZh: "逗子线",
      nameEn: "Zushi Line",
      nameKo: "즈시선",
      color: "#e60012",
      lineIds: ["KeikyuZushi"],
      icon: "../images/鉄道/京急電鉄/逗子線.png",
      order: 4
    },
    {
      code: "KKD",
      nameJa: "大師線",
      nameZh: "大师线",
      nameEn: "Daishi Line",
      nameKo: "다이시선",
      color: "#e60012",
      lineIds: ["Daishi_Keikyu"],
      icon: "../images/鉄道/京急電鉄/大師線.png",
      order: 5
    }
  ],
  "SOTETSU": [
    {
      code: "SO",
      nameJa: "本線",
      nameZh: "本线",
      nameEn: "Main Line",
      nameKo: "본선",
      color: "#003366",
      lineIds: ["SotetsuMain"],
      icon: "../images/鉄道/相鉄/相鉄本線.png",
      order: 1
    },
    {
      code: "SIZ",
      nameJa: "いずみ野線",
      nameZh: "泉野线",
      nameEn: "Izumino Line",
      nameKo: "이즈미노선",
      color: "#003366",
      lineIds: ["SotetsuIzumino"],
      icon: "../images/鉄道/相鉄/相鉄いずみ野線.png",
      order: 2
    },
    {
      code: "SSH",
      nameJa: "相鉄新横浜線",
      nameZh: "相铁新横滨线",
      nameEn: "Sotetsu Shin-Yokohama Line",
      nameKo: "소테츠 신요코하마선",
      color: "#003366",
      lineIds: ["SotetsuShin-Yokohama"],
      icon: "../images/鉄道/相鉄/相鉄新横浜線.png",
      order: 3
    }
  ],
  "TSUKUBA_EXPRESS": [
    {
      code: "TX",
      nameJa: "つくばエクスプレス",
      nameZh: "筑波快线",
      nameEn: "Tsukuba Express",
      nameKo: "츠쿠바 익스프레스",
      color: "#d91e18",
      lineIds: ["TsukubaExpress"],
      icon: "../images/鉄道/首都圏新都市鉄道/つくばエクスプレス.png",
      order: 1
    }
  ],
  "TAMA_MONORAIL": [
    {
      code: "TT",
      nameJa: "多摩モノレール線",
      nameZh: "多摩单轨线",
      nameEn: "Tama Toshi Monorail Line",
      nameKo: "타마 도시 모노레일 선",
      color: "#ff6633",
      lineIds: ["TamaMonorail"],
      icon: "../images/鉄道/多摩都市モノレール/多摩都市モノレール線.png",
      order: 1
    }
  ],
  "RINKAI": [
    {
      code: "R",
      nameJa: "りんかい線",
      nameZh: "临海线",
      nameEn: "Rinkai Line",
      nameKo: "린카이선",
      color: "#009587",
      lineIds: ["Rinkai"],
      icon: "../images/鉄道/東京臨海高速鉄道/臨海線.png",
      order: 1
    }
  ],
  "MINATO_MIRAI": [
    {
      code: "MM",
      nameJa: "みなとみらい線",
      nameZh: "港未来线",
      nameEn: "Minatomirai Line",
      nameKo: "미나토미라이선",
      color: "#003399",
      lineIds: ["MinatoMirai"],
      icon: "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
      order: 1
    }
  ],
  "YURIKAMOME": [
    {
      code: "U",
      nameJa: "ゆりかもめ",
      nameZh: "百合鸥",
      nameEn: "Yurikamome",
      nameKo: "유리카모메",
      color: "#004fa8",
      lineIds: ["Yurikamome"],
      icon: "../images/鉄道/ゆりかもめ/ゆりかもめ.png",
      order: 1
    }
  ],
  "SAITAMA_NEW_URBAN_TRANSIT": [
    {
      code: "NS",
      nameJa: "埼玉新都市交通伊奈線（ニューシャトル）",
      nameZh: "埼玉新都市交通伊奈线（新穿梭）",
      nameEn: "Saitama New Urban Transit Ina Line (New Shuttle)",
      nameKo: "사이타마 신도시 교통 이나선（뉴 셔틀）",
      color: "#ea5504",
      lineIds: ["NewShuttle"],
      icon: "../images/鉄道/埼玉新都市交通/伊奈線.png",
      order: 1
    }
  ],
  "TOKYO_MONORAIL": [
    {
      code: "MO",
      nameJa: "東京モノレール羽田空港線",
      nameZh: "东京单轨电车羽田机场线",
      nameEn: "Tokyo Monorail Haneda Airport Line",
      nameKo: "도쿄 모노레일 하네다 공항선",
      color: "#0b70b8",
      lineIds: ["TokyoMonorail"],
      icon: "../images/鉄道/東京モノレール/東京モノレール羽田空港線.png",
      order: 1
    }
  ],
};

/*
 * Line color resolver — single authority for official line colors.
 * Consumers (search-ui, trains-page) MUST call this instead of reading
 * line.color from railway_data.json (which contains fabricated palette
 * values for many lines). LOS is the presentation authority for official HEX.
 */
window.LineOperationSystemsResolveColor = function(lineId) {
  if (!lineId) return null;
  var LOS = window.LineOperationSystems;
  if (!LOS) return null;
  for (var g in LOS) {
    var arr = LOS[g];
    if (!Array.isArray(arr)) continue;
    for (var i = 0; i < arr.length; i++) {
      var sys = arr[i];
      if (sys.lineIds && sys.lineIds.indexOf(lineId) !== -1) {
        return sys.color || null;
      }
    }
  }
  return null;
};
/*
 * Line icon resolver - single authority for system-card icons.
 * Consumers (search-ui, data-state) MUST call this before reading line.image,
 * matching the ResolveColor pattern. LOS owns the icon of every running system.
 */
window.LineOperationSystemsResolveIcon = function(lineId) {
  if (!lineId) return null;
  var LOS = window.LineOperationSystems;
  if (!LOS) return null;
  for (var g in LOS) {
    var arr = LOS[g];
    if (!Array.isArray(arr)) continue;
    for (var i = 0; i < arr.length; i++) {
      var sys = arr[i];
      if (sys.lineIds && sys.lineIds.indexOf(lineId) !== -1) {
        return sys.icon || null;
      }
    }
  }
  return null;
};


// ===== platform-data.js =====
/**
 * Pixel Tetsudo - 発着番線データ（Platform Data, v4.3.601）
 *
 * 能力归属：新 Provider（数据查询层）——搜索结果的乗車段显示"何番線から発車"。
 * 数据源：ja.wikipedia 各駅「のりば」節（出典注記：JR東日本駅構内図 / 交通新聞社JR時刻表2026年9月号）——
 *         ODPT TrainTimetable 实测无 platformNumber（tto 仅 departure/arrival Time），
 *         JR公式時刻表网页（tt1039/1039090 等）亦无番線信息——番線只能手建（Known Debt 方案 B）。
 *
 * 结构：PLATFORM_DATA[lineId][stationId][direction] = 番線表示文字列
 *   direction：与 route-search buildRouteSegments 一致——线路站序（LINE_STATION_ORDER）升序=1、降序=-1、
 *              direction=0（无法判定，如起终点不在站序）时查 "*" 兜底键。
 *   方向映射规则：本地站序为物理站序（如 ChuoRapid Tokyo@0→Takao@23 = 下り方向），
 *                 wiki のりば的"下り/上り/北行/南行/内回り/外回り"按该线站序方向人工换算后落表。
 *   表示字符串：番线区间用"・"（如 "7・8"）；"主に"类备注不写入，仅保留确定性/常用番线。
 *
 * 覆盖范围（v4.3.601）：首都圏 66 站/23 线（v4.3.594 首版 8 枢纽 → v4.3.597 山手線全域+中央線沿線+京浜東北
 *       → v4.3.601 中央線沿線完備（高尾まで）+京浜東北南側+常磐快速（北千住/松戸/柏）+東海道川崎+南武
 *       +湘南新宿/埼京 赤羽・浦和+総武快速/本線/内房/外房 千葉+武蔵野線 西国分寺）。
 * 遗留：其余站/线番线待后续扩充；Yamanote@東京 因环线 direction 判定歧义（站序切点在東京，
 *       内外回 direction 均判 1）故意不收录，避免错误引导；常磐緩行線（4-6番線）未收录（緩行=千代田線直通系）。
 */
window.PLATFORM_DATA = {
  // ===== 中央線快速（東京@0 → 高尾@23；下り=立川・高尾方面=升序1） =====
  "ChuoRapid": {
    "Tokyo": { "1": "1・2" },                // 下り（御茶ノ水・新宿・立川方面）
    "Kanda": { "1": "6", "-1": "5" },        // 下り（御茶ノ水・新宿・高尾）6 / 上り（東京）5
    "Shinjuku": { "1": "11・12", "-1": "7・8" }, // 下り（中野・立川・高尾）11・12 / 上り（御茶ノ水・東京）7・8
    "Nakano": { "1": "6", "-1": "7" },       // 下り（武蔵小金井・立川・高尾・大月）6 / 上り（新宿・東京）7
    "Ogikubo": { "1": "3", "-1": "4" },      // 下り（立川・八王子・高尾）3 / 上り（中野・新宿・東京）4
    "Kichijoji": { "1": "3", "-1": "4" },    // 下り（立川・八王子・高尾）3 / 上り（中野・新宿・東京）4
    "Mitaka": { "1": "3・4", "-1": "5・6" }, // 下り（立川・八王子・高尾）3・4 / 上り（中野・新宿・東京）5・6
    "Kokubunji": { "1": "1・2", "-1": "3・4" }, // 下り（立川・八王子・高尾）1・2 / 上り（三鷹・新宿・東京）3・4
    "Tachikawa": { "1": "5・6", "-1": "3・4" }, // 下り（八王子・高尾・甲府）5・6 / 上り（新宿・東京）3・4
    "Hachioji": { "1": "4", "-1": "2" },      // 下り（高尾・甲府・松本）4 / 上り（立川・新宿・東京）2
    "Ochanomizu": { "1": "1", "-1": "4" },    // 下り（新宿・立川・高尾）1 / 上り（神田・東京）4
    "Yotsuya": { "1": "2", "-1": "1" },       // 下り（新宿・立川）2 / 上り（御茶ノ水・東京）1
    "Koenji": { "1": "3", "-1": "4" },        // 下り（三鷹・立川・高尾）3 / 上り（中野・新宿・東京）4
    "Nishi-Ogikubo": { "1": "3", "-1": "4" }, // 下り（立川・八王子・高尾）3 / 上り（中野・新宿・東京）4
    "Musashi-Sakai": { "1": "2", "-1": "1" }, // 下り（立川・八王子・高尾）2 / 上り（吉祥寺・新宿・東京）1
    "Nishi-Kokubunji": { "1": "2", "-1": "1" }, // 下り（立川・八王子・高尾）2 / 上り（三鷹・新宿・東京）1
    "Hino": { "1": "1", "-1": "2" },          // 下り（八王子・高尾）1 / 上り（立川・新宿・東京）2
    "Toyoda": { "1": "1・2", "-1": "3・4" },  // 下り（八王子・高尾）1・2 / 上り（立川・新宿・東京）3・4
    "Nishi-Hachioji": { "1": "2", "-1": "1" }, // 下り（高尾）2 / 上り（新宿・東京）1
    "Takao": { "1": "2・3・4", "-1": "1" }    // 下り（大月・甲府）2・3・4 / 上り（八王子・新宿・東京）1
  },
  // ===== 中央・総武線各駅停車（三鷹@0 → 千葉@38；東行=千葉方面=升序1） =====
  "ChuoSobuLocal": {
    "Mitaka": { "1": "1・2" },               // 東行（中野・新宿・西船橋・千葉）1・2（当駅始発）
    "Nakano": { "1": "2", "-1": "1" },       // 東行（東中野・新宿・千葉）2 / 西行（高円寺・荻窪・三鷹）1
    "Yoyogi": { "1": "4", "-1": "3" },       // 東行（千駄ケ谷・御茶ノ水・千葉）4 / 西行（中野・三鷹）3
    "Shinjuku": { "1": "13", "-1": "16" },   // 東行（水道橋・秋葉原・千葉）13 / 西行（東中野・中野・三鷹）16
    "Akihabara": { "1": "6", "-1": "5" },    // 東行（船橋・千葉）6 / 西行（御茶ノ水・新宿）5
    "Ryogoku": { "1": "2", "-1": "1" },       // 東行（錦糸町・千葉）2 / 西行（秋葉原・新宿）1
    "Suidobashi": { "1": "2", "-1": "1" },     // 東行（御茶ノ水・秋葉原）2 / 西行（新宿・三鷹）1
    "Koenji": { "1": "2", "-1": "1" },       // 東行（新宿・錦糸町・千葉）2 / 西行（三鷹）1
    "Nishi-Ogikubo": { "1": "2", "-1": "1" }, // 東行（新宿・錦糸町・千葉）2 / 西行（三鷹）1
    "Yotsuya": { "1": "3", "-1": "4" },      // 東行（飯田橋・秋葉原・千葉）3 / 西行（信濃町・代々木・三鷹）4
    "Ochanomizu": { "1": "3", "-1": "2" },   // 東行（秋葉原・錦糸町・千葉）3 / 西行（水道橋・飯田橋・三鷹）2
    "Funabashi": { "1": "2", "-1": "1" },    // 東行（幕張本郷・千葉）2 / 西行（西船橋・秋葉原・中野）1
    "Tsudanuma": { "1": "4", "-1": "5・6" }, // 東行（幕張本郷・稲毛・千葉）4 / 西行（西船橋・錦糸町・新宿）5・6（5は当駅始発専用）
    "Chiba": { "-1": "1・2" }                // 西行（西船橋・秋葉原・新宿）1・2（当駅始発）
  },
  // ===== 山手線（環線，東京@0 起点 = 内回り方向；外回り=站序降序-1）※東京不收录（direction 歧义） =====
  "Yamanote": {
    "Kanda": { "1": "3", "-1": "2" },        // 内回り（上野・田端・池袋）3 / 外回り（東京・品川・渋谷）2
    "Akihabara": { "1": "2", "-1": "3" },    // 内回り（上野・池袋）2 / 外回り（東京・品川）3
    "Okachimachi": { "1": "3", "-1": "2" },  // 内回り（上野・田端・池袋）3 / 外回り（秋葉原・東京・品川・目黒）2
    "Ueno": { "1": "2", "-1": "3" },         // 内回り（鶯谷・田端・池袋）2 / 外回り（御徒町・秋葉原・東京）3
    "Uguisudani": { "1": "2", "-1": "3" },   // 内回り（池袋・新宿・渋谷）2 / 外回り（東京・品川・目黒）3
    "Nippori": { "1": "11", "-1": "10" },    // 内回り（池袋・新宿・渋谷）11 / 外回り（上野・東京・品川・目黒）10
    "Tabata": { "1": "2", "-1": "3" },       // 内回り（池袋・新宿・渋谷）2 / 外回り（上野・東京・品川）3
    "Komagome": { "1": "2", "-1": "1" },     // 内回り（池袋・新宿・渋谷）2 / 外回り（田端・上野・東京）1
    "Sugamo": { "1": "2", "-1": "1" },       // 内回り（池袋・新宿・渋谷）2 / 外回り（田端・上野・東京）1
    "Otsuka": { "1": "1", "-1": "2" },       // 内回り（池袋・新宿・渋谷）1 / 外回り（田端・上野・東京）2 ※大塚は駒込/巣鴨と逆
    "Ikebukuro": { "1": "5・6", "-1": "7・8" }, // 内回り（目白・高田馬場・新宿）5・6 / 外回り（大塚・田端・上野）7・8
    "Mejiro": { "1": "1", "-1": "2" },       // 内回り（新宿・渋谷・品川）1 / 外回り（池袋・上野・東京）2
    "Takadanobaba": { "1": "2", "-1": "1" }, // 内回り（新宿・渋谷・品川）2 / 外回り（池袋・田端・上野）1
    "Shinjuku": { "1": "14", "-1": "15" },   // 内回り（原宿・渋谷・品川）14 / 外回り（高田馬場・池袋・上野）15
    "Yoyogi": { "1": "2", "-1": "1" },       // 内回り（原宿・渋谷・品川）2 / 外回り（新宿・池袋・上野）1
    "Harajuku": { "1": "1", "-1": "2" },     // 内回り（渋谷・品川・浜松町・東京）1 / 外回り（新宿・池袋・上野）2
    "Shibuya": { "1": "2", "-1": "1" },      // 内回り（恵比寿・目黒・品川）2 / 外回り（原宿・新宿・池袋）1
    "Ebisu": { "1": "2", "-1": "1" },        // 内回り（目黒・品川・東京）2 / 外回り（渋谷・新宿・池袋）1
    "Meguro": { "1": "1", "-1": "2" },       // 内回り（品川・東京・上野）1 / 外回り（渋谷・新宿・池袋）2
    "Gotanda": { "1": "1", "-1": "2" },      // 内回り（品川・東京・上野）1 / 外回り（渋谷・新宿・池袋）2
    "Osaki": { "1": "1・2", "-1": "3・4" },  // 内回り（品川・東京・上野）1・2 / 外回り（渋谷・新宿・池袋）3・4
    "Shinagawa": { "1": "1", "-1": "3" },    // 内回り（高輪ゲートウェイ・田町・東京）1 / 外回り（大崎・五反田・渋谷）3
    "Takanawa-Gateway": { "1": "1", "-1": "2" }, // 内回り（東京・上野・巣鴨）1 / 外回り（渋谷・新宿・池袋）2
    "Tamachi": { "1": "2", "-1": "3" },      // 内回り（東京・上野・巣鴨）2 / 外回り（渋谷・新宿・池袋）3
    "Hamamatsucho": { "1": "2", "-1": "3" }, // 内回り（東京・上野・池袋）2 / 外回り（品川・渋谷・新宿）3
    "Shimbashi": { "1": "5", "-1": "4" },    // 内回り（東京・上野・池袋）5 / 外回り（品川・渋谷・新宿）4
    "Yurakucho": { "1": "2", "-1": "3" },    // 内回り（東京・上野・池袋）2 / 外回り（品川・目黒・渋谷）3
    "Nishi-Nippori": { "1": "3", "-1": "2" } // 内回り（田端・池袋・新宿・渋谷）3 / 外回り（日暮里・上野・東京・品川）2
  },
  // ===== 京浜東北線（大宮@0 → 大船@46；南行=大船方面=升序1） =====
  "KeihinTohoku": {
    "Omiya": { "1": "1・2" },                // 南行（上野・東京・横浜）当駅始発 1・2
    "Tabata": { "1": "4", "-1": "1" },       // 南行（上野・東京・横浜）4 / 北行（王子・赤羽・大宮）1
    "Nippori": { "1": "9", "-1": "12" },     // 南行（上野・東京・品川・横浜）9 / 北行（田端・赤羽・大宮）12
    "Uguisudani": { "1": "4", "-1": "1" },   // 南行（東京・品川・横浜）4 / 北行（田端・赤羽・大宮）1
    "Ueno": { "1": "4", "-1": "1" },         // 南行（蒲田・横浜・関内）4 / 北行（赤羽・浦和・大宮）1
    "Okachimachi": { "1": "1", "-1": "4" },  // 南行（秋葉原・東京・品川・横浜）1 / 北行（上野・田端・大宮）4
    "Akihabara": { "1": "4", "-1": "1" },    // 南行（東京・横浜）4 / 北行（上野・大宮）1
    "Kanda": { "1": "1", "-1": "4" },        // 南行（東京・品川・横浜）1 / 北行（上野・赤羽・大宮）4
    "Tokyo": { "1": "6", "-1": "3" },        // 南行（蒲田・関内）6 / 北行（上野・大宮）3
    "Yurakucho": { "1": "4", "-1": "1" },    // 南行（品川・横浜・大船）4 / 北行（東京・上野・大宮）1
    "Shimbashi": { "1": "3", "-1": "6" },    // 南行（品川・蒲田・横浜）3 / 北行（東京・上野・大宮）6
    "Hamamatsucho": { "1": "4", "-1": "1" }, // 南行（品川・横浜・大船）4 / 北行（東京・上野・大宮）1
    "Tamachi": { "1": "4", "-1": "1" },      // 南行（大森・横浜・磯子）4 / 北行（東京・上野・大宮）1
    "Takanawa-Gateway": { "1": "4", "-1": "3" }, // 南行（品川・蒲田・横浜・大船）4 / 北行（東京・上野・浦和・大宮）3
    "Shinagawa": { "1": "5", "-1": "4" },    // 南行（大井町・大森・蒲田・横浜）5 / 北行（東京・大宮）4
    "Yokohama": { "-1": "4" },               // 北行（東京・上野・大宮）4
    "Urawa": { "1": "1", "-1": "2" },        // 南行（南浦和・上野・東京）1 / 北行（北浦和・与野・大宮）2
    "Kawaguchi": { "1": "1", "-1": "2" },    // 南行（上野・東京・横浜）1 / 北行（浦和・大宮）2
    "Akabane": { "1": "1", "-1": "2" },      // 南行（上野・東京・横浜）1 / 北行（川口・浦和・大宮）2
    "Oimachi": { "1": "2", "-1": "1" },      // 南行（蒲田・横浜・大船）2 / 北行（品川・東京・大宮）1
    "Omori": { "1": "1", "-1": "2" },        // 南行（蒲田・川崎・横浜）1 / 北行（品川・東京・大宮）2
    "Kamata": { "1": "1・2", "-1": "3・4" }, // 南行（川崎・横浜）1・2 / 北行（品川・東京・大宮）3・4
    "Kawasaki": { "1": "3", "-1": "4" },      // 南行（横浜・関内）3 / 北行（東京・大宮）4
    "Oji": { "1": "2", "-1": "1" },           // 南行（上野・東京・横浜）2 / 北行（赤羽・浦和・大宮）1
    "Ofuna": { "-1": "9・10" },               // 北行（関内・桜木町・上野・大宮）9・10（根岸線終点・南行なし）
    "Nishi-Nippori": { "1": "1", "-1": "4" }  // 南行（上野・東京・横浜）1 / 北行（田端・赤羽・大宮）4
  },
  // ===== 宇都宮線（東京@0 → 黒磯@33；下り=大宮・宇都宮方面=升序1） =====
  "UtsunomiyaJR": {
    "Tokyo": { "1": "7・8" },                // 下り（上野・大宮・宇都宮）7・8
    "Ueno": { "1": "5・6" },                 // 下り（赤羽・大宮・宇都宮・高崎）5・6（ほとんどの列車が5番線）
    "Omiya": { "1": "9", "-1": "3・4" },     // 下り（久喜・小山・宇都宮）9 / 上り（赤羽・東京）3・4（主に4番線）
    "Shinagawa": { "*": "6・7" },            // 品川発は上野東京ライン上り（東京・上野方面）のみ——主に6番線
    "Akabane": { "1": "4", "-1": "3" },      // 下り（浦和・大宮・宇都宮）4 / 上り（上野・東京・品川）3
    "Urawa": { "1": "4", "-1": "3" }         // 下り（大宮・小山・宇都宮）4 / 上り（赤羽・東京・横浜）3
  },
  // ===== 高崎線（東京@0 → 高崎@24；下り=大宮・高崎方面=升序1） =====
  "Takasaki": {
    "Tokyo": { "1": "7・8" },                // 下り（上野・大宮・高崎）7・8
    "Ueno": { "1": "5・6" },                 // 下り（赤羽・大宮・高崎）5・6
    "Omiya": { "1": "8", "-1": "6" },        // 下り（上尾・熊谷・高崎）8 / 上り（東京・上野方面）6（直通列車主に6番線）
    "Shinagawa": { "*": "6・7" },            // 品川発は上野東京ライン上り（東京・上野方面）のみ——主に6番線
    "Akabane": { "1": "4", "-1": "3" },      // 下り（浦和・大宮・高崎）4 / 上り（上野・東京・品川・横浜）3
    "Urawa": { "1": "4", "-1": "3" }         // 下り（大宮・熊谷・高崎）4 / 上り（赤羽・東京・横浜・大船）3
  },
  // ===== 常磐線（快速）（品川@0 → 取手@18；下り=上野・取手方面=升序1） =====
  "Joban": {
    "Shinagawa": { "1": "9・10" },           // 下り（柏・土浦・水戸方面）9・10
    "Tokyo": { "1": "7・8" },                // 下り（上野・柏・取手）7・8
    "Ueno": { "1": "11・12" },               // 下り（松戸・取手・水戸・成田）上野始発快速 主に11・12番線
    "Nippori": { "1": "4", "-1": "3" },      // 下り（北千住・松戸・取手）4 / 上り（上野・東京・品川）3
    "Kita-Senju": { "1": "1", "-1": "3" },   // 下り（松戸・柏・取手・水戸）1 / 上り（日暮里・上野・東京・品川）3
    "Matsudo": { "1": "1", "-1": "3" },      // 下り（柏・取手・水戸）1 / 上り（北千住・上野・東京・品川）3
    "Kashiwa": { "1": "4", "-1": "3" },      // 下り（我孫子・取手・水戸）4 / 上り（松戸・上野・東京・品川）3
    "Abiko": { "1": "1・2", "-1": "2・4" },  // 下り（天王台・取手・土浦・水戸・いわき）1・2（2は待避のみ） / 上り（柏・松戸・上野・東京・品川）2・4（当駅始発は4）
    "Toride": { "-1": "3" }                  // 上り（柏・松戸・上野・東京・品川）3
  },
  // ===== 常磐線（各駅停車/緩行線）（上野@0 → 取手@18；下り=取手方面=升序1） =====
  // ※千代田線直通（代々木上原方面）。wiki のりば：緩行専用ホーム（快速と別線路）。
  "JobanLocal": {
    "Ayase": { "1": "3・4", "-1": "1・2" },  // 下り（我孫子・取手）3・4 / 上り（北千住・上野・代々木上原）1・2（千代田線と共用）
    "Matsudo": { "1": "4・5", "-1": "6" },   // 下り（新松戸・我孫子・取手）4・5 / 上り（金町・亀有・代々木上原）6
    "Kashiwa": { "1": "2", "-1": "1" },      // 下り（北柏・我孫子）2 / 上り（新松戸・金町・代々木上原）1
    "Abiko": { "1": "6・7", "-1": "6・7・8" }, // 下り（取手方面）6・7（平日朝夕のみ） / 上り（柏・新松戸・北千住・千代田線・小田急線方面）6・7・8（8は平日朝夕のみ）
    "Toride": { "-1": "1・2" }               // 上り（我孫子・新松戸・北千住・代々木上原）1・2（平日朝夕のみ運転）
  },
  // ===== 東海道線（東京@0 → 熱海@13；下り=横浜・小田原方面=升序1） =====
  "Tokaido": {
    "Tokyo": { "1": "9・10" },               // 下り（品川・横浜・小田原・熱海・伊東）9・10
    "Shimbashi": { "1": "1", "-1": "2" },    // 下り（品川・横浜・小田原・熱海）1 / 上り（東京・上野・大宮・宇都宮・高崎・水戸）2
    "Shinagawa": { "1": "11・12", "-1": "6・7" }, // 下り（横浜・小田原）11・12（主に12番線） / 上り（東京・上野方面＝上野東京ライン直通）6・7（主に6番線）
    "Yokohama": { "1": "5・6", "-1": "7・8" }, // 下り（平塚・小田原・熱海・伊東）5・6（主に6番線） / 上り（川崎・品川・東京）7・8（主に7番線）
    "Kawasaki": { "1": "1", "-1": "2" },      // 下り（横浜・小田原・熱海）1 / 上り（東京・上野・大宮）2
    "Totsuka": { "1": "3", "-1": "2" },       // 下り（大船・小田原・熱海）3 / 上り（横浜・品川・東京）2
    "Ofuna": { "1": "3・4", "-1": "1・2" },   // 下り（藤沢・平塚・小田原・熱海）3・4 / 上り（横浜・品川・東京・上野）1・2（主に2）
    "Fujisawa": { "1": "2・4", "-1": "3" },   // 下り（茅ケ崎・平塚・小田原）2・4（主に2） / 上り（横浜・品川・東京・新宿）3（1は平日のみ）
    "Hiratsuka": { "1": "3・4", "-1": "1・2" }, // 下り（小田原・熱海・沼津）3・4 / 上り（横浜・品川・東京・上野）1・2（一部3）
    "Odawara": { "1": "3・4", "-1": "5・6" }, // 下り（熱海・伊東・沼津）3・4 / 上り（横浜・品川・東京・上野）5・6
    "Atami": { "1": "2・3", "-1": "4・5" }    // 下り（三島・沼津・静岡）2・3 / 上り（小田原・横浜・品川・東京・上野）4・5
  },
  // ===== 横須賀線（久里浜@0 → 東京@18；下り=鎌倉・久里浜方面=站序降序-1） =====
  "Yokosuka": {
    "Tokyo": { "-1": "1・2" },               // 下り（品川・横浜・鎌倉）総武地下ホーム 1・2
    "Shimbashi": { "1": "2", "-1": "1" },    // 上り（東京・船橋・千葉）2 / 下り（品川・横浜・鎌倉）1
    "Shinagawa": { "1": "13・14", "-1": "15" }, // 上り（東京・千葉方面）13・14（主に13番線） / 下り（鎌倉・逗子・久里浜）15（主に15番線）
    "Yokohama": { "1": "10", "-1": "9" },     // 上り（品川・東京・千葉）10 / 下り（保土ケ谷・鎌倉・久里浜）9
    "Totsuka": { "1": "1", "-1": "4" },       // 上り（横浜・品川・東京・千葉）1 / 下り（大船・鎌倉・逗子・久里浜）4
    "Ofuna": { "1": "5・6", "-1": "7・8" }    // 上り（横浜・東京・千葉・成田空港）5・6（主に5） / 下り（鎌倉・逗子・横須賀・久里浜）7・8
  },
  // ===== 総武線（快速）（東京@0 → 千葉@9；下り=千葉方面=升序1） =====
  "SobuRapid": {
    "Tokyo": { "1": "3・4" },                // 下り（市川・千葉・成田空港）総武地下ホーム 3・4
    "Funabashi": { "1": "4", "-1": "3" },    // 下り（津田沼・千葉・成田空港）4 / 上り（錦糸町・東京）3
    "Tsudanuma": { "1": "1", "-1": "2・3" }, // 下り（稲毛・千葉）1（一部2） / 上り（錦糸町・東京）2・3
    "Chiba": { "-1": "3・4・5・6" }          // 上り（東京方面）3・4・5・6（内房・外房線ホームと共用）
  },
  // ===== 総武本線（千葉@0 → 銚子@21；下り=佐倉・銚子方面=升序1） =====
  "SobuMain": {
    "Chiba": { "1": "7・8" }                 // 下り（佐倉・八日市場・銚子）7・8
  },
  // ===== 内房線（千葉@0 → 安房鴨川@31；下り=木更津・館山方面=升序1） =====
  "Uchibo": {
    "Chiba": { "1": "3・4" }                 // 下り（木更津・館山）3・4
  },
  // ===== 外房線（千葉@0 → 安房鴨川@26；下り=茂原・安房鴨川方面=升序1） =====
  "Sotobo": {
    "Chiba": { "1": "5・6" }                 // 下り（茂原・安房鴨川・東金）5・6
  },
  // ===== 京葉線（東京@0 → 蘇我@17；下り=蘇我方面=升序1） =====
  "Keiyo": {
    "Tokyo": { "1": "1～4" },                 // 下り（舞浜・海浜幕張・蘇我）京葉地下ホーム 1～4
    "Kaihimmakuhari": { "1": "1・2", "-1": "2・3・4" } // 下り（千葉みなと・蘇我）1・2（主に1） / 上り（南船橋・舞浜・新木場・東京）2・3・4（主に2・3）
  },
  // ===== 伊東線（熱海@0 → 伊東@5；下り=伊東方面=升序1） =====
  "Ito": {
    "Atami": { "1": "1" }                     // 下り（伊東・伊豆急下田）1（当駅始発の普通列車）
  },
  // ===== 埼京線（大崎@0 → 大宮@18；南行=大崎方面=站序降序-1） =====
  "Saikyo": {
    "Omiya": { "-1": "19・22" },             // 南行（池袋・新宿・大崎・相鉄線方面）当駅始発 19・22
    "Osaki": { "1": "6・7" },                // 北行（新宿・池袋・赤羽・大宮）6・7（主に6番線）
    "Ebisu": { "1": "3", "-1": "4" },        // 北行（新宿・池袋・大宮）3 / 南行（大崎・りんかい線・相鉄線方面）4
    "Shibuya": { "1": "3", "-1": "4" },      // 北行（新宿・池袋・赤羽・大宮）3 / 南行（恵比寿・大崎・相鉄線方面）4
    "Shinjuku": { "1": "3", "-1": "1・2" },  // 北行（池袋・大宮・川越）当駅始発 主に3番線 / 南行（渋谷・大崎・相鉄線方面）1・2
    "Ikebukuro": { "1": "4", "-1": "1" },    // 北行（赤羽・武蔵浦和・大宮・川越）4 / 南行（新宿・渋谷・大崎）1
    "Akabane": { "1": "6" }                  // 北行（武蔵浦和・大宮・川越）6
    ,"Musashi-Urawa": { "1": "6", "-1": "3" } // 北行（大宮・川越）6 / 南行（池袋・新宿・大崎・相鉄線方面）3（4・5は待避/当駅始発）
  },
  // ===== 湘南新宿ライン（大宮@0 → 小田原@23；南行=横浜・小田原方面=站序升序1） =====
  "ShonanShinjuku": {
    "Omiya": { "1": "11" },                  // 南行（池袋・新宿・横浜・小田原）11（湘南新宿ラインからの列車）
    "Ikebukuro": { "-1": "3", "1": "2" },    // 北行（大宮・宇都宮・高崎）3 / 南行（横浜・小田原・鎌倉）2
    "Shinjuku": { "-1": "4", "1": "1・2" },  // 北行（大宮・宇都宮・高崎）4 / 南行（横浜・大船・小田原・逗子）1・2
    "Shibuya": { "-1": "3", "1": "4" },      // 北行（大宮・宇都宮・高崎）3 / 南行（横浜・大船・小田原・逗子）4
    "Ebisu": { "-1": "3", "1": "4" },        // 北行（大宮・宇都宮・高崎）3 / 南行（横浜・大船・小田原・逗子）4
    "Osaki": { "-1": "8", "1": "5" },        // 北行（大宮・宇都宮・高崎）8 / 南行（横浜・大船・小田原・逗子）5
    "Yokohama": { "-1": "10", "1": "9" },    // 北行（渋谷・新宿・大宮）10 / 南行（藤沢・平塚・小田原）9
    "Akabane": { "1": "5", "-1": "6" },      // 南行（池袋・新宿・横浜・大船・小田原）5 / 北行（大宮・高崎・宇都宮）6（6=埼京線と共用）
    "Urawa": { "1": "5", "-1": "6" },         // 南行（赤羽・新宿・横浜）5 / 北行（大宮・高崎・宇都宮）6
    "Totsuka": { "1": "4", "-1": "1" },       // 南行（藤沢・平塚・小田原）4 / 北行（渋谷・新宿・大宮）1
    "Ofuna": { "1": "3・4", "-1": "1・2・5・6" }, // 南行（藤沢・平塚・小田原）3・4 / 北行（渋谷・新宿・大宮）1・2（主に2）・5・6（主に5）
    "Fujisawa": { "1": "2・4", "-1": "3" },   // 南行（平塚・小田原）2・4 / 北行（渋谷・新宿・大宮）3
    "Hiratsuka": { "1": "3・4", "-1": "1・2" }, // 南行（小田原）3・4 / 北行（横浜・渋谷・新宿・大宮）1・2
    "Odawara": { "-1": "5・6" }               // 北行（横浜・渋谷・新宿・大宮）5・6（当駅終点・南行なし）
  },
  // ===== 南武線（川崎@0 → 立川@25；上り=川崎方面=站序降序-1） =====
  "Nambu": {
    "Tachikawa": { "-1": "7・8" },           // 上り（分倍河原・登戸・武蔵溝ノ口・武蔵小杉）7・8
    "Kawasaki": { "1": "5・6" }              // 下り（尻手・登戸・立川）5・6
  },
  // ===== 武蔵野線（府中本町@0 → 西船橋@25；下り=南浦和・西船橋方面=升序1） =====
  "Musashino": {
    "Nishi-Kokubunji": { "1": "4", "-1": "3" }, // 下り（南浦和・新松戸・西船橋）4 / 上り（府中本町）3
    "Musashi-Urawa": { "1": "1", "-1": "2" }, // 下り（南浦和・新松戸・西船橋）1 / 上り（西国分寺・府中本町）2
    "Kaihimmakuhari": { "-1": "2・3" }        // 上り（西船橋・新松戸・府中本町）2・3（朝・夕ラッシュ時のみ）
  },
  // ===== 横浜線（東神奈川@0 → 八王子@19；上り=東神奈川方面=站序降序-1） =====
  "Yokohama": {
    "Hachioji": { "-1": "5・6" }             // 上り（橋本・町田・東神奈川）5・6
  },
  // ===== 八高線（八王子@0 → 高麗川@8；下り=高麗川方面=升序1） =====
  "Hachiko": {
    "Hachioji": { "1": "1" }                 // 下り（拝島・高麗川・高崎・川越）1
  },
  // ===== 青梅線（立川@0 → 奥多摩@24；下り=奥多摩方面=升序1） =====
  "Ome": {
    "Tachikawa": { "1": "1・2" }             // 下り（拝島・青梅・奥多摩）1・2
  },
  // ===== 京王線（新宿@0 → 京王八王子；下り=八王子方面=升序1；新宿为端点，全部站台均为下り） =====
  "KeioMain": {
    "Shinjuku": { "1": "1・2・3" }           // 下り（京王八王子・高尾山口・橋本方面）1・2・3
  },
  // ===== 京王新線（新宿@0 → 幡ヶ谷；下り=京王八王子方面=升序1） =====
  "KeioShin": {
    "Shinjuku": { "1": "4" }                 // 下り（京王八王子・高尾山口・橋本方面）4
  },
  // ===== 小田原線（新宿@0 → 小田原；下り=小田原方面=升序1；新宿为端点） =====
  "Odawara": {
    "Shinjuku": { "1": "2・4・5・8・9" }     // 下り（小田原・江ノ島・唐木田方面）乘车用 2・4・5・8・9（1/3/6/7/10 为降车专用）
  },
  // ===== 丸ノ内線（荻窪@0 → 池袋；新宿升序1=池袋方面、降序-1=荻窪方面） =====
  "Marunouchi": {
    "Shinjuku": { "1": "2", "-1": "1" },     // 池袋方面 2 / 荻窪・方南町方面 1
    "Ikebukuro": { "-1": "1・2" },           // 池袋为端点，発車=荻窪方面（降序-1）1・2
    "Tokyo": { "1": "2", "-1": "1" },         // 池袋方面 2 / 荻窪・方南町方面 1
    "Ginza": { "1": "4", "-1": "3" }          // 池袋方面 4 / 荻窪・方南町方面 3
  },
  // ===== 東武東上線（池袋@0 → 川越；下り=川越方面=升序1；池袋为端点） =====
  "Tojo": {
    "Ikebukuro": { "1": "1・2・4・5" }        // 川越方面 1・2・4・5（3 为降车专用）
  },
  // ===== 西武池袋線（池袋@0 → 飯能・西武秩父；下り=所沢方面=升序1；池袋为端点） =====
  "Ikebukuro": {
    "Ikebukuro": { "1": "2・3・5・7" }        // 所沢・飯能・西武秩父方面 2・3・5・7（1/4/6 为降车专用）
  },
  // ===== 有楽町線（和光市 ↔ 新木場；池袋升序1=新木場、降序-1=和光市） =====
  "Yurakucho": {
    "Ikebukuro": { "1": "3", "-1": "4" },      // 新木場方面 3 / 和光市・飯能方面 4
    "Toyosu": { "1": "1", "-1": "4" }          // 新木場方面 1 / 和光市・飯能方面 4
  },
  // ===== ゆりかもめ（新橋 ↔ 豊洲；豊洲为端点，発車=新橋方面=降序-1） =====
  "Yurikamome": {
    "Toyosu": { "-1": "1・2" },                // 新橋方面 1・2
    "Odaiba-kaihinkoen": { "1": "1", "-1": "2" }, // 豊洲方面 1 / 新橋方面 2
    "Daiba": { "1": "1", "-1": "2" },           // 豊洲方面 1 / 新橋方面 2
    "Shimbashi": { "1": "1・2" }                 // 新橋为端点，発車=豊洲・臨海副都心方面（升序1）1・2
  },
  // ===== 副都心線（和光市 ↔ 渋谷；池袋升序1=渋谷、降序-1=和光市） =====
  "Fukutoshin": {
    "Ikebukuro": { "1": "5", "-1": "6" },      // 渋谷方面 5 / 和光市・飯能方面 6
    "Shibuya": { "-1": "5・6" },                // 渋谷为端点，発車=池袋・和光市方面（降序-1）5・6
    "Meiji-Jingumae": { "1": "3", "-1": "4" }   // 渋谷方面 3 / 和光市・飯能方面 4
  },
  // ===== 千代田線（代々木上原 ↔ 北綾瀬；明治神宮前升序1=北綾瀬、降序-1=代々木上原） =====
  "Chiyoda": {
    "Meiji-Jingumae": { "1": "2", "-1": "1" }   // 北綾瀬・我孫子方面 2 / 代々木上原・伊勢原方面 1
  },
  // ===== 京王井の頭線（渋谷@0 → 吉祥寺；下り=吉祥寺方面=升序1；渋谷为端点） =====
  "KeioInokashira": {
    "Shibuya": { "1": "1・2" }                  // 吉祥寺方面 1・2
  },
  // ===== 東急田園都市線（渋谷@0 → 中央林間；下り=長津田方面=升序1；渋谷为端点） =====
  "TokyuDenEn": {
    "Shibuya": { "1": "1" }                     // 二子玉川・長津田・中央林間方面 1
  },
  // ===== 半蔵門線（渋谷@0 → 押上；升序1=押上・久喜方面） =====
  "Hanzomon": {
    "Shibuya": { "1": "2" },                    // 押上〈スカイツリー前〉・久喜・南栗橋方面 2
    "Oshiage": { "-1": "1" }                    // 押上为端点，発車=渋谷・中央林間方面（降序-1）1
  },
  // ===== 都営浅草線（西馬込 ↔ 押上；押上为端点，発車=西馬込・羽田方面=降序-1） =====
  "Asakusa": {
    "Oshiage": { "-1": "1" },                   // 西馬込・羽田空港・京急線方面 1
    "Asakusa": { "1": "2", "-1": "1" },         // 押上・京成方面 2 / 西馬込・羽田方面 1
    "Shimbashi": { "1": "2", "-1": "1" }        // 押上・京成方面 2 / 西馬込・羽田方面 1
  },
  // ===== 東武スカイツリーライン（浅草 ↔ 久喜；押上升序1=北千住・久喜） =====
  "TobuSkytree": {
    "Oshiage": { "1": "4" },                    // 北千住・越谷・久喜・南栗橋方面 4
    "Tokyo-Skytree": { "1": "2", "-1": "1" },   // 北千住・久喜方面 2 / 浅草方面 1
    "Asakusa": { "1": "1・2・3・4・5" }          // 浅草为端点，発車=北千住・久喜・日光方面（升序1）1-5（特急3-5）
  },
  // ===== 京成押上線（押上@0 → 成田空港；下り=青砥・成田=升序1；押上为端点） =====
  "KeiseiOshiage": {
    "Oshiage": { "1": "4" }                     // 青砥・京成船橋・成田空港方面 4
  },
  // ===== 東急東横線（渋谷@0 → 横浜；下り=横浜方面=升序1；渋谷为端点） =====
  "TokyuToyoko": {
    "Shibuya": { "1": "3・4" },                 // 横浜・元町・中華街方面 3・4
    "Yokohama": { "-1": "2" }                   // 横浜为端点，発車=渋谷・池袋方面（降序-1）2
  },
  // ===== みなとみらい線（横浜@0 → 元町・中華街；下り=元町方面=升序1） =====
  "MinatoMirai": {
    "Yokohama": { "1": "1" }                    // みなとみらい・元町・中華街方面 1
  },
  // ===== 京急本線（品川 ↔ 三浦海岸；横浜升序1=上大岡・三浦海岸、降序-1=品川・羽田） =====
  "Keikyu": {
    "Yokohama": { "1": "1", "-1": "2" }         // 上大岡・三浦海岸方面 1 / 羽田空港・品川方面 2
  },
  // ===== 相鉄本線（横浜@0 → 海老名；下り=海老名方面=升序1；横浜为端点） =====
  "SotetsuMain": {
    "Yokohama": { "1": "2・3" }                 // 海老名・湘南台方面 2・3（1 为降车专用）
  },
  // ===== 横浜市営地下鉄ブルーライン（あざみ野 ↔ 湘南台；横浜升序1=あざみ野、降序-1=湘南台） =====
  "YokohamaBlue": {
    "Yokohama": { "1": "2", "-1": "1" }         // あざみ野方面 2 / 湘南台方面 1
  },
  // ===== 銀座線（渋谷@0 → 浅草；升序1=浅草方面；渋谷为端点） =====
  "Ginza": {
    "Shibuya": { "1": "1・2" },                 // 浅草方面 1・2
    "Ueno": { "1": "2", "-1": "1" },            // 浅草方面 2 / 渋谷方面 1
    "Asakusa": { "-1": "1・2" },                // 浅草为端点，発車=渋谷方面（降序-1）1・2
    "Ginza": { "1": "2", "-1": "1" },           // 浅草方面 2 / 渋谷方面 1
    "Shimbashi": { "1": "2", "-1": "1" }        // 浅草方面 2 / 渋谷方面 1
  },
  // ===== 日比谷線（中目黒 ↔ 北千住；上野升序1=北千住、降序-1=中目黒） =====
  "Hibiya": {
    "Ueno": { "1": "2", "-1": "1" },            // 北千住・久喜方面 2 / 中目黒方面 1
    "Akihabara": { "1": "2", "-1": "1" },       // 北千住・久喜方面 2 / 中目黒方面 1
    "Ginza": { "1": "6", "-1": "5" },           // 北千住・久喜方面 6 / 中目黒方面 5
    "Roppongi": { "1": "2", "-1": "1" },        // 北千住・南栗橋方面 2 / 中目黒方面 1
    "Tsukiji": { "1": "2", "-1": "1" }           // 北千住・南栗橋方面 2 / 中目黒方面 1
  },
  // ===== 都営大江戸線（六本木升序1=都庁前・光が丘、降序-1=大門・両国） =====
  "Oedo": {
    "Roppongi": { "1": "2", "-1": "1" },        // 都庁前・光が丘方面 2 / 大門・六本木方面 1
    "Ryogoku": { "1": "2", "-1": "1" }          // 大門・六本木方面 2 / 飯田橋・都庁前方面 1
  },
  // ===== 都営三田線（西高島平 ↔ 目黒；水道橋升序1=西高島平、降序-1=目黒） =====
  "Mita": {
    "Suidobashi": { "1": "2", "-1": "1" }       // 西高島平方面 2 / 目黒・東急線方面 1
  },
  // ===== つくばエクスプレス（秋葉原@0 → つくば；下り=つくば=升序1；秋葉原为端点） =====
  "TsukubaExpress": {
    "Akihabara": { "1": "1・2" }                // つくば方面 1・2
  }
};

// 改札口/出入口（v4.3.595 精选版）——仅收录 wiki/公式資料明确给出"主要改札口"的站；
// 多口无主（東京/新宿/渋谷/池袋/新橋/吉祥寺 等）不写 default，避免误导。
// 数据源：ja.wikipedia 各駅「駅構造」节改札口记载（出典：JR東日本駅構内図）。
// 展示位置：v4.3.598 起**不在乘车段显示**（用户裁定改札口不属于搜索结果层级）——
//   数据保留为车站信息资产（Provider），待接入车站详情/线路详情等正确层级。
// ※完整"线路→改札口"映射仅存在于 JR公式駅構内図（PDF 图），wiki/官网文字页均无结构化数据。
window.EXIT_DATA = {
  "Akihabara": { "default": "中央改札" },   // 電気街口・昭和通り口・中央改札（wiki：多機能トイレ（中央改札・昭和通り口））
  "Ueno": { "default": "中央改札" },        // 中央・不忍・公園・入谷 4 改札（中央=在来線メイン、新幹線乗換経由）
  "Shinagawa": { "default": "中央改札" },   // 中央改札・北改札・南乗換口（中央=在来線メイン）
  "Yokohama": { "default": "中央改札" },    // 中央北改札・中央南改札・南改札・北改札（中央=在来線メイン）
  "Omiya": { "default": "中央改札" },       // 中央改札（南）・中央改札（北）——南北コンコースとも全JRホームへ
  "Kashiwa": { "default": "中央口" },        // 当初からある北側の中央口（南口は1999年追加）
  "Kawasaki": { "default": "中央改札" },     // 中央北改札・中央南改札（2017年分離）・北改札・アトレ改札
  "Funabashi": { "default": "中央口" },      // 中央口改札（駅舎正面）
  "Chiba": { "default": "中央改札" }         // 中央改札（駅機能3階集約）・東口・西口・南口
};

// 番線解決（Provider 公共 API）：查不到（无该线/站/方向）返回 null，展示层静默省略
// v4.3.616: 干线本名别名归一——TokaidoMain/TohokuMain 为物理线路名，与运行系统
// （Tokaido / UtsunomiyaJR）同轨同番线；搜索图已排除本名，此处兜底防旧缓存/直传
var _PLATFORM_LINE_ALIAS = {
  "TokaidoMain": "Tokaido",      // 東海道本線（東京～熱海）= 東海道線運行系統 同軌同番線
  "TohokuMain": "UtsunomiyaJR"   // 東北本線（東京～黒磯）= 宇都宮線運行系統 同軌同番線
};
window.PlatformResolver = {
  resolve: function(lineId, stationId, direction) {
    try {
      if (!window.PLATFORM_DATA) return null;
      var L = window.PLATFORM_DATA[_PLATFORM_LINE_ALIAS[lineId] || lineId];
      if (!L) return null;
      var S = L[stationId];
      if (!S) return null;
      var d = String(direction == null ? 0 : direction);
      if (S[d]) return S[d];
      if (S['*']) return S['*'];
      return null;
    } catch (e) {
      return null;
    }
  },
  resolveExit: function(stationId) {
    try {
      if (!window.EXIT_DATA) return null;
      var E = window.EXIT_DATA[stationId];
      if (!E || !E.default) return null;
      return E.default;
    } catch (e) {
      return null;
    }
  }
};


// ===== line-service-relations.js =====
// Line Service Relations - Canonical Line-to-Line Service Relation Layer
// SOLE AUTHORITY for service relations between canonical lines.
// DO NOT confuse with: LOS (Display Group), railway_data.json (Identity), stationLines (Topology)

/* global window */
window.LineServiceRelations = [
  { lineA: "Saikyo", lineB: "Kawagoe", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Omiya"], evidence: { source: "LOS JA stationLines shared 1", confidence: "HIGH" } },
  { lineA: "Kawagoe", lineB: "KawagoeWest", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: ["Kawagoe"], evidence: { source: "川越線運転系統 川越駅以東/以西 直通", confidence: "HIGH" } },
  { lineA: "SeibuIkebukuro", lineB: "Ikebukuro", relation: "THROUGH_SERVICE", direction: "BIDIRECTIONAL", handoverStations: [], evidence: { source: "LOS SI stationLines shared 18 subset", confidence: "HIGH" } },
  { lineA: "Marunouchi", lineB: "MarunouchiBranch", relation: "PHYSICAL_CONNECT", direction: "BIDIRECTIONAL", handoverStations: ["Nakano-Sakaue"], evidence: { source: "stationLines shared 1 (Nakano-Sakaue)", confidence: "HIGH" } },
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

// ===== train-type-defs.js =====
/**
 * 列車種別の表示名定義（i18n）
 * データソース: ODPT odpt:TrainType / 各社公式の種別名称
 * 用途: trains ページの列車ラベル・ツールチップで種別名（等级）を表示する
 * 東急 8 線分をまず定義（2026-09-16、ユーザー指示「车型・等级が確認できる時刻表」）
 */
window.TRAIN_TYPE_NAMES = {
  // ===== 東急 =====
  "odpt.TrainType:Tokyu.Local":                    { ja: "各駅停車", en: "Local", zh: "各站停车", ko: "각역정차" },
  "odpt.TrainType:Tokyu.Express":                  { ja: "急行",     en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Tokyu.CommuterLimitedExpress":   { ja: "通勤特急", en: "Commuter Ltd. Exp.", zh: "通勤特急", ko: "통근특급" },
  "odpt.TrainType:Tokyu.LimitedExpress":           { ja: "特急",     en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Tokyu.F-Liner":                  { ja: "Fライナー", en: "F-Liner", zh: "F-Liner", ko: "F라이너" },
  "odpt.TrainType:Tokyu.S-TRAIN":                  { ja: "S-TRAIN",  en: "S-TRAIN", zh: "S-TRAIN", ko: "S-TRAIN" },
  "odpt.TrainType:Tokyu.SemiExpress":              { ja: "準急",     en: "Semi Express", zh: "准急", ko: "준급" }
};

