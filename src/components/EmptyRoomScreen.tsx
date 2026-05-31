import React, { useState } from 'react';

const WIZARD_COMMENTS = [
  'Tady nic není… jen ticho a prach.',
  'Místnost je prázdná. Aspoň si oddychneš!',
  'Žádný nepřítel? Podezřelé… ale klidně si projdi dál.',
  'Fúú, prázdno. Věž tě šetří na horší chvíle!',
];

interface Props {
  onRest: () => void;
  onScavenge: () => void;
}

export const EmptyRoomScreen: React.FC<Props> = ({ onRest, onScavenge }) => {
  const [comment] = useState(
    () => WIZARD_COMMENTS[Math.floor(Math.random() * WIZARD_COMMENTS.length)]
  );
  const [scavenged, setScavenged] = useState(false);

  return (
    <div className="flex flex-col h-full px-4 py-6 gap-6 justify-between">
      <h2 className="text-2xl font-bold text-center" style={{ color: 'var(--ink)' }}>Táborák</h2>

      <div className="flex flex-col items-center gap-8 flex-1 justify-center">
        {/* Placeholder ohniste/tabora */}
        <div className="sketch-box flex items-center justify-center text-6xl"
          style={{ width: '5.5rem', height: '5.5rem', borderRadius: '50%' }}>
          
        </div>

        {/* Bublina */}
        <div className="wizard-bubble w-full">
          <p className="text-lg" style={{ color: 'var(--ink)' }}>
            Nalezl jsi bezpečné místo. Co chceš udělat jako další?
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button className="sketch-btn sketch-btn-primary text-xl py-2 w-full" onClick={onRest}>
          Odpočinout si (+1 HP)
        </button>
        <button 
          className="sketch-btn text-xl py-2 w-full" 
          onClick={onScavenge}
          disabled={scavenged}
        >
          Prohledat místnost (Šance na předmět)
        </button>
      </div>
    </div>
  );
};
