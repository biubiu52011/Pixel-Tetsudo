import json, os
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))

# 2.2.5: Presentation Layer Compatibility Check
# Check if the data structure matches what UI/presentation code expects

print("=== 2.2.5 Presentation Layer Compatibility ===")

issues = []

# Check line image paths exist in a reasonable format
bad_images = []
for lid, l in cand["lines"].items():
    img = l.get("image", "")
    if img and not img.startswith("../images/"):
        bad_images.append({"line": lid, "image": img[:80]})

print(f"Lines with non-standard image paths: {len(bad_images)}")
for b in bad_images[:5]:
    print(f"  {b['line']}: {b['image']}")

# Check line type values
valid_types = {"straight", "loop", "branch", "mono"}
invalid_types = []
for lid, l in cand["lines"].items():
    t = l.get("type", "")
    if t and t not in valid_types:
        invalid_types.append({"line": lid, "type": t})

print(f"Lines with unknown type: {len(invalid_types)}")
for inv in invalid_types[:5]:
    print(f"  {inv['line']}: {inv['type']}")

# Check color format
bad_colors = []
for lid, l in cand["lines"].items():
    c = l.get("color", "")
    if c and not (c.startswith("#") and len(c) == 7):
        bad_colors.append({"line": lid, "color": c})

print(f"Lines with invalid color format: {len(bad_colors)}")
for bc in bad_colors[:5]:
    print(f"  {bc['line']}: {bc['color']}")

# Check operator values
operators = set(l.get("operator", "") for l in cand["lines"].values())
print(f"\nUnique operators: {sorted(operators)}")

# Check region values
regions = set(l.get("region", "") for l in cand["lines"].values())
print(f"Unique regions: {sorted(regions)}")

# Check that all line IDs are valid Python identifiers (for JS variable access)
import re
invalid_ids = []
for lid in cand["lines"].keys():
    if not re.match(r'^[A-Za-z_][A-Za-z0-9_]*$', lid):
        invalid_ids.append(lid)

print(f"\nLine IDs with invalid format: {len(invalid_ids)}")
for iid in invalid_ids[:5]:
    print(f"  {iid}")

# Check station ID format
invalid_st_ids = []
for sid in cand["stations"].keys():
    if not isinstance(sid, str) or not sid:
        invalid_st_ids.append(sid)

print(f"Invalid station IDs: {len(invalid_st_ids)}")

# Check name_map key format (should be Japanese station names)
nm_jp_count = sum(1 for k in cand["name_map"].keys() if any('\u4E00' <= c <= '\u9FFF' or '\u3040' <= c <= '\u309F' or '\u30A0' <= c <= '\u30FF' for c in k))
print(f"name_map entries with Japanese keys: {nm_jp_count}/{len(cand['name_map'])}")

all_pass = len(bad_images) == 0 and len(invalid_types) == 0 and len(bad_colors) == 0 and len(invalid_ids) == 0 and len(invalid_st_ids) == 0
print(f"\nPresentation compatibility: {'PASS' if all_pass else 'FAIL'}")

out = {
    "task": "2.2.5 Presentation Layer Compatibility",
    "timestamp": datetime.now().isoformat(),
    "pass": all_pass,
    "issues": {
        "bad_image_paths": len(bad_images),
        "invalid_line_types": len(invalid_types),
        "bad_colors": len(bad_colors),
        "invalid_line_ids": len(invalid_ids),
        "invalid_station_ids": len(invalid_st_ids),
    },
    "operators": sorted(operators),
    "regions": sorted(regions),
}
with open(os.path.join(repo,"recovery","output","2_2_5_presentation_compat.json"),"w",encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print("Saved")