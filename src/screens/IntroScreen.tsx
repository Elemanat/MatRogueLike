import React from 'react';
import type { Tower } from '../types/game';

const WIZARD_LINES = [
  'Vítej, statečný dobrodruhu! Před tebou stojí mocná věž plná matematických záhad.',
  'Nepřátelé ti budou klást příklady. Správnou odpovědí jim zasadíš ránu — špatnou odpovědí přijdeš o srdce.',
  'V truhlách najdeš mocné předměty: lektvary, záměny příkladů, nebo i dalekohled pro nakouknutí do dalších místností.',
  'Na konci každého patra číhá silný miniboss — potřebuješ ho porazit třikrát! A na vrcholu věže tě čeká sám Boss…',
  'Hodně štěstí! Věž se sama nedobude. 🧙',
];

interface Props {
  tower: Tower;
  onContinue: () => void;
}

export const IntroScreen: React.FC<Props> = ({ tower, onContinue }) => {
  const [lineIdx, setLineIdx] = React.useState(0);

  const next = () => {
    if (lineIdx < WIZARD_LINES.length - 1) setLineIdx(l => l + 1);
    else onContinue();
  };

  return (
    <div className="flex flex-col h-full px-4 py-6 gap-4 justify-between">
      <div>
        <h2 className="text-3xl font-bold text-center mb-1" style={{ color: 'var(--ink)' }}>
          {tower.name}
        </h2>
        <p className="text-center text-sm" style={{ color: 'var(--ink-light)' }}>{tower.topic}</p>
      </div>

      {/* Čaroděj */}
      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        {/* Placeholder postava */}
        <div
          className="sketch-box flex items-center justify-center text-6xl"
          style={{ width: 90, height: 90, borderRadius: '50%' }}
        >
          🧙
        </div>

        {/* Bublina */}
        <div className="wizard-bubble w-full">
          <p className="text-lg" style={{ color: 'var(--ink)' }}>
            {WIZARD_LINES[lineIdx]}
          </p>
        </div>

        {/* Indikátor řádků */}
        <div className="flex gap-1 mt-6">
          {WIZARD_LINES.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                background: i === lineIdx ? 'var(--ink)' : 'var(--grid)',
                border: '1px solid var(--ink)',
              }}
            />
          ))}
        </div>
      </div>

      <button className="sketch-btn sketch-btn-primary text-xl py-2 w-full" onClick={next}>
        {lineIdx < WIZARD_LINES.length - 1 ? 'Dál →' : '⚔️ Do věže!'}
      </button>
    </div>
  );
};

