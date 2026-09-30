 'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Locale, ThemeMode, UserPreferences } from '@/lib/types';

const DEFAULTS: UserPreferences = { theme: 'system', locale: 'en' };
const PreferencesContext = createContext({ ...DEFAULTS, setTheme: (_theme: ThemeMode) => {}, setLocale: (_locale: Locale) => {} });

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('chirp:preferences') ?? '{}');
      setPreferences({ theme: ['system','light','dark'].includes(saved.theme) ? saved.theme : 'system', locale: ['en','es','ja'].includes(saved.locale) ? saved.locale : 'en' });
    } catch { /* A blocked or unavailable storage falls back to defaults. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.lang = preferences.locale;
    try { localStorage.setItem('chirp:preferences', JSON.stringify(preferences)); } catch {}
  }, [preferences, ready]);
  return <PreferencesContext.Provider value={{ ...preferences, setTheme: (theme) => setPreferences((value) => ({ ...value, theme })), setLocale: (locale) => setPreferences((value) => ({ ...value, locale })) }}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() { return useContext(PreferencesContext); }
