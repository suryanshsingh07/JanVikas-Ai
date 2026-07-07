const fs = require('fs');
const path = require('path');

const en = require('./frontend/src/locales/en/translation.json');
// Exclude 'en' and 'hi' since we already have perfect versions for those
const langs = ['as', 'bn', 'brx', 'doi', 'gu', 'kn', 'ks', 'kok', 'mai', 'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'];

// Map unsupported Google Translate codes to the closest major language 
// to ensure the UI changes its script (e.g. Bodo -> Hindi script, Manipuri -> Bengali script)
const langMap = {
  'brx': 'hi',
  'doi': 'hi',
  'ks': 'ur',
  'kok': 'mr',
  'mai': 'hi',
  'mni': 'bn',
  'or': 'or', 
  'sat': 'hi'
};

async function translateText(text, targetLang) {
  if (typeof text !== 'string') return text;
  if (!text.trim()) return text;
  
  const tl = langMap[targetLang] || targetLang;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    return json[0].map(x => x[0]).join('');
  } catch(e) {
    console.log(`   [!] Failed translating: "${text.substring(0, 20)}..." to ${tl}`);
    return text; // fallback to English
  }
}

async function translateObj(obj, targetLang) {
  const result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      if (val.includes('{{')) {
        // Skip translating strings with interpolation to avoid breaking them
        result[key] = val; 
      } else {
        result[key] = await translateText(val, targetLang);
      }
    } else if (Array.isArray(val)) {
      result[key] = [];
      for (const item of val) {
        result[key].push(await translateText(item, targetLang));
      }
    } else if (typeof val === 'object' && val !== null) {
      result[key] = await translateObj(val, targetLang);
    }
  }
  return result;
}

async function run() {
  console.log('Starting massive translation job for 21 languages...');
  for (const lang of langs) {
    console.log(`\nTranslating [${lang}]...`);
    const translated = await translateObj(en, lang);
    const p = path.join(__dirname, `frontend/src/locales/${lang}/translation.json`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(translated, null, 2));
    console.log(`✓ Saved [${lang}]`);
    // Wait slightly to avoid Google Translate rate limits
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('\nAll translations complete!');
}

run();
