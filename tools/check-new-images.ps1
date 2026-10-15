$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$json = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json
$firstImg = $json.spots[0].image
$dir = Join-Path $root (($firstImg.Substring(0, $firstImg.LastIndexOf('/')) -replace '^\.\./',''))
$names = @('東京スカイツリー.jpg','東洋百貨店 別館.jpg','本多劇場.jpg','下北沢SHELTER.jpg','隅田川花火大会.jpg','三社祭（浅草神社例大祭）.jpg','浅草サンバカーニバル パレードコンテスト.jpg','神宮外苑花火大会.jpg','東京高円寺阿波おどり.jpg')
foreach ($n in $names) {
  $p = Join-Path $dir $n
  if (Test-Path -LiteralPath $p) {
    $len = (Get-Item -LiteralPath $p).Length
    "OK | $n | $len"
  } else {
    "MISSING | $n"
  }
}
