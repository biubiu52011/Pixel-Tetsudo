$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ua = 'PixelRailwayImageBot/1.0 (maintenance; contact: project owner)'

# 维基文件 title -> 目标文件名（条目名）
$files = @(
  @{ title = 'File:Honda_theater_shimokitazawa_2009.JPG'; target = '本多劇場.jpg' },
  @{ title = 'File:2012年隅田川花火大会.jpg'; target = '隅田川花火大会.jpg' },
  @{ title = 'File:三之宮神輿宮出し.JPG'; target = '三社祭（浅草神社例大祭）.jpg' },
  @{ title = 'File:Asakusa-Samba-Carnival-parade.jpg'; target = '浅草サンバカーニバル パレードコンテスト.jpg' },
  @{ title = 'File:Jingu_Fireworks_08-1.jpg'; target = '神宮外苑花火大会.jpg' },
  @{ title = 'File:2018_Kōenji.jpg'; target = '東京高円寺阿波おどり.jpg' }
)

$firstImg = (Get-Content -Raw -Encoding UTF8 (Join-Path $root 'data\core\tourism_data.json') | ConvertFrom-Json).spots[0].image
$relDir = ($firstImg.Substring(0, $firstImg.LastIndexOf('/')) -replace '^\.\./','')
$dir = Join-Path $root $relDir

foreach ($f in $files) {
  $api = 'https://ja.wikipedia.org/w/api.php?action=query&titles=' + [uri]::EscapeDataString($f.title) + '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&format=json&redirects=1'
  $r = Invoke-RestMethod -Uri $api -Headers @{ 'User-Agent' = $ua } -TimeoutSec 30
  $page = ($r.query.pages.PSObject.Properties | Select-Object -First 1).Value
  $ii = $page.imageinfo[0]
  $useUrl = $null
  if ($ii.thumburl) { $useUrl = $ii.thumburl } elseif ($ii.url) { $useUrl = $ii.url }
  "SRC: $($f.target) <- $useUrl ($($ii.width)x$($ii.height))"
  if (-not $useUrl) { continue }
  $out = Join-Path $dir $f.target
  $attempts = 0
  $ok = $false
  while ($attempts -lt 3 -and -not $ok) {
    $attempts++
    try {
      $wc = New-Object System.Net.WebClient
      $wc.Headers.Add('User-Agent', $ua)
      $wc.DownloadFile($useUrl, $out)
      $len = (Get-Item -LiteralPath $out).Length
      if ($len -gt 10000) {
        "DL-OK: $($f.target) | $len bytes (attempt $attempts)"
        $ok = $true
      } else {
        "DL-SMALL: $($f.target) | $len bytes"
        Remove-Item -LiteralPath $out -Force
      }
    } catch {
      "DL-FAIL: $($f.target) | attempt $attempts | $($_.Exception.Message)"
      if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force }
      Start-Sleep -Seconds 4
    }
  }
  Start-Sleep -Seconds 2
}
