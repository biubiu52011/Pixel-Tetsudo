$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$json = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json
$spots = @($json.spots)
$rows = foreach ($s in $spots) {
  $explicit = if ($s.tourismType) { $s.tourismType } elseif ($s.category) { $s.category } elseif ($s.type) { $s.type } elseif ($s.kind) { $s.kind } else { '' }
  [pscustomobject]@{ index = $spots.IndexOf($s); name = $s.name; explicit = $explicit; tags = (@($s.tags) -join ','); hasImage = [bool]$s.image; station = $s.station; coord = if ($s.coord) { ($s.coord -join ',') } else { '' } }
}
$rows | Format-Table -AutoSize | Out-String -Width 260 | Set-Content -Encoding UTF8 (Join-Path $root 'tools\tourism-spots-dump.txt')
"dumped $($rows.Count) rows"
