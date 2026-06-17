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
        <div className="flex flex-col h-full px-4 py-4 gap-4 w-full">
            <div>
                <h2 className="text-3xl font-bold text-center text-(--ink)">Výběr věže</h2>
                <p className="text-center text-base text-(--ink-light) mt-1">
                    Vyber téma, které chceš dobýt:
                </p>
            </div>

            <div
                className="flex flex-col md:flex-row gap-5 flex-1 min-h-0 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto pb-4 px-1 items-stretch w-full">
                {TOWERS.map(tower => {
                    const isSelected = selected?.id === tower.id;

                    return (
                        <button
                            key={tower.id}
                            className={`sketch-box relative flex flex-col justify-between items-center px-4 py-6 cursor-pointer transition-all border-2 flex-none w-full min-h-[200px] md:min-h-0 md:h-full md:flex-1 md:w-auto md:min-w-[220px] bg-cover bg-bottom text-center ${
                                isSelected
                                    ? 'border-(--gold) shadow-[0.3rem_0.3rem_0_var(--gold)] ring-4 ring-(--gold) ring-opacity-50'
                                    : 'border-(--ink) shadow-[0.2rem_0.2rem_0_var(--ink)]'
                            }`}
                            style={{
                                backgroundImage: `linear-gradient(to bottom, rgba(253,251,244,0.95) 0%, rgba(253,251,244,0.8) 40%, rgba(253,251,244,0.9) 100%), url('https://www.transparenttextures.com/patterns/brick-wall.png')`,
                                backgroundColor: 'var(--paper)'
                            }}
                            onClick={() => setSelected(tower)}
                        >
                            <div className="flex flex-col items-center w-full">
                                {isSelected && (
                                    <div className="absolute top-2 right-3 text-3xl text-(--gold) font-bold">✓</div>
                                )}
                                <div className="text-2xl font-bold text-(--ink) mt-4 mb-2 leading-tight">
                                    {tower.name}
                                </div>
                                <div className="text-sm font-medium text-(--ink-light) italic">
                                    {tower.topic}
                                </div>
                            </div>

                            <div
                                className="mt-auto pt-4 border-t border-(--ink-light) border-dashed w-full text-sm font-bold text-(--ink-light)">
                                <div>{tower.floors} pater každé s {tower.roomsPerFloor} místnosti</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-3 pt-2 shrink-0 w-full">
                <button
                    className="sketch-btn sketch-btn-danger text-xl py-2 flex-1 flex items-center justify-center gap-3"
                    onClick={onBack}
                >
                    <img
                        src="/assets/icons/door_icon.png"
                        alt="Logout"
                        className="h-8 w-8 object-contain"
                    />
                    Zpět
                </button>

                <button
                    className="sketch-btn sketch-btn-primary text-xl py-2 flex-1 flex items-center justify-center gap-3 px-6 disabled:opacity-40 transition-opacity"
                    disabled={!selected}
                    onClick={() => selected && onSelect(selected)}
                >
                    Pokračovat
                    <img
                        src="/assets/icons/gate_icon.png"
                        alt="Pokračovat"
                        className="h-8 w-8 object-contain"
                    />
                </button>
            </div>
        </div>
    );
};