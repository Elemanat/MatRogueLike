import React from 'react';
import type { GameSettings } from '../types/game';
import { getApiRuntimeConfig } from '../services/api/config';

interface Props {
  settings: GameSettings;
  onChange: (settings: Partial<GameSettings>) => void;
  onResetSessionStats: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ settings, onChange, onResetSessionStats, onBack }) => (
  <div className="flex flex-col h-full px-4 py-6 gap-4">
    <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--ink)' }}>Nastavení</h2>

    <div className="flex flex-col gap-4 flex-1">
      <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
        <span className="text-xl">🔊 Zvuk</span>
        <button
          className="sketch-btn text-base py-1 px-3"
          onClick={() => onChange({ soundEnabled: !settings.soundEnabled })}
        >
          {settings.soundEnabled ? 'Zapnuto' : 'Vypnuto'}
        </button>
      </div>

      <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
        <span className="text-xl">⏳ Čas na příklad</span>
        <select
          className="sketch-box-light px-2 py-1 text-base"
          value={settings.roundTimeSeconds}
          onChange={e => onChange({ roundTimeSeconds: Number(e.target.value) })}
        >
          {[15, 20, 30, 45, 60].map(v => (
            <option key={v} value={v}>{v} s</option>
          ))}
        </select>
      </div>

      <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
        <span className="text-xl">🎞️ Omezené animace</span>
        <button
          className="sketch-btn text-base py-1 px-3"
          onClick={() => onChange({ reducedMotion: !settings.reducedMotion })}
        >
          {settings.reducedMotion ? 'Ano' : 'Ne'}
        </button>
      </div>

      <button className="sketch-btn sketch-btn-danger text-lg py-2" onClick={onResetSessionStats}>
        Reset session statistik
      </button>

      <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
        <span className="text-xl">API rezim</span>
        <span className="text-lg font-semibold" style={{ color: 'var(--ink-light)' }}>
          {getApiRuntimeConfig().mode}
        </span>
      </div>
    </div>

    <button className="sketch-btn text-xl py-2 w-full" onClick={onBack}>← Zpět do menu</button>
  </div>
);

