path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The fixes didn't apply. Re-apply all fixes in one script.
import re

# Fix 1: JobanLocal code JB -> JL
old = 'code: "JB", color: "#837DBE"'
new = 'code: "JL", color: "#837DBE"'
if old in content:
    content = content.replace(old, new)
    print('Fix 1: JobanLocal JB -> JL')
else:
    print('Fix 1: pattern not found')

# Fix 2: duration mismatches
line_starts = []
idx = 0
while True:
    pos = content.find('    "', idx)
    if pos < 0:
        break
    bracket = content.find(':', pos)
    if bracket > pos and bracket < pos + 30:
        line_starts.append(pos)
    idx = pos + 1

fixes2 = 0
for start in line_starts:
    end = content.find('    },', start)
    if end < 0:
        continue
    block = content[start:end]
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
    if st_match and dur_match:
        stations = [s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]
        dur = int(dur_match.group(1))
        if len(stations) != dur:
            old_dur = f'durations: Array({dur})'
            new_dur = f'durations: Array({len(stations)})'
            abs_start = start + block.find(old_dur)
            content = content[:abs_start] + new_dur + content[abs_start + len(old_dur):]
            fixes2 += 1
print(f'Fix 2: {fixes2} duration mismatches fixed')

# Fix 3: KeihinTohoku - expand to 47 stations with 根岸
idx = content.find('"KeihinTohoku": {')
if idx >= 0:
    end = content.find('    },', idx) + 8
    keihin_new = """    "KeihinTohoku": {
      name: "京浜東北・根岸線", nameEn: "Keihin-Tohoku Line", code: "JK", color: "#00A54F",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/JR東日本/京浜東北線.png", durationTotalMin: 70, throughServices: [{"line": "Joban", "code": "JL", "note": "常磐快速直通"}],
      transferStations: [
        {"station": "大宫", "connects": ["Joban"]},
        {"station": "与野", "connects": []},
        {"station": "北浦和", "connects": []},
        {"station": "浦和", "connects": []},
        {"station": "南浦和", "connects": ["Musashino"]},
        {"station": "蕨", "connects": []},
        {"station": "西川口", "connects": []},
        {"station": "川口", "connects": []},
        {"station": "赤羽", "connects": ["Utsunomiya", "Takasaki"]},
        {"station": "东十条", "connects": []},
        {"station": "王子", "connects": []},
        {"station": "上中里", "connects": []},
        {"station": "田端", "connects": ["Yamanote"]},
        {"station": "西日暮里", "connects": ["Yamanote", "Chiyoda"]},
        {"station": "日暮里", "connects": ["Yamanote", "Ginza", "Chiyoda"]},
        {"station": "莺谷", "connects": ["Yamanote"]},
        {"station": "上野", "connects": ["Yamanote", "Ginza", "Chiyoda", "Utsunomiya", "Takasaki"]},
        {"station": "御徒町", "connects": ["Yamanote", "Ginza"]},
        {"station": "秋叶原", "connects": ["Yamanote"]},
        {"station": "神田", "connects": ["Yamanote"]},
        {"station": "东京", "connects": ["Yamanote", "Marunouchi", "Chuo", "Keiyo", "Hibiya", "Ginza"]},
        {"station": "有乐町", "connects": ["Yamanote", "Marunouchi"]},
        {"station": "新桥", "connects": ["Yamanote", "Ginza", "Asakusa"]},
        {"station": "滨松町", "connects": ["Yamanote", "Keiyo"]},
        {"station": "田町", "connects": ["Yamanote", "Asakusa"]},
        {"station": "高轮Gateway", "connects": ["Yamanote"]},
        {"station": "品川", "connects": ["Yamanote", "Yokosuka"]},
        {"station": "大井町", "connects": ["Nambu"]},
        {"station": "大森", "connects": []},
        {"station": "蒲田", "connects": ["Meguro"]},
        {"station": "川崎", "connects": ["Nambu"]},
        {"station": "鹤见", "connects": ["Tsurumi"]},
        {"station": "新子安", "connects": []},
        {"station": "东神奈川", "connects": []},
        {"station": "横滨", "connects": ["Yokohama", "Blue"]},
        {"station": "樱木町", "connects": ["Blue"]},
        {"station": "关内", "connects": []},
        {"station": "石川町", "connects": []},
        {"station": "山手", "connects": []},
        {"station": "根岸", "connects": []},
        {"station": "矶子", "connects": []},
        {"station": "新杉田", "connects": []},
        {"station": "洋光台", "connects": []},
        {"station": "港南台", "connects": []},
        {"station": "本乡台", "connects": []},
        {"station": "大船", "connects": ["Sagami"]}
      ],
      stations: ["大宫", "さいたま新都心", "与野", "北浦和", "浦和", "南浦和", "蕨", "西川口", "川口", "赤羽", "东十条", "王子", "上中里", "田端", "西日暮里", "日暮里", "莺谷", "上野", "御徒町", "秋叶原", "神田", "东京", "有乐町", "新桥", "滨松町", "田町", "高轮Gateway", "品川", "大井町", "大森", "蒲田", "川崎", "鹤见", "新子安", "东神奈川", "横滨", "樱木町", "关内", "石川町", "山手", "根岸", "矶子", "新杉田", "洋光台", "港南台", "本乡台", "大船"],
      durations: Array(47).fill(3),
      branchOf: null
    },"""
    content = content[:idx] + keihin_new + content[end:]
    print('Fix 3: KeihinTohoku expanded to 47 stations')
else:
    print('Fix 3: KeihinTohoku not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved after fixes 1-3')
