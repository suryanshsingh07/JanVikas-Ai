const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/src/locales');

const translations = {
  as: {
    navbar: { login: "লগ ইন", signup: "চাইন আপ", notifications: "জাননী", viewAllNotifications: "সকলো জাননী চাওক", accountSettings: "একাউণ্ট ছেটিংছ", logout: "লগ আউট" },
    sidebar: { dashboard: "ডেছবৰ্ড", mySubmissions: "মোৰ আবেদনসমূহ", reportIssue: "সমস্যা জনাওক", aiInsights: "AI বিশ্লেষণ", manageProjects: "প্ৰকল্প পৰিচালনা কৰক", userManagement: "ব্যৱহাৰকাৰী ব্যৱস্থাপনা", systemReports: "ছিষ্টেম ৰিপোৰ্ট", citizenPortal: "নাগৰিক পৰ্টেল", officialPortal: "বিষয়া পৰ্টেল", adminPortal: "প্ৰশাসক পৰ্টেল" },
    landing: { title1: "গণতন্ত্ৰৰ ক্ষমতায়ন", title2: "প্ৰযুক্তিৰ মাধ্যমত", subtitle: "কৃত্রিম বুদ্ধিমত্তা ব্যৱহাৰ কৰি নাগৰিক আৰু তেওঁলোকৰ নিৰ্বাচিত প্ৰতিনিধিৰ মাজৰ ব্যৱধান দূৰ কৰা মঞ্চত যোগ দিয়ক।", getStarted: "আৰম্ভ কৰক", learnMore: "অধিক জানক" }
  },
  bn: {
    navbar: { login: "লগ ইন", signup: "সাইন আপ", notifications: "বিজ্ঞপ্তি", viewAllNotifications: "সব বিজ্ঞপ্তি দেখুন", accountSettings: "অ্যাকাউন্ট সেটিংস", logout: "লগ আউট" },
    sidebar: { dashboard: "ড্যাশবোর্ড", mySubmissions: "আমার অভিযোগ", reportIssue: "সমস্যা জানান", aiInsights: "AI বিশ্লেষণ", manageProjects: "প্রকল্প পরিচালনা করুন", userManagement: "ব্যবহারকারী ব্যবস্থাপনা", systemReports: "সিস্টেম রিপোর্ট", citizenPortal: "নাগরিক পোর্টাল", officialPortal: "কর্মকর্তা পোর্টাল", adminPortal: "প্রশাসক পোর্টাল" },
    landing: { title1: "গণতন্ত্রের ক্ষমতায়ন", title2: "প্রযুক্তির মাধ্যমে", subtitle: "কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে নাগরিক এবং তাদের নির্বাচিত প্রতিনিধিদের মধ্যে সেতু গড়ার প্ল্যাটফর্মে যোগ দিন।", getStarted: "শুরু করুন", learnMore: "আরও জানুন" }
  },
  brx: {
    navbar: { login: "लॉग इन", signup: "साइन अप", notifications: "खबर", viewAllNotifications: "सकल खबर नागिरसोन", accountSettings: "एकाउन्ट सेटिंग", logout: "लॉग आउट" },
    sidebar: { dashboard: "डेसबोर्ड", mySubmissions: "मोन जाहोनाय", reportIssue: "साफा लिखिर", aiInsights: "AI विज्ञान", manageProjects: "प्रोजेक्ट सांख्यागिरि", userManagement: "रावलोब सांख्यागिरि", systemReports: "सिस्टम रिपोर्ट", citizenPortal: "नागरिक पोर्टल", officialPortal: "अफिसार पोर्टल", adminPortal: "एडमिन पोर्टल" },
    landing: { title1: "लोकतन्त्र सोमोसाय", title2: "तकनीक बिजिरनाय", subtitle: "AI थाखो नागरिक आरो निजोर निर्बाचित प्रतिनिधि मिजिं खौ फोलायनाय पोर्टल जोबोरनो गावखौ फेरहानो थांख।", getStarted: "गोलाव कर", learnMore: "आरो बुजिर" }
  },
  doi: {
    navbar: { login: "लॉग इन", signup: "साइन अप", notifications: "सूचनाएं", viewAllNotifications: "सारियां सूचनाएं देखो", accountSettings: "खाता सेटिंग", logout: "लॉग आउट" },
    sidebar: { dashboard: "डैशबोर्ड", mySubmissions: "मेरियां शिकायतां", reportIssue: "समस्या दर्ज करो", aiInsights: "AI विश्लेषण", manageProjects: "परियोजनाएं संभालो", userManagement: "उपभोक्ता प्रबंधन", systemReports: "सिस्टम रिपोर्टें", citizenPortal: "नागरिक पोर्टल", officialPortal: "अधिकारी पोर्टल", adminPortal: "प्रशासक पोर्टल" },
    landing: { title1: "लोकतंत्र दा सशक्तिकरण", title2: "तकनालाजी राहीं", subtitle: "उन्नत कृत्रिम बुद्धि दा उपयोग करदे होई नागरिकें आरे ओनें दे चुणे गेदे प्रतिनिधियें दे बिच दे फासलें नूं पूरा करने वाले प्लेटफॉर्म ते जुड़ो।", getStarted: "शुरू करो", learnMore: "होर जानो" }
  },
  gu: {
    navbar: { login: "લૉગ ઇન", signup: "સાઇન અપ", notifications: "સૂચનાઓ", viewAllNotifications: "બધી સૂચનાઓ જુઓ", accountSettings: "ખાતા સેટિંગ્સ", logout: "લૉગ આઉટ" },
    sidebar: { dashboard: "ડૅશબોર્ડ", mySubmissions: "મારી ફરિયાદો", reportIssue: "સમસ્યા નોંધો", aiInsights: "AI વિશ્લેષણ", manageProjects: "પ્રોજેક્ટ સંચાલિત કરો", userManagement: "વપરાશકર્તા વ્યવસ્થાપન", systemReports: "સિસ્ટમ અહેવાલ", citizenPortal: "નાગરિક પોર્ટલ", officialPortal: "અધિકારી પોર્ટલ", adminPortal: "વ્યવસ્થાપક પોર્ટલ" },
    landing: { title1: "લોકશાહીનું સશક્તિકરણ", title2: "ટેક્નોલૉજી દ્વારા", subtitle: "AI ટેક્નોલૉજીનો ઉપયોગ કરીને નાગરિકો અને તેમના ચૂંટાયેલા પ્રતિનિધિઓ વચ્ચેના અંતરને દૂર કરવામાં મદદ કરતા પ્લેટફૉર્મ સાથે જોડાઓ.", getStarted: "શરૂ કરો", learnMore: "વધુ જાણો" }
  },
  kn: {
    navbar: { login: "ಲಾಗ್ ಇನ್", signup: "ಸೈನ್ ಅಪ್", notifications: "ಅಧಿಸೂಚನೆಗಳು", viewAllNotifications: "ಎಲ್ಲಾ ಅಧಿಸೂಚನೆಗಳನ್ನು ನೋಡಿ", accountSettings: "ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು", logout: "ಲಾಗ್ ಔಟ್" },
    sidebar: { dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", mySubmissions: "ನನ್ನ ದೂರುಗಳು", reportIssue: "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", aiInsights: "AI ವಿಶ್ಲೇಷಣೆ", manageProjects: "ಯೋಜನೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ", userManagement: "ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ", systemReports: "ಸಿಸ್ಟಮ್ ವರದಿಗಳು", citizenPortal: "ನಾಗರಿಕ ಪೋರ್ಟಲ್", officialPortal: "ಅಧಿಕಾರಿ ಪೋರ್ಟಲ್", adminPortal: "ನಿರ್ವಾಹಕ ಪೋರ್ಟಲ್" },
    landing: { title1: "ಪ್ರಜಾಪ್ರಭುತ್ವದ ಸಬಲೀಕರಣ", title2: "ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ", subtitle: "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಬಳಸಿ ನಾಗರಿಕರು ಮತ್ತು ಅವರ ಚುನಾಯಿತ ಪ್ರತಿನಿಧಿಗಳ ನಡುವಿನ ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡುವ ವೇದಿಕೆಯನ್ನು ಸೇರಿ.", getStarted: "ಪ್ರಾರಂಭಿಸಿ", learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ" }
  },
  ks: {
    navbar: { login: "لاگ اِن", signup: "سائن اَپ", notifications: "اِطلاعات", viewAllNotifications: "سب اِطلاعات وُچھو", accountSettings: "اَکاؤنٹ سیٹنگ", logout: "لاگ اَوٗٹ" },
    sidebar: { dashboard: "ڈیشبورڈ", mySubmissions: "میٚہ دعویٰ", reportIssue: "مسٔلہ درج کرٕو", aiInsights: "AI تجزیہ", manageProjects: "پرویجیکٹ سانبٕھو", userManagement: "یوزَر منیجمینٹ", systemReports: "سِسٹَم رِپورٹ", citizenPortal: "شہری پورٹل", officialPortal: "اَفسَر پورٹل", adminPortal: "ایڈمِن پورٹل" },
    landing: { title1: "جَمہوریَت سشکتِکرَن", title2: "تیکنالوجی زریعَہ", subtitle: "اَعلیٰ مَصنوعی ذہانَت استِعمال کَر شہریوں و اُن کے چُنِدَہ نُمایندوں کے بیچ کھائی پُر کَرنِ والے پلیٹفارم سے جُڑو۔", getStarted: "شروع کرو", learnMore: "زیادہ جانو" }
  },
  kok: {
    navbar: { login: "लॉग इन", signup: "साइन अप", notifications: "सूचना", viewAllNotifications: "सगळ्यो सूचना पळय", accountSettings: "खाते सेटिंग", logout: "लॉग आउट" },
    sidebar: { dashboard: "डॅशबोर्ड", mySubmissions: "माझ्यो तक्रारी", reportIssue: "समस्या नोंद करात", aiInsights: "AI विश्लेषण", manageProjects: "प्रकल्प सांबाळात", userManagement: "वापरकर्तो व्यवस्थापन", systemReports: "सिस्टम रिपोर्ट", citizenPortal: "नागरिक पोर्टल", officialPortal: "सरकारी अधिकारी पोर्टल", adminPortal: "प्रशासक पोर्टल" },
    landing: { title1: "लोकशाहीचें सशक्तीकरण", title2: "तंत्रज्ञानाद्वारें", subtitle: "प्रगत कृत्रिम बुद्धिमत्ता वापरून नागरिक आनी तांच्या निवडून आयिल्ल्या प्रतिनिधींमदलो अंतर उणें करपाच्या मंचार सामील जावा.", getStarted: "सुरू करात", learnMore: "अधिक जाणून घेयात" }
  },
  mai: {
    navbar: { login: "लॉग इन", signup: "साइन अप", notifications: "सूचना", viewAllNotifications: "सभटा सूचना देखू", accountSettings: "खाता सेटिंग", logout: "लॉग आउट" },
    sidebar: { dashboard: "डैशबोर्ड", mySubmissions: "हमर शिकायत", reportIssue: "समस्या दर्ज करू", aiInsights: "AI विश्लेषण", manageProjects: "परियोजना प्रबंधित करू", userManagement: "उपयोगकर्ता प्रबंधन", systemReports: "सिस्टम रिपोर्ट", citizenPortal: "नागरिक पोर्टल", officialPortal: "अधिकारी पोर्टल", adminPortal: "प्रशासक पोर्टल" },
    landing: { title1: "लोकतंत्र के सशक्तिकरण", title2: "प्रौद्योगिकी के माध्यम सं", subtitle: "उन्नत कृत्रिम बुद्धिमत्ता उपयोग क' नागरिक आ हुनकर निर्वाचित प्रतिनिधि बीच के अंतर पाटि देबाबाला मंच पर जुड़ू।", getStarted: "शुरू करू", learnMore: "अधिक जानू" }
  },
  ml: {
    navbar: { login: "ലോഗ് ഇൻ", signup: "സൈൻ അപ്പ്", notifications: "അറിയിപ്പുകൾ", viewAllNotifications: "എല്ലാ അറിയിപ്പുകളും കാണുക", accountSettings: "അക്കൗണ്ട് ക്രമീകരണങ്ങൾ", logout: "ലോഗ് ഔട്ട്" },
    sidebar: { dashboard: "ഡാഷ്ബോർഡ്", mySubmissions: "എന്റെ പരാതികൾ", reportIssue: "പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക", aiInsights: "AI വിശ്ലേഷണം", manageProjects: "പ്രോജക്ടുകൾ നിയന്ത്രിക്കുക", userManagement: "ഉപയോക്തൃ മാനേജ്മെന്റ്", systemReports: "സിസ്റ്റം റിപ്പോർട്ടുകൾ", citizenPortal: "പൗര പോർടൽ", officialPortal: "ഉദ്യോഗസ്ഥ പോർടൽ", adminPortal: "അഡ്മിൻ പോർടൽ" },
    landing: { title1: "ജനാധിപത്യ ശാക്തീകരണം", title2: "സാങ്കേതികവിദ്യ വഴി", subtitle: "നൂതന കൃത്രിമ ബുദ്ധി ഉപയോഗിച്ച് പൗരന്മാരും അവരുടെ തിരഞ്ഞെടുക്കപ്പെട്ട ജനപ്രതിനിധികളും തമ്മിലുള്ള വിടവ് നികത്തുന്ന പ്ലാറ്റ്ഫോമിൽ ചേരൂ.", getStarted: "ആരംഭിക്കുക", learnMore: "കൂടുതൽ അറിയുക" }
  },
  mni: {
    navbar: { login: "লগ ইন", signup: "সাইন অপ", notifications: "খবর", viewAllNotifications: "মখোয় খবর থম্বিরক", accountSettings: "একাউন্ট সেটিং", logout: "লগ অউট" },
    sidebar: { dashboard: "ডেসবোর্ড", mySubmissions: "ঐগি অভিযোগশিং", reportIssue: "খোঙথাং পীরিবা", aiInsights: "AI বিশ্লেষণ", manageProjects: "প্রজেক্টশিং লৈঙাক্লিবা", userManagement: "ইউজর ম্যানেজমেন্ট", systemReports: "সিস্টেম রিপোর্ট", citizenPortal: "মীয়াম পোর্টল", officialPortal: "অফিশল পোর্টল", adminPortal: "অ্যাডমিন পোর্টল" },
    landing: { title1: "ডেমোক্রেসী শক্তিশালী তৌবা", title2: "তেকনোলোজী চৎনরিবা", subtitle: "অ্যাডভান্সড AI ব্যবহার তৌনা মীয়ামশিং অমসুং মখোয়গি ভোট দিনবা মায়কৈ পীবশিং মরীমদা মমলশিং পুথোকপা প্লেটফর্মদা থমগৎলু।", getStarted: "শুরু তৌ", learnMore: "ফাওবা তেংনবিয়ু" }
  },
  mr: {
    navbar: { login: "लॉग इन", signup: "साइन अप", notifications: "सूचना", viewAllNotifications: "सर्व सूचना पहा", accountSettings: "खाते सेटिंग्ज", logout: "लॉग आउट" },
    sidebar: { dashboard: "डॅशबोर्ड", mySubmissions: "माझ्या तक्रारी", reportIssue: "समस्या नोंदवा", aiInsights: "AI विश्लेषण", manageProjects: "प्रकल्प व्यवस्थापित करा", userManagement: "वापरकर्ता व्यवस्थापन", systemReports: "सिस्टम अहवाल", citizenPortal: "नागरिक पोर्टल", officialPortal: "अधिकारी पोर्टल", adminPortal: "प्रशासक पोर्टल" },
    landing: { title1: "लोकशाहीचे सशक्तीकरण", title2: "तंत्रज्ञानाद्वारे", subtitle: "प्रगत कृत्रिम बुद्धिमत्ता वापरून नागरिक आणि त्यांच्या निवडून आलेल्या प्रतिनिधींमधील अंतर कमी करणाऱ्या मंचात सामील व्हा.", getStarted: "सुरुवात करा", learnMore: "अधिक जाणून घ्या" }
  },
  ne: {
    navbar: { login: "लग इन", signup: "साइन अप", notifications: "सूचनाहरू", viewAllNotifications: "सबै सूचनाहरू हेर्नुहोस्", accountSettings: "खाता सेटिङ", logout: "लग आउट" },
    sidebar: { dashboard: "ड्यासबोर्ड", mySubmissions: "मेरा उजुरीहरू", reportIssue: "समस्या दर्ता गर्नुहोस्", aiInsights: "AI विश्लेषण", manageProjects: "परियोजनाहरू व्यवस्थापन", userManagement: "प्रयोगकर्ता व्यवस्थापन", systemReports: "प्रणाली रिपोर्ट", citizenPortal: "नागरिक पोर्टल", officialPortal: "अधिकारी पोर्टल", adminPortal: "प्रशासक पोर्टल" },
    landing: { title1: "लोकतन्त्रको सशक्तीकरण", title2: "प्रविधि मार्फत", subtitle: "उन्नत कृत्रिम बुद्धिमत्ता प्रयोग गरी नागरिक र तिनीहरूका निर्वाचित प्रतिनिधिहरूबीचको खाडल पुर्ने प्लेटफर्ममा सामेल हुनुहोस्।", getStarted: "सुरु गर्नुहोस्", learnMore: "थप जान्नुहोस्" }
  },
  or: {
    navbar: { login: "ଲଗ ଇନ", signup: "ସାଇନ ଅପ", notifications: "ବିଜ୍ଞପ୍ତି", viewAllNotifications: "ସମସ୍ତ ବିଜ୍ଞପ୍ତି ଦେଖନ୍ତୁ", accountSettings: "ଆକାଉଣ୍ଟ ସେଟିଂସ", logout: "ଲଗ ଆଉଟ" },
    sidebar: { dashboard: "ଡ୍ୟାସବୋର୍ଡ", mySubmissions: "ମୋ ଅଭିଯୋଗ", reportIssue: "ସମସ୍ୟା ଜଣାନ୍ତୁ", aiInsights: "AI ବିଶ୍ଳେଷଣ", manageProjects: "ପ୍ରକଳ୍ପ ପରିଚାଳନା", userManagement: "ଉପଯୋଗକର୍ତ୍ତା ପ୍ରବନ୍ଧନ", systemReports: "ସିଷ୍ଟେମ ରିପୋର୍ଟ", citizenPortal: "ନାଗରିକ ପୋର୍ଟାଲ", officialPortal: "ଅଧିକାରୀ ପୋର୍ଟାଲ", adminPortal: "ପ୍ରଶାସକ ପୋର୍ଟାଲ" },
    landing: { title1: "ଗଣତନ୍ତ୍ରର ସଶକ୍ତୀକରଣ", title2: "ପ୍ରଯୁକ୍ତି ମାଧ୍ୟମରେ", subtitle: "ଉନ୍ନତ କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତା ବ୍ୟବହାର କରି ନାଗରିକ ଓ ତାଙ୍କ ନିର୍ବାଚିତ ପ୍ରତିନିଧିଙ୍କ ମଧ୍ୟରେ ଅନ୍ତର ଦୂର କରିବାରେ ସାହାଯ୍ୟ କରୁଥିବା ପ୍ଲାଟଫର୍ମ ସହ ଯୋଗ ଦିଅନ୍ତୁ।", getStarted: "ଆରମ୍ଭ କରନ୍ତୁ", learnMore: "ଅଧିକ ଜାଣନ୍ତୁ" }
  },
  pa: {
    navbar: { login: "ਲਾਗ ਇਨ", signup: "ਸਾਈਨ ਅੱਪ", notifications: "ਸੂਚਨਾਵਾਂ", viewAllNotifications: "ਸਾਰੀਆਂ ਸੂਚਨਾਵਾਂ ਦੇਖੋ", accountSettings: "ਖਾਤਾ ਸੈਟਿੰਗਾਂ", logout: "ਲਾਗ ਆਉਟ" },
    sidebar: { dashboard: "ਡੈਸ਼ਬੋਰਡ", mySubmissions: "ਮੇਰੀਆਂ ਸ਼ਿਕਾਇਤਾਂ", reportIssue: "ਸਮੱਸਿਆ ਦਰਜ਼ ਕਰੋ", aiInsights: "AI ਵਿਸ਼ਲੇਸ਼ਣ", manageProjects: "ਪ੍ਰੋਜੈਕਟ ਪ੍ਰਬੰਧਿਤ ਕਰੋ", userManagement: "ਉਪਭੋਗਤਾ ਪ੍ਰਬੰਧਨ", systemReports: "ਸਿਸਟਮ ਰਿਪੋਰਟਾਂ", citizenPortal: "ਨਾਗਰਿਕ ਪੋਰਟਲ", officialPortal: "ਅਧਿਕਾਰੀ ਪੋਰਟਲ", adminPortal: "ਪ੍ਰਸ਼ਾਸਕ ਪੋਰਟਲ" },
    landing: { title1: "ਲੋਕਤੰਤਰ ਦਾ ਸਸ਼ਕਤੀਕਰਨ", title2: "ਤਕਨਾਲੋਜੀ ਰਾਹੀਂ", subtitle: "ਉੱਨਤ ਨਕਲੀ ਬੁੱਧੀ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਨਾਗਰਿਕਾਂ ਅਤੇ ਉਹਨਾਂ ਦੇ ਚੁਣੇ ਹੋਏ ਨੁਮਾਇੰਦਿਆਂ ਵਿਚਕਾਰ ਪਾੜੇ ਨੂੰ ਪੂਰਾ ਕਰਨ ਵਾਲੇ ਪਲੇਟਫਾਰਮ ਨਾਲ ਜੁੜੋ।", getStarted: "ਸ਼ੁਰੂ ਕਰੋ", learnMore: "ਹੋਰ ਜਾਣੋ" }
  },
  sa: {
    navbar: { login: "प्रविश", signup: "नामांकन", notifications: "सूचनाः", viewAllNotifications: "सर्वाः सूचनाः पश्यतु", accountSettings: "खाता-विन्यासः", logout: "निर्गम्यतु" },
    sidebar: { dashboard: "नियंत्रण-पटलम्", mySubmissions: "मम निवेदनानि", reportIssue: "समस्यां सूचयतु", aiInsights: "AI विश्लेषणम्", manageProjects: "परियोजनाः प्रबन्धतु", userManagement: "उपयोक्तृ-प्रबन्धनम्", systemReports: "प्रणाली-प्रतिवेदनम्", citizenPortal: "नागरिक-द्वारम्", officialPortal: "अधिकारि-द्वारम्", adminPortal: "प्रशासक-द्वारम्" },
    landing: { title1: "लोकतन्त्रस्य सशक्तीकरणम्", title2: "प्रौद्योगिक्याः माध्यमेन", subtitle: "उन्नत कृत्रिम-बुद्धेः सहाय्येन नागरिकाणां तेषां च निर्वाचित-प्रतिनिधीनां मध्ये अन्तरं पूरयितुं सहायकं मञ्चम् अनुगच्छतु।", getStarted: "आरम्भतु", learnMore: "अधिकं जानातु" }
  },
  sat: {
    navbar: { login: "ᱞᱚᱜ ᱤᱱ", signup: "ᱥᱟᱭᱤᱱ ᱟᱯ", notifications: "ᱥᱩᱪᱚᱱᱟ", viewAllNotifications: "ᱢᱮᱱᱟᱜ ᱥᱩᱪᱚᱱᱟ ᱧᱮᱞ", accountSettings: "ᱮᱠᱟᱣ ᱥᱮᱴᱤᱝ", logout: "ᱞᱚᱜ ᱟᱣᱴ" },
    sidebar: { dashboard: "ᱰᱮᱥᱵᱚᱨᱰ", mySubmissions: "᱾ᱜ ᱟᱹᱬᱤ", reportIssue: "ᱢᱟᱦᱟ ᱨᱤᱯᱚᱨᱴ", aiInsights: "AI ᱯᱟᱲᱦᱟᱣ", manageProjects: "ᱯᱨᱚᱡᱮᱠᱴ ᱥᱟᱢᱞᱟᱣ", userManagement: "ᱭᱩᱡᱚᱨ ᱢᱟᱱᱮᱡᱢᱮᱱᱴ", systemReports: "ᱥᱤᱥᱴᱮᱢ ᱨᱤᱯᱚᱨᱴ", citizenPortal: "ᱨᱮᱭᱟᱜ ᱠᱟᱹᱢᱤ ᱯᱚᱨᱴᱟᱞ", officialPortal: "ᱟᱯᱷᱤᱥᱟᱲ ᱯᱚᱨᱴᱟᱞ", adminPortal: "ᱟᱰᱢᱤᱱ ᱯᱚᱨᱴᱟᱞ" },
    landing: { title1: "ᱰᱮᱢᱚᱠᱨᱮᱥᱤ ᱥᱚᱠᱛᱤ", title2: "ᱛᱮᱠᱱᱚᱞᱚᱡᱤ ᱡᱚᱛᱮ", subtitle: "ᱟᱰᱵᱷᱟᱱᱥᱰ AI ᱵᱮᱵᱷᱟᱨ ᱠᱟᱛᱮ ᱨᱮᱭᱟᱜ ᱠᱟᱹᱢᱤ ᱟᱨ ᱢᱟᱹᱦᱤᱛ ᱯᱚᱨᱴᱟᱞᱽ ᱡᱚᱦᱚᱨ।", getStarted: "ᱥᱩᱨᱩ ᱦᱩᱭ", learnMore: "ᱚᱯᱟᱨ ᱡᱟᱱᱟ" }
  },
  sd: {
    navbar: { login: "لاگ ان", signup: "سائن اپ", notifications: "اطلاع", viewAllNotifications: "سڀ اطلاع ڏسو", accountSettings: "اڪائونٽ سيٽنگ", logout: "لاگ آئوٽ" },
    sidebar: { dashboard: "ڊيشبورڊ", mySubmissions: "منهنجون شڪايتون", reportIssue: "مسئلو درج ڪريو", aiInsights: "AI تجزيو", manageProjects: "منصوبا منظم ڪريو", userManagement: "يوزر مينيجمينٽ", systemReports: "سسٽم رپورٽون", citizenPortal: "شهري پورٽل", officialPortal: "آفيسر پورٽل", adminPortal: "ايڊمن پورٽل" },
    landing: { title1: "جمهوريت کي مضبوط ڪرڻ", title2: "ٽيڪنالاجي ذريعي", subtitle: "ترقي يافته مصنوعي ذهانت استعمال ڪري شهرين ۽ انهن جي چونڊيل نمائندن جي وچ ۾ خلا ڀرڻ وارو پليٽفارم ۾ شامل ٿيو۔", getStarted: "شروع ڪريو", learnMore: "وڌيڪ ڄاڻو" }
  },
  ta: {
    navbar: { login: "உள்நுழைவு", signup: "பதிவு செய்யுங்கள்", notifications: "அறிவிப்புகள்", viewAllNotifications: "அனைத்து அறிவிப்புகளையும் காண்க", accountSettings: "கணக்கு அமைப்புகள்", logout: "வெளியேறு" },
    sidebar: { dashboard: "டாஷ்போர்டு", mySubmissions: "என் புகார்கள்", reportIssue: "சிக்கலை தெரிவிக்கவும்", aiInsights: "AI பகுப்பாய்வு", manageProjects: "திட்டங்களை நிர்வகிக்க", userManagement: "பயனர் மேலாண்மை", systemReports: "கணினி அறிக்கைகள்", citizenPortal: "குடிமகன் போர்டல்", officialPortal: "அதிகாரி போர்டல்", adminPortal: "நிர்வாகி போர்டல்" },
    landing: { title1: "ஜனநாயகத்தை வலிமைப்படுத்துதல்", title2: "தொழில்நுட்பம் மூலம்", subtitle: "மேம்பட்ட செயற்கை நுண்ணறிவு பயன்படுத்தி குடிமக்களுக்கும் அவர்களின் தேர்ந்தெடுக்கப்பட்ட பிரதிநிதிகளுக்கும் இடையிலான இடைவெளியை இணைக்கும் தளத்தில் சேரவும்.", getStarted: "தொடங்குங்கள்", learnMore: "மேலும் அறிக" }
  },
  te: {
    navbar: { login: "లాగిన్", signup: "నమోదు", notifications: "నోటిఫికేషన్లు", viewAllNotifications: "అన్ని నోటిఫికేషన్లు చూడండి", accountSettings: "ఖాతా సెట్టింగులు", logout: "లాగ్ అవుట్" },
    sidebar: { dashboard: "డాష్‌బోర్డ్", mySubmissions: "నా ఫిర్యాదులు", reportIssue: "సమస్య నివేదించండి", aiInsights: "AI విశ్లేషణ", manageProjects: "ప్రాజెక్టులు నిర్వహించండి", userManagement: "వినియోగదారు నిర్వహణ", systemReports: "సిస్టమ్ నివేదికలు", citizenPortal: "పౌర పోర్టల్", officialPortal: "అధికారి పోర్టల్", adminPortal: "నిర్వాహక పోర్టల్" },
    landing: { title1: "ప్రజాస్వామ్యాన్ని బలోపేతం చేయడం", title2: "సాంకేతికత ద్వారా", subtitle: "అధునాతన కృత్రిమ మేధస్సు ఉపయోగించి పౌరులకు మరియు వారి ఎన్నుకోబడిన ప్రతినిధులకు మధ్య అంతరాన్ని తగ్గించే వేదికలో చేరండి.", getStarted: "ప్రారంభించండి", learnMore: "మరింత తెలుసుకోండి" }
  },
  ur: {
    navbar: { login: "لاگ ان", signup: "سائن اپ", notifications: "اطلاعات", viewAllNotifications: "تمام اطلاعات دیکھیں", accountSettings: "اکاؤنٹ ترتیبات", logout: "لاگ آؤٹ" },
    sidebar: { dashboard: "ڈیش بورڈ", mySubmissions: "میری شکایات", reportIssue: "مسئلہ درج کریں", aiInsights: "AI تجزیہ", manageProjects: "منصوبے منظم کریں", userManagement: "صارف انتظامیہ", systemReports: "سسٹم رپورٹس", citizenPortal: "شہری پورٹل", officialPortal: "افسر پورٹل", adminPortal: "منتظم پورٹل" },
    landing: { title1: "جمہوریت کو طاقتور بنانا", title2: "ٹیکنالوجی کے ذریعے", subtitle: "جدید مصنوعی ذہانت کا استعمال کرتے ہوئے شہریوں اور ان کے منتخب نمائندوں کے درمیان فاصلے کو پاٹنے والے پلیٹ فارم سے جڑیں۔", getStarted: "شروع کریں", learnMore: "مزید جانیں" }
  }
};

let count = 0;
for (const [lang, data] of Object.entries(translations)) {
  const dir = path.join(localesDir, lang);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'translation.json'), JSON.stringify(data, null, 2), 'utf8');
  count++;
  console.log(`✓ Written: ${lang}`);
}

console.log(`\nDone! Wrote translations for ${count} languages.`);
