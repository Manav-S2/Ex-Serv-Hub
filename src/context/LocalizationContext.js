import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@esm_hub_language';
const SENIOR_MODE_KEY = '@esm_hub_senior_mode';

const TRANSLATIONS = {
  en: {
    // Header
    appNamePrefix: 'EX-SERVICEMEN',
    appNameHighlight: 'APP HUB',
    headerSubtitle: 'ALL-IN-ONE WITH AI GUIDE',
    headerHindi: 'Information • Guidance & Support • In One Place',

    // Nav Tabs
    tabHome: 'Home',
    tabJobs: 'Jobs',
    tabAi: 'AI Sahayak',
    tabRsb: 'RSB',
    tabZsb: 'ZSB',

    // Hero Section
    heroSmall: 'We are here to',
    heroLine1: 'Inform, Guide & Support',
    heroLine2: 'Our Veterans',
    check1: 'Verified Info',
    check2: 'Clear Guidance',
    check3: 'Dedicated Support',

    // AI Card
    aiCardTitle: 'Ask AI Assistant ✨',
    aiCardSub1: 'Ask about Pension, ECHS, CSD, Jobs,',
    aiCardSub2: 'Schemes, or any resettlement query...',
    aiCardBtn: 'Ask Now',

    // Pension Alert Banner
    dlcAlertTitle: '⏰ Annual SPARSH Life Certificate Alert',
    dlcAlertSub: 'Submission window is open for all defense pensioners. Submit before 30 November to avoid pension stoppage.',
    dlcAlertBtnGuide: 'Submit DLC Guide',
    dlcAlertBtnRemind: 'Set Reminder',
    dlcAlertDismissed: 'Reminder set! We will remind you for DLC.',

    // Section Titles
    mainServicesTitle: 'Core Veteran Services',
    quickPortalsTitle: 'Official Portals',

    // Actions
    btnWebsite: 'Website',
    btnYoutube: 'YouTube',
    btnAskAi: 'Ask AI',
    btnShare: 'Share',
    btnCopy: 'Copy',
    btnApply: 'Apply Now',
    btnSaved: 'Saved',
    btnSave: 'Save',
    btnFindOffice: 'Find Office',

    // Toggles
    seniorMode: 'Senior Mode',
    langToggle: 'हिंदी',

    // Services
    deswTitle: 'DESW',
    deswSub: 'Department of Ex-Servicemen Welfare - Central Policies & Welfare',
    sparshTitle: 'SPARSH PENSION',
    sparshSub: 'Digital Pension Disbursement, e-PPO & Life Certificate (PCDA)',
    echsTitle: 'ECHS HEALTHCARE',
    echsSub: 'Ex-Servicemen Contributory Health Scheme - 64KB Card & Treatment',
    dgrTitle: 'DGR RESETTLEMENT',
    dgrSub: 'Directorate General Resettlement - Job Quotas & Courses',
    ksbTitle: 'KSB WELFARE',
    ksbSub: 'Kendriya Sainik Board - Financial Grants, PMSS Scholarship',
    rsbTitle: 'RSB DIRECTORY',
    rsbSub: 'Rajya Sainik Boards across 34 States & UTs',
    zsbTitle: 'ZSB DIRECTORY',
    zsbSub: 'Zila Sainik Boards in 700+ Districts - ESM Cards',
    csdTitle: 'CSD CANTEEN',
    csdSub: 'CSD AFD Car/Bike Portal & 1,000+ Authorized Dealer Network',
    awpoTitle: 'AWPO PLACEMENT',
    awpoSub: 'Army Welfare Placement Org - Corporate Veteran Hiring',
  },
  hi: {
    // Header
    appNamePrefix: 'पूर्व सैनिक',
    appNameHighlight: 'ऐप हब',
    headerSubtitle: 'एआई गाइड के साथ सम्पूर्ण सेवा',
    headerHindi: 'जानकारी • मार्गदर्शन और सहायता • एक ही जगह',

    // Nav Tabs
    tabHome: 'मुख्य',
    tabJobs: 'नौकरियां',
    tabAi: 'एआई सहायक',
    tabRsb: 'राज्य बोर्ड',
    tabZsb: 'जिला बोर्ड',

    // Hero Section
    heroSmall: 'हम यहाँ हैं',
    heroLine1: 'सही जानकारी, मार्गदर्शन',
    heroLine2: 'और पूर्व सैनिक सहायता के लिए',
    check1: 'सही जानकारी',
    check2: 'सही मार्गदर्शन',
    check3: 'सही सहायता',

    // AI Card
    aiCardTitle: 'एआई सहायक से पूछें ✨',
    aiCardSub1: 'पेंशन, ईसीएचएस, सीएसडी, नौकरी,',
    aiCardSub2: 'या किसी भी सरकारी योजना की जानकारी लें...',
    aiCardBtn: 'अभी पूछें',

    // Pension Alert Banner
    dlcAlertTitle: '⏰ वार्षिक स्पर्श जीवन प्रमाण पत्र सूचना',
    dlcAlertSub: 'सभी रक्षा पेंशनरों के लिए डिजिटल लाइफ सर्टिफिकेट (DLC) जमा करने का समय जारी है। पेंशन रुकने से बचने के लिए 30 नवंबर से पहले जमा करें।',
    dlcAlertBtnGuide: 'प्रक्रिया देखें',
    dlcAlertBtnRemind: 'याद दिलाएं',
    dlcAlertDismissed: 'रिमाइंडर सेट! आपको नवंबर में याद दिलाया जाएगा।',

    // Section Titles
    mainServicesTitle: 'मुख्य पूर्व सैनिक सेवाएं',
    quickPortalsTitle: 'आधिकारिक पोर्टल',

    // Actions
    btnWebsite: 'वेबसाइट',
    btnYoutube: 'यूट्यूब',
    btnAskAi: 'एआई पूछें',
    btnShare: 'शेयर',
    btnCopy: 'कॉपी',
    btnApply: 'आवेदन करें',
    btnSaved: 'सुरक्षित',
    btnSave: 'सुरक्षित करें',
    btnFindOffice: 'ऑफिस खोजें',

    // Toggles
    seniorMode: 'सीनियर मोड',
    langToggle: 'ENG',

    // Services
    deswTitle: 'डीईएसडब्ल्यू (DESW)',
    deswSub: 'पूर्व सैनिक कल्याण विभाग - केंद्रीय नीतियां और कल्याण योजनाएं',
    sparshTitle: 'स्पर्श पेंशन (SPARSH)',
    sparshSub: 'डिजिटल पेंशन भुगतान, ई-पीपीओ और जीवन प्रमाण पत्र (PCDA)',
    echsTitle: 'ईसीएचएस स्वास्थ्य (ECHS)',
    echsSub: '64-केबी स्मार्ट कार्ड, इलाज व आपातकालीन चिकित्सा प्रतिपूर्ति',
    dgrTitle: 'डीजीआर पुनर्वास (DGR)',
    dgrSub: 'सरकारी नौकरी आरक्षण (10% ग्रुप सी, 20% ग्रुप डी) और ट्रेनिंग',
    ksbTitle: 'केएसबी कल्याण (KSB)',
    ksbSub: '₹50,000 बेटी विवाह अनुदान, पीएमएसएस छात्रवृत्ति ₹36,000/वर्ष',
    rsbTitle: 'राज्य सैनिक बोर्ड (RSB)',
    rsbSub: '34 राज्यों और केंद्र शासित प्रदेशों के राज्य सैनिक कल्याण कार्यालय',
    zsbTitle: 'जिला सैनिक बोर्ड (ZSB)',
    zsbSub: '700+ जिलों में जिला सैनिक बोर्ड - पूर्व सैनिक पहचान पत्र (I-Card)',
    csdTitle: 'सीएसडी कैंटीन (CSD AFD)',
    csdSub: 'रैंक-वार कार/बाइक कोटा, एएफडी पोर्टल व 1,000+ डीलर निर्देशिका',
    awpoTitle: 'एडब्ल्यूपीओ जॉब्स (AWPO)',
    awpoSub: 'आर्मी वेलफेयर प्लेसमेंट ऑर्ग - कॉरपोरेट और निजी क्षेत्र में नौकरियां',
  },
};

const LocalizationContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  seniorMode: false,
  toggleSeniorMode: () => {},
  t: (key) => key,
  fontScale: 1.0,
});

export function LocalizationProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [seniorMode, setSeniorModeState] = useState(false);

  useEffect(() => {
    // Load persisted settings
    AsyncStorage.getItem(LANGUAGE_KEY).then(savedLang => {
      if (savedLang === 'en' || savedLang === 'hi') {
        setLanguageState(savedLang);
      }
    }).catch(() => {});

    AsyncStorage.getItem(SENIOR_MODE_KEY).then(savedSenior => {
      if (savedSenior !== null) {
        setSeniorModeState(savedSenior === 'true');
      }
    }).catch(() => {});
  }, []);

  const setLanguage = async (newLang) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
    } catch {}
  };

  const toggleLanguage = async () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    await setLanguage(nextLang);
  };

  const toggleSeniorMode = async () => {
    const nextMode = !seniorMode;
    setSeniorModeState(nextMode);
    try {
      await AsyncStorage.setItem(SENIOR_MODE_KEY, String(nextMode));
    } catch {}
  };

  const t = (key) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return currentDict[key] || TRANSLATIONS.en[key] || key;
  };

  const fontScale = seniorMode ? 1.2 : 1.0;

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        seniorMode,
        toggleSeniorMode,
        t,
        fontScale,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  return useContext(LocalizationContext);
}

export default LocalizationContext;
