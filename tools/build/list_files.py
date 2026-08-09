$path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway'
import os
files = os.listdir($path)
for f in files:
    fp = os.path.join($path, f)
    if os.path.isfile(fp):
        sz = os.path.getsize(fp)
        print(f'{f}: {sz} bytes')
