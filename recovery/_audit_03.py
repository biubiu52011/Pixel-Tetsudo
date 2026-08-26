import json, hashlib, os, subprocess, re, shutil
from datetime import datetime

repo = r\"C:\\Users\\80996\\Documents\\项目\\像素铁道\"
os.chdir(repo)

# Copy Phase13 backup as the primary 152-line raw source
src = os.path.join(repo, \"data/core/railway_data_phase13_pre_coordinate_fix_backup.json\")
dst = os.path.join(repo, \"recovery\", \"source\", \"railway_152_raw.json\")
h = hashlib.sha256(open(src, \"rb\").read()).hexdigest().upper()
size = os.path.getsize(src)
shutil.copy2(src, dst)

# Also copy Phase15 and Phase29 backups
for name in [\"railway_data_phase15_pre_cleanup_backup.json\", \"railway_data_phase29e1p0_pre_recover_backup.json\"]:
    s = os.path.join(repo, \"data/core\", name)
    if os.path.exists(s):
        d = os.path.join(repo, \"recovery\", \"source\", name)
        shutil.copy2(s, d)

# Save metadata
meta = {
    \"timestamp\": datetime.now().isoformat(),
    \"primary_source\": {
        \"file\": \"recovery/source/railway_152_raw.json\",
        \"original_path\": \"data/core/railway_data_phase13_pre_coordinate_fix_backup.json\",
        \"sha256\": h,
        \"size_bytes\": size,
        \"source_commit\": \"phase13_pre_coordinate_fix\",
        \"notes\": \"Closest match to AGENTS.md baseline (503 stations, 152 lines, 1864 stationLines, 152 lineStationOrder)\",
    }
}
mpath = os.path.join(repo, \"recovery\", \"source\", \"source_meta.json\")
with open(mpath, \"w\", encoding=\"utf-8\") as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)
print(\"03 done\")
print(\"SHA:\", h)
print(\"Size:\", size)