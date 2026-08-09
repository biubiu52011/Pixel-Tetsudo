path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Fix 5: Replace Takasaki block with 23 stations (Omiya -> Maebashi)
idx = content.find('"Takasaki": {')
end = content.find('    },', idx) + 8

takasaki_new = '''    "Takasaki": {
      name: "高崎线", nameEn: "Takasaki Line", code: "JU", color: "#00A06E",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/JR東日本/高崎線.png", durationTotalMin: 75, throughServices: [{"line": "Tokaido", "code": "JT", "note": "上野东京线直通东海道线"}],
      transferStations: [
        {"station": "大宫", "connects": ["Yamanote", "KeihinTohoku", "Saikyo", "Joban"]},
        {"station": "宫原", "connects": []},
        {"station": "上尾", "connects": []},
        {"station": "北上尾", "connects": []},
        {"station": "桶川", "connects": []},
        {"station": "北本", "connects": []},
        {"station": "鸿巢", "connects": []},
        {"station": "北鸿巢", "connects": []},
        {"station": "吹上", "connects": []},
        {"station": "行田", "connects": []},
        {"station": "熊谷", "connects": []},
        {"station": "笼原", "connects": []},
        {"station": "深谷", "connects": []},
        {"station": "冈部", "connects": []},
        {"station": "本庄", "connects": []},
        {"station": "神保原", "connects": []},
        {"station": "新町", "connects": []},
        {"station": "仓贺野", "connects": []},
        {"station": "高崎", "connects": ["Joetsu"]},
        {"station": "高崎问屋町", "connects": []},
        {"station": "井野", "connects": []},
        {"station": "新前桥", "connects": []},
        {"station": "前桥", "connects": []}
      ],
      stations: ["大宫", "宫原", "上尾", "北上尾", "桶川", "北本", "鸿巢", "北鸿巢", "吹上", "行田", "熊谷", "笼原", "深谷", "冈部", "本庄", "神保原", "新町", "仓贺野", "高崎", "高崎问屋町", "井野", "新前桥", "前桥"],
      durations: Array(23).fill(3),
      branchOf: null
    },'''

content = content[:idx] + takasaki_new + content[end:]
print('Replaced Takasaki: 23 stations')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved step 5')
