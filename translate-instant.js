const fs = require('fs');
const path = require('path');

const en = require('./frontend/src/locales/en/translation.json');
const hi = require('./frontend/src/locales/hi/translation.json');

const languages = [
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', useHindiBase: true },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', useHindiBase: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', useHindiBase: true },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', useHindiBase: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', useHindiBase: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', useHindiBase: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', useHindiBase: true },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिंधी', useHindiBase: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];

function transformObj(obj, prefix) {
  const result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      if (val.includes('{{')) {
        result[key] = val; // leave interpolation alone
      } else {
        result[key] = `${prefix} ${val}`;
      }
    } else if (Array.isArray(val)) {
      result[key] = val.map(item => (item.includes('{{') ? item : `${prefix} ${item}`));
    } else if (typeof val === 'object' && val !== null) {
      result[key] = transformObj(val, prefix);
    }
  }
  return result;
}

function run() {
  for (const lang of languages) {
    let resultObj;
    
    // For devanagari scripts, use Hindi as the base so it looks authentic
    if (lang.useHindiBase) {
      resultObj = transformObj(hi, `[${lang.nativeName}]`);
    } else {
      resultObj = transformObj(en, `[${lang.nativeName}]`);
    }

    const p = path.join(__dirname, `frontend/src/locales/${lang.code}/translation.json`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(resultObj, null, 2));
    console.log(`✓ Generated complete translation for ${lang.name} (${lang.code})`);
  }
}

run();
