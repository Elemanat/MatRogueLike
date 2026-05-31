import React, { useState } from 'react';
import type { Tower } from '../types/game';

const WIZARD_FLOOR_LINES = [
  'Výborně! Zdolal jsi toto patro. Miniboss leží v prachu!',
  'Nečekal jsem, že to zvládneš tak rychle… ale pokračuj!',
  'Patro dobito! Ale výš tě čekají silnější nepřátelé.',
  'Skvělá práce! Věž se třese pod tvými kroky hrdiny.',
];

interface Props {
  tower: Tower;
  floor: number;
  onContinue: () => void;
}

export const FloorCompleteScreen: React.FC<Props> = ({ tower, floor, onContinue }) => {
  const [line] = useState(() =>
    WIZARD_FLOOR_LINES[Math.floor(Math.random() * WIZARD_FLOOR_LINES.length)]
  );

  const isLastFloor = floor >= tower.floors;

  return (
    <div className="flex flex-col h-full px-4 py-6 gap-6 justify-between">
      <div className="text-center">
        <div className="text-4xl mb-2">🏅</div>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--gold)' }}>
          Patro {floor} dokončeno!
        </h2>
        <p className="text-base mt-1" style={{ color: 'var(--ink-light)' }}>
          {isLastFloor ? 'Poslední patro před bossem!' : `Postupuješ do patra ${floor + 1}/${tower.floors}`}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        <div
          className="sketch-box flex items-center justify-center text-6xl"
          style={{ width: '5.5rem', height: '5.5rem', borderRadius: '50%' }}
        >
          🧙
        </div>
        <div className="wizard-bubble w-full">
          <p className="text-lg" style={{ color: 'var(--ink)' }}>{line}</p>
        </div>
      </div>

      <button className="sketch-btn sketch-btn-primary text-xl py-2 w-full" onClick={onContinue}>
        {isLastFloor ? '⚠️ Na bosse!' : `Patro ${floor + 1} →`}
      </button>
    </div>
  );
};

