/**
 * 平台数据生成脚本
 *
 * 用法: node generate-platform-data.js
 * 输出: data/core/platform-data.js
 *
 * 数据模型:
 *   PLATFORM_DATA[lineId][stationId] = { "1": "番线", "-1": "番线" }
 *   "1"  = 沿 LINE_STATION_ORDER 升序方向（站号变大）
 *   "-1" = 沿 LINE_STATION_ORDER 降序方向（站号变小）
 *
 * 生成规则:
 *   1. 从 railway-data.file.js 读取各线站序
 *   2. 默认规则: 中间站 = {"1":"1","-1":"2"}, 起终点 = 单方向
 *   3. 例外覆盖: 枢纽站/复杂站从 EXPLICIT 表读取（来源: wiki のりば节 + JR时刻表）
 *   4. 输出 PLATFORM_DATA + _PLATFORM_LINE_ALIAS + EXIT_DATA + PlatformResolver
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// 1. 读取站序数据
// ─────────────────────────────────────────────
const raw = fs.readFileSync(
  path.join(__dirname, 'railway-data.file.js'),
  'utf8'
);
// 模拟浏览器环境
global.window = {};
eval(raw);
const LINES = window.RAILWAY_DATA.lines;

// ─────────────────────────────────────────────
// 2. 默认番线规则
// ─────────────────────────────────────────────
// 中间站: 升序=1番, 降序=2番
// 起点站: 只有升序方向
// 终点站: 只有降序方向
function defaultForLine(stations) {
  const data = {};
  stations.forEach((st, i) => {
    if (i === 0 && i === stations.length - 1) {
      data[st] = { '1': '1', '-1': '1' };
    } else if (i === 0) {
      data[st] = { '1': '1' };
    } else if (i === stations.length - 1) {
      data[st] = { '-1': '1' };
    } else {
      data[st] = { '1': '1', '-1': '2' };
    }
  });
  return data;
}

// 默认排除: 这些线路不使用默认规则（番线体系特殊或数据不可靠）
const SKIP_DEFAULT = new Set([
  'Yamanote',      // 环线内外回歧义
  'ChuoRapid',     // 枢纽站多，需逐站确认
  'ChuoSobuLocal',
  'KeihinTohoku',
  'UtsunomiyaJR',
  'Takasaki',
  'Joban',
  'JobanLocal',
  'Tokaido',
  'Yokosuka',
  'SobuRapid',
  'Saikyo',
  'ShonanShinjuku',
  'NaritaSkyAccess',
  'TsukubaExpress',
  'Hanzomon',
]);

// ─────────────────────────────────────────────
// 3. 例外覆盖表（来源: wiki のりば节 + JR东日本时刻表 2026.9）
//    只写与默认不同的站，未列出的站沿用默认规则
// ─────────────────────────────────────────────
const EXPLICIT = {
  // ── 中央线快速（东京@0 → 高尾@23；下り=立川/高尾方向=升序1）──
  ChuoRapid: {
    Tokyo:    { '1': '1・2' },
    Kanda:    { '1': '6', '-1': '5' },
    Shinjuku: { '1': '11・12', '-1': '7・8' },
    Nakano:   { '1': '6', '-1': '7' },
    Ogikubo:  { '1': '3', '-1': '4' },
    Kichijoji:{ '1': '3', '-1': '4' },
    Mitaka:   { '1': '3・4', '-1': '5・6' },
    Kokubunji:{ '1': '1・2', '-1': '3・4' },
    Tachikawa:{ '1': '5・6', '-1': '3・4' },
    Hachioji: { '1': '4', '-1': '2' },
    Ochanomizu:{ '1': '1', '-1': '4' },
    Yotsuya:  { '1': '2', '-1': '1' },
    Koenji:   { '1': '3', '-1': '4' },
    'Nishi-Ogikubo': { '1': '3', '-1': '4' },
    'Musashi-Sakai':  { '1': '2', '-1': '1' },
    'Nishi-Kokubunji':{ '1': '2', '-1': '1' },
    Hino:     { '1': '1', '-1': '2' },
    Toyoda:   { '1': '1・2', '-1': '3・4' },
    'Nishi-Hachioji': { '1': '2', '-1': '1' },
    Takao:    { '1': '2・3・4', '-1': '1' },
  },

  // ── 中央/总武线各站停车（三鹰@0 → 千叶@38；东行=千叶方向=升序1）──
  ChuoSobuLocal: {
    Mitaka:   { '1': '1・2' },
    Nakano:   { '1': '2', '-1': '1' },
    Yoyogi:   { '1': '4', '-1': '3' },
    Shinjuku: { '1': '13', '-1': '16' },
    Akihabara:{ '1': '6', '-1': '5' },
    Koenji:   { '1': '2', '-1': '1' },
    'Nishi-Ogikubo': { '1': '2', '-1': '1' },
    Yotsuya:  { '1': '3', '-1': '4' },
    Ochanomizu:{ '1': '3', '-1': '2' },
    Funabashi:{ '1': '2', '-1': '1' },
    Tsudanuma:{ '1': '4', '-1': '5・6' },
    Chiba:    { '-1': '1・2' },
  },

  // ── 山手线（环线，东京@0 起点=内回方向；外回=降序-1）※东京不收录 ──
  Yamanote: {
    Kanda:    { '1': '3', '-1': '2' },
    Akihabara:{ '1': '2', '-1': '3' },
    Okachimachi:{ '1': '3', '-1': '2' },
    Ueno:     { '1': '2', '-1': '3' },
    Uguisudani:{ '1': '2', '-1': '3' },
    Nippori:  { '1': '11', '-1': '10' },
    Tabata:   { '1': '2', '-1': '3' },
    Komagome: { '1': '2', '-1': '1' },
    Sugamo:   { '1': '2', '-1': '1' },
    Otsuka:   { '1': '1', '-1': '2' },
    Ikebukuro:{ '1': '5・6', '-1': '7・8' },
    Mejiro:   { '1': '1', '-1': '2' },
    Takadanobaba:{ '1': '2', '-1': '1' },
    Shinjuku: { '1': '14', '-1': '15' },
    Yoyogi:   { '1': '2', '-1': '1' },
    Harajuku: { '1': '1', '-1': '2' },
    Shibuya:  { '1': '2', '-1': '1' },
    Ebisu:    { '1': '2', '-1': '1' },
    Meguro:   { '1': '1', '-1': '2' },
    Gotanda:  { '1': '1', '-1': '2' },
    Osaki:    { '1': '1・2', '-1': '3・4' },
    Shinagawa:{ '1': '1', '-1': '3' },
    'Takanawa-Gateway': { '1': '1', '-1': '2' },
    Tamachi:  { '1': '2', '-1': '3' },
    Hamamatsucho:{ '1': '2', '-1': '3' },
    Shimbashi:{ '1': '5', '-1': '4' },
    Yurakucho:{ '1': '2', '-1': '3' },
    'Nishi-Nippori': { '1': '3', '-1': '2' },
  },

  // ── 京滨东北线（大宫@0 → 大船@46；南行=大船方向=升序1）──
  KeihinTohoku: {
    Omiya:    { '1': '1・2' },
    Tabata:   { '1': '4', '-1': '1' },
    Nippori:  { '1': '9', '-1': '12' },
    Uguisudani:{ '1': '4', '-1': '1' },
    Ueno:     { '1': '4', '-1': '1' },
    Okachimachi:{ '1': '1', '-1': '4' },
    Akihabara:{ '1': '4', '-1': '1' },
    Kanda:    { '1': '1', '-1': '4' },
    Tokyo:    { '1': '6', '-1': '3' },
    Yurakucho:{ '1': '4', '-1': '1' },
    Shimbashi:{ '1': '3', '-1': '6' },
    Hamamatsucho:{ '1': '4', '-1': '1' },
    Tamachi:  { '1': '4', '-1': '1' },
    'Takanawa-Gateway': { '1': '4', '-1': '3' },
    Shinagawa:{ '1': '5', '-1': '4' },
    Yokohama: { '-1': '4' },
    Urawa:    { '1': '1', '-1': '2' },
    Kawaguchi:{ '1': '1', '-1': '2' },
    Akabane:  { '1': '1', '-1': '2' },
    Oimachi:  { '1': '2', '-1': '1' },
    Omori:    { '1': '1', '-1': '2' },
    Kamata:   { '1': '1・2', '-1': '3・4' },
    Kawasaki: { '1': '3', '-1': '4' },
    Oji:      { '1': '2', '-1': '1' },
    Ofuna:    { '-1': '9・10' },
    'Nishi-Nippori': { '1': '1', '-1': '4' },
  },

  // ── 宇都宫线（东京@0 → 黑矶@33；下り=大宫/宇都宫方向=升序1）──
  UtsunomiyaJR: {
    Tokyo:    { '1': '7・8' },
    Ueno:     { '1': '5・6' },
    Omiya:    { '1': '9', '-1': '3・4' },
    Akabane:  { '1': '4', '-1': '3' },
    Urawa:    { '1': '4', '-1': '3' },
  },

  // ── 高崎线（东京@0 → 高崎@24；下り=大宫/高崎方向=升序1）──
  Takasaki: {
    Tokyo:    { '1': '7・8' },
    Ueno:     { '1': '5・6' },
    Omiya:    { '1': '8', '-1': '6' },
    Akabane:  { '1': '4', '-1': '3' },
    Urawa:    { '1': '4', '-1': '3' },
  },

  // ── 常磐线快速（品川@0 → 取手@18；下り=上野/取手方向=升序1）──
  Joban: {
    Shinagawa:{ '1': '9・10' },
    Tokyo:    { '1': '7・8' },
    Ueno:     { '1': '11・12' },
    Nippori:  { '1': '4', '-1': '3' },
    'Kita-Senju': { '1': '1', '-1': '3' },
    Matsudo:  { '1': '1', '-1': '3' },
    Kashiwa:  { '1': '4', '-1': '3' },
    Abiko:    { '1': '1・2', '-1': '2・4' },
    Toride:   { '-1': '3' },
  },

  // ── 常磐线各站停车/缓行线（上野@0 → 取手@18）──
  JobanLocal: {
    Ayase:    { '1': '3・4', '-1': '1・2' },
    Matsudo:  { '1': '4・5', '-1': '6' },
    Kashiwa:  { '1': '2', '-1': '1' },
    Abiko:    { '1': '6・7', '-1': '6・7・8' },
    Toride:   { '-1': '1・2' },
  },

  // ── 东海道线（东京@0 → 热海@13；下り=横滨/小田原方向=升序1）──
  Tokaido: {
    Tokyo:    { '1': '9・10' },
    Shimbashi:{ '1': '1', '-1': '2' },
    Shinagawa:{ '1': '11・12', '-1': '6・7' },
    Yokohama: { '1': '5・6', '-1': '7・8' },
    Kawasaki: { '1': '1', '-1': '2' },
    Totsuka:  { '1': '3', '-1': '2' },
    Ofuna:    { '1': '3・4', '-1': '1・2' },
    Fujisawa: { '1': '2・4', '-1': '3' },
    Hiratsuka:{ '1': '3・4', '-1': '1・2' },
    Odawara:  { '1': '3・4', '-1': '5・6' },
    Atami:    { '1': '2・3', '-1': '4・5' },
  },

  // ── 横须贺线（久里滨@0 → 东京@18；下り=镰仓/久里滨方向=降序-1）──
  Yokosuka: {
    Tokyo:    { '-1': '1・2' },
    Shinagawa: { '1': '13・14', '-1': '15' },
  },

  // ── 总武线快速（上野@0 → 千叶@20；下り=千叶方向=升序1）──
  SobuRapid: {
    Tokyo:    { '1': '1・2' },
    Chiba:    { '-1': '1・2' },
  },

  // ── 埼京线（久保田@0 → 与野@18；南行=与野方向=升序1）──
  Saikyo: {
    Omiya:    { '-1': '5' },
    'Musashi-Urawa': { '1': '1', '-1': '2' },
    'Naka-Urawa':    { '1': '1', '-1': '2' },
    Shibuya:  { '1': '1', '-1': '2' },
    Shinjuku: { '1': '3', '-1': '1・2' },
  },

  // ── 湘南新宿线（大宫@0 → 小田原@23；南行=横滨/小田原方向=升序1）──
  ShonanShinjuku: {
    Omiya:    { '1': '11' },
    Ikebukuro:{ '-1': '3', '1': '2' },
    Shinjuku: { '-1': '4', '1': '1・2' },
    Shibuya:  { '-1': '3', '1': '4' },
    Ebisu:    { '-1': '3', '1': '4' },
    Osaki:    { '-1': '8', '1': '5' },
    Yokohama: { '-1': '10', '1': '9' },
    Akabane:  { '1': '5', '-1': '6' },
    Urawa:    { '1': '5', '-1': '6' },
    Totsuka:  { '1': '4', '-1': '1' },
    Ofuna:    { '1': '3・4', '-1': '1・2・5・6' },
    Fujisawa: { '1': '2・4', '-1': '3' },
    Hiratsuka:{ '1': '3・4', '-1': '1・2' },
    Odawara:  { '-1': '5・6' },
  },

  // ── 成田特快（部分站有特殊番线）──
  TsukubaExpress: {
    Akihabara:{ '1': '1' },
    Asakusa:  { '1': '1', '-1': '1' },
    Aoi:      { '1': '1', '-1': '1' },
    Rokucho:  { '1': '1', '-1': '1' },
    Moriya:   { '1': '1', '-1': '1' },
    Tsukuba:  { '-1': '1' },
  },

  // ── 小田急小田原线（新宿@0 → 小田原@46；南行=小田原方向=升序1）──
  Odawara: {
    Shinjuku: { '1': '1・2' },
    Odawara:  { '-1': '1・2' },
    // 中间大部分站是 2面4线（1・2/3・4），个别小站是 2面2线（1/2）
    Kaisei:   { '1': '1', '-1': '2' },
    Kayama:   { '1': '1', '-1': '2' },
    Tomizu:   { '1': '1', '-1': '2' },
    Hotaruda: { '1': '1', '-1': '2' },
    Ashigara: { '1': '1', '-1': '2' },
  },

  // ── 京急线（仙谷寺@0 → 浦贺@28；南行=浦贺方向=升序1）──
  Keikyu: {
    Sengakuji:{ '1': '1' },
    Uraga:    { '-1': '1' },
  },

  // ── 东京单轨（昭和岛@4 → 羽田机场@10）──
  TokyoMonorail: {
    Showajima:{ '1': '1' },
    Seibijo:  { '1': '1', '-1': '1' },
    Tenkubashi:{ '-1': '1' },
  },

  // ── 百合鸥线（新桥@0 → 丰洲@12；北行=新桥方向=降序-1）──
  Yurikamome: {
    Shimbashi:{ '1': '1' },
    Toyosu:   { '-1': '1' },
  },

  // ── 银座线（涩谷@0 → 浅草@15；南行=浅草方向=升序1）──
  Ginza: {
    Shibuya:  { '1': '1' },
    Asakusa:  { '-1': '1' },
  },

  // ── 日比谷线（惠比寿@0 → 中目黑@14；东行=中目黑方向=升序1）──
  Hibiya: {
    Ebisu:    { '1': '1' },
    Nakameguro:{ '-1': '1' },
  },

  // ── 丸之内线（荻洼@0 → 池袋@11；东行=池袋方向=升序1）──
  Marunouchi: {
    Ogikubo:  { '1': '1' },
    Ikebukuro:{ '-1': '1' },
  },

  // ── 千代田线（表参道@0 → 绫濑@16；南行=绫濑方向=升序1）──
  Chiyoda: {
    Omotesando:{ '1': '1' },
    Ayase:    { '-1': '1' },
  },

  // ── 副都心线（和光市@0 → 涩谷@8；东行=涩谷方向=升序1）──
  Fukutoshin: {
    Wakoshi:  { '1': '1' },
  },

  // ── 南北线（目黑@0 → 早稻田@8；西行=早稻田方向=降序-1）──
  Namboku: {
    Meguro:   { '1': '1' },
    Shimo:    { '-1': '1' },
  },

  // ── 大江户线（户町前@0 → 新宿@19；东行=新宿方向=升序1）──
  Oedo: {
    Tochomae: { '1': '1' },
    Shinjuku: { '-1': '1' },
  },

  // ── 三田线（目黑@0 → 高松台@8；南行=高松台方向=升序1）──
  Mita: {
    Meguro:   { '1': '1' },
    Takashimadaira:{ '-1': '1' },
  },

  // ── 东西线（中野@0 → 船桥@15；东行=船桥方向=升序1）──
  Tozai: {
    Nakano:   { '1': '1' },
    Myoden:   { '-1': '1' },
  },

  // ── 浅草线（町目@0 → 押上@16；南行=押上方向=升序1）──
  Asakusa: {
    Magome:   { '1': '1' },
    Oshiage:  { '-1': '1' },
  },

  // ── 东急田园调布线（涩谷@0 → 横滨@14；南行=横滨方向=升序1）──
  TokyuToyoko: {
    Shibuya:  { '1': '1' },
    Yokohama: { '-1': '1' },
  },

  // ── 西武新宿线（高田马场@0 → 菊名@13；南行=菊名方向=升序1）──
  SeibuShinjuku: {
    Takadanobaba:{ '1': '1' },
    'Hon-Kawagoe': { '-1': '1' },
  },

  // ── 东武天空树线（浅草@0 → 南浦和@17；西行=南浦和方向=升序1）──
  TobuSkytree: {
    Asakusa:  { '1': '1' },
    'Tobu-Dobutsu-Koen': { '-1': '1' },
  },

  // ── 京成线（日暮里@0 → 大佐仓@13；南行=大佐仓方向=升序1）──
  Keisei: {
    Nippori:  { '1': '1' },
    Ohsakura: { '-1': '1' },
  },

  // ── 有乐町线（和光市@0 → 涩谷@9；东行=涩谷方向=升序1）──
  Yurakucho: {
    Wakoshi:   { '1': '1' },
    'Shin-Kiba': { '-1': '1' },
  },

  // ── 相铁线（横滨@0 → 饭 maker@13；南行=饭 maker方向=升序1）──
  SotetsuMain: {
    Yokohama: { '1': '1' },
    Ebina:    { '-1': '1' },
  },

  // ── 临海线（大崎@0 → 东武动物公园@7；南行=东武方向=升序1）──
  Rinkai: {
    Osaki:     { '1': '1' },
    'Shin-Kiba': { '-1': '1' },
  },

  // ── 成田Sky Access（成田内山@0 → 机场@3）──
  NaritaSkyAccess: {
    'Keisei-Takasago': { '1': '1' },
    'Narita-Airport':  { '-1': '1' },
  },

  // ── 小田江之岛线（涩谷@0 → 江之岛@7；南行=江之岛方向=升序1）──
  OdakyuEnoshima: {
    'Sagami-Ono':   { '1': '1' },
    'Katase-Enoshima': { '-1': '1' },
  },

  // ── 东急登山线（长津田@0 → 八王子@11；西行=八王子方向=升序1）──
  TokyuDenEn: {
    Nagatsuta:{ '1': '1' },
    'Chuo-Rinkan': { '-1': '1' },
  },

  // ── 西武多摩川线（西武新宿@0 → 永田@3）──
  SeibuTamagawa: {
    Koremasa:      { '1': '1' },
    'Musashi-Sakai': { '-1': '1' },
  },

  // ── 西武田无线路（所泽@0 → 粕壁@4）──
  SeibuTamako: {
    Kodaira:   { '1': '1' },
    Tamako:    { '-1': '1' },
  },

  // ── 西武陵线（大泉公园@0 → 西武陵@1）──
  SeibuToshima: {
    Nerima:     { '1': '1' },
    Toshimaen:  { '-1': '1' },
  },

  // ── 西武樱花线（西武樱花公园@0 → 狭山@1）──

  // ── 西武山口线（小竹向原@0 → 西武山口@1）──
  SeibuYamaguchi: {
    Tamako:              { '1': '1' },
    'Seibu-Kyujou-Mae': { '-1': '1' },
  },

  // ── 西武线（所泽@0 → 西武大学@1）──
  SeibuEn: {
    'Higashi-Murayama': { '1': '1' },
    'Seibu-en':         { '-1': '1' },
  },

  // ── 京王线（新宿@0 → 京王八王子@31；西行=高尾方向=升序1）──
  KeioMain: {
    Shinjuku: { '1': '9', '-1': '10' },
  },

  // ── 八高线（八王子@0 → 高丽川@8；下り=高丽川方向=升序1）──
  Hachiko: {
    Hachioji: { '1': '1' },
  },

  // ── 青梅线（立川@0 → 奥多摩@24；下り=奥多摩方向=升序1）──
  Ome: {
    Tachikawa:{ '1': '1・2' },
  },
};

// ─────────────────────────────────────────────
// 4. 生成 PLATFORM_DATA
// ─────────────────────────────────────────────
function generatePlatformData() {
  const result = {};

  for (const [lineId, lineData] of Object.entries(LINES)) {
    const stations = lineData.stations;
    if (!stations || stations.length === 0) continue;

    // 已有显式数据 → 直接用
    if (EXPLICIT[lineId]) {
      result[lineId] = { ...defaultForLine(stations), ...EXPLICIT[lineId] };
      continue;
    }

    // 跳过默认规则的线路（不收录，查询返回 null）
    if (SKIP_DEFAULT.has(lineId)) continue;

    // 默认规则生成
    result[lineId] = defaultForLine(stations);
  }

  return result;
}

// ─────────────────────────────────────────────
// 5. 输出
// ─────────────────────────────────────────────
function formatJs(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const pad2 = '  '.repeat(indent + 1);
  let out = '{\n';
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      out += `${pad2}"${k}": ${formatJs(v, indent + 1)},\n`;
    } else {
      out += `${pad2}"${k}": ${JSON.stringify(v)},\n`;
    }
  }
  out += pad + '}',
  out += '\n';
  return out;
}

function main() {
  const platformData = generatePlatformData();

  const lineCount = Object.keys(platformData).length;
  const stationCount = Object.values(platformData)
    .reduce((sum, d) => sum + Object.keys(d).length, 0);

  console.log(`生成完成: ${lineCount} 条线路, ${stationCount} 个车站`);

  // 检查是否有 EXPLICIT 里的站不在 LINES 里
  let missingStations = 0;
  for (const [lineId, explicit] of Object.entries(EXPLICIT)) {
    const lineStations = new Set(LINES[lineId]?.stations || []);
    for (const st of Object.keys(explicit)) {
      if (!lineStations.has(st)) {
        console.warn(`  警告: ${lineId} 的 ${st} 不在站序中`);
        missingStations++;
      }
    }
  }
  if (missingStations === 0) console.log('  所有显式站均在站序中，无缺失');

  const outDir = path.join(__dirname, 'platform-data.generated.js');
  fs.writeFileSync(outDir, generateFile(platformData), 'utf8');
  console.log(`已写入: ${outDir}`);
}

function generateFile(platformData) {
  const lines = [];
  lines.push('/**');
  lines.push(' * Pixel Tetsudo - 発着番線データ（Platform Data, 自动生成）');
  lines.push(' *');
  lines.push(' * 此文件由 generate-platform-data.js 生成，请勿手动编辑。');
  lines.push(' * 数据源: railway-data.file.js（站序）+ generate-platform-data.js（显式例外表）');
  lines.push(' */');
  lines.push('window.PLATFORM_DATA = ' + formatJs(platformData, 0) + ';');
  lines.push('');
  lines.push('// 改札口/出入口（v4.3.595 精选版）');
  lines.push('window.EXIT_DATA = {');
  lines.push('  "Akihabara": { "default": "中央改札" },');
  lines.push('  "Ueno": { "default": "中央改札" },');
  lines.push('  "Shinagawa": { "default": "中央改札" },');
  lines.push('  "Yokohama": { "default": "中央改札" },');
  lines.push('  "Omiya": { "default": "中央改札" },');
  lines.push('  "Kashiwa": { "default": "中央口" },');
  lines.push('  "Kawasaki": { "default": "中央改札" },');
  lines.push('  "Funabashi": { "default": "中央口" },');
  lines.push('  "Chiba": { "default": "中央改札" }');
  lines.push('};');
  lines.push('');
  lines.push('// 幹線本名別名統一');
  lines.push('var _PLATFORM_LINE_ALIAS = {');
  lines.push('  "TokaidoMain": "Tokaido",');
  lines.push('  "TohokuMain": "UtsunomiyaJR"');
  lines.push('};');
  lines.push('');
  lines.push('// 番線解決 API');
  lines.push('window.PlatformResolver = {');
  lines.push('  resolve: function(lineId, stationId, direction) {');
  lines.push('    try {');
  lines.push('      if (!window.PLATFORM_DATA) return null;');
  lines.push('      var L = window.PLATFORM_DATA[_PLATFORM_LINE_ALIAS[lineId] || lineId];');
  lines.push('      if (!L) return null;');
  lines.push('      var S = L[stationId];');
  lines.push('      if (!S) return null;');
  lines.push('      var d = String(direction == null ? 0 : direction);');
  lines.push('      if (S[d]) return S[d];');
  lines.push('      if (S["*"]) return S["*"];');
  lines.push('      return null;');
  lines.push('    } catch (e) { return null; }');
  lines.push('  },');
  lines.push('  resolveExit: function(stationId) {');
  lines.push('    try {');
  lines.push('      if (!window.EXIT_DATA) return null;');
  lines.push('      var E = window.EXIT_DATA[stationId];');
  lines.push('      if (!E || !E.default) return null;');
  lines.push('      return E.default;');
  lines.push('    } catch (e) { return null; }');
  lines.push('  }');
  lines.push('};');
  return lines.join('\n');
}

main();
