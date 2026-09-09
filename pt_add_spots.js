const fs = require('fs');
const p = 'data/core/tourism_data.json';
const t = JSON.parse(fs.readFileSync(p, 'utf8'));

const newSpots = [
  {
    name: 'LUMINE 池袋',
    coord: [35.7288134, 139.7091823],
    dist: '0 min walk', dir: '駅直結',
    desc: '池袋駅西口直結のショッピングセンター。ファッションから雑貨、カフェまで揃い、雨の日でも濡れずに買い物ができる。',
    tags: ['all', 'shopping'],
    image: '../images/観光地/LUMINE 池袋.jpg',
    bestTime: '11:00～21:00', hours: '11:00～21:00（店舗により異なる）', fee: '無料',
    tips: ['西口直結で雨天も安心', 'カフェ・レストランも充実', '駅ビルなので移動に便利'],
    name_i18n: { ja: 'LUMINE 池袋', zh: 'LUMINE 池袋', en: 'LUMINE Ikebukuro', ko: '루미네 이케부쿠로' },
    desc_i18n: {
      ja: '池袋駅西口直結のショッピングセンター。ファッションから雑貨、カフェまで揃い、雨の日でも濡れずに買い物ができる。',
      zh: '与池袋站西口直通的购物中心。从时装到杂货、咖啡店应有尽有，下雨天也能不淋雨购物。',
      en: 'A shopping center directly connected to Ikebukuro Station west exit. From fashion to sundries and cafés, you can shop without getting rained on.',
      ko: '이케부쿠로역 서쪽 출구와 직결된 쇼핑센터예요. 패션부터 잡화, 카페까지 갖춰져 있어 비 오는 날에도 젖지 않고 쇼핑할 수 있어요.'
    },
    hours_i18n: { ja: '11:00～21:00（店舗により異なる）', zh: '11:00～21:00（各店铺略有不同）', en: '11:00～21:00（varies by store）', ko: '11:00～21:00（매장별 상이）' },
    fee_i18n: { ja: '無料', zh: '免费', en: 'Free', ko: '무료' },
    bestTime_i18n: { ja: '11:00～21:00', zh: '11:00～21:00', en: '11:00～21:00', ko: '11:00～21:00' },
    tips_i18n: {
      ja: ['西口直結で雨天も安心', 'カフェ・レストランも充実', '駅ビルなので移動に便利'],
      zh: ['西口直结，雨天也安心', '咖啡、餐厅选择丰富', '车站大楼，出行方便'],
      en: ['Directly connected to the west exit — safe in rain', 'Plenty of cafés and restaurants', 'Part of the station building for easy access'],
      ko: ['서쪽 출구 직결이라 비 오는 날도 안심', '카페·레스토랑도 풍부', '역 빌딩이라 이동이 편리']
    }
  },
  {
    name: '東京スカイツリー',
    coord: [35.7100543, 139.8107141],
    dist: '36 min walk', dir: '南東',
    desc: '高さ634mの電波塔。天望デッキ・天望回廊から都心を一望できる。春は桜並木との共演も美しい。',
    tags: ['all', 'landmark', 'nature'],
    image: '../images/観光地/スカイツリー.jpg',
    bestTime: '10:00～21:00（展望台）', hours: '8:00～22:00（施設により異なる）', fee: '有料（天望デッキ 大人2,100円～）',
    tips: ['事前予約で待ち時間短縮', 'ソラマチも併せて楽しめる', '夜はライトアップが美しい'],
    name_i18n: { ja: '東京スカイツリー', zh: '东京晴空塔', en: 'Tokyo Skytree', ko: '도쿄 스카이트리' },
    desc_i18n: {
      ja: '高さ634mの電波塔。天望デッキ・天望回廊から都心を一望できる。春は桜並木との共演も美しい。',
      zh: '高634米的电波塔。从展望台、空中回廊可俯瞰东京市中心。春天与樱花林交相辉映。',
      en: 'A 634m broadcasting tower. Enjoy panoramic views of central Tokyo from Tembo Deck and Tembo Galleria. Beautiful with cherry blossoms in spring.',
      ko: '높이 634m의 전파탑이에요. 전망대와 회랑에서 도쿄 도심을 한눈에 내려다볼 수 있고, 봄에는 벚꽃과의 조화가 아름다워요.'
    },
    hours_i18n: { ja: '8:00～22:00（施設により異なる）', zh: '8:00～22:00（各设施略有不同）', en: '8:00～22:00（varies by facility）', ko: '8:00～22:00（시설별 상이）' },
    fee_i18n: { ja: '有料（天望デッキ 大人2,100円～）', zh: '收费（展望台 成人2,100日元起）', en: 'Paid（Tembo Deck adult from ¥2,100）', ko: '유료（전망대 성인 2,100엔~）' },
    bestTime_i18n: { ja: '10:00～21:00（展望台）', zh: '10:00～21:00（展望台）', en: '10:00～21:00（observation decks）', ko: '10:00～21:00（전망대）' },
    tips_i18n: {
      ja: ['事前予約で待ち時間短縮', 'ソラマチも併せて楽しめる', '夜はライトアップが美しい'],
      zh: ['提前预约可缩短排队时间', '可一并游览晴空街道', '夜晚灯光秀很美'],
      en: ['Book ahead to skip long waits', 'Combine with a visit to Solamachi', 'Beautiful illuminations at night'],
      ko: ['사전 예약으로 대기 시간 단축', '소라마치와 함께 즐기기', '밤에는 라이트업이 아름다워요']
    }
  },
  {
    name: 'ポケモンセンターMEGA TOKYO',
    coord: [35.728917, 139.719389],
    dist: '12 min walk', dir: '東',
    desc: '池袋サンシャインシティ内にあるポケモン公式ショップ。ぬいぐるみ・カード・ゲームなど、限定グッズも充実。',
    tags: ['all', 'shopping'],
    image: '../images/観光地/ポケモンセンター MEGA TOKYO.jpg',
    bestTime: '10:00～20:00', hours: '10:00～20:00', fee: '無料（入場）',
    tips: ['限定グッズは売り切れ注意', 'サンシャインシティと併せて訪問', '土日は混雑しやすい'],
    name_i18n: { ja: 'ポケモンセンターMEGA TOKYO', zh: '宝可梦中心 MEGA TOKYO', en: 'Pokémon Center MEGA TOKYO', ko: '포켓몬센터 MEGA TOKYO' },
    desc_i18n: {
      ja: '池袋サンシャインシティ内にあるポケモン公式ショップ。ぬいぐるみ・カード・ゲームなど、限定グッズも充実。',
      zh: '位于池袋太阳城的宝可梦官方商店。玩偶、卡牌、游戏等商品齐全，还有限定周边。',
      en: 'The official Pokémon shop inside Sunshine City Ikebukuro. Plush toys, cards, games and exclusive goods in abundance.',
      ko: '이케부쿠로 선샤인시티 안에 있는 포켓몬 공식 스토어예요. 인형, 카드, 게임 등 한정 굿즈도 가득해요.'
    },
    hours_i18n: { ja: '10:00～20:00', zh: '10:00～20:00', en: '10:00～20:00', ko: '10:00～20:00' },
    fee_i18n: { ja: '無料（入場）', zh: '免费（入场）', en: 'Free（entry）', ko: '무료（입장）' },
    bestTime_i18n: { ja: '10:00～20:00', zh: '10:00～20:00', en: '10:00～20:00', ko: '10:00～20:00' },
    tips_i18n: {
      ja: ['限定グッズは売り切れ注意', 'サンシャインシティと併せて訪問', '土日は混雑しやすい'],
      zh: ['限定周边可能售罄', '可一并游览太阳城', '周末人流较多'],
      en: ['Exclusive goods may sell out', 'Visit together with Sunshine City', 'Crowded on weekends'],
      ko: ['한정 굿즈는 품절 주의', '선샤인시티와 함께 방문', '주말에는 혼잡할 수 있어요']
    }
  },
  {
    name: '池袋PARCO',
    coord: [35.7308476, 139.7123177],
    dist: '1 min walk', dir: '東口',
    desc: '池袋駅東口から徒歩1分のファッションビル。アニメ・サブカル系ショップも多く、若者文化の発信地。',
    tags: ['all', 'shopping'],
    image: '../images/観光地/池袋PARCO.jpg',
    bestTime: '11:00～21:00', hours: '本館 11:00～21:00（レストランは最大23:00）', fee: '無料',
    tips: ['東口から徒歩1分', 'P\'PARCOは別館（本館の北）', 'アニメ・サブカルショップも多数'],
    name_i18n: { ja: '池袋PARCO', zh: '池袋PARCO', en: 'Ikebukuro PARCO', ko: '이케부쿠로 파르코' },
    desc_i18n: {
      ja: '池袋駅東口から徒歩1分のファッションビル。アニメ・サブカル系ショップも多く、若者文化の発信地。',
      zh: '距池袋站东口步行1分钟的时尚大楼。动漫、亚文化类店铺众多，是青年文化的发源地。',
      en: 'A fashion building a 1-minute walk from Ikebukuro Station east exit. Home to many anime and subculture shops — a hub of youth culture.',
      ko: '이케부쿠로역 동쪽 출구에서 도보 1분 거리의 패션 빌딩이에요. 애니메이션·서브컬처 계열 매장도 많아 젊은 문화의 거점이에요.'
    },
    hours_i18n: { ja: '本館 11:00～21:00（レストランは最大23:00）', zh: '本馆 11:00～21:00（餐厅最晚至23:00）', en: 'Main bldg 11:00～21:00（restaurants until 23:00）', ko: '본관 11:00～21:00（레스토랑 최대 23:00）' },
    fee_i18n: { ja: '無料', zh: '免费', en: 'Free', ko: '무료' },
    bestTime_i18n: { ja: '11:00～21:00', zh: '11:00～21:00', en: '11:00～21:00', ko: '11:00～21:00' },
    tips_i18n: {
      ja: ['東口から徒歩1分', 'P\'PARCOは別館（本館の北）', 'アニメ・サブカルショップも多数'],
      zh: ['距东口步行1分钟', 'P\'PARCO为别馆（本馆北侧）', '动漫、亚文化店铺众多'],
      en: ['1-minute walk from the east exit', 'P\'PARCO is the annex（north of the main bldg）', 'Lots of anime & subculture shops'],
      ko: ['동쪽 출구에서 도보 1분', 'P\'파르코는 별관（본관 북쪽）', '애니메이션·서브컬처 매장 다수']
    }
  },
  {
    name: '南池袋公園',
    coord: [35.7275715, 139.7143507],
    dist: '8 min walk', dir: '南',
    desc: '池袋駅から徒歩圏の都市公園。広い芝生広場とカフェがあり、ピクニックや休憩にぴったり。',
    tags: ['all', 'nature', 'park'],
    image: '../images/観光地/南池袋公園.jpg',
    bestTime: '昼間（日差しが穏やかな時間帯）', hours: '常時開放', fee: '無料',
    tips: ['芝生でピクニック', 'カフェのテイクアウトがおすすめ', '子連れでも安心'],
    name_i18n: { ja: '南池袋公園', zh: '南池袋公园', en: 'Minami-Ikebukuro Park', ko: '미나미이케부쿠로 공원' },
    desc_i18n: {
      ja: '池袋駅から徒歩圏の都市公園。広い芝生広場とカフェがあり、ピクニックや休憩にぴったり。',
      zh: '距池袋站步行可达的城市公园。有大片草坪广场和咖啡店，适合野餐和休息。',
      en: 'An urban park within walking distance of Ikebukuro Station. Wide lawns and a café make it perfect for picnics and relaxing.',
      ko: '이케부쿠로역에서 걸어갈 수 있는 도시공원이에요. 넓은 잔디밭과 카페가 있어 피크닉과 휴식에 안성맞춤이에요.'
    },
    hours_i18n: { ja: '常時開放', zh: '全天开放', en: 'Open all day', ko: '상시 개방' },
    fee_i18n: { ja: '無料', zh: '免费', en: 'Free', ko: '무료' },
    bestTime_i18n: { ja: '昼間（日差しが穏やかな時間帯）', zh: '白天（阳光温和的时段）', en: 'Daytime（when sunlight is mild）', ko: '낮（햇빛이 온화한 시간대）' },
    tips_i18n: {
      ja: ['芝生でピクニック', 'カフェのテイクアウトがおすすめ', '子連れでも安心'],
      zh: ['在草坪上野餐', '推荐咖啡店外带', '带孩子也安心'],
      en: ['Picnic on the lawn', 'Grab takeout from the café', 'Family-friendly'],
      ko: ['잔디밭에서 피크닉', '카페 테이크아웃 추천', '아이와 함께 가도 안심']
    }
  },
  {
    name: '浅草（浅草寺・仲見世通り）',
    coord: [35.7134032, 139.7955265],
    dist: '29 min walk', dir: '南',
    desc: '雷門・仲見世通り・浅草寺・浅草神社が集まる東京を代表する観光地。歴史情緒とスカイツリーの眺望が楽しめる。',
    tags: ['all', 'history', 'landmark'],
    image: '../images/観光地/浅草/スカイツリー.jpg',
    bestTime: '午前中（人出が少なめ）', hours: '浅草寺 6:00～17:00（季節により変動）／仲見世は店舗により異なる', fee: '無料（参拝）',
    tips: ['雷門から仲見世通りを散策', '人力車も体験できる', '浅草文化観光センターの展望も'],
    name_i18n: { ja: '浅草（浅草寺・仲見世通り）', zh: '浅草（浅草寺・仲见世通）', en: 'Asakusa（Senso-ji & Nakamise-dori）', ko: '아사쿠사（센소지·나카미세도리）' },
    desc_i18n: {
      ja: '雷門・仲見世通り・浅草寺・浅草神社が集まる東京を代表する観光地。歴史情緒とスカイツリーの眺望が楽しめる。',
      zh: '汇集雷门、仲见世通、浅草寺、浅草神社的东京代表性观光地。可感受历史风情，眺望晴空塔。',
      en: 'One of Tokyo\'s most iconic sightseeing areas, home to Kaminarimon, Nakamise-dori, Senso-ji and Asakusa Shrine. Historic atmosphere with views of Tokyo Skytree.',
      ko: '카미나리몬, 나카미세도리, 센소지, 아사쿠사 신사가 모여 있는 도쿄 대표 관광지예요. 역사적 정취와 도쿄 스카이트리의 전망을 즐길 수 있어요.'
    },
    hours_i18n: { ja: '浅草寺 6:00～17:00（季節により変動）／仲見世は店舗により異なる', zh: '浅草寺 6:00～17:00（随季节变动）／仲见世通各店略有不同', en: 'Senso-ji 6:00～17:00（varies by season）／Nakamise varies by shop', ko: '센소지 6:00～17:00（계절별 변동）／나카미세는 매장별 상이' },
    fee_i18n: { ja: '無料（参拝）', zh: '免费（参拜）', en: 'Free（worship）', ko: '무료（참배）' },
    bestTime_i18n: { ja: '午前中（人出が少なめ）', zh: '上午（人流较少）', en: 'Morning（fewer crowds）', ko: '오전（사람이 적은 편）' },
    tips_i18n: {
      ja: ['雷門から仲見世通りを散策', '人力車も体験できる', '浅草文化観光センターの展望も'],
      zh: ['从雷门漫步仲见世通', '可体验人力车', '浅草文化观光中心可眺望全景'],
      en: ['Stroll Nakamise-dori from Kaminarimon', 'Try a rickshaw ride', 'Views from the Asakusa Culture Tourist Information Center'],
      ko: ['카미나리몬에서 나카미세도리 산책', '인력거 체험 가능', '아사쿠사 문화관광센터 전망도 추천']
    }
  },
  {
    name: '浅草神社',
    coord: [35.7148087, 139.7974977],
    dist: '27 min walk', dir: '南',
    desc: '浅草寺境内に鎮座し「三社権現」とも呼ばれる神社。国の重要文化財に指定された社殿が美しい。',
    tags: ['all', 'history', 'shrine'],
    image: '../images/観光地/浅草神社.jpg',
    bestTime: '午前中', hours: '6:00～17:00（授与所は変動）', fee: '無料',
    tips: ['浅草寺本堂の右隣', '三社祭は5月中旬', '社殿は重要文化財'],
    name_i18n: { ja: '浅草神社', zh: '浅草神社', en: 'Asakusa Shrine', ko: '아사쿠사 신사' },
    desc_i18n: {
      ja: '浅草寺境内に鎮座し「三社権現」とも呼ばれる神社。国の重要文化財に指定された社殿が美しい。',
      zh: '坐落于浅草寺境内的神社，又称"三社权现"。被指定为国家重要文化财的社殿十分精美。',
      en: 'A shrine within the Senso-ji grounds, also known as "Sanja Gongen". Its main hall, designated an Important Cultural Property, is a beauty.',
      ko: '센소지 경내에 자리한 신사로 \'산자 곤겐\'이라고도 불려요. 국가 중요문화재로 지정된 신전이 아름다워요.'
    },
    hours_i18n: { ja: '6:00～17:00（授与所は変動）', zh: '6:00～17:00（授予所时间有变动）', en: '6:00～17:00（amulet office varies）', ko: '6:00～17:00（수여소 변동）' },
    fee_i18n: { ja: '無料', zh: '免费', en: 'Free', ko: '무료' },
    bestTime_i18n: { ja: '午前中', zh: '上午', en: 'Morning', ko: '오전' },
    tips_i18n: {
      ja: ['浅草寺本堂の右隣', '三社祭は5月中旬', '社殿は重要文化財'],
      zh: ['位于浅草寺本堂右侧', '三社祭在5月中旬', '社殿为国家重要文化财'],
      en: ['Right next to Senso-ji main hall', 'Sanja Matsuri in mid-May', 'Main hall is an Important Cultural Property'],
      ko: ['센소지 본당 오른쪽', '산자 마츠리는 5월 중순', '신전은 중요문화재']
    }
  },
  {
    name: 'ドン・キホーテ 池袋東口駅前店',
    coord: [35.729333, 139.7124613],
    dist: '1 min walk', dir: '東口',
    desc: '池袋駅東口から徒歩1分、24時間営業のディスカウントストア。食品・家電・コスメ・お土産が何でも揃う。',
    tags: ['all', 'shopping', 'food'],
    image: '../images/観光地/ドン・キホーテ 池袋東口駅前店.jpg',
    bestTime: '深夜も営業（時間を選ばず利用可）', hours: '24時間営業', fee: '無料（入店）',
    tips: ['24時間営業', '免税対応', 'お土産調達に便利'],
    name_i18n: { ja: 'ドン・キホーテ 池袋東口駅前店', zh: '唐吉诃德 池袋东口站前店', en: 'Don Quijote Ikebukuro Higashi-guchi Ekimae', ko: '돈키호테 이케부쿠로 동쪽 출구역 앞점' },
    desc_i18n: {
      ja: '池袋駅東口から徒歩1分、24時間営業のディスカウントストア。食品・家電・コスメ・お土産が何でも揃う。',
      zh: '距池袋站东口步行1分钟、24小时营业的折扣店。食品、家电、化妆品、伴手礼应有尽有。',
      en: 'A 24-hour discount store a 1-minute walk from Ikebukuro Station east exit. Food, electronics, cosmetics and souvenirs — all under one roof.',
      ko: '이케부쿠로역 동쪽 출구에서 도보 1분, 24시간 영업하는 디스카운트 스토어예요. 식품, 가전, 화장품, 기념품이 뭐든 있어요.'
    },
    hours_i18n: { ja: '24時間営業', zh: '24小时营业', en: 'Open 24 hours', ko: '24시간 영업' },
    fee_i18n: { ja: '無料（入店）', zh: '免费（进店）', en: 'Free（entry）', ko: '무료（입점）' },
    bestTime_i18n: { ja: '深夜も営業（時間を選ばず利用可）', zh: '深夜也营业（随时可用）', en: 'Open late（use any time）', ko: '심야에도 영업（시간 가리지 않고 이용 가능）' },
    tips_i18n: {
      ja: ['24時間営業', '免税対応', 'お土産調達に便利'],
      zh: ['24小时营业', '支持免税', '方便采购伴手礼'],
      en: ['Open 24 hours', 'Tax-free supported', 'Great for souvenir shopping'],
      ko: ['24시간 영업', '면세 지원', '기념품 구입에 편리']
    }
  }
];

t.spots = t.spots.concat(newSpots);
fs.writeFileSync(p, JSON.stringify(t, null, 2) + '\n', 'utf8');
console.log('spots now:', t.spots.length);
