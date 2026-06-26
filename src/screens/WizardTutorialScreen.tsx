import React, { useState } from 'react';

interface Props {
    onFinish: () => void;
}

export const WizardTutorialScreen: React.FC<Props> = ({ onFinish }) => {
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        'Vítej ve VěžMatu, dobrodruhu! Jsem strážce zdejších věží a tvůj průvodce matematickým světem.',
        'Dovol mi ukázat, jak to tu chodí. V hlavním menu najdeš důležitá místa.',
        'V Nastavení si upravíš čas a vyplníš dotazník.',
        'Ve Statistikách sleduj své úspěchy a odznaky.',
        'A v části Hrát si vybereš svou věž s matematickým tématem.',
        'V dalším kroku získáš kód, který si pečlivě zapiš – budeš ho používat k přihlašování. Kdybys ho náhodou zapomněl, můžeš ho obnovit pomocí svého jména a vybraného zvířátka.',
        'Pamatuj, že tvou hlavní zbraní je správné počítání. Připraven?'
    ];

    const next = () => {
        if (step < tutorialSteps.length - 1) setStep(s => s + 1);
        else onFinish();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full px-4 py-2 md:py-4 w-full max-w-6xl mx-auto gap-4 md:gap-6 overflow-y-auto">

            <div className="text-center shrink-0">
                <h2 className="text-2xl md:text-4xl font-bold rpg-title mb-0">
                    Základní výcvik
                </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center w-full gap-4 md:gap-8 lg:gap-12">

                <div className="w-full md:w-2/5 flex justify-center shrink-0">
                    <img
                        src="/assets/wizard.png"
                        alt="Wizard"
                        className="max-w-full max-h-[35vh] md:max-h-[55vh] object-contain drop-shadow-xl"
                    />
                </div>

                <div className="w-full md:w-3/5 flex flex-col items-center gap-4">

                    <div className="sketch-box w-full max-w-lg px-6 py-6 flex items-center justify-center min-h-32.5 md:min-h-37.5" style={{ background: 'var(--paper)' }}>
                        <p className="text-base md:text-lg lg:text-xl font-medium text-center leading-relaxed text-(--ink)">
                            {tutorialSteps[step]}
                        </p>
                    </div>

                    <div className="flex gap-2 w-full max-w-lg justify-center mt-1 shrink-0">
                        {tutorialSteps.map((_, i) => (
                            <span
                                key={i}
                                className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full inline-block transition-colors duration-300"
                                style={{
                                    background: i === step ? 'var(--ink)' : 'var(--grid)',
                                    border: '0.125rem solid var(--ink)',
                                }}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full max-w-lg mt-2 shrink-0">
                        <div className="flex gap-4 w-full">
                            {step > 0 && (
                                <button
                                    className="sketch-btn sketch-btn-danger text-lg md:text-xl py-3 w-1/3 transition-transform hover:-translate-y-1"
                                    onClick={() => setStep(s => s - 1)}
                                >
                                    Zpět
                                </button>
                            )}
                            <button
                                className="sketch-btn sketch-btn-primary text-lg md:text-xl py-3 flex-1 transition-transform hover:-translate-y-1 flex items-center justify-center gap-3"
                                onClick={next}
                            >
                                {step < tutorialSteps.length - 1 ? 'Dál' : 'Dokončit'}
                                <img
                                    src={step < tutorialSteps.length - 1 ? '/assets/icons/gate_icon.png' : '/assets/icons/swords_icon.png'}
                                    alt={step < tutorialSteps.length - 1 ? 'Brána' : 'Meče'}
                                    className="h-7 w-7 md:h-8 md:w-8 object-contain"
                                />
                            </button>
                        </div>

                        {step < tutorialSteps.length - 1 && (
                            <button
                                onClick={onFinish}
                                className="text-sm md:text-base underline opacity-60 hover:opacity-100 transition-opacity text-(--ink) cursor-pointer mt-1"
                            >
                                Přeskočit tutoriál
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};