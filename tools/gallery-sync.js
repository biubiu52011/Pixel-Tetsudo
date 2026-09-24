#!/usr/bin/env node
/**
 * gallery-sync.js v3 —— 图库同步接入（限定名体系）
 * 分类：
 *   update  —— 同车型换新图（限定名 key 已存在 → 换值）
 *   add     —— 全新车型（无现有限定名 → 新增映射）
 *   pool    —— 编成/涂装细分图（同车型多图 → FLEET_ICON_POOLS）
 *   untracked —— 项目无线路数据（只报告）
 *   unknown —— 无法解码（只报告）
 *   (null 池名 bug 已修复；支持中文名 (別N) 与 连字符文件名)
 */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'images', '列车');

// 公司 → {prefix, qualifier, baseFn, variantFn, poolNameFn}
const DECODE = {
  '都営地下鉄': {
    prefix: 'toky', qualifier: '都営',
    baseFn: (d, s) => {
      if (d.length === 3) return d + '形';
      if (d.length === 4) return d + '形';
      if (d.length === 5) return d.slice(0,2) + '-' + d.slice(2) + '形';
      return null;
    },
    variantFn: (d, s) => {
      if (s) return true;
      if (d.length === 5) {
        const tail = d.slice(2);
        if (tail !== '000' && tail !== '300' && tail !== '250' && tail !== '490' && tail !== '520' && tail !== '600' && tail !== '690' && tail !== '700') return true;
      }
      if (d.length === 4 && (d.endsWith('1') || d.endsWith('2')) && ['5000','5200','5300','5500','6000','6300','6500'].includes(d.slice(0,3) + '0')) return true; // 5201/5202/6001/6002 → 编成
      return false;
    },
    poolNameFn: (d, s) => {
      if (d.length === 5) {
        const tail = d.slice(2);
        const mainTails = ['000','300','250','490','520','600','690','700'];
        if (mainTails.includes(tail)) return null; // 主车型涂装 → 回落 baseFn
        return '都営' + d.slice(0,2) + '-' + d.slice(2,3) + '00形'; // 编成号 10001/12001/12601
      }
      if (d.length === 4 && (d.endsWith('1') || d.endsWith('2')) && ['5000','5200','5300','5500','6000','6300','6500'].includes(d.slice(0,3) + '0')) return '都営' + d.slice(0,3) + '0形'; // 5201→5200形
      return null;
    }
  },
  '東京さくらトラム': {
    prefix: 'todn', qualifier: '都電',
    baseFn: (d, s) => {
      if (['4000','5500','6000','7000','7500','7700','8000','8500','8800','8900','9000'].includes(d)) return d + '形';
      return null;
    },
    variantFn: (d, s) => s === 'y' || s === 'n' || s === 'yn' || (d.length === 4 && !d.endsWith('0')),
    poolNameFn: (d, s) => '都電' + d.slice(0,2) + '00形' // 7001→7000形, 8801→8800形
  },
  '相模鉄道': {
    prefix: 'sote', qualifier: '相模鉄道',
    baseFn: (d, s) => (['8000','9000','10000','11000','12000','20000'].includes(d) ? d + '系' : null),
    variantFn: (d, s) => !!s || (d.length === 4 && !['8000','9000'].includes(d)) || d === '10002',
    poolNameFn: (d, s) => {
      if (d === '10002') return '相模鉄道10000系';
      if (/^80\d{2}$/.test(d)) return '相模鉄道8000系';
      if (/^90\d{2}$/.test(d)) return '相模鉄道9000系';
      return null;
    }
  },
  '横浜市交通局': {
    prefix: 'yok', qualifier: '横浜市交通局',
    baseFn: (d, s) => (['1000','2000','3000','4000','10000'].includes(d) ? d + '形' : null),
    variantFn: (d, s) => !!s || (d.startsWith('300') && d !== '3000' && d.length === 4) || d === '10001' || d === '10002',
    poolNameFn: (d, s) => {
      if (d.startsWith('300') && d !== '3000') return '横浜市交通局3000形';
      if (d === '10001' || d === '10002') return '横浜市交通局10000形';
      if (d === '1000' || s && d === '1000') return '横浜市交通局1000形';
      return null;
    }
  },
  '埼玉新都市交通': {
    prefix: 'nstl', qualifier: '埼玉新都市交通',
    baseFn: (d, s) => {
      if (d === '2000') return '2000系';
      if (/^20\d{2}$/.test(d)) return '2020系';
      if (/^10\d{2}$/.test(d)) return '1000系';
      return null;
    },
    variantFn: (d, s) => /^200[2-7]$/.test(d) || (s && d !== '2000') || (d === '2026' && s === 'b') || /^10\d{2}$/.test(d) && d !== '1054',
    poolNameFn: (d, s) => {
      if (/^200[2-7]$/.test(d)) return '埼玉新都市交通2000系';
      if (/^20\d{2}$/.test(d)) return '埼玉新都市交通2020系';
      return '埼玉新都市交通1000系';
    }
  },
  'ゆりかもめ': {
    prefix: 'yrkm', qualifier: '',
    baseFn: (d, s) => (['7300','7500'].includes(d) ? d + '系' : (d === '7000' ? '7000系' : null)),
    variantFn: (d, s) => d === '7000' && /^7000-\d/.test(d + (s ? '-' + s : '')),
    poolNameFn: () => '7000系'
  },
  '東京モノレール': {
    prefix: 'mn-tky', qualifier: '東京モノレール', cnName2: true,
    baseFn: (d, s) => (['100','330','500','700','1000','2000','10000'].includes(d) ? d + '形' : null),
    variantFn: (d, s) => !!s || ['1003','1004','2001','33'].includes(d),
    poolNameFn: (d, s) => {
      if (['1003','1004'].includes(d)) return '東京モノレール1000形';
      if (d === '2001') return '東京モノレール2000形';
      if (d === '33') return '東京モノレール330形';
      if (d.length === 4 && !['1000','2000','10000'].includes(d)) return '東京モノレール' + d.slice(0,2) + '00形';
      if (d === '1000') return '東京モノレール1000形';
      if (d === '100') return '東京モノレール100形';
      if (d === '10000') return '東京モノレール10000形';
      return null;
    }
  },
  '東京臨海高速鉄道': {
    prefix: 'twr', qualifier: '',
    baseFn: (d, s) => (d === '71000' ? '71-000形' : (/^70\d{3}$/.test(d) ? '70-000形' : null)),
    variantFn: (d, s) => d.length === 5 && d !== '70000' && d !== '71000',
    poolNameFn: (d, s) => (d === '71000' ? '71-000形' : '70-000形')
  },
  '首都圏新都市鉄道': {
    prefix: 'tx', qualifier: '',
    baseFn: (d, s) => (['1000','2000','3000','2001','2005'].includes(d) ? 'TX-' + (d === '2001' || d === '2005' ? '2000' : d) + '系' : null),
    variantFn: (d, s) => !!s || d === '2001' || d === '2005',
    poolNameFn: (d, s) => (d === '1000' ? 'TX-1000系' : 'TX-2000系')
  },
  '多摩モノレール': {
    prefix: 'mn-tma', qualifier: '',
    baseFn: (d, s) => (d === '1000' ? '1000系' : null),
    variantFn: (d, s) => !!s || d === '1016',
    poolNameFn: () => '1000系'
  },
  '東急電鉄': {
    prefix: '', qualifier: '東急電鉄', cnName: true,  // 中文名 1000系（別2）.png
    baseFn: (d, s) => null,
    variantFn: (d, s) => false,
    cnBase: f => f.replace(/\.png$/i, '').replace(/（別\d*）|（別）|（[^）]*別[^）]*）/g, '').trim(),
    cnVariant: f => /（別/.test(f)
  },
  '東武鉄道': { prefix: '', qualifier: '東武', cnName: true, baseFn: () => null, variantFn: () => false, cnVariant: f => /（別/.test(f) },
  '西武鉄道': { prefix: '', qualifier: '西武', cnName: true, baseFn: () => null, variantFn: () => false, cnVariant: f => /（別/.test(f) },
  'JR東海': {
    prefix: 'c', qualifier: '',
    baseFn: (d, s) => {
      const map = { '313': '313系', '315': '315系', '373': '373系', '383': '383系' };
      return map[d] || null;
    },
    variantFn: (d, s) => !!s,
    poolNameFn: (d, s) => ({ '313': '313系', '315': '315系', '373': '373系', '383': '383系' }[d])
  },
  'JR東日本': {
    prefix: 'e', qualifier: '',  // e209 系列：线区涂装图统一归 E209系 池
    baseFn: (d, s) => (d === '209' ? 'E209系' : null),
    variantFn: (d, s) => d === '209',
    poolNameFn: () => 'E209系'
  },
  '東武鉄道': {
    prefix: 'tob', qualifier: '東武', cnName: true, baseFn: (d, s) => {
      const main = {
        '10000':'10000系','10030':'10030系','20000':'20000系','30000':'30000系','50000':'50000系',
        '60000':'60000系','70000':'70000系','8000':'8000系','9000':'9000系','9050':'9050系'
      };
      if (main[d]) return main[d];
      if (d === '100' || d === '200' || d === '500' || d === '1000' || d === '2000' || d === '3000' || d === '5000' || d === '6000') return d + '系';
      return null;
    },
    variantFn: (d, s) => !!s || (d.length === 5 && !['10000','10030','20000','30000','50000','60000','70000'].includes(d)),
    poolNameFn: (d, s) => {
      if (d.length === 5 && !['10000','10030','20000','30000','50000','60000','70000'].includes(d)) return '東武' + d.slice(0,4) + '0系';
      return null;
    }
  },
  '西武鉄道': {
    prefix: 'seb', qualifier: '西武', cnName: true, baseFn: (d, s) => {
      const main = {
        '001':'001系','101':'101系','2000':'2000系','4000':'4000系','6000':'6000系','9000':'9000系',
        '10000':'10000系','20000':'20000系','30000':'30000系'
      };
      return main[d] || null;
    },
    variantFn: (d, s) => !!s || (d.length === 5 && !['10000','20000','30000'].includes(d)),
    poolNameFn: (d, s) => {
      if (d.length === 5 && !['10000','20000','30000'].includes(d)) return '西武' + d.slice(0,4) + '0系';
      return null;
    }
  }
};

const LINE_ICON_UPDATES = {
  'Arakawa': '東京さくらトラム/todn8500.png',
  'Asakusa': '都営地下鉄/toky5500.png',
  'Shinjuku': '都営地下鉄/toky10300.png',
  'Mita': '都営地下鉄/toky6300.png',
  'Oedo': '都営地下鉄/toky12000.png',
  'Nippori_Toneri': '都営地下鉄/toky330.png',
  'Rinkai': '東京臨海高速鉄道/twr71000.png',
  'Yurikamome': 'ゆりかもめ/yrkm7300.png',
  'TokyoMonorail': '東京モノレール/mn-tky10000.png',
  'TamaMonorail': '多摩モノレール/mn-tma1000.png',
};

// 项目确无线路数据的公司（图库有图但无法接入）
const UNTRACKED = new Set(['秩父鉄道','流鉄','銚子電鉄','上信電鉄','いすみ鉄道','鹿島臨海鉄道','真岡鐵道','宇都宮ライトレール','成田空港','茨城交通','ひたちなか海浜鉄道','わたらせ渓谷鉄道','山万','上野モノレール','JR四国']);

function loadEnv() {
  const w = { window: {}, console: console, localStorage: { getItem: () => null, setItem: () => {} } };
  w.window = w;
  const ctx = vm.createContext(w);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/train-icons.js'), 'utf8'), ctx, { filename: 'icons' });
  return w.window.TrainIcons;
}

function scanUnused(T) {
  const used = new Set(Object.values(T.VEHICLE_NAME_TO_ICON || {}));
  for (const v of Object.values(T.LINE_ICONS || {})) if (typeof v === 'string') used.add(v);
  for (const v of Object.values(T.OPERATOR_ICONS || {})) if (typeof v === 'string') used.add(v);
  const files = [];
  for (const dir of fs.readdirSync(IMG)) {
    const d = path.join(IMG, dir);
    if (!fs.statSync(d).isDirectory()) continue;
    if (dir === '_temp') continue;
    for (const f of fs.readdirSync(d)) {
      if (!f.toLowerCase().endsWith('.png')) continue;
      const rel = dir + '/' + f;
      if (!used.has('../images/列车/' + rel)) files.push({ comp: dir, file: f, rel });
    }
  }
  return files;
}

function main() {
  const T = loadEnv();
  const files = scanUnused(T);
  const out = { update: [], add: [], pool: [], untracked: [], unknown: [] };
  const V = T.VEHICLE_NAME_TO_ICON || {};
  const pools = {};

  for (const f of files) {
    const dec = DECODE[f.comp];
    const p = '../images/列车/' + f.rel;
    if (!dec) { out.untracked.push(f.rel); continue; }
    if (UNTRACKED.has(f.comp)) { out.untracked.push(f.rel); continue; }

    // 中文名 (別N) 图（東急/東武/西武/東京モノレール）→ 池；非(別)继续走前缀逻辑
    if (dec.cnName || dec.cnName2) {
      const cnBaseDefault = x => x.replace(/\.png$/i, '').replace(/（別\d*）|（別）|（[^）]*別[^）]*）/g, '').trim();
      const cnVariantDefault = x => /（別/.test(x);
      const cnV = dec.cnVariant || cnVariantDefault;
      if (cnV(f.file)) {
        const cnB = (dec.cnBase || cnBaseDefault)(f.file);
        const poolKey2 = cnB.startsWith(dec.qualifier) ? cnB : dec.qualifier + cnB;
        (pools[poolKey2] = pools[poolKey2] || []).push(p);
        out.pool.push({ base: poolKey2, icon: p });
        continue;
      }
      if (!dec.prefix) { out.unknown.push(f.rel); continue; }
      // 有 prefix（tob/seb 等）→ 继续走下方前缀解码
    }

    if (!f.file.startsWith(dec.prefix)) {
      // 特判：横浜 yokk3000s（3000形 特殊涂装）
      if (f.comp === '横浜市交通局' && f.file.startsWith('yokk')) {
        (pools['横浜市交通局3000形'] = pools['横浜市交通局3000形'] || []).push(p);
        out.pool.push({ base: '横浜市交通局3000形', icon: p });
        continue;
      }
      out.unknown.push(f.rel);
      continue;
    }
    const rest = f.file.slice(dec.prefix.length).replace(/\.png$/i, '');
    const m = rest.match(/^(\d+)((?:-[a-z0-9]+)|[a-z0-9_]*)$/i);
    if (!m) { out.unknown.push(f.rel); continue; }
    const digits = m[1], rawSuffix = (m[2] || '');
    const suffix = rawSuffix.replace(/^-/, '').toLowerCase();
    const isVariant = dec.variantFn(digits, suffix);
    if (isVariant) {
      // 编成/涂装 → 池（池名优先用 poolNameFn；无则回落 baseFn 全名）
      const base = dec.baseFn(digits, suffix);
      const fallback = base ? dec.qualifier + base : null;
      const poolName = dec.poolNameFn ? (dec.poolNameFn(digits, suffix) || fallback) : fallback;
      if (!poolName) { out.unknown.push(f.rel); continue; }
      (pools[poolName] = pools[poolName] || []).push(p);
      out.pool.push({ base: poolName, icon: p });
      continue;
    }
    const base = dec.baseFn(digits, suffix);
    if (!base) { out.unknown.push(f.rel); continue; }
    const fullName = dec.qualifier + base;
    if (V[fullName]) {
      out.update.push({ name: fullName, old: V[fullName], new: p });
    } else {
      out.add.push({ name: fullName, icon: p });
    }
  }

  console.log(`未引用图: ${files.length}`);
  console.log(`\n[update] 同车型换新图 (${out.update.length}):`);
  for (const u of out.update) console.log(`  ${u.name}: ${u.old.split('/').pop()} → ${u.new.split('/').pop()}`);
  console.log(`\n[add] 全新车型 (${out.add.length}):`);
  for (const a of out.add) console.log(`  ${a.name} ← ${a.icon.split('/').pop()}`);
  console.log(`\n[pool] 编成/涂装细分图 (${out.pool.length} 张, ${Object.keys(pools).length} 池):`);
  for (const [base, icons] of Object.entries(pools)) {
    console.log(`  ${base}: ${icons.map(i => i.split('/').pop()).join(', ')}`);
  }
  console.log(`\n[untracked] 未收录线路图 (${out.untracked.length}):`);
  const untComp = {};
  for (const u of out.untracked) { const c = u.split('/')[0]; untComp[c] = (untComp[c]||0)+1; }
  console.log('  ' + Object.entries(untComp).map(([c,n]) => `${c}${n}`).join(' | '));
  console.log(`\n[unknown] 无法解码 (${out.unknown.length}):`);
  const unkComp = {};
  for (const u of out.unknown) { const c = u.split('/')[0]; unkComp[c] = (unkComp[c]||0)+1; }
  console.log('  ' + Object.entries(unkComp).map(([c,n]) => `${c}${n}`).join(' | '));
  console.log('  ' + out.unknown.slice(0, 30).join('\n  '));
  console.log(`\n[line] LINE_ICONS 换图 (${Object.keys(LINE_ICON_UPDATES).length}):`);
  for (const [lid, rel] of Object.entries(LINE_ICON_UPDATES)) console.log(`  ${lid}: → ${rel}`);
  if (process.argv.includes("--json")) {
    const outJson = { update: out.update, add: out.add, pool: Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.map(i => typeof i === "string" ? i : i.icon)])), line: LINE_ICON_UPDATES };
    console.log("@@JSON@@" + JSON.stringify(outJson));
  }
}
main();
