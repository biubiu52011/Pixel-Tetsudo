path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Correct station counts for each line (from official data)
correct_counts = {
    "Yamanote": 30,
    "KeihinTohoku": 47,
    "Yokosuka": 8,
    "ChuoRapid": 25,
    "Saikyo": 50,
    "Joban": 17,
    "SobuLocal": 19,
    "Keiyo": 17,
    "Musashino": 24,
    "ShonanShinjuku": 21,
    "Takasaki": 23,
    "Tsurumi": 6,
    "Nambu": 11,
    "Tokaido": 27,
    "JobanLocal": 17,
    "Ginza": 12,
    "Hibiya": 19,
    "Tozai": 24,
    "Mita": 16,
    "Shinjuku": 17,
    "Oedo": 42,
    "Asakusa": 14,
    "Yurikucho": 20,
    "Yurikamome": 15,
    "SeibuShinjuku": 17,
    "Odawara": 35,
    "Keio": 14,
    "TobuIsesaki": 46,
    "TobuSkytree": 46,
    "TobuNikko": 65,
    "TokyuToyoko": 20,
    "YokohamaBlue": 30,
    "Keisei": 33,
    "SeibuIkebukuro": 27,
    "SeibuChichibu": 5,
    "SeibuTamako": 8,
    "SeibuTamagawa": 24,
    "OdakyuEnoshima": 21,
    "TobuNoda": 33,
}

# Fix all duration values to match correct counts
# First, find all line blocks and fix their durations
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

fixes = 0
for start in line_starts:
    end = content.find('    },', start)
    if end < 0:
        continue
    block = content[start:end]
    name_match = re.search(r'"(\w+)"', block)
    name = name_match.group(1) if name_match else 'unknown'
    
    if name in correct_counts:
        expected_dur = correct_counts[name]
        # Find and replace duration
        dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
        if dur_match:
            current_dur = int(dur_match.group(1))
            if current_dur != expected_dur:
                old_dur = f'durations: Array({current_dur})'
                new_dur = f'durations: Array({expected_dur})'
                abs_start = start + block.find(old_dur)
                content = content[:abs_start] + new_dur + content[abs_start + len(old_dur):]
                fixes += 1
                print(name + ': dur ' + str(current_dur) + ' -> ' + str(expected_dur))

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed ' + str(fixes) + ' duration values')
