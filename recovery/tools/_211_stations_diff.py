import json, os
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Detailed stations diff analysis
print("=== STATIONS FIELD DIFFERENCES ===")
stations_diff = []
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    ss = src["lines"][lid].get("stations", [])
    cs = cur["lines"][lid].get("stations", [])
    if ss == cs:
        continue
    # Analyze the difference
    src_set = set(ss)
    cur_set = set(cs)
    only_src = sorted(src_set - cur_set)
    only_cur = sorted(cur_set - src_set)
    common = src_set & cur_set
    src_order = {s: i for i, s in enumerate(ss)}
    cur_order = {s: i for i, s in enumerate(cs)}
    
    stations_diff.append({
        "line_id": lid,
        "source_count": len(ss),
        "current_count": len(cs),
        "only_in_source": only_src,
        "only_in_current": only_cur,
        "common": len(common),
        "source_order_sample": {s: src_order[s] for s in only_src[:3]},
        "current_order_sample": {s: cur_order[s] for s in only_cur[:3]},
    })

print(f"Lines with station list differences: {len(stations_diff)}")
for d in stations_diff:
    print(f"\n  {d['line_id']}: src={d['source_count']} cur={d['current_count']}")
    if d['only_in_source']:
        print(f"    Only in source: {d['only_in_source'][:5]}")
    if d['only_in_current']:
        print(f"    Only in current: {d['only_in_current'][:5]}")