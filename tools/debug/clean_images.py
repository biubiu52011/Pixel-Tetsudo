"""清理无效或重复的图片资源"""

﻿import os
base = r'C:\Users\80996\OneDrive\文档\项目\像素铁道'
img_dir = os.path.join(base, 'images')

print('=== Removing empty image files ===')
empty_files = ['ゆりかもせ', '京成電鉄', '京王電鉄', '小田急電鉄', '横浜市交通局']
for f in empty_files:
    path = os.path.join(img_dir, f)
    if os.path.exists(path):
        os.remove(path)
        print('  REMOVED: ' + f)
    else:
        print('  NOT FOUND: ' + f)

print()
print('=== Remaining images ===')
for f in sorted(os.listdir(img_dir)):
    size = os.path.getsize(os.path.join(img_dir, f))
    print('  ' + f + ': ' + str(size) + ' bytes')
