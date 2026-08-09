# Pixel Tetsudo - Generate timetable data for train-data.js
$lineControlContent = Get-Content 'C:\Users\80996\OneDrive\文档\项目\像素铁道\data\line-control.js' -Raw
$trainDataContent = Get-Content 'C:\Users\80996\OneDrive\文档\项目\像素铁道\data\train-data.js' -Raw

$linesInfo = @{}
$linePattern = '"(\w+)":\s*\{[^}]*stations:\s*\[(.*?)\],\s*durations:\s*Array\((\d+)\)\.fill\((\d+)\)'
foreach ($m in [regex]::Matches($lineControlContent, $linePattern, 'Singleline')) {
    $stations = $m.Groups[2].Value -split ',' | ForEach-Object { $_.Trim().Trim('"') }
    $durCount = [int]$m.Groups[3].Value
    $durPerSeg = [int]$m.Groups[4].Value
    $cumulative = @(0)
    for ($i = 0; $i -lt $durCount; $i++) {
        $cumulative += $cumulative[-1] + $durPerSeg
    }
    $linesInfo[$m.Groups[1].Value] = @{ stations = $stations; cumulative = $cumulative; totalMin = $durCount * $durPerSeg }
}

$trains = @{}
$trainLinePattern = '"(\w+)":\s*\[([\s\S]*?)\]'
foreach ($m in [regex]::Matches($trainDataContent, $trainLinePattern)) {
    $trainEntries = [regex]::Matches($m.Groups[2].Value, '\{([^}]+)\}')
    $trainList = @()
    foreach ($tm in $trainEntries) {
        $entry = $tm.Groups[1].Value
        $idM = [regex]::Match($entry, 'id:"(\w+)"')
        $typeM = [regex]::Match($entry, 'type:"([^"]+)"')
        $destM = [regex]::Match($entry, 'destination:"([^"]+)"')
        $carsM = [regex]::Match($entry, 'cars:(\d+)')
        $delayM = [regex]::Match($entry, 'delay:(\d+)')
        $departM = [regex]::Match($entry, 'departAt:(\d+)')
        if ($idM.Success) {
            $trainList += @{
                id = $idM.Groups[1].Value
                type = if ($typeM.Success) { $typeM.Groups[1].Value } else { '普通' }
                destination = if ($destM.Success) { $destM.Groups[1].Value } else { '' }
                cars = if ($carsM.Success) { [int]$carsM.Groups[1].Value } else { 8 }
                delay = if ($delayM.Success) { [int]$delayM.Groups[1].Value } else { 0 }
                departAt = if ($departM.Success) { [int]$departM.Groups[1].Value } else { 540 }
            }
        }
    }
    $trains[$m.Groups[1].Value] = $trainList
}

$allTrains = @{}
foreach ($lineId in $trains.Keys) {
    if (-not $linesInfo.ContainsKey($lineId)) { continue }
    $line = $linesInfo[$lineId]
    $timetable = @()
    foreach ($train in $trains[$lineId]) {
        $stops = @()
        for ($i = 0; $i -lt $line.stations.Count; $i++) {
            $station = $line.stations[$i]
            $baseArrival = $train.departAt + $line.cumulative[$i]
            $arrival = ($baseArrival + $train.delay) % 1440
            $stops += @{ station = $station; arrival = $arrival; departure = ($arrival + 1) % 1440 }
        }
        $timetable += @{ id = $train.id; type = $train.type; destination = $train.destination; cars = $train.cars; delay = $train.delay; departAt = $train.departAt; totalStations = $line.stations.Count; stops = $stops }
    }
    $allTrains[$lineId] = $timetable
}

$parts = @('window.TRAIN_LINES = {};', 'window.TRAINS = {')
foreach ($lineId in ($allTrains.Keys | Sort-Object)) {
    $parts += '  "' + $lineId + '": ['
    $trains = $allTrains[$lineId]
    for ($i = 0; $i -lt $trains.Count; $i++) {
        $t = $trains[$i]
        $stopsStr = ($t.stops | ForEach-Object { '        {station:"' + $_.station + '",arrival:' + $_.arrival + ',departure:' + $_.departure + '}' }) -join ','
        $parts += '    {id:"' + $t.id + '",type:"' + $t.type + '",destination:"' + $t.destination + '",cars:' + $t.cars + ',delay:' + $t.delay + ',departAt:' + $t.departAt + ',totalStations:' + $t.totalStations + ',stops:[' + $stopsStr + '    ]}'
        if ($i -lt $trains.Count - 1) { $parts[-1] += ',' }
    }
    $parts += '  ],'
}
$parts += '};'
$output = $parts -join "`n"
$output | Out-File -FilePath 'C:\Users\80996\OneDrive\文档\项目\像素铁道\data\train-data.js' -Encoding UTF8
# 输出信息
# 输出信息
Write-Host "Generated train-data.js"
# 输出信息
# 输出信息
Write-Host "Lines: $($allTrains.Keys.Count)"
