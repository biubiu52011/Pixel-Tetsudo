import json, os
from datetime import datetime
repo = os.getcwd()

# Read current .gitignore
gi_path = os.path.join(repo, ".gitignore")
existing = open(gi_path, "r", encoding="utf-8").read() if os.path.exists(gi_path) else ""
# Append recovery/ rules if not already present
entry = chr(10) + "# Recovery workspace - historical data audit artifacts" + chr(10) + "recovery/" + chr(10)
if "recovery/" not in existing:
    with open(gi_path, "w", encoding="utf-8") as f:
        f.write(existing.rstrip() + entry)
    print("Added recovery/ to .gitignore")
else:
    print("recovery/ already in .gitignore")