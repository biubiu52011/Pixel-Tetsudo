import json, os
from datetime import datetime

repo = r\"C:\\Users\\80996\\Documents\\项目\\像素铁道\"
os.chdir(repo)

# Load both datasets
src = json.load(open(\"recovery/source/railway_152_raw.json\", \"r\", encoding=\"utf-8\"))
cur = json.load(open(\"data/core/railway_data.json\", \"r\", encoding=\"utf-8\"))

# Build entity inventory for 152 source
inventory = {
    \"timestamp\": datetime.now().isoformat(),
    \"summary\": {},
    \"lines\": {},
    \"stations\": {},
    \"issues\": []
}

# Lines inventory
for lid, l in src.get(\"lines\", {}).items():
    station_list = l.get(\"stations\", [])
    inventory[\"lines\"][lid] = {
        \"name\": l.get(\"name\"),
        \"nameEn\": l.get(\"nameEn\"),
        \"code\": l.get(\"code\"),
        \"operator\": l.get(\"operator\"),
        \"region\": l.get(\"region\"),
        \"type\": l.get(\"type\"),
        \"station_count\": len(station_list),
        \"has_durationTotalMin\": \"durationTotalMin\" in l,
        \"has_image\": bool(l.get(\"image\")),
        \"has_branchOf\": l.get(\"branchOf\") is not None,
        \"has_throughServices\": bool(l.get(\"throughServices\")),
        \"has_transferStations\": bool(l.get(\"transferStations\")),
    }

# Stations inventory
for sid, s in src.get(\"stations\", {}).items():
    has_lines = \"lines\" in s
    line_count = len(s.get(\"lines\", [])) if has_lines else 0
    has_lat = \"lat\" in s
    has_lng = \"lng\" in s
    inventory[\"stations\"][sid] = {
        \"has_lat\": has_lat,
        \"has_lng\": has_lng,
        \"has_lines\": has_lines,
        \"line_count\": line_count,
        \"fields\": list(s.keys()),
    }

# Name map
nm = src.get(\"name_map\", {})
inventory[\"summary\"][\"name_map\"] = {
    \"total\": len(nm),
    \"sample\": list(nm.items())[:5],
}

# StationLines
sl = src.get(\"stationLines\", {})
inventory[\"summary\"][\"stationLines\"] = {
    \"total\": len(sl),
    \"sample_keys\": list(sl.keys())[:5],
}

# LineStationOrder
lso = src.get(\"lineStationOrder\", {})
inventory[\"summary\"][\"lineStationOrder\"] = {
    \"total\": len(lso),
    \"sample_keys\": list(lso.keys())[:5],
}

# Issues
stations_with_lines = sum(1 for s in src[\"stations\"].values() if \"lines\" in s)
stations_without_lines = len(src[\"stations\"]) - stations_with_lines
inventory[\"issues\"].append({
    \"type\": \"missing_lines_field\",
    \"description\": \"Stations without lines field\",
    \"count\": stations_without_lines,
})

# Check for duplicate line IDs
line_ids = list(src[\"lines\"].keys())
dup_lines = [x for x in line_ids if line_ids.count(x) > 1]
if dup_lines:
    inventory[\"issues\"].append({\"type\": \"duplicate_line_id\", \"ids\": sorted(set(dup_lines))})

# Check for duplicate station IDs
station_ids = list(src[\"stations\"].keys())
dup_stations = [x for x in station_ids if station_ids.count(x) > 1]
if dup_stations:
    inventory[\"issues\"].append({\"type\": \"duplicate_station_id\", \"ids\": sorted(set(dup_stations))})

# Derived stationLines from lines
derived_sl = {}
for lid, l in src[\"lines\"].items():
    for order, sid in enumerate(l.get(\"stations\", [])):
        derived_sl.setdefault(sid, []).append({\"line_id\": lid, \"station_order\": order})

# Compare with stored stationLines
stored_sl = src.get(\"stationLines\", {})
mismatch = 0
for sid in set(list(derived_sl.keys()) + list(stored_sl.keys())):
    d_keys = set(x[\"line_id\"] for x in derived_sl.get(sid, []))
    s_keys = set(stored_sl.get(sid, []))
    if d_keys != s_keys:
        mismatch += 1

if mismatch:
    inventory[\"issues\"].append({
        \"type\": \"stationLines_mismatch\",
        \"description\": \"stationLines entries where derived != stored\",
        \"count\": mismatch,
    })

inv_path = os.path.join(repo, \"recovery\", \"inventory\", \"entity_inventory_152.json\")
with open(inv_path, \"w\", encoding=\"utf-8\") as f:
    json.dump(inventory, f, indent=2, ensure_ascii=False)

print(\"04 done\")
print(\"Lines:\", len(src[\"lines\"]))
print(\"Stations:\", len(src[\"stations\"]))
print(\"stationLines:\", len(stored_sl))
print(\"lineStationOrder:\", len(lso))
print(\"Stations with lines field:\", stations_with_lines)
print(\"Stations without lines field:\", stations_without_lines)
print(\"Mismatched stationLines:\", mismatch)