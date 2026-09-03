import json, re
from collections import Counter

# 1. Canonical data integrity
d = json.load(open(r'C:\Users\80996\Documents\项目\像素铁道\data\core\railway_data.json', encoding='utf-8'))
print("=== Canonical Data ===")
print(f"Lines: {len(d.get('lineIds', {}))}")
print(f"Stations: {len(d.get('stations', {}))}")
print(f"NameMap: {len(d.get('name_map', {}))}")
print(f"Tourism: {len(d.get('tourism', {}))}")

# 2. Relation Layer
rels = open(r'C:\Users\80996\Documents\项目\像素铁道\data\core\line-service-relations.js', encoding='utf-8').read()
entries = re.findall(r'lineA:\s*"(\w+)"', rels)
types = re.findall(r'relation:\s*"(\w+)"', rels)
print("\n=== Relation Layer ===")
print(f"Entries: {len(entries)}")
print(f"Types: {dict(Counter(types))}")

# 3. Forbidden patterns in resolver
res = open(r'C:\Users\80996\Documents\项目\像素铁道\js\running-chain-resolver.js', encoding='utf-8').read()
print("\n=== Resolver Boundary Check ===")
for p in ['RunningChainDB', 'CHAIN_DB', 'localStorage', 'sessionStorage', 'persistent']:
    status = 'FORBIDDEN!' if p in res else 'OK'
    print(f"  {p}: {status}")

# 4. No delay aggregation in fusion or state
df = open(r'C:\Users\80996\Documents\项目\像素铁道\js\data-fusion.js', encoding='utf-8').read()
ds = open(r'C:\Users\80996\Documents\项目\像素铁道\js\data-state.js', encoding='utf-8').read()
print("\n=== Delay Aggregation Check ===")
print(f"  data-fusion.js: {'WARNING' if 'aggregate' in df.lower() else 'OK - no aggregation'}")
print(f"  data-state.js: {'WARNING' if 'aggregate' in ds.lower() else 'OK - no aggregation'}")

# 5. Check UNKNOWN badge path exists
print("\n=== UNKNOWN Badge Path ===")
print(f"  data-state.js has UNKNOWN branch: {'OK' if 'identity === \"UNKNOWN\"' in ds else 'MISSING!'}")
print(f"  rs-chain-badge-unknown CSS: {'OK' if 'rs-chain-badge-unknown' in open(r'C:\\Users\\80996\\Documents\\项目\\像素铁道\\css\\style.css', encoding='utf-8').read() else 'MISSING!'}")

# 6. Check BRANCH_OF fix
print("\n=== BRANCH_OF Semantic Fix ===")
print(f"  resolver sets SAME for BRANCH: {'OK' if 'ctx.identity=\"SAME\";ctx.confidence=\"LOW\";ctx.reason=\"BRANCH_OF\"' in res else 'STILL WRONG!'}")
print(f"  resolver does NOT set UNKNOWN for BRANCH: {'OK' if 'ctx.identity=\"UNKNOWN\";ctx.confidence=\"LOW\";ctx.reason=\"BRANCH_OF\"' not in res else 'STILL BROKEN!'}")

# 7. Load order in HTML
rt = open(r'C:\Users\80996\Documents\项目\像素铁道\pages\realtime.html', encoding='utf-8').read()
tr = open(r'C:\Users\80996\Documents\项目\像素铁道\pages\trains.html', encoding='utf-8').read()
print("\n=== HTML Load Order ===")
print(f"  realtime.html: {'OK' if 'line-service-relations' in rt and 'running-chain-resolver' in rt and rt.index('running-chain-resolver') < rt.index('data-fusion') else 'WRONG ORDER!'}")
print(f"  trains.html: {'OK' if 'line-service-relations' in tr and 'running-chain-resolver' in tr and tr.index('running-chain-resolver') < tr.index('data-fusion') else 'WRONG ORDER!'}")

print("\n=== SUMMARY ===")
all_ok = (
    len(d.get('lineIds', {})) == 156
    and len(d.get('stations', {})) == 509
    and len(entries) == 14
    and 'aggregate' not in df.lower()
    and 'aggregate' not in ds.lower()
    and 'identity === "UNKNOWN"' in ds
    and 'rs-chain-badge-unknown' in open(r'C:\Users\80996\Documents\项目\像素铁道\css\style.css', encoding='utf-8').read()
    and all(p not in res for p in ['RunningChainDB', 'localStorage'])
    and 'ctx.identity="SAME";ctx.confidence="LOW";ctx.reason="BRANCH_OF"' in res
)
print(f"All checks passed: {all_ok}")
