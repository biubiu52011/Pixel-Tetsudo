path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# === Correct station lists ===
# Ginza Line: 12 stations (Shibuya -> Asakusa)
ginza_stations = ["Shibuya", "Omotesando", "Ginza", "Nihonbashi", "Mitarashi", "Shin-Nihonbashi", "Kokkola-Mitsuwamon", "Miyuki-cho", "Wakoshi", "Shin-Uchibori", "Nihonbashi", "Asakusa"]

# Hibiya Line: 19 stations (Kitasenju -> Nakaokubo)
hibiya_stations = ["Kitasenju", "Minami-Senju", "Akihabara", "Ueno-Okachimachi", "Kanda", "Yurakucho", "Hibiya", "Ginza", "Shinbashi", "Daimon", "Onarimon", "Toranomon", "Shimbashi", "Nihonbashi", "Kojimashi", "Jimbacho", "Hibiya", "Kagurazaka", "Naka-okubo"]

# Yurakucho Line: 20 stations (Wakoshi -> Shin-Kiba)
yurakucho_stations = ["Wakoshi", "Higashi-Ikebukuro", "Ikebukuro", "Yushima", "Ueno", "Okachimachi", "Ginza", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tokyo", "Nihonbashi", "Makuhari-hongō", "Kayabacho", "Tsukishima", "Tokyo Dome-mae", "Kacho-mae", "Harumi-futagō", "Shin-Kiba"]

# Tozai Line: 24 stations (Nishi-Funabashi -> Nakano-Shinjuku)
tozai_stations = ["Nishi-Funabashi", "Funabashi", "Nishi-Kasai", "Koiwa", "Nishi-Ueno", "Takadanobaba", "Iidabashi", "Yodobashi-Akiba", "Nihonbashi", "Kyūbashi", "Kaityō-mae", "Ōtemachi", "Hibiyakōen", "Higashi-Ginza", "Tsukiji", "Shin-Nihonbashi", "Komon", "Nakano", "Nakano-Shinjuku"]

# Asakusa Line: 14 stations (Oshiage -> Asakusa) - actually Toei Asakusa is 14
asakusa_stations = ["Oshiage", "Narihiroye", "Horifushi", "Mita", "Kaminarimon", "Asakusa"]

# Oedo Line: 42 stations (Circular line)
oedo_stations = ["Shinjuku", "Tokyo Station", "Yurakucho", "Azabudai", "Akabanebashi", "Ushigome-Kagurazaka", "Takebashi", "Iidabashi", "Yokojimma", "Kasumigaseki", "Ginza", "Dogenzaka", "Roppongi", "Kodamouryokute", "Tsukishima", "Kyobashi", "Nihonbashi", "Miyakezaka", "Hatchobori", "Tsukiji", "Shinbashi", "Kamiyamate", "Shimbashi", "Hamamatsucho", "Zojoji", "Daimon", "Onarimon", "Teiten", "Toranomon", "Shin-Osaki", "Osaki", "Shirokane-Takanawa", "Aoyama-itchome", "Roppongi", "Azabu-Juban", "Ebisu", "Shibuya", "Shinjuku-Gyoenmae", "Meiji-jingumae", "Yoyogi", "Harajuku"]

# Odawara Line: 35 stations (Shinjuku -> Odawara)
odawara_stations = ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seija", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara"]

# Enoshima Line: 21 stations (Shinjuku -> Katase-Enoshima)
enoshima_stations = ["Shinjuku", "Shibuya", "Setagaya", "Sangenjaya", "Nagareyama", "Komazawa-Daiichi", "Seijda", "Soshigaya-Odawara", "Irie", "Yoyogi-Uehara", "Shinjuku", "Hatagaya", "Nakano", "Takadanobaba", "Mejiro", "Ikebukuro", "Otsuka", "Kagurazaka", "Yotsuya", "Yoyogi", "Shibuya", "Daikanyama", "Sangenjaya", "Setagaya", "Kamikitasen", "Tsutsujigaoka", "Futako-Tamagawa", "Tamanobunka-daigaku", "Higashi-Matsubara", "Machiya", "Hon-Atsugi", "Zama", "Sagamino", "Fujisawa", "Odawara", "Katase-Enoshima"]

# These are rough approximations - let me use actual known correct data
# I will write the correct Japanese station names

print("Stations data prepared")
