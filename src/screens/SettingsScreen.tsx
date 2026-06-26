import React, {useState} from 'react';
import type {GameSettings} from '../types/game';
import {WizardTutorialScreen} from './WizardTutorialScreen';

interface Props {
    settings: GameSettings;
    onChange: (settings: Partial<GameSettings>) => void;
    onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({
                                                    settings,
                                                    onChange,
                                                    onBack,
                                                }) => {
    const [showContact, setShowContact] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);

    const [showTutorial, setShowTutorial] = useState(false);

    if (showTutorial) {
        return (
            <WizardTutorialScreen
                onFinish={() => setShowTutorial(false)} // Po dokončení ho to vrátí zpět do nastavení
            />
        );
    }

    return (
        <div className="flex flex-col h-full px-4 py-6 gap-4 w-full relative">
            <h2 className="text-3xl font-bold text-center text-(--ink)">Nastavení</h2>

            <div className="flex flex-col gap-4 flex-1">
                <div className="sketch-box-light px-4 py-3 flex justify-between items-center">
                    <span className="text-xl md:text-2xl flex items-center gap-3">
                        <img
                            src="/assets/icons/hourglass_icon.png"
                            alt="Hourglass"
                            className="h-8 w-8 object-contain"
                        />
                        Čas na příklad
                    </span>
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

                <div className="sketch-box-light px-4 py-3 flex justify-between items-center gap-2">
                    <span className="text-xl md:text-2xl flex items-center gap-3">
                        <img
                            src="/assets/icons/letter_icon.png"
                            alt="Dopis"
                            className="h-10 w-10 object-contain"
                        />
                        Máš nápad nebo problém?
                    </span>
                    <div className="flex gap-2">
                        <button
                            className="sketch-btn text-base md:text-xl py-1 px-4 text-center cursor-pointer"
                            onClick={() => setShowContact(true)}
                        >
                            Kontakt
                        </button>
                        <button
                            className="sketch-btn text-base md:text-xl py-1 px-4 text-center cursor-pointer"
                            onClick={() => setShowSurvey(true)}
                        >
                            Dotazník
                        </button>
                    </div>
                </div>

                <div className="sketch-box-light px-4 py-3 flex justify-between items-center gap-2">
                    <span className="text-xl md:text-2xl flex items-center gap-3">
                        <img
                            src="/assets/wizard.png"
                            alt="Čaroděj"
                            className="h-10 w-10 object-contain"
                        />
                        Tutoriál
                    </span>
                    <button
                        className="sketch-btn text-base md:text-xl py-1 px-4 text-center cursor-pointer"
                        onClick={() => setShowTutorial(true)}
                    >
                        Základní výcvik
                    </button>
                </div>
            </div>

            <button
                className="sketch-btn sketch-btn-danger text-xl py-2 w-full flex items-center justify-center gap-3 mt-auto"
                onClick={onBack}
            >
                <img
                    src="/assets/icons/door_icon.png"
                    alt="Logout"
                    className="h-8 w-8 object-contain"
                />
                Zpět do menu
            </button>

            {showContact && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(44,44,62,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
                }}>
                    <div
                        className="sketch-box px-8 py-8 md:px-10 md:py-10 flex flex-col items-center gap-6 mx-4 w-[90%] max-w-100 md:max-w-125">
                        <p className="text-5xl md:text-6xl">
                            <img
                                src="/assets/icons/letter_icon.png"
                                alt="Dopis"
                                className="h-30 w-30 object-contain"
                            />
                        </p>
                        <h3 className="text-3xl md:text-4xl font-bold text-center text-(--ink)">Napiš mi!</h3>

                        <p className="text-base md:text-xl text-center text-(--ink-light)">
                            Pokud máš nějaký nápad na vylepšení, našel jsi chybu nebo mi chceš jen něco vzkázat, ozvi se
                            mi na e-mail:
                        </p>

                        <div
                            className="w-full text-center py-4 bg-[#fffbe6] border-2 border-(--ink-light) border-dashed rounded-[4px_8px_6px_5px/6px_4px_8px_5px]">
                            <p className="text-xl md:text-2xl font-bold text-(--ink) select-all">
                                konirp@students.zcu.cz
                            </p>
                        </div>

                        <button
                            className="sketch-btn sketch-btn-danger w-full text-xl py-2 flex items-center justify-center gap-3"
                            onClick={() => setShowContact(false)}
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
            )}

            {showSurvey && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(44,44,62,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
                }}>
                    <div
                        className="sketch-box px-8 py-8 md:px-10 md:py-10 flex flex-col items-center gap-6 mx-4 w-[90%] max-w-100 md:max-w-125">
                        <p className="text-5xl md:text-6xl">
                            <img
                                src="/assets/icons/clipboard_icon.png"
                                alt="Dotazník"
                                className="h-30 w-30 object-contain"
                            />
                        </p>
                        <h3 className="text-3xl md:text-4xl font-bold text-center text-(--ink)">Dotazník</h3>

                        <p className="text-base md:text-xl text-center text-(--ink-light)">
                            Tvůj názor je pro nás velmi důležitý! Pomož nám vylepšit hru tím, že vyplníš náš krátký
                            dotazník.
                        </p>

                        <button
                            className="sketch-btn sketch-btn-primary w-full text-xl py-2 flex items-center justify-center gap-3 disabled:opacity-40 transition-opacity"
                            onClick={() => window.open('https://forms.gle/uEiGhANTiNeBV5cc7', '_blank')}
                        >
                            Otevřít dotazník
                            <img
                                src="/assets/icons/gate_icon.png"
                                alt="Vstup"
                                className="h-8 w-8 object-contain"
                            />
                        </button>

                        <button
                            className="sketch-btn sketch-btn-danger w-full text-xl py-2 flex items-center justify-center gap-3"
                            onClick={() => setShowSurvey(false)}
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
            )}
        </div>
    );
};