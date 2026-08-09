path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Fix 4: Replace Tokaido block
idx = content.find('"Tokaido": {')
if idx < 0:
    idx = content.find('"Tokaido":')
    if idx >= 0:
        # Find the opening brace
        brace = content.find('{', idx)
        idx = brace

if idx >= 0:
    end = content.find('    },', idx) + 8
    old_len = end - idx
    print('Old Tokaido block length:', old_len)
    
    tokaido_new = """    "Tokaido": {
      name: "东海道线", nameEn: "Tokaido Line", code: "JT", color: "#FF9300",
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
    },"""
    
    content = content[:idx] + tokaido_new + content[end:]
    print('Fixed Tokaido: ' + str(len(tokaido_new)) + ' chars')
else:
    print('Tokaido not found')

# Fix 5: Replace Takasaki block
idx2 = content.find('"Takasaki": {')
if idx2 < 0:
    idx2 = content.find('"Takasaki":')
    if idx2 >= 0:
        brace = content.find('{', idx2)
        idx2 = brace

if idx2 >= 0:
    end2 = content.find('    },', idx2) + 8
    old_len2 = end2 - idx2
    
    takasaki_new = """    "Takasaki": {
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
    },"""
    
    content = content[:idx2] + takasaki_new + content[end2:]
    print('Fixed Takasaki: ' + str(len(takasaki_new)) + ' chars')
else:
    print('Takasaki not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved all fixes')
print('New file length:', len(content))
