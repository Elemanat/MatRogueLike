import React, {useState} from 'react';
import type {Item} from '../types/game';

const WIZARD_COMMENTS = [
    'Tady nic není… jen ticho a prach.',
    'Místnost je prázdná. Aspoň si oddychneš!',
    'Žádný nepřítel? Podezřelé… ale klidně si projdi dál.',
    'Fúú, prázdno. Věž tě šetří na horší chvíle!',
];

interface Props {
    rewardItem?: Item | null;
    onRest: () => void;
    onScavenge: () => void;
    onTakeReward?: () => void;
}

export const EmptyRoomScreen: React.FC<Props> = ({rewardItem, onRest, onScavenge, onTakeReward}) => {
    const [comment] = useState(
        () => WIZARD_COMMENTS[Math.floor(Math.random() * WIZARD_COMMENTS.length)]
    );
    const [scavenged, setScavenged] = useState(false);

    // Funkce, která po kliknutí zakáže tlačítko a zavolá logiku o patro výš
    const handleScavenge = () => {
        setScavenged(true);
        onScavenge();
    };

    return (
        <div className="flex flex-col h-full px-4 py-6 gap-6 justify-between relative">

            {/* Modal pro nalezený předmět (zobrazí se jen když dostaneme rewardItem) */}
            {rewardItem && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(44,44,62,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
                }}>
                    <div className="sketch-box px-6 py-8 flex flex-col items-center gap-4 mx-4 bg-[var(--paper)]">
                        <h3 className="text-3xl font-bold text-center" style={{color: 'var(--gold)'}}>Gratuluji!</h3>
                        <p className="text-lg text-center" style={{color: 'var(--ink)'}}>Při prohledávání prachu jsi našel předmět:</p>

                        <div className="text-6xl my-2 drop-shadow-md">{rewardItem.icon}</div>
                        <p className="text-2xl font-bold text-center" style={{color: 'var(--ink)'}}>{rewardItem.name}</p>
                        <p className="text-sm text-center italic" style={{color: 'var(--ink-light)'}}>{rewardItem.description}</p>

                        <button className="sketch-btn sketch-btn-primary text-xl px-8 py-2 mt-4" onClick={onTakeReward}>
                            Vzít a pokračovat
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold text-center" style={{color: 'var(--ink)'}}>Táborák</h2>

            <div className="flex flex-col items-center gap-8 flex-1 justify-center">
                {/* Placeholder ohniste/tabora */}
                <div className="sketch-box flex items-center justify-center text-6xl"
                     style={{width: '5.5rem', height: '5.5rem', borderRadius: '50%'}}>
                    🔥
                </div>

                {/* Bublina s využitím náhodného komentáře */}
                <div className="wizard-bubble w-full">
                    <p className="text-lg text-center" style={{color: 'var(--ink)'}}>
                        {comment} <br/><br/> Co chceš udělat jako další?
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button className="sketch-btn sketch-btn-primary text-xl py-2 w-full" onClick={onRest} disabled={!!rewardItem}>
                    Odpočinout si (+1 HP)
                </button>
                <button
                    className="sketch-btn text-xl py-2 w-full"
                    onClick={handleScavenge}
                    disabled={scavenged || !!rewardItem}
                >
                    Prohledat místnost (Šance na předmět)
                </button>
            </div>
        </div>
    );
};