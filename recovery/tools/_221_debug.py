import json, os
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))

# Check which of the 13 lines have empty name in source
no_name_lines = ["Ikebukuro", "KeioInokashira", "KeioMain", "KeioShin", "Kokubunji", 
                 "Nippori_Toneri", "OdakyuOdawara", "Oyama", "Seibu_Shinjuku", 
                 "Skytree", "TohokuMain", "Tojo", "TsukubaExpress"]

print("Source name fields for lines with empty candidate name:")
for lid in no_name_lines:
    sn = src["lines"][lid].get("name", "MISSING")
    cn = cand["lines"][lid].get("name", "MISSING")
    se = src["lines"][lid].get("nameEn", "MISSING")
    ce = cand["lines"][lid].get("nameEn", "MISSING")
    print(f"  {lid}: src.name={repr(sn)} src.nameEn={repr(se)} cand.name={repr(cn)} cand.nameEn={repr(ce)}")

# Also check what the warnings are about
import json as j2
sv = j2.load(open(os.path.join(repo,"recovery/output/2_2_1_schema_validation.json"),"r",encoding="utf-8"))
warns = [i for i in sv["issues"] if i["severity"]=="WARNING"]
print(f"\nWarnings ({len(warns)}):")
from collections import Counter
wc = Counter(i["check"] for i in warns)
for k, v in wc.most_common():
    print(f"  {k}: {v}")