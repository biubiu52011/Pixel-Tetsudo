import sys
sys.stdout.reconfigure(encoding="utf-8")
c = open("js/station-resolver.js", encoding="utf-8").read()

# Fix 1: major station fallback
c = c.replace(
    'var fid = _MAJOR_STATION_FALLBACK[q];\n        return [{ stationId: fid, displayName: fid, status: "EXACT" }];',
    'var fid = _MAJOR_STATION_FALLBACK[q];\n        var normFid = _normalizeId(fid);\n        return [{ stationId: normFid, displayName: fid, status: "EXACT" }];'
)

# Fix 2: jpToEn resolve
c = c.replace(
    'if (_jpToEn[q]) {\n        return [{ stationId: _jpToEn[q], displayName: _jpToEn[q], status: "EXACT" }];',
    'if (_jpToEn[q]) {\n        var normJp = _normalizeId(_jpToEn[q]);\n        return [{ stationId: normJp, displayName: _jpToEn[q], status: "EXACT" }];'
)

# Fix 3: enToJp resolve
c = c.replace(
    'var jid = _jpToEn[jk] || qLower;\n      return [{ stationId: jid, displayName: jid, status: "ALIAS" }];',
    'var jid = _normalizeId(_jpToEn[jk] || qLower);\n      return [{ stationId: jid, displayName: jid, status: "ALIAS" }];'
)

open("js/station-resolver.js", "w", encoding="utf-8").write(c)
print("Done")
print("normFid:", "normFid" in c)
print("normJp:", "normJp" in c)
print("_normalizeId count:", c.count("_normalizeId"))