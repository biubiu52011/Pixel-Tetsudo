import json, os
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Classify each station difference
classifications = []
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    ss = src["lines"][lid].get("stations", [])
    cs = cur["lines"][lid].get("stations", [])
    if ss == cs:
        continue
    
    src_set = set(ss)
    cur_set = set(cs)
    only_src = src_set - cur_set
    only_cur = cur_set - src_set
    common = src_set & cur_set
    
    # Check if this is a known spelling variant
    spelling_variants = 0
    for s in only_src:
        for c in only_cur:
            if s.lower().replace("-","").replace("_","") == c.lower().replace("-","").replace("_",""):
                spelling_variants += 1
    
    # Check if source looks like a subset of current (truncated)
    is_subset = only_src.issubset(cur_set) if only_src else False
    # Check if current looks like a subset of source
    is_current_subset = only_cur.issubset(src_set) if only_cur else False
    
    # Check if source has mojibake
    has_mojibake_src = any('\uFF61' <= c <= '\uFF9F' for s in ss for c in s)
    has_mojibake_cur = any('\uFF61' <= c <= '\uFF9F' for s in cs for c in s)
    
    # Determine classification
    if len(only_src) <= 2 and len(only_cur) <= 2 and spelling_variants > 0:
        category = "SPELLING_VARIANT"
    elif has_mojibake_src and not has_mojibake_cur:
        category = "SOURCE_MOJIBAKE"
    elif has_mojibake_cur and not has_mojibake_src:
        category = "CURRENT_MOJIBAKE"
    elif len(ss) == len(cs) and spelling_variants >= len(only_src):
        category = "REORDER_ONLY"
    elif is_subset and len(cs) > len(ss):
        category = "SOURCE_TRUNCATED"
    elif is_current_subset and len(ss) > len(cs):
        category = "CURRENT_TRUNCATED"
    elif len(only_src) > 10 and len(only_cur) > 10:
        category = "SIGNIFICANT_ROUTE_DIFFERENCE"
    else:
        category = "MODERATE_DIFFERENCE"
    
    classifications.append({
        "line_id": lid,
        "source_count": len(ss),
        "current_count": len(cs),
        "only_source": len(only_src),
        "only_current": len(only_cur),
        "spelling_variants": spelling_variants,
        "category": category,
        "source_sample_only": list(only_src)[:3],
        "current_sample_only": list(only_cur)[:3],
    })

# Summarize by category
from collections import Counter
cat_counts = Counter(c["category"] for c in classifications)
print("Station difference classifications:")
for cat, cnt in cat_counts.most_common():
    print(f"  {cat}: {cnt}")

print("\nDetails by category:")
for cat in ["SOURCE_TRUNCATED", "CURRENT_TRUNCATED", "SPELLING_VARIANT", "SOURCE_MOJIBAKE", 
            "SIGNIFICANT_ROUTE_DIFFERENCE", "MODERATE_DIFFERENCE", "REORDER_ONLY"]:
    items = [c for c in classifications if c["category"] == cat]
    if items:
        print(f"\n  {cat} ({len(items)}):")
        for it in items[:5]:
            print(f"    {it['line_id']}: src={it['source_count']} cur={it['current_count']} "
                  f"only_src={it['only_source']} only_cur={it['only_current']}")
            if len(items) > 5:
                print(f"    ... and {len(items)-5} more")
                break