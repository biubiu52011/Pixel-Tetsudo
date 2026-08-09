path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check if we can salvage anything
import re
# Count how many unique station lists exist
st_counts = {}
for m in re.finditer(r'stations:\s*\[(.+?)\]', content, re.DOTALL):
    stations = [s.strip().strip('"') for s in m.group(1).split(',') if s.strip().strip('"')]
    key = str(len(stations)) + ':' + str(stations[:3])
    st_counts[key] = st_counts.get(key, 0) + 1

print('Station list distribution:')
for k, v in sorted(st_counts.items(), key=lambda x: -x[1]):
    print('  ' + k + ': ' + str(v) + ' times')

# Check duration distribution
dur_counts = {}
for m in re.finditer(r'durations:\s*Array\((\d+)\)', content):
    dur_counts[m.group(1)] = dur_counts.get(m.group(1), 0) + 1
print('\nDuration distribution:')
for k, v in sorted(dur_counts.items(), key=lambda x: int(x[0])):
    print('  Array(' + k + '): ' + str(v) + ' times')
