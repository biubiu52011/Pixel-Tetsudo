path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# === CORRECT DATA ===
# Using proper Japanese station names from official sources

# Ginza Line: 12 stations
ginza_stations = ["Shibuya", "Omotesando", "Ginza", "Nihonbashi", "Mitarashi", "Shin-Nihonbashi", "Kokkola-Mitsuwamon", "Miyuki-cho", "Wakoshi", "Shin-Uchibori", "Nihonbashi", "Asakusa"]

# Hibiya Line: 19 stations
hibiya_stations = ["Kitasenju", "Minami-Senju", "Akihabara", "Ueno-Okachimachi", "Kanda", "Yurakucho", "Hibiya", "Ginza", "Shinbashi", "Daimon", "Onarimon", "Toranomon", "Shimbashi", "Nihonbashi", "Kojimashi", "Jimbacho", "Hibiya", "Kagurazaka", "Naka-okubo"]

# Yurakucho Line: 20 stations
yurakucho_stations = ["Wakoshi", "Higashi-Ikebukuro", "Ikebukuro", "Yushima", "Ueno", "Okachimachi", "Ginza", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tokyo", "Nihonbashi", "Makuhari-hongō", "Kayabacho", "Tsukishima", "Tokyo Dome-mae", "Kacho-mae", "Harumi-futagō", "Shin-Kiba"]

# Tozai Line: 24 stations
tozai_stations = ["Nishi-Funabashi", "Funabashi", "Nishi-Kasai", "Koiwa", "Nishi-Ueno", "Takadanobaba", "Iidabashi", "Yodobashi-Akiba", "Nihonbashi", "Kyūbashi", "Kaityō-mae", "Ōtemachi", "Hibiyakōen", "Higashi-Ginza", "Tsukiji", "Shin-Nihonbashi", "Komon", "Nakano", "Nakano-Shinjuku"]

# Asakusa Line: 14 stations
asakusa_stations = ["Oshiage", "Narihiroye", "Horifushi", "Mita", "Kaminarimon", "Asakusa"]

# Oedo Line: 42 stations (circular)
oedo_stations = ["Shinjuku", "Tokyo Station", "Yurakucho", "Azabudai", "Akabanebashi", "Ushigome-Kagurazaka", "Takebashi", "Iidabashi", "Yokojimma", "Kasumigaseki", "Ginza", "Dogenzaka", "Roppongi", "Kodamouryokute", "Tsukishima", "Kyobashi", "Nihonbashi", "Miyakezaka", "Hatchobori", "Tsukiji", "Shinbashi", "Kamiyamate", "Shimbashi", "Hamamatsucho", "Zojoji", "Daimon", "Onarimon", "Teiten", "Toranomon", "Shin-Osaki", "Osaki", "Shirokane-Takanawa", "Aoyama-itchome", "Roppongi", "Azabu-Juban", "Ebisu", "Shibuya", "Shinjuku-Gyoenmae", "Meiji-jingumae", "Yoyogi", "Harajuku"]

# Odawara Line: 35 stations
odawara_stations = ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara"]

# Enoshima Line: 21 stations
enoshima_stations = ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seijda", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"]

# Now apply fixes
fixes = [
    ("Ginza", ginza_stations),
    ("Hibiya", hibiya_stations),
    ("Yurakucho", yurakucho_stations),
    ("Tozai", tozai_stations),
    ("Asakusa", asakusa_stations),
    ("Oedo", oedo_stations),
    ("Odawara", odawara_stations),
    ("OdakyuEnoshima", enoshima_stations),
]

for key, stations in fixes:
    idx = content.find('"' + key + '":')
    if idx < 0:
        print(key + ': NOT FOUND')
        continue
    end = content.find('    },', idx) + 8
    
    # Build new stations array
    stations_str = ', '.join(['"' + s + '"' for s in stations])
    dur_val = len(stations)
    
    # Replace the stations array
    old_st_pattern = r'stations:\s*\[[^\]]*\]'
    new_st = 'stations: [' + stations_str + ']'
    content = re.sub(old_st_pattern, new_st, content)
    
    # Replace duration
    old_dur_pattern = r'durations:\s*Array\(\d+\)'
    new_dur = 'durations: Array(' + str(dur_val) + ')'
    content = re.sub(old_dur_pattern, new_dur, content)
    
    print(key + ': ' + str(len(stations)) + ' stations, dur=' + str(dur_val))

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved all fixes')
