"""修复翻译数据"""

# -*- coding: utf-8 -*-
path = r"\"C:\\Users\\80996\\OneDrive\\暥瀮\\?栚\\憸慺?摴\\js\\translations.js\""
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add spot_dir.from for Japanese (first occurrence of 僶僗偱)
content = content.replace(
    "\"spot_dir.bus_from\": \"僶僗偱\",",
    "\"spot_dir.bus_from\": \"僶僗偱\",\n      \"spot_dir.from\": \"偐傜\",",
    1
)
# Add spot_dir.from for Korean (first occurrence of ??)
content = content.replace(
    "\"spot_dir.bus_from\": \"??\",",
    "\"spot_dir.bus_from\": \"??\",\n      \"spot_dir.from\": \"??\",",
    1
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")

