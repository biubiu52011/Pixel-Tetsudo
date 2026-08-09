import os, re

base = r'C:\Users\80996\Documents\项目\像素铁道'

# Read the root line-control.js (correct encoding)
with open(os.path.join(base, 'line-control.js'), 'r', encoding='utf-8') as f:
    content = f.read()

# Additional lines to add
additional = '''    "TamaMonorail": {
      name: "TamaMonorail", nameEn: "Tama Monorail Line", code: "T", color: "#E60012",
      operator: "Tama Monorail", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/多摩都市モノレール/多摩都市モノレール線.png", durationTotalMin: 25, throughServices: [],
      transferStations: [{"station": "Nishi-Takashimadaira", "connects": ["Musashino"]}, {"station": "Tama-Center", "connects": ["Keio"]}],
      stations: ["Nishi-Takashimadaira", "Takahashimadaira", "Higashi-Maruko", "Nishi-Fuchubashi", "Fuchubashi", "Kokubunji", "Nakano", "Shinjuku", "Shibuya", "Ebisu", "Shirokane-Takanawa", "Azabu-Juban", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori"],
      durations: Array(47).fill(1),
      branchOf: null
    },
    "Rinko": {
      name: "Rinko", nameEn: "Rinko Line", code: "R", color: "#00A0C7",
      operator: "TWR", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/東京臨海高速鉄道/臨海線.png", durationTotalMin: 12, throughServices: [],
      transferStations: [{"station": "Osaki", "connects": ["Yamanote"]}, {"station": "Shin-Kiba", "connects": ["Keiyo"]}],
      stations: ["Osaki", "Tamachi", "Kachidoki", "Toyosu", "TokyoTeleport", "Ariake", "OdaibaKaihinkoen", "Miraikai", "Denno", "Midosuji", "Aomi", "TokyoBigSight", "Daiba", "Hinode", "KokusaiTenjijo", "MakuhariSeaside", "ShinKemigawa", "MinamiKemigawa", "ShinKiba"],
      durations: Array(19).fill(1),
      branchOf: null
    },
    "HitachiNakaKaimin": {
      name: "HitachiNakaKaimin", nameEn: "Tsukuba Express", code: "TX", color: "#9C27B0",
      operator: "MIR", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/首都圏新都市鉄道/つくばエクスプレス.jpg", durationTotalMin: 45, throughServices: [],
      transferStations: [{"station": "Akihabara", "connects": ["Yamanote"]}, {"station": "Tachikawa", "connects": ["ChuoRapid"]}],
      stations: ["Akihabara", "Kanda", "Tokyo", "Yurakucho", "Shimbashi", "Hamamatsucho", "Tamachi", "Takanawa-Gateway", "Shinagawa", "Osaki", "Gotanda", "Ebisu", "Meguro", "Hiroo", "Roppongi", "Akabane", "Ikebukuro", "Nishi-Ikebukuro", "Otsuka", "Komagome", "Tabata", "Nishi-Nippori", "Nippori", "Uguisudani", "Ueno", "Okachimachi", "Kitasenju", "Shiroi", "Kamagaya", "Toride", "Abiko", "Kashiwa", "Narashino", "Funabashi", "Makuhari", "Tsukuba"],
      durations: Array(50).fill(1),
      branchOf: null
    },
'''

# Find insertion point - after last line block, before closing
marker = '  };\n  })();'
idx = content.rfind(marker)
if idx > 0:
    new_content = content[:idx] + '\n' + additional + content[idx:]
    
    # Write to both locations
    with open(os.path.join(base, 'line-control.js'), 'w', encoding='utf-8') as f:
        f.write(new_content)
    with open(os.path.join(base, 'data/railway/line-control.js'), 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Added 3 missing lines")
else:
    print("ERROR: Marker not found")
