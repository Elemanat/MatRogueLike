import React from 'react';
import type {PlayerStats} from '../types/game';

interface Props {
    playerName: string;
    towerName: string;
    stats: PlayerStats;
    onMenu: () => void;
}

export const VictoryScreen: React.FC<Props> = ({playerName, towerName, stats, onMenu}) => (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
        <img
            src="/assets/icons/trophy_icon.png"
            alt="Vítěz"
            className="h-30 w-30 object-contain"
        />

        <h2 className="text-4xl font-bold text-center text-(--gold)">
            Vítěz!
        </h2>

        <p className="text-xl text-center text-(--ink)">
            {playerName} zdolal <strong>{towerName}</strong>!
        </p>

        <div className="sketch-box w-full px-4 py-3 flex flex-col gap-2 text-(--ink)">
            <p className="text-lg text-center font-semibold">Výsledky:</p>

            <div className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/icons/castle_icon.png"
                        alt="Patra"
                        className="h-8 w-8 object-contain"
                    />
                    <span>Patra</span>
                </div>
                <span>{stats.floorsCompleted}</span>
            </div>

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
                        alt="Špatně"
                        className="h-8 w-8 object-contain"
                    />
                    <span>Špatně</span>
                </div>
                <span>{stats.wrongAnswers}</span>
            </div>
        </div>

        <div className="w-full">
            <button
                className="w-full sketch-btn sketch-btn-danger text-xl py-2 flex items-center justify-center gap-3"
                onClick={onMenu}
            >
                <img
                    src="/assets/icons/door_icon.png"
                    alt="Logout"
                    className="h-8 w-8 object-contain"
                />
                Zpět
            </button>
        </div>
    </div>
);