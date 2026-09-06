import re

with open("js/search-ui.js", "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: result.path station display (line 212)
old1 = "html += '<div class=\"station-node\">' + station;"
new1 = """var _r1 = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(station, window.currentLang || 'ja') : null;
        html += '<div class="station-node">' + (window.escapeHtml(_r1 || station));"""
if old1 in content:
    content = content.replace(old1, new1)
    print("Fix 1 applied")
else:
    print("Fix 1 NOT FOUND")

# Fix 2: transfer node station display (line 228)
old2 = "html += '<div class=\"transfer-node\">' + t('search_result.transfer') + ' @ ' + window.escapeHtml(seg.station) + '</div>';"
new2 = """var _r2 = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.station, window.currentLang || 'ja') : null;
            html += '<div class="transfer-node">' + t('search_result.transfer') + ' @ ' + window.escapeHtml(_r2 || seg.station) + '</div>';"""
if old2 in content:
    content = content.replace(old2, new2)
    print("Fix 2 applied")
else:
    print("Fix 2 NOT FOUND")

# Fix 3: ride segment from/to display (line 240)
old3 = "html += '<span class=\"ride-route\">' + window.escapeHtml(seg.fromStation) + ' → ' + window.escapeHtml(seg.toStation) + '</span>';"
new3 = """var _r3f = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.fromStation, window.currentLang || 'ja') : null;
            var _r3t = (window.RailwayDB && window.RailwayDB.resolveStationName) ? window.RailwayDB.resolveStationName(seg.toStation, window.currentLang || 'ja') : null;
            html += '<span class="ride-route">' + window.escapeHtml(_r3f || seg.fromStation) + ' → ' + window.escapeHtml(_r3t || seg.toStation) + '</span>';"""
if old3 in content:
    content = content.replace(old3, new3)
    print("Fix 3 applied")
else:
    print("Fix 3 NOT FOUND - checking for unicode arrow")
    # Try with the unicode character
    old3b = "html += '<span class=\"ride-route\">' + window.escapeHtml(seg.fromStation) + ' \u2192 ' + window.escapeHtml(seg.toStation) + '</span>';"
    if old3b in content:
        content = content.replace(old3b, new3)
        print("Fix 3 applied (unicode)")
    else:
        print("Fix 3 still NOT FOUND")
        # Show what we have
        idx = content.find("ride-route")
        if idx >= 0:
            print("Found ride-route at index", idx)
            print("Context:", repr(content[idx-20:idx+100]))

with open("js/search-ui.js", "w", encoding="utf-8") as f:
    f.write(content)
print("File written.")
