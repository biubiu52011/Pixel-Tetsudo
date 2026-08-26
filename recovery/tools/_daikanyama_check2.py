import json, os
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# 1.6.3: Daikanyama - verify in candidate
print("=== Daikanyama in candidate ===")
print(f"In cand stations: {'Daikanyama' in cand['stations']}")
print(f"In cand lines refs:")
for lid, l in cand["lines"].items():
    if "Daikanyama" in l.get("stations", []):
        order = l["stations"].index("Daikanyama")
        print(f"  {lid}[{order}]")

# Check Bakuro-mae in candidate
print("\n=== Bakuro-mae in candidate ===")
candidates = [k for k in cand["stations"].keys() if "Bakur" in k or "baku" in k.lower()]
for k in candidates:
    print(f"  station: {repr(k)} -> {cand['stations'][k]}")
    nm_match = [(mk, mv) for mk, mv in cand["name_map"].items() if "Bakur" in mk]
    for mk, mv in nm_match:
        print(f"    name_map: {repr(mk)} -> {repr(mv)}")

# Check all stations referenced by lines but missing from stations dict
print("\n=== Orphan station references in candidate ===")
all_ref_stations = set()
for lid, l in cand["lines"].items():
    for s in l.get("stations", []):
        all_ref_stations.add(s)
missing = all_ref_stations - set(cand["stations"].keys())
print(f"Referenced but missing: {len(missing)}")
for s in sorted(missing):
    ref_by = [lid for lid, l in cand["lines"].items() if s in l.get("stations",[])]
    print(f"  {s} (referenced by: {', '.join(ref_by)})")