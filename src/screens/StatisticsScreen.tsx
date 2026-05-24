import React from 'react';
import type { PlayerStats } from '../types/game';

interface Props {
  stats: PlayerStats;
  onBack: () => void;
}

export const StatisticsScreen: React.FC<Props> = ({ stats, onBack }) => {
  const total = stats.correctAnswers + stats.wrongAnswers;
  const accuracy = total > 0 ? Math.round((stats.correctAnswers / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full px-4 py-6 gap-4">
      <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--ink)' }}>Statistiky</h2>
      <p className="text-center text-sm" style={{ color: 'var(--ink-light)' }}>Aktuální session</p>

      <div className="flex flex-col gap-3 flex-1">
        {[
          { label: '⚔️ Poražení nepřátelé', value: stats.enemiesDefeated },
          { label: '🏰 Dokončená patra',    value: stats.floorsCompleted },
          { label: '✅ Správné odpovědi',   value: stats.correctAnswers },
          { label: '❌ Špatné odpovědi',    value: stats.wrongAnswers },
          { label: '🎯 Úspěšnost',          value: `${accuracy} %` },
        ].map(row => (
          <div key={row.label} className="sketch-box-light px-4 py-2 flex justify-between items-center">
            <span className="text-lg">{row.label}</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{row.value}</span>
          </div>
        ))}
      </div>

      <button className="sketch-btn text-xl py-2 w-full" onClick={onBack}>← Zpět do menu</button>
    </div>
  );
};

