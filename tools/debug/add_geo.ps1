# 添加地理坐标数据
$tourismJsPath = "C:\Users\80996\OneDrive\文档\项目\像素铁道\js\tourism.js"
$content = Get-Content $tourismJsPath -Raw

$newFuncs = @"

    function findNearestStation(lat, lon) {
        if (!window.TOURISM_DATA) return null;
        var best = null, bestDist = Infinity;
        Object.keys(window.TOURISM_DATA).forEach(function(key) {
            var data = window.TOURISM_DATA[key];
            if (data.coord) {
                var d = Math.sqrt(Math.pow(lat - data.coord[0], 2) + Math.pow(lon - data.coord[1], 2));
                if (d < bestDist) { bestDist = d; best = key; }
            }
        });
        return best;
    }

    function initLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                var lat = pos.coords.latitude, lon = pos.coords.longitude;
                var nearest = findNearestStation(lat, lon);
                if (nearest) {
                    currentStation = nearest;
                    var sel = document.getElementById('tourismStation');
                    if (sel) sel.value = nearest;
                    var locLabel = document.getElementById('tourismLocLabel');
                    if (locLabel) {
                        var data = getStationData(nearest);
                        locLabel.textContent = '当前位置：' + (data ? data.name : nearest) + ' 附近的景点';
                    }
                    renderSpots();
                }
            }, function() {}, { timeout: 5000 });
        }
    }
"@

if ($content -notlike '*initLocation*') {
    $content = $content -replace '    // Expose to window for potential external use', $newFuncs + "`n    // Expose to window for potential external use"
    $content = $content -replace '        // Initial render`, `n        renderSpots();', '        // Initial render`, `n        renderSpots();`, `n        // Try geolocation`, `n        initLocation();'
# 设置数据
# 设置数据
    Set-Content $tourismJsPath -Value $content -Encoding UTF8
# 输出信息
# 输出信息
    Write-Host "tourism.js updated with geolocation"
} else {
# 输出信息
# 输出信息
    Write-Host "Already has geolocation"
}
