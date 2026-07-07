const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

const en = require('./frontend/src/locales/en/translation.json');

const langs = ['as', 'bn', 'brx', 'doi', 'gu', 'kn', 'ks', 'kok', 'mai', 'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'];

const langMap = {
  'brx': 'hi', 'doi': 'hi', 'ks': 'ur', 'kok': 'mr', 'mai': 'hi', 'mni': 'bn', 'sat': 'hi', 'or': 'or'
};

// Flatten JSON to array of {path, text}
function flattenObj(obj, currentPath = '') {
  let result = [];
  for (const key of Object.keys(obj)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    if (typeof obj[key] === 'string') {
      result.push({ path: newPath, text: obj[key] });
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach((item, index) => {
        result.push({ path: `${newPath}[${index}]`, text: item });
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result = result.concat(flattenObj(obj[key], newPath));
    }
  }
  return result;
}

// Rebuild JSON from flattened array
function unflattenObj(flatArray) {
  const result = {};
  for (const { path, text } of flatArray) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        // If next part is a number, create array, else object
        current[part] = !isNaN(parts[i + 1]) ? [] : {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = text;
  }
  return result;
}

async function run() {
  const flatEn = flattenObj(en);
  
  for (const lang of langs) {
    console.log(`Translating to ${lang}...`);
    const tl = langMap[lang] || lang;
    
    try {
      const stringsToTranslate = flatEn.map(i => i.text);
      
      // Translate in chunks of 50 to avoid payload size limits
      const chunkSize = 50;
      let translatedStrings = [];
      
      for (let i = 0; i < stringsToTranslate.length; i += chunkSize) {
        const chunk = stringsToTranslate.slice(i, i + chunkSize);
        
        // Handle interpolations by not translating them, or just let google translate them. 
        // We will just let the API handle it, google-translate-api-x is usually smart.
        const res = await translate(chunk, { to: tl, forceBatch: false });
        // res can be an array of objects
        const chunkTranslated = Array.isArray(res) ? res.map(r => r.text) : [res.text];
        translatedStrings = translatedStrings.concat(chunkTranslated);
      }
      
      // Map back to flat array format
      const flatTranslated = flatEn.map((item, i) => ({
        path: item.path,
        text: item.text.includes('{{') ? item.text : translatedStrings[i] // naive protection for vars
      }));
      
      const resultObj = unflattenObj(flatTranslated);
      
      const p = path.join(__dirname, `frontend/src/locales/${lang}/translation.json`);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(resultObj, null, 2));
      console.log(`✓ Saved ${lang}`);
      
    } catch (err) {
      console.error(`Error translating ${lang}:`, err.message);
    }
  }
  console.log('All done!');
}

run();
