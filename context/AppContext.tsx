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

const ACCENT_HEX_MAP: Record<string, string> = {
  cyan: '#06b6d4',
  purple: '#a855f7',
  emerald: '#34d399',
  rose: '#f43f5e',
  amber: '#fbbf24',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>('EN');
  const [isDark, setIsDark] = useState<boolean>(true);

  const syncAccentVariable = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    let accentKey = root.getAttribute('data-accent') || '';

    try {
      const syncRaw = localStorage.getItem('portfolio-sync-appearance');
      if (syncRaw) {
        const parsed = JSON.parse(syncRaw);
        if (parsed?.data?.accent_color) {
          accentKey = String(parsed.data.accent_color);
          root.setAttribute('data-accent', accentKey);
        }
      }
    } catch {
      // Abaikan error akses localStorage
    }

    if (accentKey && ACCENT_HEX_MAP[accentKey]) {
      root.style.setProperty('--accent', ACCENT_HEX_MAP[accentKey]);
    }
  }, []);

  // Baca preferensi tersimpan dari browser (localStorage)
  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang === 'EN' || savedLang === 'ID') {
      setLanguage(savedLang);
    }

    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setIsDark(savedTheme === 'dark');
    }

    syncAccentVariable();
  }, [syncAccentVariable]);

  // Update class HTML & simpan status tema + sinkronisasi aksen
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
    let appearanceChannel: BroadcastChannel | null = null;

    const handleSyncUpdate = (event?: MessageEvent) => {
      const latestLang = localStorage.getItem('app_lang') as Language | null;
      if (latestLang === 'EN' || latestLang === 'ID') {
        setLanguage(latestLang);
      }

      const latestTheme = localStorage.getItem('app_theme');
      if (latestTheme === 'dark' || latestTheme === 'light') {
        setIsDark(latestTheme === 'dark');
      }

      const incomingAccent = event?.data?.data?.accent_color;
      if (incomingAccent && ACCENT_HEX_MAP[incomingAccent]) {
        document.documentElement.setAttribute('data-accent', incomingAccent);
        document.documentElement.style.setProperty(
          '--accent',
          ACCENT_HEX_MAP[incomingAccent]
        );
      } else {
        syncAccentVariable();
      }
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('portfolio-admin-sync');
      channel.onmessage = handleSyncUpdate;

      appearanceChannel = new BroadcastChannel('portfolio-sync-appearance');
      appearanceChannel.onmessage = handleSyncUpdate;
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
      if (appearanceChannel) {
        appearanceChannel.close();
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