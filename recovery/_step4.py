import json, os, re
from datetime import datetime
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
inventory = {"timestamp": datetime.now().isoformat(), "summary": {}, "lines": {}, "stations": {}, "issues": []}
for lid, l in src.get("lines", {}).items():
    sl = l.get("stations", [])
    inventory["lines"][lid] = {"name": l.get("name"), "nameEn": l.get("nameEn"), "code": l.get("code"), "operator": l.get("operator"), "region": l.get("region"), "type": l.get("type"), "station_count": len(sl), "has_durationTotalMin": "durationTotalMin" in l, "has_image": bool(l.get("image")), "has_branchOf": l.get("branchOf") is not None, "has_throughServices": bool(l.get("throughServices")), "has_transferStations": bool(l.get("transferStations"))}
for sid, s in src.get("stations", {}).items():
    hl = "lines" in s
    inventory["stations"][sid] = {"has_lat": "lat" in s, "has_lng": "lng" in s, "has_lines": hl, "line_count": len(s.get("lines",[])) if hl else 0, "fields": list(s.keys())}
nm = src.get("name_map", {})
inventory["summary"]["name_map"] = {"total": len(nm), "sample": list(nm.items())[:5]}
sl_data = src.get("stationLines", {})
inventory["summary"]["stationLines"] = {"total": len(sl_data), "sample_keys": list(sl_data.keys())[:5]}
lso = src.get("lineStationOrder", {})
inventory["summary"]["lineStationOrder"] = {"total": len(lso), "sample_keys": list(lso.keys())[:5]}
swl = sum(1 for s in src["stations"].values() if "lines" in s)
inventory["issues"].append({"type": "missing_lines_field", "description": "Stations without lines field", "count": len(src["stations"]) - swl, "with_lines": swl, "without_lines": len(src["stations"]) - swl})
line_ids = list(src["lines"].keys())
dup_l = [x for x in line_ids if line_ids.count(x) > 1]
if dup_l: inventory["issues"].append({"type": "duplicate_line_id", "ids": sorted(set(dup_l))})
station_ids = list(src["stations"].keys())
dup_s = [x for x in station_ids if station_ids.count(x) > 1]
if dup_s: inventory["issues"].append({"type": "duplicate_station_id", "ids": sorted(set(dup_s))})
derived_sl = {}
for lid, l in src["lines"].items():
    for order, sid in enumerate(l.get("stations", [])):
        derived_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})
mismatch = 0
for sid in set(list(derived_sl.keys()) + list(sl_data.keys())):
    dk = set(x["line_id"] for x in derived_sl.get(sid, []))
    sv = sl_data.get(sid, [])
    sk = set(x["line_id"] for x in sv) if isinstance(sv, list) else set()
    if dk != sk: mismatch += 1
if mismatch: inventory["issues"].append({"type": "stationLines_mismatch", "count": mismatch})
open(os.path.join(repo,"recovery","inventory","entity_inventory_152.json"),"w",encoding="utf-8").write(json.dumps(inventory,indent=2,ensure_ascii=False)+chr(10))
print("04 done")
print("Lines:", len(src["lines"]))
print("Stations:", len(src["stations"]))
print("stationLines:", len(sl_data))
print("lineStationOrder:", len(lso))
print("Stations with lines:", swl)
print("Stations without lines:", len(src["stations"]) - swl)
print("Mismatched:", mismatch)