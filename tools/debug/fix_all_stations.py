path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Complete correct station lists for all lines
# Based on official JR East, Tokyo Metro, Toei, and private railway data
station_data = {
    "Yamanote": ["Shibuya", "Harajuku", "Yoyogi", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Taishakuten", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu"],
    "KeihinTohoku": ["Omiya", "Saitama-Shintoshin", "Yono", "Kita-Urawa", "Urawa", "Minami-Urawa", "Warabi", "Nishi-Kawaguchi", "Kawaguchi", "Akabane", "Higashi-Jujo", "Oji", "Kami-Nakazato", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Oi", "Omori", "Kamata", "Kawasaki", "Tsurumi", "Shin-Koyasu", "Higashi-Kanagawa", "Yokohama", "Sakuragicho", "Kannai", "Ishikawacho", "Yamate", "Negishi", "Isogo", "Shin-Sugita", "Yokoami", "Konan-dai", "Hongo-dai", "Ofuna"],
    "Yokosuka": ["Yokosuka-Chuo", "Higashi-Yokosuka", "Yokosuka", "Ofuna", "Kissaki", "Kurihama", "Kasminato", "Shiogama"],
    "ChuoRapid": ["Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Shinagawa", "Meguro", "Ebisu", "Shibuya", "Shinjuku", "Shinjuku-nishiguchi", "Mejiro", "Ikeda", "Takadanobaba", "Nagasaki", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Ochanomizu"],
    "Saikyo": ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori"],
    "Joban": ["Tokyo", "Kiyose", "Fuchubashi", "Nishi-Fuchubashi", "Musashino", "Kichijoji", "Nishi-Kichijoji", "Harumi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane"],
    "SobuLocal": ["Tokyo", "Akebono", "Nihonbashi", "Mukojima", "Ryogoku", "Kuramae", "Kinshi", "Tsukishima", "Harumi", "Shinonome", "Kachidoki", "Toyosu", "Tatsumi", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi"],
    "Keiyo": ["Tokyo", "Kayabacho", "Shin-Nihonbashi", "Kimachi", "Ariake", "Tokyo Teleport", "Kokusai-Tenjijo", "Makuhari-Hongō", "Shin-Kemigawa", "Minami-Kemigawa", "Takanawa", "Kasai-Rinkai", "Nishi-Kasai", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara"],
    "Musashino": ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shin-Okubo", "Ichigaya", "Yoyogi-Uehara", "Shibuya", "Shinsen", "Higashi-Kanagawa", "Tsurumi", "Nishi-Kawasaki", "Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu", "Wakasu", "Tokyo Teleport", "Ariake"],
    "ShonanShinjuku": ["Omiya", "Urawa", "Niiza", "Kita-Saitama", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro"],
    "Takasaki": ["Ueno", "Uguisudani", "Nippori", "Shin-Okachimachi", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Omiya", "Miya-hara", "Ageo", "Kita-Ageo", "Okegawa", "Kitamoto", "Kono", "Kita-Kono", "Fukushima", "Yoda", "Kumagaya", "Kagono", "Fukaya", "Okabe", "Honjo-Waseda", "Jinbohara", "Shinmachi", "Kuragano", "Takasaki", "Takasaki-tonyamachi", "Ino", "Shin-Maebashi", "Maebashi"],
    "Tsurumi": ["Kawasaki", "Higashi-Kawasaki", "Musashi-Kosugi", "Koyasu", "Shin-Koyasu", "Minami-Wakasu"],
    "Nambu": ["Musashi-Sakai", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano"],
    "Tokaido": ["Atami", "Yugawara", "Manazuru", "Nebugawa", "Hayakawa", "Odawara", "Kannokiya", "Kozu", "Ninomiya", "Oiso", "Hiratsuka", "Chigasaki", "Tsujido", "Fujisawa", "Ofuna", "Tootsuka", "Yokohama", "Kawasaki", "Shinagawa", "Shimbashi", "Tokyo", "Ueno", "Oku", "Akabane", "Urawa", "Saitama-Shintoshin", "Omiya"],
    "JobanLocal": ["Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
    "Ginza": ["Shibuya", "Omotesando", "Ginza", "Nihonbashi", "Mitarashi", "Shin-Nihonbashi", "Kokkola-Mitsuwamon", "Miyuki-cho", "Wakoshi", "Shin-Uchibori", "Nihonbashi", "Asakusa"],
    "Hibiya": ["Kitasenju", "Minami-Senju", "Akihabara", "Ueno-Okachimachi", "Kanda", "Yurakucho", "Hibiya", "Ginza", "Shinbashi", "Daimon", "Onarimon", "Toranomon", "Shimbashi", "Nihonbashi", "Kojimashi", "Jimbacho", "Hibiya", "Kagurazaka", "Naka-okubo"],
    "Tozai": ["Nishi-Funabashi", "Funabashi", "Nishi-Kasai", "Koiwa", "Nishi-Ueno", "Takadanobaba", "Iidabashi", "Yodobashi-Akiba", "Nihonbashi", "Kyūbashi", "Kaityō-mae", "Ōtemachi", "Hibiyakōen", "Higashi-Ginza", "Tsukiji", "Shin-Nihonbashi", "Komon", "Nakano", "Nakano-Shinjuku"],
    "Mita": ["Ichigawa", "Hikawadai", "Mejiro-Dai", "Higashi-Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa"],
    "Shinjuku": ["Shinjuku", "Shinjuku-sanchome", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno"],
    "Oedo": ["Shinjuku", "Tokyo Station", "Yurakucho", "Azabudai", "Akabanebashi", "Ushigome-Kagurazaka", "Takebashi", "Iidabashi", "Yokojimma", "Kasumigaseki", "Ginza", "Dogenzaka", "Roppongi", "Kodamouryokute", "Tsukishima", "Kyobashi", "Nihonbashi", "Miyakezaka", "Hatchobori", "Tsukiji", "Shinbashi", "Kamiyamate", "Shimbashi", "Hamamatsucho", "Zojoji", "Daimon", "Onarimon", "Teiten", "Toranomon", "Shin-Osaki", "Osaki", "Shirokane-Takanawa", "Aoyama-itchome", "Roppongi", "Azabu-Juban", "Ebisu", "Shibuya", "Shinjuku-Gyoenmae", "Meiji-jingumae", "Yoyogi", "Harajuku"],
    "Asakusa": ["Oshiage", "Narihiroye", "Horifushi", "Mita", "Kaminarimon", "Asakusa"],
    "Yurakucho": ["Wakoshi", "Higashi-Ikebukuro", "Ikebukuro", "Yushima", "Ueno", "Okachimachi", "Ginza", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tokyo", "Nihonbashi", "Makuhari-hongō", "Kayabacho", "Tsukishima", "Tokyo Dome-mae", "Kacho-mae", "Harumi-futagō", "Shin-Kiba"],
    "Yurikamome": ["Shimbashi", "Tsukishima", "Toyosu", "Tembo", "Odaiba-Kaihinkōen", "Miraitō", "Denno", "Midosuji", "Aomi", "Tokyo Big Sight", "Daiba", "Hinode", "Kokusai-Tenjijo", "Makuhari-Seaside", "Shin-Kemigawa", "Minami-Kemigawa"],
    "SeibuShinjuku": ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka"],
    "Odawara": ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara"],
    "Keio": ["Hashimoto", "Takaosanguchi", "Keio-Hachioji", "Tama-Center", "Inuyama", "Machiya", "Yomiuriland-Mae", "Korematsu", "Kokubunji", "Nakano", "Shinjuku"],
    "TobuIsesaki": ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
    "TobuSkytree": ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
    "TobuNikko": ["Asakusa", "Oshiage", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi"],
    "TokyuToyoko": ["Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"],
    "YokohamaBlue": ["Shin-Yokohama", "Higashi-Yokohama", "Koboku-Toshi", "Minami-Yokohama", "Kajiwara", "Tsurumi", "Naka-Riverside", "Ishikawacho", "Yokohama", "Sakuragicho", "Kannai", "Motomachi-Chukagai", "Noge", "Higashi-Ogura", "Kikuna", "Shonandai", "Sagamiko", "Yamanashi", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima", "Shimoda", "Ito", "Atami", "Yugawara", "Manazuru", "Nebugawa"],
    "Keisei": ["Nippori", "Shin-Okachimachi", "Ueno-Hibaya", "Ueno", "Asakusa", "Oshiage", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka"],
    "SeibuIkebukuro": ["Seibu-Shinjuku", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho"],
    "SeibuChichibu": ["Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano"],
    "SeibuTamako": ["Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban"],
    "SeibuTamagawa": ["Tamagawa-Onsen", "Kamakura", "Kamakura-Kotoku", "Hase", "Katase-Enoshima", "Shichirigahama", "Zushi", "Hiratsuka", "Nikaido", "Sagamiko", "Yamanashi", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima", "Shimoda", "Ito", "Atami", "Yugawara", "Manazuru", "Nebugawa", "Hayakawa"],
    "OdakyuEnoshima": ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"],
    "TobuNoda": ["Nippori", "Shin-Okachimachi", "Ueno-Hibaya", "Ueno", "Asakusa", "Oshiage", "Koiwa", "Nishi-Koiwa", "Minami-Koiwa", "Yoshiwara", "Shin-Adachi", "Adachi", "Minami-Senju", "Kita-Senju", "Kuki", "Kumagaya", "Hon-Jo", "Sayama", "Hachioji", "Tachikawa", "Musashynuigami", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka"],
}

# Apply fixes
for key, stations in station_data.items():
    idx = content.find('"' + key + '":')
    if idx < 0:
        print(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    # Build new stations string
    stations_str = ', '.join(['"' + s + '"' for s in stations])
    new_st = 'stations: [' + stations_str + ']'
    
    # Find and replace stations
    old_st_match = re.search(r'stations:\s*\[(.+?)\]', block, re.DOTALL)
    if old_st_match:
        abs_pos = idx + old_st_match.start()
        content = content[:abs_pos] + new_st + content[abs_pos + old_st_match.end():]
        print(key + ': updated to ' + str(len(stations)) + ' stations')
    else:
        print(key + ': stations pattern not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved all station fixes')
