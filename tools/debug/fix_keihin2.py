path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Fix 3: Replace KeihinTohoku block with 47 stations (includes 根岸線)
idx = content.find('"KeihinTohoku": {')
end = content.find('    },', idx) + 8
old_block = content[idx:end]
print('OLD KeihinTohoku stations:', len([s for s in old_block.split(',') if '站' in s or '駅' in s or '宫' in s]))

keihin_new = '''    "KeihinTohoku": {
      name: "京浜東北・根岸線", nameEn: "Keihin-Tohoku Line", code: "JK", color: "#00A54F",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/JR東日本/京浜東北線.png", durationTotalMin: 70, throughServices: [{"line": "Joban", "code": "JL", "note": "常磐快速直通"}],
      transferStations: [
        {"station": "大宮", "connects": ["Joban"]},
        {"station": "与野", "connects": []},
        {"station": "北浦和", "connects": []},
        {"station": "浦和", "connects": []},
        {"station": "南浦和", "connects": ["Musashino"]},
        {"station": "蕨", "connects": []},
        {"station": "西川口", "connects": []},
        {"station": "川口", "connects": []},
        {"station": "赤羽", "connects": ["Utsunomiya", "Takasaki"]},
        {"station": "東十条", "connects": []},
        {"station": "王子", "connects": []},
        {"station": "上中里", "connects": []},
        {"station": "田端", "connects": ["Yamanote"]},
        {"station": "西日暮里", "connects": ["Yamanote", "Chiyoda"]},
        {"station": "日暮里", "connects": ["Yamanote", "Ginza", "Chiyoda"]},
        {"station": "鶯谷", "connects": ["Yamanote"]},
        {"station": "上野", "connects": ["Yamanote", "Ginza", "Chiyoda", "Utsunomiya", "Takasaki"]},
        {"station": "御徒町", "connects": ["Yamanote", "Ginza"]},
        {"station": "秋葉原", "connects": ["Yamanote"]},
        {"station": "神田", "connects": ["Yamanote"]},
        {"station": "東京", "connects": ["Yamanote", "Marunouchi", "Chuo", "Keiyo", "Hibiya", "Ginza"]},
        {"station": "有楽町", "connects": ["Yamanote", "Marunouchi"]},
        {"station": "新橋", "connects": ["Yamanote", "Ginza", "Asakusa"]},
        {"station": "浜松町", "connects": ["Yamanote", "Keiyo"]},
        {"station": "田町", "connects": ["Yamanote", "Asakusa"]},
        {"station": "高輪ゲートウェイ", "connects": ["Yamanote"]},
        {"station": "品川", "connects": ["Yamanote", "Yokosuka"]},
        {"station": "大井町", "connects": ["Nambu"]},
        {"station": "大森", "connects": []},
        {"station": "蒲田", "connects": ["Meguro"]},
        {"station": "川崎", "connects": ["Nambu"]},
        {"station": "鶴見", "connects": ["Tsurumi"]},
        {"station": "新子安", "connects": []},
        {"station": "東神奈川", "connects": []},
        {"station": "横浜", "connects": ["Yokohama", "Blue"]},
        {"station": "桜木町", "connects": ["Blue"]},
        {"station": "関内", "connects": []},
        {"station": "石川町", "connects": []},
        {"station": "山手", "connects": []},
        {"station": "根岸", "connects": []},
        {"station": "磯子", "connects": []},
        {"station": "新杉田", "connects": []},
        {"station": "洋光台", "connects": []},
        {"station": "港南台", "connects": []},
        {"station": "本郷台", "connects": []},
        {"station": "大船", "connects": ["Sagami"]}
      ],
      stations: ["大宮", "さいたま新都心", "与野", "北浦和", "浦和", "南浦和", "蕨", "西川口", "川口", "赤羽", "東十条", "王子", "上中里", "田端", "西日暮里", "日暮里", "鶯谷", "上野", "御徒町", "秋葉原", "神田", "東京", "有楽町", "新橋", "浜松町", "田町", "高輪ゲートウェイ", "品川", "大井町", "大森", "蒲田", "川崎", "鶴見", "新子安", "東神奈川", "横浜", "桜木町", "関内", "石川町", "山手", "根岸", "磯子", "新杉田", "洋光台", "港南台", "本郷台", "大船"],
      durations: Array(47).fill(3),
      branchOf: null
    },'''

content = content[:idx] + keihin_new + content[end:]
print('Replaced KeihinTohoku: 47 stations')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved step 3')
