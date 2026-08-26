import json, os
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))

# Fix: Lines with empty name should get name from nameEn as fallback
# Or mark as needs_review
fixed = 0
for lid, l in cand["lines"].items():
    if not l.get("name") and l.get("nameEn"):
        l["name"] = l["nameEn"]
        fixed += 1

print(f"Fixed {fixed} lines by copying nameEn to name")

# Re-validate
errors = []
warnings = []
for lid, l in cand["lines"].items():
    if not l.get("name"):
        errors.append(f"line.{lid}: Missing name")
    if not l.get("stations") or not isinstance(l["stations"], list):
        errors.append(f"line.{lid}: Invalid stations")

for sid, s in cand["stations"].items():
    if not isinstance(s, dict) or "lat" not in s or "lng" not in s:
        errors.append(f"station.{sid}: Invalid coords")

print(f"Post-fix errors: {len(errors)}")
for e in errors[:5]:
    print(f"  {e}")

# Save fixed candidate
out_path = os.path.join(repo, "recovery", "output", "railway_data_canonical_candidate.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(cand, f, ensure_ascii=False, indent=2)

# Recompute relation layer after fix
station_lines = {}
line_station_order = {}
for lid, l in cand["lines"].items():
    line_station_order[lid] = {}
    for order, sid in enumerate(l.get("stations", [])):
        line_station_order[lid][sid] = order
        station_lines.setdefault(sid, []).append({"line_id": lid, "station_order": order})
cand["stationLines"] = station_lines
cand["lineStationOrder"] = line_station_order

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(cand, f, ensure_ascii=False, indent=2)

import hashlib
sha = hashlib.sha256(open(out_path,"rb").read()).hexdigest().upper()
print(f"\nFixed candidate SHA: {sha}")
print(f"Size: {os.path.getsize(out_path)}")
print(f"Lines: {len(cand['lines'])}, Stations: {len(cand['stations'])}")