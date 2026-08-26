import json, os
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# 1.6.2 Station reconciliation - all 452 diffs are "lines" field
# Source has lines array, current doesn't
station_reconciliation = []
for sid in sorted(src["stations"].keys()):
    if sid not in cur["stations"]:
        continue
    ss = src["stations"][sid]
    cs = cur["stations"][sid]
    if ss == cs:
        continue

    diff = {"station_id": sid, "fields": {}}
    for f in set(list(ss.keys()) + list(cs.keys())):
        sv = ss.get(f)
        cv = cs.get(f)
        if sv != cv:
            if sv is not None and cv is None:
                status = "SOURCE_ONLY"
                decision = "accept_source"  # source has lines, current doesn't - accept source
            elif cv is not None and sv is None:
                status = "CURRENT_ONLY"
                decision = "accept_current"
            else:
                status = "BOTH_DIFFERENT"
                decision = "needs_review"
            diff["fields"][f] = {
                "status": status,
                "decision": decision,
                "source": sv,
                "current": cv,
            }
    if diff["fields"]:
        station_reconciliation.append(diff)

print(f"Stations requiring reconciliation: {len(station_reconciliation)}")

from collections import Counter
decision_counts = Counter()
for sr in station_reconciliation:
    for f, d in sr["fields"].items():
        decision_counts[d["decision"]] += 1
print("\nDecision distribution:")
for k, v in decision_counts.most_common():
    print(f"  {k}: {v}")

# Save
out_path = os.path.join(repo, "recovery", "reconciliation", "station_reconciliation.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({
        "timestamp": datetime.now().isoformat(),
        "total_stations_requiring_reconciliation": len(station_reconciliation),
        "decision_summary": dict(decision_counts),
        "details": station_reconciliation,
    }, f, indent=2, ensure_ascii=False)
print(f"\nSaved to {out_path}")