import sys, re
sys.stdout.reconfigure(encoding="utf-8")

base = r"C:\Users\80996\Documents\项目\像素道~1"

# Get all keys used in JS files
files = [
    base + r"\js\sightseeing.js",
    base + r"\js\search-ui.js",
    base + r"\js\bundle-home.js",
    base + r"\js\route-search.js",
    base + r"\js\tourism-detail.js",
]
keys = set()
for f in files:
    content = open(f, "r", encoding="utf-8").read()
    for m in re.findall(r't\("([^"]+)"\)', content):
        keys.add(m)
    for m in re.findall(r"t\(([^)]+)\)", content):
        if m.startswith('"') or m.startswith("'"):
            k = m.strip('"').strip("'")
            if k:
                keys.add(k)

# Get all keys in translations.js
trans_content = open(base + r"\js\translations.js", "r", encoding="utf-8").read()
trans_keys = set(re.findall(r'"([^"]+)":', trans_content))

# Find missing keys
missing = keys - trans_keys
extra = trans_keys - keys

print("Keys used in JS:", len(keys))
print("Keys in translations:", len(trans_keys))
print()
if missing:
    print("Missing keys:", len(missing))
    for k in sorted(missing):
        print("  MISSING:", k)
else:
    print("No missing keys!")
