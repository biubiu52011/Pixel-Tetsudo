$ErrorActionPreference = 'Stop'
$ua = 'PixelRailwayImageBot/1.0 (maintenance; contact: project owner)'
$queries = @(
  @{ key = 'toyo'; q = '東洋百貨店' },
  @{ key = 'shelter'; q = '下北沢SHELTER' }
)
foreach ($it in $queries) {
  $url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + [uri]::EscapeDataString($it.q) + '&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600&format=json'
  try {
    $r = Invoke-RestMethod -Uri $url -Headers @{ 'User-Agent' = $ua } -TimeoutSec 30
    if ($r.query -and $r.query.pages) {
      $pages = $r.query.pages.PSObject.Properties | Where-Object { $_.Value.imageinfo -and $_.Value.imageinfo[0].mime -eq 'image/jpeg' } | Select-Object -First 3
      foreach ($p in $pages) {
        $ii = $p.Value.imageinfo[0]
        $thumb = if ($ii.thumburl) { $ii.thumburl } else { $ii.url }
        "$($it.key)|$($p.Value.title)|$thumb|$($ii.width)x$($ii.height)"
      }
    } else {
      "$($it.key)|NONE"
    }
  } catch {
    "$($it.key)|ERR|$($_.Exception.Message)"
  }
}
