import sys
sys.stdout.reconfigure(encoding='utf-8')
import re

# Check line-control.js
with open('data/railway/line-control.js', 'r', encoding='utf-8') as f:
    lc_content = f.read()

# Find all line entries
lines_pattern = r'"([^"]+)":\s*\{'
lines_matches = re.findall(lines_pattern, lc_content)
print('Lines in line-control.js:', len(lines_matches))
for line in lines_matches:
    print(f'  - {line}')

# Check data completeness
print()
print('Data completeness check:')
for line_name in lines_matches:
    # Find the block for this line
    block_pattern = rf'"{line_name}":\s*\{{([^}}]+)\}}'
    block_match = re.search(block_pattern, lc_content)
    if block_match:
        block = block_match.group(1)
        has_delay = 'delayInfo' in block
        has_stations = 'stations:' in block
        has_image = 'image:' in block
        status = 'OK' if has_delay and has_stations and has_image else 'MISSING'
        missing = []
        if not has_delay: missing.append('delayInfo')
        if not has_stations: missing.append('stations')
        if not has_image: missing.append('image')
        print(f'  {line_name}: [{status}] {", ".join(missing) if missing else ""}')
    else:
        print(f'  {line_name}: BLOCK NOT FOUND')

# Check train-data.js
print()
with open('data/railway/train-data.js', 'r', encoding='utf-8') as f:
    train_content = f.read()

train_lines = re.findall(r'"([^"]+)":\s*\[', train_content)
print('Lines with train data:', len(train_lines))
for line in train_lines:
    print(f'  - {line}')
