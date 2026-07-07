const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'frontend/src/locales');

// ── Full master translation for Hindi ──
const hi = {
  "common": { "loading": "लोड हो रहा है...", "save": "सहेजें", "cancel": "रद्द करें", "submit": "सबमिट करें", "back": "वापस", "next": "अगला", "search": "खोजें" },
  "navbar": { "login": "लॉग इन", "signup": "साइन अप", "notifications": "सूचनाएं", "viewAllNotifications": "सभी सूचनाएं देखें", "accountSettings": "खाता सेटिंग", "logout": "लॉग आउट" },
  "sidebar": { "dashboard": "डैशबोर्ड", "mySubmissions": "मेरी शिकायतें", "reportIssue": "समस्या दर्ज करें", "aiInsights": "AI अंतर्दृष्टि", "manageProjects": "परियोजनाएं प्रबंधित करें", "userManagement": "उपयोगकर्ता प्रबंधन", "systemReports": "सिस्टम रिपोर्ट", "citizenPortal": "नागरिक पोर्टल", "officialPortal": "अधिकारी पोर्टल", "adminPortal": "प्रशासक पोर्टल" },
  "landing": {
    "title1": "लोकतंत्र को सशक्त करना",
    "title2": "तकनीक के माध्यम से",
    "subtitle": "उन्नत कृत्रिम बुद्धिमत्ता का उपयोग करके नागरिकों और उनके निर्वाचित प्रतिनिधियों के बीच की खाई को पाटने वाले मंच से जुड़ें।",
    "getStarted": "शुरू करें",
    "learnMore": "अधिक जानें",
    "badge": "लाइव प्लेटफ़ॉर्म",
    "badgeMeta": "22 भाषाएं · 145+ जिले · सरकार प्रमाणित",
    "trustTitle": "सरकारी निकायों द्वारा विश्वसनीय · एंटरप्राइज AI के साथ निर्मित",
    "problemTitle": "हम जो समस्या हल करते हैं",
    "problemSubtitle": "भारत का शासन अंतर — नागरिक की समस्या और सरकारी कार्रवाई के बीच की जगह — हर साल अरबों रुपयों की उत्पादकता और जन-विश्वास की हानि करती है।",
    "beforeTitle": "JanVikas AI से पहले",
    "beforePoints": [
      "नागरिक हेल्पलाइन कॉल करते हैं — घंटों होल्ड पर रहते हैं",
      "शिकायतें केवल अंग्रेजी में — ग्रामीण भारत के 80% को छोड़कर",
      "कोई ट्रैकिंग नहीं — मुद्दे नौकरशाही में गायब हो जाते हैं",
      "डुप्लिकेट रिपोर्ट सिस्टम को बाधित करती हैं",
      "अधिकारियों के पास प्राथमिकता तय करने का कोई डेटा नहीं"
    ],
    "afterTitle": "JanVikas AI के बाद",
    "afterPoints": [
      "22 भारतीय भाषाओं में आवाज़ रिपोर्टिंग — बस बोलें",
      "AI तुरंत वर्गीकृत, डुप्लिकेट हटाता और तात्कालिकता स्कोर करता है",
      "हर कदम पर रियल-टाइम SMS/ईमेल अपडेट",
      "धोखाधड़ी पहचान अधिकारियों तक पहुंचने से पहले स्पैम रोकती है",
      "भू-स्थानिक डैशबोर्ड अधिकारियों को ठीक वहाँ दिखाता है जहाँ कार्रवाई जरूरी है"
    ],
    "sectionHowItWorksTitle": "यह कैसे काम करता है",
    "sectionHowItWorksSubtitle": "नागरिक शिकायत से सरकारी कार्रवाई तक चार चरण।",
    "sectionFeaturesTitle": "AI बुद्धिमत्ता परत",
    "sectionFeaturesSubtitle": "भारत की शासन चुनौतियों के लिए बने छह अभिनव AI क्षमताएँ।",
    "sectionPreviewTitle": "लाइव डैशबोर्ड पूर्वावलोकन",
    "sectionPreviewSubtitle": "आधुनिक जिले के शासन का कमांड सेंटर।",
    "sectionUseCasesTitle": "JanVikas AI किसके लिए है?",
    "sectionUseCasesSubtitle": "भारत के शासन पारिस्थितिकी तंत्र में हर हितधारक के लिए एक संगठित बुद्धिमत्ता परत।",
    "sectionTestimonialsTitle": "सरकारी दृष्टि",
    "sectionTestimonialsSubtitle": "उन अधिकारियों की आवाज़ें जिन्होंने JanVikas AI को लागू किया है।",
    "sectionFaqTitle": "अक्सर पूछे जाने वाले प्रश्न",
    "sectionCtaTitle": "दक्ष समुदाय बनाएं",
    "sectionCtaHighlight": "AI के साथ",
    "sectionCtaSubtitle": "145+ जिलों में पहले से ही AI-आधारित पारदर्शिता और जवाबदेही के साथ नागरिक शासन को बदल रहे हैं।",
    "sectionContactTitle": "संपर्क करें",
    "sectionContactSubtitle": "प्रतिक्रिया है, जिले का deployment चाहिए, या बस उत्सुक हैं? हम आपसे सुनना चाहेंगे।",
    "previewCards": {
      "mapView": "मानचित्र दृश्य", "analytics": "विश्लेषण", "aiRecs": "AI सुझाव", "priority": "प्राथमिकता",
      "mapDesc": "भू-स्थानिक हीटमैप", "analyticsDesc": "रुझान विश्लेषण", "aiRecsDesc": "स्मार्ट प्राथमिकताएं", "priorityDesc": "तात्कालिकता स्कोरिंग"
    },
    "steps": {
      "citizenInputTitle": "नागरिक इनपुट", "citizenInputDesc": "किसी भी डिवाइस से 22 भाषाओं में आवाज़, टेक्स्ट या छवि प्रस्तुति",
      "analysisTitle": "AI विश्लेषण", "analysisDesc": "स्वचालित वर्गीकरण, डुप्लिकेट हटाना, भावना स्कोरिंग और जियो-टैगिंग",
      "priorityTitle": "प्राथमिकता स्कोर", "priorityDesc": "बहु-कारक एल्गोरिदम तात्कालिकता, इक्विटी और प्रभाव के अनुसार रैंक करता है",
      "actionTitle": "सरकारी कार्रवाई", "actionDesc": "अधिकारियों को AI-ब्रीफ एजेंडा मिलता है और ट्रैक की गई जवाबदेही के साथ मुद्दे हल होते हैं"
    },
    "cards": {
      "voiceTitle": "22 भाषाओं में आवाज़ AI",
      "voiceDescription": "नागरिक अपनी मूल भाषा में मुद्दे रिपोर्ट करते हैं। AI उन्हें लाइव ट्रांसक्राइब, अनुवाद और वर्गीकृत करता है।",
      "imageTitle": "छवि सत्यापन",
      "imageDescription": "गड्ढों, टूटे पाइपों या कचरे की तस्वीरें संलग्न करें। हमारी vision मॉडल स्वतः सत्यापित और जियो-टैग करती है।",
      "fraudTitle": "धोखाधड़ी पहचान",
      "fraudDescription": "ML मॉडल दोहराव, नकली या राजनीतिक रूप से प्रेरित शिकायतों का पता लगाते हैं।",
      "nlpTitle": "NLP ट्राइज इंजन",
      "nlpDescription": "भावना विश्लेषण, तात्कालिकता स्कोरिंग — कच्चे पाठ को संरचित सरकारी बुद्धिमत्ता में बदलना।",
      "heatmapTitle": "AI हीटमैप",
      "heatmapDescription": "भू-स्थानिक बुद्धिमत्ता बुनियादी ढांचे के ब्लैकस्पॉट उजागर करती है।",
      "predictiveTitle": "पूर्वानुमानित विश्लेषण",
      "predictiveDescription": "पूर्वानुमान मॉडल 30 दिनों में बढ़ने वाली समस्याओं की भविष्यवाणी करते हैं।"
    },
    "useCases": {
      "citizensTitle": "नागरिक", "citizensPoint1": "किसी भी भारतीय भाषा में मुद्दे दर्ज करें",
      "citizensPoint2": "SMS/Email से रियल-टाइम स्थिति ट्रैकिंग", "citizensPoint3": "प्राथमिकता मुद्दों पर सामुदायिक मतदान", "citizensPoint4": "संवेदनशील मामलों के लिए गुमनाम रिपोर्टिंग",
      "officialsTitle": "MLA और अधिकारी", "officialsPoint1": "AI-प्राथमिकता वाली सुबह की ब्रीफिंग",
      "officialsPoint2": "निर्वाचन क्षेत्र हीटमैप डैशबोर्ड", "officialsPoint3": "बजट आवंटन सिफारिशें", "officialsPoint4": "स्वचालित साप्ताहिक प्रगति रिपोर्ट",
      "departmentsTitle": "सरकारी विभाग", "departmentsPoint1": "विभागों के बीच मुद्दा रूटिंग",
      "departmentsPoint2": "SLA अनुपालन ट्रैकिंग", "departmentsPoint3": "संसाधन उपयोग विश्लेषण", "departmentsPoint4": "अंतर-मंत्रालयी समन्वय परत",
      "ngosTitle": "NGO और शोध", "ngosPoint1": "ओपन डेटासेट API एक्सेस",
      "ngosPoint2": "समयावधि में रुझान रिपोर्ट", "ngosPoint3": "नीति प्रभावशीलता माप", "ngosPoint4": "ग्राउंड-ट्रूथ सत्यापन उपकरण"
    },
    "faqs": {
      "q1": "JanVikas AI कौन-कौन सी भाषाएं सपोर्ट करता है?",
      "a1": "JanVikas AI भारत की सभी 22 आधिकारिक भाषाओं को सपोर्ट करता है जिनमें हिंदी, तमिल, तेलुगु, कन्नड़, मलयालम, बंगाली, गुजराती, मराठी और अन्य शामिल हैं।",
      "q2": "डेटा सुरक्षित है? नागरिक प्रस्तुतियों तक कौन पहुंच सकता है?",
      "a2": "सभी डेटा आराम और पारगमन में एन्क्रिप्टेड है। केवल सत्यापित सरकारी अधिकारी जिनके पास रोल-आधारित एक्सेस है, अपने क्षेत्राधिकार में प्रस्तुतियां देख सकते हैं।",
      "q3": "AI मुद्दों को कैसे प्राथमिकता देता है?",
      "a3": "हमारा 6-कारक एल्गोरिदम तात्कालिकता, प्रभावित जनसंख्या, इक्विटी इंडेक्स, भौगोलिक क्लस्टरिंग, ऐतिहासिक समाधान समय और मौसमी जोखिम के आधार पर स्कोर करता है।",
      "q4": "क्या यह मौजूदा सरकारी प्रणालियों से एकीकृत हो सकता है?",
      "a4": "हां। JanVikas AI एक RESTful API और webhook प्रणाली प्रदान करता है जो PFMS, NIC पोर्टल, आरोग्य सेतु और DigiLocker से एकीकृत होती है।",
      "q5": "जिले के लिए deployment में कितना समय लगता है?",
      "a5": "एक मानक जिला deployment में 4-6 सप्ताह लगते हैं जिसमें डेटा onboarding, अधिकारी प्रशिक्षण और कस्टम ब्रांडिंग शामिल है।"
    },
    "testimonials": {
      "oneName": "जिला मजिस्ट्रेट, लखनऊ",
      "oneQuote": "JanVikas AI ने पहले तिमाही में हमारी समस्या बैकलॉग 60% कम की। AI प्राथमिकताकरण का मतलब है हम पहले सही समस्याएं हल कर रहे हैं।",
      "twoName": "वरिष्ठ IAS अधिकारी, महाराष्ट्र",
      "twoQuote": "बहुभाषी आवाज़ सबमिशन एक गेम-चेंजर है। दूरदराज के किसान जो कभी शिकायत दर्ज नहीं कर पाते थे, अब सुने जा रहे हैं।",
      "threeName": "नगर आयुक्त, सूरत",
      "threeQuote": "पूर्वानुमानित विश्लेषण ने हमें 3 सप्ताह पहले जल आपूर्ति समस्या की चेतावनी दी। हमने समय पर ठीक किया।"
    },
    "contact": {
      "fullNameLabel": "पूरा नाम", "fullNamePlaceholder": "राजेश कुमार",
      "emailLabel": "ईमेल पता", "emailPlaceholder": "rajesh@nic.in",
      "orgLabel": "संगठन / विभाग", "orgPlaceholder": "जिला कलेक्टोरेट, पुणे",
      "subjectLabel": "विषय", "subjectPlaceholder": "सामान्य पूछताछ",
      "messageLabel": "संदेश", "messagePlaceholder": "आपके जिले की शासन चुनौतियों के बारे में बताएं…",
      "submitButton": "संदेश भेजें"
    },
    "typewriter": {
      "aiPowered": "AI-संचालित नागरिक बुद्धिमत्ता",
      "multilingual": "बहुभाषी आवाज़ रिपोर्टिंग",
      "realTime": "रीयल-टाइम सरकारी कार्रवाई",
      "dataDriven": "डेटा-आधारित नीति निर्णय"
    }
  },
  "login": {
    "title": "वापस स्वागत है", "subtitle": "अपने पोर्टल में जारी रखने के लिए साइन इन करें।",
    "demoTitle": "त्वरित डेमो लॉगिन", "demoFilled": "क्रेडेंशियल भरे — साइन इन पर क्लिक करें",
    "emailLabel": "ईमेल", "emailPlaceholder": "you@example.com",
    "passwordLabel": "पासवर्ड", "passwordPlaceholder": "पासवर्ड दर्ज करें",
    "forgotPassword": "पासवर्ड भूल गए?", "signInButton": "साइन इन करें",
    "noAccount": "खाता नहीं है?", "createAccount": "बनाएं",
    "validation": { "emailRequired": "ईमेल आवश्यक है", "invalidEmail": "अमान्य ईमेल", "passwordRequired": "पासवर्ड आवश्यक है" }
  },
  "dashboard": {
    "welcomeCitizen": "वापस स्वागत है, {{name}} 👋", "welcomeOfficial": "नमस्ते, {{name}}",
    "citizenSubtitle": "{{district}} में आपकी रिपोर्ट की गई समस्याओं की स्थिति",
    "officialSubtitle": "{{district}} के लिए लाइव इंटेलिजेंस अवलोकन",
    "reportIssue": "नई समस्या दर्ज करें", "recentSubmissions": "हाल की प्रस्तुतियां",
    "viewAll": "सब देखें", "noSubmissions": "अभी तक कोई प्रस्तुति नहीं",
    "noSubmissionsDesc": "आपने अभी तक कोई समस्या रिपोर्ट नहीं की।", "reportIssueCTA": "समस्या दर्ज करें",
    "makeVoiceHeard": "अपनी आवाज़ सुनाएं", "makeVoiceHeardDesc": "आवाज़, छवि या टेक्स्ट से स्थानीय समस्याएं सबमिट करें।",
    "reportIssueNow": "अभी समस्या दर्ज करें", "constituencyInfo": "निर्वाचन क्षेत्र जानकारी",
    "state": "राज्य", "district": "जिला", "representative": "प्रतिनिधि"
  },
  "auth": {
    "register": {
      "title": "खाता बनाएं", "subtitle": "स्थानीय समस्याओं की आवाज़ के लिए JanVikas AI से जुड़ें।",
      "nameLabel": "पूरा नाम", "namePlaceholder": "रोहन शर्मा",
      "emailLabel": "ईमेल पता", "emailPlaceholder": "you@example.com",
      "stateLabel": "राज्य", "statePlaceholder": "महाराष्ट्र",
      "districtLabel": "जिला", "districtPlaceholder": "पुणे",
      "passwordLabel": "पासवर्ड", "passwordPlaceholder": "••••••••",
      "confirmPasswordLabel": "पासवर्ड की पुष्टि करें", "confirmPasswordPlaceholder": "••••••••",
      "submitButton": "खाता बनाएं", "alreadyHaveAccount": "पहले से खाता है?", "signInLink": "साइन इन करें"
    },
    "forgotPassword": {
      "backToLogin": "लॉगिन पर वापस", "title": "पासवर्ड भूल गए",
      "subtitle": "अपना ईमेल पता दर्ज करें और हम आपको रीसेट लिंक भेजेंगे।",
      "emailLabel": "ईमेल पता", "emailPlaceholder": "you@example.com",
      "submitButton": "रीसेट लिंक भेजें",
      "successTitle": "अपना ईमेल जांचें", "successMessage": "हमने आपके ईमेल पर पासवर्ड रीसेट लिंक भेजा है।",
      "toastSuccess": "पासवर्ड रीसेट लिंक आपके ईमेल पर भेजा गया"
    }
  },
  "footer": {
    "brandDescription": "AI के माध्यम से भारतीय लोकतंत्र को सशक्त करना। 1.4 अरब नागरिकों और उनके प्रतिनिधियों के बीच की खाई को पाटना।",
    "sections": { "product": "उत्पाद", "platform": "प्लेटफ़ॉर्म", "resources": "संसाधन", "legal": "कानूनी" },
    "links": { "citizenPortal": "नागरिक पोर्टल", "officialDashboard": "अधिकारी डैशबोर्ड", "adminConsole": "प्रशासक कंसोल" },
    "badges": { "meityCertified": "MeitY प्रमाणित", "iso27001": "ISO 27001", "systemsOperational": "सभी सिस्टम चालू", "dpdpActCompliant": "DPDP अधिनियम अनुपालन" },
    "bottom": { "copyright": "© {{year}} JanVikas AI टेक्नोलॉजीज प्रा. लि. · भारत के लिए निर्मित 🇮🇳", "privacy": "गोपनीयता", "terms": "नियम", "contact": "संपर्क" }
  },
  "languageSwitcher": { "toggleAria": "भाषा बदलें", "current": "वर्तमान", "title": "भाषा चुनें", "subtitle": "भारत की 22 आधिकारिक भाषाएं" }
};

fs.writeFileSync(path.join(localesDir, 'hi/translation.json'), JSON.stringify(hi, null, 2), 'utf8');
console.log('✓ Fixed: hi (Hindi) — clean JSON written');
