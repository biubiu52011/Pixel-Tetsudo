#!/usr/bin/env node
/**
 * gallery-sync.js —— 图库同步接入工具
 *
 * 用户更新 images/列车/ 图库后，把新增图接入车型判定图标映射：
 *   1. 扫描未引用的新图
 *   2. 按 公司目录 × 文件名前缀 × 数字段 解码车型名（解码表见 DECODE）
 *   3. 与现有 VEHICLE_NAME_TO_ICON 对照，分类：
 *        update  —— 同车型旧图 → 新图（替换映射值）
 *        add     —— 全新车型 → 新增映射条目
 *        pool    —— 同车型编成/涂装细分图 → 并入 FLEET_WEIGHTS 池（随机映射）
 *        unknown —— 无法解码/未收录线路 → 仅报告不动作
 *   4. dry-run 输出分类清单；--apply 生成 train-icons.js patch
 *
 * 用法：
 *   node tools/gallery-sync.js            # dry-run
 *   node tools/gallery-sync.js --apply    # 应用
 *   node tools/gallery-sync.js --json     # 机读输出
 */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'images', '列车');

// ---------- 解码表：公司目录 → 文件名前缀 → 车型名生成 ----------
// fn: (digits, suffix) => 车型名；返回 null = 无法解码
const DECODE = {
  '都営地下鉄': { prefix: 'toky', fn: (d, s) => {
      if (s) return null; // e50 等未知后缀
      if (d.length === 3) return d + '形';        // 300/320/330 → 300形
      if (d.length === 4) return d + '形';        // 5000/5300/5500 → 5500形
      if (d.length === 5) return d.slice(0,2) + '-' + d.slice(2) + '形'; // 12000→12-000形
      return null;
  } },
  '東京さくらトラム': { prefix: 'todn', fn: (d, s) => {
      const base = d + '形';
      if (s === 'y') return base;        // 黄色涂装变体 → 同车型（pool）
      if (s === 'n') return base;        // 新涂装变体
      if (s === 'yn') return base;
      if (s === '' && d.length <= 4) return base;
      return base; // 编成号（7001等）归同车型
  } },
  '相模鉄道': { prefix: 'sote', fn: (d, s) => {
      const base = d + '系';
      if (d === '8000' || d === '9000' || d === '10000' || d === '11000' || d === '12000' || d === '20000') return base;
      if (s === 'b' || s === 'n' || s === 'f') return base; // 涂装变体 → 同车型
      if (d.length >= 4 && /^\d{4,5}$/.test(d)) return base; // 编成号
      return null;
  } },
  '横浜市交通局': { prefix: 'yok', fn: (d, s) => {
      const base = d + '形';
      if (['1000','10000','2000','3000','4000'].includes(d)) return base;
      if (s === 'h' || s === 'j' || s === 'n' || s === 's' || s === 'v' || s === 'g' || s === 'n2' || s === 's2' || s === 'jg') return base;
      if (/^\d{4,5}$/.test(d) && d.startsWith('300')) return '3000形';
      return base;
  } },
  '埼玉新都市交通': { prefix: 'nstl', fn: (d, s) => {
      if (d === '1000' && (s === 'gr' || s === 're')) return '1000系';       // 绿/红涂装
      if (/^10\d{2}$/.test(d)) return '1000系';                                // 1051等
      if (d === '2000' || d === '2002' || d === '2003' || d === '2004' || d === '2005' || d === '2006' || d === '2007') return '2000系';
      if (/^20\d{2}$/.test(d)) return '2020系';                                // 2021~2026 → 2020系
      return null;
  } },
  'ゆりかもめ': { prefix: 'yrkm', fn: (d, s) => {
      if (d === '7300' || d === '7500') return d + '系';
      if (d === '7000') return '7000系'; // 已废止历史车
      return null;
  } },
  '東京モノレール': { prefix: 'mn-tky', fn: (d, s) => {
      if (['100','330','500','700','1000','2000','10000'].includes(d)) return d + '形';
      return null;
  } },
  '東京臨海高速鉄道': { prefix: 'twr', fn: (d, s) => {
      if (d === '70000') return '70-000形';
      if (d === '71000') return '71-000形';
      if (/^70\d{3}$/.test(d)) return '70-000形'; // 70001/70002 编成
      return null;
  } },
  '首都圏新都市鉄道': { prefix: 'tx', fn: (d, s) => {
      if (['1000','2000','3000'].includes(d)) return 'TX-' + d + '系';
      return null;
  } },
  '多摩モノレール': { prefix: 'mn-tma', fn: (d, s) => {
      if (d === '1000') return '1000系';
      return null;
  } },
  'JR東日本': { prefix: 'jysn', fn: (d, s) => null }, // 无法解码（上信别称？）
};

// 未收录线路（图库有图但项目无线路数据）——只报告
const UNTRACKED_COMPANIES = ['秩父鉄道','流鉄','銚子電鉄','上信電鉄','いすみ鉄道','鹿島臨海鉄道','真岡鐵道','宇都宮ライトレール','成田空港','茨城交通','ひたちなか海浜鉄道','わたらせ渓谷鉄道','山万','上野モノレール','多摩都市モノレール'];

function loadEnv() {
  const w = { window: {}, console: console, localStorage: { getItem: () => null, setItem: () => {} } };
  w.window = w;
  const ctx = vm.createContext(w);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/train-icons.js'), 'utf8'), ctx, { filename: 'icons' });
  return w.window.TrainIcons;
}

// 扫描未引用图
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

function decode(f) {
  const dec = DECODE[f.comp];
  if (!dec) return { kind: 'untracked', name: null };
  if (!f.file.startsWith(dec.prefix)) return { kind: 'unknown', name: null };
  const rest = f.file.slice(dec.prefix.length).replace(/\.png$/i, '');
  const m = rest.match(/^(\d+)([a-z0-9]*)$/i);
  if (!m) return { kind: 'unknown', name: null };
  const name = dec.fn(m[1], (m[2] || '').toLowerCase());
  if (!name) return { kind: 'unknown', name: null };
  return { kind: 'known', name, digits: m[1], suffix: (m[2] || '').toLowerCase() };
}

function main() {
  const T = loadEnv();
  const opts = { apply: process.argv.includes('--apply'), json: process.argv.includes('--json') };
  const files = scanUnused(T);
  const out = { updates: [], adds: [], pools: [], untracked: [], unknown: [] };
  const nameToIcon = T.VEHICLE_NAME_TO_ICON || {};
  // 收集每个车型的候选图（用于池）
  const pools = {};

  for (const f of files) {
    const dec = decode(f);
    const p = '../images/列车/' + f.rel;
    if (dec.kind === 'untracked') { out.untracked.push(f.comp + '/' + f.file); continue; }
    if (dec.kind === 'unknown') { out.unknown.push(f.comp + '/' + f.file); continue; }
    // 同名已有映射？
    const existing = nameToIcon[dec.name];
    const baseExists = Object.keys(nameToIcon).some(k => k === dec.name);
    if (existing && dec.suffix === '') {
      out.updates.push({ name: dec.name, old: existing, new: p });
    } else {
      (pools[dec.name] = pools[dec.name] || []).push(p);
      out.pools.push({ name: dec.name, icon: p });
    }
  }
  if (opts.json) {
    console.log(JSON.stringify(out, null, 1));
    return;
  }
  console.log(`图库未引用图: ${files.length}`);
  console.log(`  update（同车型换新图）: ${out.updates.length}`);
  for (const u of out.updates.slice(0, 40)) console.log(`    ${u.name}: ${path.basename(u.old)} → ${u.new.split('/').pop()}`);
  console.log(`  pool（编成/涂装细分图）: ${out.pools.length}`);
  for (const p2 of out.pools.slice(0, 30)) console.log(`    ${p2.name} ← ${p2.icon.split('/').pop()}`);
  console.log(`  untracked（未收录线路图）: ${out.untracked.length}`);
  for (const u of out.untracked.slice(0, 20)) console.log(`    ${u}`);
  console.log(`  unknown（无法解码）: ${out.unknown.length}`);
  for (const u of out.unknown.slice(0, 20)) console.log(`    ${u}`);
}
main();
