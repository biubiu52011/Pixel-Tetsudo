  1: /*
  1:  * 郤ｿ霍ｯ謗ｧ蛻ｶ謨ｰ謐ｮ
  1:  */
  1: 
  1: // === Line Control - Unified Line Data & Components ===
  1: // Merged: JR East + Tokyo Metro + Toei + Private Railways
  1: // Encoding: UTF-8
  1: 
  1: (function() {
  1:   "use strict";
  1: 
  1:   window.UNIFIED_LINES = {
  1:     "Yamanote": {
  1:       name: "Yamanote", nameEn: "Yamanote Line", code: "JY", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/螻ｱ謇狗ｷ・png", durationTotalMin: 60, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shibuya", "Harajuku", "Yoyogi", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Taishakuten", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu"],
  1:       durations: Array(30).fill(2),
  1:       branchOf: null
  1:     },
  1:     "KeihinTohoku": {
  1:       name: "KeihinTohoku", nameEn: "KeihinTohoku Line", code: "JK", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/莠ｬ豬懈擲蛹礼ｷ・png", durationTotalMin: 141, throughServices: [{"line": "Joban", "code": "JL", "note": "蟶ｸ逎仙ｿｫ騾溽峩騾・}],
  1:       transferStations: [],
  1:       stations: ["Omiya", "Saitama-Shintoshin", "Yono", "Kita-Urawa", "Urawa", "Minami-Urawa", "Warabi", "Nishi-Kawaguchi", "Kawaguchi", "Akabane", "Higashi-Jujo", "Oji", "Kami-Nakazato", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Oi", "Omori", "Kamata", "Kawasaki", "Tsurumi", "Shin-Koyasu", "Higashi-Kanagawa", "Yokohama", "Sakuragicho", "Kannai", "Ishikawacho", "Yamate", "Negishi", "Isogo", "Shin-Sugita", "Yokoami", "Konan-dai", "Hongo-dai", "Ofuna"],
  1:       durations: Array(47).fill(3),
  1:       branchOf: null
  1:     },
  1:     "Yokosuka": {
  1:       name: "Yokosuka", nameEn: "Yokosuka Line", code: "JO", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/譚ｱ豬ｷ驕鍋ｷ・png", durationTotalMin: 24, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Yokosuka-Chuo", "Higashi-Yokosuka", "Yokosuka", "Ofuna", "Kissaki", "Kurihama", "Kasminato", "Shiogama"],
  1:       durations: Array(8).fill(3),
  1:       branchOf: null
  1:     },
  1:     "ChuoRapid": {
  1:       name: "ChuoRapid", nameEn: "ChuoRapid Line", code: "JC", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/荳ｭ螟ｮ蠢ｫ騾溽ｷ・髱呈｢・ｷ・莠疲律蟶らｷ・png", durationTotalMin: 50, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Shinagawa", "Meguro", "Ebisu", "Shibuya", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Ochanomizu"],
  1:       durations: Array(25).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Saikyo": {
  1:       name: "Saikyo", nameEn: "Saikyo Line", code: "JA", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/蝓ｼ莠ｬ邱・png", durationTotalMin: 100, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori"],
  1:       durations: Array(53).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Joban": {
  1:       name: "Joban", nameEn: "Joban Line", code: "JJ", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/蟶ｸ逶､邱壼ｿｫ騾・png", durationTotalMin: 34, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Tokyo", "Kiyose", "Fuchubashi", "Nishi-Fuchubashi", "Musashino", "Kichijoji", "Nishi-Kichijoji", "Harumi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  1:     "SobuLocal": {
  1:       name: "SobuLocal", nameEn: "SobuLocal Line", code: "JB", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/邱乗ｭｦ邱壼ｿｫ騾滓ｨｪ鬆郁ｳ邱・png", durationTotalMin: 38, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Tokyo", "Akebono", "Nihonbashi", "Mukojima", "Ryogoku", "Kuramae", "Kinshi", "Tsukishima", "Harumi", "Shinonome", "Kachidoki", "Toyosu", "Tatsumi", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Keiyo": {
  1:       name: "Keiyo", nameEn: "Keiyo Line", code: "JE", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/莠ｬ闡臥ｷ・png", durationTotalMin: 34, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Tokyo", "Kayabacho", "Shin-Nihonbashi", "Kimachi", "Ariake", "Tokyo Teleport", "Kokusai-Tenjijo", "Makuhari-Hongﾅ・, "Shin-Kemigawa", "Minami-Kemigawa", "Takanawa", "Kasai-Rinkai", "Nishi-Kasai", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Musashino": {
  1:       name: "Musashino", nameEn: "Musashino Line", code: "JM", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/豁ｦ阡ｵ驥守ｷ・png", durationTotalMin: 48, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shin-Okubo", "Ichigaya", "Yoyogi-Uehara", "Shibuya", "Shinsen", "Higashi-Kanagawa", "Tsurumi", "Nishi-Kawasaki", "Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu", "Wakasu", "Tokyo Teleport", "Ariake"],
  1:       durations: Array(24).fill(2),
  1:       branchOf: null
  1:     },
  1:     "ShonanShinjuku": {
  1:       name: "ShonanShinjuku", nameEn: "ShonanShinjuku Line", code: "JS", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/貉伜漉譁ｰ螳ｿ繝ｩ繧､繝ｳ.png", durationTotalMin: 63, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro"],
  1:       durations: Array(21).fill(3),
  1:       branchOf: null
  1:     },
  1:     "Takasaki": {
  1:       name: "Takasaki", nameEn: "Takasaki Line", code: "JU", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/鬮伜ｴ守ｷ・png", durationTotalMin: 69, throughServices: [{"line": "Tokaido", "code": "JT", "note": "荳企㍽荳應ｺｬ郤ｿ逶ｴ騾壻ｸ懈ｵｷ驕鍋ｺｿ"}],
  1:       transferStations: [],
  1:       stations: ["Ueno", "Uguisudani", "Nippori", "Shin-Okachimachi", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Omiya"],
  1:       durations: Array(23).fill(3),
  1:       branchOf: null
  1:     },
  1:     "Tsurumi": {
  1:       name: "Tsurumi", nameEn: "Tsurumi Line", code: "JV", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/鮓ｴ隕狗ｷ・png", durationTotalMin: 18, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu"],
  1:       durations: Array(6).fill(3),
  1:       branchOf: null
  1:     },
  1:     "Nambu": {
  1:       name: "Nambu", nameEn: "Nambu Line", code: "JN", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/蜊玲ｭｦ邱・png", durationTotalMin: 33, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Musashi-Sakai", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba"],
  1:       durations: Array(11).fill(3),
  1:       branchOf: null
  1:     },
  1:     "Tokaido": {
  1:       name: "Tokaido", nameEn: "Tokaido Line", code: "JT", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/譚ｱ豬ｷ驕鍋ｷ・png", durationTotalMin: 81, throughServices: [{"line": "Takasaki", "code": "JU", "note": "荳企㍽荳應ｺｬ郤ｿ逶ｴ騾夐ｫ伜ｴ守ｺｿ"}],
  1:       transferStations: [],
  1:       stations: ["Atami", "Yugawara", "Manazuru", "Nebugawa", "Hayakawa", "Odawara", "Kannokiya", "Kozu", "Ninomiya", "Oiso", "Hiratsuka", "Chigasaki", "Tsujido", "Fujisawa", "Ofuna", "Tootsuka", "Yokohama", "Kawasaki", "Shinagawa", "Shimbashi", "Tokyo", "Ueno", "Oku", "Akabane", "Urawa", "Saitama-Shintoshin", "Omiya"],
  1:       durations: Array(27).fill(3),
  1:       branchOf: null
  1:     },
  1:     "JobanLocal": {
  1:       name: "JobanLocal", nameEn: "JobanLocal Line", code: "JL", color: "#000000",
  1:       operator: "JR East", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/JR譚ｱ譌･譛ｬ/蟶ｸ逶､邱ｩ陦檎ｷ・png", durationTotalMin: 34, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Ginza": { operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/驫蠎ｧ邱・png", durationTotalMin: 24, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shibuya", "Omotesando", "Ginza", "Nihonbashi", "Mitarashi", "Shin-Nihonbashi", "Kokkola-Mitsuwamon", "Miyuki-cho", "Wakoshi", "Shin-Uchibori", "Asakusa"],
  1:       durations: Array(11).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Hibiya": { operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/譌･豈碑ｰｷ邱・png", durationTotalMin: 38, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Kitasenju", "Minami-Senju", "Akihabara", "Ueno-Okachimachi", "Kanda", "Yurakucho", "Hibiya", "Ginza", "Shinbashi", "Daimon", "Onarimon", "Toranomon", "Nihonbashi", "Kojimashi", "Jimbacho", "Kagurazaka", "Naka-okubo"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Tozai": { operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/譚ｱ隘ｿ邱・png", durationTotalMin: 48, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Nishi-Funabashi", "Funabashi", "Nishi-Kasai", "Koiwa", "Koiwa-Katsutadai", "Nishi-Ueno", "Takadanobaba", "Iidabashi", "Yodobashi-Akiba", "Nihonbashi", "Kyﾅｫbashi", "Kaityﾅ・mae", "ﾅ荊emachi", "Hibiyakﾅ稿n", "Higashi-Ginza", "Tsukiji", "Shin-Nihonbashi", "Komon", "Nakano", "Nakano-Shinjuku"],
  1:       durations: Array(20).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Mita": { operator: "Toei", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/驛ｽ蝟ｶ蝨ｰ荳矩延/驛ｽ蝟ｶ荳臥伐邱・png", durationTotalMin: 32, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Ichigawa", "Hikawadai", "Mejiro-Dai", "Higashi-Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa"],
  1:       durations: Array(16).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Shinjuku": { operator: "Toei", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/驛ｽ蝟ｶ蝨ｰ荳矩延/驛ｽ蝟ｶ譁ｰ螳ｿ邱・png", durationTotalMin: 34, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shinjuku", "Shinjuku-sanchome", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Oedo": { operator: "Toei", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/驛ｽ蝟ｶ蝨ｰ荳矩延/驛ｽ蝟ｶ螟ｧ豎滓虻邱・png", durationTotalMin: 84, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shinjuku", "Tokyo Station", "Yurakucho", "Azabudai", "Akabanebashi", "Ushigome-Kagurazaka", "Takebashi", "Iidabashi", "Yokojimma", "Kasumigaseki", "Ginza", "Dogenzaka", "Roppongi", "Kodamouryokute", "Tsukishima", "Kyobashi", "Nihonbashi", "Miyakezaka", "Hatchobori", "Tsukiji", "Shinbashi", "Hamamatsucho", "Zojoji", "Daimon", "Onarimon", "Teiten", "Toranomon", "Shin-Osaki", "Osaki", "Shirokane-Takanawa", "Aoyama-itchome", "Azabu-Juban", "Ebisu", "Shibuya", "Shinjuku-Gyoenmae", "Meiji-jingumae", "Yoyogi", "Harajuku", "Shinjuku", "Shinjuku-sanchome"],
  1:       durations: Array(42).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Asakusa": { operator: "Toei", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/驛ｽ蝟ｶ蝨ｰ荳矩延/驛ｽ蝟ｶ豬・拷邱・png", durationTotalMin: 28, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Oshiage", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi", "Minami-Senju", "Kita-Senju", "Nippori", "Ueno", "Asakusa", "Akihabara", "Nihonbashi"],
  1:       durations: Array(14).fill(2),
  1:       branchOf: null
  1:     },
    "Do-Arakawa": { operator: "Toei", region: "Tokyo Area", type: "straight",
      image: "images/驩・％/驛ｽ蝟ｶ蝨ｰ荳矩延/驛ｽ髮ｻ闕貞ｷ晉ｷ・png", durationTotalMin: 25, throughServices: [],
      transferStations: [{"station": "Nippori", "connects": ["Yamanote"]}, {"station": "Asakusa", "connects": ["Asakusa"]}],
      stations: ["Nippori", "Sendagi", "Kishibojima", "Otsuka", "Higashi-Ikebukuro", "Ikebukuro", "Mejiro", "Takadanobaba", "Waseda", "Ushigome", "Yugyoji", "Kubota", "Miharo", "Arakawa-Onshimae", "Kiyosumi", "Oji", "Kamikitasen"],
      durations: Array(17).fill(1.5),
      branchOf: null
    },

  1:     "Yurakucho": { operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/譛画･ｽ逕ｺ邱・png", durationTotalMin: 40, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Wakoshi", "Higashi-Ikebukuro", "Ikebukuro", "Yushima", "Ueno", "Okachimachi", "Ginza", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tokyo", "Nihonbashi", "Makuhari-hongﾅ・, "Kayabacho", "Tsukishima", "Tokyo Dome-mae", "Kacho-mae", "Harumi-futagﾅ・, "Shin-Kiba", "Shin-Kiba"],
  1:       durations: Array(20).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Yurikamome": { operator: "Yurikamome", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/繧・ｊ縺九ｂ縺・繧・ｊ縺九ｂ縺・png", durationTotalMin: 30, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shimbashi", "Tsukishima", "Toyosu", "Tembo", "Odaiba-Kaihinkﾅ稿n", "Miraitﾅ・, "Denno", "Midosuji", "Aomi", "Tokyo Big Sight", "Daiba", "Hinode", "Kokusai-Tenjijo", "Makuhari-Seaside", "Shin-Kemigawa", "Minami-Kemigawa"],
  1:       durations: Array(16).fill(2),
  1:       branchOf: null
  1:     },
  1:     "SeibuShinjuku": { operator: "Seibu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/隘ｿ豁ｦ驩・％/譁ｰ螳ｿ邱・繝上う繧ｸ繝樒ｷ・png", durationTotalMin: 34, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Odawara": { operator: "Odakyu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/蟆冗伐諤･髮ｻ驩・蟆冗伐蜴溽ｷ・png", durationTotalMin: 70, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara"],
  1:       durations: Array(35).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Keio": { operator: "Keio", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/", durationTotalMin: 42, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Hashimoto", "Takaosanguchi", "Keio-Hachioji", "Tama-Center", "Inuyama", "Machiya", "Yomiuriland-Mae", "Korematsu", "Kokubunji", "Nakano", "Shinjuku"],
  1:       durations: Array(11).fill(3),
  1:       branchOf: null
  1:     },
  1:     "TobuIsesaki": { operator: "Tobu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ豁ｦ驩・％/莨雁兇蟠守ｷ・菴宣㍽邱・譯千函邱・蟆乗ｳ臥ｷ・蟆乗ｳ臥ｷ壽髪邱・png", durationTotalMin: 92, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
  1:       durations: Array(45).fill(2),
  1:       branchOf: null
  1:     },
  1:     "TobuSkytree": { operator: "Tobu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ豁ｦ驩・％/譚ｱ豁ｦ繧ｹ繧ｫ繧､繝・Μ繝ｼ繝ｩ繧､繝ｳ 莠謌ｸ邱・螟ｧ蠢礼ｷ・png", durationTotalMin: 92, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
  1:       durations: Array(45).fill(2),
  1:       branchOf: null
  1:     },
  1:     "TobuNikko": { operator: "Tobu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ豁ｦ驩・％/譌･蜈臥ｷ・螳・・螳ｮ邱・鬯ｼ諤貞ｷ晉ｷ・png", durationTotalMin: 130, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
  1:       durations: Array(45).fill(2),
  1:       branchOf: null
  1:     },
  1:     "TokyuToyoko": { operator: "Tokyu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ諤･髮ｻ驩・譚ｱ讓ｪ邱・png", durationTotalMin: 40, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"],
  1:       durations: Array(16).fill(2),
  1:       branchOf: null
  1:     },
  1:     "YokohamaBlue": { operator: "Yokohama Municipal Transportation", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/讓ｪ豬懷ｸゆｺ､騾壼ｱ/繝悶Ν繝ｼ繝ｩ繧､繝ｳ.png", durationTotalMin: 60, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shin-Yokohama", "Higashi-Yokohama", "Koboku-Toshi", "Minami-Yokohama", "Kajiwara", "Tsurumi", "Naka-Riverside", "Ishikawacho", "Yokohama", "Sakuragicho", "Kannai", "Motomachi-Chukagai", "Noge", "Higashi-Ogura", "Kikuna", "Shonandai", "Sagamiko", "Yamanashi", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima", "Shimoda", "Ito", "Atami", "Yugawara", "Manazuru", "Nebugawa"],
  1:       durations: Array(30).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Keisei": { operator: "Keisei", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/莠ｬ謌宣崕驩・譚ｱ譚｡譛ｬ邱・縺翫＃縺帷ｷ・png", durationTotalMin: 66, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Nippori", "Shin-Okachimachi", "Ueno-Hibaya", "Ueno", "Asakusa", "Oshiage", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka"],
  1:       durations: Array(33).fill(2),
  1:       branchOf: null
  1:     },
  1:     "SeibuIkebukuro": { operator: "Seibu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/隘ｿ豁ｦ驩・％/豎陲狗ｷ・隘ｿ豁ｦ遘ｩ辷ｶ邱・隘ｿ豁ｦ譛画･ｽ逕ｺ邱・雎雁ｳｶ邱・菴仙ｱｱ邱・png", durationTotalMin: 54, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Seibu-Shinjuku", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho"],
  1:       durations: Array(27).fill(2),
  1:       branchOf: null
  1:     },
  1:     "SeibuChichibu": { operator: "Seibu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/隘ｿ豁ｦ驩・％/豎陲狗ｷ・隘ｿ豁ｦ遘ｩ辷ｶ邱・隘ｿ豁ｦ譛画･ｽ逕ｺ邱・雎雁ｳｶ邱・菴仙ｱｱ邱・png", durationTotalMin: 15, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano"],
  1:       durations: Array(5).fill(3),
  1:       branchOf: null
  1:     },
  1:     "SeibuTamako": { operator: "Seibu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/隘ｿ豁ｦ驩・％/邇牙ｭ千ｷ・png", durationTotalMin: 16, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban"],
  1:       durations: Array(8).fill(2),
  1:       branchOf: null
  1:     },
  1:     "SeibuTamagawa": { operator: "Seibu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/隘ｿ豁ｦ驩・％/邇牙ｷ晉ｷ・png", durationTotalMin: 48, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Tamagawa-Onsen", "Kamakura", "Kamakura-Kotoku", "Hase", "Katase-Enoshima", "Shichirigahama", "Zushi", "Hiratsuka", "Nikaido", "Sagamiko", "Yamanashi", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima", "Shimoda", "Ito", "Atami", "Yugawara", "Manazuru", "Nebugawa", "Hayakawa"],
  1:       durations: Array(24).fill(2),
  1:       branchOf: null
  1:     },
  1:     "OdakyuEnoshima": { operator: "Odakyu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/蟆冗伐諤･髮ｻ驩・豎溘ヮ蟲ｶ邱・png", durationTotalMin: 42, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"],
  1:       durations: Array(36).fill(2),
  1:       branchOf: null
  1:     },
  1:     "TobuNoda": { operator: "Tobu", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ豁ｦ驩・％/驥守伐邱・png", durationTotalMin: 66, throughServices: [],
  1:       transferStations: [],
  1:       stations: ["Nippori", "Shin-Okachimachi", "Ueno-Hibaya", "Ueno", "Asakusa", "Oshiage", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka"],
  1:       durations: Array(33).fill(2),
  1:       branchOf: null
  1:     },
  1: 
  1:     "Marunouchi": {
  1:       name: "荳ｸ繝主・邱・, nameEn: "Marunouchi Line", code: "M", color: "#F6271C",
  1:       operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/荳ｸ繝主・邱・png", durationTotalMin: 45, throughServices: [],
  1:       transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Ikebukuro", "connects": ["Yamanote"]}, {"station": "Tokyo", "connects": ["Yamanote"]}, {"station": "Otemachi", "connects": ["Tozai"]}],
  1:       stations: ["Machida", "Nakamurabashi", "Akabane-Iwabuchi", "Minami-Urawa", "Urawa", "Nishi-Urawa", "Omiya", "Kitasaitama", "Kuki", "Kumagaya", "HonJo", "Sayama", "Hachioji", "Tachikawa", "Musashi-Nagasaki", "Kokubunji", "Nakano", "Shinjuku", "Shinjuku-sanchome", "Ginza", "Shibuya", "Mejiro", "Takadanobaba", "Ikebukuro"],
  1:       durations: Array(24).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Chiyoda": {
  1:       name: "蜊・ｻ｣逕ｰ邱・, nameEn: "Chiyoda Line", code: "C", color: "#9C68C8",
  1:       operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/蜊・ｻ｣逕ｰ邱・png", durationTotalMin: 40, throughServices: [],
  1:       transferStations: [{"station": "Otemachi", "connects": ["Tozai"]}, {"station": "Yurakucho", "connects": ["Yurakucho"]}, {"station": "Akabane", "connects": ["Joban"]}, {"station": "Kita-Senju", "connects": ["Joban"]}],
  1:       stations: ["Yoyogi-Uehara", "Shinjuku", "Hitotsubashi", "Kudanshita", "Jimbocho", "Otemachi", "Yurakucho", "Hibiya", "Kojimachi", "Ichigaya", "Nagatacho", "Akasaka-mitsuke", "Toranomon", "Shimbashi", "Kasumigaseki", "Yokojimma", "Takebashi", "Kitasenju", "Yanauchi", "Harajuku"],
  1:       durations: Array(20).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Hanzomon": {
  1:       name: "蜊願鳩髢邱・, nameEn: "Hanzomon Line", code: "Z", color: "#843C8E",
  1:       operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/蜊願鳩髢邱・png", durationTotalMin: 30, throughServices: [],
  1:       transferStations: [{"station": "Shibuya", "connects": ["Ginza"]}, {"station": "Otemachi", "connects": ["Marunouchi"]}, {"station": "Shimoesaka", "connects": ["Asakusa"]}, {"station": "Oshiage", "connects": ["Asakusa"]}],
  1:       stations: ["Shibuya", "Omotesando", "Aoyama-itchome", "Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Ichigaya", "Nagatacho", "Akasaka-mitsuke", "Oshiage"],
  1:       durations: Array(12).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Namboku": {
  1:       name: "蜊怜圏邱・, nameEn: "Namboku Line", code: "N", color: "#00A54F",
  1:       operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/蜊怜圏邱・png", durationTotalMin: 35, throughServices: [{"line": "TokyoSakura", "code": "T", "note": "驛ｽ關･豬・拷郤ｿ逶ｴ騾・}],
  1:       transferStations: [{"station": "Meguro", "connects": ["Mita"]}, {"station": "Akabane-Iwabuchi", "connects": ["Marunouchi"]}, {"station": "Shin-Otsuka", "connects": ["Fukutoshin"]}],
  1:       stations: ["Meguro", "Meguro-Dai", "Shirokanedai", "Nakameguro", "Shibuya", "Omotesando", "Aoyama-itchome", " Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Kojimachi", "Ichigaya", "Nagatacho", "Akabane-Iwabuchi"],
  1:       durations: Array(16).fill(2),
  1:       branchOf: null
  1:     },
  1:     "Fukutoshin": {
  1:       name: "蜑ｯ驛ｽ蠢・ｷ・, nameEn: "Fukutoshin Line", code: "F", color: "#965925",
  1:       operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
  1:       image: "images/驩・％/譚ｱ莠ｬ繝｡繝医Ο/蜑ｯ驛ｽ蠢・ｷ・png", durationTotalMin: 40, throughServices: [{"line": "TokyuToyoko", "code": "TY", "note": "荳懈ｨｪ邱夂峩騾・}    "TamaMonorail": {
      name: "TamaMonorail", nameEn: "Tama Monorail Line", code: "T", color: "#E60012",
      operator: "Tama Monorail", region: "Tokyo Area", type: "straight",
      image: "images/驩・％/螟壽束驛ｽ蟶ゅΔ繝弱Ξ繝ｼ繝ｫ/螟壽束驛ｽ蟶ゅΔ繝弱Ξ繝ｼ繝ｫ邱・png", durationTotalMin: 25, throughServices: [],
      transferStations: [{"station": "Nishi-Takashimadaira", "connects": ["Musashino"]}, {"station": "Tama-Center", "connects": ["Keio"]}],
      stations: ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori"],
      durations: Array(47).fill(1),
      branchOf: null
    },
    "Rinko": {
      name: "Rinko", nameEn: "Rinko Line", code: "R", color: "#00A0C7",
      operator: "TWR", region: "Tokyo Area", type: "straight",
      image: "images/驩・％/譚ｱ莠ｬ閾ｨ豬ｷ鬮倬滄延驕・閾ｨ豬ｷ邱・png", durationTotalMin: 12, throughServices: [],
      transferStations: [{"station": "Osaki", "connects": ["Yamanote"]}, {"station": "Shin-Kiba", "connects": ["Keiyo"]}],
      stations: ["Osaki", "Tamachi", "Kachidoki", "Toyosu", "TokyoTeleport", "Ariake", "OdaibaKaihinkoen", "Miraikai", "Denno", "Midosuji", "Aomi", "TokyoBigSight", "Daiba", "Hinode", "KokusaiTenjijo", "MakuhariSeaside", "ShinKemigawa", "MinamiKemigawa", "ShinKiba"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "HitachiNakaKaimin": {
      name: "HitachiNakaKaimin", nameEn: "Tsukuba Express", code: "TX", color: "#9C27B0",
      operator: "MIR", region: "Tokyo Area", type: "straight",
      image: "images/驩・％/鬥夜・蝨乗眠驛ｽ蟶る延驕・縺､縺上・繧ｨ繧ｯ繧ｹ繝励Ξ繧ｹ.jpg", durationTotalMin: 45, throughServices: [],
      transferStations: [{"station": "Akihabara", "connects": ["Yamanote"]}, {"station": "Tachikawa", "connects": ["ChuoRapid"]}],
      stations: ["Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Kitasenju", "Shiroi", "Kamagaya", "Toride", "Abiko", "Kashiwa", "Narashino", "Funabashi", "Makuhari", "Tsukuba"],
      durations: Array(50).fill(1),
      branchOf: null
    },],
  1:       transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Ginza"]}, {"station": "Ikebukuro", "connects": ["Yamanote"]}, {"station": "Waseda", "connects": []}],
  1:       stations: ["Waseda", "Shin-Okubo", "Shinjuku-sanchome", "Shinjuku", "Shibuya", "Omotesando", "Aoyama-itchome", "Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Kojimachi", "Ichigaya", "Nagatacho", "Akabane-Iwabuchi", "Kita-Senju"],
  1:       durations: Array(17).fill(2),
  1:       branchOf: null
  1:     },
  };
  1: })();
