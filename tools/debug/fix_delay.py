import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('data/railway/line-control.js', 'r', encoding='utf-8') as f:
    content = f.read()
# Fix garbled text
content = content.replace('\xe4\xb8\xacs\xe5\x90\x8d\xe2\x86\x92\xe6\xb1\xa0\xe8\x88\x97', '東京→池袋')
content = content.replace('\xe8\xbd\xa6\xe8\xbe\x86\xe6\x95\x85\xe9\x9a\x9c', '車両故障')
content = content.replace('\xe5\xa4\xa7\xe5\xae\xab\xe2\x86\x92\xe6\x9d\xb1\xe4\xba\xac', '大宮→東京')
content = content.replace('\xe4\xb9\x98\xe5\xae\xa2\xe7\xa7\xaf\xe5\x8a\xa0', '乗客積加')
# Add ChuoRapid delayInfo
content = content.replace('ChuoRapid', 'ChuoRapid_TEMP')
idx = content.find('ChuoRapid_TEMP')
if idx > 0:
    dur_idx = content.find('durations: Array(42)', idx)
    if dur_idx > 0:
        line_end = content.find('\n', dur_idx)
        if line_end > 0:
            delay_info = '      delayInfo: {\"interval\": \"\xe4\xb8\xacs\xe4\xba\xac\xe2\x86\x92\xe8\x8d\xa3\xe7\x89\xa1\", \"cause\": \"\xe8\xae\xbe\xe5\xa4\x87\xe6\x95\x85\xe9\x9a\x9c\", \"trains\": [\"JC03\", \"JC07\"]},\n'
            content = content[:line_end+1] + delay_info + content[line_end+1:]
print('Fixed')
with open('data/railway/line-control.js', 'w', encoding='utf-8') as f:
    f.write(content)
