import re

path = r"C:\Users\80996\Documents\项目\像素铁道\js\translations.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

op_trans = {
    "en": [
        ("JR-East", "JR East"),
        ("JR-West", "JR West"),
        ("TokyoMetro", "Tokyo Metro"),
        ("Toei", "Toei Subway"),
        ("Seibu", "Seibu Railway"),
        ("Tobu", "Tobu Railway"),
        ("Tokyu", "Tokyu Corporation"),
        ("Keio", "Keio Corporation"),
        ("Odakyu", "Odakyu Electric Railway"),
        ("Keisei", "Keisei Electric Railway"),
        ("Keikyu", "Keikyu Corporation"),
        ("Sotetsu", "Sotetsu Railway"),
        ("YokohamaMunicipal", "Yokohama Municipal Subway"),
        ("TWR", "Yurikamome"),
        ("MinatoMirai", "Minato Mirai Line"),
        ("MIR", "MIR Liner"),
        ("Rinkai", "Rinkai Line"),
        ("TsukubaExpress", "Tsukuba Express"),
        ("Yurikamome", "Yurikamome"),
        ("TamaMonorail", "Tama Monorail"),
        ("ShonanMonorail", "Shonan Monorail"),
    ],
    "zh": [
        ("JR-East", "JR东日本"),
        ("JR-West", "JR西日本"),
        ("TokyoMetro", "东京地铁"),
        ("Toei", "都营地铁"),
        ("Seibu", "西武铁道"),
        ("Tobu", "东武铁道"),
        ("Tokyu", "东急电铁"),
        ("Keio", "京王电铁"),
        ("Odakyu", "小田急电铁"),
        ("Keisei", "京成电铁"),
        ("Keikyu", "京急电铁"),
        ("Sotetsu", "相铁"),
        ("YokohamaMunicipal", "横滨市营地铁"),
        ("TWR", "百合海鸥号"),
        ("MinatoMirai", "港未来线"),
        ("MIR", "MIR Liner"),
        ("Rinkai", "临海线"),
        ("TsukubaExpress", "筑波快线"),
        ("Yurikamome", "百合海鸥号"),
        ("TamaMonorail", "多摩单轨电车"),
        ("ShonanMonorail", "湘南单轨电车"),
    ],
    "ja": [
        ("JR-East", "JR東日本"),
        ("JR-West", "JR西日本"),
        ("TokyoMetro", "東京メトロ"),
        ("Toei", "都営地下鉄"),
        ("Seibu", "西武鉄道"),
        ("Tobu", "東武鉄道"),
        ("Tokyu", "東急電鉄"),
        ("Keio", "京王電鉄"),
        ("Odakyu", "小田急電鉄"),
        ("Keisei", "京成電鉄"),
        ("Keikyu", "京浜急行電鉄"),
        ("Sotetsu", "相模鉄道"),
        ("YokohamaMunicipal", "横浜市営地下鉄"),
        ("TWR", "ゆりかもめ"),
        ("MinatoMirai", "港未来线"),
        ("MIR", "ミライナイン"),
        ("Rinkai", "りんかい線"),
        ("TsukubaExpress", "つくばエクスプレス"),
        ("Yurikamome", "ゆりかもめ"),
        ("TamaMonorail", "多摩モノレール"),
        ("ShonanMonorail", "湘南モノレール"),
    ],
    "ko": [
        ("JR-East", "JR동일본"),
        ("JR-West", "JR서일본"),
        ("TokyoMetro", "도쿄 메트로"),
        ("Toei", "도영 지하철"),
        ("Seibu", "세이부 철도"),
        ("Tobu", "도부 철도"),
        ("Tokyu", "도큐 전철"),
        ("Keio", "게이오 전철"),
        ("Odakyu", "오다큐 전철"),
        ("Keisei", "게이세이 전철"),
        ("Keikyu", "게이힌 급행 전철"),
        ("Sotetsu", "소테츠 철도"),
        ("YokohamaMunicipal", "요코하마 시영 지하철"),
        ("TWR", "유리카모메"),
        ("MinatoMirai", "포트 미라이 라인"),
        ("MIR", "미라이나인"),
        ("Rinkai", "린카이 라인"),
        ("TsukubaExpress", "츠쿠바 익스프레스"),
        ("Yurikamome", "유리카모메"),
        ("TamaMonorail", "타마 모노레일"),
        ("ShonanMonorail", "쇼난 모노레일"),
    ],
}

# For each language section, insert op.* translations before "filter.all"
for lang, ops in op_trans.items():
    # Build the insertion text
    lines = []
    for op_id, op_name in ops:
        lines.append('      "op.' + op_id + '": "' + op_name + '",')
    insert_text = "\n" + "\n".join(lines)
    
    # Find and replace: the line containing config.hint_url for this lang, 
    # insert before "filter.all" on same line
    # Pattern: find the config.hint_url line and insert after it, before filter.all
    pattern = r'(      "config\.hint_url": "[^"]*",)(\s+"filter\.all")'
    replacement = r'\1' + insert_text + r'\2'
    content = re.sub(pattern, replacement, content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done. translations.js updated.")
