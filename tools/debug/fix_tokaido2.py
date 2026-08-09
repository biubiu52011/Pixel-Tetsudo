path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Fix 4: Replace Tokaido block with 27 stations (Atami -> Omiya via Ueno-Tokyo)
idx = content.find('"Tokaido": {')
end = content.find('    },', idx) + 8
print('OLD Tokaido at:', idx)

tokaido_new = '''    "Tokaido": {
      name: "東海道線", nameEn: "Tokaido Line", code: "JT", color: "#FF9300",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/JR東日本/東海道線.png", durationTotalMin: 85, throughServices: [{"line": "Takasaki", "code": "JU", "note": "上野东京线直通高崎线"}],
      transferStations: [
        {"station": "热海", "connects": ["Ito"]},
        {"station": "汤河原", "connects": []},
        {"station": "真鹤", "connects": []},
        {"station": "根府川", "connects": []},
        {"station": "早川", "connects": []},
        {"station": "小田原", "connects": ["Odawara"]},
        {"station": "鸭宫", "connects": []},
        {"station": "国府津", "connects": []},
        {"station": "二宫", "connects": []},
        {"station": "大矶", "connects": []},
        {"station": "平冢", "connects": []},
        {"station": "茅崎", "connects": []},
        {"station": "辻堂", "connects": []},
        {"station": "藤泽", "connects": []},
        {"station": "大船", "connects": ["Sagami"]},
        {"station": "户塚", "connects": []},
        {"station": "横浜", "connects": ["KeihinTohoku", "Blue"]},
        {"station": "川崎", "connects": ["Nambu", "KeihinTohoku"]},
        {"station": "品川", "connects": ["Yamanote", "KeihinTohoku"]},
        {"station": "新桥", "connects": ["Yamanote", "Ginza", "Asakusa"]},
        {"station": "东京", "connects": ["Yamanote", "Marunouchi", "Chuo", "Keiyo", "Hibiya", "Ginza"]},
        {"station": "上野", "connects": ["Yamanote", "Joban", "Ginza", "Chiyoda"]},
        {"station": "尾久", "connects": []},
        {"station": "赤羽", "connects": ["Yamanote", "KeihinTohoku", "Saikyo"]},
        {"station": "浦和", "connects": ["Yamanote", "KeihinTohoku"]},
        {"station": "埼玉新都心", "connects": ["Yamanote", "KeihinTohoku"]},
        {"station": "大宫", "connects": ["Yamanote", "KeihinTohoku", "Takasaki", "Saikyo", "Joban"]}
      ],
      stations: ["热海", "汤河原", "真鹤", "根府川", "早川", "小田原", "鸭宫", "国府津", "二宫", "大矶", "平冢", "茅崎", "辻堂", "藤泽", "大船", "户塚", "横浜", "川崎", "品川", "新桥", "东京", "上野", "尾久", "赤羽", "浦和", "埼玉新都心", "大宫"],
      durations: Array(27).fill(3),
      branchOf: null
    },'''

content = content[:idx] + tokaido_new + content[end:]
print('Replaced Tokaido: 27 stations')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved step 4')
