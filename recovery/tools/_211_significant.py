import json, os
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Detailed analysis of SIGNIFICANT_ROUTE_DIFFERENCE lines
# These need careful review
print("=== SIGNIFICANT ROUTE DIFFERENCES Analysis ===")
significant = []
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    ss = src["lines"][lid].get("stations", [])
    cs = cur["lines"][lid].get("stations", [])
    if ss == cs:
        continue
    only_src = set(ss) - set(cs)
    only_cur = set(cs) - set(ss)
    if len(only_src) > 5 and len(only_cur) > 5:
        significant.append({
            "line_id": lid,
            "src_count": len(ss), "cur_count": len(cs),
            "only_src": sorted(only_src),
            "only_cur": sorted(only_cur),
            "common": sorted(set(ss) & set(cs)),
        })

for s in significant:
    print(f"\n{s['line_id']}: src={s['src_count']} cur={s['cur_count']}")
    print(f"  Only in source ({len(s['only_src'])}): {s['only_src'][:8]}")
    print(f"  Only in current ({len(s['only_cur'])}): {s['only_cur'][:8]}")
    print(f"  Common ({len(s['common'])}): {s['common'][:5]}...")