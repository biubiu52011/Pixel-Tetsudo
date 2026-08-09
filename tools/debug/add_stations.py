filepath = 'C:/Users/80996/Documents/项目/像素铁道/js/translations.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add missing English station name translations
missing = """    "station_names.Shinjuku": "新宿",
    "station_names.Ueno": "上野",
    "station_names.Ginza": "银座",
    "station_names.Shimbashi": "新桥",
    "station_names.Akihabara": "秋叶原",
    "station_names.Harajuku": "原宿",
    "station_names.Tokyo": "东京",
    "station_names.Aoyama": "青山",
    "station_names.Roppongi": "六本木",
"""

# Insert after the last English station name
insert_after = '"station_names.Nikko": "日光",'
if insert_after in content:
    idx = content.find(insert_after)
    idx = content.find('\n', idx) + 1
    content = content[:idx] + missing + content[idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added missing station names')
else:
    print('Could not find insertion point')
