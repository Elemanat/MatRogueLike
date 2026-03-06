import React from 'react';

interface Props {
  playerName: string;
  onPlay: () => void;
  onStats: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export const MenuScreen: React.FC<Props> = ({ playerName, onPlay, onStats, onSettings, onLogout }) => (
  <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
    <h1 className="text-5xl font-bold" style={{ color: 'var(--ink)' }}>VěžMat</h1>
    <p className="text-lg" style={{ color: 'var(--ink-light)' }}>Vítej, {playerName}!</p>
    <div className="flex flex-col gap-4 w-full">
      <button className="sketch-btn sketch-btn-primary text-2xl py-3" onClick={onPlay}>
        ⚔️ Hrát
      </button>
      <button className="sketch-btn text-xl py-2" onClick={onStats}>
        📊 Statistiky
      </button>
      <button className="sketch-btn text-xl py-2" onClick={onSettings}>
        ⚙️ Nastavení
      </button>
      <button className="sketch-btn sketch-btn-danger text-xl py-2" onClick={onLogout}>
        ← Odhlásit
      </button>
    </div>
  </div>
);

