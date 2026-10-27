/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from './translations';
import { speakText, stopSpeech } from '../utils/speech';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  isSpeaking: boolean;
  readAloud: (text: string) => void;
  stopAudio: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('fairshift_language');
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'ta' || saved === 'te')) {
        return saved as LanguageCode;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('fairshift_language', language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    stopSpeech();
    setIsSpeaking(false);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  const readAloud = (text: string) => {
    setIsSpeaking(true);
    speakText(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const stopAudio = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isSpeaking,
        readAloud,
        stopAudio,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
