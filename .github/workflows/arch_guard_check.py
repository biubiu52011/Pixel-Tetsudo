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
    if 'RunningChainResolver.isThroughAtStation(a, b, st)' not in route_search_src:
        new_errors.append('RAILWAY-001 ROUTE_SEARCH_RELATION_AUTHORITY_MISSING')
    # Protect the service-boundary behavior contract without freezing local
    # variable names or whitespace in the resolver implementation.
    for token in ('serviceBoundaries', '_boundaryMap', '_directThrough', 'handoverStations'):
        if token not in running_chain_src:
            new_errors.append('RAILWAY-001 SERVICE_BOUNDARY_ADJACENCY_MISSING %s' % token)
    if 'isThroughAtStation:isThroughAtStation' not in running_chain_src:
        new_errors.append('RAILWAY-001 SERVICE_BOUNDARY_QUERY_API_MISSING')

    # PRESENTATION-001: renderers consume passenger-facing grouping/hierarchy
    # decisions through LinePresentationService instead of re-reading canonical
    # presentation metadata or inferring branch relationships themselves.
    presentation_src = _read_arch('js/line-presentation-service.js')
    data_state_src = _read_arch('js/data-state.js')
    for token in ('getPresentation: getPresentation', 'getPrimaryPresentation: getPrimaryPresentation',
                  'getPresentationMembers: getPresentationMembers', 'isBranch: isBranch'):
        if token not in presentation_src:
            new_errors.append('PRESENTATION-001 SERVICE_API_MISSING %s' % token)
    if '.presentation' in data_state_src:
        new_errors.append('PRESENTATION-001 RENDERER_READS_PRESENTATION_METADATA')
    if 'RunningChainResolver.getResolutionContext' in data_state_src:
        new_errors.append('PRESENTATION-001 RENDERER_INFERS_SERVICE_RELATION')
    if 'if (line.branchOf) continue;' in data_state_src:
        new_errors.append('PRESENTATION-001 RENDERER_BRANCH_AUTHORITY_BYPASS')
    trains_page_src = _read_arch('js/trains-page.js')
    realtime_view_src = _read_arch('js/realtime-view.js')
    for rel, src in (
        ('js/data-state.js', data_state_src),
        ('js/trains-page.js', trains_page_src),
        ('js/realtime-view.js', realtime_view_src),
        ('js/trains-render.js', renderer_src),
    ):
        for forbidden in ('.presentation', 'serviceBoundaries', 'throughServices',
                          'RunningChainResolver.getResolutionContext'):
            if forbidden in src:
                new_errors.append('PRESENTATION-001 UI_AUTHORITY_BYPASS %s %s' % (rel, forbidden))
    if 'serviceBoundaries' in route_search_src:
        new_errors.append('PRESENTATION-001 ROUTE_SEARCH_READS_SERVICE_BOUNDARIES')
    resolver_src = _read_arch('js/running-chain-resolver.js')
    if 'isThroughAtStation:isThroughAtStation' not in resolver_src:
        new_errors.append('PRESENTATION-001 RELATION_BOUNDARY_API_MISSING')
    # Pages that consume presentation decisions must load the relation authority
    # first, otherwise early initialization can silently use compatibility fallback.
    for page in ('pages/trains.html', 'pages/realtime.html'):
        page_src = _read_arch(page)
        resolver_token = 'js/running-chain-resolver.js'
        resolver_pos = page_src.find(resolver_token)
        presentation_pos = page_src.find('js/line-presentation-service.js')
        data_state_pos = page_src.find('js/data-state.js')
        if page_src.count(resolver_token) != 1:
            new_errors.append('PRESENTATION-001 RELATION_AUTHORITY_LOAD_COUNT %s=%d' % (page, page_src.count(resolver_token)))
        if resolver_pos < 0 or presentation_pos < 0 or resolver_pos > presentation_pos:
            new_errors.append('PRESENTATION-001 RELATION_AUTHORITY_LOAD_ORDER %s' % page)
        if data_state_pos >= 0 and resolver_pos > data_state_pos:
            new_errors.append('PRESENTATION-001 RELATION_AUTHORITY_AFTER_DATA_STATE %s' % page)

    # RECOVERY-001: mobile startup/recovery has one canonical retry path.
    # Protect against regressions where Chrome can remain stuck in an old
    # loading/error DOM after network recovery, BFCache restore, or late data.
    for rel, src in (
        ('js/trains-page.js', trains_page_src),
        ('js/realtime-view.js', realtime_view_src),
    ):
        if 'window.DataLoader.retry()' not in src:
            new_errors.append('RECOVERY-001 CANONICAL_RETRY_MISSING %s' % rel)
        for token in ('setFilterAvailability(false)', 'setFilterAvailability(true)'):
            if token not in src:
                new_errors.append('RECOVERY-001 FILTER_LIFECYCLE_MISSING %s %s' % (rel, token))
    if 'window.addEventListener("pt:railway-ready"' not in realtime_view_src:
        new_errors.append('RECOVERY-001 REALTIME_LATE_CANONICAL_RECOVERY_MISSING')
    for token in (
        'window.addEventListener("online", retryVisibleFailedStates)',
        'window.addEventListener("pageshow"',
        'event.persisted',
        '["offline", "fetch_error", "timeout"]',
    ):
        if token not in data_state_src:
            new_errors.append('RECOVERY-001 MOBILE_RECOVERY_SIGNAL_MISSING %s' % token)
    if 'var fallbackReload = function() { window.location.reload(); };' not in data_state_src:
        new_errors.append('RECOVERY-001 RETRY_FALLBACK_MISSING')
    odpt_src = _read_arch('data/api/odpt-unified.js')
    for rel, src in (
        ('data/api/odpt-unified.js', odpt_src),
        ('js/data-fusion.js', fusion_src),
    ):
        if "window.addEventListener('pageshow'" not in src or 'event.persisted' not in src:
            new_errors.append('RECOVERY-001 LIVE_BFCACHE_RESUME_MISSING %s' % rel)
    if '_realtimeRefresh();' not in odpt_src:
        new_errors.append('RECOVERY-001 ODPT_FOREGROUND_REFRESH_MISSING')
    if 'pageshow fallback->fuseAll error' not in fusion_src:
        new_errors.append('RECOVERY-001 FUSION_BFCACHE_FALLBACK_MISSING')

    # COMPONENT-001: operator filter is one shared UI primitive. Pages own only
    # their business filtering behavior; button rendering/order/availability
    # must not fork into page-local implementations again.
    filter_component_src = _read_arch('js/operator-filter-bar.js')
    if 'window.OperatorFilterBar' not in filter_component_src or 'setAvailable' not in filter_component_src or 'setSelected' not in filter_component_src:
        new_errors.append('COMPONENT-001 OPERATOR_FILTER_COMPONENT_MISSING')
    for page in ('pages/realtime.html', 'pages/trains.html'):
        page_src = _read_arch(page)
        if 'js/operator-filter-bar.js' not in page_src:
            new_errors.append('COMPONENT-001 OPERATOR_FILTER_NOT_LOADED %s' % page)
    for rel in ('js/realtime-view.js', 'js/trains-page.js'):
        src = _read_arch(rel)
        if 'window.OperatorFilterBar.create' not in src:
            new_errors.append('COMPONENT-001 OPERATOR_FILTER_NOT_USED %s' % rel)
        if 'function sortOperators(' in src:
            new_errors.append('COMPONENT-001 PAGE_LOCAL_OPERATOR_SORT_REINTRODUCED %s' % rel)

    # SHELL-001: one canonical shared site chrome contract. Page-specific CSP,
    # capabilities and business content remain page-owned. Migration is explicit:
    # once a page loads SiteShell it must use the three mounts and must not retain
    # a second copy of the old header/nav/footer markup.
    shell_src = _read_arch('js/site-shell.js')
    for token in ('window.SiteShell', 'data-site-shell-mount="header"', 'data-site-shell-mount="navigation"', 'data-site-shell-mount="footer"', 'pt:site-shell-ready'):
        if token not in shell_src:
            new_errors.append('SHELL-001 SITE_SHELL_CONTRACT_MISSING %s' % token)
    if 'params.get("build")' not in shell_src or 'url.searchParams.set("build", build)' not in shell_src:
        new_errors.append('SHELL-001 BUILD_TOKEN_NAVIGATION_PROPAGATION_MISSING')
    if 'document.querySelector("[data-site-shell-root]")' not in shell_src:
        new_errors.append('SHELL-001 CSP_SAFE_AUTOMOUNT_MISSING')
    style_src = _read_arch('css/style.css')
    if 'Mobile primary navigation geometry' not in style_src or 'grid-template-columns: repeat(4, max-content)' not in style_src:
        new_errors.append('SHELL-001 MOBILE_NAV_CENTERING_CONTRACT_MISSING')
    data_state_src = _read_arch('js/data-state.js')
    realtime_view_src = _read_arch('js/realtime-view.js')
    line_card_src = _read_arch('js/line-card.js')
    if 'window.LineCard = {' not in line_card_src or 'update: update' not in line_card_src or 'updateSystem: updateSystem' not in line_card_src:
        new_errors.append('COMPONENT-002 LINE_CARD_UPDATE_API_MISSING')
    if 'function renderCard(' in data_state_src or 'function renderSystemCard(' in data_state_src:
        new_errors.append('COMPONENT-002 DATA_STATE_CARD_TEMPLATE_LEAK')
    if 'window.LineCard.render(' not in data_state_src or 'window.LineCard.renderSystem(' not in data_state_src:
        new_errors.append('COMPONENT-002 LINE_LIST_NOT_USING_LINE_CARD')
    forbidden_card_patches = ['card.querySelector(".rs-status-icon")', 'card.querySelector(".rs-line-interval")', 'card.querySelector(".rs-line-info")']
    if any(token in realtime_view_src for token in forbidden_card_patches):
        new_errors.append('COMPONENT-002 REALTIME_CARD_DOM_PATCH_LEAK')
    if 'window.DataState.renderCard' in realtime_view_src or 'window.DataState.LineCard' in realtime_view_src:
        new_errors.append('COMPONENT-002 LEGACY_LINE_CARD_API_USAGE')
    realtime_html = _read_arch('pages/realtime.html')
    trains_html = _read_arch('pages/trains.html')
    for page_name, page_src, filter_id, list_id in [
        ('realtime', realtime_html, 'realtimeFilterBar', 'realtimeStatusContainer'),
        ('trains', trains_html, 'trainsFilterBar', 'trainsLineListContent'),
    ]:
        shell_pattern = r'class="pixel-card rs-line-list-shell"[\\s\\S]*?id="' + filter_id + r'"[\\s\\S]*?id="' + list_id + r'"'
        if not re.search(shell_pattern, page_src):
            new_errors.append('COMPONENT-003 LINE_LIST_SHELL_MISMATCH ' + page_name)
    if 'justify-content:center' not in style_src or '.rs-line-list-shell{padding:0;overflow:hidden;}' not in style_src:
        new_errors.append('COMPONENT-003 FILTER_LAYOUT_CONTRACT_MISSING')
    shell_pages = (
        'pages/home.html', 'pages/history.html', 'pages/realtime.html', 'pages/trains.html',
        'pages/tourism-event.html', 'pages/tourism-shop.html', 'pages/tourism-spot.html',
    )
    for page in shell_pages:
        page_src = _read_arch(page)
        if 'js/site-shell.js' in page_src:
            if 'window.SiteShell.mount()' in page_src:
                new_errors.append('SHELL-001 INLINE_BOOTSTRAP_REINTRODUCED %s' % page)
            for mount in ('header', 'navigation', 'footer'):
                if 'data-site-shell-mount="%s"' % mount not in page_src:
                    new_errors.append('SHELL-001 MIGRATED_PAGE_MOUNT_MISSING %s %s' % (page, mount))
            if '<header class="pixel-header"' in page_src:
                new_errors.append('SHELL-001 DUPLICATE_HEADER_AFTER_MIGRATION %s' % page)
            if '<nav class="pixel-tabs"' in page_src:
                new_errors.append('SHELL-001 DUPLICATE_NAV_AFTER_MIGRATION %s' % page)
            if '<footer class="pixel-footer"' in page_src:
                new_errors.append('SHELL-001 DUPLICATE_FOOTER_AFTER_MIGRATION %s' % page)

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

    # TRAIN-001: one TrainMarker per physical train per render pass, with
    # exactly two artwork states (vehicle PNG / generic train SVG). A broken
    # PNG swaps that single marker to generic artwork in place; geometry and
    # vehicle identity stay upstream. The guard protects the contract, not the
    # exact spelling of local variables, and never requires the retired
    # "circle" vocabulary.
    if 'kind: iconSrc && !artworkFailed ? "vehicle" : "generic"' not in renderer_src:
        new_errors.append('TRAIN-001 TRAIN_MARKER_ARTWORK_BINARY_MISSING')
    if 'iconSrc ? "image" : "circle"' in renderer_src or 'outer.setAttribute("r", "8")' in renderer_src:
        new_errors.append('TRAIN-001 LEGACY_CIRCLE_TRAIN_MARKER_REINTRODUCED')
    if 'data-marker-kind' not in renderer_src:
        new_errors.append('TRAIN-001 TRAIN_MARKER_KIND_ATTRIBUTE_MISSING')
    if 'addEventListener("error"' not in renderer_src or '_swapTrainMarkerToGeneric' not in renderer_src or '_artworkSwapped' not in renderer_src:
        new_errors.append('TRAIN-001 PNG_ERROR_GENERIC_FALLBACK_MISSING')
    if 'replaceChild(g, marker)' not in renderer_src:
        new_errors.append('TRAIN-001 PNG_ERROR_OVERLAY_OR_DUAL_MARKER')
    if 'train-dot' in renderer_src or 'train-point' in renderer_src:
        new_errors.append('TRAIN-001 LEGACY_TRAIN_DOT_MARKER_REINTRODUCED')

    # VEHICLE-001/002: one final vehicle authority and one canonical evidence resolver.
    if 'TrainOperationEvidence.resolveEvidence' not in estimator_src:
        new_errors.append('VEHICLE-002 CANONICAL_EVIDENCE_RESOLVER_BYPASSED')
    if 'TRAIN_OPERATION_EVIDENCE_PROVIDERS' in estimator_src or 'TRAIN_OPERATION_EVIDENCE_PROVIDERS' in fusion_src:
        new_errors.append('VEHICLE-002 DIRECT_PROVIDER_TRAVERSAL_OUTSIDE_CANONICAL_RESOLVER')
    if 'structuralVehicleType' in vehicle_src or 'structuralVehicleType' in fusion_src or 'structuralVehicleType' in estimator_src:
        new_errors.append('VEHICLE-002 STRUCTURAL_IDENTITY_DIRECT_INJECTION')
    if 'timetableVehicleType: chainVehicle.vehicleName' in estimator_src:
        new_errors.append('VEHICLE-002 FORMATION_EVIDENCE_RELABELED_AS_TIMETABLE')
    if 'pos.vehicleResolution = chainVehicle;' not in estimator_src or "pos.vehicleSource = chainVehicle.source || 'formation-evidence';" not in estimator_src:
        new_errors.append('VEHICLE-002 FORMATION_PROVENANCE_PROJECTION_MISSING')

    # VEHICLE-003: renderer consumes resolved identity only.
    if 'TrainVehicle.resolve(_vrCtx)' in renderer_src:
        new_errors.append('VEHICLE-003 RENDERER_VEHICLE_RERESOLUTION')
    if '__trainIconCache' in renderer_src:
        new_errors.append('VEHICLE-003 RENDERER_IDENTITY_CACHE')

    # VEHICLE-004: one running-chain registry commit path.
    # One registry writer plus one post-arbitration commit call. Do not count
    # incidental mentions/comments; protect the single-writer behavior instead.
    if 'function _rememberChainVehicle(p)' not in fusion_src:
        new_errors.append('VEHICLE-004 RUNNING_CHAIN_REGISTRY_WRITER_MISSING')
    commit_calls = fusion_src.count('_rememberChainVehicle(_chainVehicleCandidates[_cid])')
    if commit_calls != 1:
        new_errors.append('VEHICLE-004 POST_ARBITRATION_COMMIT_COUNT=%d' % commit_calls)
    for forbidden in ('_rememberChainVehicle(_formationCandidate)', '_rememberChainVehicle(_rp)',
                      '_rememberChainVehicle(positionData)'):
        if forbidden in fusion_src:
            new_errors.append('VEHICLE-004 SECOND_REGISTRY_COMMIT %s' % forbidden)

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
    if '_existingRank >= _incomingRank' not in fusion_src or '_sameVehicle' not in fusion_src:
        new_errors.append('VEHICLE-007 STRONGER_CHAIN_IDENTITY_PROTECTION_MISSING')
    # Canonical source membership must cover every priority tier. Keep this
    # insensitive to local formatting/branch layout while preserving the order.
    rank_pos = []
    for source in ('realtime', 'realtime-derived', 'structural', 'timetable', 'manual'):
        token = 'sources.indexOf("%s")' % source
        rank_pos.append(fusion_src.find(token))
    if any(pos < 0 for pos in rank_pos) or rank_pos != sorted(rank_pos):
        new_errors.append('VEHICLE-007 CANONICAL_SOURCE_PRIORITY_MISSING_OR_REORDERED')

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
