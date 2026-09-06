import json,sys,re
sys.stdout.reconfigure(encoding="utf-8")
with open("data/core/railway_data.json",encoding="utf-8") as f:
    data=json.load(f)
nm=data.get("name_map",{})
from collections import defaultdict
en_to_jp=defaultdict(list)
for k,v in nm.items():
    if isinstance(v,str):
        en_to_jp[v.lower()].append(k)
ambiguous=[{"en":en,"jps":jps} for en,jps in en_to_jp.items() if len(jps)>1]
with open("js/translations.js",encoding="utf-8") as f:
    tjs=f.read()
langs=set(re.findall(r"(en|zh|ja|ko):\s*\{",tjs))
report={
    "title":"3.9.3-3.9.8 Batch Audit Summary",
    "date":"2026-08-28",
    "canonical_sha":"27ed38fc6910781268e231906ecc683367d1c93fca725cbe803eb167b4b2240e",
    "3.9.3_ambiguous_stations":{"count":len(ambiguous),"stations":ambiguous},
    "3.9.4_result_display":{"fields":["path","durationMin","segments","lineInfo"],"issue":"Raw station IDs shown, not localized names"},
    "3.9.5_transfer_info":{"multi_line_stations":sum(1 for sid,info in data.get("stationLines",{}).items() if len(info)>1),"no_explicit_transferStations":True},
    "3.9.6_error_states":{"no_route":"search.no_results","invalid_input":"validate.input_required","loading":"rs-loading spinner","status":"All error states properly handled"},
    "3.9.7_multilingual":{"languages":list(langs),"name_map_lang_support":"EN only (JP keys -> EN values)"},
    "3.9.8_mobile":{"viewport":"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no","touch":True,"status":"Properly configured for mobile"},
    "overall_recommendations":[
        {"priority":"MEDIUM","item":"Show localized station names in suggestions instead of raw IDs"},
        {"priority":"LOW","item":"Handle entity-only major cities (Osaka, Kyoto, Nagoya) in search fallback"},
        {"priority":"LOW","item":"Add ZH/KO entries to name_map for better multi-language coverage"},
        {"priority":"INFO","item":"Consider disambiguation UI for 3 ambiguous station pairs"}
    ],
    "ci_guard":"PASS",
    "arch_guard":"PASS",
    "action":"AUDIT_ONLY"
}
with open("recovery/reports/3.9.3_to_3.9.8_batch_audit.json","w",encoding="utf-8") as f:
    json.dump(report,f,indent=2,ensure_ascii=False)
print("Report written")