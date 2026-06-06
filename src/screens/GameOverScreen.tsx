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
        <div className="text-5xl">💀</div>
        <h2 className="text-4xl font-bold text-center" style={{color: 'var(--red)'}}>Konec runu</h2>
        <p className="text-xl text-center" style={{color: 'var(--ink)'}}>
            {playerName}, tvůj run skončil v patře {floor}.
        </p>

        <div className="sketch-box w-full px-4 py-3 flex flex-col gap-2">
            <p className="text-lg text-center font-semibold" style={{color: 'var(--ink)'}}>Shrnutí runu:</p>
            <div className="flex justify-between text-lg"><span>⚔️ Nepřátelé</span><span>{stats.enemiesDefeated}</span>
            </div>
            <div className="flex justify-between text-lg"><span>✅ Správně</span><span>{stats.correctAnswers}</span>
            </div>
            <div className="flex justify-between text-lg"><span>❌ Špatně</span><span>{stats.wrongAnswers}</span></div>
        </div>

        <p className="text-base text-center" style={{color: 'var(--ink-light)'}}>
            Nevzdávej to — věž stále čeká!
        </p>

        <div className="flex flex-col gap-3 w-full">
            <button className="sketch-btn sketch-btn-primary w-full text-2xl py-2" onClick={onReturnToIntro}>
                🔄 Zkusit znovu
            </button>
            <button className="sketch-btn w-full text-xl py-2" onClick={onMenu}>
                ← Zpět do menu
            </button>
        </div>
    </div>
);


