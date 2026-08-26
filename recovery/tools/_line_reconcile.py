import json, os
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# Detailed classification of each line conflict field-by-field
line_reconciliation = []
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    if sl == cl:
        continue

    field_decisions = []
    for f in ["name","nameEn","nameJa","code","color","operator","region","type",
               "image","durationTotalMin","branchOf","durations","stations",
               "throughServices","transferStations"]:
        sv = sl.get(f)
        cv = cl.get(f)
        if sv == cv:
            continue
        # Classify
        if sv is None and cv is not None:
            status = "CURRENT_ONLY"
            decision = "keep_current"
        elif cv is None and sv is not None:
            status = "SOURCE_ONLY"
            decision = "keep_source"
        elif sv == cv:
            continue
        else:
            # Both exist but differ
            sv_str = str(sv)[:50]
            cv_str = str(cv)[:50]
            # Check for mojibake in source
            has_mojibake_src = any(ord(c) > 0xFF for c in sv_str) if isinstance(sv_str, str) else False
            has_mojibake_cur = any(ord(c) > 0xFF for c in cv_str) if isinstance(cv_str, str) else False
            if f == "image":
                # Source has garbled paths, current has correct paths
                if has_mojibake_src and not has_mojibake_cur:
                    status = "BOTH_DIFFERENT"
                    decision = "keep_current"
                elif has_mojibake_cur and not has_mojibake_src:
                    status = "BOTH_DIFFERENT"
                    decision = "keep_source"
                else:
                    status = "BOTH_DIFFERENT"
                    decision = "keep_current"  # default
            elif f == "nameJa":
                # Source has nameJa (even if mojibake), current is None
                status = "BOTH_DIFFERENT"
                decision = "keep_source"  # preserve source value
            elif f == "stations":
                # Different station lists - need manual review
                status = "BOTH_DIFFERENT"
                decision = "needs_review"
            elif f == "durations":
                status = "BOTH_DIFFERENT"
                decision = "needs_review"
            elif f == "code":
                status = "BOTH_DIFFERENT"
                decision = "needs_review"
            else:
                status = "BOTH_DIFFERENT"
                decision = "needs_review"

            field_decisions.append({
                "field": f,
                "status": status,
                "decision": decision,
                "source_value": str(sv)[:100],
                "current_value": str(cv)[:100],
            })

    if field_decisions:
        line_reconciliation.append({
            "line_id": lid,
            "decisions": field_decisions,
        })

print(f"Lines requiring reconciliation: {len(line_reconciliation)}")

# Summary
from collections import Counter
decision_counts = Counter()
status_counts = Counter()
for lr in line_reconciliation:
    for d in lr["decisions"]:
        decision_counts[d["decision"]] += 1
        status_counts[d["status"]] += 1

print("\nDecision distribution:")
for k, v in decision_counts.most_common():
    print(f"  {k}: {v}")
print("\nStatus distribution:")
for k, v in status_counts.most_common():
    print(f"  {k}: {v}")

# Save
out_path = os.path.join(repo, "recovery", "reconciliation", "line_reconciliation.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({
        "timestamp": datetime.now().isoformat(),
        "total_lines_requiring_reconciliation": len(line_reconciliation),
        "decision_summary": dict(decision_counts),
        "status_summary": dict(status_counts),
        "details": line_reconciliation,
    }, f, indent=2, ensure_ascii=False)
print(f"\nSaved to {out_path}")