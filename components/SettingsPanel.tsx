'use client';

import { usePreferences } from './PreferencesProvider';
import type { Locale, ThemeMode } from '@/lib/types';

export default function SettingsPanel() {
  const { theme, locale, setTheme, setLocale } = usePreferences();
  return (
    <div className="settings-panel">
      <fieldset>
        <legend>Make yourself at home</legend>
        <p>Choose the view that feels right. Your choice stays on this device.</p>
        <div className="theme-options">
          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
            <label key={mode} className={`theme-option ${theme === mode ? 'selected' : ''}`}>
              <input
                type="radio"
                name="theme"
                checked={theme === mode}
                onChange={() => setTheme(mode)}
              />
              <span aria-hidden="true">
                {mode === 'system' ? '◐' : mode === 'light' ? '☀' : '☾'}
              </span>
              <strong>{mode[0].toUpperCase() + mode.slice(1)}</strong>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Language preview</legend>
        <p>Try localized profile counts. The rest of Chirp currently uses English.</p>
        <label htmlFor="locale">Count language</label>
        <select
          id="locale"
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ja">日本語</option>
        </select>
      </fieldset>
      <fieldset>
        <legend>Your chirps</legend>
        <p>
          Download everything the current demo identity has posted as JSON Lines. A copy is also
          kept in the local data folder.
        </p>
        <a className="text-link" href="/api/export" download>
          Download my chirps
        </a>
      </fieldset>
      <div className="settings-note">
        <strong>Your space, your pace.</strong>
        <p>
          No analytics services or remote assets are needed to use this demo. Posts are stored in
          the local SQLite database.
        </p>
      </div>
    </div>
  );
}
