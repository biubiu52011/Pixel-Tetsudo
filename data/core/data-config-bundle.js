/* Pixel Tetsudo - Data Config Bundle (auto-merged).
 * Merged from: transfer-hints.js, runtime-config.js, through-service.js, platform-data.js, line-service-relations.js, train-type-defs.js.
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
    targetLineKey: "line.Rinkai",
    templateKey: "transfer.outside_line"
  }
};

// 获取换乘提示
window.getTransferHint = function(stationId, lang) {
  if (!window.TRANSFER_HINTS || !window.TRANSFER_HINTS[stationId]) return null;
  var hint = window.TRANSFER_HINTS[stationId];
  var l = lang || window.currentLang || "ja";

  // Structured hints resolve entity labels through the central i18n dictionary.
  if (hint.targetLineKey && hint.templateKey && window.translations) {
    var dict = window.translations[l] || window.translations.ja || {};
    var fallbackDict = window.translations.ja || {};
    var lineName = dict[hint.targetLineKey] || fallbackDict[hint.targetLineKey] || hint.targetLineKey;
    var template = dict[hint.templateKey] || fallbackDict[hint.templateKey] || "{line}";
    return String(template).replace(/\{line\}/g, lineName);
  }

  // Legacy notes remain supported while entries are migrated to structured data.
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
 *   data-fusion.js       → SOURCE_RAILWAY_LINE_SCOPE, PRIORITY_OPS, STATION_ALIAS,
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
  var TRUNK_MAIN_LINE_IDS = ["Shinetsu", "TokaidoMain", "Tohoku"];

  /**
   * 干线本名延伸白名单（显式登记，防止自动端点相接误判）。
   * 4.3.421：横須賀線誤延伸整条東海道本線 修复后改为空表，即不延伸任何干线本名。
   */
  var TRUNK_EXTENSION_ALLOW = {};

  // ========== 直通运行 ==========

  /**
   * Source railway identity scope for feeds whose railway entity spans canonical
   * project lines/operators. This is candidate admission only, never a preference
   * order and never proof that two records are the same physical train.
   */
  var SOURCE_RAILWAY_LINE_SCOPE = {
    "SotetsuDirect": ["SotetsuShinYokohama", "Yokosuka", "Saikyo", "ShonanShinjuku"]
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

  /**
   * 实时位置覆盖策略（通用能力模型，不在融合算法中硬编码线路）。
   *
   * mode:
   *   FULL      - 已证明完整覆盖；禁止 timetable 生成/补充位置。
   *   HYBRID    - 默认。实时优先，缺失列车/区间允许 timetable 补位。
   *   SEGMENTED - 只有声明区间的实时位置具权威性；区间外允许 timetable。
   *   COARSE    - 实时源只能给出粗粒度位置；允许 timetable 提供更细位置，但不得覆盖
   *               同一列车已有的实时事实。
   *   UNKNOWN   - 覆盖完整性未知；行为等同 HYBRID，但明确禁止升级为 FULL。
   *
   * SEGMENTED fields:
   *   coveredSegments:  [{ fromStation, toStation }]  实时权威覆盖区间；区间内禁止 timetable 造位置。
   *   excludedSegments: [{ fromStation, toStation }]  已知实时缺口；缺口内允许 timetable 补位。
   * 两者可并存：excludedSegments 优先。站 ID 无法解析时 fail-open，继续 timetable，避免误删列车。
   *
   * 合并不变量：
   *   1) 同一列车 realtime position 永远优先，timetable 只能补 metadata。
   *   2) HYBRID/UNKNOWN 默认允许补缺，不因“API 有返回”自动升级 FULL。
   *   3) SEGMENTED 只在已声明权威区间抑制 timetable；区间外继续补。
   *   4) COARSE 保留 realtime 为位置事实，timetable 可补缺失列车但不能覆盖同车实时位置。
   *   5) running-chain 可跨覆盖边界传递 identity/service/destination 证据，不改变 positionSource。
   * 规则：线路事实只写配置；DataFusion/Estimator 不得按具体 lineId 写专属分支。
   */
  var REALTIME_POSITION_POLICY = {
    defaultMode: "HYBRID",
    staleAfterMs: 90000,
    lines: {
      "Asakusa": { mode: "FULL" },
      "Shinjuku": { mode: "FULL" },
      "Oedo": { mode: "FULL" },
      "Arakawa": { mode: "FULL" },
      "KeioMain": { mode: "FULL" },
      "KeioSagamihara": { mode: "FULL" },
      "KeioDobutsuen": { mode: "FULL" },
      "KeioNew": { mode: "FULL" },
      "KeioInokashira": { mode: "FULL" },
      "KeioKeibajo": { mode: "FULL" },
      "KeioTakao": { mode: "FULL" },
      "TobuSkytree": { mode: "FULL" },
      "TobuNoda": { mode: "FULL" },
      "Noda": { mode: "FULL" },
      "Tojo": { mode: "FULL" },
      "Ogose": { mode: "FULL" },
      "TobuDaishi": { mode: "FULL" },

      // Known partial/limited sources, but no verified local station-pair coverage
      // is stored yet. Keep HYBRID until coveredSegments/excludedSegments can be
      // backed by provider observations; never use SEGMENTED as a placeholder.
      "Mita": { mode: "HYBRID" },
      "Chuo": { mode: "HYBRID" },
      "Ome": { mode: "HYBRID" },
      "Joban": { mode: "HYBRID" },
      "Takasaki": { mode: "HYBRID" },

      // Official source has insufficient positional granularity on part of this railway.
      "TobuKameido": { mode: "COARSE" },

      // Explicitly known not to be complete realtime-position sources.
      "TobuIsesaki": { mode: "HYBRID" },
      "TobuNikko": { mode: "HYBRID" },
      "Tsurumi": { mode: "HYBRID" },
      "TsurumiUmiShibaura": { mode: "HYBRID" },
      "TsurumiOkawa": { mode: "HYBRID" },
      "NambuBranch": { mode: "HYBRID" },
      "Sagami": { mode: "HYBRID" },
      "Hachiko": { mode: "HYBRID" }
    }
  };

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
    "NaritaAirportTerminal2": "Airport-Terminal-2",
    "HamaKawasaki": "Hama-Kawasaki"
  };

  /**
   * Railway 感知别名：ODPT 同名站 ID 在不同线路指向不同本地站，需按 railway 区分。
   * Oyama（Tojo=大山/Ooyama, Utsunomiya=小山/Oyama）双义。
   * Kohoku（NipporiToneri=江北/Kohoku, NaritaAbikoBranch=湖北/Kohoku-Narita）双义。
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

  // ========== ODPT 缓存 / 轮询 / 存储 key 规则 ==========

  /** 时刻表 IDB 主键（新版 v6） */
  var ODPT_TIMETABLE_CACHE_KEY = 'odpt_timetable_cache_v6';

  /** 旧 localStorage 缓存 key（v3，迁移后清除） */
  var ODPT_LEGACY_LS_CACHE_KEY = 'odpt_timetable_cache_v3';

  /** 时刻表缓存 TTL（毫秒，24h） */
  var ODPT_TIMETABLE_CACHE_TTL = 86400000;

  /** ODPT_TT_PROBED 持久化 key（localStorage，24h 滑动 TTL） */
  var ODPT_TT_PROBED_KEY = 'odpt_tt_probed_v1';

  /** ODPT_TT_PROBED TTL（毫秒，24h） */
  var ODPT_TT_PROBED_TTL = 86400000;

  /** 实时数据轮询间隔（毫秒，ODPTClient 后台刷新） */
  var ODPT_REALTIME_INTERVAL = 30000;

  /** DataLayer 内存缓存条目上限 */
  var DATA_LAYER_MAX_CACHE_SIZE = 50;

  /** DataLayer 内存缓存 TTL（毫秒） */
  var DATA_LAYER_CACHE_TTL = 60000;

  /** trains 页后台预加载线路白名单（用户高频切换的线路）。打开 trains.html 后 2 秒开始后台加载。 */
  var TRAIN_WARMUP_LINES = ['Yamanote', 'ChuoRapid', 'KeihinTohoku', 'Seibuen', 'Keikyu', 'Odawara'];

  /**
   * 快速通过站白名单——route-search 计算时跳过这些站的停站+加减速时间（按 EXPRESS_PASS_RATIO 折扣）。
   * 数据源：各线公式停站表（wiki）。Joban=常磐快速 松戸〜柏 间ノンストップ（通过 亀有/馬橋/新松戸/北小金）。
   */
  var EXPRESS_SKIP_STATIONS = {
    'Joban': { 'Kameari': 1, 'Mabashi': 1, 'Shin-Matsudo': 1, 'Kita-Kogane': 1 }
  };

  // ========== UI 策略常量 ==========

  /** 换乘 chip 行数上限（per station）。v4.3.613: 2→3 行（JR 大站东京/新宿换乘超 8 条）；v4.3.849: 3→4 行（4×4=16 个图标上限，用户裁定）。 */
  var TRANSFER_MAX_ROWS = 4;

  window.RuntimeConfig = {
    // 线路层级
    TRUNK_MAIN_LINE_IDS: TRUNK_MAIN_LINE_IDS,
    TRUNK_EXTENSION_ALLOW: TRUNK_EXTENSION_ALLOW,
    // 直通运行
    SOURCE_RAILWAY_LINE_SCOPE: SOURCE_RAILWAY_LINE_SCOPE,
    PRIORITY_OPS: PRIORITY_OPS,
    REALTIME_POSITION_POLICY: REALTIME_POSITION_POLICY,
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
    // ODPT 缓存 / 轮询 / 存储 key
    ODPT_TIMETABLE_CACHE_KEY: ODPT_TIMETABLE_CACHE_KEY,
    ODPT_LEGACY_LS_CACHE_KEY: ODPT_LEGACY_LS_CACHE_KEY,
    ODPT_TIMETABLE_CACHE_TTL: ODPT_TIMETABLE_CACHE_TTL,
    ODPT_TT_PROBED_KEY: ODPT_TT_PROBED_KEY,
    ODPT_TT_PROBED_TTL: ODPT_TT_PROBED_TTL,
    ODPT_REALTIME_INTERVAL: ODPT_REALTIME_INTERVAL,
    // DataLayer 缓存参数
    DATA_LAYER_MAX_CACHE_SIZE: DATA_LAYER_MAX_CACHE_SIZE,
    DATA_LAYER_CACHE_TTL: DATA_LAYER_CACHE_TTL,
    // 快速通过站（route-search）
    EXPRESS_SKIP_STATIONS: EXPRESS_SKIP_STATIONS,
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
    "Hanzomon": { "TobuSkytree": ["Oshiage"], "TobuIsesaki": ["Oshiage"], "TokyuDenEnToshi": ["Shibuya"] },
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
    "TokyuOimachi": { "TokyuDenEnToshi": ["Futako-Tamagawa"] },
    "TokyuDenEnToshi": { "TokyuOimachi": ["Futako-Tamagawa"] },
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

  function getBoundaryRelation(lineId, partnerId) {
    var relations = window.LineServiceRelations;
    if (!relations || typeof relations.length !== "number") return null;
    for (var i = 0; i < relations.length; i++) {
      var rel = relations[i];
      if (!rel) continue;
      if ((rel.lineA === lineId && rel.lineB === partnerId) ||
          (rel.lineA === partnerId && rel.lineB === lineId)) return rel;
    }
    return null;
  }

  /** Direct canonical through-service neighbours of a line (1 hop). */
  function getDirectThroughLines(lineId) {
    try {
      var line = window.UNIFIED_LINES && window.UNIFIED_LINES[lineId];
      return line && Array.isArray(line.throughServices) ? line.throughServices.slice() : [];
    } catch(e) { return []; }
  }

  /** Join stations for a line pair. Canonical handoverStations win when present. */
  function getJoinStations(lineId, partnerId) {
    try {
      var canonical = getBoundaryRelation(lineId, partnerId);
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
      var canonical = getBoundaryRelation(lineId, partnerId);
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
    "Osaki": { "1": "1", "-1": "3" },    // 内回り（品川・東京・上野）1（2番=当駅始発専用） / 外回り（渋谷・新宿・池袋）3（4番=当駅始発専用）
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
    "Kameari": { "1": "1", "-1": "2" },      // 下り（松戸・柏・我孫子）1 / 上り（北千住・西日暮里・上野）2 ※快速は当駅通過（緩行ホームと共有）
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
  // ===== 千代田線（代々木上原→北綾瀬；升序=綾瀬方向=1） =====
  "Chiyoda": {
    "Kita-Senju": { "1": "2", "-1": "1" },   // 北綾瀬方面2 / 代々木上原方面1
  },
  // ===== 日比谷線（中目黒→北千住；升序=北千住終点；降序=中目黒=1） =====
  "Hibiya": {
    "Kita-Senju": { "-1": "6・7" },          // 始発・中目黒方面6・7番線
  },
  // ===== 東武スカイツリー線（浅草→春日部；升序=春日部=1） =====
  "TobuSkytree": {
    "Kita-Senju": { "1": "1・2・5", "-1": "3・4" }, // 下り（春日部・東武動物公園）1・2・5 / 上り（浅草）3・4
  },
  // ===== つくばエクスプレス（秋葉原→つくば；升序=つくば=1） =====
  "TsukubaExpress": {
    "Kita-Senju": { "1": "1", "-1": "2" },   // つくば方面1 / 秋葉原方面2
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
    "Shinjuku": { "1": "2・4・5・8・9" },    // 下り（小田原・江ノ島・唐木田方面）乘车用 2・4・5・8・9（1/3/6/7/10 为降车专用）
    "Shimokitazawa": { "1": "1・3", "-1": "2・4" } // 小田原方面 1(急行)・3(各停) / 新宿方面 2(急行)・4(各停)
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
    "Toyosu": { "1": "1", "-1": "4" },         // 新木場方面 1 / 和光市・飯能方面 4
    "Yurakucho": { "1": "1", "-1": "2" }       // 新木場方面1 / 和光市・飯能方面2
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
    "Yokohama": { "-1": "2" },                  // 横浜为端点，発車=渋谷・池袋方面（降序-1）2
    "Jiyugaoka": { "1": "3・4", "-1": "5・6" }  // 横浜・元町方面 3・4 / 渋谷・池袋方面 5・6
  },
  // ===== 東急大井町線（大井町 ↔ 溝の口；自由が丘升序1=二子玉川・溝の口、降序-1=大井町） =====
  "TokyuOimachi": {
    "Jiyugaoka": { "1": "1", "-1": "2" }         // 二子玉川・溝の口方面 1 / 大井町方面 2
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
  "odpt.TrainType:Tokyu.SemiExpress":              { ja: "準急",     en: "Semi Express", zh: "准急", ko: "준급" },

  // ===== 京成（2026-09-22 京成本線導入）=====
  "odpt.TrainType:Keisei.Skyliner":                 { ja: "スカイライナー", en: "Skyliner", zh: "Skyliner", ko: "스카이라이너" },
  "odpt.TrainType:Keisei.AccessExpress":            { ja: "アクセス特急", en: "Access Express", zh: "Access特急", ko: "액세스특급" },
  "odpt.TrainType:Keisei.RapidLimitedExpress":      { ja: "快速特急", en: "Rapid Ltd. Exp.", zh: "快速特急", ko: "쾌속특급" },
  "odpt.TrainType:Keisei.LimitedExpress":           { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Keisei.CommuterLimitedExpress":   { ja: "通勤特急", en: "Commuter Ltd. Exp.", zh: "通勤特急", ko: "통근특급" },
  "odpt.TrainType:Keisei.Rapid":                    { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:Keisei.Local":                    { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:Keisei.MorningLiner":             { ja: "モーニングライナー", en: "Morning Liner", zh: "Morning Liner", ko: "모닝라이너" },
  "odpt.TrainType:Keisei.EveningLiner":             { ja: "イブニングライナー", en: "Evening Liner", zh: "Evening Liner", ko: "이브닝라이너" },

  // ===== 小田急 =====
  "odpt.TrainType:Odakyu.Local":                    { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:Odakyu.Express":                  { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Odakyu.RapidExpress":             { ja: "快速急行", en: "Rapid Express", zh: "快速急行", ko: "쾌속급행" },
  "odpt.TrainType:Odakyu.LimitedExpress":           { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Odakyu.CommuterExpress":          { ja: "通勤急行", en: "Commuter Express", zh: "通勤急行", ko: "통근급행" },
  "odpt.TrainType:Odakyu.SemiExpress":              { ja: "準急", en: "Semi Express", zh: "准急", ko: "준급" },
  "odpt.TrainType:Odakyu.CommuterSemiExpress":       { ja: "通勤準急", en: "Commuter Semi-Exp.", zh: "通勤准急", ko: "통근준급" },

  // ===== 西武 =====
  "odpt.TrainType:Seibu.Local":                     { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:Seibu.SemiExpress":               { ja: "準急", en: "Semi Express", zh: "准急", ko: "준급" },
  "odpt.TrainType:Seibu.Express":                   { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Seibu.HaijimaLiner":              { ja: "拝島ライナー", en: "Haijima Liner", zh: "拜岛Liner", ko: "하이마라이너" },
  "odpt.TrainType:Seibu.Rapid":                      { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:Seibu.LimitedExpress":            { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Seibu.F-Liner":                    { ja: "Fライナー", en: "F-Liner", zh: "F-Liner", ko: "F라이너" },
  "odpt.TrainType:Seibu.S-TRAIN":                    { ja: "S-TRAIN", en: "S-TRAIN", zh: "S-TRAIN", ko: "S-TRAIN" },
  "odpt.TrainType:Seibu.CommuterExpress":            { ja: "通勤急行", en: "Commuter Express", zh: "通勤急行", ko: "통근급행" },
  "odpt.TrainType:Seibu.RapidExpress":               { ja: "快速急行", en: "Rapid Express", zh: "快速急行", ko: "쾌속급행" },
  "odpt.TrainType:Seibu.CommuterSemiExpress":        { ja: "通勤準急", en: "Commuter Semi-Exp.", zh: "通勤准急", ko: "통근준급" },

  // ===== 东武 =====
  "odpt.TrainType:Tobu.Local":                      { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:Tobu.LimitedExpress":            { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Tobu.Rapid":                       { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:Tobu.Express":                     { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Tobu.SectionExpress":             { ja: "区間急行", en: "Section Express", zh: "区间急行", ko: "구간급행" },
  "odpt.TrainType:Tobu.SectionSemiExpress":          { ja: "区間準急", en: "Section Semi-Exp.", zh: "区间准急", ko: "구간준급" },
  "odpt.TrainType:Tobu.TH-LINER":                   { ja: "THライナー", en: "TH-Liner", zh: "TH-Liner", ko: "TH라이너" },
  "odpt.TrainType:Tobu.SemiExpress":                { ja: "準急", en: "Semi Express", zh: "准急", ko: "준급" },
  "odpt.TrainType:Tobu.TJ-Liner":                   { ja: "TJライナー", en: "TJ-Liner", zh: "TJ-Liner", ko: "TJ라이너" },
  "odpt.TrainType:Tobu.RapidExpress":                { ja: "快速急行", en: "Rapid Express", zh: "快速急行", ko: "쾌속급행" },
  "odpt.TrainType:Tobu.KawagoeLimitedExpress":       { ja: "川越線特急", en: "Kawagoe Ltd. Exp.", zh: "川越线特急", ko: "카와고에특급" },

  // ===== 都营 =====
  "odpt.TrainType:Toei.Local":                       { ja: "各駅停車", en: "Local", zh: "各站停车", ko: "각역정차" },
  "odpt.TrainType:Toei.Rapid":                       { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Toei.RapidLimitedExpress":         { ja: "快速特急", en: "Rapid Ltd. Exp.", zh: "快速特急", ko: "쾌속특급" },
  "odpt.TrainType:Toei.AirportRapidLimitedExpress":   { ja: "成飛快速特急", en: "Airport R.Ltd. Exp.", zh: "机场快速特急", ko: "공항쾌속특급" },
  "odpt.TrainType:Toei.Express":                     { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Toei.LimitedExpress":              { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Toei.AccessExpress":                { ja: "アクセス急行", en: "Access Express", zh: "Access急行", ko: "액세스급행" },
  "odpt.TrainType:Toei.CommuterLimitedExpress":       { ja: "通勤特急", en: "Commuter Ltd. Exp.", zh: "通勤特急", ko: "통근특급" },

  // ===== 东京地下铁 =====
  "odpt.TrainType:TokyoMetro.Local":                 { ja: "各駅停車", en: "Local", zh: "各站停车", ko: "각역정차" },
  "odpt.TrainType:TokyoMetro.Express":               { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:TokyoMetro.SemiExpress":           { ja: "準急", en: "Semi Express", zh: "准急", ko: "준급" },
  "odpt.TrainType:TokyoMetro.LimitedExpress":        { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:TokyoMetro.CommuterExpress":        { ja: "通勤急行", en: "Commuter Express", zh: "通勤急行", ko: "통근급행" },
  "odpt.TrainType:TokyoMetro.F-Liner":               { ja: "Fライナー", en: "F-Liner", zh: "F-Liner", ko: "F라이너" },
  "odpt.TrainType:TokyoMetro.S-TRAIN":               { ja: "S-TRAIN", en: "S-TRAIN", zh: "S-TRAIN", ko: "S-TRAIN" },
  "odpt.TrainType:TokyoMetro.TH-LINER":              { ja: "THライナー", en: "TH-Liner", zh: "TH-Liner", ko: "TH라이너" },
  "odpt.TrainType:TokyoMetro.Rapid":                 { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:TokyoMetro.CommuterRapid":          { ja: "通勤快速", en: "Commuter Rapid", zh: "通勤快速", ko: "통근쾌속" },
  "odpt.TrainType:TokyoMetro.RapidExpress":           { ja: "快速急行", en: "Rapid Express", zh: "快速急行", ko: "쾌속급행" },

  // ===== 京王 =====
  "odpt.TrainType:Keio.Local":                       { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:Keio.Express":                     { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Keio.SemiExpress":                 { ja: "準急", en: "Semi Express", zh: "准急", ko: "준급" },
  "odpt.TrainType:Keio.KeioLiner":                   { ja: "京王ライナー", en: "Keio Liner", zh: "京王Liner", ko: "경왕라이너" },
  "odpt.TrainType:Keio.LimitedExpress":              { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Keio.Rapid":                        { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },

  // ===== 京急 =====
  "odpt.TrainType:Keikyu.Local":                     { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:Keikyu.Express":                   { ja: "急行", en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Keikyu.LimitedExpress":            { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Keikyu.RapidLimitedExpress":       { ja: "快速特急", en: "Rapid Ltd. Exp.", zh: "快速特急", ko: "쾌속특급" },
  "odpt.TrainType:Keikyu.EveningWing":               { ja: "イブニングウィング", en: "Evening Wing", zh: "Evening Wing", ko: "이브닝윙" },
  "odpt.TrainType:Keikyu.AirportRapidLimitedExpress":{ ja: "空港快速特急", en: "Airport R.Ltd. Exp.", zh: "机场快速特急", ko: "공항쾌속특급" },
  "odpt.TrainType:Keikyu.AccessExpress":              { ja: "アクセス急行", en: "Access Express", zh: "Access急行", ko: "액세스급행" },
  "odpt.TrainType:Keikyu.Rapid":                      { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:Keikyu.MorningWing":                { ja: "モーニングウィング", en: "Morning Wing", zh: "Morning Wing", ko: "모닝윙" },
  "odpt.TrainType:Keikyu.CommuterLimitedExpress":     { ja: "通勤特急", en: "Commuter Ltd. Exp.", zh: "通勤特急", ko: "통근특급" },

  // ===== 相铁 =====
  "odpt.TrainType:Sotetsu.Rapid":                     { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:Sotetsu.Local":                    { ja: "各駅停車", en: "Local", zh: "各站停车", ko: "각역정차" },
  "odpt.TrainType:Sotetsu.LimitedExpress":           { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Sotetsu.CommuterExpress":          { ja: "通勤急行", en: "Commuter Express", zh: "通勤急行", ko: "통근급행" },
  "odpt.TrainType:Sotetsu.CommuterLimitedExpress":    { ja: "通勤特急", en: "Commuter Ltd. Exp.", zh: "通勤特急", ko: "통근특급" },

  // ===== 临海高速（TWR）===== 
  "odpt.TrainType:TWR.Local":                         { ja: "各駅停車", en: "Local", zh: "各站停车", ko: "각역정차" },
  "odpt.TrainType:TWR.Rapid":                         { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:TWR.CommuterRapid":                { ja: "通勤快速", en: "Commuter Rapid", zh: "通勤快速", ko: "통근쾌속" },

  // ===== 其他单种别线路 =====
  "odpt.TrainType:MIR.Rapid":                          { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:MIR.CommuterRapid":                  { ja: "通勤快速", en: "Commuter Rapid", zh: "通勤快速", ko: "통근쾌속" },
  "odpt.TrainType:MIR.SemiRapid":                       { ja: "準急", en: "Semi Rapid", zh: "准急", ko: "준급" },
  "odpt.TrainType:MIR.Local":                          { ja: "各駅停車", en: "Local", zh: "各站停车", ko: "각역정차" },
  "odpt.TrainType:SaitamaRailway.Local":               { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:TamaMonorail.Local":                 { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:ChibaMonorail.Local":                 { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:ShonanMonorail.Local":                { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:TokyoMonorail.AirportRapid":         { ja: "空港快速", en: "Airport Rapid", zh: "机场快速", ko: "공항쾌속" },
  "odpt.TrainType:TokyoMonorail.Local":                 { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:TokyoMonorail.SectionRapid":          { ja: "区間快速", en: "Section Rapid", zh: "区间快速", ko: "구간쾌속" },
  "odpt.TrainType:YokohamaMunicipal.Local":             { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:YokohamaMunicipal.Rapid":             { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:Yurikamome.Local":                    { ja: "普通", en: "Local", zh: "普通", ko: "보통" },

  // ===== JR东日本（manual 时刻表里 operator 缺省或 unknown 的情况）=====
  "odpt.TrainType:JR-East.LimitedExpress":            { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:JR-East.Local":                      { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:JR-East.Rapid":                       { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:JR-East.ChuoSpecialRapid":           { ja: "中央線快速", en: "Chuo Rapid", zh: "中央线快速", ko: "중앙쾌속" },
  "odpt.TrainType:JR-East.CommuterRapid":             { ja: "通勤快速", en: "Commuter Rapid", zh: "通勤快速", ko: "통근쾌속" },
  "odpt.TrainType:JR-East.OmeSpecialRapid":            { ja: "青梅線快速", en: "Ome Rapid", zh: "青梅线快速", ko: "청매쾌속" },
  "odpt.TrainType:JR-East.CommuterSpecialRapid":       { ja: "通勤快速", en: "Commuter Special Rapid", zh: "通勤快速", ko: "통근쾌속" },
  "odpt.TrainType:JR-East.SpecialRapid":               { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
};

