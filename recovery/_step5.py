import json, os
from datetime import datetime
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

inv = {"timestamp": datetime.now().isoformat(), "source": "railway_152_raw.json", "lines": {}, "stations": {}, "name_map_summary": {}, "stationLines_summary": {}, "lineStationOrder_summary": {}}

# Line entity inventory
for lid, l in src["lines"].items():
    stations = l.get("stations", [])
    inv["lines"][lid] = {
        "entity_id": lid,
        "source": "railway_152_raw.json",
        "fields_present": sorted(l.keys()),
        "fields_missing": [],
        "station_count": len(stations),
        "first_station": stations[0] if stations else None,
        "last_station": stations[-1] if stations else None,
        "operator": l.get("operator"),
        "code": l.get("code"),
        "type": l.get("type"),
    }

# Station entity inventory
for sid, s in src["stations"].items():
    inv["stations"][sid] = {
        "entity_id": sid,
        "source": "railway_152_raw.json",
        "fields_present": sorted(s.keys()),
        "has_lat": "lat" in s,
        "has_lng": "lng" in s,
        "has_lines": "lines" in s,
        "line_count": len(s["lines"]) if "lines" in s else 0,
        "lat": s.get("lat"),
        "lng": s.get("lng"),
    }

inv["name_map_summary"] = {"total": len(src.get("name_map", {}))}
inv["stationLines_summary"] = {"total": len(src.get("stationLines", {}))}
inv["lineStationOrder_summary"] = {"total": len(src.get("lineStationOrder", {}))}

open(os.path.join(repo,"recovery","inventory","entity_inventory_152_full.json"),"w",encoding="utf-8").write(json.dumps(inv,indent=2,ensure_ascii=False)+chr(10))
print("05 done - entity inventory written")
print("Lines:", len(inv["lines"]))
print("Stations:", len(inv["stations"]))