import json, os
repo = os.getcwd()
line_res = json.load(open(os.path.join(repo,"recovery/reconciliation/1_7_1_line_field_resolution.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Categorize UNRESOLVED by field
by_field = {"stations": [], "durations": [], "code": [], "branchOf": [], "other": []}
for lr in line_res["resolutions"]:
    for field, dec in lr["fields"].items():
        if dec["decision"] == "UNRESOLVED":
            entry = {
                "line_id": lr["line_id"],
                "field": field,
                "reason": dec["reason"],
                "source_sample": str(dec.get("source",""))[:120],
                "current_sample": str(dec.get("current",""))[:120],
            }
            if field in by_field:
                by_field[field].append(entry)
            else:
                by_field["other"].append(entry)

print("=== UNRESOLVED by field ===")
total = 0
for f, items in by_field.items():
    if items:
        total += len(items)
        print(f"\n{f}: {len(items)} items")
        for item in items[:5]:
            print(f"  {item['line_id']}: {item['reason'][:80]}")
            if len(items) > 5:
                print(f"  ... and {len(items)-5} more")
                break

print(f"\nTotal UNRESOLVED: {total}")