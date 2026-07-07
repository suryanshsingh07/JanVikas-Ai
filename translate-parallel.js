const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

const en = require('./frontend/src/locales/en/translation.json');

const langs = [
  'as', 'bn', 'brx', 'doi', 'gu', 'kn', 'ks', 'kok', 'mai', 
  'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'
];

const langMap = {
  'brx': 'hi', 'doi': 'hi', 'ks': 'ur', 'kok': 'mr', 'mai': 'hi', 'mni': 'bn', 'sat': 'hi', 'or': 'or'
};

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

function unflattenObj(flatArray) {
  const result = {};
  for (const { path, text } of flatArray) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = !isNaN(parts[i + 1]) ? [] : {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = text;
  }
  return result;
}

async function translateLang(lang, flatEn) {
  const tl = langMap[lang] || lang;
  try {
    const stringsToTranslate = flatEn.map(i => i.text);
    const chunkSize = 100; // Larger chunks to reduce API calls
    let translatedStrings = [];
    
    for (let i = 0; i < stringsToTranslate.length; i += chunkSize) {
      const chunk = stringsToTranslate.slice(i, i + chunkSize);
      // Wait 500ms between chunks to avoid rate limiting
      if (i > 0) await new Promise(r => setTimeout(r, 500));
      const res = await translate(chunk, { to: tl });
      const chunkTranslated = Array.isArray(res) ? res.map(r => r.text) : [res.text];
      translatedStrings = translatedStrings.concat(chunkTranslated);
    }
    
    const flatTranslated = flatEn.map((item, i) => ({
      path: item.path,
      text: item.text.includes('{{') ? item.text : translatedStrings[i]
    }));
    
    const resultObj = unflattenObj(flatTranslated);
    const p = path.join(__dirname, `frontend/src/locales/${lang}/translation.json`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(resultObj, null, 2));
    console.log(`✓ Completed: ${lang}`);
  } catch (err) {
    console.error(`✗ Error on ${lang}:`, err.message);
    // Write English fallback if failed so UI doesn't crash
    const p = path.join(__dirname, `frontend/src/locales/${lang}/translation.json`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(en, null, 2));
  }
}

async function run() {
  const flatEn = flattenObj(en);
  console.log(`Starting real translation for ${langs.length} languages...`);
  
  // We'll run them in batches of 4 concurrent languages to avoid IP ban
  const concurrency = 4;
  for (let i = 0; i < langs.length; i += concurrency) {
    const batch = langs.slice(i, i + concurrency);
    console.log(`Processing batch: ${batch.join(', ')}`);
    await Promise.all(batch.map(lang => translateLang(lang, flatEn)));
  }
  
  console.log('Done!');
}

run();
