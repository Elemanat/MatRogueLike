import React from 'react';
import type {GameSettings} from '../types/game';

interface Props {
    settings: GameSettings;
    onChange: (settings: Partial<GameSettings>) => void;
    onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({settings, onChange, onBack}) => (
    <div className="flex flex-col h-full px-4 py-6 gap-4">
        <h2 className="text-3xl font-bold text-center text-(--ink)">Nastavení</h2>

        <div className="flex flex-col gap-4 flex-1">
            {/* Zvuk */}
            <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
                <span className="text-xl">🔊 Zvuk</span>
                <button
                    className="sketch-btn text-base py-1 px-3"
                    onClick={() => onChange({soundEnabled: !settings.soundEnabled})}
                >
                    {settings.soundEnabled ? 'Zapnuto' : 'Vypnuto'}
                </button>
            </div>

            {/* Čas */}
            <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
                <span className="text-xl">⏳ Čas na příklad</span>
                <select
                    className="sketch-box-light p-1 text-base cursor-pointer bg-(--paper)"
                    value={settings.roundTimeSeconds}
                    onChange={e => onChange({roundTimeSeconds: Number(e.target.value)})}
                >
                    {[15, 20, 30, 45, 60].map(v => (
                        <option key={v} value={v}>{v} s</option>
                    ))}
                </select>
            </div>

            {/* Animace */}
            <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
                <span className="text-xl">🎞️ Omezené animace</span>
                <button
                    className="sketch-btn text-base py-1 px-3"
                    onClick={() => onChange({reducedMotion: !settings.reducedMotion})}
                >
                    {settings.reducedMotion ? 'Ano' : 'Ne'}
                </button>
            </div>
        </div>

        <button className="sketch-btn text-xl py-2 w-full" onClick={onBack}>
            ← Zpět do menu
        </button>
    </div>
);