# ODPT API configured operators
$odptOperators = @("TokyoMetro", "TWR", "YokohamaMunicipal", "MIR", "TamaMonorail", "Yurikamome", "Toei")

# Current lines in line-control.js
$existingLines = @{
    "Yamanote" = "JR East"
    "KeihinTohoku" = "JR East"
    "Yokosuka" = "JR East"
    "ChuoRapid" = "JR East"
    "Saikyo" = "JR East"
    "Joban" = "JR East"
    "SobuLocal" = "JR East"
    "Keiyo" = "JR East"
    "Musashino" = "JR East"
    "ShonanShinjuku" = "JR East"
    "Takasaki" = "JR East"
    "Tsurumi" = "JR East"
    "Nambu" = "JR East"
    "Tokaido" = "JR East"
    "JobanLocal" = "JR East"
    "Ginza" = "Tokyo Metro"
    "Hibiya" = "Tokyo Metro"
    "Tozai" = "Tokyo Metro"
    "Chiyoda" = "Tokyo Metro"
    "Hanzomon" = "Tokyo Metro"
    "Namboku" = "Tokyo Metro"
    "Fukutoshin" = "Tokyo Metro"
    "Asakusa" = "Toei"
    "Mita" = "Toei"
    "Shinjuku" = "Toei"
    "Oedo" = "Toei"
    "Yurakucho" = "Tokyo Metro"
    "Yurikamome" = "Yurikamome"
    "SeibuShinjuku" = "Seibu"
    "Odawara" = "Odakyu"
    "Keio" = "Keio"
    "TobuIsesaki" = "Tobu"
    "TobuSkytree" = "Tobu"
    "TobuNikko" = "Tobu"
    "TokyuToyoko" = "Tokyu"
    "YokohamaBlue" = "Yokohama Municipal"
    "Keisei" = "Keisei"
    "SeibuIkebukuro" = "Seibu"
    "SeibuChichibu" = "Seibu"
    "SeibuTamako" = "Seibu"
    "SeibuTamagawa" = "Seibu"
    "OdakyuEnoshima" = "Odakyu"
    "TobuNoda" = "Tobu"
}

# ODPT operators and their expected lines
$expectedLines = @{
    "TokyoMetro" = @("Ginza", "Hibiya", "Tozai", "Chiyoda", "Hanzomon", "Namboku", "Fukutoshin", "Yurakucho", "Marunouchi")
    "Toei" = @("Asakusa", "Mita", "Shinjuku", "Oedo")
    "YokohamaMunicipal" = @("YokohamaBlue")
    "Yurikamome" = @("Yurikamome")
    "TWR" = @("Rinko")  # 東京臨海高速鉄道Rinko Line
    "MIR" = @("KasaiRinko")  # 首都圏新都市鉄道ひたちなか海浜鉄道
    "TamaMonorail" = @("TamaMonorail")  # 多摩都市モノレール
}

Write-Output "=== Missing Lines Analysis ==="
Write-Output ""

# Check Tokyo Metro
Write-Output "Tokyo Metro:"
$expectedLines["TokyoMetro"] | ForEach-Object {
    if (-not $existingLines.ContainsKey($_)) {
        Write-Output "  MISSING: $_"
    }
}

# Check Toei
Write-Output "Toei:"
$expectedLines["Toei"] | ForEach-Object {
    if (-not $existingLines.ContainsKey($_)) {
        Write-Output "  MISSING: $_"
    }
}

# Check other operators
@("TWR", "MIR", "TamaMonorail") | ForEach-Object {
    Write-Output "$_:"
    $expectedLines[$_] | ForEach-Object {
        if (-not $existingLines.ContainsKey($_)) {
            Write-Output "  MISSING: $_"
        }
    }
}

Write-Output ""
Write-Output "=== Summary ==="
Write-Output "Total existing lines: $($existingLines.Count)"
Write-Output "ODPT configured operators: $($odptOperators.Count)"
