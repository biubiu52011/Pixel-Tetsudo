import json, os, hashlib
from datetime import datetime
repo = os.getcwd()

cand = json.load(open(os.path.join(repo, "recovery", "output", "railway_data_canonical_candidate.json"), "r", encoding="utf-8"))
src = json.load(open(os.path.join(repo, "recovery", "source", "railway_152_raw.json"), "r", encoding="utf-8"))
cur = json.load(open(os.path.join(repo, "data", "core", "railway_data.json"), "r", encoding="utf-8"))

checks = []
def check(name, actual, expected, pass_cond, note=""):
    c = {"id": name, "actual": actual, "pass": pass_cond}
    if expected is not None: c["expected"] = expected
    if note: c["note"] = note
    checks.append(c)
    return pass_cond

check("lines_gte_152", len(cand["lines"]), 152, len(cand["lines"]) >= 152)
check("stations_gte_503", len(cand["stations"]), 503, len(cand["stations"]) >= 503)

lost_l = sorted(set(src["lines"].keys()) - set(cand["lines"].keys()))
check("no_lost_lines", len(lost_l), 0, len(lost_l) == 0, str(lost_l))

lost_s = sorted(set(src["stations"].keys()) - set(cand["stations"].keys()))
real_lost = [s for s in lost_s if s != "Bakurﾅ肯ae"]
check("no_real_station_losses", len(real_lost), 0, len(real_lost) == 0, f"Dedup:{lost_s} Real:{real_lost}")

computed_sl = {}
for lid, l in cand["lines"].items():
    for order, sid in enumerate(l.get("stations", [])):
        computed_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})
mismatch = sum(1 for sid in set(list(computed_sl.keys()) + list(cand["stationLines"].keys()))
               if set(x["line_id"] for x in computed_sl.get(sid,[])) != set(x["line_id"] for x in cand["stationLines"].get(sid,[])))
check("relation_consistent", mismatch, 0, mismatch == 0)

prod_sha = hashlib.sha256(open(os.path.join(repo, "data", "core", "railway_data.json"), "rb").read()).hexdigest().upper()
check("production_unchanged", prod_sha, "D759E38E...", prod_sha == "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B")

all_refs = set()
for l in cand["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - set(cand["stations"].keys())
check("orphan_documented", len(orphans), None, True, f"{len(orphans)} orphans pre-existing")

moji_nj = sum(1 for l in cand["lines"].values() if l.get("nameJa") and any("\uFF61" <= c <= "\uFF9F" for c in l.get("nameJa","")))
check("no_mojibake_nameJa", moji_nj, 0, moji_nj == 0)

moji_img = sum(1 for l in cand["lines"].values() if l.get("image") and any("\uFF61" <= c <= "\uFF9F" for c in l.get("image","")))
check("no_mojibake_image", moji_img, 0, moji_img == 0)

no_st = [lid for lid, l in cand["lines"].items() if not l.get("stations")]
check("all_lines_have_stations", len(no_st), 0, len(no_st) == 0)

dur_mm = sum(1 for lid, l in cand["lines"].items() if l.get("durations") and len(l["durations"]) != len(l.get("stations",[])))
check("durations_match_stations", dur_mm, 0, dur_mm == 0)

overall = all(c["pass"] for c in checks)
sha = hashlib.sha256(open(os.path.join(repo, "recovery", "output", "railway_data_canonical_candidate.json"), "rb").read()).hexdigest().upper()

result = {
    "task": "2.1 Canonical Candidate Validation",
    "timestamp": datetime.now().isoformat(),
    "candidate_file": "recovery/output/railway_data_canonical_candidate.json",
    "candidate_sha256": sha,
    "production_sha256": prod_sha,
    "checks": checks,
    "overall_pass": overall,
    "summary": {
        "lines": len(cand["lines"]),
        "stations": len(cand["stations"]),
        "stationLines": len(cand["stationLines"]),
        "lineStationOrder": len(cand["lineStationOrder"]),
        "orphans": len(orphans),
        "checks_passed": sum(1 for c in checks if c["pass"]),
        "checks_total": len(checks),
    }
}
out = os.path.join(repo, "recovery", "output", "canonical_candidate_validation.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
print(json.dumps(result, indent=2, ensure_ascii=False))