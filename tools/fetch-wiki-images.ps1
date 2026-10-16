$ErrorActionPreference = 'Stop'
$items = @(
  @{ name = '東京スカイツリー'; wiki = '東京スカイツリー' },
  @{ name = '東洋百貨店 別館'; wiki = '東洋百貨店' },
  @{ name = '本多劇場'; wiki = '本多劇場' },
  @{ name = '下北沢SHELTER'; wiki = '下北沢SHELTER' },
  @{ name = '隅田川花火大会'; wiki = '隅田川花火大会' },
  @{ name = '三社祭（浅草神社例大祭）'; wiki = '三社祭' },
  @{ name = '浅草サンバカーニバル パレードコンテスト'; wiki = '浅草サンバカーニバル' },
  @{ name = '神宮外苑花火大会'; wiki = '神宮外苑花火大会' },
  @{ name = '東京高円寺阿波おどり'; wiki = '高円寺阿波おどり' }
)
$ua = 'PixelRailwayImageBot/1.0 (maintenance; contact: project owner)'
foreach ($it in $items) {
  $url = 'https://ja.wikipedia.org/w/api.php?action=query&titles=' + [uri]::EscapeDataString($it.wiki) + '&prop=pageimages&format=json&pithumbsize=1600&redirects=1'
  try {
    $r = Invoke-RestMethod -Uri $url -Headers @{ 'User-Agent' = $ua } -TimeoutSec 30
    $pages = $r.query.pages
    $page = $pages.PSObject.Properties | Select-Object -First 1
    $p = $page.Value
    if ($p.thumbnail -and $p.thumbnail.source) {
      $src = $p.thumbnail.source
      # 1600px 版本 URL
      $src1600 = $src -replace '/\d+px-', '/1600px-'
      "$($it.name)|$($p.title)|$src1600"
    } else {
      "NONE|$($it.name)|$($it.wiki)|no thumbnail"
    }
  } catch {
    "ERR|$($it.name)|$($it.wiki)|$($_.Exception.Message)"
  }
}
