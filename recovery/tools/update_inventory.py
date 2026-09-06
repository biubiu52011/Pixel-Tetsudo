import json,sys
sys.stdout.reconfigure(encoding="utf-8")
with open("recovery/reports/unified_lines_3.3_inventory.json",encoding="utf-8") as f:
    inv=json.load(f)
# Fix to correct line numbers
for finding in inv["findings"]:
    if finding["file"]=="js/data-fusion.js":
        if finding["line"]==142: finding["line"]=143
        if finding["line"]==157: finding["line"]=158
        if finding["line"]==163: finding["line"]=164
        if finding["line"]==188: finding["line"]=189
with open("recovery/reports/unified_lines_3.3_inventory.json","w",encoding="utf-8") as f:
    json.dump(inv,f,indent=2,ensure_ascii=False)
print("Fixed line numbers")