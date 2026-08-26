import json, os
repo = os.getcwd()
diff = json.load(open(os.path.join(repo,"recovery/reports/06_diff_152_vs_60.json"),"r",encoding="utf-8"))
print("C (60 only):", diff["C_60_only"])
print("B sample (152 only, first 10):", diff["B_152_only"][:10])
print("D (field diff) sample:", diff["D_field_diff"][:3])
print("E (content diff) sample:", diff["E_content_diff"][:5])