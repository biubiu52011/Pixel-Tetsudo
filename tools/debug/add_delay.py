import sys
sys.stdout.reconfigure(encoding='utf-8')

lines = open('data/railway/line-control.js', encoding='utf-8').readlines()

# Yamanote - line 19 (0-indexed: 18)
delay_yamanote = '      delayInfo: {\"interval\": \"\u6771\u4eac\u2192\u6c60\u888b\", \"cause\": \"\u8eca\u8f86\u6545\u969c\", \"trains\": [\"JY05\", \"JY10\"]},\n'
lines.insert(19, delay_yamanote)

# KeihinTohoku - now at line 30 (was 28, shifted by 1)
delay_keihin = '      delayInfo: {\"interval\": \"\u5927\u5bae\u2192\u6771\u4eac\", \"cause\": \"\u4e58\u5ba2\u79ef\u52a0\", \"trains\": [\"JK04\", \"JK10\"]},\n'
lines.insert(30, delay_keihin)

# ChuoRapid
for i, line in enumerate(lines):
    if 'ChuoRapid' in line:
        for j in range(i, min(i+20, len(lines))):
            if 'durations: Array(42)' in lines[j]:
                delay_chuo = '      delayInfo: {\"interval\": \"\u6771\u4eac\u2192\u8377\u7261\", \"cause\": \"\u8bbe\u5907\u6545\u969c\", \"trains\": [\"JC03\", \"JC07\"]},\n'
                lines.insert(j+1, delay_chuo)
                print('Added delayInfo to ChuoRapid at line ' + str(j+2))
                break
        break

open('data/railway/line-control.js', 'w', encoding='utf-8').writelines(lines)
print('Done')
