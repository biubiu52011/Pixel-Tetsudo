import json, os, random
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))

# 2.2.4: Data Access API Validation
# Simulate RailwayDB-like queries
print("=== 2.2.4 Data Access API Validation ===")

class FakeRailwayDB:
    def __init__(self, data):
        self.stations = data["stations"]
        self.lines = data["lines"]
        self.name_map = data.get("name_map", {})
        self.stationLines = data.get("stationLines", {})
        self.lineStationOrder = data.get("lineStationOrder", {})
        self.tourism = data.get("tourism", {})
    
    def getStation(self, id):
        return self.stations.get(id)
    
    def getLine(self, id):
        return self.lines.get(id)
    
    def getAllLines(self):
        return self.lines
    
    def getNameMap(self):
        return self.name_map
    
    def getTourism(self):
        return self.tourism
    
    def getSpot(self, station, spotName):
        ts = self.tourism.get(station, {})
        if not ts:
            return None
        spots = ts.get("spots", []) if isinstance(ts, dict) else []
        for s in spots:
            if isinstance(s, dict) and s.get("name") == spotName:
                return s
        return None
    
    def getStationCoords(self, id):
        s = self.stations.get(id)
        if s and isinstance(s, dict):
            return [s.get("lat"), s.get("lng")]
        return None
    
    def getStationLines(self, id):
        return self.stationLines.get(id, [])
    
    def getLineStationOrder(self, lid, sid):
        order_map = self.lineStationOrder.get(lid, {})
        return order_map.get(sid)

db = FakeRailwayDB(cand)

# Test queries
issues = []

# 1. Get all lines
lines = db.getAllLines()
if len(lines) != 156:
    issues.append(f"getAllLines returned {len(lines)}, expected 156")

# 2. Random line query
sample_lines = random.sample(list(lines.keys()), min(10, len(lines)))
for lid in sample_lines:
    l = db.getLine(lid)
    if not l:
        issues.append(f"getLine({lid}) returned None")
    elif not l.get("stations"):
        issues.append(f"getLine({lid}) has no stations")
    elif len(l["stations"]) != len(l.get("durations", [])):
        issues.append(f"getLine({lid}) stations({len(l['stations'])}) != durations({len(l.get('durations',[]))})")

# 3. Random station query
sample_stations = random.sample(list(db.stations.keys()), min(10, len(db.stations)))
for sid in sample_stations:
    s = db.getStation(sid)
    if not s:
        issues.append(f"getStation({sid}) returned None")
    coords = db.getStationCoords(sid)
    if coords and (coords[0] is None or coords[1] is None):
        issues.append(f"getStationCoords({sid}) has null coord")

# 4. Transfer station query (stations with multiple lines)
multi_line_stations = [(sid, lines) for sid, lines in db.stationLines.items() if len(lines) > 2]
if len(multi_line_stations) < 50:
    issues.append(f"Only {len(multi_line_stations)} multi-line stations (expected >= 50)")

# 5. Name map lookup
test_names = ["Shinjuku", "Shibuya", "Tokyo", "Ueno", "Akihabara"]
for jp_name in test_names:
    en_name = db.name_map.get(jp_name)
    if not en_name:
        issues.append(f"name_map missing for {jp_name}")

# 6. Tourism query
tourism_stations = list(db.tourism.keys())
if len(tourism_stations) != 93:
    issues.append(f"tourism has {len(tourism_stations)} entries, expected 93")
sample_tourism = random.sample(tourism_stations, min(5, len(tourism_stations)))
for ts in sample_tourism:
    spots = db.getTourism().get(ts, {}).get("spots", [])
    if not spots:
        issues.append(f"tourism spot empty for {ts}")

# 7. Line-station order check
for lid in sample_lines:
    l = db.getLine(lid)
    for i, sid in enumerate(l["stations"]):
        order = db.getLineStationOrder(lid, sid)
        if order != i:
            issues.append(f"{lid}[{sid}]: order={order}, expected={i}")

# 8. Cross-check: stationLines <-> lineStationOrder
for sid, lines in list(db.stationLines.items())[:100]:
    for entry in lines:
        lid = entry["line_id"]
        order = entry["station_order"]
        rev_order = db.getLineStationOrder(lid, sid)
        if rev_order != order:
            issues.append(f"{sid} in {lid}: stationLines says {order}, lineStationOrder says {rev_order}")

print(f"Issues found: {len(issues)}")
for issue in issues[:10]:
    print(f"  {issue}")

# Sample queries that should work
print(f"\nSample queries:")
print(f"  Shinjuku coords: {db.getStationCoords('Shinjuku')}")
print(f"  Shinjuku lines: {len(db.getStationLines('Shinjuku'))} lines")
print(f"  Yamanote stations: {len(db.getLine('Yamanote')['stations'])}")
print(f"  Tokyo name_en: {db.name_map.get('Tokyo')}")
print(f"  Adachi tourism spots: {len(db.getTourism().get('Adachi',{}).get('spots',[]))}")

out = {
    "task": "2.2.4 Data Access API Validation",
    "timestamp": datetime.now().isoformat(),
    "pass": len(issues) == 0,
    "issues": issues,
    "checks": {
        "total_lines": len(lines),
        "total_stations": len(db.stations),
        "total_multi_line_stations": len(multi_line_stations),
        "total_tourism_entries": len(tourism_stations),
        "name_map_sample": {k: db.name_map.get(k) for k in test_names},
    }
}
with open(os.path.join(repo,"recovery","output","2_2_4_api_validation.json"),"w",encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\nSaved to recovery/output/2_2_4_api_validation.json")