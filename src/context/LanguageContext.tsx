import React, { createContext, useContext, useState, ReactNode } from "react";
import { translations as allTranslations, Language, Translations } from "../translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  tf: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("es");

  const t = allTranslations[language];
  
  // Flat helper for legacy code
  const tf = (key: string) => {
    const flat: any = {
      nav_home: t.nav.home,
      nav_view: "Ver",
      nav_translator: "Traductor",
      nav_recordings: t.recordings.title,
      nav_gallery: t.community.title,
      nav_contacts: t.contacts.title,
      nav_chats: t.videoCall.groups,
      lang_toggle: language === 'es' ? 'Ayuujk' : 'Español',
      team_title: t.team.title
    };
    return flat[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tf }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
