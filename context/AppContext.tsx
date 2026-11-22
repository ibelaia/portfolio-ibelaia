'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

type Language = 'EN' | 'ID';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  t: (en: string, id: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>('EN');
  const [isDark, setIsDark] = useState<boolean>(true);

  const syncAccentVariable = useCallback(() => {
    if (typeof window === 'undefined') return;
    const savedAccent =
      localStorage.getItem('portfolio_accent') ||
      localStorage.getItem('app_accent') ||
      '#06b6d4';
    document.documentElement.style.setProperty('--accent', savedAccent);
  }, []);

  // Baca preferensi tersimpan dari browser (localStorage)
  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang) setLanguage(savedLang);

    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }

    syncAccentVariable();
  }, [syncAccentVariable]);

  // Update class HTML & simpan status tema + variabel aksen
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('app_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('app_theme', 'light');
    }
    syncAccentVariable();
  }, [isDark, syncAccentVariable]);

  // Sinkronisasi lintas tab via BroadcastChannel & storage event
  useEffect(() => {
    let channel: BroadcastChannel | null = null;

    const handleSyncUpdate = () => {
      const latestLang = localStorage.getItem('app_lang') as Language | null;
      if (latestLang === 'EN' || latestLang === 'ID') {
        setLanguage(latestLang);
      }

      const latestTheme = localStorage.getItem('app_theme');
      if (latestTheme === 'dark' || latestTheme === 'light') {
        setIsDark(latestTheme === 'dark');
      }

      syncAccentVariable();
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('portfolio-admin-sync');
      channel.onmessage = handleSyncUpdate;
    }

    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === 'app_lang' ||
        event.key === 'app_theme' ||
        event.key.startsWith('portfolio')
      ) {
        handleSyncUpdate();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [syncAccentVariable]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  // Helper fungsi terjemahan cepat: t('English text', 'Teks Indonesia')
  const t = (en: string, id: string) => (language === 'ID' ? id : en);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        isDark,
        setIsDark,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};