const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'output.json');
const outputPath = path.join(__dirname, 'output_filtered.json');
const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function filterFields(obj) {
  if (Array.isArray(obj)) {
    return obj.map(filterFields);
  } else if (typeof obj === 'object' && obj !== null) {
    const filtered = {};
    if ('content' in obj) filtered.content = obj.content;
    if ('lawWebContent' in obj) filtered.lawWebContent = obj.lawWebContent;
    if ('children' in obj) filtered.children = filterFields(obj.children);
    return filtered;
  }
  return obj;
}

const filtered = { data: filterFields(json.data) };
fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf-8');
console.log('Filtered data saved to output_filtered.json');
