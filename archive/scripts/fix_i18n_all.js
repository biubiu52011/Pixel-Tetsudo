// 批量补充所有修复线路的i18n翻译
const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'data', 'core', 'station_i18n.json');
const i18n = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));

// 所有修复线路的站点中文名称映射
const stationTranslations = {
  // 水郡線（40站）
  "Mito": "水户",
  "Hitachi-Aoyagi": "常陆青柳",
  "Hitachi-Tsuda": "常陆津田",
  "Godai": "后台",
  "Shimo-Sugaya": "下菅谷",
  "Naka-Sugaya": "中菅谷",
  "Kami-Sugaya": "上菅谷",
  "Hitachi-Konosu": "常陆鸿巢",
  "Urizura": "瓜连",
  "Shizu": "静",
  "Hitachi-Omiya": "常陆大宫",
  "Tamagawamura": "玉川村",
  "Nogamihara": "野上原",
  "Yamagatajuku": "山方宿",
  "Naka-Funyu": "中舟生",
  "Shimo-Ogawa": "下小川",
  "Saigane": "西金",
  "Kami-Ogawa": "上小川",
  "Fukuroda": "袋田",
  "Hitachi-Daigo": "常陆大子",
  "Shimonomiya": "下野宫",
  "Yamatsuriyama": "矢祭山",
  "Higashidate": "东馆",
  "Minami-Ishii": "南石井",
  "Iwaki-Ishii": "磐城石井",
  "Iwaki-Hanawa": "磐城塙",
  "Chikatsu": "近津",
  "Nakatoyo": "中丰",
  "Iwaki-Tanakura": "磐城棚仓",
  "Iwaki-Asakawa": "磐城浅川",
  "Satoshiroishi": "里白石",
  "Iwaki-Ishikawa": "磐城石川",
  "Nogisawa": "野木泽",
  "Kawabeoki": "川边冲",
  "Izumigo": "泉乡",
  "Kawahigashi": "川东",
  "Oshioe": "小盐江",
  "Yatakawa": "谷田川",
  "Iwaki-Moriyama": "磐城守山",
  "Asaka-Nagamori": "安积永盛",

  // 釜石線（24站）
  "Hanamaki": "花卷",
  "Nitanai": "似内",
  "Shin-Hanamaki": "新花卷",
  "Oyamada": "小山田",
  "Tsuchizawa": "土泽",
  "Haruyama": "晴山",
  "Iwanebashi": "岩根桥",
  "Miyamori": "宫守",
  "Kashiwagidaira": "柏木平",
  "Masuzawa": "鳟泽",
  "Arayamae": "荒谷前",
  "Iwate-Futsukamachi": "岩手二日町",
  "Ayaori": "绫织",
  "Tono": "远野",
  "Aozasa": "青笹",
  "Iwate-Kamigo": "岩手上乡",
  "Hirakura": "平仓",
  "Ashigase": "足濑",
  "Kami-Arisu": "上有住",
  "Rikuchu-Ohashi": "陆中大桥",
  "Dosen": "洞泉",
  "Matsukura": "松仓",
  "Kosano": "小佐野",
  "Kamaishi": "釜石",

  // 田沢湖線（18站）
  "Morioka": "盛冈",
  "Maegata": "前潟",
  "Okama": "大釜",
  "Koiwai": "小岩井",
  "Shizukuishi": "雫石",
  "Harukiba": "春木场",
  "Akabuchi": "赤渕",
  "Tazawako": "田泽湖",
  "Sashimaki": "刺卷",
  "Jindai": "神代",
  "Shoden": "生田",
  "Kakunodate": "角馆",
  "Uguisuno": "莺野",
  "Ugo-Nagano": "羽后长野",
  "Yariminai": "鑓见内",
  "Ugo-Yotsuya": "羽后四屋",
  "Kita-Omagari": "北大曲",
  "Omagari": "大曲",

  // 山田線（15站）
  "Kami-Morioka": "上盛冈",
  "Yamagishi": "山岸",
  "Kami-Yonai": "上米内",
  "Kuzakai": "区界",
  "Matsukusa": "松草",
  "Kawauchi": "川内",
  "Hakoishi": "箱石",
  "Rikuchu-Kawai": "陆中川井",
  "Haratai": "腹带",
  "Moichi": "茂市",
  "Hikime": "蟆目",
  "Kebaraichi": "花原市",
  "Sentoku": "千德",
  "Miyako": "宫古",

  // 米坂線（20站）
  "Yonezawa": "米泽",
  "Minami-Yonezawa": "南米泽",
  "Nishi-Yonezawa": "西米泽",
  "Narushima": "成岛",
  "Chugun": "中郡",
  "Uzen-Komatsu": "羽前小松",
  "Inukawa": "犬川",
  "Imaizumi": "今泉",
  "Hagyu": "萩生",
  "Uzen-Tsubaki": "羽前椿",
  "Tenoko": "手之子",
  "Uzen-Numazawa": "羽前沼泽",
  "Isaryo": "伊佐领",
  "Uzen-Matsuoka": "羽前松冈",
  "Oguni": "小国",
  "Echigo-Kanamaru": "越后金丸",
  "Echigo-Katakai": "越后片贝",
  "Echigo-Shimoseki": "越后下关",
  "Echigo-Oshima": "越后大岛",
  "Sakamachi": "坂町",

  // 磐越東線（16站）
  "Iwaki": "磐城",
  "Akai": "赤井",
  "Ogawago": "小川乡",
  "Eda": "江田",
  "Kawamae": "川前",
  "Natsui": "夏井",
  "Ononiimachi": "小野新町",
  "Kanmata": "神俣",
  "Sugaya": "菅谷",
  "Ogoe": "大越",
  "Iwaki-Tokiwa": "磐城常叶",
  "Funehiki": "船引",
  "Kanameta": "要田",
  "Miharu": "三春",
  "Mogi": "舞木",
  "Koriyama": "郡山",

  // 磐越西線（42站）
  "Koriyama-Tomita": "郡山富田",
  "Kikuta": "喜久田",
  "Akogashima": "安子岛",
  "Bandai-Atami": "磐梯热海",
  "Nakayamajuku": "中山宿",
  "Joko": "上户",
  "Sekito": "关都",
  "Kawageta": "川桁",
  "Inawashiro": "猪苗代",
  "Okinashima": "翁岛",
  "Bandaimachi": "磐梯町",
  "Higashi-Nagahara": "东长原",
  "Hirota": "广田",
  "Aizu-Wakamatsu": "会津若松",
  "Dojima": "堂岛",
  "Oikawa": "笈川",
  "Shiokawa": "盐川",
  "Ubadou": "姥堂",
  "Aizu-Toyokawa": "会津丰川",
  "Kitakata": "喜多方",
  "Yamato": "山都",
  "Ogino": "荻野",
  "Onobori": "尾登",
  "Nozawa": "野泽",
  "Kaminojiri": "上野尻",
  "Tokusawa": "德泽",
  "Toyomi": "丰实",
  "Hideya": "日出谷",
  "Kanose": "鹿濑",
  "Tsugawa": "津川",
  "Mikawa": "三川",
  "Igashima": "五十岛",
  "Higashi-Gejo": "东下条",
  "Sakihana": "咲花",
  "Maoroshi": "马下",
  "Saruwada": "猿和田",
  "Gosen": "五泉",
  "Kita-Gosen": "北五泉",
  "Shinseki": "新关",
  "Higashi-Niitsu": "东新津",
  "Niitsu": "新津"
};

// 添加缺失的i18n
let added = 0;
Object.keys(stationTranslations).forEach(function(stationId) {
  const zhName = stationTranslations[stationId];
  if (!i18n[stationId]) {
    i18n[stationId] = {
      "ja": zhName,
      "en": stationId.replace(/-/g, ' '),
      "zh-CN": zhName,
      "ko": zhName
    };
    added++;
  } else if (!i18n[stationId]['zh-CN']) {
    i18n[stationId]['zh-CN'] = zhName;
    added++;
  }
});

console.log('共补充了', added, '个i18n条目');

// 保存
fs.writeFileSync(i18nPath, JSON.stringify(i18n, null, 2), 'utf8');
console.log('station_i18n.json 已更新');
