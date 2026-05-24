import React, { useState } from 'react';

const WIZARD_COMMENTS = [
  'Tady nic není… jen ticho a prach.',
  'Místnost je prázdná. Aspoň si oddychneš!',
  'Žádný nepřítel? Podezřelé… ale klidně si projdi dál.',
  'Fúú, prázdno. Věž tě šetří na horší chvíle!',
];

interface Props {
  onContinue: () => void;
}

export const EmptyRoomScreen: React.FC<Props> = ({ onContinue }) => {
  const [comment] = useState(
    () => WIZARD_COMMENTS[Math.floor(Math.random() * WIZARD_COMMENTS.length)]
  );

  return (
    <div className="flex flex-col h-full px-4 py-6 gap-6 justify-between">
      <h2 className="text-2xl font-bold text-center" style={{ color: 'var(--ink)' }}>Prázdná místnost</h2>

      <div className="flex flex-col items-center gap-8 flex-1 justify-center">
        {/* Placeholder čaroděje */}
        <div className="sketch-box flex items-center justify-center text-6xl"
          style={{ width: 90, height: 90, borderRadius: '50%' }}>
          🧙
        </div>

        {/* Bublina */}
        <div className="wizard-bubble w-full">
          <p className="text-lg" style={{ color: 'var(--ink)' }}>{comment}</p>
        </div>
      </div>

      <button className="sketch-btn sketch-btn-primary text-xl py-2 w-full" onClick={onContinue}>
        Jít dál →
      </button>
    </div>
  );
};


