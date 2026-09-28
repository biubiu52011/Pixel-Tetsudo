"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const RAILWAY_FILE = path.join(ROOT, "data/core/railway_data.json");
const I18N_FILE = path.join(ROOT, "data/core/station_i18n.json");
const GEN_FILE_DATA = path.join(ROOT, "data/core/gen-file-data.js");

const LANG_KEYS = ["ja", "zh", "ko", "en"];

const OVERRIDES = {
  KinutaPark: { ja: "砧公園", zh: "砧公园", ko: "기누타공원", en: "Kinuta Park" },
  Kegon: { ja: "華厳", zh: "华严", ko: "게곤", en: "Kegon" },
  "Shin-osaki": { ja: "新大崎", zh: "新大崎", ko: "신오사키", en: "Shin-Osaki" },
  "Minami-Aoyama": { ja: "南青山", zh: "南青山", ko: "미나미아오야마", en: "Minami-Aoyama" },
  Okachi: { ja: "御徒町", zh: "御徒町", ko: "오카치마치", en: "Okachimachi" },
  "Shin-Odaimon": { ja: "新大井門", zh: "新大井门", ko: "신오다이몬", en: "Shin-Odaimon" },
  Tampopo: { ja: "たんぽぽ", zh: "蒲公英", ko: "단포포", en: "Tampopo" },
  "Shin-Bayashi": { ja: "新林", zh: "新林", ko: "신바야시", en: "Shin-Bayashi" },
  "Teleport-Chuo": { ja: "テレポート中央", zh: "电讯港中央", ko: "텔레포트추오", en: "Teleport-Chuo" },
  "Tempozanto-Mae": { ja: "天保山東前", zh: "天保山东前", ko: "덴포잔토마에", en: "Tempozanto-Mae" },
  "Hotaru-Kaihinkogen": { ja: "蛍海浜公園", zh: "萤海滨公园", ko: "호타루카이힌코엔", en: "Hotaru-Kaihinkogen" },
  Sesenji: { ja: "世泉寺", zh: "世泉寺", ko: "세센지", en: "Sesenji" },
  Kusatsu: { ja: "草津", zh: "草津", ko: "구사쓰", en: "Kusatsu" },
  Suginami: { ja: "杉並", zh: "杉并", ko: "스기나미", en: "Suginami" },
  Musashimurayama: { ja: "武蔵村山", zh: "武藏村山", ko: "무사시무라야마", en: "Musashimurayama" },
  "Tsurumi-Ryokuchi": { ja: "鶴見緑地", zh: "鹤见绿地", ko: "쓰루미료쿠치", en: "Tsurumi-Ryokuchi" },
  "Bakurōmae": { ja: "馬喰町", zh: "马喰町", ko: "바쿠로초", en: "Bakurocho" },
  "Tsugaru-Shinjo": { ja: "津軽新城", zh: "津轻新城", ko: "쓰가루신조", en: "Tsugaru-Shinjo" },
  "Harada-Fukuoka": { ja: "原田", zh: "原田", ko: "하라다", en: "Harada" },
  Haiki: { ja: "早岐", zh: "早岐", ko: "하이키", en: "Haiki" },
  "Matsubara-Nagasaki": { ja: "松原", zh: "松原", ko: "마쓰바라", en: "Matsubara" },
  "Kobayashi-Miyazaki": { ja: "小林", zh: "小林", ko: "고바야시", en: "Kobayashi" },
  Kommata: { ja: "小俣", zh: "小俣", ko: "고마타", en: "Kommata" },
  Takine: { ja: "滝根", zh: "泷根", ko: "다키네", en: "Takine" },
  Douzawa: { ja: "堂沢", zh: "堂泽", ko: "도자와", en: "Douzawa" },
  Waga: { ja: "和賀", zh: "和贺", ko: "와가", en: "Waga" },
  Ashizawa: { ja: "芦沢", zh: "芦泽", ko: "아시자와", en: "Ashizawa" },
  Kaimen: { ja: "海面", zh: "海面", ko: "카이멘", en: "Kaimen" },
  Juni: { ja: "十二", zh: "十二", ko: "주니", en: "Juni" },
  "Atago-Miyagi": { ja: "愛宕", zh: "爱宕", ko: "아타고", en: "Atago" },
  "Narushima-Yonezawa": { ja: "成島", zh: "成岛", ko: "나루시마", en: "Narushima" },
  "Aizu-Minamiwa": { ja: "会津南若松", zh: "会津南若松", ko: "아이즈미나미와카마쓰", en: "Aizu-Minami-Wakamatsu" }
};

const SIMPLE_ZH = new Map(Object.entries({
  亜: "亚", 會: "会", 兒: "儿", 內: "内", 圓: "圆", 國: "国", 學: "学", 實: "实",
  島: "岛", 廣: "广", 會: "会", 濱: "滨", 澤: "泽", 瀧: "泷", 瀬: "濑", 發: "发",
  縣: "县", 藏: "藏", 藤: "藤", 號: "号", 輕: "轻", 鐵: "铁", 長: "长", 門: "门",
  陽: "阳", 雙: "双", 驛: "驿", 髙: "高", 鹽: "盐", 鶴: "鹤", 龜: "龟"
}));

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function toSimplifiedJa(text) {
  return Array.from(String(text || ""), (ch) => SIMPLE_ZH.get(ch) || ch).join("");
}

function displayFromId(id) {
  return String(id)
    .normalize("NFC")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function reverseNameMap(nameMap) {
  const out = {};
  Object.entries(nameMap || {}).forEach(([ja, value]) => {
    const en = typeof value === "string" ? value : value && (value.en || value.ja);
    if (en && !out[en]) out[en] = ja.replace(/駅$/, "");
  });
  return out;
}

function fromStationFields(id, station, jaById) {
  const en = station.nameEn || displayFromId(id);
  const ja = station.nameJa || jaById[id] || en;
  return {
    ja,
    zh: station.nameZh || toSimplifiedJa(ja),
    ko: station.nameKo || ja,
    en
  };
}

function completeEntry(id, station, current, jaById) {
  const source = {
    ...fromStationFields(id, station, jaById),
    ...(OVERRIDES[id] || {}),
    ...(current || {})
  };
  const entry = {};
  LANG_KEYS.forEach((key) => {
    entry[key] = source[key] || source.en || id;
  });
  return entry;
}

function main() {
  const railway = readJson(RAILWAY_FILE);
  const i18n = readJson(I18N_FILE);
  const jaById = reverseNameMap(railway.name_map);
  let added = 0;
  let completed = 0;

  Object.keys(railway.stations || {}).sort().forEach((id) => {
    const before = i18n[id];
    const after = completeEntry(id, railway.stations[id] || {}, before, jaById);
    if (!before) {
      added += 1;
      i18n[id] = after;
      return;
    }
    const changed = LANG_KEYS.some((key) => !before[key] && after[key]);
    if (changed) {
      completed += 1;
      i18n[id] = { ...before, ...after };
    }
  });

  fs.writeFileSync(I18N_FILE, JSON.stringify(i18n, null, 1) + "\n", "utf8");

  const generated = spawnSync(process.execPath, [GEN_FILE_DATA], {
    cwd: ROOT,
    encoding: "utf8"
  });
  if (generated.status !== 0) {
    process.stderr.write(generated.stderr || generated.stdout);
    process.exit(generated.status || 1);
  }

  console.log(`station_i18n synced: added ${added}, completed ${completed}`);
}

main();
