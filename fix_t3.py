import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

src = open("js/translations.js", encoding="utf-8").readlines()
out = []
i = 0
while i < len(src):
    n = i + 1
    L = src[i]
    if n == 166 and L.strip() == "},":
        for op in en_ops:
            out.append(op)
        out.append(L)
        i += 1
        continue
    if 167 <= n <= 189:
        i += 1
        continue
    if n == 349 and L.strip() == "},":
        for op in zh_ops:
            out.append(op)
        out.append(L)
        i += 1
        continue
    if 350 <= n <= 372:
        i += 1
        continue
    if n == 532 and L.strip() == "},":
        for op in ja_ops:
            out.append(op)
        out.append(L)
        i += 1
        continue
    if 533 <= n <= 555:
        i += 1
        continue
    if n == 716:
        i += 1
        continue
    if n == 739 and L.strip() == "":
        for op in ko_ops:
            out.append(op)
        out.append(L)
        i += 1
        continue
    if 717 <= n <= 738:
        i += 1
        continue
    out.append(L)
    i += 1
open("js/translations.js", "w", encoding="utf-8").writelines(out)
print("Original:", len(src), "Fixed:", len(out))

def op(k, v):
    return "      " + ""op." + k + "": " + "" + v + ""," + chr(10)"

en_ops = [
    op("JR-East", "JR East"),
    op("JR-West", "JR West"),
    op("JR West", "JR West"),
    op("TokyoMetro", "Tokyo Metro"),
    op("Toei", "Toei Subway"),
    op("Seibu", "Seibu Railway"),
    op("Tobu", "Tobu Railway"),
    op("Tokyu", "Tokyu Railway"),
    op("Keio", "Keio Corporation"),
    op("Odakyu", "Odakyu Railway"),
    op("Keisei", "Keisei Railway"),
    op("Keikyu", "Keikyu Railway"),
    op("Sotetsu", "Sotetsu Railway"),
    op("YokohamaMunicipal", "Yokohama Municipal Subway"),
    op("TWR", "Tokyo Waterfront New Transit"),
    op("MinatoMirai", "Minato Mirai Line"),
    op("MIR", "Minato Mirai Line"),
    op("Rinkai", "Rinkai Line"),
    op("TsukubaExpress", "Tsukuba Express"),
    op("Yurikamome", "Yurikamome"),
    op("TamaMonorail", "Tama Monorail"),
    op("ShonanMonorail", "Shonan Monorail"),
]

zh_ops = [
    op("JR-East", "JR东日本"),
    op("JR-West", "JR西日本"),
    op("JR West", "JR西日本"),
    op("TokyoMetro", "东京地铁"),
    op("Toei", "都营地铁"),
    op("Seibu", "西武铁道"),
    op("Tobu", "东武铁道"),
    op("Tokyu", "东急电铁"),
    op("Keio", "京王电铁"),
    op("Odakyu", "小田急电铁"),
    op("Keisei", "京成电铁"),
    op("Keikyu", "京急电铁"),
    op("Sotetsu", "相铁"),
    op("YokohamaMunicipal", "横滨市营地铁"),
    op("TWR", "百合鸥号"),
    op("MinatoMirai", "港未来线"),
    op("MIR", "港未来线"),
    op("Rinkai", "临海线"),
    op("TsukubaExpress", "筑波快线"),
    op("Yurikamome", "百合鸥号"),
    op("TamaMonorail", "多摩单轨电车"),
    op("ShonanMonorail", "湘南单轨电车"),
]

ja_ops = [
    op("JR-East", "JR東日本"),
    op("JR-West", "JR西日本"),
    op("JR West", "JR西日本"),
    op("TokyoMetro", "東京メトロ"),
    op("Toei", "都営地下鉄"),
    op("Seibu", "西武鉄道"),
    op("Tobu", "東武鉄道"),
    op("Tokyu", "東急電鉄"),
    op("Keio", "京王電鉄"),
    op("Odakyu", "小田急電鉄"),
    op("Keisei", "京成電鉄"),
    op("Keikyu", "京急電鉄"),
    op("Sotetsu", "相鉄"),
    op("YokohamaMunicipal", "横浜市営地下鉄"),
    op("TWR", "ゆりかもめ"),
    op("MinatoMirai", "港未来線"),
    op("MIR", "港未来線"),
    op("Rinkai", "臨海線"),
    op("TsukubaExpress", "筑波エキスポ"),
    op("Yurikamome", "ゆりかもめ"),
    op("TamaMonorail", "多摩モノレール"),
    op("ShonanMonorail", "湘南モノレール"),
]

ko_ops = [
    op("JR-East", "JR동일본"),
    op("JR-West", "JR서일본"),
    op("JR West", "JR서일본"),
    op("TokyoMetro", "도쿄메트로"),
    op("Toei", "도에이 지하철"),
    op("Seibu", "세이부 철도"),
    op("Tobu", "토부 철도"),
    op("Tokyu", "도큐 전차"),
    op("Keio", "게이오 전차"),
    op("Odakyu", "오다큐 전차"),
    op("Keisei", "게이세이 전차"),
    op("Keikyu", "게이큐 전차"),
    op("Sotetsu", "소테쓰"),
    op("YokohamaMunicipal", "요코하마 시영 지하철"),
    op("TWR", "유리카모메"),
    op("MinatoMirai", "민토미라이 선"),
    op("MIR", "민토미라이 선"),
    op("Rinkai", "린카이 선"),
    op("TsukubaExpress", "쓰쿠바 익스프레스"),
    op("Yurikamome", "유리카모메"),
    op("TamaMonorail", "타마 모노레일"),
    op("ShonanMonorail", "쇼난 모노레일"),
]