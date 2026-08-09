import re
with open(r'C:\Users\80996\Documents\项目\像素铁道\data\line-control.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix SobuLocal - correct stations and image
old_sobu = '''name: "総武線各駅停車", nameEn: "Sobu Local Line", code: "JB", color: "#FF9300",
        operator: "JR East", region: "Tokyo Area", type: "straight",
        image: "images/鉄道/JR東日本/総武線快速横須賀線.png", durationTotalMin: 45, throughServices: [],
        transferStations: [{"station": "秋葉原", "connects": ["Yamanote"]}, {"station": "御茶ノ水", "connects": ["ChuoRapid"]}],
        stations: ["東京", "有楽町", "新橋", "品川", "大井町", "蒲田", "池上", "大森", "矢口渡", "雪谷", "中町", "用賀", "等々力", "矢向", "登戸", "相模大野", "鹤川", "西武拝島", "拝島"],
        durations: Array(45).fill(2),
        branchOf: null'''

new_sobu = '''name: "総武線各駅停車", nameEn: "Sobu Local Line", code: "JB", color: "#FF9300",
        operator: "JR East", region: "Tokyo Area", type: "straight",
        image: "images/鉄道/JR東日本/中央快速線 青梅線 五日市線.png", durationTotalMin: 45, throughServices: [],
        transferStations: [{"station": "御茶ノ水", "connects": ["ChuoRapid"]}, {"station": "秋葉原", "connects": ["Yamanote", "Joban"]}, {"station": "御徒町", "connects": ["Yamanote"]}, {"station": "下総中山", "connects": []}],
        stations: ["御茶ノ水", "新御茶ノ水", "秋葉原", "岩本町", "日本橋", "茅場町", "門前仲町", "竹橋", "四ツ谷", "新宿", "高田馬場", "護国寺", "雑司が谷", "目白", "西巣鴨", "東巣鴨", "駒込", "田端", "西日暮里", "日暮里", "上野", "御徒町", "浅草", "蔵前", "錦糸町", "押上", "新錦糸", "小岩", "新小岩", "北小金", "西船橋", "船橋", "本八幡"],
        durations: Array(33).fill(2),
        branchOf: null'''

content = content.replace(old_sobu, new_sobu)

with open(r'C:\Users\80996\Documents\项目\像素鉄道\data\line-control.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed SobuLocal')
