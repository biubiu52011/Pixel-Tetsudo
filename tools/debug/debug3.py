import re
with open(r"data\tourism-data.js.bak", "r", encoding="utf-8") as f:
    content = f.read()
# Find all "name:" occurrences in first station block
idx = content.find('"Asakusa"')
block = content[idx:idx+1500]
names = re.findall(r'name:\s*"([^"]+)"', block)
print("Names found:", names)
