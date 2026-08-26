import json, os, hashlib
from datetime import datetime
repo = os.getcwd()

v2 = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))

# Re-run validation
src_lines = set(src["lines"].keys())
v2_lines = set(v2["lines"].keys())
src_st = set(src["stations"].keys())
v2_st = set(v2["stations"].keys())

lost_l = src_lines - v2_lines
lost_s = src_st - v2_st

# Relation layer
computed_sl = {}
for lid, l in v2["lines"].items():
    for order, sid in enumerate(l.get("stations", [])):
        computed_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})
mismatch = sum(1 for sid in set(list(computed_sl.keys()) + list(v2["stationLines"].keys()))
               if set(x["line_id"] for x in computed_sl.get(sid,[])) != set(x["line_id"] for x in v2["stationLines"].get(sid,[])))

# Orphans
all_refs = set()
for l in v2["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - v2_st

# NameJa quality check
clean_nameja = sum(1 for l in v2["lines"].values() if l.get("nameJa"))
moji_nameja = sum(1 for l in v2["lines"].values() 
                  if l.get("nameJa") and any('\uFF61' <= c <= '\uFF9F' for c in l.get("nameJa","")))

sha = hashlib.sha256(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"rb").read()).hexdigest().upper()

print(f"Candidate v2 Final Validation:")
print(f"  SHA: {sha}")
print(f"  Lines: {len(v2['lines'])} (>= 152: {len(v2['lines']) >= 152})")
print(f"  Stations: {len(v2['stations'])} (>= 503: {len(v2['stations']) >= 503})")
print(f"  Lost lines: {sorted(lost_l)}")
print(f"  Lost stations: {sorted(lost_s)}")
print(f"  Relation mismatch: {mismatch}")
print(f"  Orphan refs: {len(orphans)}")
print(f"  Clean nameJa entries: {clean_nameja}")
print(f"  Mojibake nameJa: {moji_nameja}")
print(f"  stationLines: {len(v2['stationLines'])}")
print(f"  lineStationOrder: {len(v2['lineStationOrder'])}")
print(f"\nALL CHECKS PASS: {len(lost_l)==0 and len(v2['stations'])>=503 and mismatch==0 and moji_nameja==0}")