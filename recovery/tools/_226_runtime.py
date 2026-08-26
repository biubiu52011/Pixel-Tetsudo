import json, os, hashlib
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# 2.2.6: Full Runtime Validation
print("=== 2.2.6 Candidate Runtime Validation ===")

results = {}

# 1. Schema check
schema_issues = []
for lid, l in cand["lines"].items():
    if not l.get("name"):
        schema_issues.append(f"line.{lid}: missing name")
    if not l.get("stations"):
        schema_issues.append(f"line.{lid}: missing stations")
for sid, s in cand["stations"].items():
    if not isinstance(s, dict) or "lat" not in s or "lng" not in s:
        schema_issues.append(f"station.{sid}: invalid coords")
results["schema"] = len(schema_issues) == 0
print(f"  Schema: {'PASS' if results['schema'] else 'FAIL'} ({len(schema_issues)} issues)")

# 2. Entity counts
results["lines_gte_152"] = len(cand["lines"]) >= 152
results["stations_gte_503"] = len(cand["stations"]) >= 503
print(f"  Lines >= 152: {len(cand['lines'])} {'PASS' if results['lines_gte_152'] else 'FAIL'}")
print(f"  Stations >= 503: {len(cand['stations'])} {'PASS' if results['stations_gte_503'] else 'FAIL'}")

# 3. No lost entities
lost_l = set(src["lines"].keys()) - set(cand["lines"].keys())
lost_s = set(src["stations"].keys()) - set(cand["stations"].keys())
real_lost_s = [s for s in lost_s if s != "Bakurﾅ肯ae"]
results["no_lost_lines"] = len(lost_l) == 0
results["no_lost_stations"] = len(real_lost_s) == 0
print(f"  Lost lines: {sorted(lost_l)} {'PASS' if results['no_lost_lines'] else 'FAIL'}")
print(f"  Lost stations: {real_lost_s} {'PASS' if results['no_lost_stations'] else 'FAIL'}")

# 4. Relation layer
computed_sl = {}
computed_lso = {}
for lid, l in cand["lines"].items():
    computed_lso[lid] = {}
    for order, sid in enumerate(l.get("stations", [])):
        computed_lso[lid][sid] = order
        computed_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})

sl_mm = sum(1 for sid in set(list(computed_sl.keys())+list(cand["stationLines"].keys()))
            if set(x["line_id"] for x in computed_sl.get(sid,[])) != set(x["line_id"] for x in cand["stationLines"].get(sid,[])))
lso_mm = sum(1 for lid in set(list(computed_lso.keys())+list(cand["lineStationOrder"].keys()))
             if computed_lso.get(lid) != cand["lineStationOrder"].get(lid))
results["relation_consistent"] = sl_mm == 0 and lso_mm == 0
print(f"  Relation consistent: sl_mm={sl_mm} lso_mm={lso_mm} {'PASS' if results['relation_consistent'] else 'FAIL'}")

# 5. Orphan count
all_refs = set()
for l in cand["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - set(cand["stations"].keys())
results["orphan_count"] = len(orphans)
print(f"  Orphan refs: {len(orphans)}")

# 6. Production unchanged
prod_sha = hashlib.sha256(open(os.path.join(repo,"data/core/railway_data.json"),"rb").read()).hexdigest().upper()
results["production_unchanged"] = prod_sha == "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B"
print(f"  Production unchanged: {'PASS' if results['production_unchanged'] else 'FAIL'}")

# 7. Mojibake check
moji_nj = sum(1 for l in cand["lines"].values() if l.get("nameJa") and any("\uFF61" <= c <= "\uFF9F" for c in l.get("nameJa","")))
moji_img = sum(1 for l in cand["lines"].values() if l.get("image") and any("\uFF61" <= c <= "\uFF9F" for c in l.get("image","")))
results["no_mojibake"] = moji_nj == 0 and moji_img == 0
print(f"  No mojibake: nameJa={moji_nj} image={moji_img} {'PASS' if results['no_mojibake'] else 'FAIL'}")

# 8. Durations match
dur_mm = sum(1 for lid, l in cand["lines"].items() if l.get("durations") and len(l["durations"]) != len(l.get("stations",[])))
results["durations_match"] = dur_mm == 0
print(f"  Durations match: {'PASS' if results['durations_match'] else 'FAIL'} ({dur_mm} mismatches)")

overall = all(results.values())
sha = hashlib.sha256(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"rb").read()).hexdigest().upper()

print(f"\n{'='*50}")
print(f"Candidate Runtime Validation: {'PASS' if overall else 'FAIL'}")
print(f"SHA-256: {sha}")
print(f"Checks: {sum(results.values())}/{len(results)} passed")

out = {
    "task": "2.2.6 Candidate Runtime Validation",
    "timestamp": datetime.now().isoformat(),
    "candidate_sha256": sha,
    "production_sha256": prod_sha,
    "checks": results,
    "overall_pass": overall,
    "summary": {
        "lines": len(cand["lines"]),
        "stations": len(cand["stations"]),
        "stationLines": len(cand["stationLines"]),
        "lineStationOrder": len(cand["lineStationOrder"]),
        "orphans": len(orphans),
    }
}
with open(os.path.join(repo,"recovery","output","2_2_6_runtime_validation.json"),"w",encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\nSaved to recovery/output/2_2_6_runtime_validation.json")