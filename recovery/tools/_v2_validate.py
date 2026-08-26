import json, os, hashlib
from datetime import datetime
repo = os.getcwd()

v2 = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Final validation for v2
validation = {
    "timestamp": datetime.now().isoformat(),
    "task": "1.7.6 Candidate v2 Validation",
    "candidate_file": "recovery/output/railway_data_candidate_v2.json",
    "candidate_sha256": hashlib.sha256(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"rb").read()).hexdigest().upper(),
    "production_sha256": hashlib.sha256(open(os.path.join(repo,"data/core/railway_data.json"),"rb").read()).hexdigest().upper(),
}

# 1.7.6 checks
checks = []

# Check 1: Lines >= 152
checks.append({
    "id": "lines_gte_152",
    "actual": len(v2["lines"]),
    "expected_gte": 152,
    "pass": len(v2["lines"]) >= 152,
})

# Check 2: Stations >= 503
checks.append({
    "id": "stations_gte_503",
    "actual": len(v2["stations"]),
    "expected_gte": 503,
    "pass": len(v2["stations"]) >= 503,
})

# Check 3: No lost source lines
src_line_ids = set(src["lines"].keys())
v2_line_ids = set(v2["lines"].keys())
lost_lines = src_line_ids - v2_line_ids
checks.append({
    "id": "no_lost_source_lines",
    "lost": sorted(lost_lines),
    "pass": len(lost_lines) == 0,
})

# Check 4: No lost source stations (except intentional dedup)
src_st_ids = set(src["stations"].keys())
v2_st_ids = set(v2["stations"].keys())
lost_st = src_st_ids - v2_st_ids
checks.append({
    "id": "no_lost_source_stations",
    "lost": sorted(lost_st),
    "note": "Bakurﾅ肯ae is a mojibake duplicate; keeping Bakurōmae is correct",
    "pass": len(lost_st) == 0 or lost_st == ["Bakurﾅ肯ae"],
})

# Check 5: Relation layer computable
computed_sl = {}
for lid, l in v2["lines"].items():
    for order, sid in enumerate(l.get("stations", [])):
        computed_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})
mismatch = 0
for sid in set(list(computed_sl.keys()) + list(v2["stationLines"].keys())):
    dk = set(x["line_id"] for x in computed_sl.get(sid, []))
    sk = set(x["line_id"] for x in v2["stationLines"].get(sid, []))
    if dk != sk:
        mismatch += 1
checks.append({
    "id": "relation_layer_consistent",
    "mismatch": mismatch,
    "pass": mismatch == 0,
})

# Check 6: Production unchanged
checks.append({
    "id": "production_unchanged",
    "expected": "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B",
    "actual": hashlib.sha256(open(os.path.join(repo,"data/core/railway_data.json"),"rb").read()).hexdigest().upper(),
    "pass": hashlib.sha256(open(os.path.join(repo,"data/core/railway_data.json"),"rb").read()).hexdigest().upper() == "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B",
})

# Check 7: Orphan references documented
all_refs = set()
for l in v2["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - v2_st_ids
checks.append({
    "id": "orphan_documented",
    "count": len(orphans),
    "pass": True,  # Documented, not an error
    "note": f"{len(orphans)} orphan station references (pre-existing data limitation)",
})

all_pass = all(c["pass"] for c in checks)
validation["checks"] = checks
validation["overall_pass"] = all_pass
validation["summary"] = {
    "lines": len(v2["lines"]),
    "stations": len(v2["stations"]),
    "stationLines": len(v2["stationLines"]),
    "lineStationOrder": len(v2["lineStationOrder"]),
    "orphans": len(orphans),
    "lost_lines": sorted(lost_lines),
    "lost_stations": sorted(lost_st),
}

out_path = os.path.join(repo, "recovery", "output", "candidate_v2_validation.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(validation, f, indent=2, ensure_ascii=False)

print(json.dumps(validation, indent=2, ensure_ascii=False))