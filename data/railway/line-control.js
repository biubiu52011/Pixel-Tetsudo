/*
 * Line Control - Unified Line Data
 * 线路数据控制
 */

(function() {
  "use strict";

  window.UNIFIED_LINES = {
    "Yamanote": {
      name: "Yamanote", nameEn: "Yamanote Line", code: "JY", color: "#80C342",
      operator: "JR-East", region: "Tokyo Area", type: "loop",
      image: "../images/鉄道/JR東日本/山手線.png", durationTotalMin: 60, throughServices: [],
      transferStations: [],
      stations: ["Shibuya","Harajuku","Yoyogi","Shinjuku","Shinjuku-nishiguchi","Mejiro","Ikeda","Taishakuten","Takadanobaba","Nagasaki","Otsuka","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Akihabara","Kanda","Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Tamachi","Takanawa-Gateway","Shinagawa","Osaki","Gotanda","Ebisu"],
      durations: Array(30).fill(2),
      branchOf: null
    },
    "KeihinTohoku": {
      name: "KeihinTohoku", nameEn: "Keihin-Tohoku Line", code: "JK", color: "#00B2E5",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/京浜東北線.png", durationTotalMin: 141, throughServices: [],
      transferStations: [],
      stations: ["Omiya","Saitama-Shintoshin","Yono","Kita-Urawa","Urawa","Minami-Urawa","Warabi","Nishi-Kawaguchi","Kawaguchi","Akabane","Higashi-Jujo","Oji","Kami-Nakazato","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Akihabara","Kanda","Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Tamachi","Takanawa-Gateway","Shinagawa","Oi","Omori","Kamata","Kawasaki","Tsurumi","Shin-Koyasu","Higashi-Kanagawa","Yokohama","Sakuragicho","Kannai","Ishikawacho","Yamate","Negishi","Isogo","Shin-Sugita","Yokoami","Konan-dai","Hongo-dai","Ofuna"],
      durations: Array(47).fill(3),
      branchOf: null
    },
    "Yokosuka": {
      name: "Yokosuka", nameEn: "Yokosuka Line", code: "JO", color: "#007AC1",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/総武線快速横須賀線.png", durationTotalMin: 24, throughServices: [],
      transferStations: [],
      stations: ["Yokosuka-Chuo","Higashi-Yokosuka","Yokosuka","Ofuna","Kissaki","Kurihama","Kasminato","Shiogama"],
      durations: Array(8).fill(3),
      branchOf: null
    },
    "ChuoRapid": {
      name: "ChuoRapid", nameEn: "Chuo Rapid Line", code: "JC", color: "#F18C00",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/中央快速線 青梅線 五日市線.png", durationTotalMin: 50, throughServices: [],
      transferStations: [],
      stations: ["Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Shinagawa","Meguro","Ebisu","Shibuya","Shinjuku","Shinjuku-nishiguchi","Mejiro","Ikeda","Takadanobaba","Nagasaki","Otsuka","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Akihabara","Kanda","Ochanomizu"],
      durations: Array(25).fill(2),
      branchOf: null
    },
    "Saikyo": {
      name: "Saikyo", nameEn: "Saikyo Line", code: "JA", color: "#00B48D",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/埼京線.png", durationTotalMin: 42, throughServices: [],
      transferStations: [],
      stations: ["Omiya","Urawa","Niiza","Kita-Saitama","Kuki","Kumagaya","Hon-Jo","Sayama","Hachioji","Tachikawa","Musashynuigami","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane","Ikebukuro"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "Joban": {
      name: "Joban", nameEn: "Joban Rapid Line", code: "JJ", color: "#00B261",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/常盤線快速.png", durationTotalMin: 34, throughServices: [],
      transferStations: [],
      stations: ["Tokyo","Kiyose","Fuchubashi","Nishi-Fuchubashi","Musashino","Kichijoji","Nishi-Kichijoji","Harumi","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane"],
      durations: Array(17).fill(2),
      branchOf: null
    },
    "SobuLocal": {
      name: "SobuLocal", nameEn: "Sobu Local Line", code: "JL", color: "#FFD400",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/中央・総武線各駅停車.png", durationTotalMin: 38, throughServices: [],
      transferStations: [],
      stations: ["Tokyo","Akebono","Nihonbashi","Mukojima","Ryogoku","Kuramae","Kinshi","Tsukishima","Harumi","Shinonome","Kachidoki","Toyosu","Tatsumi","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Shin-Adachi","Adachi"],
      durations: Array(19).fill(2),
      branchOf: null
    },
    "Keiyo": {
      name: "Keiyo", nameEn: "Keiyo Line", code: "JE", color: "#C9252F",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/京葉線.png", durationTotalMin: 34, throughServices: [],
      transferStations: [],
      stations: ["Tokyo","Kayabacho","Shin-Nihonbashi","Kimachi","Ariake","Tokyo Teleport","Kokusai-Tenjijo","Makuhari-Hong","Shin-Kemigawa","Minami-Kemigawa","Takanawa","Kasai-Rinkai","Nishi-Kasai","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(17).fill(2),
      branchOf: null
    },
    "Musashino": {
      name: "Musashino", nameEn: "Musashino Line", code: "JM", color: "#F15A22",
      operator: "JR-East", region: "Tokyo Area", type: "loop",
      image: "../images/鉄道/JR東日本/武蔵野線.png", durationTotalMin: 48, throughServices: [],
      transferStations: [],
      stations: ["Nishi-Takashimadaira","Takahashimadaira","Higashi-Maruko","Nishi-Fuchubashi","Fuchubashi","Kokubunji","Nakano","Shin-Okubo","Ichigaya","Yoyogi-Uehara","Shibuya","Shinsen","Higashi-Kanagawa","Tsurumi","Nishi-Kawasaki","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Koyasu","Shin-Koyasu","Minami-Wakasu","Wakasu","Tokyo Teleport","Ariake"],
      durations: Array(24).fill(2),
      branchOf: null
    },
    "ShonanShinjuku": {
      name: "ShonanShinjuku", nameEn: "Shonan-Shinjuku Line", code: "JS", color: "#E31F26",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/湘南新宿ライン.png", durationTotalMin: 63, throughServices: [],
      transferStations: [],
      stations: ["Omiya","Urawa","Niiza","Kita-Saitama","Kuki","Kumagaya","Hon-Jo","Sayama","Hachioji","Tachikawa","Musashynuigami","Kokubunji","Nakano","Shinjuku","Shibuya","Ebisu","Shirokane-Takanawa","Azabu-Juban","Roppongi","Akabane","Ikebukuro"],
      durations: Array(21).fill(3),
      branchOf: null
    },
    "Takasaki": {
      name: "Takasaki", nameEn: "Takasaki Line", code: "JU", color: "#F18E41",
      operator: "JR-East", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/JR東日本/高崎線.png", durationTotalMin: 24, throughServices: [],
      transferStations: [],
      stations: ["Takasaki","Kuroiso","Ota","Maebashi","Kumagaya","Hasuda","Urawa","Omiya"],
      durations: Array(8).fill(3),
      branchOf: null
    },
    "Tsurumi": {
      name: "Tsurumi", nameEn: "Tsurumi Line", code: "JV", color: "#FBD05D",
      operator: "JR-East", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/JR東日本/鶴見線.png", durationTotalMin: 18, throughServices: [],
      transferStations: [],
      stations: ["Tsurumi","Nishi-Kawasaki","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Koyasu","Shin-Koyasu","Minami-Wakasu","Wakasu"],
      durations: Array(9).fill(2),
      branchOf: null
    },
    "Nambu": {
      name: "Nambu", nameEn: "Nambu Line", code: "JN", color: "#FBD05D",
      operator: "JR-East", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/JR東日本/南武線.png", durationTotalMin: 44, throughServices: [],
      transferStations: [],
      stations: ["Kawasaki","Nakahara","Ekimae","Sakuragicho","Musashi-Shinjo","Tobata","Nambu","Higashi-Totsuka","Totsuka","Kokudo","Tachikawa","Musashi-Mitsuwadai","Musashi-Saiwai","Musashi-Nakagawa","Musashi-Fujisawa","Naruse","Nagatoro","Kugahara","Hachiman-Honmachi","Midoricho","Mizonokuchi","Musashi-Kosugi","Kawasaki"],
      durations: Array(22).fill(2),
      branchOf: null
    },
    "Tokaido": {
      name: "Tokaido", nameEn: "Tokaido Line", code: "JD", color: "#F0862B",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/東海道線.png", durationTotalMin: 48, throughServices: [],
      transferStations: [],
      stations: ["Tokyo","Shinagawa","Yokohama","Odawara","Atami","Kikuna","Shimoda","Ito","Yumoto","Matsuda","Sagami-Ono","Chigasaki","Fujisawa","Yukinoshita","Kamakura","Ofuna"],
      durations: Array(16).fill(3),
      branchOf: null
    },
    "JobanLocal": {
      name: "JobanLocal", nameEn: "Joban Local Line", code: "JB", color: "#A8A39D",
      operator: "JR-East", region: "Chiba Area", type: "straight",
      image: "../images/鉄道/JR東日本/常盤緩行線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [],
      stations: ["Ueno","Nezu","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Shin-Okachimachi","Akihabara","Kanda","Tokyo"],
      durations: Array(11).fill(2),
      branchOf: null
    },
    "Ginza": {
      name: "Ginza", nameEn: "Ginza Line", code: "G", color: "#FF9500",
      operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/銀座線.png", durationTotalMin: 18, throughServices: [],
      transferStations: [],
      stations: ["Shinbashi","Ginza","Ginza-yonchome","Hibiya","Waseda","Ueno","Ueno-hirokoji","Tawaramachi","Asakusa"],
      durations: Array(9).fill(2),
      branchOf: null
    },
    "Marunouchi": {
      name: "Marunouchi", nameEn: "Marunouchi Line", code: "M", color: "#F62E36",
      operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/丸ノ内線.png", durationTotalMin: 36, throughServices: [],
      transferStations: [],
      stations: ["Shin-juku","Shin-juku-sanchome","Shibuya","Mejiro","Ikebukuro","Akasaka-mitsuke","Otemachi","Mitsukoshimae","Go-komon","Yurakucho","Shinbashi","Tokyo","Shin-Ochanomizu","Korakuen","Yushima","Nezu","Ueno","Ueno-hirokoji"],
      durations: Array(18).fill(2),
      branchOf: null
    },
    "Hibiya": {
      name: "Hibiya", nameEn: "Hibiya Line", code: "H", color: "#C3C3C3",
      operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/日比谷線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [],
      stations: ["Naka-mejima","Kitasendai","Hibiya","Ginza","Ueno","Akihabara","Hatchobori","Kayabacho","Tsukiji","Ginza-hitchome","Nijubashimae","Hibiya","Kasumigaseki","Hiroo","Meguro"],
      durations: Array(15).fill(2),
      branchOf: null
    },
    "Yurakucho": {
      name: "Yurakucho", nameEn: "Yurakucho Line", code: "Y", color: "#D69141",
      operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/有楽町線.png", durationTotalMin: 62, throughServices: [],
      transferStations: [],
      stations: ["Wakoshi","Nishi-takashimadaira","Kishibojin","Iruma","Shin-rinkan","Higashi-murayama","Kokubunji","Nishi-kokubunji","Akigawa","Takaosanguchi","Hashimoto","Hachioji","Musashi-sakai","Tachikawa","Nishi-fuchu","Fuchu","Hino","Nishi-koen","Seijodai","Akatsuka","Musashinurare","Kokumin-kyogijo","Mejiro-dai","Ikebukuro","Tokyo-domae","Yurakucho","Shinbashi","Daimon","Onarimon","Shimbashi","Yurakucho"],
      durations: Array(31).fill(2),
      branchOf: null
    },
    "Tozai": {
      name: "Tozai", nameEn: "Tozai Line", code: "T", color: "#009BC4",
      operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/東西線.png", durationTotalMin: 42, throughServices: [],
      transferStations: [],
      stations: ["Nishi-fushimi","Fuchu","Nishi-takashimadaira","Kodaira","Hikaridai","Nishi-takaido","Karasuyama","Nakano-fujimicho","Nakano","Shinanomachi","Shibuya","Shirokane-takanawa","Toranomon","Shimbashi","Nihonbashi","Kayabacho","Choju","Akihabara","Kiba","Koto-shibari","Toyo-su","Shin-kiba"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "Asakusa": {
      name: "Asakusa", nameEn: "Asakusa Line", code: "A", color: "#EC6E65",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都営浅草線.png", durationTotalMin: 36, throughServices: [],
      transferStations: [],
      stations: ["Oshiage","Kerama","Asakusa","Nihonbashi","Kayabacho","Ningyocho","Higashi-nihonbashi","Mitarashi","Tsukishima","Den-en-chofu","Shinagawa","Kototoi","Oimachi","Higashi-gotanda","Meguro","Kamata","Takashimadaira","Shin-kawasaki","Kawasaki"],
      durations: Array(18).fill(2),
      branchOf: null
    },
    "Do-Arakawa": {
      name: "Do-Arakawa", nameEn: "Toei Arakawa Line", code: "DA", color: "#EE86A7",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都電荒川線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [],
      stations: ["Ikebukuro","Shin-otemachi","Hacchobori","Yushima","Ueno-hirokoji","Yanaka","Nezu","Minowa","Minowa-shita","Koji-mae","Otsuka-ekimae"],
      durations: Array(11).fill(2),
      branchOf: null
    },
    "Mita": {
      name: "Mita", nameEn: "Mita Line", code: "I", color: "#006CB6",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都営三田線.png", durationTotalMin: 32, throughServices: [],
      transferStations: [],
      stations: ["Meguro","Meguro-Dai","Shirokanedai","Nakameguro","Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Kojimachi","Ichigaya","Nagatacho","Akabane-Iwabuchi"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Shinjuku": {
      name: "Shinjuku", nameEn: "Shinjuku Line", code: "S", color: "#B0BF1E",
      operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/都営地下鉄/都営新宿線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [],
      stations: ["Shinjuku","Shinjuku-sanchome","Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Kojimachi","Ichigaya","Nagatacho","Akabane-Iwabuchi","Kita-Senju"],
      durations: Array(15).fill(2),
      branchOf: null
    },
    "Oedo": {
      name: "Oedo", nameEn: "Oedo Line", code: "E", color: "#CE045B",
      operator: "Toei", region: "Tokyo Area", type: "loop",
      image: "../images/鉄道/都営地下鉄/都営大江戸線.png", durationTotalMin: 70, throughServices: [],
      transferStations: [],
      stations: ["Tochomae","Suidobashi","Yushima","Ueno-Okachimachi","Ueno-hirokoji","Higashi-Shinbashi","Tsukishima","Kachidoki","Toyosu","Shin-Toyosu","Odaiba-Kaihinkoen","Aomi","Oshida","Kokusai-Tenjijo","Tokyo-Teleport","Daimon","Akabanebashi","Roppongi","Ebisu","Shibuya","Mejiro","Ikebukuro","Takashimadaira","Hikaridai","Kodaira","Nishi-takashimadaira","Seijodai","Akatsuka","Musashinurare","Kokumin-kyogijo","Nishi-kokubunji","Kokubunji","Nakano-fujimicho","Nakano","Shinanomachi","Shibuya"],
      durations: Array(35).fill(2),
      branchOf: null
    },
    "Chiyoda": { operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
       color: "#00BB85",image: "../images/鉄道/東京メトロ/千代田線.png", durationTotalMin: 40, throughServices: [],
      transferStations: [{"station": "Otemachi", "connects": ["Tozai"]}, {"station": "Yurakucho", "connects": ["Yurakucho"]}, {"station": "Akabane", "connects": ["Joban"]}, {"station": "Kita-Senju", "connects": ["Joban"]}],
      stations: ["Yoyogi-Uehara","Shinjuku","Hitotsubashi","Kudanshita","Jimbocho","Otemachi","Yurakucho","Hibiya","Kojimachi","Ichigaya","Nagatacho","Akasaka-mitsuke","Toranomon","Shimbashi","Kasumigaseki","Yokojimma","Takebashi","Kitasenju","Yanauchi","Harajuku"],
      durations: Array(20).fill(2),
      branchOf: null
    },
    "Hanzomon": { operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
       color: "#8F76D6",image: "../images/鉄道/東京メトロ/半蔵門線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [{"station": "Shibuya", "connects": ["Ginza"]}, {"station": "Otemachi", "connects": ["Marunouchi"]}, {"station": "Shimoesaka", "connects": ["Asakusa"]}, {"station": "Oshiage", "connects": ["Asakusa"]}],
      stations: ["Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Ichigaya","Nagatacho","Akasaka-mitsuke","Oshiage"],
      durations: Array(12).fill(2),
      branchOf: null
    },
    "Namboku": { operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
       color: "#00AC9B",image: "../images/鉄道/東京メトロ/南北線.png", durationTotalMin: 35, throughServices: [{"line": "TokyoSakura", "code": "T", "note": "都営浅草線直通"}],
      transferStations: [{"station": "Meguro", "connects": ["Mita"]}, {"station": "Akabane-Iwabuchi", "connects": ["Marunouchi"]}, {"station": "Shin-Otsuka", "connects": ["Fukutoshin"]}],
      stations: ["Meguro","Meguro-Dai","Shirokanedai","Nakameguro","Shibuya","Omotesando","Aoyama-itchome","Kamiyacho","Hanzomon","Otemachi","Kudanshita","Jimbocho","Kojimachi","Ichigaya","Nagatacho","Akabane-Iwabuchi"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Fukutoshin": { operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
       color: "#9C5E31",image: "../images/鉄道/東京メトロ/副都心線.png", durationTotalMin: 40, throughServices: [{"line": "TokyuToyoko", "code": "TY", "note": "東急東横線直通"}],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Ikebukuro", "connects": ["Yamanote"]}, {"station": "Tokyo", "connects": ["Yamanote"]}, {"station": "Otemachi", "connects": ["Tozai"]}],
      stations: ["Wakoshi","Higashi-Ikebukuro","Ikebukuro","Yushima","Ueno","Okachimachi","Ginza","Yurakucho","Shimbashi","Hamamatsucho","Tokyo","Nihonbashi","Makuhari-hongo","Kayabacho","Tsukishima","Tokyo Dome-mae","Kacho-mae","Harumi-futago","Shin-Kiba"],
      durations: Array(20).fill(2),
      branchOf: null
    },

    "Yurikamome": {
      name: "Yurikamome", nameEn: "Yurikamome", code: "U", color: "#0065A6",
      operator: "Yurikamome", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/ゆりかもせ/ゆりかもせ.png", durationTotalMin: 19, throughServices: [],
      transferStations: [],
      stations: ["Shimbashi","Tsukishima","Kachidoki","Toyosu","Tokyo Teleport","Ariake","Odaiba-Kaihinkoen","Miraikai","Denno","Midosuji","Aomi","Tokyo Big Sight","Daiba","Hinode","Kokusai-Tenjijo","Makuhari Seaside","Shin-Kemigawa","Minami-Kemigawa","Shin-Kiba"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "SeibuShinjuku": {
      name: "SeibuShinjuku", nameEn: "Seibu Shinjuku Line", code: "SN", color: "#01A6BF",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/新宿線 ハイジマ線.png", durationTotalMin: 40, throughServices: [],
      transferStations: [],
      stations: ["Shinjuku","Nishi-Shinjuku","Seibu-Shinjuku","Waseda","Hakusan","Ikebukuro","Minami-Nagasaki","Kita-Otsuka","Iruma-shi","Kokubunji","Higashi-Koganei","Akitsu","Nishifujisawa","Oyama","Higashi-Murayama","Tsurukawa","Higashi-Hachioji","Hachioji","Takahatafujimidai","Okutama-guchi"],
      durations: Array(20).fill(2),
      branchOf: null
    },
    "Odawara": {
      name: "Odawara", nameEn: "Odawara Line", code: "OH", color: "#0078C1",
      operator: "Odakyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/小田急電鉄/小田原線.png", durationTotalMin: 28, throughServices: [],
      transferStations: [],
      stations: ["Shinjuku","Setagaya","Sasazuka","Yoyogi-Uehara","Nakamurabashi","Shibuya","Sangenjaya","Machiya","Takaradai","Tama-Center","Hachiman","Tsurumi","Yamato","Odawara"],
      durations: Array(14).fill(2),
      branchOf: null
    },
    "Keio": {
      name: "Keio", nameEn: "Keio Line", code: "KO", color: "#0078C1",
      operator: "Keio", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/京王電鉄/京王線 京王新線 相模原線 競馬場線 動物園線 高尾線.png", durationTotalMin: 18, throughServices: [],
      transferStations: [],
      stations: ["Mitaka","Nishi-Kichijoji","Kichijoji","Hachioji","Takaosanguchi","Hashimoto","Uenohara","Inokashira","Keio-Hachioji"],
      durations: Array(9).fill(2),
      branchOf: null
    },
    "TobuIsesaki": {
      name: "TobuIsesaki", nameEn: "Tobu Isesaki Line", code: "TI", color: "#FF0000",
      operator: "Tobu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png", durationTotalMin: 46, throughServices: [],
      transferStations: [],
      stations: ["Asakusa","Oshiage","Shin-Machiya","Nishi-Magome","Minami-Magome","Koji","Minowa","Tawaramachi","Shimo-Kitazzu","Kita-Aoi","Aoto","Adachi-Kangura","Minami-Senju","Tatekawa","Shin-Adachi","Adachi","Shin-Misaki","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Shin-Adachi","Adachi"],
      durations: Array(23).fill(2),
      branchOf: null
    },
    "TobuSkytree": {
      name: "TobuSkytree", nameEn: "Tobu Skytree Line", code: "TS", color: "#0F6CC3",
      operator: "Tobu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/東武鉄道/東武スカイツリーライン 亀戸線 大志線.png", durationTotalMin: 42, throughServices: [],
      transferStations: [],
      stations: ["Asakusa","Oshiage","Shin-Machiya","Nishi-Magome","Minami-Magome","Koji","Minowa","Tawaramachi","Shimo-Kitazzu","Kita-Aoi","Aoto","Adachi-Kangura","Minami-Senju","Tatekawa","Shin-Adachi","Adachi","Shin-Misaki","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "TobuNikko": {
      name: "TobuNikko", nameEn: "Tobu Nikko Line", code: "TN", color: "#FFA600",
      operator: "Tobu", region: "Tochigi Area", type: "straight",
      image: "../images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png", durationTotalMin: 42, throughServices: [],
      transferStations: [],
      stations: ["Asakusa","Oshiage","Shin-Machiya","Nishi-Magome","Minami-Magome","Koji","Minowa","Tawaramachi","Shimo-Kitazzu","Kita-Aoi","Aoto","Adachi-Kangura","Minami-Senju","Tatekawa","Shin-Adachi","Adachi","Shin-Misaki","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(21).fill(2),
      branchOf: null
    },
    "TokyuToyoko": {
      name: "TokyuToyoko", nameEn: "Tokyu Toyoko Line", code: "TY", color: "#00A0C7",
      operator: "Tokyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/東急電鉄/東横線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [],
      stations: ["Shibuya","Nakameguro","Fudosan-mae","Yoyogi-Uehara","Daikanyama","Chuo-rinkan","Setagaya","Seijo-shijo","Komazawa","Tamagawa","Tamagawa-Enzei-ji","Daizen-ji","Mukaiminato","Hama-Kawada","Yokohama"],
      durations: Array(15).fill(2),
      branchOf: null
    },
    "YokohamaBlue": {
      name: "YokohamaBlue", nameEn: "Blue Line", code: "B", color: "#00A0C7",
      operator: "YokohamaMunicipal", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/横浜市交通局/ブルーライン.png", durationTotalMin: 26, throughServices: [],
      transferStations: [],
      stations: ["Shonandai","Zushi","Higashi-Zushi","Kita-Zushi","Hiratsuka","Yokohama","Miyagi","Yamato","Chuo-Ku","Sakai","Higashi-Murayama","Isehara","Odawara"],
      durations: Array(13).fill(2),
      branchOf: null
    },
    "Keisei": {
      name: "Keisei", nameEn: "Keisei Main Line", code: "KS", color: "#D81E06",
      operator: "Keisei", region: "Chiba Area", type: "straight",
      image: "../images/鉄道/京成電鉄/東条本線 おごせ線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [],
      stations: ["Nippori","Tadachi","Keisei-Tsukawa","Koiwa","Minami-Senju","Adachi","Shin-Adachi","Yoshiwara","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(11).fill(2),
      branchOf: null
    },
    "SeibuIkebukuro": {
      name: "SeibuIkebukuro", nameEn: "Seibu Ikebukuro Line", code: "SI", color: "#EF7A00",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png", durationTotalMin: 36, throughServices: [],
      transferStations: [],
      stations: ["Ikebukuro","Seibu-Shinjuku","Waseda","Hakusan","Minami-Nagasaki","Kita-Otsuka","Iruma-shi","Kokubunji","Higashi-Koganei","Akitsu","Nishifujisawa","Oyama","Higashi-Murayama","Tsurukawa","Higashi-Hachioji","Hachioji","Takahatafujimidai","Okutama-guchi"],
      durations: Array(18).fill(2),
      branchOf: null
    },
    "SeibuChichibu": {
      name: "SeibuChichibu", nameEn: "Seibu Chichibu Line", code: "SC", color: "#EF7A00",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png", durationTotalMin: 14, throughServices: [],
      transferStations: [],
      stations: ["Higashi-Hachioji","Hachioji","Takahatafujimidai","Okutama-guchi","Kotaki","Nakagami","Chichibu"],
      durations: Array(7).fill(2),
      branchOf: null
    },
    "SeibuTamako": {
      name: "SeibuTamako", nameEn: "Tamako Line", code: "ST", color: "#EF7A00",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/玉子線.png", durationTotalMin: 6, throughServices: [],
      transferStations: [],
      stations: ["Seibu-Yuuyamada","Yuki","Tamako"],
      durations: Array(3).fill(2),
      branchOf: null
    },
    "SeibuTamagawa": {
      name: "SeibuTamagawa", nameEn: "Tamagawa Line", code: "SM", color: "#01A6BF",
      operator: "Seibu", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/西武鉄道/玉川線.png", durationTotalMin: 8, throughServices: [],
      transferStations: [],
      stations: ["Shibuya","Setagaya","Sasazuka","Yoyogi-Uehara"],
      durations: Array(4).fill(2),
      branchOf: null
    },
    "OdakyuEnoshima": {
      name: "OdakyuEnoshima", nameEn: "Odakyu Enoshima Line", code: "OE", color: "#0078C1",
      operator: "Odakyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/小田急電鉄/江ノ島線.png", durationTotalMin: 28, throughServices: [],
      transferStations: [],
      stations: ["Shinjuku","Setagaya","Sasazuka","Yoyogi-Uehara","Nakamurabashi","Shibuya","Sangenjaya","Machiya","Takaradai","Tama-Center","Hachiman","Tsurumi","Yamato","Odawara"],
      durations: Array(14).fill(2),
      branchOf: null
    },
    "TobuNoda": {
      name: "TobuNoda", nameEn: "Tobu Noda Line", code: "NT", color: "#0097A6",
      operator: "Tobu", region: "Chiba Area", type: "straight",
      image: "../images/鉄道/東武鉄道/野田線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [],
      stations: ["Nippori","Tadachi","Keisei-Tsukawa","Koiwa","Minami-Senju","Adachi","Shin-Adachi","Yoshiwara","Nishi-Koiwa","Minami-Koiwa","Yoshiwara"],
      durations: Array(11).fill(2),
      branchOf: null
    },
    "TamaMonorail": {
      name: "TamaMonorail", nameEn: "Tama Monorail Line", code: "TM", color: "#E60012",
      operator: "TamaMonorail", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/多摩都市モノレール/多摩都市モノレール線.png", durationTotalMin: 48, throughServices: [],
      transferStations: [],
      stations: ["Nishi-Takashimadaira","Takahashimadaira","Higashi-Maruko","Nishi-Fuchubashi","Fuchubashi","Kokubunji","Nakano","Shin-Okubo","Ichigaya","Yoyogi-Uehara","Shibuya","Shinsen","Higashi-Kanagawa","Tsurumi","Nishi-Kawasaki","Kawasaki","Higashi-Kawasaki","Musashi-Kosugi","Koyasu","Shin-Koyasu","Minami-Wakasu","Wakasu","Tokyo Teleport","Ariake"],
      durations: Array(24).fill(2),
      branchOf: null
    },
    "Rinko": {
      name: "Rinko", nameEn: "Rinko Line", code: "R", color: "#00A0C7",
      operator: "TWR", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京臨海高速鉄道/臨海線.png", durationTotalMin: 19, throughServices: [],
      transferStations: [],
      stations: ["Osaki","Tamachi","Kachidoki","Toyosu","TokyoTeleport","Ariake","OdaibaKaihinkoen","Miraikai","Denno","Midosuji","Aomi","TokyoBigSight","Daiba","Hinode","KokusaiTenjijo","MakuhariSeaside","ShinKemigawa","MinamiKemigawa","ShinKiba"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "HitachiNakaKaimin": {
      name: "HitachiNakaKaimin", nameEn: "Tsukuba Express", code: "TX", color: "#273E6C",
      operator: "MIR", region: "Ibaraki Area", type: "straight",
      image: "../images/鉄道/首都圏新都市鉄道/つくばエクスプレス.jpg", durationTotalMin: 35, throughServices: [],
      transferStations: [],
      stations: ["Akihabara","Kanda","Tokyo","Yurakucho","Shimbashi","Hamamatsucho","Tamachi","Takanawa-Gateway","Shinagawa","Osaki","Gotanda","Ebisu","Meguro","Hiroo","Roppongi","Akabane","Ikebukuro","Nishi-Ikebukuro","Otsuka","Komagome","Tabata","Nishi-Nippori","Nippori","Uguisudani","Ueno","Okachimachi","Kitasenju","Shiroi","Kamagaya","Toride","Abiko","Kashiwa","Narashino","Funabashi","Makuhari","Tsukuba"],
      durations: Array(35).fill(1),
      branchOf: null
    },
    "Ome": {
      name: "Ome", nameEn: "Ome Line", code: "JC", color: "#DD6935",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/中央快速線 青梅線 五日市線.png", durationTotalMin: 45, throughServices: [],
      transferStations: [],
      stations: ["Tachikawa","Nishi-Tachikawa","Mitake","Okutama-gochi","Ome","Nakagami","Haijima","Higashi-Ome","Sawai","Nishi-Ome","Futamatao","Ishigamimae","Hinatawada","Miyanohira","Musashi-Sakai","Musashi-Yoshida","Tachikawa-Minami","Tachikawa-Kita"],
      durations: Array(18).fill(2),
      branchOf: null
    },
    "Itsukaichi": {
      name: "Itsukaichi", nameEn: "Itsukaichi Line", code: "JC", color: "#DD6935",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/中央快速線 青梅線 五日市線.png", durationTotalMin: 20, throughServices: [],
      transferStations: [],
      stations: ["Haijima","Higashi-Akiru","Nishi-Akiru","Musashi-Hikita","Musashi-Masuko","Musashi-Itsukaichi"],
      durations: Array(6).fill(2),
      branchOf: null
    },
    "SobuRapid": {
      name: "SobuRapid", nameEn: "Sobu Rapid Line", code: "JR", color: "#007AC1",
      operator: "JR-East", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/JR東日本/総武線快速横須賀線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [],
      stations: ["Tokyo","Akihabara","Kanda","Ochanomizu","Iidabashi","Fujimi","Iwatsunomachi","Korakuen","Mikawahashi","Nihonbashi","Ningyocho","Kayabacho","Tsukishima","Toyosu","Shin-Kiba","Tatsumi","Koiwa","Nishi-Koiwa","Minami-Koiwa","Yoshiwara","Adachi","Koshigaya","Oshiage","Tokiwabashi","Komagome","Tabata","Shin-Urawa","Urawa","Kita-Urawa","Minami-Urawa","Saitama","Kumagaya","Honjo","Kuki","Asaka","Shiraoka","Wada","Tateshina","Iruma","Sakado","Hanno","Tokigawa","Sayama","Hachioji","Musashisakai","Nakano","Nakano-Sakaue","Shinjuku","Shibuya","Ebisu","Shinagawa"],
      durations: Array(51).fill(1),
      branchOf: null
    },
    "TokyuDenEn": {
      name: "TokyuDenEn", nameEn: "Den-en-toshi Line", code: "TD", color: "#40B3E5",
      operator: "Tokyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/東急電鉄/田園都市線.png", durationTotalMin: 28, throughServices: [],
      transferStations: [],
      stations: ["Shibuya","Nakameguro","Daikanyama","Sangenjaya","Futamata-gawa","Nakatsu","Hachiman-gaika","Kichijoji","Musashi-Kosugi","Tama-plaza","Tsutsujigaoka","Midoridai","Seijo","Tsukamoto","Minami-Wakasu","Wakasu"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Keikyu": {
      name: "Keikyu", nameEn: "Keikyu Main Line", code: "KK", color: "#005AAA",
      operator: "Keikyu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/京急電鉄/京急本線 久里浜線 逗子線 大師線 空港線.png", durationTotalMin: 22, throughServices: [],
      transferStations: [],
      stations: ["Shinagawa","Osaki","Gotanda","Ebisu","Shibuya","Mejiro","Ikebukuro","Takashimadaira","Hikaridai","Kodaira","Nishi-takahashimadaira","Seijodai","Akatsuka","Musashinurare","Kokumin-kyogijo","Nishi-kokubunji","Kokubunji","Nakano-fujimicho","Nakano","Shinanomachi","Shibuya"],
      durations: Array(21).fill(1),
      branchOf: null
    },
    "MinatoMirai": {
      name: "MinatoMirai", nameEn: "Minato Mirai Line", code: "MM", color: "#00B6C7",
      operator: "MinatoMirai", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/みなとみらい線/みなとみらい線.png", durationTotalMin: 9, throughServices: [],
      transferStations: [],
      stations: ["Yokohama","Nihon-odori","Motomachi-Chukagai","Minato-Mirai-21","Bay-Cross"],
      durations: Array(5).fill(2),
      branchOf: null
    },
    "MarunouchiBranch": {
      name: "MarunouchiBranch", nameEn: "Marunouchi Branch Line", code: "M", color: "#F62E36",
      operator: "TokyoMetro", region: "Tokyo Area", type: "straight",
      image: "../images/鉄道/東京メトロ/丸ノ内線.png", durationTotalMin: 8, throughServices: [],
      transferStations: [],
      stations: ["Shinjuku","Shinjuku-nishiguchi","Shibuya","Omotesando","Aoyama-itchome","Akasaka-mitsuke","Kokkai-gijido","Hibiya","Otemachi","Yurakucho","Shinbashi","Ginza","Mitsukoshimae","Nihonbashi","Kayabacho","Ningyocho","Tsukishima"],
      durations: Array(17).fill(1),
      branchOf: null
    },
    "Orange": {
      name: "Orange", nameEn: "Orange Line", code: "O", color: "#F39200",
      operator: "YokohamaMunicipal", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/横浜市交通局/橘線.png", durationTotalMin: 14, throughServices: [],
      transferStations: [],
      stations: ["Shin-Yokohama","Nishi-Nakajima","Tsunashima","Higashi-Yamatokoji","Sakae","Kita-Yamato","Aoba-dori","Yokohama"],
      durations: Array(8).fill(2),
      branchOf: null
    },
    "SotetsuMain": {
      name: "SotetsuMain", nameEn: "Sotetsu Main Line", code: "SO", color: "#0069A3",
      operator: "Sotetsu", region: "Kanagawa Area", type: "straight",
      image: "../images/鉄道/相鉄/相模本線 いずみ野線 相鉄新横浜線 .png", durationTotalMin: 32, throughServices: [],
      transferStations: [],
      stations: ["Shin-Yokohama","Horinouchi","Nishi-Totsuka","Sakuragi-cho","Yokohama","Higashi-Totsuka","Minami-Urawa","Oimachi","Aoba-dori","Ishikawadai","Umeda","Machida","Kanagawa-NewTown","Yokohama"],
      durations: Array(13).fill(2),
      branchOf: null
    },
    "SeibuYamaguchi": {
      name: "SeibuYamaguchi", nameEn: "Seibu Yamaguchi Line", code: "SY", color: "#E83E2F",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png", durationTotalMin: 28, throughServices: [],
      transferStations: [],
      stations: ["Seibu-Shinjuku","Nishi-Shinjuku","Waseda","Hakusan","Minami-Nagasaki","Kita-Otsuka","Iruma-shi","Kokubunji","Higashi-Koganei","Akitsu","Nishifujisawa","Oyama","Higashi-Murayama","Tsurukawa","Hachioji"],
      durations: Array(15).fill(2),
      branchOf: null
    },
    "SeibuNakagawa": {
      name: "SeibuNakagawa", nameEn: "Seibu Nakagawa Line", code: "SA", color: "#1EAD4C",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/玉子線.png", durationTotalMin: 16, throughServices: [],
      transferStations: [],
      stations: ["Seibu-Chitose","Nakagawara","Seibu-Nakagawa","Musashi-Yamanaka","Seibu-Hikawa","Seibu-Chausuyama","Kodaira","Higashi-Maruko"],
      durations: Array(8).fill(2),
      branchOf: null
    },
    "SeibuEn": {
      name: "SeibuEn", nameEn: "Seibu Enoshima Line", code: "SE", color: "#F7AF0E",
      operator: "Seibu", region: "Saitama Area", type: "straight",
      image: "../images/鉄道/西武鉄道/西武園線.png", durationTotalMin: 20, throughServices: [],
      transferStations: [],
      stations: ["Seibu-Shinjuku","Nishi-Shinjuku","Waseda","Hakusan","Minami-Nagasaki","Kita-Otsuka","Iruma-shi","Kokubunji","Higashi-Koganei","Akitsu"],
      durations: Array(10).fill(2),
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

})();
