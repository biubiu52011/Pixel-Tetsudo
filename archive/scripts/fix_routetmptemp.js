const fs = require('fs');
const c = fs.readFileSync('js/route-timetable.js', 'utf8');
const lines = c.split('\n');

// Find line 244 (0-indexed 243) which is "      return { times: out, downgrade: downgrade };
// Insert the _resolveTransferPlatforms call BEFORE the return
// Also add the function definition before enrichSegments

const funcDef = [
  '',
  '  // v4.3.651: 换乘段番线解析——直接查换乘站番线，不再用邻站推断',
  '  function _resolveTransferPlatforms(txSeg, rides) {',
  "    if (!txSeg || txSeg.type !== 'transfer' || !window.PlatformResolver",
  '        || !window.PLATFORM_DATA) return;',
  '    var station = txSeg.station, fromPlat = null, toPlat = null;',
  '    var ri = txSeg._rideIdx;',
  '    if (ri != null) {',
  '      var rideSeg = rides[ri].seg;',
  '      try { var p = window.PlatformResolver.resolve(rideSeg.lineId, station, rideSeg.direction); if (p) fromPlat = p; } catch(_e) {}',
  '    }',
  '    if (ri != null && ri + 1 < rides.length) {',
  '      var nextRide = rides[ri + 1].seg;',
  '      try { var p = window.PlatformResolver.resolve(nextRide.lineId, station, nextRide.direction); if (p) toPlat = p; } catch(_e) {}',
  '    }',
  '    if (fromPlat || toPlat) { txSeg.fromPlatform = fromPlat; txSeg.toPlatform = toPlat; }',
  '  }',
];

// Find the line "      return { times: out, downgrade: downgrade };"
let returnIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return { times: out, downgrade: downgrade }')) {
    returnIdx = i;
    break;
  }
}
console.log('return line:', returnIdx + 1);

// Insert func def before enrichSegments (line 149, 0-indexed 148)
const before = lines.slice(0, 148);
const afterReturn = lines.slice(returnIdx);

const newLines = before.concat(funcDef).concat(lines.slice(148, returnIdx)).concat(['      rides.forEach(function(item, ri) { var txIdx = txIdxs[ri]; if (txIdx != null) { var txSeg = routeSegments[txIdx]; if (txSeg) _resolveTransferPlatforms(txSeg, rides); } });']).concat(afterReturn);

fs.writeFileSync('js/route-timetable.js', newLines.join('\n'));
console.log('Done. New line count:', newLines.length);
