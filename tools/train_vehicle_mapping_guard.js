const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function assert(ok, message, details) {
  if (!ok) {
    console.error(JSON.stringify({ status:'FAIL', message, details:details || null }, null, 2));
    process.exit(1);
  }
}
function loadRuntime() {
  const context = { console:{debug(){},log(){},warn(){},error(){}}, window:{} };
  context.window.window = context.window;
  context.self = context.window;
  vm.createContext(context);
  ['js/train-icons.js','js/vehicle-sources.js','js/train-vehicle.js'].forEach(rel =>
    vm.runInContext(read(rel), context, { filename:rel }));
  return context.window;
}
function imageExists(url) {
  if (!url) return false;
  return fs.existsSync(path.join(ROOT, url.replace(/^\.\.\//,'').replace(/\//g,path.sep)));
}

const win = loadRuntime();
const icons = win.TrainIcons;
const vehicle = win.TrainVehicle;
assert(icons && typeof icons.resolveVehicleArtwork === 'function',
  'identity-only artwork mapper missing');
assert(typeof icons.resolveVehicleIcon === 'undefined' &&
       typeof icons.getTrainIcon === 'undefined' &&
       typeof icons.getTrainClass === 'undefined',
  'legacy train/line vehicle compatibility API still exported');
assert(!fs.existsSync(path.join(ROOT,'data/timetables/vehicle-type-map.js')),
  'legacy VehicleTypeMap file still exists');

const mapperSource = read('js/train-icons.js');
const mapperSignature = mapperSource.match(/function resolveVehicleArtwork\(([^)]*)\)/);
assert(mapperSignature && mapperSignature[1].trim() === 'vehicleIdentity',
  'artwork mapper must accept vehicle identity only', mapperSignature && mapperSignature[1]);
assert(!/function resolveVehicleArtwork\([^)]*(line|operator|train|source)/i.test(mapperSource),
  'operational context leaked into artwork mapper');

function resolve(ctx){ return vehicle.resolve(Object.assign({trainNumber:'guard'},ctx)); }

// Both sources are authoritative, but realtime has explicit priority.
let r = resolve({ realtimeVehicleType:'E235系0番台（山手線）',
                  timetableVehicleType:'小田急5000形' });
assert(r.identityStatus === 'EXACT' && r.source === 'realtime' &&
       r.name === 'E235系0番台（山手線）',
  'realtime EXACT must win source arbitration', r);

// Timetable/SQL is a first-class source selected when realtime has no exact fact.
r = resolve({ realtimeVehicleType:'', timetableVehicleType:'小田急5000形' });
assert(r.identityStatus === 'EXACT' && r.source === 'timetable' &&
       r.name === '小田急5000形',
  'timetable EXACT must be selected when realtime has no exact identity', r);

// Ambiguous realtime must not be silently bypassed by timetable as if realtime were absent.
r = resolve({ realtimeVehicleType:'E235系0番台（山手線） / E235系1000番台',
              timetableVehicleType:'小田急5000形' });
assert(r.identityStatus !== 'EXACT' && !r.name && !r.iconPath,
  'ambiguous realtime identity must not be converted into a concrete vehicle', r);

// No source fact means UNKNOWN. No line/operator/type/number default exists here.
r = resolve({ lineId:'Yamanote', operator:'JR-East', trainType:'Local',
              trainNumber:'1234G' });
assert(r.identityStatus === 'UNKNOWN' && !r.name && !r.iconPath,
  'operational context manufactured a vehicle identity', r);

// Artwork is projection only. Known exact identities may have representative art;
// unknown or multi-candidate identities never do.
['E235系0番台（山手線）','小田急5000形'].forEach(name => {
  const art = icons.resolveVehicleArtwork(name);
  if (art) assert(imageExists(art), 'mapped vehicle artwork does not exist', {name,art});
});
assert(icons.resolveVehicleArtwork('UNKNOWN') === null,
  'UNKNOWN identity received artwork');
assert(icons.resolveVehicleArtwork('E235系0番台（山手線） / 小田急5000形') === null,
  'multi-identity input received artwork');

console.log('vehicle source arbitration + artwork mapping guard: PASS');
