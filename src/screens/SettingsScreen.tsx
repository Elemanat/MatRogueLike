import React, { useState } from 'react';
import type {GameSettings} from '../types/game';

interface Props {
    settings: GameSettings;
    onChange: (settings: Partial<GameSettings>) => void;
    onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({settings, onChange, onBack}) => {
    // Stav pro zobrazení kontaktního dialogu
    const [showContact, setShowContact] = useState(false);

    return (
        <div className="flex flex-col h-full px-4 py-6 gap-4 w-full relative">
            <h2 className="text-3xl font-bold text-center text-(--ink)">Nastavení</h2>

            <div className="flex flex-col gap-4 flex-1">
                {/* Čas */}
                <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
                    <span className="text-xl md:text-2xl">⏳ Čas na příklad</span>
                    <select
                        className="sketch-box-light p-1 text-base md:text-xl cursor-pointer bg-(--paper)"
                        value={settings.roundTimeSeconds}
                        onChange={e => onChange({roundTimeSeconds: Number(e.target.value)})}
                    >
                        {[15, 20, 30, 45, 60].map(v => (
                            <option key={v} value={v}>{v} s</option>
                        ))}
                    </select>
                </div>

                {/* Kontakt */}
                <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
                    <span className="text-xl md:text-2xl">📧 Máš nápad nebo problém?</span>
                    <button
                        className="sketch-btn text-base md:text-xl py-1 px-4 text-center cursor-pointer"
                        onClick={() => setShowContact(true)}
                    >
                        Kontakt
                    </button>
                </div>
            </div>

            <button className="sketch-btn text-xl md:text-2xl py-3 w-full shrink-0" onClick={onBack}>
                ← Zpět do menu
            </button>

            {/* Kontaktní Dialog */}
            {showContact && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(44,44,62,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
                }}>
                    <div className="sketch-box px-8 py-8 md:px-10 md:py-10 flex flex-col items-center gap-6 mx-4 w-[90%] max-w-[400px] md:max-w-[500px]">
                        <p className="text-5xl md:text-6xl">✉️</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-center text-(--ink)">Napiš mi!</h3>

                        <p className="text-base md:text-xl text-center text-(--ink-light)">
                            Pokud máš nějaký nápad na vylepšení, našel jsi chybu nebo mi chceš jen něco vzkázat, ozvi se mi na e-mail:
                        </p>

                        <div className="w-full text-center py-4 bg-[#fffbe6] border-2 border-(--ink-light) border-dashed rounded-[4px_8px_6px_5px/6px_4px_8px_5px]">
                            <p className="text-xl md:text-2xl font-bold text-(--ink) select-all">
                                konirp@students.zcu.cz
                            </p>
                        </div>

                        <button
                            className="sketch-btn w-full text-xl md:text-2xl py-3 mt-2"
                            onClick={() => setShowContact(false)}
                        >
                            Zavřít
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};