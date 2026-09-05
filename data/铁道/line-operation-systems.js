/*
 * Line Operation Systems - Presentation Layer
 * DO NOT MODIFY railway_data.json
 * This file defines how lines are displayed, grouped, and ordered.
 * line_id references are canonical identifiers from railway_data.json
 */

/* global window */
window.LineOperationSystems = {
  JR_EAST: [
    {
      code: 'JA',
      nameJa: '埼京線・川越線',
      nameZh: '埼京线・川越线',
      nameEn: 'Saikyo Line / Kawagoe Line',
      nameKo: '사이쿄선 / 가와고에선',
      color: '#00ac47',
      lineIds: ["Saikyo", "Kawagoe"],
      order: 1
    },
    {
      code: 'JB',
      nameJa: '中央・総武線（各駅停車）',
      nameZh: '中央・总武线（各站停车）',
      nameEn: 'Chuo-Sobu Local Line',
      nameKo: '추오-sobu 로컬 라인',
      color: '#00a0de',
      lineIds: ["ChuoSobuLocal"],
      order: 2
    },
    {
      code: 'JC',
      nameJa: '中央線（快速）',
      nameZh: '中央线（快速）',
      nameEn: 'Chuo Rapid Line',
      nameKo: '추오 rapida 라인',
      color: '#f15a00',
      lineIds: ["ChuoRapid", "ChuoKonosu"],
      order: 3
    },
    {
      code: '',
      nameJa: '青梅線',
      nameZh: '青梅线',
      nameEn: 'Ome Line',
      nameKo: '오메선',
      color: '#dd6935',
      lineIds: ["Ome"],
      order: 4
    },
    {
      code: '',
      nameJa: '五日市線',
      nameZh: '五日市线',
      nameEn: 'Itsukaichi Line',
      nameKo: '이쓰카이치선',
      color: '#dd6935',
      lineIds: ["Itsukaichi"],
      order: 5
    },
    {
      code: 'JE',
      nameJa: '京葉線',
      nameZh: '京叶线',
      nameEn: 'Keiyo Line',
      nameKo: '케이요선',
      color: '#c9252f',
      lineIds: ["Keiyo"],
      order: 6
    },
    {
      code: 'JH',
      nameJa: '横浜線',
      nameZh: '横滨线',
      nameEn: 'Yokohama Line',
      nameKo: '요코하마선',
      color: '#00a050',
      lineIds: ["Kanagawa"],
      order: 7
    },
    {
      code: 'JI',
      nameJa: '鶴見線',
      nameZh: '鹤见线',
      nameEn: 'Tsurumi Line',
      nameKo: '츠루미선',
      color: '#fbd05d',
      lineIds: ["Tsurumi"],
      order: 8
    },
    {
      code: 'JJ',
      nameJa: '常磐線（快速）',
      nameZh: '常磐线（快速）',
      nameEn: 'Joban Rapid Line',
      nameKo: '_joban rapida 라인',
      color: '#00b261',
      lineIds: ["Joban"],
      order: 9
    },
    {
      code: 'JK',
      nameJa: '京浜東北線・根岸線',
      nameZh: '京滨东北线・根岸线',
      nameEn: 'Keihin-Tohoku Line / Negishi Line',
      nameKo: 'keihin-tohoku 라인 / negishi선',
      color: '#00b2e5',
      lineIds: ["KeihinTohoku"],
      order: 10
    },
    {
      code: 'JL',
      nameJa: '常磐線（各駅停車）',
      nameZh: '常磐线（各站停车）',
      nameEn: 'Joban Local Line',
      nameKo: 'joban local 라인',
      color: '#a8a39d',
      lineIds: ["JobanLocal"],
      order: 11
    },
    {
      code: 'JM',
      nameJa: '武蔵野線',
      nameZh: '武藏野线',
      nameEn: 'Musashino Line',
      nameKo: '무사시노선',
      color: '#f15a22',
      lineIds: ["Musashino"],
      order: 12
    },
    {
      code: 'JN',
      nameJa: '南武線',
      nameZh: '南武线',
      nameEn: 'Nambu Line',
      nameKo: '난부선',
      color: '#fbd05d',
      lineIds: ["Nambu"],
      order: 13
    },
    {
      code: 'JO',
      nameJa: '横須賀線・総武快速線',
      nameZh: '横须贺线・总武快速线',
      nameEn: 'Yokosuka Line / Sobu Rapid Line',
      nameKo: '요코스카선 / sobu rapida 라인',
      color: '#007ac1',
      lineIds: ["Yokosuka", "SobuRapid"],
      order: 14
    },
    {
      code: 'JS',
      nameJa: '湘南新宿ライン',
      nameZh: '湘南新宿ライン',
      nameEn: 'Shonan-Shinjuku Line',
      nameKo: 'shonan-shinjuku 라인',
      color: '#e31f26',
      lineIds: ["ShonanShinjuku"],
      order: 15
    },
    {
      code: 'JT',
      nameJa: '東海道線',
      nameZh: '东海道线',
      nameEn: 'Tokaido Line',
      nameKo: '도카이도선',
      color: '#f0862b',
      lineIds: ["Tokaido"],
      order: 16
    },
    {
      code: 'JU',
      nameJa: '宇都宮線・高崎線',
      nameZh: '宇都宫线・高崎线',
      nameEn: 'Utsunomiya Line / Takasaki Line',
      nameKo: '우치노미야선 / 타카사키선',
      color: '#f18e41',
      lineIds: ["Oyama", "Takasaki"],
      order: 17
    },
    {
      code: 'JY',
      nameJa: '山手線',
      nameZh: '山手线',
      nameEn: 'Yamanote Line',
      nameKo: '야마노테선',
      color: '#80c342',
      lineIds: ["Yamanote"],
      order: 18
    },
    {
      code: 'REGIONAL',
      nameJa: 'その他JR東日本',
      nameZh: '其他JR东日本',
      nameEn: 'Other JR-East (Regional)',
      nameKo: '기타 JR동일본',
      color: '#888888',
      lineIds: ["Agatsuma", "BanetsuEast", "BanetsuWest", "Echigo", "Gono", "Hachinohe", "Hakushin", "Iiyama", "Ishinomaki", "Ito", "Joetsu", "Kamaishi", "Kamiishi", "Karasuyama", "Kashima", "Kesennuma", "Kiryu", "Komii", "Kounan", "Kururi", "Mito", "Miyo", "Narita", "Nikko", "Ofunato", "Oga", "Oito", "Ominato", "OuMain", "RikutoEast", "RikutsuWest", "Ryomo", "Sagami", "Sano", "Sanriku", "Senseki", "SensekiTohoku", "Senzan", "Shinetsu", "Shinonoi", "Suigun", "SuigunBranch", "Tazawako", "Tōnami", "Uetsu", "Yamagata", "Yonezawa", "Sotobo", "Uchibo", "Tsugaru", "TohokuMain", "SobuLocal"],
      order: 19,
      isRegional: true
    },
  ],
  TOKYO_METRO: [
    {
      code: 'G',
      nameJa: '銀座線',
      nameZh: '银座线',
      nameEn: 'Ginza Line',
      nameKo: '긴자선',
      color: '#ff9500',
      lineIds: ["Ginza"],
      order: 1
    },
    {
      code: 'M',
      nameJa: '丸ノ内線',
      nameZh: '丸之内线',
      nameEn: 'Marunouchi Line',
      nameKo: '마루노우치선',
      color: '#f62e36',
      lineIds: ["Marunouchi", "MarunouchiBranch"],
      order: 2
    },
    {
      code: 'H',
      nameJa: '日比谷線',
      nameZh: '日比谷线',
      nameEn: 'Hibiya Line',
      nameKo: '히비야선',
      color: '#c3c3c3',
      lineIds: ["Hibiya"],
      order: 3
    },
    {
      code: 'T',
      nameJa: '東西線',
      nameZh: '东西线',
      nameEn: 'Tozai Line',
      nameKo: ' تو자이선',
      color: '#009bc4',
      lineIds: ["Tozai"],
      order: 4
    },
    {
      code: 'C',
      nameJa: '千代田線',
      nameZh: '千代田线',
      nameEn: 'Chiyoda Line',
      nameKo: '치요다선',
      color: '#00bb85',
      lineIds: ["Chiyoda"],
      order: 5
    },
    {
      code: 'Y',
      nameJa: '有楽町線',
      nameZh: '有乐町线',
      nameEn: 'Yurakucho Line',
      nameKo: '유라쿠초선',
      color: '#d69141',
      lineIds: ["Yurakucho"],
      order: 6
    },
    {
      code: 'Z',
      nameJa: '半蔵門線',
      nameZh: '半藏门线',
      nameEn: 'Hanzomon Line',
      nameKo: '한조몬선',
      color: '#8f76d6',
      lineIds: ["Hanzomon"],
      order: 7
    },
    {
      code: 'N',
      nameJa: '南北線',
      nameZh: '南北线',
      nameEn: 'Namboku Line',
      nameKo: '난보쿠선',
      color: '#00ac9b',
      lineIds: ["Namboku"],
      order: 8
    },
    {
      code: 'F',
      nameJa: '副都心線',
      nameZh: '副都心线',
      nameEn: 'Fukutoshin Line',
      nameKo: '후쿠토신선',
      color: '#9c5e31',
      lineIds: ["Fukutoshin"],
      order: 9
    },
  ],
  TOEI: [
    {
      code: 'A',
      nameJa: '浅草線',
      nameZh: '浅草线',
      nameEn: 'Asakusa Line',
      nameKo: '아사쿠사선',
      color: '#ec6e65',
      lineIds: ["Asakusa"],
      order: 1
    },
    {
      code: 'M',
      nameJa: '三田線',
      nameZh: '三田线',
      nameEn: 'Mita Line',
      nameKo: '미타선',
      color: '#006cb6',
      lineIds: ["Mita"],
      order: 2
    },
    {
      code: 'S',
      nameJa: '新宿線',
      nameZh: '新宿线',
      nameEn: 'Shinjuku Line',
      nameKo: '신주쿠선',
      color: '#b0bf1e',
      lineIds: ["Shinjuku"],
      order: 3
    },
    {
      code: 'E',
      nameJa: '大江戸線',
      nameZh: '大江户线',
      nameEn: 'Oedo Line',
      nameKo: '오에도선',
      color: '#ce045b',
      lineIds: ["Oedo"],
      order: 4
    },
    {
      code: 'K',
      nameJa: '荒川線',
      nameZh: '荒川线',
      nameEn: 'Arakawa Line',
      nameKo: '아라카와선',
      color: '#e040a0',
      lineIds: ["Arakawa"],
      order: 5
    },
    {
      code: 'DA',
      nameJa: '都営浅草線（延伸）',
      nameZh: '都营浅草线（延伸）',
      nameEn: 'Toei Arakawa Line',
      nameKo: '도에이 아라카와선',
      color: '#ee86a7',
      lineIds: ["Do-Arakawa"],
      order: 6
    },
    {
      code: 'NT',
      nameJa: '西鉄新宿線',
      nameZh: '西铁新宿线',
      nameEn: 'Nippori-Toneri Liner',
      nameKo: '닌포리 토네리 라이너',
      color: '#cccccc',
      lineIds: ["Nippori_Toneri"],
      order: 7
    },
  ],
  SEIBU: [
    {
      code: 'SN',
      nameJa: '西武新宿線',
      nameZh: '西武新宿线',
      nameEn: 'Seibu Shinjuku Line',
      nameKo: '세이부 신주쿠선',
      color: '#01a6bf',
      lineIds: ["SeibuShinjuku"],
      order: 1
    },
    {
      code: 'SI',
      nameJa: '池袋線',
      nameZh: '池袋线',
      nameEn: 'Seibu Ikebukuro Line',
      nameKo: '세이부 이부쿠로선',
      color: '#ef7a00',
      lineIds: ["SeibuIkebukuro", "Ikebukuro", "SeibuToshima"],
      order: 2
    },
    {
      code: 'SM',
      nameJa: '多摩川線',
      nameZh: '多摩川线',
      nameEn: 'Seibu Tamagawa Line',
      nameKo: '세이부 다마가와선',
      color: '#01a6bf',
      lineIds: ["SeibuTamagawa"],
      order: 3
    },
    {
      code: 'SA',
      nameJa: '多摩湖線',
      nameZh: '多摩湖线',
      nameEn: 'Seibu Nakagawa Line',
      nameKo: '세이부 나카가와선',
      color: '#1ead4c',
      lineIds: ["SeibuNakagawa"],
      order: 4
    },
    {
      code: 'SC',
      nameJa: '秩父線',
      nameZh: '秩父线',
      nameEn: 'Seibu Chichibu Line',
      nameKo: '세이부 지치부선',
      color: '#ef7a00',
      lineIds: ["SeibuChichibu"],
      order: 5
    },
    {
      code: 'ST',
      nameJa: '狭山線',
      nameZh: '狭山线',
      nameEn: 'Seibu Tamako Line',
      nameKo: '세이부 탐ako선',
      color: '#ef7a00',
      lineIds: ["SeibuTamako"],
      order: 6
    },
    {
      code: 'SY',
      nameJa: '山口線',
      nameZh: '山口线',
      nameEn: 'Seibu Yamaguchi Line',
      nameKo: '세이부 야마구치선',
      color: '#e83e2f',
      lineIds: ["SeibuYamaguchi"],
      order: 7
    },
    {
      code: 'SHM',
      nameJa: '拝島線',
      nameZh: '拜岛线',
      nameEn: 'Hamura Line',
      nameKo: '하이마라인',
      color: '#8b4513',
      lineIds: ["Hamura"],
      order: 8
    },
    {
      code: 'SK',
      nameJa: '国分寺線',
      nameZh: '国分寺线',
      nameEn: 'Kokubunji Line',
      nameKo: '고분지선',
      color: '#cccccc',
      lineIds: ["Kokubunji"],
      order: 9
    },
    {
      code: 'SS',
      nameJa: '狭山線',
      nameZh: '狭山线',
      nameEn: 'Seibu Sayama Line',
      nameKo: '세이부 사야마선',
      color: '#0066cc',
      lineIds: ["Seibu_Sayama"],
      order: 10
    },
    {
      code: 'SSH',
      nameJa: '西武新宿線（直通）',
      nameZh: '西武新宿线（直通）',
      nameEn: 'Seibu Shinjuku Line (Through Service)',
      nameKo: '세이부 신주쿠선 직통',
      color: '#cccccc',
      lineIds: ["Seibu_Shinjuku"],
      order: 11
    },
    {
      code: 'YS',
      nameJa: '有楽町線',
      nameZh: '有乐町线',
      nameEn: 'Yurakucho Line (Seibu)',
      nameKo: '유라쿠초선 (세이부)',
      color: '#c6c6c6',
      lineIds: ["Yurakucho_Seibu"],
      order: 12
    },
    {
      code: 'SE',
      nameJa: '拝島線',
      nameZh: '拜岛线',
      nameEn: 'Seibu En Line',
      nameKo: '세이부 엔선',
      color: '#f7af0e',
      lineIds: ["SeibuEn"],
      order: 13
    },
  ],
  TOBU: [
    {
      code: 'TS',
      nameJa: '東武スカイツリーライン',
      nameZh: '东武Skyl Tree Line',
      nameEn: 'Tobu Skytree Line',
      nameKo: '도부 스카이트리 라인',
      color: '#0f6cc3',
      lineIds: ["TobuSkytree", "Skytree", "TobuNoda"],
      order: 1
    },
    {
      code: 'TI',
      nameJa: '東武伊勢崎線',
      nameZh: '东武伊势崎线',
      nameEn: 'Tobu Isesaki Line',
      nameKo: '도부 이세사키선',
      color: '#ff0000',
      lineIds: ["TobuIsesaki", "Isesaki"],
      order: 2
    },
    {
      code: 'TN',
      nameJa: '東武日光線',
      nameZh: '东武日光线',
      nameEn: 'Tobu Nikko Line',
      nameKo: '도부 닛코선',
      color: '#ffa600',
      lineIds: ["TobuNikko", "Nikkoku"],
      order: 3
    },
    {
      code: 'TTJ',
      nameJa: '東武東上線',
      nameZh: '东武东上线',
      nameEn: 'Tobu Tojo Line',
      nameKo: '도부 죠선',
      color: '#8b4513',
      lineIds: ["Tojo", "Utsunomiya"],
      order: 4
    },
    {
      code: 'TKM',
      nameJa: '東武鶴見線',
      nameZh: '东武鹤见线',
      nameEn: 'Tobu Kameido Line',
      nameKo: '도부 가메이드선',
      color: '#ff69b4',
      lineIds: ["Tobu_Kameido"],
      order: 5
    },
    {
      code: 'TNOD',
      nameJa: '東武野田線',
      nameZh: '东武野田线',
      nameEn: 'Tobu Noda Line',
      nameKo: '도부 노다선',
      color: '#ff6b6b',
      lineIds: ["Noda"],
      order: 6
    },
    {
      code: 'TOG',
      nameJa: '越生線',
      nameZh: '越生线',
      nameEn: 'Ogose Line',
      nameKo: '오고세선',
      color: '#4169e1',
      lineIds: ["Ogose"],
      order: 7
    },
    {
      code: 'TQZ',
      nameJa: '小泉線',
      nameZh: '小泉线',
      nameEn: 'Koizumi Line',
      nameKo: '코이즈미선',
      color: '#32cd32',
      lineIds: ["Koizumi"],
      order: 8
    },
    {
      code: 'DTB',
      nameJa: '東武大師線',
      nameZh: '东武大师线',
      nameEn: 'Tobu Daishi Line',
      nameKo: '도부 다이시선',
      color: '#ff6600',
      lineIds: ["Daishi_Tobu"],
      order: 9
    },
  ],
  KEIKYU: [
    {
      code: 'KK',
      nameJa: '京急本線',
      nameZh: '京急本线',
      nameEn: 'Keikyu Main Line',
      nameKo: '게이큐 본선',
      color: '#005aaa',
      lineIds: ["Keikyu"],
      order: 1
    },
    {
      code: 'KM',
      nameJa: '京急大師線',
      nameZh: '京急大师线',
      nameEn: 'Keikyu Daishi Line',
      nameKo: '게이큐 다이시선',
      color: '#ff6699',
      lineIds: ["KeikyuMain", "Sakuragi"],
      order: 2
    },
    {
      code: 'KAP',
      nameJa: '京急空港線',
      nameZh: '京急空港线',
      nameEn: 'Keikyu Airport Line',
      nameKo: '게이큐 공항선',
      color: '#f15a22',
      lineIds: ["KeikyuAirport"],
      order: 3
    },
    {
      code: 'KKH',
      nameJa: '京急久里浜線',
      nameZh: '京急久里浜线',
      nameEn: 'Keikyu Kurihama Line',
      nameKo: '게이큐 쿠리하마선',
      color: '#00a0dc',
      lineIds: ["KeikyuKurihama"],
      order: 4
    },
    {
      code: 'KZU',
      nameJa: '京急逗子・葉山線',
      nameZh: '京急逗子・叶山线',
      nameEn: 'Keikyu Zushi Line',
      nameKo: '게이큐 즈시선',
      color: '#00a0dc',
      lineIds: ["KeikyuZushi"],
      order: 5
    },
    {
      code: 'DK',
      nameJa: '京急大師線',
      nameZh: '京急大师线',
      nameEn: 'Keikyu Daishi Line',
      nameKo: '게이큐 다이시선',
      color: '#00a0e8',
      lineIds: ["Daishi_Keikyu"],
      order: 6
    },
  ],
  KEIO: [
    {
      code: 'KO',
      nameJa: '京王線',
      nameZh: '京王线',
      nameEn: 'Keio Line',
      nameKo: '게이오선',
      color: '#0078c1',
      lineIds: ["Keio"],
      order: 1
    },
    {
      code: 'KIN',
      nameJa: '京王井の頭線',
      nameZh: '京王井の头线',
      nameEn: 'Keio Inokashira Line',
      nameKo: '게이오 이노카시라선',
      color: '#9c27b0',
      lineIds: ["KeioInokashira"],
      order: 2
    },
    {
      code: 'KSG',
      nameJa: '京王相模原線',
      nameZh: '京王相模原线',
      nameEn: 'Keio Sagami Line',
      nameKo: '게이오 사가미하라선',
      color: '#9c27b0',
      lineIds: ["KeioSagami"],
      order: 3
    },
    {
      code: 'KSH',
      nameJa: '京王新線',
      nameZh: '京王新线',
      nameEn: 'Keio New Line',
      nameKo: '게이오 신선',
      color: '#8c1c8e',
      lineIds: ["KeioShin"],
      order: 4
    },
    {
      code: 'KTK',
      nameJa: '京王高尾線',
      nameZh: '京王高尾线',
      nameEn: 'Keio Takao Line',
      nameKo: '게이오 타카오선',
      color: '#9c27b0',
      lineIds: ["KeioTakao"],
      order: 5
    },
    {
      code: 'KKJ',
      nameJa: '京王競馬場線',
      nameZh: '京王竞马场线',
      nameEn: 'Keio Keibajo Line',
      nameKo: '게이오 게이바조선',
      color: '#8c1c8e',
      lineIds: ["KeioKeibajo"],
      order: 6
    },
    {
      code: 'KMO',
      nameJa: '京王線',
      nameZh: '京王线',
      nameEn: 'Keio Main Line',
      nameKo: '게이오 본선',
      color: '#0078c1',
      lineIds: ["KeioMain"],
      order: 7
    },
    {
      code: 'KZO',
      nameJa: '京王動物園線',
      nameZh: '京王动物园线',
      nameEn: 'Keio Zoo Line',
      nameKo: '게이오 동물원선',
      color: '#8c1c8e',
      lineIds: ["KeioZoo"],
      order: 8
    },
  ],
  TOKYU: [
    {
      code: 'TY',
      nameJa: '東急東横線',
      nameZh: '东急东横线',
      nameEn: 'Tokyu Toyoko Line',
      nameKo: '토큐 도요코선',
      color: '#00a0c7',
      lineIds: ["TokyuToyoko"],
      order: 1
    },
    {
      code: 'TD',
      nameJa: '東急田園都市線',
      nameZh: '东急田园都市线',
      nameEn: 'Tokyu Den-en-shima Line',
      nameKo: '토큐덴엔시마선',
      color: '#40b3e5',
      lineIds: ["TokyuDenEn"],
      order: 2
    },
    {
      code: 'TTM',
      nameJa: '東急多摩川線',
      nameZh: '东急多摩川线',
      nameEn: 'Tokyu Tamagawa Line',
      nameKo: '토큐 다마가와선',
      color: '#00a0dc',
      lineIds: ["TokyuTamagawa"],
      order: 3
    },
  ],
  ODAKYU: [
    {
      code: 'OD',
      nameJa: '小田急小田原線',
      nameZh: '小田急小田原线',
      nameEn: 'Odakyu Odawara Line',
      nameKo: '오다큐 오다와라선',
      color: '#0078c1',
      lineIds: ["OdakyuOdawara"],
      order: 1
    },
    {
      code: 'OE',
      nameJa: '小田急江の島線',
      nameZh: '小田急江之岛线',
      nameEn: 'Odakyu Enoshima Line',
      nameKo: '오다큐 에노시마선',
      color: '#0078c1',
      lineIds: ["OdakyuEnoshima"],
      order: 2
    },
    {
      code: 'OH',
      nameJa: '小田急江の島線',
      nameZh: '小田急江之岛线',
      nameEn: 'Odawara Line',
      nameKo: '오다와라선',
      color: '#0078c1',
      lineIds: ["Odawara"],
      order: 3
    },
    {
      code: 'OTM',
      nameJa: '小田急多摩線',
      nameZh: '小田急多摩线',
      nameEn: 'Odakyu Tama Line',
      nameKo: '오다큐 타마선',
      color: '#8b0000',
      lineIds: ["OdakyuTama"],
      order: 4
    },
  ],
  KEISEI: [
    {
      code: 'KS',
      nameJa: '京成本線',
      nameZh: '京成本线',
      nameEn: 'Keisei Main Line',
      nameKo: '게이세이 본선',
      color: '#d81e06',
      lineIds: ["Keisei"],
      order: 1
    },
  ],
  SOTETSU: [
    {
      code: 'SO',
      nameJa: '相鉄本線',
      nameZh: '相铁本线',
      nameEn: 'Sotetsu Main Line',
      nameKo: '소테츠 본선',
      color: '#0069a3',
      lineIds: ["SotetsuMain"],
      order: 1
    },
  ],
  RINKAI: [
    {
      code: 'RL',
      nameJa: 'りんかい線',
      nameZh: '临海线',
      nameEn: 'Rinkai Line',
      nameKo: '린카이선',
      color: '#00a0e0',
      lineIds: ["Rinkai"],
      order: 1
    },
  ],
  MINATO_MIRAI: [
    {
      code: 'MM',
      nameJa: 'みなとみらい線',
      nameZh: '港未来线',
      nameEn: 'Minato Mirai Line',
      nameKo: '미나토미라이선',
      color: '#00b6c7',
      lineIds: ["MinatoMirai"],
      order: 1
    },
  ],
  YOKOHAMA_MUNICIPAL: [
    {
      code: 'B',
      nameJa: 'ブルーライン',
      nameZh: '蓝线',
      nameEn: 'Blue Line',
      nameKo: '블루라인',
      color: '#00a0c7',
      lineIds: ["YokohamaBlue"],
      order: 1
    },
    {
      code: 'GR',
      nameJa: 'グリーンライン',
      nameZh: '绿线',
      nameEn: 'Green Line',
      nameKo: '그린라인',
      color: '#00a859',
      lineIds: ["YokohamaGreen"],
      order: 2
    },
    {
      code: 'O',
      nameJa: 'オレンジライナー',
      nameZh: '橙线',
      nameEn: 'Orange Line',
      nameKo: '오렌지 라이너',
      color: '#f39200',
      lineIds: ["Orange"],
      order: 3
    },
  ],
  SHONAN_MONORAIL: [
    {
      code: 'SME',
      nameJa: '湘南モノレール江の島線',
      nameZh: '湘南单轨电车江之岛线',
      nameEn: 'Shonan Monorail Enoshima Line',
      nameKo: '쇼난 모노레일 에노시마선',
      color: '#ff6600',
      lineIds: ["ShonanMonorailE"],
      order: 1
    },
  ],
  TWR: [
    {
      code: 'R',
      nameJa: 'りんくータウン線',
      nameZh: 'Link Town Line',
      nameEn: 'Rinko Line',
      nameKo: '린코선',
      color: '#00a0c7',
      lineIds: ["Rinko"],
      order: 1
    },
  ],
  TAMA_MONORAIL: [
    {
      code: 'TM',
      nameJa: '多摩都市モノレール',
      nameZh: '多摩都市单轨电车',
      nameEn: 'Tama Monorail Line',
      nameKo: '타마 도시 모노레일',
      color: '#e60012',
      lineIds: ["TamaMonorail"],
      order: 1
    },
  ],
  YURIKAMOME: [
    {
      code: 'U',
      nameJa: 'ゆりかもめ',
      nameZh: '百合鸥号',
      nameEn: 'Yurikamome',
      nameKo: '유리카모메',
      color: '#0065a6',
      lineIds: ["Yurikamome"],
      order: 1
    },
  ],
  TSUKUBA_EXPRESS: [
    {
      code: 'TX',
      nameJa: 'つくばエクスプレス',
      nameZh: '筑波快线',
      nameEn: 'Tsukuba Express',
      nameKo: '쓰쿠바 익스프레스',
      color: '#273e6c',
      lineIds: ["TsukubaExpress"],
      order: 1
    },
  ],
  MIR: [
    {
      code: 'TX',
      nameJa: 'ひたちなか海浜鉄道なかしおもこうりん線',
      nameZh: '日立海滨铁道中东海滨线',
      nameEn: 'Hitachi Naka-Kaimin Line',
      nameKo: '히타치なか 카이민선',
      color: '#273e6c',
      lineIds: ["HitachiNakaKaimin"],
      order: 1
    },
  ],
  JR_WEST: [
    {
      code: 'YAM',
      nameJa: 'JR山口線',
      nameZh: 'JR山口线',
      nameEn: 'Yamaguchi Line',
      nameKo: '야마구치선',
      color: '#00a050',
      lineIds: ["JR_Yamaguchi"],
      order: 1
    },
  ],
};

