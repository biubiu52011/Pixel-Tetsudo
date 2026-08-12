const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\80996\\Documents\\项目\\像素铁道';
const tourismFile = path.join(baseDir, 'data', 'tourism-data.js');
const coordsFile = path.join(baseDir, 'data', 'station-coords.js');

const tourismContent = fs.readFileSync(tourismFile, 'utf8');
const coordsContent = fs.readFileSync(coordsFile, 'utf8');

const coords = {};
const coordsPattern = /"([^"]+)":\s*\[([\d.]+),\s*([\d.]+)\]/g;
let m;
while ((m = coordsPattern.exec(coordsContent)) !== null) {
  coords[m[1]] = [parseFloat(m[2]), parseFloat(m[3])];
}
console.log('Coords loaded:', Object.keys(coords).length);

const stations = {};
const stationPattern = /"([^"]+)":\s*\{\s*name:\s*"([^"]+)"/g;

while ((m = stationPattern.exec(tourismContent)) !== null) {
  const stationKey = m[1];
  const stationName = m[2];
  const start = m.index;
  
  let braceCount = 0;
  let i = start;
  while (i < tourismContent.length) {
    if (tourismContent[i] === '{') braceCount++;
    else if (tourismContent[i] === '}') {
      braceCount--;
      if (braceCount === 0) break;
    }
    i++;
  }
  
  const block = tourismContent.substring(start, i + 1);
  const spotsMatch = block.match(/spots:\s*\[(.*?)\]/s);
  if (!spotsMatch) continue;
  
  const spotsStr = spotsMatch[1];
  const spots = [];
  
  const spotPattern = /\{([^}]+)\}/g;
  let spotMatch;
  while ((spotMatch = spotPattern.exec(spotsStr)) !== null) {
    const spotInner = spotMatch[1];
    const spot = {};
    
    for (const field of ['emoji', 'name', 'dist', 'dir', 'desc', 'image']) {
      const fieldMatch = spotInner.match(new RegExp(field + ':\\s*"([^"]*)"'));
      if (fieldMatch) spot[field] = fieldMatch[1];
    }
    
    const tagsMatch = spotInner.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      spot['tags'] = tagsMatch[1].split(',').map(t => t.trim()).filter(t => t);
    } else {
      spot['tags'] = [];
    }
    
    if (spot.name) {
      spots.push(spot);
    }
  }
  
  stations[stationKey] = { name: stationName, spots };
  console.log(`Station ${stationKey}: ${spots.length} spots`);
}

console.log('
Total stations:', Object.keys(stations).length);

// Transform to new structure
const newStructure = {};
for (const [stationKey, stationData] of Object.entries(stations)) {
  for (const spot of stationData.spots) {
    const coord = coords[stationKey] || [0, 0];
    newStructure[spot.name] = {
      name: spot.name,
      coord: coord,
      dist: spot.dist || '',
      dir: spot.dir || '',
      desc: spot.desc || '',
      image: spot.image || '',
      tags: spot.tags || [],
      station: stationKey
    };
  }
}

console.log('
New structure spots:', Object.keys(newStructure).length);

// Generate new JS
let newContent = `/*
 * Tourism Data - Spot-based (keyed by spot name)
 */

(function() {
  'use strict';
  window.TOURISM_DATA = {
`;

const spotKeys = Object.keys(newStructure);
for (let i = 0; i < spotKeys.length; i++) {
  const spotName = spotKeys[i];
  const spot = newStructure[spotName];
  const comma = i < spotKeys.length - 1 ? ',' : '';
  
  newContent += `    "${spotName}": {
      name: "${spot.name}",
      coord: [${spot.coord[0]}, ${spot.coord[1]}],
      dist: "${spot.dist}",
      dir: "${spot.dir}",
      desc: "${spot.desc}",
`;
  if (spot.image) {
    newContent += `      image: "${spot.image}",
`;
  }
  newContent += `      tags: [${spot.tags.map(t => `"${t}"`).join(', ')}],
      station: "${spot.station}"
    }${comma}
`;
}

newContent += `  };

  window.TOURISM_STATIONS = Object.keys(window.TOURISM_DATA);
})();
`;

fs.writeFileSync(tourismFile, newContent, 'utf8');
console.log('
File written successfully');
console.log('New file size:', newContent.length);
