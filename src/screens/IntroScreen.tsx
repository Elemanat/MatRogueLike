import React, {useState} from 'react';
import type {Tower} from '../types/game';

const WIZARD_LINES = [
    'Vítej, statečný dobrodruhu! Před tebou stojí mocná věž plná matematických záhad.',
    'Nepřátelé ti budou klást příklady. Správnou odpovědí jim zasadíš ránu — špatnou odpovědí přijdeš o srdce.',
    'V truhlách najdeš mocné předměty: lektvary, záměny příkladů, nebo i dalekohled pro nakouknutí do dalších místností.',
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
        <div className="flex flex-col h-full px-6 py-8 md:px-12 md:py-10 gap-6 w-full items-center justify-between">

            {/* Hlavička - přidáno shrink-0, aby si držela svou velikost */}
            <div className="text-center w-full shrink-0">
                <h2 className="text-4xl md:text-5xl font-bold mb-2 text-(--ink)">
                    {tower.name}
                </h2>
                <p className="text-lg md:text-xl font-medium text-(--ink-light)">
                    {tower.topic}
                </p>
            </div>

            {/* Čaroděj a bublina */}
            <div className="flex flex-col items-center gap-6 md:gap-8 flex-1 justify-center w-full max-w-[700px]">

                {/* Placeholder postava */}
                <div className="sketch-box flex items-center justify-center text-7xl md:text-8xl w-28 h-28 md:w-36 md:h-36 rounded-full shadow-[0.2rem_0.2rem_0_var(--ink)] md:shadow-[0.3rem_0.3rem_0_var(--ink)] shrink-0">
                    🧙
                </div>

                {/* ZMĚNA: Bublina dostala min-h-[160px] md:min-h-[220px] a flex s items-center pro vertikální vycentrování textu */}
                <div className="wizard-bubble w-full px-6 py-5 md:px-8 md:py-8 flex items-center justify-center min-h-[160px] md:min-h-[220px]">
                    <p className="text-xl md:text-3xl font-medium text-center leading-relaxed text-(--ink)">
                        {WIZARD_LINES[lineIdx]}
                    </p>
                </div>

                {/* Indikátor řádků */}
                <div className="flex gap-2.5 md:gap-3 mt-2 md:mt-4 shrink-0">
                    {WIZARD_LINES.map((_, i) => (
                        <span
                            key={i}
                            className="w-3 h-3 md:w-4 md:h-4 rounded-full inline-block transition-colors duration-300"
                            style={{
                                background: i === lineIdx ? 'var(--ink)' : 'var(--grid)',
                                border: '0.125rem solid var(--ink)',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Tlačítko */}
            <button
                className="sketch-btn sketch-btn-primary text-2xl md:text-3xl py-3 md:py-4 w-full max-w-[400px] shrink-0 mt-4 transition-transform hover:-translate-y-1"
                onClick={next}
            >
                {lineIdx < WIZARD_LINES.length - 1 ? 'Dál →' : '⚔️ Do věže!'}
            </button>
        </div>
    );
};