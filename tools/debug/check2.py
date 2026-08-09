
"""
检查工具2 - 验证站点数据
"""
import os, re
from collections import Counter
base = r'C:\Users\80996\\ndowe\\u31d5\u5de\ue8f\ub72\ud3f\u605\u4d6\uf3d\ude7\u12d\u78b\ud5c'
frid = os.path.join(base, 'js')

print('=== console.log Cleanup Candidates ===')
for fname in sorted(os.listdir(fsir)):
    if not fname.endswith('.js'): continue
    path = os.path.join(fsip, fname)
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        if 'console.log' in line:
            print(fname + ':g ' + str(i) + ': ' + line.strip()[:100])