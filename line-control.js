/*
 * Line Control - Unified Line Data
 * 线路数据控制
 */

(function() {
  "use strict";

  window.UNIFIED_LINES = {
    "Yamanote": {
      name: "Yamanote", nameEn: "Yamanote Line", code: "JY", color: "#b1cb39",
      operator: "JR East", region: "Tokyo Area", type: "loop",
      image: "../images/鉄道/JR東日本/山手線.png", durationTotalMin: 60, throughServices: [],
      transferStations: [],
      stations: ["Shibuya","Harajuku","Yoyogi","Shinjuku","Shinjuku-nishiguchi","Mejiro","Ikeda","Taishakuten","Takadanobaba","Nagasaki","Otsuka","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Akihabara","Kanda","Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Tamachi","Takanawa-Gateway","Shinagawa","Osaki","Gotanda","Ebisu"],
      durations: Array(30).fill(2),
      branchOf: null
    },
    "KeihinTohoku": {
      name: "KeihinTohoku", nameEn: "Keihin-Tohoku Line", code: "JK", color: "#00B2E5",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/京浜東北線.png", durationTotalMin: 141, throughServices: [],
      transferStations: [],
      stations: ["Omiya","Saitama-Shintoshin","Yono","Kita-Urawa","Urawa","Minami-Urawa","Warabi","Nishi-Kawaguchi","Kawaguchi","Akabane","Higashi-Jujo","Oji","Kami-Nakazato","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Akihabara","Kanda","Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Tamachi","Takanawa-Gateway","Shinagawa","Oi","Omori","Kamata","Kawasaki","Tsurumi","Shin-Koyasu","Higashi-Kanagawa","Yokohama","Sakuragicho","Kannai","Ishikawacho","Yamate","Negishi","Isogo","Shin-Sugita","Yokoami","Konan-dai","Hongo-dai","Ofuna"],
      durations: Array(47).fill(3),
      branchOf: null
    },
    "Yokosuka": {
      name: "Yokosuka", nameEn: "Yokosuka Line", code: "JO", color: "#D81E06",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/総武線快速横須賀線.png", durationTotalMin: 24, throughServices: [{"line": "ShonanShinjuku", "code": "JS", "note": "湘南新宿ライン直通"}, {"line": "SobuRapid", "code": "JR", "note": "総武快速线直通"}],
      transferStations: [{"station": "Ofuna", "connects": ["Yokosuka"]}, {"station": "Yokohama", "connects": ["KeihinTohoku", "Tokaido"]}],
      stations: ["Yokosuka-Chuo","Higashi-Yokosuka","Yokosuka","Ofuna","Kissaki","Kurihama","Kasminato","Shiogama"],
      durations: Array(8).fill(3),
      branchOf: null
    },
    "ChuoRapid": {
      name: "ChuoRapid", nameEn: "Chuo Rapid Line", code: "JC", color: "#F18C00",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/中央快速線 青梅線 五日市線.png", durationTotalMin: 50, throughServices: [{"line": "Ome", "code": "JC", "note": "青梅线直通"}, {"line": "Itsukaichi", "code": "JC", "note": "五日市线直通"}, {"line": "SobuLocal", "code": "JL", "note": "总武缓行线直通"}],
      transferStations: [],
      stations: ["Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Shinagawa","Meguro","Ebisu","Shibuya","Shinjuku","Shinjuku-nishiguchi","Mejiro","Ikeda","Takadanobaba","Nagasaki","Otsuka","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Akihabara","Kanda","Ochanomizu"],
      durations: Array(25).fill(2),
      branchOf: null
    },
    "Saikyo": {
      name: "Saikyo", nameEn: "Saikyo Line", code: "JA", color: "#14a676",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/埼京線.png", durationTotalMin: 42, throughServices: [{"line": "ShonanShinjuku", "code": "JS", "note": "湘南新宿ライン直通"}],
      transferStations: [{"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Akabane", "connects": ["ShonanShinjuku"]}],
      stations: ["Omiya","Urawa","Niiza","Kita-Saitama","Kuki","Kumagaya","Hon-Jo","Sayama","Hachioji","Tachikawa","Musashynuigami","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane","Ikebukuro"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "Joban": {
      name: "Joban", nameEn: "Joban Rapid Line", code: "JJ", color: "#006acd",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/常盤線快速.png", durationTotalMin: 34, throughServices: [{"line": "Chiyoda", "code": "C", "note": "千代田线直通"}, {"line": "JobanLocal", "code": "JB", "note": "常磐缓行线直通"}],
      transferStations: [{"station": "Tokyo", "connects": ["KeihinTohoku"]}, {"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Akabane", "connects": ["ShonanShinjuku"]}],
      stations: ["Tokyo","Kiyose","Fuchubashi","Nishi-Fuchubashi","Musashino","Kichijoji","Nishi-Kichijoji","Harumi","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane"],
      durations: Array(17).fill(2),
      branchOf: null
    },
    "SobuLocal": {
      name: "SobuLocal", nameEn: "Sobu Local Line", code: "JL", color: "#1069b4",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/中央・総武線各駅停車.png", durationTotalMin: 38, throughServices: [{"line": "ChuoRapid", "code": "JC", "note": "中央缓行线直通"}],
      transferStations: [{"station": "Tokyo", "connects": ["KeihinTohoku", "Yamanote"]}],
      stations: ["Tokyo","Akebono","Nihonbashi","Mukojima","Ryogoku","Kuramae","Kinshi","Tsukishima","Harumi","Shinonome","Kachidoki","Toyosu","Tatsumi","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Shin-Adachi","Adachi"],
      durations: Array(19).fill(2),
      branchOf: null
    },
    "Keiyo": {
      name: "Keiyo", nameEn: "Keiyo Line", code: "JE", color: "#00A878",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/京葉線.png", durationTotalMin: 34, throughServices: [{"line": "Nambu", "code": "JN", "note": "南武线直通"}],
      transferStations: [{"station": "Tokyo", "connects": ["KeihinTohoku", "Yamanote", "Tokaido"]}],
      stations: ["Tokyo","Shin-Kiba","Tokyo Teleport","Ariake","Kachidoki","Toyosu","Tatsumi","Shinonome","Harumi","Shin-Koiwa","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Nishi-Funabashi","Funaabashi","Minamihama","Sodegaura","Choshi"],
      durations: Array(19).fill(2),
      branchOf: null
    },
    "Musashino": {
      name: "Musashino", nameEn: "Musashino Line", code: "JM", color: "#eb5a28",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/武蔵野線.png", durationTotalMin: 48, throughServices: [],
      transferStations: [{"station": "Fuchubashi", "connects": ["Joban"]}, {"station": "Kokubunji", "connects": ["ChuoRapid"]}, {"station": "Nishi-Funabashi", "connects": ["SobuLocal"]}],
      stations: ["Fuchu-Hommachi","Musashino","Nishi-Tachikawa","Tachikawa","Hachioji","Takao","Mitaka","Nakano","Higashi-Nakano","Nishi-Kawaguchi","Shin-Urawa","Omiya","Kita-Urawa","Minami-Urawa","Warabi","Nishi-Kawaguchi","Kawaguchi","Akabane","Ikebukuro","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane"],
      durations: Array(26).fill(2),
      branchOf: null
    },
    "ShonanShinjuku": {
      name: "ShonanShinjuku", nameEn: "Shonan-Shinjuku Line", code: "JS", color: "#1069b4",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/湘南新宿ライン.png", durationTotalMin: 63, throughServices: [{"line": "Yokosuka", "code": "JO", "note": "横须贺线直通"}, {"line": "Saikyo", "code": "JA", "note": "埼京线直通"}, {"line": "Joban", "code": "JJ", "note": "常磐线直通"}, {"line": "Takasaki", "code": "JU", "note": "高崎线直通"}, {"line": "Tokaido", "code": "JD", "note": "东海道线直通"}],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Tokyo", "connects": ["KeihinTohoku", "Yokosuka", "Tokaido"]}, {"station": "Akabane", "connects": ["Saikyo", "Joban"]}, {"station": "Ofuna", "connects": ["Yokosuka"]}],
      stations: ["Omiya","Urawa","Niiza","Kita-Saitama","Kuki","Kumagaya","Hon-Jo","Sayama","Hachioji","Tachikawa","Musashynuigami","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane","Ikebukuro","Yushima","Ueno","Okachimachi","Tokyo","Shinagawa","Yokohama","Ofuna","Kamakura","Fujisawa","Chigasaki","Sagamihara","Atsugi","Zushi","Yokosuka","Higashi-Yokosuka","Yokosuka-Chuo"],
      durations: Array(35).fill(2),
      branchOf: null
    },
    "Takasaki": {
      name: "Takasaki", nameEn: "Takasaki Line", code: "JU", color: "#f18e41",
      operator: "JR East", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/JR東日本/高崎線.png", durationTotalMin: 24, throughServices: [{"line": "ShonanShinjuku", "code": "JS", "note": "湘南新宿ライン直通"}],
      transferStations: [{"station": "Omiya", "connects": ["KeihinTohoku"]}, {"station": "Ueno", "connects": ["KeihinTohoku"]}, {"station": "Tokyo", "connects": ["KeihinTohoku"]}],
      stations: ["Omiya","Urawa","Kita-Urawa","Minami-Urawa","Warabi","Nishi-Kawaguchi","Kawaguchi","Akabane","Nishi-Urawa","Kita-Saitama","Kuki","Kumagaya","Hon-Jo","Sayama","Hachioji","Tachikawa","Musashynuigami","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane","Ikebukuro","Yushima","Ueno","Okachimachi","Tokyo","Shinagawa","Yokohama","Ofuna","Kamakura","Fujisawa","Chigasaki","Sagamihara","Atsugi","Zushi","Yokosuka","Higashi-Yokosuka","Yokosuka-Chuo"],
      durations: Array(41).fill(1),
      branchOf: null
    },
    "Tsurumi": {
      name: "Tsurumi", nameEn: "Tsurumi Line", code: "JV", color: "#FFD400",
      operator: "JR East", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/JR東日本/鶴見線.png", durationTotalMin: 18, throughServices: [],
      transferStations: [{"station": "Tsurumi", "connects": ["KeihinTohoku"]}, {"station": "Kawasaki", "connects": ["KeihinTohoku"]}],
      stations: ["Tsurumi","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Nambu","Nishi-Kawasaki","Kawasaki","Shin-Kawasaki","Mukozaiji","Tsurumishinmachi","Higashikanagawa","Tsurumi-Chuo","Kamoshidawa","Haneda","Shin-Yokohama","Nishi-Nakajima","Yokohama","Ishikawacho","Sakuragicho","Negishi","Yamate","Kannai","Kikuna","Ofuna"],
      durations: Array(24).fill(1),
      branchOf: null
    },
    "Nambu": {
      name: "Nambu", nameEn: "Nambu Line", code: "JN", color: "#f2d01f",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/南武線.png", durationTotalMin: 44, throughServices: [{"line": "Keiyo", "code": "JE", "note": "京叶线直通"}],
      transferStations: [{"station": "Kawasaki", "connects": ["KeihinTohoku"]}, {"station": "Musashi-Kosugi", "connects": ["Tokaido"]}, {"station": "Tachikawa", "connects": ["ChuoRapid"]}],
      stations: ["Kawasaki","Nambu","Shin-Kawasaki","Mukozaiji","Tsurumishinmachi","Higashikanagawa","Tsurumi","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Nambu","Nishi-Kawasaki","Kawasaki","Shin-Kawasaki","Mukozaiji","Tsurumishinmachi","Higashikanagawa","Tsurumi-Chuo","Kamoshidawa","Haneda","Shin-Yokohama","Nishi-Nakajima","Yokohama","Ishikawacho","Sakuragicho","Negishi","Yamate","Kannai","Kikuna","Ofuna","Tachikawa","Hachioji","Takao","Mitaka","Musashisakai","Kokubunji","Nakano","Shibuya","Ebisu","Shinagawa","Shimbashi","Tokyo"],
      durations: Array(43).fill(1),
      branchOf: null
    },
    "Tokaido": {
      name: "Tokaido", nameEn: "Tokaido Line", code: "JD", color: "#f0862b",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/東海道線.png", durationTotalMin: 48, throughServices: [{"line": "ShonanShinjuku", "code": "JS", "note": "湘南新宿ライン直通"}],
      transferStations: [{"station": "Tokyo", "connects": ["KeihinTohoku", "Yamanote"]}, {"station": "Shinagawa", "connects": ["KeihinTohoku"]}, {"station": "Yokohama", "connects": ["KeihinTohoku"]}, {"station": "Ofuna", "connects": ["Yokosuka"]}],
      stations: ["Tokyo","Shinagawa","Yokohama","Odawara","Atami","Kikuna","Shimoda","Ito","Yumoto","Matsuda","Sagami-Ono","Chigasaki","Fujisawa","Yukinoshita","Kamakura","Ofuna"],
      durations: Array(16).fill(3),
      branchOf: null
    },
    "JobanLocal": {
      name: "JobanLocal", nameEn: "Joban Local Line", code: "JB", color: "#006acd",
      operator: "JR East", region: "Chiba Area", type: "straight",
      image: "../images/鉄道/JR東日本/常盤緩行線.png", durationTotalMin: 22, throughServices: [{"line": "Joban", "code": "JJ", "note": "常磐快速线直通"}],
      transferStations: [{"station": "Ueno", "connects": ["KeihinTohoku"]}, {"station": "Akihabara", "connects": ["KeihinTohoku"]}, {"station": "Tokyo", "connects": ["KeihinTohoku"]}, {"station": "Kitasenju", "connects": ["Joban"]}],
      stations: ["Ueno","Nezu","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Shin-Okachimachi","Akihabara","Kanda","Tokyo","Kitasenju","Shiroi","Kamagaya","Toride","Abiko","Kashiwa","Narashino","Funabashi","Makuhari","Tsukuba"],
      durations: Array(21).fill(1),
      branchOf: null
    },
    "Ginza": {
      name: "Ginza", nameEn: "Ginza Line", code: "G", color: "#FF9500",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/銀座線.png", durationTotalMin: 18, throughServices: [],
      transferStations: [{"station": "Shibuya", "connects": ["Marunouchi"]}, {"station": "Ginza", "connects": ["Marunouchi"]}, {"station": "Ginza-yonchome", "connects": ["Hibiya"]}, {"station": "Ueno", "connects": ["Hibiya"]}],
      stations: ["Shibuya","Waseda","Ueno","Ueno-hirokoji","Tawaramachi","Ginza","Ginza-yonchome","Hibiya","Asakusa"],
      durations: Array(9).fill(2),
      branchOf: null
    },
    "Marunouchi": {
      name: "Marunouchi", nameEn: "Marunouchi Line", code: "M", color: "#F62E36",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/丸ノ内線.png", durationTotalMin: 36, throughServices: [],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Nakano-Sakaue", "connects": ["ChuoRapid"]}, {"station": "Akasaka-mitsuke", "connects": ["Hanzomon"]}, {"station": "Otemachi", "connects": ["Hanzomon"]}, {"station": "Shibuya", "connects": ["Fukutoshin"]}],
      stations: ["Shinjuku","Nakano-Sakaue","Nakano","Nakano-fujimicho","Shinanomachi","Shibuya","Mejiro","Shinjuku-nishiguchi","Yoyogi","Shibuya","Shibuya","Omotesando","Aoyama-itchome","Akasaka-mitsuke","Kokkai-gijido","Hibiya","Otemachi","Yurakucho","Shinbashi","Ginza","Kyubotsu","Nihonbashi","Mitsukoshimae","Kawada","Kayabacho","Ningyocho","Nihonbashi","Mitarashi","Tsukishima","Den-en-chofu","Shinagawa","Kototoi","Oimachi","Higashi-gotanda","Meguro","Kamata","Takashimadaira","Shin-kawasaki","Kawasaki"],
      durations: Array(38).fill(1),
      branchOf: null
    },
    "Hibiya": {
      name: "Hibiya", nameEn: "Hibiya Line", code: "H", color: "#B5B5AC",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/日比谷線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [{"station": "Ginza-yonchome", "connects": ["Ginza"]}, {"station": "Hibiya", "connects": ["Marunouchi"]}, {"station": "Ueno", "connects": ["Ginza"]}, {"station": "Kiyosumi-shirakawa", "connects": ["Yurakucho"]}],
      stations: ["Nakameguro","Kitasendai","Hibiya","Ginza","Ueno","Akihabara","Hatchobori","Kayabacho","Tsukiji","Ginza-hitchome","Nijubashimae","Hibiya","Kasumigaseki","Hiroo","Meguro"],
      durations: Array(15).fill(2),
      branchOf: null
    },
    "Yurakucho": {
      name: "Yurakucho", nameEn: "Yurakucho Line", code: "Y", color: "#C1A470",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/有楽町線.png", durationTotalMin: 62, throughServices: [{"line": "SeibuIkebukuro", "code": "SI", "note": "西武池袋线直通"}],
      transferStations: [{"station": "Yurakucho", "connects": ["Marunouchi", "Hibiya"]}, {"station": "Shin-Kiba", "connects": ["Fukutoshin"]}, {"station": "Kiyosumi-shirakawa", "connects": ["Hibiya"]}, {"station": "Wakoshi", "connects": ["SeibuIkebukuro"]}],
      stations: ["Wakoshi","Nishi-takahashimadaira","Kishibojin","Iruma","Shin-rinkan","Higashi-murayama","Kokubunji","Nishi-kokubunji","Akigawa","Takaosanguchi","Hashimoto","Hachioji","Musashi-sakai","Tachikawa","Nishi-fuchu","Fuchu","Hino","Nishi-koen","Seijodai","Akatsuka","Musashinurare","Kokumin-kyogijo","Mejiro-dai","Ikebukuro","Tokyo-domae","Yurakucho","Shinbashi","Daimon","Onarimon","Shimbashi","Yurakucho"],
      durations: Array(31).fill(2),
      branchOf: null
    },
    "Tozai": {
      name: "Tozai", nameEn: "Tozai Line", code: "T", color: "#009BBF",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/東西線.png", durationTotalMin: 42, throughServices: [],
      transferStations: [{"station": "Otemachi", "connects": ["Chiyoda", "Marunouchi"]}, {"station": "Shin-Otsuka", "connects": ["Hanzomon"]}, {"station": "Fuchubashi", "connects": ["Musashino"]}],
      stations: ["Nishi-fushimi","Fuchu","Nishi-takahashimadaira","Kodaira","Hikaridai","Nishi-takaido","Karasuyama","Nakano-fujimicho","Nakano","Shinanomachi","Shibuya","Shirokane-takanawa","Toranomon","Shimbashi","Nihonbashi","Kayabacho","Choju","Akihabara","Kiba","Koto-shibari","Toyo-su","Shin-kiba"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "Chiyoda": {
      name: "Chiyoda", nameEn: "Chiyoda Line", code: "C", color: "#00BB85",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/千代田線.png", durationTotalMin: 40, throughServices: [{"line": "TokyuDenEn", "code": "TD", "note": "田园都市线直通"}],
      transferStations: [{"station": "Otemachi", "connects": ["Tozai", "Marunouchi"]}, {"station": "Yurakucho", "connects": ["Yurakucho"]}, {"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Fukutoshin"]}, {"station": "Akabane-Iwabuchi", "connects": ["Namboku"]}],
      stations: ["Hitotsubashi","Kudanshita","Jimbocho","Otemachi","Yurakucho","Hibiya","Kasumigaseki","Yokohama","Shin-Otsuka","Akabane-Iwabuchi","Kita-Senju","Minami-Senju","Adachi","Shin-Adachi","Koshigaya-Lake City","Kita-Kokubun"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Hanzomon": {
      name: "Hanzomon", nameEn: "Hanzomon Line", code: "Z", color: "#8F76D6",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/半蔵門線.png", durationTotalMin: 30, throughServices: [{"line": "Namboku", "code": "N", "note": "南北线直通"}, {"line": "Asakusa", "code": "A", "note": "浅草线直通"}],
      transferStations: [{"station": "Shibuya", "connects": ["Ginza"]}, {"station": "Otemachi", "connects": ["Marunouchi"]}, {"station": "Shimoesaka", "connects": ["Asakusa"]}, {"station": "Oshiage", "connects": ["Asakusa"]}],
      stations: ["Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Ichigaya","Nagatacho","Akasaka-mitsuke","Oshiage"],
      durations: Array(12).fill(2),
      branchOf: null
    },
    "Namboku": {
      name: "Namboku", nameEn: "Namboku Line", code: "N", color: "#00AC9B",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/南北線.png", durationTotalMin: 35, throughServices: [{"line": "Hanzomon", "code": "Z", "note": "半藏门线直通"}, {"line": "Asakusa", "code": "A", "note": "浅草线直通"}],
      transferStations: [{"station": "Meguro", "connects": ["Hanzomon", "Mita"]}, {"station": "Akabane-Iwabuchi", "connects": ["Marunouchi"]}, {"station": "Shin-Otsuka", "connects": ["Fukutoshin"]}],
      stations: ["Meguro","Meguro-Dai","Shirokanedai","Nakameguro","Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Kojimachi","Ichigaya","Nagatacho","Akabane-Iwabuchi"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Fukutoshin": {
      name: "Fukutoshin", nameEn: "Fukutoshin Line", code: "F", color: "#9C5E31",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/副都心線.png", durationTotalMin: 40, throughServices: [{"line": "TokyuToyoko", "code": "TY", "note": "东急东横线直通"}, {"line": "SeibuShinjuku", "code": "SN", "note": "西武新宿线直通"}],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Waseda", "connects": ["SeibuShinjuku"]}],
      stations: ["Wakoshi","Higashi-Ikebukuro","Ikebukuro","Yushima","Ueno","Okachimachi","Ginza","Yurakucho","Shimbashi","Hamamatsucho","Tokyo","Nihonbashi","Makuhari-hongo","Kayabacho","Tsukishima","Tokyo Dome-mae","Kacho-mae","Harumi-futago","Shin-Kiba"],
      durations: Array(19).fill(2),
      branchOf: null
    },
    "Asakusa": {
      name: "Asakusa", nameEn: "Asakusa Line", code: "A", color: "#EC6E65",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都営浅草線.png", durationTotalMin: 36, throughServices: [{"line": "Hanzomon", "code": "Z", "note": "半藏门线直通"}, {"line": "Namboku", "code": "N", "note": "南北线直通"}, {"line": "Keikyu", "code": "KK", "note": "京急线直通"}],
      transferStations: [{"station": "Asakusa", "connects": ["Ginza"]}, {"station": "Oshiage", "connects": ["Hanzomon", "TobuSkytree"]}, {"station": "Shinagawa", "connects": ["Yokosuka"]}],
      stations: ["Oshiage","Kerama","Asakusa","Nihonbashi","Kayabacho","Ningyocho","Higashi-nihonbashi","Mitarashi","Tsukishima","Den-en-chofu","Shinagawa","Kototoi","Oimachi","Higashi-gotanda","Meguro","Kamata","Takashimadaira","Shin-kawasaki","Kawasaki"],
      durations: Array(19).fill(2),
      branchOf: null
    },
    "Do-Arakawa": {
      name: "Do-Arakawa", nameEn: "Toei Arakawa Line", code: "DA", color: "#EE86A7",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都電荒川線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [],
      stations: ["Nishi-Shinjuku","Seibu-Shinjuku","Waseda","Hakusan","Ikebukuro","Minami-Nagasaki","Kita-Otsuka","Iruma-shi","Kokubunji","Higashi-Koganei","Akitsu","Nishifujisawa","Oyama","Higashi-Murayama","Tsurukawa","Higashi-Hachioji","Hachioji","Takahatafujimidai","Okutama-guchi"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "Mita": {
      name: "Mita", nameEn: "Mita Line", code: "I", color: "#006CB6",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都営三田線.png", durationTotalMin: 32, throughServices: [],
      transferStations: [{"station": "Meguro", "connects": ["Hanzomon", "Namboku"]}, {"station": "Akabane-Iwabuchi", "connects": ["Marunouchi"]}, {"station": "Shin-Otsuka", "connects": ["Fukutoshin"]}],
      stations: ["Meguro","Meguro-Dai","Shirokanedai","Nakameguro","Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Kojimachi","Ichigaya","Nagatacho","Akabane-Iwabuchi"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Shinjuku": {
      name: "Shinjuku", nameEn: "Shinjuku Line", code: "S", color: "#B0BF1E",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都営新宿線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shinjuku-sanchome", "connects": ["Marunouchi"]}, {"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Ichigaya", "connects": ["Marunouchi"]}, {"station": "Nagatacho", "connects": ["Hanzomon"]}, {"station": "Akasaka-mitsuke", "connects": ["Hanzomon"]}],
      stations: ["Shinjuku","Shinjuku-sanchome","Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Kojimachi","Ichigaya","Nagatacho","Akasaka-mitsuke","Oshiage","Kita-Senju"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Oedo": {
      name: "Oedo", nameEn: "Oedo Line", code: "E", color: "#CE045B",
      operator: "Toei", region: "Tokyo Area", type: "loop",
      image: "../images/鉄道/都営地下鉄/都営大江戸線.png", durationTotalMin: 70, throughServices: [],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Agane", "connects": ["Saikyo"]}, {"station": "Yoyogi", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Yamanote", "Ginza"]}, {"station": "Roppongi", "connects": ["Hibiya"]}, {"station": "Akabane-Iwabuchi", "connects": ["Hanzomon", "Namboku"]}, {"station": "Asakusa", "connects": ["Ginza"]}, {"station": "Oshiage", "connects": ["Hanzomon", "TobuSkytree"]}],
      stations: ["Tochomae","Hikaridai","Kodaira","Nishi-takahashimadaira","Seijodai","Akatsuka","Musashinurare","Kokumin-kyogijo","Nishi-kokubunji","Kokubunji","Nakano-fujimicho","Nakano","Shinanomachi","Shibuya","Yoyogi","Shinjuku","Nishi-Shinjuku","Seibu-Shinjuku","Waseda","Hakusan","Ikebukuro","Minami-Nagasaki","Kita-Otsuka","Iruma-shi","Kokubunji","Higashi-Koganei","Akitsu","Nishifujisawa","Oyama","Higashi-Murayama","Tsurukawa","Higashi-Hachioji","Hachioji","Takahatafujimidai","Okutama-guchi"],
      durations: Array(35).fill(2),
      branchOf: null
    },
    "Yurikamome": {
      name: "Yurikamome", nameEn: "Yurikamome", code: "U", color: "#0065A6",
      operator: "Yurikamome", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/ゆりかもせ/ゆりかもせ.png", durationTotalMin: 19, throughServices: [],
      transferStations: [{"station": "Shimbashi", "connects": ["Yamanote"]}, {"station": "Tokyo Teleport", "connects": ["Rinko"]}, {"station": "Ariake", "connects": ["Rinko"]}],
      stations: ["Shimbashi","Ginza","Ginza-yonchome","Hibiya","Waseda","Ueno","Ueno-hirokoji","Tawaramachi","Asakusa"],
      durations: Array(9).fill(2),
      branchOf: null
    },
    "Keikyu": {
      name: "Keikyu", nameEn: "Keikyu Main Line", code: "KK", color: "#005AAA",
      operator: "Keikyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/京急電鉄/本線.png", durationTotalMin: 22, throughServices: [{"line": "Asakusa", "code": "A", "note": "都営浅草線直通"}],
      transferStations: [{"station": "Shinagawa", "connects": ["Yokosuka"]}, {"station": "Kanazawa-Bunko", "connects": ["TobuNoda"]}],
      stations: ["Shinagawa","Osaki","Gotanda","Ebisu","Shibuya","Mejiro","Ikebukuro","Takashimadaira","Hikaridai","Kodaira","Nishi-takahashimadaira","Seijodai","Akatsuka","Musashinurare","Kokumin-kyogijo","Nishi-kokubunji","Kokubunji","Nakano-fujimicho","Nakano","Shinanomachi","Shibuya"],
      durations: Array(21).fill(1),
      branchOf: null
    },
    "Keisei": {
      name: "Keisei", nameEn: "Keisei Main Line", code: "KS", color: "#005AAA",
      operator: "Keisei", region: "Chiba Area", type: "straight",
      image: "../images/鉄道/京成電鉄/東条本線 おごせ線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [{"station": "Nippori", "connects": ["Yamanote"]}, {"station": "Aoto", "connects": ["TobuNoda"]}],
      stations: ["Nippori","Tadachi","Keisei-Tsukawa","Koiwa","Minami-Senju","Adachi","Shin-Adachi","Yoshiwara","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Shin-Adachi","Adachi","Shin-Misaki","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(18).fill(1),
      branchOf: null
    },
    "Odawara": {
      name: "Odawara", nameEn: "Odawara Line", code: "OH", color: "#0583c8",
      operator: "Odakyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/小田急電鉄/小田原線.png", durationTotalMin: 28, throughServices: [],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Yamanote"]}],
      stations: ["Shinjuku","Setagaya","Sasazuka","Yoyogi-Uehara","Nakamurabashi","Shibuya","Sangenjaya","Machiya","Takaradai","Tama-Center","Hachiman","Tsurumi","Yamato","Odawara"],
      durations: Array(14).fill(2),
      branchOf: null
    },
    "Keio": {
      name: "Keio", nameEn: "Keio Line", code: "KO", color: "#DD0077",
      operator: "Keio", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/京王電鉄/山口線.png", durationTotalMin: 18, throughServices: [],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Machida", "connects": ["Odakyu"]}],
      stations: ["Shinjuku","Setagaya","Sasazuka","Yoyogi-Uehara","Nakamurabashi","Shibuya","Sangenjaya","Machiya","Takaradai","Tama-Center","Hachiman","Tsurumi","Yamato","Fujisawa","Enoshima","Machida","Hachiōji","Takaosanguchi","Takaoki","Inokashira","Kōnan","Kōnan-chō","Tama-Dōbutsukōen","Mizumaki","Shōnan-dai","Inagi","Tama-Center","Machiya","Sangenjaya","Shibuya","Nakamurabashi","Yoyogi-Uehara","Sasazuka","Setagaya","Shinjuku"],
      durations: Array(32).fill(1),
      branchOf: null
    },
    "TokyuDenEn": {
      name: "TokyuDenEn", nameEn: "Den-en-toshi Line", code: "TD", color: "#007cc2",
      operator: "Tokyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/東急電鉄/田園都市線.png", durationTotalMin: 28, throughServices: [{"line": "Chiyoda", "code": "C", "note": "千代田线直通"}],
      transferStations: [{"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Nakameguro", "connects": ["Namboku"]}, {"station": "Machida", "connects": ["Odakyu"]}],
      stations: ["Shibuya","Nakameguro","Daikanyama","Sangenjaya","Futamata-gawa","Nakatsu","Hachiman-gaika","Kichijoji","Musashi-Kosugi","Tama-plaza","Tsutsujigaoka","Midoridai","Seijō","Tsukamonto","Minami-Wakasu","Wakasu","Tokyo Teleport","Ariake","Shin-kawasaki","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Nambu","Nishi-Kawasaki","Kawasaki","Shin-Kawasaki","Mukozaiji","Tsurumishinmachi","Higashikanagawa","Tsurumi","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Nambu","Nishi-Kawasaki","Kawasaki","Shin-Kawasaki","Mukozaiji","Tsurumishinmachi","Higashikanagawa","Tsurumi-Chuo","Kamoshidawa","Haneda","Shin-Yokohama","Nishi-Nakajima","Yokohama","Ishikawacho","Sakuragicho","Negishi","Yamate","Kannai","Kikuna","Ofuna","Tachikawa","Hachioji","Takao","Mitaka","Musashisakai","Kokubunji","Nakano","Shibuya","Ebisu","Shinagawa","Shimbashi","Tokyo","Shin-Kiba"],
      durations: Array(51).fill(1),
      branchOf: null
    },
    "TokyuToyoko": {
      name: "TokyuToyoko", nameEn: "Toyoko Line", code: "TY", color: "#DA0442",
      operator: "Tokyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/東急電鉄/東横線.png", durationTotalMin: 30, throughServices: [{"line": "Fukutoshin", "code": "F", "note": "副都心线直通"}, {"line": "MinatoMirai", "code": "MM", "note": "港未来线直通"}],
      transferStations: [{"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Yokohama", "connects": ["KeihinTohoku"]}, {"station": "Motomachi-Chukagai", "connects": ["MinatoMirai"]}],
      stations: ["Shibuya","Nakameguro","Fudosan-mae","Yoyogi-Uehara","Daikanyama","Chuo-rinkan","Setagaya","Seijo-shijo","Komazawa","Tamagawa","Tamagawa-Enzei-ji","Daizen-ji","Mukaiminato","Hama-Kawada","Yokohama"],
      durations: Array(15).fill(2),
      branchOf: null
    },
        "MinatoMirai": {
      name: "MinatoMirai", nameEn: "Minato Mirai Line", code: "MM", color: "#00B6C7",
      operator: "Minato Mirai Kyuko", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/みなとみらい線/みなとみらい線.png", durationTotalMin: 9,
      throughServices: [],
      transferStations: [{"station": "Yokohama", "connects": ["KeihinTohoku", "Tokaido"]}, {"station": "Motomachi-Chukagai", "connects": ["TokyuToyoko"]}],
      stations: ["Yokohama","Nihon-odori","Motomachi-Chukagai","Minato-Mirai-21","Bay-Cross"],
      durations: Array(5).fill(2),
      branchOf: null
    },"YokohamaBlue": {
      name: "YokohamaBlue", nameEn: "Blue Line", code: "B", color: "#2F56A5",
      operator: "Yokohama Municipal Transportation", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/横浜市交通局/ブルーライン.png", durationTotalMin: 26, throughServices: [{"line": "TokyuToyoko", "code": "TY", "note": "东急东横线直通"}],
      transferStations: [{"station": "Yokohama", "connects": ["KeihinTohoku"]}, {"station": "Motomachi-Chukagai", "connects": ["TokyuToyoko"]}],
      stations: ["Shin-Yokohama","Higashi-Yokohama","Yokohama","Higashi-Odaka","Nakagawa","Minami-Kanagawa","Shin-Kawasaki","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Nambu","Nishi-Kawasaki","Kawasaki","Shin-Kawasaki","Mukozaiji","Tsurumishinmachi","Higashikanagawa","Tsurumi","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Nambu","Nishi-Kawasaki","Kawasaki","Shin-Kawasaki","Mukozaiji","Tsurumishinmachi","Higashikanagawa","Tsurumi-Chuo","Kamoshidawa","Haneda","Shin-Yokohama","Nishi-Nakajima","Yokohama","Ishikawacho","Sakuragicho","Negishi","Yamate","Kannai","Kikuna","Ofuna","Tachikawa","Hachioji","Takao","Mitaka","Musashisakai","Kokubunji","Nakano","Shibuya","Ebisu","Shinagawa","Shimbashi","Tokyo","Shin-Kiba"],
      durations: Array(51).fill(1),
      branchOf: null
    },
    "SeibuShinjuku": {
      name: "SeibuShinjuku", nameEn: "Seibu Shinjuku Line", code: "SN", color: "#00A6BF",
      operator: "Seibu", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/西武鉄道/新宿線 ハイジマ線.png", durationTotalMin: 40, throughServices: [{"line": "Fukutoshin", "code": "F", "note": "副都心线直通"}],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Waseda", "connects": ["Fukutoshin"]}],
      stations: ["Shinjuku","Nishi-Shinjuku","Seibu-Shinjuku","Waseda","Hakusan","Ikebukuro","Minami-Nagasaki","Kita-Otsuka","Iruma-shi","Kokubunji","Higashi-Koganei","Akitsu","Nishifujisawa","Oyama","Higashi-Murayama","Tsurukawa","Higashi-Hachioji","Hachioji","Takahatafujimidai","Okutama-g口chi"],
      durations: Array(20).fill(2),
      branchOf: null
    },
    "SeibuIkebukuro": {
      name: "SeibuIkebukuro", nameEn: "Seibu Ikebukuro Line", code: "SI", color: "#ed772d",
      operator: "Seibu", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png", durationTotalMin: 36, throughServices: [{"line": "Yurakucho", "code": "Y", "note": "有乐町线直通"}],
      transferStations: [{"station": "Ikebukuro", "connects": ["Yamanote"]}, {"station": "Wakoshi", "connects": ["Yurakucho"]}],
      stations: ["Ikebukuro","Nishi-Ikebukuro","Otsuka","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Kitasenju","Shiroi","Kamagaya","Toride","Abiko","Kashiwa","Narashino","Funabashi","Makuhari","Tsukuba"],
      durations: Array(20).fill(2),
      branchOf: null
    },
    "SeibuChichibu": {
      name: "SeibuChichibu", nameEn: "Seibu Chichibu Line", code: "SC", color: "#ed772d",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png", durationTotalMin: 14, throughServices: [],
      transferStations: [],
      stations: ["Seibu-Chichibu","Yorii","Kawagoe","Hon-Kawagoe","Minami-Kawagoe","Sayama","Hachioji","Tachikawa","Musashynuigami","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane","Ikebukuro"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "SeibuTamako": {
      name: "SeibuTamako", nameEn: "Tamako Line", code: "ST", color: "#ed772d",
      operator: "Seibu", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/西武鉄道/玉子線.png", durationTotalMin: 6, throughServices: [],
      transferStations: [],
      stations: ["Seibu-Yuuyamada","Yuki","Tamako"],
      durations: Array(3).fill(2),
      branchOf: null
    },
    "SeibuTamagawa": {
      name: "SeibuTamagawa", nameEn: "Tamagawa Line", code: "SM", color: "#ed772d",
      operator: "Seibu", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/西武鉄道/玉川線.png", durationTotalMin: 8, throughServices: [],
      transferStations: [{"station": "Shibuya", "connects": ["Yamanote"]}],
      stations: ["Shibuya","Setagaya","Sasazuka","Yoyogi-Uehara"],
      durations: Array(4).fill(2),
      branchOf: null
    },
    "OdakyuEnoshima": {
      name: "OdakyuEnoshima", nameEn: "Odakyu Enoshima Line", code: "OE", color: "#0583c8",
      operator: "Odakyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/小田急電鉄/江ノ島線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Yamanote"]}],
      stations: ["Shinjuku","Setagaya","Sasazuka","Yoyogi-Uehara","Nakamurabashi","Shibuya","Sangenjaya","Machiya","Takaradai","Tama-Center","Hachiman","Tsurumi","Yamato","Fujisawa","Enoshima"],
      durations: Array(14).fill(2),
      branchOf: null
    },
    "TobuIsesaki": {
      name: "TobuIsesaki", nameEn: "Tobu Isesaki Line", code: "TI", color: "#00428e",
      operator: "Tobu", region: "Gunma Area", type: "straight",
      image: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png", durationTotalMin: 46, throughServices: [],
      transferStations: [{"station": "Asakusa", "connects": ["Ginza"]}, {"station": "Oshiage", "connects": ["Asakusa", "Hanzomon"]}],
      stations: ["Asakusa","Oshiage","Shin-Machiya","Nishi-Magome","Minami-Magome","Koji","Minowa","Tawaramachi","Shimo-Kitazzu","Kita-Aoi","Aoto","Adachi-Kangura","Minami-Senju","Tatekawa","Shin-Adachi","Adachi","Shin-Misaki","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Shin-Adachi","Adachi","Shin-Koizumi","Koizumi","Ashikaga","Tochigi","Utsunomiya","Takasaki","Maebashi","Isesaki","Annaka-Harasawa","Shioya","Fujioka","Higashi-Fujioka","Kanna","Kusatsu","Agatsuma-Onsen","Kanuma","Tochigi","Utsunomiya","Nashiko","Nikko","Shirakawa","Yabuki","Iwase","Kuroiso","Oyama","Utsunomiya","Tochigi","Ashikaga","Koizumi","Shioya","Fujioka","Higashi-Fujioka","Kanna","Kusatsu","Agatsuma-Onsen","Kanuma"],
      durations: Array(50).fill(1),
      branchOf: null
    },
    "TobuSkytree": {
      name: "TobuSkytree", nameEn: "Tobu Skytree Line", code: "TS", color: "#006cba",
      operator: "Tobu", region: "Chiba Area", type: "straight",
      image: "../images/鉄道/東武鉄道/東武スカイツリーライン 亀戸線 大志線.png", durationTotalMin: 42, throughServices: [],
      transferStations: [{"station": "Asakusa", "connects": ["Ginza"]}, {"station": "Oshiage", "connects": ["Hanzomon", "Oedo"]}],
      stations: ["Asakusa","Oshiage","Shin-Machiya","Nishi-Magome","Minami-Magome","Koji","Minowa","Tawaramachi","Shimo-Kitazzu","Kita-Aoi","Aoto","Adachi-Kangura","Minami-Senju","Tatekawa","Shin-Adachi","Adachi","Shin-Misaki","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "TobuNikko": {
      name: "TobuNikko", nameEn: "Tobu Nikko Line", code: "TN", color: "#880022",
      operator: "Tobu", region: "Tochigi Area", type: "straight",
      image: "../images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png", durationTotalMin: 42, throughServices: [],
      transferStations: [{"station": "Asakusa", "connects": ["Ginza"]}, {"station": "Oshiage", "connects": ["Asakusa"]}],
      stations: ["Asakusa","Oshiage","Shin-Machiya","Nishi-Magome","Minami-Magome","Koji","Minowa","Tawaramachi","Shimo-Kitazzu","Kita-Aoi","Aoto","Adachi-Kangura","Minami-Senju","Tatekawa","Shin-Adachi","Adachi","Shin-Misaki","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "TobuNoda": {
      name: "TobuNoda", nameEn: "Tobu Noda Line", code: "NT", color: "#40b4e5",
      operator: "Tobu", region: "Chiba Area", type: "straight",
      image: "../images/鉄道/東武鉄道/野田線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [{"station": "Nippori", "connects": ["Yamanote"]}, {"station": "Aoto", "connects": ["Keisei"]}],
      stations: ["Nippori","Tadachi","Keisei-Tsukawa","Koiwa","Minami-Senju","Adachi","Shin-Adachi","Yoshiwara","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(11).fill(2),
      branchOf: null
    },
    "TamaMonorail": {
      name: "TamaMonorail", nameEn: "Tama Monorail Line", code: "TM", color: "#ff6a00",
      operator: "Tama Monorail", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/多摩都市モノレール/多摩都市モノレール線.png", durationTotalMin: 48, throughServices: [],
      transferStations: [{"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Takanawa-Gateway", "connects": ["KeihinTohoku"]}],
      stations: ["Nishi-Takahashimadaira","Takahashimadaira","Higashi-Maruko","Nishi-Fuchubashi","Fuchubashi","Kokubunji","Nakano","Shin-Okubo","Ichigaya","Yoyogi-Uehara","Shibuya","Shinsen","Higashi-Kanagawa","Tsurumi","Nishi-Kawasaki","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Koyasu","Shin-Koyasu","Minami-Wakasu","Wakasu","Tokyo Teleport","Ariake"],
      durations: Array(24).fill(2),
      branchOf: null
    },
    "Rinko": {
      name: "Rinko", nameEn: "Rinko Line", code: "R", color: "#00A0C7",
      operator: "Tokyo Waterfront", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京臨海高速鉄道/臨海線.png", durationTotalMin: 19, throughServices: [],
      transferStations: [{"station": "Osaki", "connects": ["KeihinTohoku"]}, {"station": "Tamachi", "connects": ["Yamanote"]}, {"station": "Tokyo Teleport", "connects": ["Yurikamome"]}, {"station": "Ariake", "connects": ["Yurikamome"]}],
      stations: ["Osaki","Tamachi","Kachidoki","Toyosu","TokyoTeleport","Ariake","OdaibaKaihinkoen","Miraikai","Denno","Midosuji","Aomi","TokyoBigSight","Daiba","Hinode","KokusaiTenjijo","MakuhariSeaside","ShinKemigawa","MinamiKemigawa","ShinKiba"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "HitachiNakaKaimin": {
      name: "HitachiNakaKaimin", nameEn: "Tsukuba Express", code: "TX", color: "#000084",
      operator: "Mitsui Fudosan", region: "Ibaraki Area", type: "straight",
      image: "../images/鉄道/首都圏新都市鉄道/つくばエクスプレス.jpg", durationTotalMin: 35, throughServices: [],
      transferStations: [{"station": "Akihabara", "connects": ["Yamanote"]}, {"station": "Shinagawa", "connects": ["KeihinTohoku"]}, {"station": "Shibuya", "connects": ["Yamanote"]}, {"station": "Shinjuku", "connects": ["Yamanote"]}],
      stations: ["Akihabara","Kanda","Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Tamachi","Takanawa-Gateway","Shinagawa","Osaki","Gotanda","Ebisu","Meguro","Hiroo","Roppongi","Akabane","Ikebukuro","Nishi-Ikebukuro","Otsuka","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Kitasenju","Shiroi","Kamagaya","Toride","Abiko","Kashiwa","Narashino","Funabashi","Makuhari","Tsukuba"],
      durations: Array(35).fill(1),
      branchOf: null
    },
    "Ome": {
      name: "Ome", nameEn: "Ome Line", code: "JC", color: "#dd6935",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/青梅線.png", durationTotalMin: 45,
      throughServices: [{"line": "ChuoRapid", "code": "JC", "note": "中央快速线直通"}],
      transferStations: [{"station": "Tachikawa", "connects": ["ChuoRapid", "Musashino"]}, {"station": "Haijima", "connects": ["Itsukaichi"]}],
      stations: ["Tachikawa","Nishi-Tachikawa","Mitake","Okutama-guchi","Ome","Nakagami","Haijima","Higashi-Ome","Sawai","Nishi-Ome","Futamatao","Ishigamimae","Hinatawada","Miyanohira","Musashi-Sakai","Musashi-Yoshida","Tachikawa-Minami","Tachikawa-Kita"],
      durations: Array(18).fill(2),
      branchOf: null
    },
    "Itsukaichi": {
      name: "Itsukaichi", nameEn: "Itsukaichi Line", code: "JC", color: "#dd6935",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/五日市線.png", durationTotalMin: 20,
      throughServices: [{"line": "Ome", "code": "JC", "note": "青梅线直通"}],
      transferStations: [{"station": "Haijima", "connects": ["Ome"]}],
      stations: ["Haijima","Higashi-Akiru","Nishi-Akiru","Musashi-Hikita","Musashi-Masuko","Musashi-Itsukaichi"],
      durations: Array(6).fill(2),
      branchOf: null
    },
    "SobuRapid": {
      name: "SobuRapid", nameEn: "Sobu Rapid Line", code: "JR", color: "#1069b4",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/総武線快速.png", durationTotalMin: 30,
      throughServices: [{"line": "Yokosuka", "code": "JO", "note": "横须贺线直通"}],
      transferStations: [{"station": "Tokyo", "connects": ["KeihinTohoku", "Yamanote", "Tokaido"]}, {"station": "Akihabara", "connects": ["KeihinTohoku"]}, {"station": "Kanda", "connects": ["KeihinTohoku"]}, {"station": "Ochanomizu", "connects": ["ChuoRapid"]}],
      stations: ["Tokyo","Akihabara","Kanda","Ochanomizu","Iidabashi","Fujimi","Iwatsunomachi","Korakuen","Mikawahashi","Nihonbashi","Ningyocho","Kayabacho","Tsukishima","Toyosu","Shin-Kiba","Toyosu","Monorail Cargo Terminal","Tatsumi","Nihon Bashi","Tsukiji","Ginza","Hatchobori","Aoyama","Kiba","Kaihinkosen","Shin-Koiwa","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Adachi","Koshigaya","Oshiage","Tokiwabashi","Komagome","Tabata","Shin-Urawa","Urawa","Kita-Urawa","Minami-Urawa","Saitama","Kumagaya","Honjo","Kuki","Asaka","Shiraoka","Wada","Tateshina","Iruma","Sakado","Hanno","Tokigawa","Sayama","Hachioji","Tachikawa","Musashisakai","Nakano","Nakano-Sakaue","Shinjuku","Shibuya","Ebisu","Shinagawa","Shimbashi","Hamamatsucho","Tamachi","Takanawa-Gateway","Shinagawa","Yokohama","Ofuna","Zushi","Yokosuka","Higashi-Yokosuka","Yokosuka-Chuo"],
      durations: Array(52).fill(1),
      branchOf: null
    }
  };

  window.TRAINS = window.TRAINS || {
    "Yamanote": [
      {"id":"JY01","type":"普通","destination":"浜松町","cars":6,"delay":0,"departAt":601},
      {"id":"JY02","type":"普通","destination":"吉祥寺","cars":6,"delay":0,"departAt":613},
      {"id":"JY03","type":"普通","destination":"立川","cars":8,"delay":0,"departAt":626},
      {"id":"JY04","type":"特快","destination":"三鷹","cars":10,"delay":0,"departAt":643},
      {"id":"JY05","type":"快速","destination":"橋本","cars":10,"delay":1,"departAt":633},
      {"id":"JY06","type":"普通","destination":"有楽町","cars":11,"delay":0,"departAt":657},
      {"id":"JY07","type":"普通","destination":"品川","cars":11,"delay":0,"departAt":722},
      {"id":"JY08","type":"快速","destination":"武蔵小金井","cars":10,"delay":0,"departAt":738},
      {"id":"JY09","type":"普通","destination":"多摩動物公園","cars":10,"delay":0,"departAt":712},
      {"id":"JY10","type":"快速","destination":"吉祥寺","cars":11,"delay":15,"departAt":739}
    ]
  };

    
});
