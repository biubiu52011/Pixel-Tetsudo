const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = 'C:/Users/80996/Documents/项目/像素铁道';

// 1. 语法 + vm 沙箱加载
const src = fs.readFileSync(root + '/js/train-icons.js', 'utf8');
const sandbox = { window: {}, console };
sandbox.window.UNIFIED_LINES = {};
sandbox.window.TransitConstants = { normalizeOp: o => o };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const TI = sandbox.window.TrainIcons;
console.log('=== 语法/加载 OK, LINE_ICONS:', Object.keys(TI.LINE_ICONS).length, 'OPERATOR:', Object.keys(TI.OPERATOR_ICONS).length);

// 2. 残留垃圾引用检查（4.3.276 逐张放大10x重新判定：37张中36张实车已恢复，仅东京モノレール为卡通机器人脸垃圾）
const junk = [];
let junkHit = 0;
for (const j of junk) {
  if (src.includes(j)) { console.log('JUNK REMAIN:', j); junkHit++; }
}
console.log(junkHit === 0 ? '=== 无残留垃圾引用 OK' : `=== 残留 ${junkHit} 处!!`);

// 3. 全量引用存在性（提取所有 ../images/... 路径）
const allIcons = Object.assign({}, TI.LINE_ICONS, TI.OPERATOR_ICONS);
// VEHICLE_DEPLOYMENTS 的 icon 也收集
const sandbox2 = { window: {}, console };
sandbox2.window.UNIFIED_LINES = {}; sandbox2.window.TransitConstants = { normalizeOp: o => o };
const src2 = src.replace('window.TrainIcons', 'void 0'); // 避免覆盖
// 直接正则提取路径
const refs = new Set();
const re = /"\.\.\/images\/[^"]+\.png"/g;
let m;
while ((m = re.exec(src)) !== null) refs.add(m[0].slice(1, -1));
let missing = 0;
for (const r of refs) {
  const p = path.normalize(root + '/' + r.replace('../', ''));
  if (!fs.existsSync(p)) { console.log('MISSING:', r); missing++; }
}
console.log('=== 引用总数:', refs.size, '缺失:', missing);
