# -*- coding: utf-8 -*-
import json

# Read trains.json
with open("data/api/trains.json", "r", encoding="utf-8") as f:
    trains_data = json.load(f)

# Image path mapping
image_map = {
    "Yamanote": "images/鉄道/JR東日本/山手線.png",
    "KeihinTohoku": "images/鉄道/JR東日本/京浜東北線.png",
    "Yokosuka": "images/鉄道/JR東日本/総武線快速横須賀線.png",
    "ChuoRapid": "images/鉄道/JR東日本/中央快速線 青梅線 五日市線.png",
    "Saikyo": "images/鉄道/JR東日本/埼京線.png",
    "Joban": "images/鉄道/JR東日本/常盤線快速.png",
    "SobuLocal": "images/鉄道/JR東日本/中央・総武線各駅停車.png",
    "Keiyo": "images/鉄道/JR東日本/京葉線.png",
    "Musashino": "images/鉄道/JR東日本/武蔵野線.png",
    "ShonanShinjuku": "images/鉄道/JR東日本/湘南新宿ライン.png",
    "Takasaki": "images/鉄道/JR東日本/高崎線.png",
    "Tsurumi": "images/鉄道/JR東日本/鶴見線.png",
    "Nambu": "images/鉄道/JR東日本/南武線.png",
    "Tokaido": "images/鉄道/JR東日本/東海道線.png",
    "JobanLocal": "images/鉄道/JR東日本/常盤緩行線.png",
    "Ginza": "images/鉄道/東京メトロ/銀座線.png",
    "Marunouchi": "images/鉄道/東京メトロ/丸ノ内線.png",
    "Hibiya": "images/鉄道/東京メトロ/日比谷線.png",
    "Yurakucho": "images/鉄道/東京メトロ/有楽町線.png",
    "Tozai": "images/鉄道/東京メトロ/東西線.png",
    "Asakusa": "images/鉄道/都営地下鉄/都営浅草線.png",
    "Do-Arakawa": "images/鉄道/都営地下鉄/都電荒川線.png",
    "Mita": "images/鉄道/都営地下鉄/都営三田線.png",
    "Shinjuku": "images/鉄道/都営地下鉄/都営新宿線.png",
    "Oedo": "images/鉄道/都営地下鉄/都営大江戸線.png",
    "Yurikamome": "images/鉄道/ゆりかもせ/ゆりかもせ.png",
    "SeibuShinjuku": "images/鉄道/西武鉄道/新宿線 ハイジマ線.png",
    "Odawara": "images/鉄道/小田急電鉄/小田原線.png",
    "Keio": "images/鉄道/京王電鉄/山口線.png",
    "TobuIsesaki": "images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
    "TobuSkytree": "images/鉄道/東武鉄道/東武スカイツリーライン 亀戸線 大志線.png",
    "TobuNikko": "images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png",
    "TokyuToyoko": "images/鉄道/東急電鉄/東横線.png",
    "YokohamaBlue": "images/鉄道/横浜市交通局/ブルーライン.png",
    "Keisei": "images/鉄道/京成電鉄/東条本線 おごせ線.png",
    "SeibuIkebukuro": "images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png",
    "SeibuChichibu": "images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png",
    "SeibuTamako": "images/鉄道/西武鉄道/玉子線.png",
    "SeibuTamagawa": "images/鉄道/西武鉄道/玉川線.png",
    "OdakyuEnoshima": "images/鉄道/小田急電鉄/江ノ島線.png",
    "TobuNoda": "images/鉄道/東武鉄道/野田線.png",
    "TamaMonorail": "images/鉄道/多摩都市モノレール/多摩都市モノレール線.png",
    "Rinko": "images/鉄道/東京臨海高速鉄道/臨海線.png",
    "HitachiNakaKaimin": "images/鉄道/首都圏新都市鉄道/つくばエクスプレス.jpg",
}

# Line metadata
line_meta = {
    "Yamanote": {"name": "Yamanote", "nameEn": "Yamanote Line", "code": "JY", "color": "#00C041", "operator": "JR East", "region": "Tokyo Area", "type": "loop", "stations": ["Shibuya", "Harajuku", "Yoyogi", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Taishakuten", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu"], "durations": [2]*30, "durationTotalMin": 60},
    "KeihinTohoku": {"name": "KeihinTohoku", "nameEn": "Keihin-Tohoku Line", "code": "JK", "color": "#2B7CD6", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Omiya", "Saitama-Shintoshin", "Yono", "Kita-Urawa", "Urawa", "Minami-Urawa", "Warabi", "Nishi-Kawaguchi", "Kawaguchi", "Akabane", "Higashi-Jujo", "Oji", "Kami-Nakazato", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Oi", "Omori", "Kamata", "Kawasaki", "Tsurumi", "Shin-Koyasu", "Higashi-Kanagawa", "Yokohama", "Sakuragicho", "Kannai", "Ishikawacho", "Yamate", "Negishi", "Isogo", "Shin-Sugita", "Yokoami", "Konan-dai", "Hongo-dai", "Ofuna"], "durations": [3]*47, "durationTotalMin": 141},
    "Yokosuka": {"name": "Yokosuka", "nameEn": "Yokosuka Line", "code": "JO", "color": "#D81E06", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Yokosuka-Chuo", "Higashi-Yokosuka", "Yokosuka", "Ofuna", "Kissaki", "Kurihama", "Kasminato", "Shiogama"], "durations": [3]*8, "durationTotalMin": 24},
    "ChuoRapid": {"name": "ChuoRapid", "nameEn": "Chuo Rapid Line", "code": "JC", "color": "#F18C00", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Shinagawa", "Meguro", "Ebisu", "Shibuya", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Ochanomizu"], "durations": [2]*25, "durationTotalMin": 50},
    "Saikyo": {"name": "Saikyo", "nameEn": "Saikyo Line", "code": "JA", "color": "#00AF9F", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro"], "durations": [2]*21, "durationTotalMin": 42},
    "Joban": {"name": "Joban", "nameEn": "Joban Rapid Line", "code": "JJ", "color": "#00A878", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Tokyo", "Kiyose", "Fuchubashi", "Nishi-Fuchubashi", "Musashino", "Kichijoji", "Nishi-Kichijoji", "Harumi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane"], "durations": [2]*17, "durationTotalMin": 34},
    "SobuLocal": {"name": "SobuLocal", "nameEn": "Sobu Local Line", "code": "JB", "color": "#00A878", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Tokyo", "Akebono", "Nihonbashi", "Mukojima", "Ryogoku", "Kuramae", "Kinshi", "Tsukishima", "Harumi", "Shinonome", "Kachidoki", "Toyosu", "Tatsumi", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi"], "durations": [2]*19, "durationTotalMin": 38},
    "Keiyo": {"name": "Keiyo", "nameEn": "Keiyo Line", "code": "JE", "color": "#00A878", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Tokyo", "Kayabacho", "Shin-Nihonbashi", "Kimachi", "Ariake", "Tokyo Teleport", "Kokusai-Tenjijo", "Makuhari-Hong", "Shin-Kemigawa", "Minami-Kemigawa", "Takanawa", "Kasai-Rinkai", "Nishi-Kasai", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"], "durations": [2]*17, "durationTotalMin": 34},
    "Musashino": {"name": "Musashino", "nameEn": "Musashino Line", "code": "JM", "color": "#00A878", "operator": "JR East", "region": "Tokyo Area", "type": "loop", "stations": ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shin-Okubo", "Ichigaya", "Yoyogi-Uehara", "Shibuya", "Shinsen", "Higashi-Kanagawa", "Tsurumi", "Nishi-Kawasaki", "Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu", "Wakasu", "Tokyo Teleport", "Ariake"], "durations": [2]*24, "durationTotalMin": 48},
    "ShonanShinjuku": {"name": "ShonanShinjuku", "nameEn": "Shonan-Shinjuku Line", "code": "JS", "color": "#55B735", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro"], "durations": [3]*21, "durationTotalMin": 63},
    "Takasaki": {"name": "Takasaki", "nameEn": "Takasaki Line", "code": "JT", "color": "#00A0C7", "operator": "JR East", "region": "Saitama Area", "type": "straight", "stations": ["Takasaki", "Kuroiso", "Ota", "Maebashi", "Kumagaya", "Hasuda", "Urawa", "Omiya"], "durations": [3]*8, "durationTotalMin": 24},
    "Tsurumi": {"name": "Tsurumi", "nameEn": "Tsurumi Line", "code": "JV", "color": "#00A0C7", "operator": "JR East", "region": "Kanagawa Area", "type": "straight", "stations": ["Tsurumi", "Nishi-Kawasaki", "Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu", "Wakasu"], "durations": [2]*9, "durationTotalMin": 18},
    "Nambu": {"name": "Nambu", "nameEn": "Nambu Line", "code": "JN", "color": "#E21B23", "operator": "JR East", "region": "Kanagawa Area", "type": "straight", "stations": ["Kawasaki", "Nakahara", "Ekimae", "Sakuragicho", "Musashi-Shinjo", "Tobata", "Nambu", "Higashi-Totsuka", "Totsuka", "Kokudo", "Tachikawa", "Musashi-Mitsuwadai", "Musashi-Saiwai", "Musashi-Nakagawa", "Musashi-Fujisawa", "Naruse", "Nagatoro", "Kugahara", "Hachiman-Honmachi", "Midoricho", "Mizonokuchi", "Musashi-Kosugi", "Kawasaki"], "durations": [2]*22, "durationTotalMin": 44},
    "Tokaido": {"name": "Tokaido", "nameEn": "Tokaido Line", "code": "JD", "color": "#00A0C7", "operator": "JR East", "region": "Tokyo Area", "type": "straight", "stations": ["Tokyo", "Shinagawa", "Yokohama", "Odawara", "Atami", "Kikuna", "Shimoda", "Ito", "Yumoto", "Matsuda", "Sagami-Ono", "Chigasaki", "Fujisawa", "Yukinoshita", "Kamakura", "Ofuna"], "durations": [3]*16, "durationTotalMin": 48},
    "JobanLocal": {"name": "JobanLocal", "nameEn": "Joban Local Line", "code": "JB", "color": "#00A878", "operator": "JR East", "region": "Chiba Area", "type": "straight", "stations": ["Ueno", "Nezu", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Shin-Okachimachi", "Akihabara", "Kanda", "Tokyo"], "durations": [2]*11, "durationTotalMin": 22},
    "Ginza": {"name": "Ginza", "nameEn": "Ginza Line", "code": "G", "color": "#FF9500", "operator": "Tokyo Metro", "region": "Tokyo Area", "type": "straight", "stations": ["Shinbashi", "Ginza", "Ginza-yonchome", "Hibiya", "Waseda", "Ueno", "Ueno-hirokoji", "Tawaramachi", "Asakusa"], "durations": [2]*9, "durationTotalMin": 18},
    "Marunouchi": {"name": "Marunouchi", "nameEn": "Marunouchi Line", "code": "M", "color": "#F6271C", "operator": "Tokyo Metro", "region": "Tokyo Area", "type": "straight", "stations": ["Shin-juku", "Shin-juku-sanchome", "Shibuya", "Mejiro", "Ikebukuro", "Akasaka-mitsuke", "Otemachi", "Mitsukoshimae", "Go-komon", "Yurakucho", "Shinbashi", "Tokyo", "Shin-Ochanomizu", "Korakuen", "Yushima", "Nezu", "Ueno", "Ueno-hirokoji"], "durations": [2]*18, "durationTotalMin": 36},
    "Hibiya": {"name": "Hibiya", "nameEn": "Hibiya Line", "code": "H", "color": "#C3C3C3", "operator": "Tokyo Metro", "region": "Tokyo Area", "type": "straight", "stations": ["Naka-mejima", "Kitasendai", "Hibiya", "Ginza", "Ueno", "Akihabara", "Hatchobori", "Kayabacho", "Tsukiji", "Ginza-hitchome", "Nijubashimae", "Hibiya", "Kasumigaseki", "Hiroo", "Meguro"], "durations": [2]*15, "durationTotalMin": 30},
    "Yurakucho": {"name": "Yurakucho", "nameEn": "Yurakucho Line", "code": "Y", "color": "#A0B0B0", "operator": "Tokyo Metro", "region": "Tokyo Area", "type": "straight", "stations": ["Wakoshi", "Nishi-takashimadaira", "Kishibojin", "Iruma", "Shin-rinkan", "Higashi-murayama", "Kokubunji", "Nishi-kokubunji", "Akigawa", "Takaosanguchi", "Hashimoto", "Hachioji", "Musashi-sakai", "Tachikawa", "Nishi-fuchu", "Fuchu", "Hino", "Nishi-koen", "Seijodai", "Akatsuka", "Musashinurare", "Kokumin-kyogijo", "Mejiro-dai", "Ikebukuro", "Tokyo-domae", "Yurakucho", "Shinbashi", "Daimon", "Onarimon", "Shimbashi", "Yurakucho"], "durations": [2]*31, "durationTotalMin": 62},
    "Tozai": {"name": "Tozai", "nameEn": "Tozai Line", "code": "T", "color": "#00AF9F", "operator": "Tokyo Metro", "region": "Tokyo Area", "type": "straight", "stations": ["Nishi-fushimi", "Fuchu", "Nishi-takashimadaira", "Kodaira", "Hikaridai", "Nishi-takaido", "Karasuyama", "Nakano-fujimicho", "Nakano", "Shinanomachi", "Shibuya", "Shirokane-takanawa", "Toranomon", "Shimbashi", "Nihonbashi", "Kayabacho", "Choju", "Akihabara", "Kiba", "Koto-shibari", "Toyo-su", "Shin-kiba"], "durations": [2]*21, "durationTotalMin": 42},
    "Asakusa": {"name": "Asakusa", "nameEn": "Asakusa Line", "code": "A", "color": "#F04B0A", "operator": "Toei", "region": "Tokyo Area", "type": "straight", "stations": ["Oshiage", "Kerama", "Asakusa", "Nihonbashi", "Kayabacho", "Ningyocho", "Higashi-nihonbashi", "Mitarashi", "Tsukishima", "Den-en-chofu", "Shinagawa", "Kototoi", "Oimachi", "Higashi-gotanda", "Meguro", "Kamata", "Takashimadaira", "Shin-kawasaki", "Kawasaki"], "durations": [2]*18, "durationTotalMin": 36},
    "Do-Arakawa": {"name": "Do-Arakawa", "nameEn": "Toei Arakawa Line", "code": "C", "color": "#D4AF37", "operator": "Toei", "region": "Tokyo Area", "type": "straight", "stations": ["Ikebukuro", "Shin-otemachi", "Hacchobori", "Yushima", "Ueno-hirokoji", "Yanaka", "Nezu", "Minowa", "Minowa-shita", "Koji-mae", "Otsuka-ekimae"], "durations": [2]*11, "durationTotalMin": 22},
    "Mita": {"name": "Mita", "nameEn": "Mita Line", "code": "I", "color": "#009AC8", "operator": "Toei", "region": "Tokyo Area", "type": "straight", "stations": ["Meguro", "Meguro-Dai", "Shirokanedai", "Nakameguro", "Shibuya", "Omotesando", "Aoyama-itchome", "Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Kojimachi", "Ichigaya", "Nagatacho", "Akabane-Iwabuchi"], "durations": [2]*16, "durationTotalMin": 32},
    "Shinjuku": {"name": "Shinjuku", "nameEn": "Shinjuku Line", "code": "S", "color": "#9C27B0", "operator": "Toei", "region": "Tokyo Area", "type": "straight", "stations": ["Shinjuku", "Shinjuku-sanchome", "Shibuya", "Omotesando", "Aoyama-itchome", "Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Kojimachi", "Ichigaya", "Nagatacho", "Akabane-Iwabuchi", "Kita-Senju"], "durations": [2]*15, "durationTotalMin": 30},
    "Oedo": {"name": "Oedo", "nameEn": "Oedo Line", "code": "E", "color": "#BF0000", "operator": "Toei", "region": "Tokyo Area", "type": "loop", "stations": ["Tochomae", "Suidobashi", "Yushima", "Ueno-Okachimachi", "Ueno-hirokoji", "Higashi-Shinbashi", "Tsukishima", "Kachidoki", "Toyosu", "Shin-Toyosu", "Odaiba-Kaihinkoen", "Aomi", "Oshida", "Kokusai-Tenjijo", "Tokyo-Teleport", "Daimon", "Akabanebashi", "Roppongi", "Ebisu", "Shibuya", "Mejiro", "Ikebukuro", "Takashimadaira", "Hikaridai", "Kodaira", "Nishi-takashimadaira", "Seijodai", "Akatsuka", "Musashinurare", "Kokumin-kyogijo", "Nishi-kokubunji", "Kokubunji", "Nakano-fujimicho", "Nakano", "Shinanomachi", "Shibuya"], "durations": [2]*35, "durationTotalMin": 70},
    "Yurikamome": {"name": "Yurikamome", "nameEn": "Yurikamome", "code": "U", "color": "#87CEEB", "operator": "Yurikamome", "region": "Tokyo Area", "type": "straight", "stations": ["Shimbashi", "Tsukishima", "Kachidoki", "Toyosu", "Tokyo Teleport", "Ariake", "Odaiba-Kaihinkoen", "Miraikai", "Denno", "Midosuji", "Aomi", "Tokyo Big Sight", "Daiba", "Hinode", "Kokusai-Tenjijo", "Makuhari Seaside", "Shin-Kemigawa", "Minami-Kemigawa", "Shin-Kiba"], "durations": [1]*19, "durationTotalMin": 19},
    "SeibuShinjuku": {"name": "SeibuShinjuku", "nameEn": "Seibu Shinjuku Line", "code": "SN", "color": "#0068B9", "operator": "Seibu", "region": "Saitama Area", "type": "straight", "stations": ["Shinjuku", "Nishi-Shinjuku", "Seibu-Shinjuku", "Waseda", "Hakusan", "Ikebukuro", "Minami-Nagasaki", "Kita-Otsuka", "Iruma-shi", "Kokubunji", "Higashi-Koganei", "Akitsu", "Nishifujisawa", "Oyama", "Higashi-Murayama", "Tsurukawa", "Higashi-Hachioji", "Hachioji", "Takahatafujimidai", "Okutama-guchi"], "durations": [2]*20, "durationTotalMin": 40},
    "Odawara": {"name": "Odawara", "nameEn": "Odawara Line", "code": "OH", "color": "#0078C1", "operator": "Odakyu", "region": "Kanagawa Area", "type": "straight", "stations": ["Shinjuku", "Setagaya", "Sasazuka", "Yoyogi-Uehara", "Nakamurabashi", "Shibuya", "Sangenjaya", "Machiya", "Takaradai", "Tama-Center", "Hachiman", "Tsurumi", "Yamato", "Odawara"], "durations": [2]*14, "durationTotalMin": 28},
    "Keio": {"name": "Keio", "nameEn": "Keio Line", "code": "KO", "color": "#0078C1", "operator": "Keio", "region": "Tokyo Area", "type": "straight", "stations": ["Mitaka", "Nishi-Kichijoji", "Kichijoji", "Hachioji", "Takaosanguchi", "Hashimoto", "Uenohara", "Inokashira", "Keio-Hachioji"], "durations": [2]*9, "durationTotalMin": 18},
    "TobuIsesaki": {"name": "TobuIsesaki", "nameEn": "Tobu Isesaki Line", "code": "TI", "color": "#0097A6", "operator": "Tobu", "region": "Saitama Area", "type": "straight", "stations": ["Asakusa", "Oshiage", "Shin-Machiya", "Nishi-Magome", "Minami-Magome", "Koji", "Minowa", "Tawaramachi", "Shimo-Kitazzu", "Kita-Aoi", "Aoto", "Adachi-Kangura", "Minami-Senju", "Tatekawa", "Shin-Adachi", "Adachi", "Shin-Misaki", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi"], "durations": [2]*23, "durationTotalMin": 46},
    "TobuSkytree": {"name": "TobuSkytree", "nameEn": "Tobu Skytree Line", "code": "TS", "color": "#0097A6", "operator": "Tobu", "region": "Saitama Area", "type": "straight", "stations": ["Asakusa", "Oshiage", "Shin-Machiya", "Nishi-Magome", "Minami-Magome", "Koji", "Minowa", "Tawaramachi", "Shimo-Kitazzu", "Kita-Aoi", "Aoto", "Adachi-Kangura", "Minami-Senju", "Tatekawa", "Shin-Adachi", "Adachi", "Shin-Misaki", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"], "durations": [2]*21, "durationTotalMin": 42},
    "TobuNikko": {"name": "TobuNikko", "nameEn": "Tobu Nikko Line", "code": "TN", "color": "#0097A6", "operator": "Tobu", "region": "Tochigi Area", "type": "straight", "stations": ["Asakusa", "Oshiage", "Shin-Machiya", "Nishi-Magome", "Minami-Magome", "Koji", "Minowa", "Tawaramachi", "Shimo-Kitazzu", "Kita-Aoi", "Aoto", "Adachi-Kangura", "Minami-Senju", "Tatekawa", "Shin-Adachi", "Adachi", "Shin-Misaki", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"], "durations": [2]*21, "durationTotalMin": 42},
    "TokyuToyoko": {"name": "TokyuToyoko", "nameEn": "Tokyu Toyoko Line", "code": "TY", "color": "#00A0C7", "operator": "Tokyu", "region": "Kanagawa Area", "type": "straight", "stations": ["Shibuya", "Nakameguro", "Fudosan-mae", "Yoyogi-Uehara", "Daikanyama", "Chuo-rinkan", "Setagaya", "Seijo-shijo", "Komazawa", "Tamagawa", "Tamagawa-Enzei-ji", "Daizen-ji", "Mukaiminato", "Hama-Kawada", "Yokohama"], "durations": [2]*15, "durationTotalMin": 30},
    "YokohamaBlue": {"name": "YokohamaBlue", "nameEn": "Blue Line", "code": "B", "color": "#00A0C7", "operator": "Yokohama Municipal Transportation Bureau", "region": "Kanagawa Area", "type": "straight", "stations": ["Shonandai", "Zushi", "Higashi-Zushi", "Kita-Zushi", "Hiratsuka", "Yokohama", "Miyagi", "Yamato", "Chuo-Ku", "Sakai", "Higashi-Murayama", "Isehara", "Odawara"], "durations": [2]*13, "durationTotalMin": 26},
    "Keisei": {"name": "Keisei", "nameEn": "Keisei Main Line", "code": "KS", "color": "#D81E06", "operator": "Keisei", "region": "Chiba Area", "type": "straight", "stations": ["Nippori", "Tadachi", "Keisei-Tsukawa", "Koiwa", "Minami-Senju", "Adachi", "Shin-Adachi", "Yoshiwara", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"], "durations": [2]*11, "durationTotalMin": 22},
    "SeibuIkebukuro": {"name": "SeibuIkebukuro", "nameEn": "Seibu Ikebukuro Line", "code": "SI", "color": "#0068B9", "operator": "Seibu", "region": "Saitama Area", "type": "straight", "stations": ["Ikebukuro", "Seibu-Shinjuku", "Waseda", "Hakusan", "Minami-Nagasaki", "Kita-Otsuka", "Iruma-shi", "Kokubunji", "Higashi-Koganei", "Akitsu", "Nishifujisawa", "Oyama", "Higashi-Murayama", "Tsurukawa", "Higashi-Hachioji", "Hachioji", "Takahatafujimidai", "Okutama-guchi"], "durations": [2]*18, "durationTotalMin": 36},
    "SeibuChichibu": {"name": "SeibuChichibu", "nameEn": "Seibu Chichibu Line", "code": "SC", "color": "#0068B9", "operator": "Seibu", "region": "Saitama Area", "type": "straight", "stations": ["Higashi-Hachioji", "Hachioji", "Takahatafujimidai", "Okutama-guchi", "Kotaki", "Nakagami", "Chichibu"], "durations": [2]*7, "durationTotalMin": 14},
    "SeibuTamako": {"name": "SeibuTamako", "nameEn": "Tamako Line", "code": "ST", "color": "#0068B9", "operator": "Seibu", "region": "Saitama Area", "type": "straight", "stations": ["Seibu-Yuuyamada", "Yuki", "Tamako"], "durations": [2]*3, "durationTotalMin": 6},
    "SeibuTamagawa": {"name": "SeibuTamagawa", "nameEn": "Tamagawa Line", "code": "SM", "color": "#0068B9", "operator": "Seibu", "region": "Tokyo Area", "type": "straight", "stations": ["Shibuya", "Setagaya", "Sasazuka", "Yoyogi-Uehara"], "durations": [2]*4, "durationTotalMin": 8},
    "OdakyuEnoshima": {"name": "OdakyuEnoshima", "nameEn": "Odakyu Enoshima Line", "code": "OE", "color": "#0078C1", "operator": "Odakyu", "region": "Kanagawa Area", "type": "straight", "stations": ["Shinjuku", "Setagaya", "Sasazuka", "Yoyogi-Uehara", "Nakamurabashi", "Shibuya", "Sangenjaya", "Machiya", "Takaradai", "Tama-Center", "Hachiman", "Tsurumi", "Yamato", "Odawara"], "durations": [2]*14, "durationTotalMin": 28},
    "TobuNoda": {"name": "TobuNoda", "nameEn": "Tobu Noda Line", "code": "NT", "color": "#0097A6", "operator": "Tobu", "region": "Chiba Area", "type": "straight", "stations": ["Nippori", "Tadachi", "Keisei-Tsukawa", "Koiwa", "Minami-Senju", "Adachi", "Shin-Adachi", "Yoshiwara", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"], "durations": [2]*11, "durationTotalMin": 22},
    "TamaMonorail": {"name": "TamaMonorail", "nameEn": "Tama Monorail Line", "code": "TM", "color": "#E60012", "operator": "Tama Monorail", "region": "Tokyo Area", "type": "straight", "stations": ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shin-Okubo", "Ichigaya", "Yoyogi-Uehara", "Shibuya", "Shinsen", "Higashi-Kanagawa", "Tsurumi", "Nishi-Kawasaki", "Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu", "Wakasu", "Tokyo Teleport", "Ariake"], "durations": [2]*24, "durationTotalMin": 48},
    "Rinko": {"name": "Rinko", "nameEn": "Rinko Line", "code": "R", "color": "#00A0C7", "operator": "Tokyo Waterfront", "region": "Tokyo Area", "type": "straight", "stations": ["Osaki", "Tamachi", "Kachidoki", "Toyosu", "TokyoTeleport", "Ariake", "OdaibaKaihinkoen", "Miraikai", "Denno", "Midosuji", "Aomi", "TokyoBigSight", "Daiba", "Hinode", "KokusaiTenjijo", "MakuhariSeaside", "ShinKemigawa", "MinamiKemigawa", "ShinKiba"], "durations": [1]*19, "durationTotalMin": 19},
    "HitachiNakaKaimin": {"name": "HitachiNakaKaimin", "nameEn": "Tsukuba Express", "code": "TX", "color": "#9C27B0", "operator": "Mitsui fudosan", "region": "Ibaraki Area", "type": "straight", "stations": ["Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Kitasenju", "Shiroi", "Kamagaya", "Toride", "Abiko", "Kashiwa", "Narashino", "Funabashi", "Makuhari", "Tsukuba"], "durations": [1]*35, "durationTotalMin": 35},
}

# Build the JS output
js_lines = ['/*', ' * Line Control - Unified Line Data', ' * 线路数据控制', ' */', '', '(function() {', '  "use strict";', '', '  window.UNIFIED_LINES = {']

for line_id in sorted(line_meta.keys()):
    data = line_meta[line_id]
    image = image_map.get(line_id, "images/鉄道/JR東日本/山手線.png")
    js_lines.append(f'    "{line_id}": {{')
    js_lines.append(f'      name: "{data["name"]}", nameEn: "{data["nameEn"]}", code: "{data["code"]}", color: "{data["color"]}",')
    js_lines.append(f'      operator: "{data["operator"]}", region: "{data["region"]}", type: "{data["type"]}",')
    js_lines.append(f'      image: "{image}", durationTotalMin: {data["durationTotalMin"]}, throughServices: [],')
    js_lines.append(f'      transferStations: [],')
    js_lines.append(f'      stations: {json.dumps(data["stations"])},')
    js_lines.append(f'      durations: {json.dumps(data["durations"])},')
    js_lines.append('      branchOf: null')
    js_lines.append('    },')

js_lines.append('  };')
js_lines.append('')
js_lines.append('  window.TRAINS = window.TRAINS || ' + json.dumps(trains_data, ensure_ascii=False))
js_lines.append('')
js_lines.append('})();')

# Write the file
output = '\n'.join(js_lines)
with open('data/railway/line-control.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f'Generated line-control.js with {len(line_meta)} lines')
print(f'Lines: {sorted(line_meta.keys())}')
