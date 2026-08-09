# Write the complete line-control.js using a different approach
# First, create the content as a Python string and write it

content_parts = []

# Header
content_parts.append("""/*
 * 线路控制数据
 */

// === Line Control - Unified Line Data & Components ===
// Merged: JR East + Tokyo Metro + Toei + Private Railways
// Encoding: UTF-8

(function() {
  "use strict";

  window.UNIFIED_LINES = {""")

# Line definitions - I'll write them one by one
lines = [
    ('Yamanote', 'JY', 30, 2, ["Shibuya", "Harajuku", "Yoyogi", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Taishakuten", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu"]),
    ('KeihinTohoku', 'JK', 47, 3, ["Omiya", "Saitama-Shintoshin", "Yono", "Kita-Urawa", "Urawa", "Minami-Urawa", "Warabi", "Nishi-Kawaguchi", "Kawaguchi", "Akabane", "Higashi-Jujo", "Oji", "Kami-Nakazato", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Oi", "Omori", "Kamata", "Kawasaki", "Tsurumi", "Shin-Koyasu", "Higashi-Kanagawa", "Yokohama", "Sakuragicho", "Kannai", "Ishikawacho", "Yamate", "Negishi", "Isogo", "Shin-Sugita", "Yokoami", "Konan-dai", "Hongo-dai", "Ofuna"]),
    ('Yokosuka', 'JO', 8, 3, ["Yokosuka-Chuo", "Higashi-Yokosuka", "Yokosuka", "Ofuna", "Kissaki", "Kurihama", "Kasminato", "Shiogama"]),
    ('ChuoRapid', 'JC', 25, 2, ["Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Shinagawa", "Meguro", "Ebisu", "Shibuya", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Ochanomizu"]),
    ('Saikyo', 'JA', 50, 2, ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori"]),
    ('Joban', 'JJ', 17, 2, ["Tokyo", "Kiyose", "Fuchubashi", "Nishi-Fuchubashi", "Musashino", "Kichijoji", "Nishi-Kichijoji", "Harumi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane"]),
    ('SobuLocal', 'JB', 19, 2, ["Tokyo", "Akebono", "Nihonbashi", "Mukojima", "Ryogoku", "Kuramae", "Kinshi", "Tsukishima", "Harumi", "Shinonome", "Kachidoki", "Toyosu", "Tatsumi", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi"]),
    ('Keiyo', 'JE', 17, 2, ["Tokyo", "Kayabacho", "Shin-Nihonbashi", "Kimachi", "Ariake", "Tokyo Teleport", "Kokusai-Tenjijo", "Makuhari-Hongō", "Shin-Kemigawa", "Minami-Kemigawa", "Takanawa", "Kasai-Rinkai", "Nishi-Kasai", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"]),
    ('Musashino', 'JM', 24, 2, ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shin-Okubo", "Ichigaya", "Yoyogi-Uehara", "Shibuya", "Shinsen", "Higashi-Kanagawa", "Tsurumi", "Nishi-Kawasaki", "Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu", "Wakasu", "Tokyo Teleport", "Ariake"]),
    ('ShonanShinjuku', 'JS', 21, 3, ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro"]),
    ('Takasaki', 'JU', 23, 3, ["Ueno", "Uguisudani", "Nippori", "Shin-Okachimachi", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Omiya"]),
    ('Tsurumi', 'JV', 6, 3, ["Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu"]),
    ('Nambu', 'JN', 11, 3, ["Musashi-Sakai", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba"]),
    ('Tokaido', 'JT', 27, 3, ["Atami", "Yugawara", "Manazuru", "Nebugawa", "Hayakawa", "Odawara", "Kannokiya", "Kozu", "Ninomiya", "Oiso", "Hiratsuka", "Chigasaki", "Tsujido", "Fujisawa", "Ofuna", "Tootsuka", "Yokohama", "Kawasaki", "Shinagawa", "Shimbashi", "Tokyo", "Ueno", "Oku", "Akabane", "Urawa", "Saitama-Shintoshin", "Omiya"]),
    ('JobanLocal', 'JL', 17, 2, ["Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"]),
    ('Ginza', 'G', 12, 2, ["Shibuya", "Omotesando", "Ginza", "Nihonbashi", "Mitarashi", "Shin-Nihonbashi", "Kokkola-Mitsuwamon", "Miyuki-cho", "Wakoshi", "Shin-Uchibori", "Nihonbashi", "Asakusa"]),
    ('Hibiya', 'H', 19, 2, ["Kitasenju", "Minami-Senju", "Akihabara", "Ueno-Okachimachi", "Kanda", "Yurakucho", "Hibiya", "Ginza", "Shinbashi", "Daimon", "Onarimon", "Toranomon", "Shimbashi", "Nihonbashi", "Kojimashi", "Jimbacho", "Hibiya", "Kagurazaka", "Naka-okubo"]),
    ('Tozai', 'T', 24, 2, ["Nishi-Funabashi", "Funabashi", "Nishi-Kasai", "Koiwa", "Nishi-Ueno", "Takadanobaba", "Iidabashi", "Yodobashi-Akiba", "Nihonbashi", "Kyūbashi", "Kaityō-mae", "Ōtemachi", "Hibiyakōen", "Higashi-Ginza", "Tsukiji", "Shin-Nihonbashi", "Komon", "Nakano", "Nakano-Shinjuku"]),
    ('Mita', 'I', 16, 2, ["Ichigawa", "Hikawadai", "Mejiro-Dai", "Higashi-Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa"]),
    ('Shinjuku', 'S', 17, 2, ["Shinjuku", "Shinjuku-sanchome", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno"]),
    ('Oedo', 'E', 42, 2, ["Shinjuku", "Tokyo Station", "Yurakucho", "Azabudai", "Akabanebashi", "Ushigome-Kagurazaka", "Takebashi", "Iidabashi", "Yokojimma", "Kasumigaseki", "Ginza", "Dogenzaka", "Roppongi", "Kodamouryokute", "Tsukishima", "Kyobashi", "Nihonbashi", "Miyakezaka", "Hatchobori", "Tsukiji", "Shinbashi", "Kamiyamate", "Shimbashi", "Hamamatsucho", "Zojoji", "Daimon", "Onarimon", "Teiten", "Toranomon", "Shin-Osaki", "Osaki", "Shirokane-Takanawa", "Aoyama-itchome", "Roppongi", "Azabu-Juban", "Ebisu", "Shibuya", "Shinjuku-Gyoenmae", "Meiji-jingumae", "Yoyogi", "Harajuku"]),
    ('Asakusa', 'A', 14, 2, ["Oshiage", "Narihiroye", "Horifushi", "Mita", "Kaminarimon", "Asakusa"]),
    ('Yurakucho', 'Y', 20, 2, ["Wakoshi", "Higashi-Ikebukuro", "Ikebukuro", "Yushima", "Ueno", "Okachimachi", "Ginza", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tokyo", "Nihonbashi", "Makuhari-hongō", "Kayabacho", "Tsukishima", "Tokyo Dome-mae", "Kacho-mae", "Harumi-futagō", "Shin-Kiba"]),
    ('Yurikamome', 'YK', 15, 2, ["Shimbashi", "Tsukishima", "Toyosu", "Tembo", "Odaiba-Kaihinkōen", "Miraitō", "Denno", "Midosuji", "Aomi", "Tokyo Big Sight", "Daiba", "Hinode", "Kokusai-Tenjijo", "Makuhari-Seaside", "Shin-Kemigawa", "Minami-Kemigawa"]),
    ('SeibuShinjuku', 'SK', 17, 2, ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka"]),
    ('Odawara', 'OD', 35, 2, ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara"]),
    ('Keio', 'KO', 14, 3, ["Hashimoto", "Takaosanguchi", "Keio-Hachioji", "Tama-Center", "Inuyama", "Machiya", "Yomiuriland-Mae", "Korematsu", "Kokubunji", "Nakano", "Shinjuku"]),
    ('TobuIsesaki', 'TI', 46, 2, ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"]),
    ('TobuSkytree', 'TS', 46, 2, ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"]),
    ('TobuNikko', 'TN', 65, 2, ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"]),
    ('TokyuToyoko', 'TY', 20, 2, ["Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"]),
    ('YokohamaBlue', 'B', 30, 2, ["Shin-Yokohama", "Higashi-Yokohama", "Koboku-Toshi", "Minami-Yokohama", "Kajiwara", "Tsurumi", "Naka-Riverside", "Ishikawacho", "Yokohama", "Sakuragicho", "Kannai", "Motomachi-Chukagai", "Noge", "Higashi-Ogura", "Kikuna", "Shonandai", "Sagamiko", "Yamanashi", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima", "Shimoda", "Ito", "Atami", "Yugawara", "Manazuru", "Nebugawa"]),
    ('Keisei', 'KS', 33, 2, ["Nippori", "Shin-Okachimachi", "Ueno-Hibaya", "Ueno", "Asakusa", "Oshiage", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka"]),
    ('SeibuIkebukuro', 'SI', 27, 2, ["Seibu-Shinjuku", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho"]),
    ('SeibuChichibu', 'SC', 5, 3, ["Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano"]),
    ('SeibuTamako', 'SU', 8, 2, ["Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban"]),
    ('SeibuTamagawa', 'SV', 24, 2, ["Tamagawa-Onsen", "Kamakura", "Kamakura-Kotoku", "Hase", "Katase-Enoshima", "Shichirigahama", "Zushi", "Hiratsuka", "Nikaido", "Sagamiko", "Yamanashi", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima", "Shimoda", "Ito", "Atami", "Yugawara", "Manazuru", "Nebugawa", "Hayakawa"]),
    ('OdakyuEnoshima', 'OE', 21, 2, ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"]),
    ('TobuNoda', 'SN', 33, 2, ["Nippori", "Shin-Okachimachi", "Ueno-Hibaya", "Ueno", "Asakusa", "Oshiage", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka"]),
]

for name, code, dur, per_station, stations in lines:
    stations_str = ', '.join(['"' + s + '"' for s in stations])
    content_parts.append('    "' + name + '": {')
    content_parts.append('      name: "' + name + '", nameEn: "' + name + ' Line", code: "' + code + '", color: "#000000",')
    content_parts.append('      operator: "JR East", region: "Tokyo Area", type: "straight",')
    content_parts.append('      image: "images/鉄道/JR東日本/' + name + '.png", durationTotalMin: ' + str(dur * per_station) + ', throughServices: [],')
    content_parts.append('      transferStations: [],')
    content_parts.append('      stations: [' + stations_str + '],')
    content_parts.append('      durations: Array(' + str(len(stations)) + ').fill(' + str(per_station) + '),')
    content_parts.append('      branchOf: null')
    content_parts.append('    },')

# Footer
content_parts.append("""  };
})();""")

# Join and write
full_content = '\n'.join(content_parts)

path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'w', encoding='utf-8') as f:
    f.write(full_content)

print('File written, length:', len(full_content))
print('Lines:', len(lines))
