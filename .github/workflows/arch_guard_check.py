#!/usr/bin/env python3
import json, os, sys

REPO_ROOT = os.getcwd()
INVENTORY_PATH = os.path.join(REPO_ROOT, 'recovery', 'reports', 'unified_lines_3.3_inventory.json')

def main():
    if not os.path.exists(INVENTORY_PATH):
        print('ERROR: Inventory not found:', INVENTORY_PATH)
        sys.exit(1)
    with open(INVENTORY_PATH, 'r', encoding='utf-8') as f:
        inv = json.load(f)
    mig = sum(1 for x in inv['findings'] if x['decision'] == 'MIGRATE')
    ret = sum(1 for x in inv['findings'] if x['decision'] == 'RETAIN')
    ign = sum(1 for x in inv['findings'] if x['decision'] == 'IGNORE')
    print('=== ARCHITECTURE INTEGRITY GUARD (3.3) ===')
    print()
    print('Findings from inventory:')
    print('  MIGRATE (business runtime, needs migration): %d' % mig)
    print('  RETAIN (compatibility, no action): %d' % ret)
    print('  IGNORE (comments/docs): %d' % ign)
    print()
    # Check for new unclassified findings
    SKIP = {'recovery', '.git', 'node_modules', '__pycache__', 'data/core'}
    SCAN = [os.path.join(REPO_ROOT, 'js'), os.path.join(REPO_ROOT, 'pages')]
    known = {(x['file'].replace('\\', '/'), x['line']) for x in inv['findings']}
    # Line numbers drift as files evolve. Keep a content signature as a secondary
    # identity so previously reviewed UNIFIED_LINES uses do not become false positives.
    known_content = {
        (x['file'].replace('\\', '/'), ' '.join(str(x.get('content', '')).split()))
        for x in inv['findings']
    }
    new_errors = []
    new_warnings = []
    for sd in SCAN:
        if not os.path.exists(sd): continue
        for dp, _, fns in os.walk(sd):
            if any(d in dp for d in SKIP): continue
            for fn in fns:
                if not fn.endswith(('.js', '.html')): continue
                fp = os.path.join(dp, fn)
                rel = fp.replace(REPO_ROOT + os.sep, '').replace(chr(92), '/')
                try:
                    with open(fp, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                except: continue
                for i, line in enumerate(lines):
                    key = (rel, i+1)
                    s = line.strip()
                    content_key = (rel, ' '.join(s.split()))
                    if key in known or content_key in known_content: continue
                    if 'UNIFIED_LINES' in line and not (s.startswith('//') or s.startswith('/*') or s.startswith('*')):
                        new_warnings.append('UNCLASSIFIED_UNIFIED_LINES %s:%d: %s' % (rel, i+1, s[:80]))
                    if 'localhost' in line or '127.0.0.1' in line:
                        new_errors.append('LOCALHOST %s:%d: %s' % (rel, i+1, s[:80]))
                    if 'file://' in line:
                        new_errors.append('FILE_PROTOCOL %s:%d: %s' % (rel, i+1, s[:80]))
    # Canonical railway identity guard: integration code must not regress to
    # railway-short-only matching. Namespace-aware matching belongs in ODPTClient.
    identity_required = os.path.join(REPO_ROOT, 'data', 'api', 'odpt-unified.js')
    try:
        with open(identity_required, 'r', encoding='utf-8') as f:
            identity_src = f.read()
        for token in ('makeRailwayIdentity', 'parseRailwayIdentity', 'getLineRailwayIdentity', 'key:', '"::"'):
            if token not in identity_src:
                new_errors.append('CANONICAL_IDENTITY_MISSING %s' % token)
        if "rw.indexOf('.' + railway)" in identity_src:
            new_errors.append('FUZZY_RAILWAY_IDENTITY_MATCH data/api/odpt-unified.js')
    except Exception:
        new_errors.append('CANONICAL_IDENTITY_FILE_UNREADABLE data/api/odpt-unified.js')

    # Vehicle identity architecture invariants.
    # These are release-blocking architecture boundaries, not ordinary regression
    # expectations. Do not weaken them to make a feature/test pass.
    def _read_arch(rel):
        try:
            with open(os.path.join(REPO_ROOT, rel), 'r', encoding='utf-8') as f:
                return f.read()
        except Exception:
            new_errors.append('ARCH_FILE_UNREADABLE %s' % rel)
            return ''

    fusion_src = _read_arch('js/data-fusion.js')
    estimator_src = _read_arch('js/train-position-estimator.js')
    renderer_src = _read_arch('js/trains-render.js')
    vehicle_src = _read_arch('js/train-vehicle.js')
    evidence_src = _read_arch('data/timetables/train-operation-evidence.js')


    # RAILWAY-001: operational through-service adjacency has one runtime authority.
    # throughServices may remain in canonical data as a generated compatibility /
    # presentation projection, but production Running Chain must derive adjacency
    # exclusively from evidence-bearing serviceBoundaries.
    running_chain_src = _read_arch('js/running-chain-resolver.js')
    route_search_src = _read_arch('js/route-search.js')
    if 'line.throughServices' in running_chain_src:
        new_errors.append('RAILWAY-001 RUNNING_CHAIN_READS_THROUGH_SERVICES_PROJECTION')
    if 'isDirectThroughService:function' in running_chain_src or 'hasRelation:function' in running_chain_src:
        new_errors.append('RAILWAY-001 LEGACY_RUNNING_CHAIN_RELATION_API_REINTRODUCED')
    # Diagnostic reason labels such as "THROUGH_SERVICE" are presentation/debug
    # vocabulary, not topology authority. Block only executable legacy relation-
    # type reads/writes so diagnostics cannot create a false architecture failure.
    legacy_relation_type_tokens = (
        'relation.type === "THROUGH_SERVICE"',
        "relation.type === 'THROUGH_SERVICE'",
        'relation.type === "SERVICE_BOUNDARY"',
        "relation.type === 'SERVICE_BOUNDARY'",
        'relation.type = "THROUGH_SERVICE"',
        "relation.type = 'THROUGH_SERVICE'",
        'relation.type = "SERVICE_BOUNDARY"',
        "relation.type = 'SERVICE_BOUNDARY'",
    )
    if any(token in running_chain_src for token in legacy_relation_type_tokens):
        new_errors.append('RAILWAY-001 LEGACY_RUNNING_CHAIN_RELATION_TYPE_REINTRODUCED')
    if '.throughServices' in route_search_src:
        new_errors.append('RAILWAY-001 ROUTE_SEARCH_READS_THROUGH_SERVICES_PROJECTION')
    if 'Array.isArray(line.serviceBoundaries)' not in route_search_src:
        new_errors.append('RAILWAY-001 ROUTE_SEARCH_SERVICE_BOUNDARY_ADJACENCY_MISSING')
    for token in (
        'var boundaries = Array.isArray(line.serviceBoundaries)',
        '_boundaryMap[lineId][boundary.lineId] = joins.slice()',
        '_directThrough[lineId].push(boundary.lineId)',
    ):
        if token not in running_chain_src:
            new_errors.append('RAILWAY-001 SERVICE_BOUNDARY_ADJACENCY_MISSING %s' % token)

    # REALTIME-001: TrainTrackLayout is the only train geometry authority.
    track_layout_src = _read_arch('js/train-track-layout.js')
    if 'window.TrainTrackLayout' not in renderer_src:
        new_errors.append('REALTIME-001 TRAIN_TRACK_LAYOUT_AUTHORITY_MISSING')
    if 'var loc = layout ? layout[pi] : null;' not in renderer_src or 'if (!loc) continue;' not in renderer_src:
        new_errors.append('REALTIME-001 RENDERER_GEOMETRY_FAIL_CLOSED_MISSING')
    if 'var _trainNodes = trainLayer.querySelectorAll(\'[data-train-id]\')' in renderer_src:
        new_errors.append('REALTIME-001 PER_TRAIN_MARKER_DOM_RESCAN')
    if '("train_" + pi)' in renderer_src or '("row-" + index)' in track_layout_src:
        new_errors.append('REALTIME-001 ROW_ORDER_IDENTITY_REINTRODUCED')
    if '_displayNextStationIdx' not in renderer_src:
        new_errors.append('REALTIME-001 SEGMENT_CONTINUITY_STATE_MISSING')
    if 'getMoveDir: _trainMoveDir' in renderer_src:
        new_errors.append('REALTIME-001 DISPLAY_DIRECTION_USED_AS_GEOMETRY_AUTHORITY')
    if 'var trainUid = p.runningChainId || p.trainId || p.trainNumber' in renderer_src:
        new_errors.append('REALTIME-001 TRAIN_NUMBER_USED_AS_PERSISTENT_MARKER_ID')

    # VEHICLE-001/002: one final vehicle authority and one canonical evidence resolver.
    if 'TrainOperationEvidence.resolveEvidence' not in estimator_src:
        new_errors.append('VEHICLE-002 CANONICAL_EVIDENCE_RESOLVER_BYPASSED')
    if 'TRAIN_OPERATION_EVIDENCE_PROVIDERS' in estimator_src or 'TRAIN_OPERATION_EVIDENCE_PROVIDERS' in fusion_src:
        new_errors.append('VEHICLE-002 DIRECT_PROVIDER_TRAVERSAL_OUTSIDE_CANONICAL_RESOLVER')
    if 'structuralVehicleType' in vehicle_src or 'structuralVehicleType' in fusion_src or 'structuralVehicleType' in estimator_src:
        new_errors.append('VEHICLE-002 STRUCTURAL_IDENTITY_DIRECT_INJECTION')

    # VEHICLE-003: renderer consumes resolved identity only.
    if 'TrainVehicle.resolve(_vrCtx)' in renderer_src:
        new_errors.append('VEHICLE-003 RENDERER_VEHICLE_RERESOLUTION')
    if '__trainIconCache' in renderer_src:
        new_errors.append('VEHICLE-003 RENDERER_IDENTITY_CACHE')

    # VEHICLE-004: one running-chain registry commit path.
    if fusion_src.count('_rememberChainVehicle(') != 2:
        new_errors.append('VEHICLE-004 RUNNING_CHAIN_REGISTRY_COMMIT_PATH_COUNT=%d' % fusion_src.count('_rememberChainVehicle('))
    if '_rememberChainVehicle(_formationCandidate)' in fusion_src:
        new_errors.append('VEHICLE-004 FORMATION_SECOND_REGISTRY_COMMIT')

    # VEHICLE-005: operational context/artwork must never manufacture vehicle identity.
    forbidden_vehicle_tokens = (
        'TrainVehicle.registerVehicle',
        '_rtVehicle.source === "trainNo"',
        'positionData.trainClass = positionData.trainClass || resolveTrainClass',
    )
    for token in forbidden_vehicle_tokens:
        if token in fusion_src or token in estimator_src:
            new_errors.append('VEHICLE-005 FORBIDDEN_IDENTITY_INFERENCE %s' % token)
    for token in ('vehicleTypeManual', 'odptVehicleType', 'structuralVehicleType'):
        if token in vehicle_src:
            new_errors.append('VEHICLE-005 LEGACY_DIRECT_VEHICLE_INPUT %s' % token)

    # VEHICLE-006/007: position coverage is independent from vehicle identity and
    # weaker fallback evidence cannot replace stronger realtime identity.
    if 'realtimePositionRecordPresent' not in fusion_src or 'vehicleResolvedFromRealtime' not in fusion_src:
        new_errors.append('VEHICLE-006 POSITION_IDENTITY_AXES_NOT_SEPARATE')
    if 'if (!_sameVehicle && _existingRank >= _incomingRank)' not in fusion_src:
        new_errors.append('VEHICLE-007 STRONGER_CHAIN_IDENTITY_PROTECTION_MISSING')
    if ('sources.indexOf("realtime") >= 0' not in fusion_src or
        'sources.indexOf("realtime-derived") >= 0' not in fusion_src or
        'sources.indexOf("structural") >= 0' not in fusion_src or
        'sources.indexOf("timetable") >= 0' not in fusion_src):
        new_errors.append('VEHICLE-007 REALTIME_SOURCE_PRIORITY_MISSING')

    # Forbidden files
    for dp, _, fns in os.walk(REPO_ROOT):
        if any(d in dp for d in SKIP): continue
        for fn in fns:
            if fn in ('station_to_tourism.json', 'line_station.json', 'station_line.json'):
                rel = os.path.join(dp, fn).replace(REPO_ROOT + os.sep, '')
                new_errors.append('FORBIDDEN_FILE %s' % rel)
    if new_errors:
        print('NEW ERRORS (%d):' % len(new_errors))
        for e in new_errors:
            print('  X %s' % e)
        print()
    if new_warnings:
        print('NEW WARNINGS (%d) - unclassified UNIFIED_LINES:' % len(new_warnings))
        for w in new_warnings:
            print('  ! %s' % w)
        print()
    if not new_errors and not new_warnings:
        print('All findings accounted for. No new violations.')
        print()
    if new_errors:
        print('RESULT: FAIL')
        sys.exit(1)
    else:
        print('RESULT: PASS')
        sys.exit(0)

if __name__ == '__main__':
    main()
