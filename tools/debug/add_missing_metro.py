path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Add missing Tokyo Metro lines before the closing };
# Find the position before };
close_pos = content.rfind('  };')
if close_pos < 0:
    close_pos = content.rfind('};')
print('Close position:', close_pos)
print('Context:', repr(content[close_pos-50:close_pos+20]))

# New lines to add
new_lines = '''
    "Marunouchi": {
      name: "丸ノ内線", nameEn: "Marunouchi Line", code: "M", color: "#F6271C",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/東京メトロ/丸ノ内線.png", durationTotalMin: 45, throughServices: [],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Ikebukuro", "connects": ["Yamanote"]}, {"station": "Tokyo", "connects": ["Yamanote"]}, {"station": "Otemachi", "connects": ["Tozai"]}],
      stations: ["Machida", "Nakamurabashi", "Akabane-Iwabuchi", "Minami-Urawa", "Urawa", "Nishi-Urawa", "Omiya", "Kitasaitama", "Kuki", "Kumagaya", "HonJo", "Sayama", "Hachioji", "Tachikawa", "Musashi-Nagasaki", "Kokubunji", "Nakano", "Shinjuku", "Shinjuku-sanchome", "Ginza", "Shibuya", "Mejiro", "Takadanobaba", "Ikebukuro"],
      durations: Array(24).fill(2),
      branchOf: null
    },
    "Chiyoda": {
      name: "千代田線", nameEn: "Chiyoda Line", code: "C", color: "#9C68C8",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/東京メトロ/千代田線.png", durationTotalMin: 40, throughServices: [],
      transferStations: [{"station": "Otemachi", "connects": ["Tozai"]}, {"station": "Yurakucho", "connects": ["Yurakucho"]}, {"station": "Akabane", "connects": ["Joban"]}, {"station": "Kita-Senju", "connects": ["Joban"]}],
      stations: ["Yoyogi-Uehara", "Shinjuku", "Hitotsubashi", "Kudanshita", "Jimbocho", "Otemachi", "Yurakucho", "Hibiya", "Kojimashi", "Kajimachi", "Mito", "Iwatsu", "Kitasenju", "Sakuragi", "Yanauchi", "Shirokane", "Aoyama", "Gaien", "Meiji-jingumae", "Yoyogi", "Harajuku"],
      durations: Array(20).fill(2),
      branchOf: null
    },
    "Hanzomon": {
      name: "半蔵門線", nameEn: "Hanzomon Line", code: "Z", color: "#843C8E",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/東京メトロ/半蔵門線.png", durationTotalMin: 30, throughServices: [],
      transferStations: [{"station": "Shibuya", "connects": ["Ginza"]}, {"station": "Otemachi", "connects": ["Marunouchi"]}, {"station": "Shimoesaka", "connects": ["Asakusa"]}, {"station": "Oshiage", "connects": ["Asakusa"]}],
      stations: ["Shibuya", "Omotesando", "Aoyama-itchome", "Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Kojimachi", "Ichigaya", "Nagatacho", "Akasaka-mitsuke", "Ginza", "Wakashi", "Oshiage"],
      durations: Array(15).fill(2),
      branchOf: null
    },
    "Namboku": {
      name: "南北線", nameEn: "Namboku Line", code: "N", color: "#00A54F",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/東京メトロ/南北線.png", durationTotalMin: 35, throughServices: [{"line": "TokyoSakura", "code": "T", "note": "都营浅草线直通"}],
      transferStations: [{"station": "Meguro", "connects": ["Mita"]}, {"station": "Akabane-Iwabuchi", "connects": ["Marunouchi"]}, {"station": "Shin-Otsuka", "connects": ["Fukutoshin"]}],
      stations: ["Meguro", "Meguro-Dai", "Shirokanedai", "Nakameguro", "Shibuya", "Omotesando", "Aoyama-itchome", " Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Kojimachi", "Ichigaya", "Nagatacho", "Akabane-Iwabuchi"],
      durations: Array(16).fill(2),
      branchOf: null
    },
    "Fukutoshin": {
      name: "副都心線", nameEn: "Fukutoshin Line", code: "F", color: "#965925",
      operator: "Tokyo Metro", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/東京メトロ/副都心線.png", durationTotalMin: 40, throughServices: [{"line": "TokyuToyoko", "code": "TY", "note": "东横線直通"}],
      transferStations: [{"station": "Shinjuku", "connects": ["Yamanote"]}, {"station": "Shibuya", "connects": ["Ginza"]}, {"station": "Ikebukuro", "connects": ["Yamanote"]}, {"station": "Waseda", "connects": []}],
      stations: ["Waseda", "Shin-Okubo", "Shinjuku-sanchome", "Shinjuku", "Shibuya", "Omotesando", "Aoyama-itchome", "Kamiyacho", "Hanzomon", "Otemachi", "Kudanshita", "Jimbocho", "Kojimachi", "Ichigaya", "Nagatacho", "Akabane-Iwabuchi", "Kita-Senju"],
      durations: Array(17).fill(2),
      branchOf: null
    },'''

# Insert before the closing };
new_content = content[:close_pos] + new_lines + content[close_pos:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Added 5 missing lines')
print('New file length:', len(new_content))
