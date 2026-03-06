import React from 'react';

interface Props {
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack }) => (
  <div className="flex flex-col h-full px-4 py-6 gap-4">
    <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--ink)' }}>Nastavení</h2>

    <div className="flex flex-col gap-4 flex-1">
      <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
        <span className="text-xl">🔊 Zvuk</span>
        <span className="text-lg" style={{ color: 'var(--ink-light)' }}>(brzy)</span>
      </div>
      <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
        <span className="text-xl">⚡ Obtížnost</span>
        <span className="text-lg" style={{ color: 'var(--ink-light)' }}>(brzy)</span>
      </div>
      <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
        <span className="text-xl">🌍 Jazyk</span>
        <span className="text-lg font-semibold">🇨🇿 Čeština</span>
      </div>
    </div>

    <button className="sketch-btn text-xl py-2 w-full" onClick={onBack}>← Zpět do menu</button>
  </div>
);

