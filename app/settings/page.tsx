import SettingsPanel from '@/components/SettingsPanel';

export default function SettingsPage() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">A little more you</p>
        <h1>Settings</h1>
      </header>
      <SettingsPanel />
    </>
  );
}
