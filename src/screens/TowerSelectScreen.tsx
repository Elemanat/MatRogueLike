import React, {useState} from 'react';
import {TOWERS} from '../services/gameCatalog';
import type {Tower} from '../types/game';

interface Props {
    onSelect: (tower: Tower) => void;
    onBack: () => void;
}

export const TowerSelectScreen: React.FC<Props> = ({onSelect, onBack}) => {
    const [selected, setSelected] = useState<Tower | null>(null);

    return (
        <div className="flex flex-col h-full px-4 py-4 gap-4">
            <h2 className="text-3xl font-bold text-center text-(--ink)">Výběr věže</h2>
            <p className="text-center text-base text-(--ink-light)">
                Vyber téma, které chceš dobýt:
            </p>

            <div className="flex flex-col gap-3 flex-1">
                {TOWERS.map(tower => {
                    const isSelected = selected?.id === tower.id;

                    return (
                        <button
                            key={tower.id}
                            className={`sketch-box text-left px-4 py-3 cursor-pointer transition-all border-2 ${
                                isSelected
                                    ? 'border-(--gold) shadow-[0.2rem_0.2rem_0_var(--gold)] bg-[#fffbe6]'
                                    : 'border-(--ink) shadow-[0.2rem_0.2rem_0_var(--ink)] bg-(--paper)'
                            }`}
                            onClick={() => setSelected(tower)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="text-2xl font-bold text-(--ink)">{tower.name}</div>
                                {isSelected && <span className="text-3xl">✓</span>}
                            </div>
                            <div className="text-base text-(--ink-light)">{tower.topic}</div>
                            <div className="text-sm mt-1 text-(--ink-light)">
                                {tower.floors} patra · {tower.roomsPerFloor} místnosti/patro
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button className="sketch-btn flex-1 text-lg" onClick={onBack}>← Zpět</button>
                <button
                    className="sketch-btn sketch-btn-primary flex-2 text-lg px-6 disabled:opacity-40 transition-opacity"
                    disabled={!selected}
                    onClick={() => selected && onSelect(selected)}
                >
                    Pokračovat →
                </button>
            </div>
        </div>
    );
};