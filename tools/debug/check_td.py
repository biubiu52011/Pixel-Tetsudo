import os, re
os.chdir(r"C:\Users\80996\Documents\项目\像素铁道")
with open("data/tourism-data.js", "r", encoding="utf-8") as f:
    text = f.read()
imgs = re.findall(r"""image:\s*"([^"]+)"""", text)
print("Image paths in tourism-data.js:")
for img in imgs:
    print(" ", img)
print("\nTotal images:", len(imgs))
