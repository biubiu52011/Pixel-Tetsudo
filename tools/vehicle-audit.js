#!/usr/bin/env node
/**
 * vehicle-audit.js —— 像素铁道 车型判定通用审计/修复/发布工具链
 *
 * 一键闭环「直通一致性诊断 → 可证明修复 → 真实链路验证 → 部署发布」，
 * 替代逐次手工查问题、改 MAP、重建、bump、提交的重复流程。
 *
 * 原则（对齐项目契约）：
 *   - 不猜：所有结论来自可机读证据（MAP 候选串 → resolveVehicleIcon → icon 路径）。
 *   - 交叉验证：直通对白名单来自 ThroughService.getDirectThroughLines（数据配置）；
 *     修复只做「可证明」项（dest key 缺失补全），其余输出建议不自动改。
 *   - 分级降噪：error=两端均配置该种别且图标不一致；warn=单端缺失/种别不对应；
 *     info=同 operator 贯通段（a 是 a、b 是 b 可接受）。
 *
 * 用法：
 *   node tools/vehicle-audit.js check [--json] [--min-level warn] [--op <name>]
 *   node tools/vehicle-audit.js fix   [--dry-run|--apply] [--limit N] [--json]
 *   node tools/vehicle-audit.js verify <lineA> <lineB> [--tt <TrainType>] [--urn <destUrn>]
 *   node tools/vehicle-audit.js deploy [--no-push] [--message <msg>] [--bump <ver>]
 *
 * 退出码：0=通过/完成；1=有 error 级不一致或部署失败；2=参数/环境错误。
 */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');

// ---------- Evidence 输入（可机读合同） ----------
const LOAD_FILES = [
  'data/timetables/vehicle-type-map.js',
  'data/core/data-config-bundle.js',
  'js/train-icons.js',
  'js/train-vehicle.js',
];
function loadEnv() {
  const w = { window: {}, console: console, localStorage: { getItem: () => null, setItem: () => {} } };
  w.window = w;
  const ctx = vm.createContext(w);
  for (const f of LOAD_FILES) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) throw new Error('缺少依赖文件: ' + f);
    vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
  }
  return w;
}

// ---------- operator / 线路短名 配置（与诊断口径一致） ----------
const OP = {
  Hibiya:'TokyoMetro',Hanzomon:'TokyoMetro',Chiyoda:'TokyoMetro',Tozai:'TokyoMetro',Yurakucho:'TokyoMetro',Fukutoshin:'TokyoMetro',Namboku:'TokyoMetro',Shinjuku:'Toei',
  Mita:'Toei',Asakusa:'Toei',
  TobuSkytree:'Tobu',TobuIsesaki:'Tobu',TobuNikko:'Tobu',Tojo:'Tobu',
  TokyuToyoko:'Tokyu',TokyuMeguro:'Tokyu',TokyuDenEn:'Tokyu',TokyuOimachi:'Tokyu',
  Yurakucho_Seibu:'Seibu',Ikebukuro:'Seibu',SeibuChichibu:'Seibu',
  Keisei:'Keisei',KeiseiOshiage:'Keisei',NaritaSkyAccess:'Keisei',
  Keikyu:'Keikyu',KeikyuAirport:'Keikyu',KeikyuKurihama:'Keikyu',KeikyuZushi:'Keikyu',
  SotetsuMain:'Sotetsu',SotetsuIzumino:'Sotetsu','SotetsuShin-Yokohama':'Sotetsu',
  MinatoMirai:'Minatomirai',Rinkai:'TWR',OdakyuTama:'Odakyu',Odawara:'Odakyu',Keio:'Keio',KeioMain:'Keio',
  Saikyo:'JR-East',Kawagoe:'JR-East',KawagoeWest:'JR-East',Joban:'JR-East',JobanLocal:'JR-East',Narita:'JR-East',ChuoRapid:'JR-East',ChuoMain:'JR-East',UtsunomiyaJR:'JR-East',Takasaki:'JR-East',Tokaido:'JR-East',Ito:'JR-East',ShonanShinjuku:'JR-East',UenoTokyo:'JR-East',SobuRapid:'JR-East',Yokosuka:'JR-East',Keiyo:'JR-East',Musashino:'JR-East',Uchibo:'JR-East',Sotobo:'JR-East',Hachiko:'JR-East',ChuoSobuLocal:'JR-East',Ome:'JR-East',Itsukaichi:'JR-East',ChuoTatsuno:'JR-East',Shinonoi:'JR-East',Shinetsu:'JR-East',Gono:'JR-East',Kamaishi:'JR-East',OuMain:'JR-East',Tazawako:'JR-East',TohokuMain:'JR-East'
};
const SHORT = { TokyuToyoko:'Toyoko', TokyuDenEn:'DenEnToshi', TokyuMeguro:'Meguro', TokyuOimachi:'Oimachi', MinatoMirai:'Minatomirai', Hanzomon:'Hanzomon', Hibiya:'Hibiya', Chiyoda:'Chiyoda', Tozai:'Tozai', Yurakucho:'Yurakucho', Fukutoshin:'Fukutoshin', Namboku:'Namboku', Shinjuku:'Shinjuku', Mita:'Mita', Asakusa:'Asakusa', TobuSkytree:'Skytree', TobuIsesaki:'Isesaki', TobuNikko:'Nikko', Tojo:'Tojo', Yurakucho_Seibu:'Yurakucho', Ikebukuro:'Ikebukuro', Keisei:'KeiseiMain', KeiseiOshiage:'Oshiage', NaritaSkyAccess:'NaritaSkyAccess', Keikyu:'KeikyuMain', KeikyuAirport:'Airport', KeikyuKurihama:'Kurihama', KeikyuZushi:'Zushi', SotetsuMain:'Sotetsu', SotetsuIzumino:'Izumino', 'SotetsuShin-Yokohama':'SotetsuShinYokohama', Odawara:'Odawara', OdakyuTama:'Tama', Keio:'Keio', KeioMain:'Keio', KeioShin:'KeioNew', Shinetsu:'Shinetsu', Shinonoi:'Shinonoi', ChuoMain:'ChuoMain', ChuoTatsuno:'ChuoTatsuno', OuMain:'OuMain', Gono:'Gono', Tazawako:'Tazawako', TohokuMain:'TohokuMain', Kamaishi:'Kamaishi', JobanLocal:'JobanLocal', ChuoSobuLocal:'ChuoSobuLocal' };

// ---------- 核心：候选串解析（与 resolveVehicleType 同口径） ----------
function candsStr(MAP, line, destOp, destLine) {
  const cfg = MAP[line] || {}; const per = {};
  for (const tt of Object.keys(cfg)) {
    const m = cfg[tt] || {};
    const v = (destLine && m[destLine]) || (destOp && m[destOp]) || m['default'] || '';
    if (typeof v === 'string' && v.trim()) per[tt] = v.trim();
  }
  return per;
}
function fbFor(MAP, line, destOp, destLine) {
  const cfg = MAP[line] || {};
  for (const tt of Object.keys(cfg)) {
    const m = cfg[tt] || {};
    const v = (destLine && m[destLine]) || (destOp && m[destOp]) || m['default'] || '';
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}
function iconSet(w, candStr, lineId) {
  const r = w.TrainIcons.resolveVehicleIcon(candStr, lineId);
  if (!r) return [];
  return String(r).split('/').map(x => x.trim().split('/').pop());
}
function firstIcon(w, candStr, lineId) { return iconSet(w, candStr, lineId)[0] || ''; }

// ---------- check ----------
function runCheck(w, opts) {
  const MAP = w.VehicleTypeMap.MAP, TS = w.ThroughService;
  const edges = new Set(); const pairs = [];
  for (const a of Object.keys(MAP)) {
    const thru = TS.getDirectThroughLines(a) || [];
    for (const b of thru) {
      if (a === b || !MAP[b]) continue;
      const key = [a, b].sort().join('|');
      if (!edges.has(key)) { edges.add(key); pairs.push([a, b]); }
    }
  }
  const findings = { error: [], warn: [], info: [] };
  let checked = 0;
  for (const [a, b] of pairs) {
    const opA = OP[a] || '', opB = OP[b] || '';
    const ca = candsStr(MAP, a, opB, SHORT[b] || ''), cb = candsStr(MAP, b, opA, SHORT[a] || '');
    const tts = [...new Set([...Object.keys(ca), ...Object.keys(cb)])];
    for (const tt of tts) {
      const hasA = ca[tt] !== undefined, hasB = cb[tt] !== undefined;
      const va = hasA ? ca[tt] : fbFor(MAP, a, opB, SHORT[b] || '');
      const vb = hasB ? cb[tt] : fbFor(MAP, b, opA, SHORT[a] || '');
      const ia = iconSet(w, va, a), ib = iconSet(w, vb, b);
      if (!va || !vb) continue;
      checked++;
      if (JSON.stringify(ia) === JSON.stringify(ib)) continue;
      const sameOp = (opA && opA === opB);
      const level = (hasA && hasB) ? (sameOp ? 'info' : 'error') : 'warn';
      findings[level].push({
        pair: `${a}(${tt}) ⇄ ${b}(${tt})`, a, b, tt,
        hasA, hasB, sameOp,
        va, vb, ia, ib,
      });
    }
  }
  if (opts.minLevel && opts.minLevel !== 'error') {
    const order = { error: 0, warn: 1, info: 2 };
    for (const k of ['error','warn','info']) if (order[k] < order[opts.minLevel]) findings[k] = [];
  }
  if (opts.op) {
    for (const k of Object.keys(findings)) findings[k] = findings[k].filter(f => OP[f.a] === opts.op || OP[f.b] === opts.op);
  }
  if (opts.json) {
    console.log(JSON.stringify({ checked, error: findings.error.length, warn: findings.warn.length, info: findings.info.length, findings }, null, 1));
  } else {
    console.log(`直通对: ${pairs.length} | 种别检查: ${checked} | error: ${findings.error.length} | warn: ${findings.warn.length} | info: ${findings.info.length}`);
    for (const f of findings.error) {
      console.log(`[error] ${f.pair}\n   A[${OP[f.b]}] "${f.va}" → ${f.ia.join('|')}\n   B[${OP[f.a]}] "${f.vb}" → ${f.ib.join('|')}`);
    }
    for (const f of findings.warn) console.log(`[warn ] ${f.pair}  (单端配置/种别不对应)  A=${f.ia[0]||'-'} B=${f.ib[0]||'-'}`);
    for (const f of findings.info) console.log(`[info ] ${f.pair}  (同operator贯通)  A=${f.ia[0]||'-'} B=${f.ib[0]||'-'}`);
  }
  return findings.error.length === 0 ? 0 : 1;
}

// ---------- fix（仅可证明自动修复：dest key 缺失补全；其余输出建议） ----------
function buildPatches(w, errs, limit) {
  const MAP = w.VehicleTypeMap.MAP;
  const patches = [];          // 可自动应用：{file, line, tt, key, oldVal, newVal}
  const suggestions = [];      // 需人工裁决：首项统一 / 串名清理
  let n = 0;
  for (const f of errs) {
    if (limit && patches.length + suggestions.length >= limit) break;
    const cfgA = MAP[f.a] || {}, cfgB = MAP[f.b] || {};
    const tmA = cfgA[f.tt], tmB = cfgB[f.tt];
    const keyA = SHORT[f.b] || OP[f.b] || '';   // a 侧应当有的 dest key（对 b）
    const keyB = SHORT[f.a] || OP[f.a] || '';   // b 侧应当有的 dest key（对 a）
    // 规则1：一端缺 key → 补对端已配置的串（可证明的最小修正）
    if (tmA && tmB && keyA && keyB) {
      if (!tmA[keyA] && tmB[keyB]) {
        patches.push({ line: f.a, tt: f.tt, key: keyA, oldVal: tmA['default'] || '', newVal: tmB[keyB], reason: `补 ${f.a}.${f.tt}.${keyA} = ${f.b} 侧已配置串` });
        n++;
      } else if (!tmB[keyB] && tmA[keyA]) {
        patches.push({ line: f.b, tt: f.tt, key: keyB, oldVal: tmB['default'] || '', newVal: tmA[keyA], reason: `补 ${f.b}.${f.tt}.${keyB} = ${f.a} 侧已配置串` });
        n++;
      } else if (tmA[keyA] && tmB[keyB]) {
        // 规则2：两端都有 key 但首项 icon 不同 → 建议（不自动）
        suggestions.push({ pair: f.pair, a: f.a, b: f.b, tt: f.tt, keyA, keyB, va: tmA[keyA], vb: tmB[keyB], reason: '两端均配置但首项图标不同，需人工裁决统一方向' });
      }
    } else {
      suggestions.push({ pair: f.pair, reason: '种别/配置结构异常，需人工检查' });
    }
  }
  return { patches, suggestions };
}
function applyPatchFile(fileRel, patches) {
  const p = path.join(ROOT, fileRel);
  let src = fs.readFileSync(p, 'utf8');
  let applied = 0;
  for (const pt of patches) {
    if (!pt.line) continue;
    // 精确定位：MAP 块内 line.tt 对象的 key 行，用结构化锚点替换
    const re = new RegExp(
      escapeRe("'" + pt.tt + "': {") + '[\\s\\S]*?' + escapeRe("'" + pt.key + "'") + ":\\s*'([^']*)'",
      'm'
    );
    // 由于是跨行正则，用「对象级解析」更稳：按行扫描定位
    // —— 简化：锚定到 line 块首行，逐 key 行匹配
    applied += applyStructured(src, pt);
  }
  fs.writeFileSync(p, src, 'utf8');
  return applied;
}
function applyStructured(src, pt) {
  // 找 line 块起始，并限定在 line 块内（line 块结束 = 4 空格缩进的 "},"）
  const lineRe = new RegExp(escapeRe("'" + pt.line + "': {"), 'm');
  const lm = lineRe.exec(src);
  if (!lm) return 0;
  const start = lm.index;
  const lineEndRe = /\n {4}\},/;
  const le = lineEndRe.exec(src.slice(start));
  const blockEnd = le ? start + le.index + le[0].length : src.length;
  // 找 tt 块（限定在 line 块内；tt 块结束 = 6 空格缩进的 "},"）
  const ttRe = new RegExp(escapeRe("'" + pt.tt + "': {"), 'm');
  const tm = ttRe.exec(src.slice(start, blockEnd));
  if (!tm) return 0;
  const tStart = start + tm.index;
  const ttEndRe = /\n {6}\},/;
  const te = ttEndRe.exec(src.slice(tStart));
  const ttEnd = te ? Math.min(tStart + te.index + te[0].length, blockEnd) : blockEnd;
  // 在 tt 块内：key 已存在则跳过；否则在 default 行后插入
  const keyRe = new RegExp("^\\s*'" + escapeRe(pt.key) + "'\\s*:\\s*'[^']*',?$", 'm');
  const km = keyRe.exec(src.slice(tStart, ttEnd));
  if (km) return 0;
  // 优先行首 default（多行格式）；否则行内 default（单行格式 'tt': { 'default': 'x' }）
  const defRe = /^\s*'default'\s*:\s*'[^']*',?$/m;
  const dm = defRe.exec(src.slice(tStart, ttEnd));
  if (dm) {
    const insAt = tStart + dm.index + dm[0].length;
    const indent = /^\s*/.exec(dm[0])[0] || '    ';
    const nl = src.includes('\r\n') ? '\r\n' : '\n';
    const insert = nl + indent + "'" + pt.key + "': '" + pt.newVal.replace(/'/g, "\\'") + "',";
    return src.slice(0, insAt) + insert + src.slice(insAt);
  }
  // 单行格式：'tt': { 'default': 'x' } → 'tt': { 'default': 'x', 'key': 'val' }
  // 仅限 tt 块首行，避免匹配后续行
  const firstLineEnd = src.indexOf('\n', tStart);
  const firstLine = src.slice(tStart, firstLineEnd < 0 ? ttEnd : Math.min(firstLineEnd, ttEnd));
  const inlineRe = /\{\s*'default'\s*:\s*'[^']*'\s*\}\s*,?$/;
  const im = inlineRe.exec(firstLine);
  if (!im) return 0;
  const insAt2 = tStart + im.index + im[0].indexOf('}'); // '}' 处（对象内部末尾）
  const insert2 = ", '" + pt.key + "': '" + pt.newVal.replace(/'/g, "\\'") + "'";
  return src.slice(0, insAt2) + insert2 + src.slice(insAt2);
}
function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function runFix(w, opts) {
  const MAP = w.VehicleTypeMap.MAP;
  // 复用 check 的 error 集合
  const errs = [];
  const TS = w.ThroughService;
  const edges = new Set(); const pairs = [];
  for (const a of Object.keys(MAP)) {
    for (const b of (TS.getDirectThroughLines(a) || [])) {
      if (a === b || !MAP[b]) continue;
      const key = [a, b].sort().join('|');
      if (!edges.has(key)) { edges.add(key); pairs.push([a, b]); }
    }
  }
  for (const [a, b] of pairs) {
    const opA = OP[a] || '', opB = OP[b] || '';
    if (opA && opB && opA === opB) continue; // 同 operator 贯通段（a 是 a、b 是 b）不自动修
    const ca = candsStr(MAP, a, opB, SHORT[b] || ''), cb = candsStr(MAP, b, opA, SHORT[a] || '');
    for (const tt of [...new Set([...Object.keys(ca), ...Object.keys(cb)])]) {
      const hasA = ca[tt] !== undefined, hasB = cb[tt] !== undefined;
      if (!hasA || !hasB) continue;
      const va = ca[tt], vb = cb[tt];
      const ia = iconSet(w, va, a), ib = iconSet(w, vb, b);
      if (JSON.stringify(ia) !== JSON.stringify(ib)) errs.push({ a, b, tt, hasA: true, hasB: true, va, vb, ia, ib });
    }
  }
  const { patches, suggestions } = buildPatches(w, errs, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify({ patches, suggestions }, null, 1));
  } else {
    console.log(`可自动修复(${patches.length}):`);
    for (const pt of patches) console.log(`  [${pt.line}.${pt.tt}.${pt.key}] ${pt.reason}\n      → ${pt.newVal}`);
    console.log(`需人工裁决(${suggestions.length}):`);
    for (const s of suggestions.slice(0, 20)) console.log(`  ${s.pair || s.a + '⇄' + s.b}  ${s.reason}`);
    if (suggestions.length > 20) console.log(`  ... 其余 ${suggestions.length - 20} 条`);
  }
  if (opts.apply) {
    let applied = 0;
    for (const pt of patches) applied += applyPatchFile('data/timetables/vehicle-type-map.js', [pt]);
    console.log(`已应用修复: ${applied}/${patches.length}`);
    return patches.length > 0 ? (applied === patches.length ? 0 : 2) : 0;
  }
  return 0; // dry-run
}

// ---------- verify（真实 resolve 链路，URN 粒度） ----------
function runVerify(w, args) {
  if (args.length < 2) { console.error('用法: vehicle-audit verify <lineA> <lineB> [--tt <TrainType>] [--urn <destUrn>]'); return 2; }
  const [a, b] = args;
  const tt = args.includes('--tt') ? args[args.indexOf('--tt') + 1] : 'odpt.TrainType:' + OP[a] + '.Local';
  const urn = args.includes('--urn') ? args[args.indexOf('--urn') + 1] : '';
  if (!w.TrainVehicle) { console.error('TrainVehicle 未加载'); return 2; }
  function res(line, op, destUrn) {
    const r = w.TrainVehicle.resolve({ lineId: line, operator: op, destinationStation: destUrn, trainType: tt });
    return { name: r && r.name || '', icon: (r && r.iconPath || '').replace('../images/列车/', '') };
  }
  const ra = res(a, OP[a], urn);
  const rb = res(b, OP[b], urn);
  console.log(`verify ${a}(${tt}) ⇄ ${b}(${tt})  urn=${urn || '(default)'}`);
  console.log(`  ${a}: ${ra.name} -> ${ra.icon}`);
  console.log(`  ${b}: ${rb.name} -> ${rb.icon}`);
  const ok = ra.icon && ra.icon === rb.icon;
  console.log(ok ? '  ✓ 两端图标一致' : '  ✗ 两端图标不一致');
  return ok ? 0 : 1;
}

// ---------- deploy（重建 resolver + bump 版本 + audit + 提交/推送） ----------
function runDeploy(opts) {
  const ver = opts.bump || '4.3.1021';
  // 1) 重建离线 resolver
  const build = path.join(ROOT, '.work/build-train-vehicle-resolver.js');
  if (fs.existsSync(build)) {
    const r = spawnSync('node', [build], { cwd: ROOT, encoding: 'utf8' });
    if (r.status !== 0) { console.error('resolver 重建失败:\n' + (r.stderr || r.stdout)); return 2; }
    console.log('✓ resolver 重建', (r.stdout || '').trim().split('\n').pop());
  } else {
    console.warn('! 未找到 build-train-vehicle-resolver.js，跳过 resolver 重建');
  }
  // 2) bump pages/trains.html 版本戳
  const html = path.join(ROOT, 'pages/trains.html');
  let h = fs.readFileSync(html, 'utf8');
  const vre = /(vehicle-type-map\.js\?v=4\.3\.\d+|train-vehicle\.js\?v=4\.3\.\d+|train-position-estimator\.js\?v=4\.3\.\d+|train-icons\.js\?v=4\.3\.\d+|trains-render\.js\?v=4\.3\.\d+)/g;
  const before = (h.match(vre) || []).length;
  h = h.replace(/vehicle-type-map\.js\?v=4\.3\.\d+/g, 'vehicle-type-map.js?v=' + ver)
       .replace(/train-vehicle\.js\?v=4\.3\.\d+/g, 'train-vehicle.js?v=' + ver)
       .replace(/train-position-estimator\.js\?v=4\.3\.\d+/g, 'train-position-estimator.js?v=' + ver)
       .replace(/train-icons\.js\?v=4\.3\.\d+/g, 'train-icons.js?v=' + ver)
       .replace(/trains-render\.js\?v=4\.3\.\d+/g, 'trains-render.js?v=' + ver);
  fs.writeFileSync(html, h, 'utf8');
  const after = (h.match(vre) || []).length;
  console.log(`✓ 版本戳 bump → ${ver} (${before} 处)`);
  // 3) audit 基线
  const audit = path.join(ROOT, '.work/audit-v2.js');
  if (fs.existsSync(audit)) {
    const r = spawnSync('node', [audit], { cwd: ROOT, encoding: 'utf8' });
    const tail = (r.stdout || '').trim().split('\n').filter(l => l.includes('总记录') || l.includes('无图标') || l.includes('公司不匹配')).slice(-1)[0] || '';
    console.log('✓ audit:', tail || r.status === 0 ? '(exit 0)' : 'FAIL');
  }
  // 4) git 提交/推送
  const msg = opts.message || 'v' + ver + ' vehicle-audit 一键发布';
  const files = ['data/timetables/vehicle-type-map.js','js/train-icons.js','js/train-position-estimator.js','js/trains-render.js','js/train-vehicle-resolver.js','pages/trains.html','tools/vehicle-audit.js'];
  const add = spawnSync('git', ['add', ...files], { cwd: ROOT, encoding: 'utf8' });
  const commit = spawnSync('git', ['commit', '-m', msg], { cwd: ROOT, encoding: 'utf8' });
  console.log(commit.stdout || commit.stderr || '(无提交内容)');
  if (!opts.noPush) {
    const push = spawnSync('git', ['push', 'origin', 'main'], { cwd: ROOT, encoding: 'utf8' });
    console.log((push.stdout || push.stderr || '').trim() || 'push OK');
  } else {
    console.log('(skip push)');
  }
  return 0;
}

// ---------- cross（时刻表交叉验证直通对） ----------
// 证据：a 线时刻表记录的终点站 URN 中出现 b 线站（直通列车终点在对方线）
// 简化 URN 数据（终点站只有站名/短URN）→ 标注"数据格式限制"，不误判为误配
function runCross(w) {
  const MAP = w.VehicleTypeMap.MAP, TS = w.ThroughService;
  const edges = new Set(); const pairs = [];
  for (const a of Object.keys(MAP)) {
    for (const b of (TS.getDirectThroughLines(a) || [])) {
      if (a === b || !MAP[b]) continue;
      const key = [a, b].sort().join('|');
      if (!edges.has(key)) { edges.add(key); pairs.push([a, b]); }
    }
  }
  const lineKeys = {};      // lid -> Set["op.line"]
  const formatLimited = {}; // lid -> true（destinationStation 无线路段）
  const noFile = {};
  for (const pair of pairs) for (const lid of [pair[0], pair[1]]) {
    if (lineKeys[lid] !== undefined) continue;
    const f = path.join(ROOT, 'data/timetables', lid + '-manual.js');
    if (!fs.existsSync(f)) { lineKeys[lid] = null; noFile[lid] = true; continue; }
    let arr = null;
    try {
      const t2 = fs.readFileSync(f, 'utf8');
      const m = t2.match(/=\s*(\[[\s\S]*)/);
      if (m) {
        let body = m[1];
        const semi = body.lastIndexOf(';');
        if (semi >= 0) body = body.slice(0, semi);
        arr = JSON.parse(body);
      }
    } catch (e) { lineKeys[lid] = null; continue; }
    if (!Array.isArray(arr)) { lineKeys[lid] = null; continue; }
    const keys = new Set();
    for (const r of arr) {
      const v = r['odpt:destinationStation'];
      const vals = Array.isArray(v) ? v : (typeof v === 'string' ? [v] : []);
      for (const x of vals) {
        if (typeof x !== 'string') continue;
        if (x.startsWith('odpt.Station:')) {
          const pp = x.slice('odpt.Station:'.length).split('.');
          if (pp.length >= 3) keys.add(pp[0] + '.' + pp[1]);
          else if (pp.length >= 1 && pp[0]) formatLimited[lid] = true;
        } else if (x.length > 0) {
          formatLimited[lid] = true; // 纯站名
        }
      }
    }
    lineKeys[lid] = keys;
  }
  // 线路段短名别名（同线不同段命名差异，用于交叉验证匹配）
  const SEG_ALIAS = { 'NaritaAbikoBranch': 'Narita', 'NaritaAirportBranch': 'Narita', 'Chuo': 'ChuoMain' };
  const norm = (s) => SEG_ALIAS[s] || s;
  const suspect = [], formatLimit = [], ok = [];
  for (const [a, b] of pairs) {
    const ka = lineKeys[a] || new Set(), kb = lineKeys[b] || new Set();
    const aLines = new Set([...ka].map(k => norm(k.split('.')[1])));
    const bLines = new Set([...kb].map(k => norm(k.split('.')[1])));
    const hitA = [...ka].some(k => bLines.has(norm(k.split('.')[1])));
    const hitB = [...kb].some(k => aLines.has(norm(k.split('.')[1])));
    if (hitA || hitB) ok.push([a, b]);
    else if (noFile[a] || noFile[b] || formatLimited[a] || formatLimited[b]) formatLimit.push([a, b]);
    else suspect.push([a, b]);
  }
  console.log(`交叉验证直通对: ${pairs.length} | 有时刻表证据: ${ok.length} | 数据格式限制(无法验证): ${formatLimit.length} | 存疑: ${suspect.length}`);
  if (suspect.length) {
    console.log('\n=== 存疑（両线均有完整URN但无直通站证据）——需人工裁决 ===');
    for (const [a, b] of suspect) console.log(`  ${a} ⇄ ${b}`);
  }
  if (formatLimit.length) {
    console.log('\n=== 数据格式限制（终点站无线路段，无法交叉验证，按业界常识保留） ===');
    for (const [a, b] of formatLimit) console.log(`  ${a} ⇄ ${b}`);
  }
  return suspect.length ? 1 : 0;
}


// ---------- main ----------
const { spawnSync } = require('child_process');
function main() {
  const argv = process.argv.slice(2);
  const mode = argv[0] || 'check';
  const rest = argv.slice(1);
  const has = (flag) => rest.includes(flag);
  const val = (flag, dflt) => { const i = rest.indexOf(flag); return i >= 0 ? rest[i + 1] : dflt; };
  try {
    const w = loadEnv();
    switch (mode) {
      case 'check':
        return runCheck(w, { json: has('--json'), minLevel: val('--min-level', ''), op: val('--op', '') });
      case 'fix':
        return runFix(w, { apply: has('--apply'), dryRun: !has('--apply'), limit: val('--limit', '') ? Number(val('--limit', '')) : 0, json: has('--json') });
      case 'verify':
        return runVerify(w, rest);
      case 'cross':
        return runCross(w);
      case 'deploy':
        return runDeploy({ noPush: has('--no-push'), message: val('--message', ''), bump: val('--bump', '') });
      default:
        console.error('未知模式: ' + mode); return 2;
    }
  } catch (e) {
    console.error('执行失败: ' + e.message);
    return 2;
  }
}
process.exit(main());
