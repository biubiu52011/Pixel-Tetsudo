import os
repo = os.getcwd()
gi_path = os.path.join(repo, ".gitignore")
content = open(gi_path, "r", encoding="utf-8").read()
# Remove the recovery/ entries we just added
lines = content.split(chr(10))
new_lines = []
skip_next = False
for line in lines:
    if line.strip() == "# Recovery workspace - historical data audit artifacts":
        skip_next = True
        continue
    if skip_next and line.strip().startswith("recovery/"):
        skip_next = False
        continue
    new_lines.append(line)
open(gi_path, "w", encoding="utf-8").write(chr(10).join(new_lines))
print("Removed recovery/ from .gitignore")