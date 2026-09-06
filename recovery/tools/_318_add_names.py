import json, hashlib, re

# Read original file
with open('data/core/railway_data.json', 'r', encoding='utf-8') as f:
    content = f.read()

d = json.loads(content)
n = d['name_map']

# Load classification
r = json.load(open('recovery/reports/3.17_missing_station_classification.json', 'r', encoding='utf-8'))
classified = r['classified']
real_only = [x for x in classified if x['category'] in ('REAL_STATION', 'REAL_STATION_HYPHEN')]

# Japanese names mapping
jp = {
    'Adachi': '足立', 'Adachi-Kangura': '足立Kangura', 'Akabane-Iwabuchi': '赤羽岩淵',
    'Akebono': '曙', 'Aoba-dori': '青葉通', 'Aoto': '青戸', 'Azabu-Juban': '麻布十番',
    'Bay-Cross': 'ベイクロス', 'Chichibu': '秩父', 'Choju': '長寿', 'Chuo-Ku': '中央区',
    'Daizen-ji': '大善寺', 'Denno': '電波', 'Ekimae': '駅前', 'Fuchu': '府中',
    'Fuchubashi': '府中橋', 'Fudosan-mae': '不動山前', 'Futamata-gawa': '二俣川',
    'Ginza-hitchome': '銀座一丁目', 'Ginza-yonchome': '銀座四丁目', 'Hacchobori': '八丁堀',
    'Hachiman': '八幡', 'Hachiman-Honmachi': '八幡本町', 'Hachiman-gaika': '八幡外華',
    'Hama-Kawada': '浜川田', 'Harumi': '春海', 'Harumi-futago': '春海二子',
    'Higashi-Hachioji': '東八王子', 'Higashi-Ikebukuro': '東池袋', 'Higashi-Kawasaki': '東川崎',
    'Higashi-Maruko': '東丸島', 'Higashi-Shinbashi': '東新橋', 'Higashi-Yamatokoji': '東大和駅',
    'Higashi-Yokosuka': '東横須賀', 'Higashi-gotanda': '東品川', 'Higashi-murayama': '東村山',
    'Higashi-nihonbashi': '東日本橋', 'Hikaridai': '光が丘', 'Hiroo': '広尾',
    'Hitotsubashi': '一の橋', 'Hon-Jo': '本城', 'Hongo-dai': '本郷台', 'Ikeda': '池田',
    'Inokashira': '井の頭', 'Iruma': '入間', 'Iruma-shi': '入間市', 'Ishikawadai': '石川台',
    'Iwatsunomachi': '岩久保町', 'Kacho-mae': '花鳥前', 'Kanagawa-NewTown': '神奈川県ニュータウン',
    'Karasuyama': '烏山', 'Kasai-Rinkai': '葛西臨海', 'Kasminato': '風早南',
    'Keio-Hachioji': '京王八王子', 'Keisei-Tsukawa': '京成津川', 'Kimachi': '木町',
    'Kinshi': '金砂', 'Kishibojin': '岸本神社', 'Kissaki': '首頸', 'Kita-Aoi': '北青井',
    'Kita-Otsuka': '北大塚', 'Kita-Saitama': '北さいたま', 'Kita-Sendai': '北仙台',
    'Kita-Yamato': '北大和', 'Kita-Zushi': '北逗子', 'Kitasendai': '北仙台的',
    'Kitasenju': '北千住', 'Koji': '工房', 'Koji-mae': '工房前', 'Kokkai-gijido': '国会議事堂',
    'Kokumin-kyogijo': '国民会議場', 'Kokusai-Tenjijo': '国際展示場', 'Komazawa': '駒沢',
    'Konan-dai': '河南台', 'Kotaki': '小滝', 'Koto-shibari': '江東縛り', 'Kototoi': '言知',
    'Kumagaya': '熊谷', 'Kuroiso': '黒磯', 'Maebashi': '前橋', 'Makuhari Seaside': '幕張海浜',
    'Makuhari-Hong': '幕張本郷', 'Makuhari-hongo': '幕張本郷新', 'Matsuda': '松田',
    'Meguro-Dai': '目黒台', 'Mejiro-dai': '目白台', 'Midoricho': '緑町', 'Midoridai': '緑ヶ丘',
    'Midosuji': '御堂筋', 'Mikawahashi': '三河橋', 'Minami-Kemigawa': '南亀浦',
    'Minami-Koiwa': '南小岩', 'Minami-Magome': '南馬込', 'Minami-Nagasaki': '南長崎',
    'Minami-Wakasu': '南若洲', 'Minato-Mirai-21': 'みなとみらい21', 'Minowa-shita': '箕輪下',
    'Miraikai': '未来海', 'Mitarashi': '御駄志', 'Miura-Kaigan': '三崎港', 'Miyagi': '宮城',
    'Motomachi-Chukagai': '元町中国街', 'Mukaiminato': '向岬', 'Mukojima': '向島',
    'Musashi-Hikita': '武蔵日向', 'Musashi-Mitsuwadai': '武蔵三澤台',
    'Musashi-Nakagawa': '武蔵中川', 'Musashi-Saiwai': '武蔵彩輝',
    'Musashi-Yamanaka': '武蔵山中', 'Musashi-Yoshida': '武蔵吉田', 'Musashi-sakai': '武蔵堺',
    'Musashino': '武蔵野', 'Musashinurare': '武蔵ニューレ', 'Musashisakai': '武蔵堺新',
    'Musashynuigami': '武蔵新上', 'Nagasaki': '長崎', 'Nagatoro': '長瀞',
    'Naka-mejima': '中目島', 'Nakahara': '中原', 'Nakameguro': '中目黒',
    'Nakano-Sakaue': '中野坂上', 'Nakatsu': '中津', 'Nambu': '南武', 'Narashino': '成相野',
    'Nihon-odori': '日本通り', 'Nihonbashi': '日本橋', 'Nijubashimae': '二重橋前',
    'Nikko': '日光', 'Nishi-Akiru': '西秋留', 'Nishi-Fuchubashi': '西府中橋',
    'Nishi-Ikebukuro': '西池袋', 'Nishi-Kasai': '西葛西', 'Nishi-Kawasaki': '西川崎',
    'Nishi-Kichijoji': '西吉祥寺', 'Nishi-Koiwa': '西小岩', 'Nishi-Magome': '西馬込',
    'Nishi-Nakajima': '西中島', 'Nishi-Ome': '西青梅', 'Nishi-Shinjuku': '西新宿',
    'Nishi-Takashimadaira': '西高島平', 'Nishi-Totsuka': '西戸塚', 'Nishi-fuchu': '西府',
    'Nishi-fushimi': '西伏見', 'Nishi-koen': '西公園', 'Nishi-kokubunji': '西国分寺',
    'Nishi-takahashimadaira': '西高橋平', 'Nishi-takaido': '西高尾', 'Nishifujisawa': '西藤沢',
    'Odaiba-Kaihinkoen': 'お台場海浜公園', 'Oi': '大井', 'Okutama-gochi': '奥多摩口',
    'Okutama-guchi': '奥多摩口新', 'Omiya': '大宮', 'Omotesando': '表参道', 'Oshida': '大島',
    'Saitama': '埼玉', 'Sakae': '栄', 'Sakai': '堺', 'Sakuragi-cho': '桜木町',
    'Sangenjaya': '三軒茶屋', 'Sayama': '狭山', 'Seibu-Chausuyama': '西武茶山',
    'Seibu-Chitose': '西武千歳', 'Seibu-Hikawa': '西武日光', 'Seibu-Nakagawa': '西武中原',
    'Seibu-Yuuyamada': '西武湯ヶ谷', 'Seijo': '聖学院', 'Seijo-shijo': '聖学院四条',
    'Seijodai': '聖学院台', 'Shimo-Kitazzu': '下北沢', 'Shimoda': '下田',
    'Shin-Adachi': '新足立', 'Shin-Machiya': '新町屋', 'Shin-Misaki': '新崎',
    'Shin-Nihonbashi': '新日本橋', 'Shin-Ochanomizu': '神保町', 'Shin-Okachimachi': '新御徒町',
    'Shin-Urawa': '新浦和', 'Shin-juku': '新宿', 'Shin-juku-nishiguchi': '新宿西口',
    'Shin-juku-sanchome': '新宿三丁目', 'Shin-kawasaki': '新川崎', 'Shin-kiba': '新木場',
    'Shin-otemachi': '新大手町', 'Shin-rinkan': '新林間', 'ShinKemigawa': '新亀浦',
    'ShinKiba': '新木場新', 'Shinbashi': '新橋', 'Shiogama': '塩釜', 'Shiroi': '白井',
    'Shirokane-Takanawa': '白金高輪', 'Tadachi': '立派', 'Taishakuten': '帝釈天',
    'Takahashimadaira': '高橋平', 'Takahatafujimidai': '高畑富士見台', 'Takanawa': '高輪',
    'Takanawa-Gateway': '高輪ゲートウェイ', 'Takaradai': '宝ケ丘', 'Takasaki': '高崎',
    'Tama-Center': '多摩センター', 'Tamagawa-Enzei-ji': '多摩川円蔵寺', 'Tatekawa': '立川',
    'Tateshina': '立科', 'Tobata': '戸畑', 'Tokigawa': '時川', 'Tokiwabashi': '常盤橋',
    'Tokyo': '東京', 'Tokyo Dome-mae': '東京ドーム前', 'Tokyo-Teleport': '東京テレポート',
    'Toyo-su': '豊洲', 'Tsukamoto': '塚本', 'Ueno': '上野', 'Ueno-Okachimachi': '上野御徒町',
    'Umeda': '梅田', 'Utsunomiya': '宇都宮', 'Wada': '和田', 'Wakasu': '若洲',
    'Yanaka': '谷中', 'Yanauchi': '柳内', 'Yokoami': '横渚', 'Yokojimma': '横島',
    'Yokosuka-Chuo': '横須賀中央', 'Yoshiwara': '吉原', 'Yoyogi-Uehara': '代々木上原',
    'Yuki': '雪', 'Yukinoshita': '雪之下'
}

existing_values = set(n.values())
new_items = []
for item in real_only:
    sid = item['station_id']
    if sid in jp and sid not in existing_values:
        new_items.append((jp[sid], sid))

print(f'New entries: {len(new_items)}')

# Insert into JSON text preserving formatting
old_sha = hashlib.sha256(open('data/core/railway_data.json', 'rb').read()).hexdigest().upper()[:16]

# Find name_map section and insert before closing
lines = content.split('\n')
in_name_map = False
name_map_start = -1
name_map_end = -1
indent_level = 0

for i, line in enumerate(lines):
    if '"name_map"' in line and '{' in line:
        in_name_map = True
        name_map_start = i
        # Count indentation
        name_map_end = i
    elif in_name_map:
        name_map_end = i
        if line.strip() == '}' and i > name_map_start:
            # Check if this is the end of name_map (not nested)
            stripped = line.strip()
            if stripped == '}' or (stripped.startswith('},') and '"stationLines"' not in content[name_map_end+1:name_map_end+50]):
                break

# Find the last entry before closing brace
insert_pos = name_map_end
for i in range(name_map_end, name_map_start, -1):
    if lines[i].strip().startswith('"') and '->' not in lines[i] and ':' in lines[i]:
        insert_pos = i + 1
        break

# Build new entries text
new_lines = []
for k, v in sorted(new_items, key=lambda x: x[0]):
    new_lines.append(f'    "{k}": "{v}",')

# Insert before the closing brace line
insert_text = '\n'.join(new_lines) + '\n'

# Find where to insert - after the last existing entry
# Look for the pattern: last "key": "value" line before closing }
last_entry_line = -1
for i in range(name_map_end - 1, name_map_start, -1):
    if lines[i].strip().endswith(',') and '"' in lines[i] and ':' in lines[i]:
        last_entry_line = i
        break

if last_entry_line >= 0:
    # Remove the trailing comma from the last entry
    lines[last_entry_line] = lines[last_entry_line].rstrip().rstrip(',')
    # Insert new entries
    insert_at = last_entry_line + 1
    for idx, new_line in enumerate(insert_text.strip().split('\n')):
        lines.insert(insert_at + idx, new_line)
    # Add closing brace
    lines.insert(insert_at + len(insert_text.strip().split('\n')), '  },')
    # Remove the old closing brace
    del lines[last_entry_line + len(insert_text.strip().split('\n')) + 1]
else:
    print('Could not find insertion point')
    lines = content.split('\n')

new_content = '\n'.join(lines)

# Verify
d2 = json.loads(new_content)
new_sha = hashlib.sha256(open('data/core/railway_data.json', 'rb').read()).hexdigest().upper()[:16] if False else hashlib.sha256(new_content.encode('utf-8')).hexdigest().upper()[:16]

print(f'Old SHA: {old_sha}')
print(f'New SHA: {new_sha}')
print(f'name_map entries: {len(d2["name_map"])}')
covered = len(set(d2['stations'].keys()) & set(d2['name_map'].values()))
print(f'Stations covered: {covered}/{len(d2["stations"])}')

# Write
with open('data/core/railway_data.json', 'w', encoding='utf-8') as f:
    f.write(new_content)
