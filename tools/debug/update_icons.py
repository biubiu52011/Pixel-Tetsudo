import re

icon_map = {
    "Yamanote": "images/鉄道/JR東日本/山手線.png",
    "KeihinTohoku": "images/鉄道/JR東日本/京浜東北線.png",
    "Yokosuka": "images/鉄道/JR東日本/東海道線.png",
    "ChuoRapid": "images/鉄道/JR東日本/中央快速線 青梅線 五日市線.png",
    "Saikyo": "images/鉄道/JR東日本/埼京線.png",
    "Joban": "images/鉄道/JR東日本/常盤線快速.png",
    "SobuLocal": "images/鉄道/JR東日本/中央・総武線各駅停車.png",
    "Keiyo": "images/鉄道/JR東日本/京葉線.png",
    "Musashino": "images/鉄道/JR東日本/武蔵野線.png",
    "ShonanShinjuku": "images/鉄道/JR東日本/湘南新宿ライン.png",
    "Takasaki": "images/鉄道/JR東日本/宇都宮線.png",
    "Tsurumi": "images/鉄道/JR東日本/鶴見線.png",
    "Nambu": "images/鉄道/JR東日本/南武線.png",
    "Tokaido": "images/鉄道/JR東日本/総武線快速横須賀線.png",
    "JobanLocal": "images/鉄道/JR東日本/常盤緩行線.png",
    "Ginza": "images/鉄道/東京メトロ/銀座線.png",
    "Marunouchi": "images/鉄道/東京メトロ/丸ノ内線.png",
    "Hibiya": "images/鉄道/東京メトロ/日比谷線.png",
    "Yurakucho": "images/鉄道/東京メトロ/有楽町線.png",
    "Tozai": "images/鉄道/東京メトロ/東西線.png",
    "Asakusa": "images/鉄道/東京メトロ/浅草線.png",
    "Mita": "images/鉄道/都営地下鉄/都営三田線.png",
    "Shinjuku": "images/鉄道/都営地下鉄/都営新宿線.png",
    "Oedo": "images/鉄道/都営地下鉄/都営大江戸線.png",
    "Yurikamome": "images/鉄道/ゆりかもせ/ゆりかもせ.png",
    "SeibuShinjuku": "images/鉄道/西武鉄道/新宿線 ハイジマ線.png",
    "Odawara": "images/鉄道/小田急電鉄/小田原.png",
    "Keio": "images/鉄道/京王電鉄/山口線.png",
    "TobuIsesaki": "images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
    "TobuSkytree": "images/鉄道/東武鉄道/東武スカイツリーライン 亀戸線 大志線.png",
    "TobuNikko": "images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png",
    "TokyuToyoko": "images/鉄道/東急電鉄/東横線.png",
    "YokohamaBlue": "images/鉄道/横浜市交通局/ブルーライン.png",
    "Keisei": "images/鉄道/京成電鉄/東条本線 おごせ線.png",
    "SeibuIkebukuro": "images/鉄道/西武鉄道/池袋線 西武秩父線 西武有楽町線 豊島線 佐山線.png",
    "SeibuChichibu": "images/鉄道/西武鉄道/野田線.png",
    "SeibuTamako": "images/鉄道/西武鉄道/玉子線.png",
    "SeibuTamagawa": "images/鉄道/西武鉄道/玉川線.png",
    "SeibuEnoshima": "images/鉄道/西武鉄道/西武園線.png",
    "SeibuNoda": "images/鉄道/西武鉄道/野田線.png",
}

with open(r"C:\\Users\\80996\\Documents\\项目\\像素铁道\\data\\line-control.js", "r", encoding="utf-8") as f:
    content = f.read()

count = 0
for line_id, icon_path in icon_map.items():
    # 查找 line_id 的位置
    idx = content.find('"' + line_id + '":')
    if idx >= 0:
        # 在 line_id 后 300 字符内查找并替换 image
        search_region = content[idx:idx+300]
        if "image:" in search_region:
            # 替换 image 路径
            new_region = re.sub(r'image:\s*"[^"]+"', 'image: "' + icon_path + '"', search_region)
            content = content[:idx] + new_region + content[idx+300:]
            count += 1
            print(f"Updated {line_id}: {icon_path}")

with open(r"C:\\Users\\80996\\Documents\\项目\\像素铁道\\data\\line-control.js", "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nTotal updated: {count} icons")
