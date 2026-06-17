import React, {useState} from 'react';
import type {Tower} from '../types/game';

const WIZARD_LINES = [
    'Vítej, statečný dobrodruhu! Před tebou stojí mocná věž plná matematických záhad.',
    'Nepřátelé ti budou klást příklady. Správnou odpovědí jim zasadíš ránu — špatnou odpovědí přijdeš o srdce.',
    'V truhlách najdeš mocné předměty: lektvary, záměny příkladů, nebo i dalekohled pro nakouknutí do dalších místností.',
    'Ale pozor! Tyhle předměty ti zůstanou jenom teď ve věži, v dalším průchodu je nemáš.',
    'Na konci každého patra číhá silný miniboss — potřebuješ ho porazit třikrát! A na vrcholu věže tě čeká sám Boss…',
    'Hodně štěstí! Věž se sama nedobude. 🧙',
];

interface Props {
    tower: Tower;
    onContinue: () => void;
}

export const IntroScreen: React.FC<Props> = ({tower, onContinue}) => {
    const [lineIdx, setLineIdx] = useState(0);

    const next = () => {
        if (lineIdx < WIZARD_LINES.length - 1) setLineIdx(l => l + 1);
        else onContinue();
    };

    return (
        // ZMĚNA: Přidán overflow-y-auto jako pojistka a zmenšen vertikální padding (py-6 a md:py-6)
        <div
            className="flex flex-col h-full px-6 py-6 md:px-12 md:py-6 gap-4 w-full items-center justify-between overflow-y-auto">

            <div className="text-center w-full shrink-0">
                {/* ZMĚNA: Zmenšený nadpis a mezery pod ním */}
                <h2 className="text-3xl md:text-4xl font-bold mb-1 rpg-title">
                    {tower.name}
                </h2>
                <p className="text-base md:text-lg font-medium text-(--ink-light)">
                    {tower.topic}
                </p>
            </div>

            {/* ZMĚNA: Zmenšení mezer (gap) mezi prvky na PC */}
            <div className="flex flex-col items-center gap-4 md:gap-5 flex-1 justify-center w-full max-w-[700px]">

                {/* ZMĚNA: Menší avatar na PC (md:w-28 md:h-28 místo 36) */}
                <div
                    className="sketch-box flex items-center justify-center text-6xl md:text-7xl w-24 h-24 md:w-28 md:h-28 rounded-full shadow-[0.2rem_0.2rem_0_var(--ink)] md:shadow-[0.3rem_0.3rem_0_var(--ink)] shrink-0">
                    🧙
                </div>

                {/* ZMĚNA: Snížena minimální výška (md:min-h-[140px]) a trochu zmenšen text (md:text-2xl) */}
                <div
                    className="wizard-bubble w-full px-5 py-4 md:px-6 md:py-6 flex items-center justify-center min-h-[120px] md:min-h-[140px]">
                    <p className="text-lg md:text-2xl font-medium text-center leading-relaxed text-(--ink)">
                        {WIZARD_LINES[lineIdx]}
                    </p>
                </div>

                <div className="flex gap-2.5 mt-2 shrink-0">
                    {WIZARD_LINES.map((_, i) => (
                        <span
                            key={i}
                            className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full inline-block transition-colors duration-300"
                            style={{
                                background: i === lineIdx ? 'var(--ink)' : 'var(--grid)',
                                border: '0.125rem solid var(--ink)',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ZMĚNA: Zmenšené tlačítko */}
            <button
                className="sketch-btn sketch-btn-primary text-xl md:text-2xl py-3 w-full max-w-[400px] shrink-0 mt-2 transition-transform hover:-translate-y-1"
                onClick={next}
            >
                {lineIdx < WIZARD_LINES.length - 1 ? 'Dál →' : '⚔️ Do věže!'}
            </button>
        </div>
    );
};