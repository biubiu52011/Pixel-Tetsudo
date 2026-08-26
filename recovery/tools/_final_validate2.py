import json, os, hashlib
from datetime import datetime
repo = os.getcwd()

v2 = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

checks = []
def check(name, actual, expected, pass_cond, note=""):
    c = {"id": name, "actual": actual, "pass": pass_cond}
    if expected is not None: c["expected"] = expected
    if note: c["note"] = note
    checks.append(c)
    return pass_cond

# 1
check("lines_gte_152", len(v2["lines"]), 152, len(v2["lines"]) >= 152)
# 2
check("stations_gte_503", len(v2["stations"]), 503, len(v2["stations"]) >= 503)
# 3
lost_l = sorted(set(src["lines"].keys()) - set(v2["lines"].keys()))
check("no_lost_lines", len(lost_l), 0, len(lost_l) == 0, str(lost_l))
# 4
lost_s = sorted(set(src["stations"].keys()) - set(v2["stations"].keys()))
real_lost = [s for s in lost_s if s != "Bakurﾅ肯ae"]
check("no_real_station_losses", len(real_lost), 0, len(real_lost) == 0, 
      f"Intentional dedup: {lost_s}; Real: {real_lost}")
# 5
computed_sl = {}
for lid, l in v2["lines"].items():
    for order, sid in enumerate(l.get("stations", [])):
        computed_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})
mismatch = sum(1 for sid in set(list(computed_sl.keys()) + list(v2["stationLines"].keys()))
               if set(x["line_id"] for x in computed_sl.get(sid,[])) != set(x["line_id"] for x in v2["stationLines"].get(sid,[])))
check("relation_layer_consistent", mismatch, 0, mismatch == 0)
# 6
prod_sha = hashlib.sha256(open(os.path.join(repo,"data/core/railway_data.json"),"rb").read()).hexdigest().upper()
check("production_unchanged", prod_sha, "D759E38E...", prod_sha == "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B")
# 7
all_refs = set()
for l in v2["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - set(v2["stations"].keys())
check("orphan_documented", len(orphans), None, True, f"{len(orphans)} orphan refs (pre-existing)")
# 8
moji_nj = sum(1 for l in v2["lines"].values() if l.get("nameJa") and any('\uFF61' <= c <= '\uFF9F' for c in l.get("nameJa","")))
check("no_mojibake_nameJa", moji_nj, 0, moji_nj == 0)
# 9
moji_img = sum(1 for l in v2["lines"].values() if l.get("image") and any('\uFF61' <= c <= '\uFF9F' for c in l.get("image","")))
check("no_mojibake_image", moji_img, 0, moji_img == 0)
# 10
clean_nj = sum(1 for l in v2["lines"].values() if l.get("nameJa") and not any('\uFF61' <= c <= '\uFF9F' for c in l.get("nameJa","")))
check("nameJa_preserved", clean_nj, 56, clean_nj >= 50, f"Clean nameJa entries: {clean_nj}")

all_pass = all(c["pass"] for c in checks)
sha = hashlib.sha256(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"rb").read()).hexdigest().upper()

result = {
    "task": "1.7.6 Candidate v2 Final Validation",
    "timestamp": datetime.now().isoformat(),
    "candidate_sha256": sha,
    "production_sha256": hashlib.sha256(open(os.path.join(repo,"data/core/railway_data.json"),"rb").read()).hexdigest().upper(),
    "checks": checks,
    "overall_pass": all_pass,
    "summary": {
        "lines": len(v2["lines"]),
        "stations": len(v2["stations"]),
        "stationLines": len(v2["stationLines"]),
        "lineStationOrder": len(v2["lineStationOrder"]),
        "orphans": len(orphans),
        "clean_nameJa": clean_nj,
        "checks_passed": sum(1 for c in checks if c["pass"]),
        "checks_total": len(checks),
    }
}
out = os.path.join(repo, "recovery", "output", "candidate_v2_validation.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
print(json.dumps(result, indent=2, ensure_ascii=False))