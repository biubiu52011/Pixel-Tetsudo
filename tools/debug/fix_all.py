import re

with open('C:/Users/80996/Documents/项目/像素铁道/data/railway/line-control.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix empty image path for Keio
content = content.replace('image: "images/鉄道/"', 'image: "images/鉄道/京王電鉄/山口線.png"')

# Add new lines before closing
new_lines = '''
    "Rinko": {
      name: "Rinko", nameEn: "Rinko Line", code: "R", color: "#00A0C7",
      operator: "TWR", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/東京臨海高速鉄道/臨海線.png", durationTotalMin: 12, throughServices: [],
      transferStations: [{"station": "Osaki", "connects": ["Yamanote"]}, {"station": "Shin-Kiba", "connects": ["Keiyo"]}],
      stations: ["Osaki", "Tamachi", "Kachidoki", "Toyosu", "TokyoTeleport", "Ariake", "OdaibaKaihinkoen", "Miraikai", "Denno", "Midosuji", "Aomi", "TokyoBigSight", "Daiba", "Hinode", "KokusaiTenjijo", "MakuhariSeaside", "ShinKemigawa", "MinamiKemigawa", "ShinKiba"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "TamaMonorail": {
      name: "TamaMonorail", nameEn: "Tama Monorail Line", code: "T", color: "#E60012",
      operator: "Tama Monorail", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/多摩都市モノレール/多摩都市モノレール線.png", durationTotalMin: 25, throughServices: [],
      transferStations: [{"station": "Nishi-Takashimadaira", "connects": ["Musashino"]}, {"station": "Tama-Center", "connects": ["Keio"]}],
      stations: ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori"],
      durations: Array(47).fill(1),
      branchOf: null
    },
    "HitachiNakaKaimin": {
      name: "HitachiNakaKaimin", nameEn: "Tsukuba Express", code: "TX", color: "#9C27B0",
      operator: "MIR", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/首都圏新都市鉄道/筑波快線.png", durationTotalMin: 45, throughServices: [],
      transferStations: [{"station": "Akihabara", "connects": ["Yamanote"]}, {"station": "Tachikawa", "connects": ["ChuoRapid"]}],
      stations: ["Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Kitasenju", "Shiroi", "Kamagaya", "Toride", "Abiko", "Kashiwa", "Narashino", "Funabashi", "Makuhari", "Tsukuba"],
      durations: Array(50).fill(1),
      branchOf: null
    },
'''

# Insert before closing
content = content.replace('  };\n})();', new_lines + '  };\n})();')

# Fix operators
op_map = {
    'Ginza': 'Tokyo Metro', 'Hibiya': 'Tokyo Metro', 'Tozai': 'Tokyo Metro', 'Yurakucho': 'Tokyo Metro',
    'Mita': 'Toei', 'Shinjuku': 'Toei', 'Oedo': 'Toei', 'Asakusa': 'Toei',
    'Yurikamome': 'Yurikamome', 'SeibuShinjuku': 'Seibu', 'SeibuIkebukuro': 'Seibu',
    'SeibuChichibu': 'Seibu', 'SeibuTamako': 'Seibu', 'SeibuTamagawa': 'Seibu',
    'Odawara': 'Odakyu', 'OdakyuEnoshima': 'Odakyu', 'Keio': 'Keio',
    'TobuIsesaki': 'Tobu', 'TobuSkytree': 'Tobu', 'TobuNikko': 'Tobu', 'TobuNoda': 'Tobu',
    'TokyuToyoko': 'Tokyu', 'YokohamaBlue': 'Yokohama', 'Keisei': 'Keisei'
}

lines = content.split('\n')
in_block = False
current_key = None

for i, line in enumerate(lines):
    m = re.match(r'^\s*"([A-Za-z]+)"[:\s]', line)
    if m:
        current_key = m.group(1)
        in_block = True
    if in_block and 'operator: "JR East"' in line and current_key in op_map:
        lines[i] = line.replace('operator: "JR East"', f'operator: "{op_map[current_key]}"')

content = '\n'.join(lines)

with open('C:/Users/80996/Documents/项目/像素铁道/data/railway/line-control.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('All fixes applied!')
