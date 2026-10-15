$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$list = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'tools\download-list.json') | ConvertFrom-Json
$firstImg = (Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json).spots[0].image
$relDir = ($firstImg.Substring(0, $firstImg.LastIndexOf('/')) -replace '^\.\./','')
$dir = Join-Path $root $relDir
$ua = 'PixelRailwayImageBot/1.0 (maintenance; contact: project owner)'
foreach ($it in $list) {
  $out = Join-Path $dir ($it.name + '.jpg')
  try {
    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add('User-Agent', $ua)
    $wc.DownloadFile($it.url, $out)
    $len = (Get-Item -LiteralPath $out).Length
    $ok = if ($len -gt 10000) { 'OK' } else { 'TOO-SMALL' }
    "{0} | {1} | {2} bytes" -f $ok, $it.name, $len
  } catch {
    "FAIL | $($it.name) | $($_.Exception.Message)"
    if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force }
  }
}
