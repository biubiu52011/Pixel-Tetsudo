path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Extract all line blocks with name, code, stations count, duration count
line_pattern = re.compile(r'    "(\w+)":\s*\{([^}]+stations:[^\]]+\][^}]+durations:[^}]+)}', re.DOTALL)
matches = line_pattern.findall(content)

print(f'Total line entries found: {len(matches)}')
print()
print("Line Name | Code | Stations | Duration | Match")
print("-" * 60)
for name, block in matches:
    code_match = re.search(r'code: "([^"]+)"', block)
    st_match = re.search(r'stations:\s*\[([^\]]*)\]', block)
    dur_match = re.search(r'durations:\s*Array\((\d+)\)', block)
    code = code_match.group(1) if code_match else '?'
    st_count = len([s.strip().strip('"') for s in st_match.group(1).split(',') if s.strip().strip('"')]) if st_match else 0
    dur_count = int(dur_match.group(1)) if dur_match else 0
    match = "OK" if st_count == dur_count else f"MISMATCH (s={st_count},d={dur_count})"
    print(f"{name:20} | {code:4} | {st_count:8} | {dur_count:10} | {match}")
