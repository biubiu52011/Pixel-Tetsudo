$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$json = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json
$spots = @($json.spots)

# 孤儿文件名（与审计 B 组一致）
$orphans = @(
  'BETTARA STAND 日本橋.jpg','BOOK AND BED TOKYO.jpg','MANIKA FACTORY.jpg','PostCoffee Offline Store.jpg','unsaule.jpg',
  'アーバイン東京・上野 北千住.jpg','アイノワール.jpg','アパホテル〈綾瀬駅前〉.jpg','かがりび – kagaribi – 北千住 Guest House.jpg',
  'じんがんなわ祭.jpg','スマイルホテル東京綾瀬駅前.jpg','ドーミーインEXPRESS 草加City.jpg','ホテル・ココ・グラン北千住.jpg',
  'ホテルリブマックス東京綾瀬駅前.jpg','むらからまちから館.jpg','東京メトロ特設ブース（エーラウンド・マーケット）.jpg',
  '東武ホテルレバント東京.jpg','鹿浜の獅子舞.jpg','平日昼だけ.jpg','浅草たい焼き工房 求楽（ぐらく）.jpg','浅草ビューホテル.jpg',
  '軽トラ市.jpg','下北沢.jpg','閻魔祭.jpg','銀座.jpg'
)

"=== 孤儿文件名 vs 数据条目名（精确/包含匹配） ==="
foreach ($o in $orphans) {
  $stem = [System.IO.Path]::GetFileNameWithoutExtension($o)
  $match = $spots | Where-Object { $_.name -eq $stem }
  $fuzzy = $spots | Where-Object { $_.name -like "*$stem*" -or $stem -like "*$($_.name)*" } | Select-Object -First 3
  if ($match) {
    "EXACT: $o  ->  [$($match.tags -join ',')] $($match.name)  (hasImage=$([bool]$match.image))"
  } elseif ($fuzzy) {
    $names = ($fuzzy | ForEach-Object { "[$($_.tags -join ',')] $($_.name) img=$([bool]$_.image)" }) -join '  |  '
    "FUZZY: $o  ->  $names"
  } else {
    "NONE : $o"
  }
}

"`n=== 特殊文件名被谁引用 ==="
foreach ($probe in @('365 Anniversary.jpg','mic.jpg')) {
  $hits = $spots | Where-Object { $_.image -and ([System.IO.Path]::GetFileName($_.image) -eq $probe) }
  if ($hits) { "REF: $probe <- $($hits.name)" } else { "UNREF: $probe" }
}
