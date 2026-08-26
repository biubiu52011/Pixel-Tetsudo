import json, os

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# 1.6.3: Daikanyama verification
print("=== Daikanyama Check ===")
print(f"In source stations: {'Daikanyama' in src['stations']}")
print(f"In current stations: {'Daikanyama' in cur['stations']}")
print(f"In candidate stations: {'Daikanyama' in cand['stations']}")

# Check which lines reference Daikanyama
print("\nLines referencing Daikanyama:")
for lid, l in src["lines"].items():
    if "Daikanyama" in l.get("stations", []):
        order = l["stations"].index("Daikanyama")
        print(f"  {lid} (order={order})")

for lid, l in cur["lines"].items():
    if "Daikanyama" in l.get("stations", []):
        order = l["stations"].index("Daikanyama")
        print(f"  [current] {lid} (order={order})")

for lid, l in cand["lines"].items():
    if "Daikanyama" in l.get("stations", []):
        order = l["stations"].index("Daikanyama")
        print(f"  [candidate] {lid} (order={order})")

# Check Bakuro-mae encoding issue
print("\n=== Bakuro-mae Encoding Check ===")
for name in ["Bakur\u014dmae", "Bakurﾅ肯ae", "Bakuromaе", "Bakurōmae"]:
    in_src = name in src["stations"]
    in_cur = name in cur["stations"]
    in_cand = name in cand["stations"]
    print(f"  {repr(name)}: src={in_src} cur={in_cur} cand={in_cand}")

# Check name_map for Bakuro-mae variants
print("\nname_map entries containing 'Bakur':")
for k, v in src["name_map"].items():
    if "Bakur" in k or "Bakur" in v:
        print(f"  src: {repr(k)} -> {repr(v)}")
for k, v in cur["name_map"].items():
    if "Bakur" in k or "Bakur" in v:
        print(f"  cur: {repr(k)} -> {repr(v)}")
for k, v in cand["name_map"].items():
    if "Bakur" in k or "Bakur" in v:
        print(f"  cand: {repr(k)} -> {repr(v)}")