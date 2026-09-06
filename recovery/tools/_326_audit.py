import json
from datetime import datetime
import os

data = json.load(open("data/core/railway_data.json", encoding="utf-8"))
stations = data.get("stations", {})
tourism = data.get("tourism", {})
sl = data.get("stationLines", {})
name_map = data.get("name_map", {})

orphan_keys = sorted([k for k in tourism if k not in stations])

categories = {"REAL_STATION": [], "NAMING_VARIANT": [], "POI_LANDMARK": [], "DISTRICT_NAME": [], "HOLD": []}
classification = []

for k in orphan_keys:
    in_sl = k in sl
    coord = tourism[k].get("coord", [None, None])
    spots_count = len(tourism[k].get("spots", []))
    similar = [s for s in stations if k.lower() == s.lower()]

    if k in ["Aomori", "Daikanyama", "Niigata", "Sendai"]:
        cat = "REAL_STATION"
        reason = "stationLines ref + real station + valid coords"
    elif k in ["Aoyama", "Minato"]:
        cat = "NAMING_VARIANT"
        reason = "stationLines ref but likely district-level or legacy naming"
    elif k in ["Tanabata", "Shikoku", "Okinawa", "Hakone", "Miyajima", "Naoshima"]:
        cat = "POI_LANDMARK"
        reason = "tourist destination/festival/region name, not a railway station"
    elif k in ["Azabu", "Bunkyo", "Chiyoda", "Chuo", "Edogawa", "Katsushika", "Kita", "Koto", "Marunouchi", "Nishitokyo", "Sumida", "Toshima"]:
        cat = "DISTRICT_NAME"
        reason = "Tokyo ward/district name, not a station entity"
    elif k in ["Kawaguchiko", "Kiyosumi-Shirakawa"]:
        cat = "REAL_STATION"
        reason = "real station name, not in stationLines but valid station"
    elif k in ["Fukuoka", "Hiroshima", "Kagoshima", "Kanazawa", "Kochi", "Nara", "Okayama", "Sapporo", "Takayama"]:
        cat = "NAMING_VARIANT"
        reason = "major city name, actual station may use different ID"
    elif k == "Odaiba":
        cat = "NAMING_VARIANT"
        reason = "OdaibaKaihinkoen exists as station entity; Odaiba is district name"
    else:
        cat = "HOLD"
        reason = "uncertain classification"

    categories[cat].append({"key": k, "in_stationLines": in_sl, "coord": coord, "spots": spots_count, "reason": reason})
    classification.append({"key": k, "category": cat, "in_stationLines": in_sl, "coord": coord, "spots": spots_count, "reason": reason})

summary = {"total": len(orphan_keys), "REAL_STATION": len(categories["REAL_STATION"]), "NAMING_VARIANT": len(categories["NAMING_VARIANT"]), "POI_LANDMARK": len(categories["POI_LANDMARK"]), "DISTRICT_NAME": len(categories["DISTRICT_NAME"]), "HOLD": len(categories["HOLD"])}

report = {"task": "3.26", "date": datetime.now().strftime("%Y-%m-%d"), "canonical_sha": "60328163CF28540B86EFD59CF30E3FBADACF7056FCD49035095A6CECECC8B567", "summary": summary, "classifications": classification, "categories": {k: [{"key": i["key"], "in_stationLines": i["in_stationLines"], "coord": i["coord"], "spots": i["spots"], "reason": i["reason"]} for i in v] for k, v in categories.items()}}

os.makedirs("recovery/reports", exist_ok=True)
with open("recovery/reports/3.26_tourism_station_entity_audit.json", "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("OK")
for cat, count in summary.items():
    print(f"  {cat}: {count}")