path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Step 2: Fix specific station lists for problematic lines
fixes = [
    ("Ginza", ["Shibuya", "Omotesando", "Ginza", "Nihonbashi", "Mitarashi", "Shin-Nihonbashi", "Kokkola-Mitsuwamon", "Miyuki-cho", "Wakoshi", "Shin-Uchibori", "Nihonbashi", "Asakusa"]),
    ("Hibiya", ["Kitasenju", "Minami-Senju", "Akihabara", "Ueno-Okachimachi", "Kanda", "Yurakucho", "Hibiya", "Ginza", "Shinbashi", "Daimon", "Onarimon", "Toranomon", "Shimbashi", "Nihonbashi", "Kojimashi", "Jimbacho", "Hibiya", "Kagurazaka", "Naka-okubo"]),
    ("Yurakucho", ["Wakoshi", "Higashi-Ikebukuro", "Ikebukuro", "Yushima", "Ueno", "Okachimachi", "Ginza", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tokyo", "Nihonbashi", "Makuhari-hongō", "Kayabacho", "Tsukishima", "Tokyo Dome-mae", "Kacho-mae", "Harumi-futagō", "Shin-Kiba"]),
    ("Tozai", ["Nishi-Funabashi", "Funabashi", "Nishi-Kasai", "Koiwa", "Nishi-Ueno", "Takadanobaba", "Iidabashi", "Yodobashi-Akiba", "Nihonbashi", "Kyūbashi", "Kaityō-mae", "Ōtemachi", "Hibiyakōen", "Higashi-Ginza", "Tsukiji", "Shin-Nihonbashi", "Komon", "Nakano", "Nakano-Shinjuku"]),
    ("Asakusa", ["Oshiage", "Narihiroye", "Horifushi", "Mita", "Kaminarimon", "Asakusa"]),
    ("Oedo", ["Shinjuku", "Tokyo Station", "Yurakucho", "Azabudai", "Akabanebashi", "Ushigome-Kagurazaka", "Takebashi", "Iidabashi", "Yokojimma", "Kasumigaseki", "Ginza", "Dogenzaka", "Roppongi", "Kodamouryokute", "Tsukishima", "Kyobashi", "Nihonbashi", "Miyakezaka", "Hatchobori", "Tsukiji", "Shinbashi", "Kamiyamate", "Shimbashi", "Hamamatsucho", "Zojoji", "Daimon", "Onarimon", "Teiten", "Toranomon", "Shin-Osaki", "Osaki", "Shirokane-Takanawa", "Aoyama-itchome", "Roppongi", "Azabu-Juban", "Ebisu", "Shibuya", "Shinjuku-Gyoenmae", "Meiji-jingumae", "Yoyogi", "Harajuku"]),
    ("Odawara", ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara"]),
    ("OdakyuEnoshima", ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seijda", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"]),
]

for key, stations in fixes:
    idx = content.find('"' + key + '":')
    if idx < 0:
        print(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    block = content[idx:end]
    
    stations_str = ', '.join(['"' + s + '"' for s in stations])
    new_st = 'stations: [' + stations_str + ']'
    
    old_st_match = re.search(r'stations:\s*\[[^\]]*\]', block)
    if old_st_match:
        abs_pos = idx + old_st_match.start()
        content = content[:abs_pos] + new_st + content[abs_pos + old_st_match.end():]
        print(key + ': updated to ' + str(len(stations)) + ' stations')
    else:
        print(key + ': stations pattern not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Step 2 done: updated station lists')
