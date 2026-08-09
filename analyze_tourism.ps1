import re
from collections import Counter
import json

with open(r"C:\Users\80996\Documents\项目\像素铁道\data\tourism-data.js", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")
print(f"Total lines: {len(lines)}")

# Count blank comma lines
comma_lines = [(i+1, line) for i, line in enumerate(lines) if line.strip() == ","]
print(f"Blank comma lines: {len(comma_lines)}")

# Find all station names
pattern = r'"([A-Za-z]+)"\s*:\s*\{'
matches = re.findall(pattern, text)
print(f"Found station entries: {len(matches)}")
counts = Counter(matches)
duplicates = [(k, v) for k, v in counts.items() if v > 1]
print(f"站名重复: {duplicates}")

# Find empty emoji
empty_emoji = re.findall(r'emoji:\s*""\s*,\s*name:\s*"([^"]+)"', text)
print(f"Empty emoji spots: {len(empty_emoji)}")

# Find image paths
img_paths = re.findall(r'image:\s*"([^"]+)"', text)
print(f"Image paths: {img_paths}")
