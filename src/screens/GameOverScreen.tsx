import React from 'react';
import type {PlayerStats} from '../types/game';

interface Props {
    playerName: string;
    floor: number;
    stats: PlayerStats;
    onReturnToIntro: () => void;
    onMenu: () => void;
}

export const GameOverScreen: React.FC<Props> = ({playerName, floor, stats, onReturnToIntro, onMenu}) => (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
        <img
            src="/assets/icons/skull_icon.png"
            alt="Konec hry"
            className="h-16 w-16 object-contain"
        />
        <h2 className="text-4xl font-bold text-center" style={{color: 'var(--red)'}}>Konec runu</h2>
        <p className="text-xl text-center" style={{color: 'var(--ink)'}}>
            {playerName}, tvůj run skončil v patře {floor}.
        </p>

        <div className="sketch-box w-full px-4 py-3 flex flex-col gap-2">
            <p className="text-lg text-center font-semibold" style={{color: 'var(--ink)'}}>Shrnutí runu:</p>

            <div className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/icons/swords_icon.png"
                        alt="Nepřátelé"
                        className="h-8 w-8 object-contain"
                    />
                    <span>Nepřátelé</span>
                </div>
                <span>{stats.enemiesDefeated}</span>
            </div>

            <div className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/icons/fajvka_icon.png"
                        alt="Správně"
                        className="h-8 w-8 object-contain"
                    />
                    <span>Správně</span>
                </div>
                <span>{stats.correctAnswers}</span>
            </div>

            <div className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/icons/cross_icon.png"
                        alt="Špatná odpověď"
                        className="h-8 w-8 object-contain"
                    />
                    <span>Špatně</span>
                </div>
                <span>{stats.wrongAnswers}</span>
            </div>
        </div>

        <p className="text-base text-center" style={{color: 'var(--ink-light)'}}>
            Nevzdávej to — věž stále čeká!
        </p>

        <div className="flex flex-col gap-3 w-full">
            <button
                className="sketch-btn sketch-btn-primary w-full text-2xl py-2 flex items-center justify-center gap-3"
                onClick={onReturnToIntro}
            >
                <img
                    src="/assets/icons/exchang_icon.png"
                    alt="Zkusit znovu"
                    className="h-8 w-8 object-contain"
                />
                Zkusit znovu
            </button>
            <button
                className="sketch-btn sketch-btn-danger w-full text-xl py-2 flex items-center justify-center gap-3"
                onClick={onMenu}
            >
                <img
                    src="/assets/icons/door_icon.png"
                    alt="Zpět"
                    className="h-8 w-8 object-contain"
                />
                Zpět do menu
            </button>
        </div>
    </div>
);