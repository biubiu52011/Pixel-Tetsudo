$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$json = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json
$spots = @($json.spots)

# 1) 数据引用的 basename 集合
$ref = @{}
foreach ($s in $spots) {
  if ($s.image) {
    $base = [System.IO.Path]::GetFileName($s.image)
    if (-not $ref.ContainsKey($base)) { $ref[$base] = @() }
    $ref[$base] += $s.name
  }
}

# 2) 目录实际文件集合（目录路径从数据 image 字段推导，避免脚本内日文字面量编码问题）
"debug: spots=$($spots.Count)"
$firstImg = ($spots | Where-Object { $_.image } | Select-Object -First 1).image
"debug: firstImg=$firstImg"
$relDir = $firstImg.Substring(0, $firstImg.LastIndexOf('/'))    # ../images/観光地
$relDir = $relDir -replace '^\.\./',''                          # images/観光地
$dir = Join-Path $root $relDir
$files = @{}
Get-ChildItem -LiteralPath $dir -File | ForEach-Object { $files[$_.Name] = $_.Length }

"=== A. 引用存在但文件缺失（破损引用）: $(($ref.Keys | Where-Object { -not $files.ContainsKey($_) }).Count) ==="
$ref.Keys | Where-Object { -not $files.ContainsKey($_) } | ForEach-Object { "MISSING: $_  <-  $($ref[$_] -join ' / ')" }

"`n=== B. 目录有文件但无任何条目引用（孤儿/未接入） + 模糊对应 ==="
$orphans = $files.Keys | Where-Object { -not $ref.ContainsKey($_) } | Sort-Object
$orphanReport = foreach ($o in $orphans) {
  $stem = [System.IO.Path]::GetFileNameWithoutExtension($o)
  $exact = $spots | Where-Object { $_.name -eq $stem } | Select-Object -First 1
  $fuzzy = $spots | Where-Object { $_.name -like "*$stem*" -or $stem -like "*$($_.name)*" } | Select-Object -First 2
  if ($exact) {
    "EXACT: $o  ->  [$($exact.tags -join ',')] $($exact.name)  img=$([bool]$exact.image)"
  } elseif ($fuzzy) {
    $names = ($fuzzy | ForEach-Object { "[$($_.tags -join ',')] $($_.name) img=$([bool]$_.image)" }) -join '  |  '
    "FUZZY: $o  ->  $names"
  } else {
    "NONE : $o ($($files[$o]) bytes)"
  }
}
"orphan count: $($orphans.Count)"
$orphanReport

"`n=== C. 条目无图（缺图）: ==="
foreach ($s in $spots) {
  if (-not $s.image) {
    $tp = 'spot'
    $tags = @($s.tags)
    if ($tags -contains 'event') { $tp = 'event' }
    elseif ($tags -contains 'mall') { $tp = 'spot' }
    elseif ($tags -contains 'food' -or $tags -contains 'shopping' -or $tags -contains 'play' -or $tags -contains 'cafe' -or $tags -contains 'restaurant' -or $tags -contains 'drink' -or $tags -contains 'bar' -or $tags -contains 'bakery' -or $tags -contains 'sweets' -or $tags -contains 'shop' -or $tags -contains 'hotel' -or $tags -contains 'local_specialty') { $tp = 'shop' }
    "NOIMG: [$tp] $($s.name)"
  }
}

"`n=== D. 引用文件名与条目名不一致（命名不规范候选）: ==="
foreach ($s in $spots) {
  if ($s.image) {
    $base = [System.IO.Path]::GetFileName($s.image)
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($base)
    if ($stem -ne $s.name -and $stem -notmatch [regex]::Escape($s.name.Substring(0, [Math]::Min(6, $s.name.Length)))) {
      "RENAME?: image='$base'  name='$($s.name)'"
    }
  }
}
