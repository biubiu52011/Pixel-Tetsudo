import json, os, hashlib
from datetime import datetime
repo = os.getcwd()

candidate = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

checks = {
    "timestamp": datetime.now().isoformat(),
    "task": "Task 1 Migration Validation",
    "validation": {},
    "schema_compliance": {},
    "data_integrity": {},
}

checks["validation"]["lines_gte_152"] = len(candidate["lines"]) >= 152
checks["validation"]["lines_count"] = len(candidate["lines"])
checks["validation"]["stations_gte_503"] = len(candidate["stations"]) >= 503
checks["validation"]["stations_count"] = len(candidate["stations"])

src_line_ids = set(src["lines"].keys())
cand_line_ids = set(candidate["lines"].keys())
src_st_ids = set(src["stations"].keys())
cand_st_ids = set(candidate["stations"].keys())
checks["data_integrity"]["lost_lines"] = sorted(src_line_ids - cand_line_ids)
checks["data_integrity"]["lost_stations"] = sorted(src_st_ids - cand_st_ids)
checks["data_integrity"]["all_entities_preserved"] = len(src_line_ids - cand_line_ids) == 0 and len(src_st_ids - cand_st_ids) == 0

checks["schema_compliance"]["has_relations_key"] = "stationLines" in candidate and "lineStationOrder" in candidate
checks["schema_compliance"]["stationLines_type"] = type(candidate.get("stationLines")).__name__
checks["schema_compliance"]["lineStationOrder_type"] = type(candidate.get("lineStationOrder")).__name__
checks["schema_compliance"]["all_lines_have_stations"] = all("stations" in l for l in candidate["lines"].values())
checks["schema_compliance"]["all_lines_have_id_as_key"] = all(isinstance(k, str) and len(k) > 0 for k in candidate["lines"].keys())
checks["schema_compliance"]["all_stations_have_coords"] = all("lat" in s and "lng" in s for s in candidate["stations"].values())

computed_sl = {}
for lid, l in candidate["lines"].items():
    for order, sid in enumerate(l.get("stations", [])):
        computed_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})

mismatch = 0
for sid in set(list(computed_sl.keys()) + list(candidate["stationLines"].keys())):
    dk = set(x["line_id"] for x in computed_sl.get(sid, []))
    sk = set(x["line_id"] for x in candidate["stationLines"].get(sid, []))
    if dk != sk:
        mismatch += 1

checks["schema_compliance"]["stationLines_computed_match"] = mismatch == 0
checks["schema_compliance"]["stationLines_entry_count"] = len(candidate["stationLines"])
checks["schema_compliance"]["lineStationOrder_entry_count"] = len(candidate["lineStationOrder"])

raw = open(os.path.join(repo,"data/core/railway_data.json"),"rb").read()
prod_sha = hashlib.sha256(raw).hexdigest().upper()
checks["data_integrity"]["production_unchanged_sha"] = prod_sha == "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B"

all_pass = all([
    checks["validation"]["lines_gte_152"],
    checks["validation"]["stations_gte_503"],
    checks["data_integrity"]["all_entities_preserved"],
    checks["schema_compliance"]["stationLines_computed_match"],
    checks["data_integrity"]["production_unchanged_sha"],
])
checks["overall_pass"] = all_pass

path = os.path.join(repo, "recovery", "output", "validation_report.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(checks, f, indent=2, ensure_ascii=False)

print(json.dumps(checks, indent=2, ensure_ascii=False))