import re
with open(r"data\tourism-data.js.bak", "r", encoding="utf-8") as f:
    content = f.read()
# Check pattern match
pattern = r'"([^"]+)":\s*\{\s*name:\s*"([^"]+)",\s*spots:\s*\[([\s\S]*?)\]\s*\}'
matches = list(re.finditer(pattern, content))
print("Station matches:", len(matches))
for m in matches[:3]:
    print("Station:", m.group(1), "spots length:", len(m.group(3)))
    # Count spots in this block
    spots_count = m.group(3).count('"name":')
    print("  Spots in block:", spots_count)
