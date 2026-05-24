import React, { useState } from 'react';
import { TOWERS } from '../services/gameCatalog';
import type { Tower } from '../types/game';

interface Props {
  onSelect: (tower: Tower) => void;
  onBack: () => void;
}

export const TowerSelectScreen: React.FC<Props> = ({ onSelect, onBack }) => {
  const [selected, setSelected] = useState<Tower | null>(null);

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-4">
      <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--ink)' }}>Výběr věže</h2>
      <p className="text-center text-base" style={{ color: 'var(--ink-light)' }}>
        Vyber téma, které chceš dobýt:
      </p>

      <div className="flex flex-col gap-3 flex-1">
        {TOWERS.map(tower => (
          <button
            key={tower.id}
            className="sketch-box text-left px-4 py-3 cursor-pointer transition-all"
            style={{
              borderColor: selected?.id === tower.id ? 'var(--gold)' : 'var(--ink)',
              boxShadow: selected?.id === tower.id ? '3px 3px 0 var(--gold)' : '3px 3px 0 var(--ink)',
              backgroundColor: selected?.id === tower.id ? '#fffbe6' : 'var(--paper)',
              border: '2px solid',
            }}
            onClick={() => setSelected(tower)}
          >
            <div className="text-2xl font-bold">{tower.name}</div>
            <div className="text-base" style={{ color: 'var(--ink-light)' }}>{tower.topic}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>
              {tower.floors} patra · {tower.roomsPerFloor} místnosti/patro
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="sketch-btn flex-1 text-lg" onClick={onBack}>← Zpět</button>
        <button
          className="sketch-btn sketch-btn-primary flex-2 text-lg px-6"
          style={{ opacity: selected ? 1 : 0.4, flex: 2 }}
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          Pokračovat →
        </button>
      </div>
    </div>
  );
};

