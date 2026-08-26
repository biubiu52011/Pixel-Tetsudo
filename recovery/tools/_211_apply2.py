import json, os
from datetime import datetime
repo = os.getcwd()
src = json.load(open(os.path.join(repo, "recovery", "source", "railway_152_raw.json"), "r", encoding="utf-8"))
cur = json.load(open(os.path.join(repo, "data", "core", "railway_data.json"), "r", encoding="utf-8"))

# Apply 2.1.1 resolutions directly (re-derive from source and current)
import copy
candidate = copy.deepcopy(json.load(open(os.path.join(repo, "recovery", "output", "railway_data_candidate_v2.json"), "r", encoding="utf-8")))

applied = []
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    
    # stations: Accept CURRENT
    ss = sl.get("stations", [])
    cs = cl.get("stations", [])
    if ss != cs:
        candidate["lines"][lid]["stations"] = list(cs)
        applied.append({"line": lid, "field": "stations", "action": "accept_current", "src_count": len(ss), "cur_count": len(cs)})
    
    # code: Accept CURRENT
    sc = sl.get("code", "")
    cc = cl.get("code", "")
    if sc != cc:
        candidate["lines"][lid]["code"] = cc
        applied.append({"line": lid, "field": "code", "action": "accept_current", "source": sc, "current": cc})
    
    # branchOf: Accept SOURCE if current is missing
    sb = sl.get("branchOf")
    cb = cl.get("branchOf")
    if sb != cb and sb is not None and cb is None:
        candidate["lines"][lid]["branchOf"] = sb
        applied.append({"line": lid, "field": "branchOf", "action": "restore_source", "value": sb})

# Recompute durations from resolved stations
for lid, l in candidate["lines"].items():
    stations = l.get("stations", [])
    l["durations"] = [2] * len(stations)

# Rebuild relation layer
station_lines = {}
line_station_order = {}
for lid, l in candidate["lines"].items():
    line_station_order[lid] = {}
    for order, sid in enumerate(l.get("stations", [])):
        line_station_order[lid][sid] = order
        station_lines.setdefault(sid, []).append({"line_id": lid, "station_order": order})
candidate["stationLines"] = station_lines
candidate["lineStationOrder"] = line_station_order

print(f"Applied {len(applied)} resolutions")
print(f"Lines: {len(candidate['lines'])}, Stations: {len(candidate['stations'])}")
print(f"stationLines: {len(candidate['stationLines'])}, lineStationOrder: {len(candidate['lineStationOrder'])}")

# Orphans
all_refs = set()
for l in candidate["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - set(candidate["stations"].keys())
print(f"Orphans: {len(orphans)}")

# Lost check
lost_l = sorted(set(src["lines"].keys()) - set(candidate["lines"].keys()))
lost_s = sorted(set(src["stations"].keys()) - set(candidate["stations"].keys()))
print(f"Lost lines: {lost_l}")
print(f"Lost stations: {lost_s}")

import hashlib
out_path = os.path.join(repo, "recovery", "output", "railway_data_canonical_candidate.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(candidate, f, ensure_ascii=False, indent=2)
sha = hashlib.sha256(open(out_path, "rb").read()).hexdigest().upper()
print(f"\nSHA: {sha}")
print(f"Size: {os.path.getsize(out_path)} bytes")