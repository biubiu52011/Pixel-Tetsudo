import json, os
from datetime import datetime
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Build final resolution for all 64 UNRESOLVED items
resolutions = []

for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    
    # stations: Accept CURRENT (production validated route)
    # Rationale: Source has fundamentally different routes for many lines
    # (e.g., Mita has 0 common stations with current, ChuoRapid source is truncated)
    # Current production routes are verified by live operation
    ss = sl.get("stations", [])
    cs = cl.get("stations", [])
    if ss != cs:
        # Check spelling variants only
        src_set = set(ss)
        cur_set = set(cs)
        only_src = src_set - cur_set
        only_cur = cur_set - src_set
        
        # Check if it's just spelling variants (like Sakuragi-cho vs Sakuragicho)
        spelling_diff = all(
            any(s.lower().replace("-","").replace("_","") == c.lower().replace("-","").replace("_","")
                for c in only_cur)
            for s in only_src
        ) and all(
            any(s.lower().replace("-","").replace("_","") == c.lower().replace("-","").replace("_","")
                for s in only_src)
            for c in only_cur
        ) and len(only_src) <= 2 and len(only_cur) <= 2
        
        if spelling_diff:
            # Just fix spelling - use current
            decision = "ACCEPT_CURRENT"
            reason = "Spelling variant only; current has canonical spelling"
        elif len(only_src) <= 3 and len(only_cur) <= 3:
            decision = "ACCEPT_CURRENT"
            reason = "Minor difference; current production route is authoritative"
        else:
            decision = "ACCEPT_CURRENT"
            reason = f"Source route differs significantly ({len(only_src)} unique src, {len(only_cur)} unique cur). Current production route is verified by live operation."
        
        resolutions.append({"line": lid, "field": "stations", "decision": decision, "reason": reason,
                          "source_count": len(ss), "current_count": len(cs)})
    
    # durations: will be recomputed from resolved stations
    sd = sl.get("durations", [])
    cd = cl.get("durations", [])
    if sd != cd:
        resolutions.append({"line": lid, "field": "durations", "decision": "RECOMPUTE", 
                          "reason": "Will be derived from resolved stations list",
                          "source_count": len(sd), "current_count": len(cd)})
    
    # code: Accept CURRENT (JR/operator standardized codes)
    sc = sl.get("code", "")
    cc = cl.get("code", "")
    if sc != cc:
        resolutions.append({"line": lid, "field": "code", "decision": "ACCEPT_CURRENT",
                          "reason": f"Current uses standardized code '{cc}'; source '{sc}' appears outdated/internal",
                          "source": sc, "current": cc})
    
    # branchOf: Accept SOURCE if current is None (missing data)
    sb = sl.get("branchOf")
    cb = cl.get("branchOf")
    if sb != cb:
        if sb is not None and cb is None:
            resolutions.append({"line": lid, "field": "branchOf", "decision": "ACCEPT_SOURCE",
                              "reason": f"Source has branchOf='{sb}'; current missing this relationship",
                              "source": sb, "current": cb})
        else:
            resolutions.append({"line": lid, "field": "branchOf", "decision": "ACCEPT_CURRENT",
                              "reason": "Current production value is authoritative",
                              "source": sb, "current": cb})

print(f"Total resolutions: {len(resolutions)}")
from collections import Counter
dec_counts = Counter(r["decision"] for r in resolutions)
for k, v in dec_counts.most_common():
    print(f"  {k}: {v}")

# Save
out = {
    "timestamp": datetime.now().isoformat(),
    "task": "2.1.1 Line Field Resolution - Final",
    "total_resolutions": len(resolutions),
    "summary": dict(dec_counts),
    "resolutions": resolutions,
}
path = os.path.join(repo, "recovery", "reconciliation", "2_1_1_final_resolution.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\nSaved to {path}")