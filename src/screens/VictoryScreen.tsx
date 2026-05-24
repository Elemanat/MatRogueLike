import React from 'react';
import type { PlayerStats } from '../types/game';

interface Props {
  playerName: string;
  towerName: string;
  stats: PlayerStats;
  onMenu: () => void;
}

export const VictoryScreen: React.FC<Props> = ({ playerName, towerName, stats, onMenu }) => (
  <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
    <div className="text-5xl">🏆</div>
    <h2 className="text-4xl font-bold text-center" style={{ color: 'var(--gold)' }}>Vítěz!</h2>
    <p className="text-xl text-center" style={{ color: 'var(--ink)' }}>
      {playerName} zdolal <strong>{towerName}</strong>!
    </p>

    <div className="sketch-box w-full px-4 py-3 flex flex-col gap-2">
      <p className="text-lg text-center font-semibold">Výsledky:</p>
      <div className="flex justify-between text-lg"><span>🏰 Patra</span><span>{stats.floorsCompleted}</span></div>
      <div className="flex justify-between text-lg"><span>⚔️ Nepřátelé</span><span>{stats.enemiesDefeated}</span></div>
      <div className="flex justify-between text-lg"><span>✅ Správně</span><span>{stats.correctAnswers}</span></div>
      <div className="flex justify-between text-lg"><span>❌ Špatně</span><span>{stats.wrongAnswers}</span></div>
    </div>

    <button className="sketch-btn sketch-btn-primary w-full text-2xl py-2" onClick={onMenu}>
      ← Zpět do menu
    </button>
  </div>
);

