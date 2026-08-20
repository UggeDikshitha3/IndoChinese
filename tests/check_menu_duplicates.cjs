const fs = require('fs');
const content = fs.readFileSync('src/data/initialData.ts', 'utf8');

// Match menu item blocks
const idMatches = [...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const nameMatches = [...content.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

console.log('Total IDs found:', idMatches.length);
console.log('Unique IDs:', new Set(idMatches).size);

const idCounts = {};
idMatches.forEach(id => idCounts[id] = (idCounts[id] || 0) + 1);
const duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
console.log('Duplicate IDs:', duplicateIds);

const nameCounts = {};
nameMatches.forEach(name => nameCounts[name] = (nameCounts[name] || 0) + 1);
const duplicateNames = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
console.log('Duplicate Names:', duplicateNames);
