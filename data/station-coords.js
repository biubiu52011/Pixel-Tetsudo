(function() {
  "use strict";
  window.STATION_COORDS = {
    // Tokyo Area Major Stations
    "Tokyo": [35.6812, 139.7671], "Shinjuku": [35.6896, 139.7006], "Shibuya": [35.658, 139.7016],
    "Shimbashi": [35.6661, 139.7584], "Ueno": [35.7137, 139.7774], "Akihabara": [35.6984, 139.7731],
    "Yurakucho": [35.6751, 139.7633], "Ginza": [35.6717, 139.7648], "Hibiya": [35.6745, 139.7521],
    "Shinagawa": [35.6284, 139.7387], "Ikebukuro": [35.7295, 139.7109], "Tachikawa": [35.6983, 139.4136],
    "Yokohama": [35.4437, 139.638], "Kawasaki": [35.5307, 139.7029], "Saitama": [35.8617, 139.6454],
    "Omiya": [35.9067, 139.6231], "Ofuna": [35.3889, 139.6469], "Kamakura": [35.3192, 139.5511],
    "Odawara": [35.2569, 139.1544], "Atami": [35.0961, 139.0711], "Nagoya": [35.1815, 136.9066],
    "Osaka": [34.6937, 135.5023], "Kyoto": [35.0116, 135.7681], "Hachioji": [35.6558, 139.3239],
    "Mitake": [35.7106, 139.2669], "Ome": [35.7239, 139.1633], "Takanawa": [35.6256, 139.7403],
    "Meguro": [35.6339, 139.6917], "Ebisu": [35.6467, 139.7103], "Harajuku": [35.6702, 139.7026],
    "Yoyogi": [35.6832, 139.7021], "Shin-juku": [35.6896, 139.7006],
    // Chuo Line
    "Kanda": [35.6916, 139.7722], "Ochanomizu": [35.6994, 139.7653], "Iidabashi": [35.7023, 139.7453],
    "Fujimi": [35.7017, 139.7353], "Iwatsunomachi": [35.7067, 139.7261], "Korakuen": [35.7078, 139.7269],
    "Mikawahashi": [35.7044, 139.7181], "Nihonbashi": [35.6819, 139.7746],
    "Ningyocho": [35.6878, 139.7839], "Kayabacho": [35.6767, 139.7781],
    "Tsukishima": [35.6644, 139.7731], "Toyosu": [35.6544, 139.7928], "Shin-Kiba": [35.6606, 139.8253],
    "Tatsumi": [35.6467, 139.8131], "Koiwa": [35.7342, 139.8481], "Nishi-Koiwa": [35.7456, 139.8342],
    "Minami-Koiwa": [35.7556, 139.8331], "Yoshiwara": [35.7656, 139.8306], "Adachi": [35.7753, 139.8047],
    "Koshigaya": [35.8617, 139.7689], "Oshiage": [35.7101, 139.8107], "Tokiwabashi": [35.7167, 139.7906],
    "Komagome": [35.7289, 139.7378], "Tabata": [35.7444, 139.7378], "Shin-Urawa": [35.8456, 139.6917],
    "Urawa": [35.8617, 139.6944], "Kita-Urawa": [35.8778, 139.6778], "Minami-Urawa": [35.8481, 139.6731],
    // Saikyo/Keihin-Tohoku
    "Akabane": [35.7356, 139.6731], "Higashi-Jujo": [35.7456, 139.6917], "Oji": [35.7556, 139.7089],
    "Kami-Nakazato": [35.7656, 139.7156], "Nishi-Nippori": [35.7306, 139.7631],
    "Nippori": [35.7278, 139.7706], "Uguisudani": [35.7189, 139.7631], "Okachimachi": [35.7044, 139.7722],
    "Hamamatsucho": [35.6556, 139.7528], "Tamachi": [35.6456, 139.7431],
    "Takanawa-Gateway": [35.6378, 139.7389], "Osaki": [35.6267, 139.7278],
    "Gotanda": [35.6328, 139.6994], "Ebisu": [35.6467, 139.7103],
    // Tozai Line
    "Wakoshi": [35.8231, 139.7756], "Higashi-Ikebukuro": [35.7311, 139.7269],
    "Yushima": [35.7117, 139.7689], "Yurakucho": [35.6751, 139.7633],
    "Nihonbashi": [35.6819, 139.7746], "Makuhari-hongo": [35.6489, 139.8456],
    "Kayabacho": [35.6767, 139.7781], "Tsukishima": [35.6644, 139.7731],
    "Tokyo Dome-mae": [35.7056, 139.7469], "Kacho-mae": [35.6967, 139.7617],
    "Harumi-futago": [35.6644, 139.7978], "Shin-Kiba": [35.6606, 139.8253],
    // Marunouchi
    "Otemachi": [35.6867, 139.7656], "Kudanshita": [35.6944, 139.7478],
    "Jimbocho": [35.6944, 139.7531], "Ichigaya": [35.6978, 139.7378],
    "Nagatacho": [35.6778, 139.7389], "Akasaka-mitsuke": [35.6739, 139.7356],
    "Roppongi": [35.6628, 139.7314], "Akabane-Iwabuchi": [35.7467, 139.6689],
    // Hanzomon
    "Hanzomon": [35.6856, 139.7389], "Otemachi": [35.6867, 139.7656],
    "Kudanshita": [35.6944, 139.7478], "Jimbocho": [35.6944, 139.7531],
    "Kojimachi": [35.6839, 139.7378], "Ichigaya": [35.6978, 139.7378],
    "Nagatacho": [35.6778, 139.7389], "Akabane-Iwabuchi": [35.7467, 139.6689],
    // Namboku
    "Shirokanedai": [35.6378, 139.7189], "Nakameguro": [35.6433, 139.6975],
    "Omotesando": [35.6653, 139.7121], "Aoyama-itchome": [35.6678, 139.7189],
    "Kamiyacho": [35.6678, 139.7356], "Hanzomon": [35.6856, 139.7389],
    "Otemachi": [35.6867, 139.7656], "Kudanshita": [35.6944, 139.7478],
    "Jimbocho": [35.6944, 139.7531], "Kojimachi": [35.6839, 139.7378],
    "Ichigaya": [35.6978, 139.7378], "Nagatacho": [35.6778, 139.7389],
    "Akabane-Iwabuchi": [35.7467, 139.6689],
    // Mita
    "Oizumigakuen": [35.7817, 139.6389], "Komazawa": [35.6556, 139.6656],
    "Setagaya": [35.6464, 139.6536], "KinutaPark": [35.6389, 139.6456],
    "Kegon": [35.6317, 139.6361], "Sangenjaya": [35.6444, 139.6517],
    "Nakameguro": [35.6433, 139.6975], "Shibuya": [35.658, 139.7016],
    "Onarimon": [35.6739, 139.7378], "Kamiyacho": [35.6678, 139.7356],
    "Tameike-sanno": [35.6739, 139.7356], "Akasaka-mitsuke": [35.6739, 139.7356],
    "Nagatacho": [35.6778, 139.7389], "Shirokane-takanawa": [35.6456, 139.7317],
    "Mita": [35.6556, 139.7456],
    // Fukutoshin
    "Wakoshi": [35.8231, 139.7756], "Higashi-Ikebukuro": [35.7311, 139.7269],
    "Ikebukuro": [35.7295, 139.7109], "Yushima": [35.7117, 139.7689],
    "Ueno": [35.7137, 139.7774], "Okachimachi": [35.7044, 139.7722],
    "Ginza": [35.6717, 139.7648], "Yurakucho": [35.6751, 139.7633],
    "Shimbashi": [35.6661, 139.7584], "Hamamatsucho": [35.6556, 139.7528],
    "Tokyo": [35.6812, 139.7671], "Nihonbashi": [35.6819, 139.7746],
    "Makuhari-hongo": [35.6489, 139.8456], "Kayabacho": [35.6767, 139.7781],
    "Tsukishima": [35.6644, 139.7731], "Tokyo Dome-mae": [35.7056, 139.7469],
    "Kacho-mae": [35.6967, 139.7617], "Harumi-futago": [35.6644, 139.7978],
    "Shin-Kiba": [35.6606, 139.8253],
    // Ome Line specific
    "Nishi-Tachikawa": [35.6956, 139.3989], "Nakagami": [35.7189, 139.2222],
    "Haijima": [35.7311, 139.1806], "Higashi-Ome": [35.7289, 139.1722],
    "Sawai": [35.7317, 139.1556], "Nishi-Ome": [35.7367, 139.1444],
    "Futamatao": [35.7439, 139.1361], "Ishigamimae": [35.7517, 139.1278],
    "Hinatawada": [35.7606, 139.1194], "Miyanohira": [35.7689, 139.1111],
    "Musashi-Sakai": [35.7778, 139.1028], "Musashi-Yoshida": [35.7861, 139.0944],
    "Tachikawa-Minami": [35.6889, 139.4089], "Tachikawa-Kita": [35.7028, 139.4089],
    "Okutama-gochi": [35.7278, 139.1944],
    // Chuo Rapid stations not yet covered
    "Nagasaki": [35.6889, 139.6839], "Taishakuten": [35.6956, 139.6756],
    "Ikeda": [35.7028, 139.6639], "Mejiro": [35.7167, 139.7061],
    "Takadanobaba": [35.7117, 139.7028], "Otsuka": [35.7317, 139.7231],
    "Nezu": [35.7389, 139.7689], "Shin-Okachimachi": [35.7078, 139.7778],
    // Sobu Line
    "Kinshi": [35.6967, 139.8131], "Ryogoku": [35.6983, 139.7918],
    "Kuramae": [35.7056, 139.7978], "Mukojima": [35.7117, 139.8056],
    "Akebono": [35.7167, 139.8139], "Tsukishima": [35.6644, 139.7731],
    "Harumi": [35.6556, 139.7839], "Shinonome": [35.6378, 139.7978],
    "Kachidoki": [35.6617, 139.7778], "Toyosu": [35.6544, 139.7928],
    "Tatsumi": [35.6467, 139.8131],
    // Keiyo Line
    "Naka-mejima": [35.6378, 139.8278], "Kitasendai": [35.6456, 139.8389],
    "Hatchobori": [35.6778, 139.7839], "Tsukiji": [35.6654, 139.7707],
    "Ginza-hitchome": [35.6717, 139.7678], "Nijubashimae": [35.6789, 139.7578],
    "Kasumigaseki": [35.6756, 139.7517], "Hiroo": [35.6556, 139.7189],
    // Yamanote (already covered mostly)
    "Shin-osaki": [35.6267, 139.7278],
    // Yokohama Municipal Blue
    "Shin-Yokohama": [35.5089, 139.6178], "Tsurumi": [35.5317, 139.6917],
    "Higashi-Kawasaki": [35.5267, 139.7156], "Shin-Koyasu": [35.5417, 139.6778],
    "Oi": [35.5717, 139.6678], "Omori": [35.5878, 139.6978],
    "Kamata": [35.5617, 139.7089],
    // Tobu
    "Shimokitazawa": [35.6619, 139.6672], "Nakano": [35.7058, 139.6639],
    "Musashisakai": [35.7167, 139.4761], "Hanno": [35.8528, 139.4231],
    "Sakado": [35.9231, 139.4069], "Iruma": [35.9444, 139.3778],
    "Tokigawa": [35.9639, 139.3528], "Sayama": [35.8839, 139.4056],
    "Hachioji": [35.6558, 139.3239],
    // Seibu
    "Seibu-Shinjuku": [35.6956, 139.6978], "Seibu-Chausuyama": [35.7189, 139.6639],
    "Seibu-Chitose": [35.7317, 139.6456], "Seibu-Hikawa": [35.7456, 139.6278],
    "Seibu-Nakagawa": [35.7606, 139.6089], "Seibu-Yuuyamada": [35.7778, 139.5878],
    // Odakyu
    "Sangenjaya": [35.6444, 139.6517], "Setagaya": [35.6464, 139.6536],
    "Shibuya": [35.658, 139.7016], "Minami-Aoyama": [35.6639, 139.7139],
    // Toei Asakusa
    "Shin-Machiya": [35.7417, 139.8089], "Nishi-Magome": [35.7339, 139.7978],
    "Minami-Magome": [35.7278, 139.7906], "Koji": [35.7217, 139.7831],
    "Minowa": [35.7156, 139.7756], "Tawaramachi": [35.7089, 139.7706],
    "Shimo-Kitazzu": [35.7017, 139.7656], "Kita-Aoi": [35.6944, 139.7617],
    "Aoto": [35.6878, 139.7578], "Adachi-Kangura": [35.6817, 139.7539],
    "Minami-Senju": [35.6756, 139.7506], "Tatekawa": [35.6689, 139.7478],
    "Shin-Adachi": [35.6628, 139.7444], "Adachi": [35.7753, 139.8047],
    "Shin-Misaki": [35.6556, 139.7417],
    // Toei Oedo
    "Tochomae": [35.6978, 139.7578], "Suidobashi": [35.7017, 139.7506],
    "Yushima": [35.7117, 139.7689], "Ueno-hiro": [35.7139, 139.7756],
    "Ueno": [35.7137, 139.7774], "Okachi": [35.7078, 139.7778],
    "Ueno-hirokoji": [35.7089, 139.7706], "Tawaramachi": [35.7089, 139.7656],
    "Akihabara": [35.6984, 139.7731], "Kanda": [35.6916, 139.7722],
    "Otemachi": [35.6867, 139.7656], "Hanzomon": [35.6856, 139.7389],
    "Kamiyacho": [35.6678, 139.7356], "Roppongi": [35.6628, 139.7314],
    "Azabu-juban": [35.6544, 139.7278], "Shirokane-takanawa": [35.6456, 139.7317],
    "Daimon": [35.6339, 139.7478], "Shin-Odaimon": [35.6278, 139.7539],
    "Tampopo": [35.6217, 139.7611], "Toyosu": [35.6544, 139.7928],
    "Tsukishima": [35.6644, 139.7731], "Kachidoki": [35.6617, 139.7778],
    "Higashi-Shinbashi": [35.6639, 139.7656], "Shimbashi": [35.6661, 139.7584],
    // Toei Mita
    "Mita": [35.6556, 139.7456],
    // Yurikamome
    "Shin-Bayashi": [35.6278, 139.7756], "Daiba": [35.6264, 139.7737],
    "Aomi": [35.6256, 139.7817], "Teleport-Chuo": [35.6256, 139.7889],
    "Tempozanto-Mae": [35.6528, 139.7256], "Hotaru-Kaihinkogen": [35.6439, 139.7356],
    // Minato Mirai
    "Minato-Mirai-21": [35.4556, 139.6317], "Sakuragicho": [35.4456, 139.6339],
    // Toei Shinjuku
    "Shinjuku": [35.6896, 139.7006], "Shinjuku-sanchome": [35.6917, 139.6978],
    "Shibuya": [35.658, 139.7016], "Omotesando": [35.6653, 139.7121],
    "Aoyama-itchome": [35.6678, 139.7189], "Kamiyacho": [35.6678, 139.7356],
    "Hanzomon": [35.6856, 139.7389], "Otemachi": [35.6867, 139.7656],
    "Kudanshita": [35.6944, 139.7478], "Jimbocho": [35.6944, 139.7531],
    "Kojimachi": [35.6839, 139.7378], "Ichigaya": [35.6978, 139.7378],
    "Nagatacho": [35.6778, 139.7389], "Akabane-Iwabuchi": [35.7467, 139.6689],
    // Keio
    "Keio-Hachioji": [35.6717, 139.3028], "Takaosanguchi": [35.6189, 139.2978],
    // Keikyu
    "Yokosuka-Chuo": [35.2878, 139.6678], "Higashi-Yokosuka": [35.2956, 139.6731],
    "Ofuna": [35.3889, 139.6469], "Kissaki": [35.3017, 139.6378],
    "Kurihama": [35.2556, 139.6339], "Kasminato": [35.2456, 139.6278],
    "Shiogama": [35.2178, 139.6167],
    // Sotetsu
    "Sagami-Ono": [35.5517, 139.4339], "Shin-Yokohama": [35.5089, 139.6178],
    // Tokyu Toyoko
    "Naka-mejima": [35.6378, 139.8278], "Kita-Sendai": [35.6456, 139.8389],
    "Hatchobori": [35.6778, 139.7839], "Tsukiji": [35.6654, 139.7707],
    // Tokyu Den-en-toshi
    "Den-en-chofu": [35.6078, 139.6889], "Mizonokuchi": [35.5878, 139.6889],
    "Sesenji": [35.5678, 139.6889], "Kusatsu": [35.5378, 139.6889],
    "Nagatsuta": [35.5078, 139.6839], "Tama-Center": [35.4878, 139.6678],
    // Tobu Skytree
    "Oshiage": [35.7101, 139.8107], "Asakusa": [35.7148, 139.7967],
    "Tobu-Dozui-Michi": [35.7317, 139.7978], "Minami-Senju": [35.6756, 139.7506],
    // Tokyo Metro Chiyoda
    "Yoyogi-Uehara": [35.6778, 139.6956], "Mejiro": [35.7167, 139.7061],
    "Takadanobaba": [35.7117, 139.7028], "Waseda": [35.7139, 139.6978],
    // Tokyo Metro Yūrakuchō
    "Shin-Okubo": [35.7028, 139.7156], "Sunamachi": [35.7089, 139.7231],
    "Korakuen": [35.7078, 139.7269], "Mikawahashi": [35.7044, 139.7181],
    "Nihonbashi": [35.6819, 139.7746], "Kachidoki": [35.6617, 139.7778],
    // Tokyo Metro Hanzomon
    "Bakurōmae": [35.6778, 139.7617],
    // Tokyo Metro Namboku
    "Shirokane-takanawa": [35.6456, 139.7317],
    // Tokyo Metro Mita
    "Onarimon": [35.6739, 139.7378],
    // Tokyo Metro Fukutoshin
    "Shinjuku-sanchome": [35.6917, 139.6978],
    // Other lines
    "Azabu-Juban": [35.654, 139.7307], "Shin-Marunouchi": [35.6812, 139.7671],
    // Additional
    "Kokubunji": [35.7022, 139.4067], "Koganei": [35.6997, 139.5025],
    "Kunitachi": [35.6844, 139.4444], "Musashino": [35.7022, 139.5644],
    "Kichijoji": [35.703, 139.5797], "Nakano": [35.7058, 139.6639],
    "Suginami": [35.6994, 139.6364], "Koenji": [35.7067, 139.6478],
    "Nerima": [35.7357, 139.6517], "Itabashi": [35.7514, 139.7078],
    "Higashimurayama": [35.7547, 139.4669], "Musashimurayama": [35.7531, 139.3836],
    "Kodaira": [35.7289, 139.4775], "Akishima": [35.7069, 139.3836],
    "Hino": [35.6706, 139.3986], "Fuchu": [35.6697, 139.4778],
    "Tama": [35.6367, 139.4389],
    // Yurikamome
    "Shin-Machiya": [35.7417, 139.8089],
    // Gotanda area
    "Shinagawa": [35.6284, 139.7387],
    // Musashikosugi
    "Musashi-Kosugi": [35.5456, 139.6539],
    // Shonandai
    "Shonandai": [35.3056, 139.4611],
    // Fujisawa
    "Fujisawa": [35.3389, 139.4889],
    // Chigasaki
    "Chigasaki": [35.3278, 139.4231],
    // Zushi
    "Zushi": [35.3089, 139.5517], "Kita-Zushi": [35.3189, 139.5417],
    // Miura-Kaigan
    "Miura-Kaigan": [35.2678, 139.5056],
    // Hayato
    "Hayato": [35.3456, 139.5231],
    // Tsurumi-Ryokuchi
    "Tsurumi-Ryokuchi": [35.4778, 139.7028],
    // Others
    "Hongo-dai": [35.5678, 139.6378], "Konan-dai": [35.5578, 139.6278],
    "Yokoami": [35.5478, 139.6178], "Isogo": [35.4456, 139.6389],
    "Negishi": [35.4378, 139.6278], "Yamate": [35.4278, 139.6378],
    "Kannai": [35.4378, 139.6478], "Sakuragicho": [35.4456, 139.6339],
    // Sotetsu
    "Sotsu-Shin-Yokohama": [35.5089, 139.6178],
    // Additional Seibu
    "Kokumin-kyogijo": [35.7189, 139.5778],
    // Tobu Nikko
    "Imaichi": [36.7139, 139.6986],
    // Nikko
    "Nikko": [36.7139, 139.6986],
    // Utsunomiya
    "Utsunomiya": [36.5578, 139.8939],
    // Takasaki
    "Takasaki": [36.3228, 139.0028],
    // Maebashi
    "Maebashi": [36.3911, 139.0606],
    // Ueno-hirokoji
    "Ueno-hirokoji": [35.7089, 139.7706],
    // Otsuka-ekimae
    "Otsuka-ekimae": [35.7317, 139.7231],
    // Shinjuku-nishiguchi
    "Shinjuku-nishiguchi": [35.6917, 139.6956],
    // Additional Ikebukuro
    "Ikebukuro": [35.7295, 139.7109],
    // Shin-Okubo
    "Shin-Okubo": [35.7028, 139.7156],
    // Additional Nippori
    "Nippori": [35.7278, 139.7706],
    // Kurihama
    "Kurihama": [35.2556, 139.6339],
    // Additional
    "Takaradai": [35.7189, 139.6556],
    "Seijo": [35.6556, 139.6178],
    "Seijodai": [35.6678, 139.6078],
    "Seijo-shijo": [35.6778, 139.5978],
    // Tama Monorail
    "Tama-plaza": [35.6339, 139.4389],
    "Tama-center": [35.6278, 139.4478],
    // MIR (Minato Mirai)
    "Minato-Mirai": [35.4556, 139.6317],
    // Keisei
    "Keisei-Tsukawa": [35.8078, 139.8389],
    // Yokohama Municipal Orange
    "Shin-Takashima": [35.4378, 139.5878],
    // Additional JR East
    "Shin-Kawasaki": [35.5307, 139.7029],
    "Hama-Kawada": [35.5217, 139.7089],
    "Ekimae": [35.5128, 139.7156],
    // Tokyo Metro Marunouchi branch
    "Iidabashi": [35.7023, 139.7453],
    "Fujimi": [35.7017, 139.7353],
    // Additional
    "Suidobashi": [35.7017, 139.7506],
    "Yanaka": [35.7278, 139.7839],
    "Uenohara": [35.7217, 139.7778],
  };
})();
