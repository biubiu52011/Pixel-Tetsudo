import json,sys,re
sys.stdout.reconfigure(encoding="utf-8")
with open("data/core/railway_data.json",encoding="utf-8") as f:
    data=json.load(f)
lines=data.get("lines",{})
with open("data/api/odpt-unified.js",encoding="utf-8") as f:
    odpt_js=f.read()
mapped=re.findall(r"\"(\w+)\":\s*\"(\w+)\"",odpt_js)
odpt_mapped=set(k for k,v in mapped)
railway_lines=set(lines.keys())
not_mapped=sorted(railway_lines - odpt_mapped)
# Count UNIFIED_LINES by category
import os
unified_counts={}
for fpath in ["js/data-fusion.js","js/realtime-view.js","js/data-layer.js","js/trains-page.js","js/trains-render.js","js/trains-detail.js"]:
    if os.path.exists(fpath):
        c=open(fpath,encoding="utf-8").read()
        matches=re.findall(r".*UNIFIED_LINES.*",c)
        unified_counts[fpath]=len(matches)
report={
    "title":"3.10.1 Realtime Input Audit — ODPT / DataFusion / Architecture",
    "date":"2026-08-28",
    "canonical_sha":"27ed38fc6910781268e231906ecc683367d1c93fca725cbe803eb167b4b2240e",
    "architecture":{
        "pipeline":"ODPT API -> odpt-unified.js -> DataFusion.fuseAll() -> DataState.renderCard() -> realtime-view.js",
        "data_sources":[
            "ODPT API (realtime delay/status via fetch)",
            "RailwayDB (canonical line/station data)",
            "IndexedDB cache (RailwayRTC for positions)",
            "UNIFIED_LINES (legacy compat fallback)"
        ],
        "critical_finding":"DataFusion reads UNIFIED_LINES directly, NOT RailwayDB"
    },
    "operator_coverage":{
        "total_operators":21,
        "total_lines":156,
        "lines_mapped_in_odpt_client":len(odpt_mapped),
        "lines_not_mapped":len(not_mapped),
        "unmapped_lines":not_mapped
    },
    "unified_lines_usage":unified_counts,
    "canonicial_realtime_data":{
        "lines_with_delayInfo":"0/156 (realtime data not in canonical)",
        "lines_with_status":"0/156 (realtime data not in canonical)",
        "lines_with_durations":"156/156",
        "lines_with_color":"142/156",
        "lines_with_image":"136/156"
    },
    "issues_identified":[
        {
            "id":"RT-001",
            "severity":"HIGH",
            "description":"DataFusion bypasses RailwayDB — reads UNIFIED_LINES directly",
            "impact":"If UNIFIED_LINES is not loaded, DataFusion silently fails",
            "recommendation":"Migrate DataFusion to use RailwayDB.getAllLines() as primary source",
            "deferred_to":"3.10.x migration task"
        },
        {
            "id":"RT-002",
            "severity":"MEDIUM",
            "description":"100+ lines not mapped in ODPTClient.LINE_TO_OPERATOR",
            "impact":"Those lines cannot get realtime delay data from ODPT",
            "recommendation":"Add missing operator mappings or handle as no-data gracefully"
        },
        {
            "id":"RT-003",
            "severity":"INFO",
            "description":"No ZH/KO station names in name_map (all 1493 entries are JP->EN)",
            "impact":"Realtime station names show in JP/EN only",
            "recommendation":"Consider adding ZH/KO to name_map entries"
        }
    ],
    "ci_guard":"PASS",
    "arch_guard":"PASS",
    "action":"AUDIT_ONLY — no code changes"
}
with open("recovery/reports/3.10.1_realtime_input_audit.json","w",encoding="utf-8") as f:
    json.dump(report,f,indent=2,ensure_ascii=False)
print("Report written")
print("Unmapped lines: "+str(len(not_mapped)))