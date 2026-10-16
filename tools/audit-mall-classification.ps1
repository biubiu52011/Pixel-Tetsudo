$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$json = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json
$spots = @($json.spots)
$SHOP = @('food','restaurant','cafe','sweets','drink','bar','bakery','local_specialty','shopping','shop','hotel','play')

function Get-Type([object]$s) {
  $explicit = $null
  if ($s.tourismType) { $explicit = $s.tourismType }
  elseif ($s.category) { $explicit = $s.category }
  elseif ($s.type) { $explicit = $s.type }
  elseif ($s.kind) { $explicit = $s.kind }
  if ($explicit) {
    $v = ([string]$explicit).Trim().ToLower()
    if ($v -eq 'sight' -or $v -eq 'sights' -or $v -eq 'landmark') { return 'spot' }
    if ($v -eq 'store' -or $v -eq 'restaurant' -or $v -eq 'gourmet') { return 'shop' }
    if ($v -eq 'event') { return 'event' }
    if ($v -eq 'shop' -or $v -eq 'spot') { return $v }
  }
  $tags = @($s.tags)
  if ($tags -contains 'event') { return 'event' }
  # 4.3.1242: 百货商场优先归景点（mall 标签优先于店铺标签）
  if ($tags -contains 'mall') { return 'spot' }
  foreach ($t in $SHOP) { if ($tags -contains $t) { return 'shop' } }
  return 'spot'
}

$counts = @{ event = 0; shop = 0; spot = 0 }
$mall = @()
$shopping = @()
foreach ($s in $spots) {
  $tp = Get-Type $s
  $counts[$tp]++
  $tags = @($s.tags)
  if ($tags -contains 'mall') {
    $mall += [pscustomobject]@{ name = $s.name; tags = ($tags -join ','); type = $tp; tourismType = $s.tourismType; category = $s.category }
  }
  if ($tags -contains 'shopping') {
    $shopping += [pscustomobject]@{ name = $s.name; tags = ($tags -join ','); type = $tp }
  }
}
"type counts (current logic): event=$($counts.event) shop=$($counts.shop) spot=$($counts.spot)"
"--- mall-tagged entries: $($mall.Count) ---"
$mall | Format-Table -AutoSize | Out-String -Width 220
"--- shopping-tagged entries: $($shopping.Count) ---"
$shopping | Format-Table -AutoSize | Out-String -Width 220
