# Pixel Tetsudo - Generate timetable data
$lineData = @{
    "Yamanote" = @{stations=@("品川","高輪ゲートウェイ","田町","浜松町","新橋","有楽町","東京","神田","秋葉原","御徒町","上野","鶯谷","日暮里","西日暮里","田端","駒込","巣鴨","大塚","池袋","目白","高田馬場","新宿","代々木","原宿","渋谷","恵比寿","目黒","五反田","大井町");dur=2;trains=@(@{id="JY01";t="普通";d="池袋";c=8;delay=0;dep=540},@{id="JY02";t="快速";d="渋谷";c=10;delay=0;dep=555},@{id="JY03";t="普通";d="新宿";c=8;delay=2;dep=570},@{id="JY04";t="普通";d="品川";c=8;delay=0;dep=585},@{id="JY05";t="快速";d="田端";c=10;delay=0;dep=600},@{id="JY06";t="普通";d="上野";c=8;delay=1;dep=615},@{id="JY07";t="普通";d="日暮里";c=8;delay=0;dep=630},@{id="JY08";t="快速";d="高田馬場";c=10;delay=0;dep=645})}
    "KeihinTohoku" = @{stations=@("大宮","与野","浦和","南浦和","蕨","戸田公園","赤羽","十条","桶川","北本","鴻巣","熊谷","鷲宮","蓮田","土呂","上野","御徒町","秋葉原","神田","有楽町","新橋","浜松町","田町","高輪ゲートウェイ","品川","大井町","西大宮","武蔵小杉","川崎");dur=2;trains=@(@{id="JK01";t="快速";d="大宮";c=11;delay=0;dep=540},@{id="JK02";t="普通";d="川崎";c=8;delay=0;dep=555},@{id="JK03";t="快速";d="上野";c=11;delay=2;dep=570},@{id="JK04";t="普通";d="大宮";c=8;delay=0;dep=585},@{id="JK05";t="快速";d="川崎";c=11;delay=0;dep=600},@{id="JK06";t="普通";d="上野";c=8;delay=1;dep=615},@{id="JK07";t="快速";d="大宮";c=11;delay=0;dep=630},@{id="JK08";t="普通";d="川崎";c=8;delay=0;dep=645},@{id="JK09";t="快速";d="上野";c=10;delay=3;dep=700})}
    "Yokosuka" = @{stations=@("東京","新橋","品川","鶴見","横浜","久里浜");dur=4;trains=@(@{id="JO01";t="普通";d="横須賀";c=10;delay=0;dep=540},@{id="JO02";t="快速";d="東京";c=10;delay=0;dep=560},@{id="JO03";t="普通";d="久里浜";c=8;delay=2;dep=580},@{id="JO04";t="快速";d="東京";c=10;delay=0;dep=600},@{id="JO05";t="普通";d="横須賀";c=8;delay=0;dep=620})}
    "ChuoRapid" = @{stations=@("東京","神田","御茶ノ水","神保町","飯田橋","曙橋","新宿","渋谷","中野","高円寺","阿佐ケ谷","荻窪","吉祥寺","武蔵境","三鷹","調布","飛田給","府中","国分寺","国立","立川");dur=2;trains=@(@{id="JC01";t="快速";d="立川";c=10;delay=0;dep=540},@{id="JC02";t="快速";d="東京";c=10;delay=0;dep=555},@{id="JC03";t="快速";d="吉祥寺";c=10;delay=1;dep=570},@{id="JC04";t="快速";d="立川";c=10;delay=0;dep=585},@{id="JC05";t="快速";d="東京";c=10;delay=0;dep=600},@{id="JC06";t="快速";d="高円寺";c=10;delay=2;dep=615},@{id="JC07";t="快速";d="立川";c=10;delay=0;dep=630},@{id="JC08";t="快速";d="東京";c=10;delay=0;dep=645})}
    "Saikyo" = @{stations=@("大宮","与野","浦和","南浦和","蕨","赤羽","十条","池袋","新宿","渋谷","大崎","武蔵浦和");dur=3;trains=@(@{id="JA01";t="快速";d="大宮";c=10;delay=0;dep=540},@{id="JA02";t="普通";d="渋谷";c=8;delay=0;dep=555},@{id="JA03";t="快速";d="大宮";c=10;delay=1;dep=570},@{id="JA04";t="普通";d="渋谷";c=8;delay=0;dep=585},@{id="JA05";t="快速";d="大宮";c=10;delay=0;dep=600},@{id="JA06";t="普通";d="渋谷";c=8;delay=3;dep=615})}
    "Joban" = @{stations=@("東京","上野","日暮里","駒込","北千住","綾瀬","高砂","八潮","八千代台東","新三郷","南越谷","越谷","越谷駅","南流山","流山セントラルパーク","流山駅","柏","新柏","取手");dur=3;trains=@(@{id="JJ01";t="快速";d="取手";c=10;delay=0;dep=540},@{id="JJ02";t="快速";d="東京";c=10;delay=0;dep=558},@{id="JJ03";t="快速";d="取手";c=10;delay=2;dep=576},@{id="JJ04";t="快速";d="東京";c=10;delay=0;dep=594},@{id="JJ05";t="快速";d="取手";c=10;delay=0;dep=612},@{id="JJ06";t="快速";d="東京";c=10;delay=1;dep=630},@{id="JJ07";t="快速";d="取手";c=10;delay=0;dep=648})}
}

function GenerateTrain($lineId, $info) {
    $output = "  `"$lineId`": ["
    $first = $true
    foreach ($train in $info.trains) {
        if (-not $first) { $output += "," }
        $first = $false
        $stops = @()
        for ($i = 0; $i -lt $info.stations.Count; $i++) {
            $arrival = $train.dep + $i * $info.dur + $train.delay
            $stops += "{`"station`":`"$($info.stations[$i])`",`"arrival`":$arrival,`"departure`":$($arrival+1)}"
        }
        $output += "{`"id`":`"$($train.id)`",`"type`":`"$($train.t)`",`"destination`":`"$($train.d)`",`"cars`":$($train.c),`"delay`":$($train.delay),`"departAt`":$($train.dep),`"totalStations`":$($info.stations.Count),`"stops`":[$($stops -join ",")]}"
    }
    $output += "  ]"
    return $output
}

$out = "window.TRAIN_LINES = {};" + [char]10 + "window.TRAINS = {"
$keys = $lineData.Keys | Sort-Object
for ($k = 0; $k -lt $keys.Count; $k++) {
    $lineId = $keys[$k]
    if ($k -gt 0) { $out += "," }
    $out += [char]10 + (GenerateTrain $lineId $lineData[$lineId])
}
$out += [char]10 + "};"
$out | Out-File -FilePath "C:\Users\80996\OneDrive\文档\项目\像素铁道\data\train-data.js" -Encoding UTF8
# 输出信息
# 输出信息
Write-Host "Generated train-data.js"
# 输出信息
# 输出信息
Write-Host "Lines: $($keys.Count)"
# 输出信息
# 输出信息
Write-Host "Total trains: $($lineData.Values | ForEach-Object { $_.trains.Count } | Measure-Object -Sum).Sum"
