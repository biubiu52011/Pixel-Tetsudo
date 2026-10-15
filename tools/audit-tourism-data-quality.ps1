$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$json = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json
$spots = @($json.spots)

$SHOP = @('food','restaurant','cafe','sweets','drink','bar','bakery','local_specialty','shopping','shop','hotel','play')
function Get-Type([object]$s) {
  $explicit = $null
  if ($s.tourismType) { $explicit = $s.tourismType } elseif ($s.category) { $explicit = $s.category } elseif ($s.type) { $explicit = $s.type } elseif ($s.kind) { $explicit = $s.kind }
  if ($explicit) {
    $v = ([string]$explicit).Trim().ToLower()
    if ($v -eq 'sight' -or $v -eq 'sights' -or $v -eq 'landmark') { return 'spot' }
    if ($v -eq 'store' -or $v -eq 'restaurant' -or $v -eq 'gourmet') { return 'shop' }
    if ($v -eq 'event') { return 'event' }
    if ($v -eq 'shop' -or $v -eq 'spot') { return $v }
  }
  $tags = @($s.tags)
  if ($tags -contains 'event') { return 'event' }
  foreach ($t in $SHOP) { if ($tags -contains $t) { return 'shop' } }
  return 'spot'
}

$missing = @{}
$typeStats = @{}
foreach ($s in $spots) {
  $tp = Get-Type $s
  if (-not $typeStats.ContainsKey($tp)) { $typeStats[$tp] = 0 }
  $typeStats[$tp]++
  foreach ($f in @('desc','hours','fee','bestTime','address','coord','image','tips')) {
    $has = $true
    if ($f -eq 'coord') { $has = ($s.coord -and $s.coord.Count -ge 2 -and [double]$s.coord[0] -ne 0) }
    elseif ($f -eq 'desc') { $has = [bool]$s.desc -or [bool]$s.desc_i18n }
    elseif ($f -eq 'hours') { $has = [bool]$s.hours -or [bool]$s.hours_i18n }
    elseif ($f -eq 'fee') { $has = [bool]$s.fee -or [bool]$s.fee_i18n }
    elseif ($f -eq 'bestTime') { $has = [bool]$s.bestTime -or [bool]$s.bestTime_i18n }
    elseif ($f -eq 'address') { $has = [bool]$s.address }
    elseif ($f -eq 'image') { $has = [bool]$s.image }
    elseif ($f -eq 'tips') { $has = [bool]$s.tips }
    if (-not $has) {
      $key = "$tp|$f"
      if (-not $missing.ContainsKey($key)) { $missing[$key] = @() }
      $missing[$key] += $s.name
    }
  }
}
"type counts: $($typeStats | ConvertTo-Json -Compress)"
"--- missing field summary (type|field : count) ---"
$missing.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Key) : $($_.Value.Count)" }
"--- details (max 8 names each) ---"
$missing.GetEnumerator() | Sort-Object Name | ForEach-Object { $names = $_.Value | Select-Object -First 8; "$($_.Key) [$($_.Value.Count)]: $($names -join ' / ')" }
