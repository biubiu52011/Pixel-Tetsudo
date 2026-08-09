import re

file_path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 更新Yamanote的stations（30站）
old_stations = ' stations: ["東京", "有楽町", "新橋", "浜松町", "品川", "高輪ゲートウェイ", "池袋", "大塚", "駒込", "田端", "西日暮里", "日暮里", "鶯谷", "上野", "御徒町", "秋葉原", "神田", "淡路町", "荻窪", "中野", "高円寺", "吉祥寺", "三鷹", "武蔵小金井", "立川", "多摩動物公園", "橋本"]'
new_stations = ' stations: ["東京", "有楽町", "新橋", "浜松町", "田町", "品川", "高輪ゲートウェイ", "大崎", "五反田", "目黒", "恵比寿", "渋谷", "原宿", "代々木", "新宿", "高田馬場", "目白", "池袋", "大塚", "駒込", "巣鴨", "田端", "西日暮里", "日暮里", "鶯谷", "上野", "御徒町", "秋葉原", "神田", "淡路町"]'

if old_stations in content:
    content = content.replace(old_stations, new_stations)
    print('Updated Yamanote stations to 30')
else:
    print('ERROR: Old stations not found')

# 更新durations
content = content.replace('durations: Array(58).fill(2)', 'durations: Array(30).fill(2)', 1)
print('Updated Yamanote durations to Array(30)')

# 保存
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 验证
with open(file_path, 'r', encoding='utf-8') as f:
    verify = f.read()

errors = []
if verify.count('{') != verify.count('}'):
    errors.append(f'Brace mismatch: {{ = {verify.count("{")}, }} = {verify.count("}")}')
if verify.count('[') != verify.count(']'):
    errors.append('Bracket mismatch')
if ',,' in verify:
    errors.append('Double comma')

if errors:
    print('ERRORS:')
    for e in errors:
        print(f'  - {e}')
else:
    print('OK: All checks passed')
