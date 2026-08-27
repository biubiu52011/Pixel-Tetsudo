#!/usr/bin/env python3
import glob, re, os, sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
FAILURES = []
REVIEWS = []
PASSES = []
EXEMPT = ['db-loader', 'ci_guard', 'recovery']

def is_exempt(rel):
    return any(e in rel for e in EXEMPT)

all_js = glob.glob(os.path.join(REPO_ROOT, 'js', '*.js'))
all_js += glob.glob(os.path.join(REPO_ROOT, 'pages', '*.js'))
all_js += glob.glob(os.path.join(REPO_ROOT, 'pages', '*.html'))

# 1. Bad protocols
for fp in sorted(all_js):
    rel = os.path.relpath(fp, REPO_ROOT)
    if is_exempt(rel): continue
    with open(fp, 'r', encoding='utf-8', errors='replace') as f:
        src = f.readlines()
    for i, line in enumerate(src, 1):
        s = line.strip()
        if s.startswith('//') or s.startswith('/*') or s.startswith('*'): continue
        if 'file://' in line:
            FAILURES.append(('FILE_PROTOCOL', rel, i, s[:80]))
        if ('localhost' in s.lower() or '127.0.0.1' in s) and 'comment' not in s.lower():
            FAILURES.append(('LOCALHOST', rel, i, s[:80]))

# 2. Second canonical files
SECOND = ['station_to_tourism.json', 'line_station.json', 'station_line.json', 'secondary_railway.json']
for sf in SECOND:
    found = glob.glob(os.path.join(REPO_ROOT, '**', sf), recursive=True)
    for f in found:
        FAILURES.append(('SECOND_CANONICAL', os.path.relpath(f, REPO_ROOT), 0, f))

# 3. API usage balance
uc = rc = 0
for fp in sorted(all_js):
    rel = os.path.relpath(fp, REPO_ROOT)
    if is_exempt(rel): continue
    with open(fp, 'r', encoding='utf-8', errors='replace') as f:
        c = f.read()
    uc += len(re.findall('UNIFIED_LINES', c))
    rc += len(re.findall('RailwayDB', c))
if uc > 0 and rc == 0:
    REVIEWS.append(('LEGACY_ONLY', str(uc) + ' UNIFIED_LINES refs, 0 RailwayDB'))
elif uc > rc * 3 and rc > 0:
    REVIEWS.append(('LEGACY_DOM', 'U=' + str(uc) + ' R=' + str(rc)))
else:
    PASSES.append(('API_BALANCE', 'U=' + str(uc) + ' R=' + str(rc)))

# 4. Relation duplication
for fp in sorted(all_js):
    rel = os.path.relpath(fp, REPO_ROOT)
    if is_exempt(rel): continue
    with open(fp, 'r', encoding='utf-8', errors='replace') as f:
        c = f.read()
    if re.search(r'(?:stationLines|lineStationOrder)\s*=\s*(?:new\s+)?\{', c) and 'db-loader' not in rel:
        REVIEWS.append(('RELATION_REBUILD', rel))

# 5. AGENTS.md
ap = os.path.join(REPO_ROOT, 'AGENTS.md')
if os.path.exists(ap):
    with open(ap, 'r', encoding='utf-8') as f:
        a = f.read()
    if 'FROZEN' in a:
        PASSES.append(('AGENTS_MD', 'Baseline protected'))

# Output
print('=== ARCHITECTURE INTEGRITY GUARD (3.2) ===')
print()
if FAILURES:
    print('FAILURES (%d):' % len(FAILURES))
    for item in FAILURES:
        print('  X [%s] %s:%d %s' % item)
    print()
if REVIEWS:
    print('REVIEWS (%d):' % len(REVIEWS))
    for item in REVIEWS:
        print('  ! [%s] %s' % item)
    print()
if PASSES:
    print('PASSES (%d):' % len(PASSES))
    for item in PASSES:
        print('  OK [%s] %s' % item)
    print()
if FAILURES:
    print('RESULT: FAIL')
    sys.exit(1)
else:
    tag = ' WITH REVIEW' if REVIEWS else ''
    print('RESULT: PASS' + tag)
    sys.exit(0)
