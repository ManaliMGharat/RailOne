import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const translations: Translations = {
  // App
  appTitle: { en: 'RailOne', hi: 'रेलमित्र / रेलवन', mr: 'रेलवन' },
  tagline: { en: 'Your journey, simplified.', hi: 'आपकी यात्रा, सरल और सुगम।', mr: 'तुमचा प्रवास, सोपा आणि सुखकर.' },
  
  // Header & Greetings
  greeting: { en: 'Hi, Manali Manish Gharat!', hi: 'नमस्ते, मनाली मनीष घरात!', mr: 'नमस्कार, मनाली मनीष घरात!' },
  headerSubtitle: { en: 'Where would you like to travel today?', hi: 'आज आप कहाँ यात्रा करना चाहते हैं?', mr: 'आज तुम्हाला कुठे प्रवास करायचा आहे?' },
  notifications: { en: 'Notifications', hi: 'सूचनाएँ', mr: 'सूचना' },

  // Journey Planner
  journeyPlanner: { en: 'JOURNEY PLANNER', hi: 'यात्रा योजना', mr: 'प्रवास योजना' },
  reserved: { en: 'RESERVED', hi: 'आरक्षित', mr: 'आरक्षित (रिझर्व्हड)' },
  reservedDesc: { en: 'Express trains, AC & Sleeper coaches, confirmed berths with scenic mountain views.', hi: 'एक्सप्रेस ट्रेन, एसी व स्लीपर कोच, पर्वत दृश्यों के साथ सुनिश्चित बर्थ।', mr: 'जलद गाड्या, एसी व स्लीपर डबे, निसर्गरम्य दृश्यांसह कन्फर्म सीट.' },
  
  unreserved: { en: 'UNRESERVED', hi: 'अनारक्षित (UTS)', mr: 'अनारक्षित (UTS लोकल)' },
  unreservedDesc: { en: 'Mumbai Suburban local trains, everyday commuters, fast UTS digital ticketing.', hi: 'मुंबई उपनगरीय लोकल, दैनिक यात्री और तुरंत डिजिटल टिकट।', mr: 'मुंबई उपनगरी लोकल, दैनंदिन प्रवासी आणि जलद डिजिटल UTS तिकिटे.' },
  
  platform: { en: 'PLATFORM', hi: 'प्लेटफ़ॉर्म टिकट', mr: 'प्लॅटफॉर्म तिकीट' },
  platformDesc: { en: 'Instant railway platform entry valid for 2 hours with digital QR pass.', hi: 'डिजिटल क्यूआर पास के साथ 2 घंटे के लिए तुरंत स्टेशन प्रवेश।', mr: 'डिजिटल QR पाससह २ तासांसाठी त्वरित स्टेशन प्रवेश.' },

  // More Offerings
  moreOfferings: { en: 'MORE OFFERINGS', hi: 'अन्य सेवाएँ', mr: 'इतर सेवा' },
  searchTrains: { en: 'Search Trains', hi: 'ट्रेन खोजें', mr: 'ट्रेन शोधा' },
  pnrStatus: { en: 'PNR Status', hi: 'पीएनआर स्थिति', mr: 'PNR स्थिती' },
  coachPosition: { en: 'Coach Position', hi: 'कोच की स्थिति', mr: 'डब्यांची रचना (कोच)' },
  trackTrain: { en: 'Track Your Train', hi: 'ट्रेन ट्रैक करें', mr: 'लाईव्ह ट्रेन ट्रॅकिंग' },
  orderFood: { en: 'Order Food', hi: 'खाना ऑर्डर करें', mr: 'जेवण ऑर्डर करा' },
  fileRefund: { en: 'File Refund', hi: 'रिफंड दर्ज करें', mr: 'रिफंड अर्ज करा' },
  seasonTicket: { en: 'Season Ticket', hi: 'सीजन टिकट / पास', mr: 'मासिक पास (सीझन तिकीट)' },
  railwaySupport: { en: 'Railway Support', hi: 'रेलवे सहायता', mr: 'रेल्वे मदत व तक्रार' },

  // Common UI
  from: { en: 'From', hi: 'कहाँ से', mr: 'कुठून' },
  to: { en: 'To', hi: 'कहाँ तक', mr: 'कुठे' },
  date: { en: 'Journey Date', hi: 'यात्रा की तारीख', mr: 'प्रवासाची तारीख' },
  class: { en: 'Class', hi: 'श्रेणी (क्लास)', mr: 'प्रवर्ग (क्लास)' },
  allClasses: { en: 'All Classes', hi: 'सभी श्रेणियां', mr: 'सर्व वर्ग' },
  search: { en: 'Search', hi: 'खोजें', mr: 'शोधा' },
  swap: { en: 'Swap Stations', hi: 'स्टेशन बदलें', mr: 'स्थानक उलटा' },
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },
  retry: { en: 'Retry', hi: 'पुनः प्रयास करें', mr: 'पुन्हा प्रयत्न करा' },
  bookNow: { en: 'Book Now', hi: 'अभी बुक करें', mr: 'आत्ताच बुक करा' },
  walletBalance: { en: 'Wallet Balance', hi: 'वॉलेट बैलेंस', mr: 'वॉलेट शिल्लक' },
  fare: { en: 'Fare', hi: 'किराया', mr: 'भाडे' },
  cancel: { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  confirm: { en: 'Confirm', hi: 'पुष्टि करें', mr: 'निश्चित करा' },
  home: { en: 'Home', hi: 'होम', mr: 'मुख्यपृष्ठ' },
  bookings: { en: 'Bookings', hi: 'मेरी बुकिंग्स', mr: 'माझ्या बुकिंग्ज' },
  wallet: { en: 'Wallet', hi: 'वॉलेट', mr: 'वॉलेट' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल', mr: 'माझे खाते' },
  logout: { en: 'Logout', hi: 'लॉगआउट', mr: 'बाहेर पडा (लॉगआउट)' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('railone_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('railone_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    if (translations[key] && translations[key]['en']) {
      return translations[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
