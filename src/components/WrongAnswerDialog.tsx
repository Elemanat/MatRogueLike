import React from 'react';

interface Props {
    prompt: string;
    yourAnswer: string;
    correctAnswers: string[];
    onContinue: () => void;
}

export const WrongAnswerDialog: React.FC<Props> = ({
                                                       prompt,
                                                       yourAnswer,
                                                       correctAnswers,
                                                       onContinue
                                                   }) => {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(44,44,62,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40,
        }}>
            {/* ZMĚNA ZDE: Zvětšena padding, gap a šířka. Na PC (md:) je širší. */}
            <div className="sketch-box px-8 py-8 md:px-10 md:py-10 flex flex-col items-center gap-6 mx-4 w-[90%] max-w-[380px] md:max-w-[550px] shake">

                {/* ZMĚNA ZDE: Zvětšeno emoji */}
                <p className="text-6xl md:text-7xl">❌</p>

                {/* ZMĚNA ZDE: Zvětšen nadpis */}
                <p className="text-3xl md:text-4xl font-bold text-center" style={{color: 'var(--red)'}}>
                    Špatná odpověď!
                </p>

                {/* ZMĚNA ZDE: Zvětšen základní text v detailech */}
                <div className="w-full text-left text-base md:text-lg" style={{color: 'var(--ink-light)'}}>

                    <p className="mb-3"><strong>Příklad:</strong></p>
                    {/* ZMĚNA ZDE: Příklad je teď pořádně velký */}
                    <p className="text-2xl md:text-3xl font-bold text-center mb-5 leading-tight" style={{color: 'var(--ink)'}}>
                        {prompt}
                    </p>

                    <p className="mb-2"><strong>Tvoje odpověď:</strong></p>
                    {/* ZMĚNA ZDE: Zvětšeny odpovědi */}
                    <p className="text-xl md:text-2xl text-center mb-5" style={{color: 'var(--red)'}}>
                        {yourAnswer ? yourAnswer : '(vypršel čas)'}
                    </p>

                    <p className="mb-2"><strong>Správná odpověď:</strong></p>
                    <p className="text-xl md:text-2xl text-center" style={{color: 'var(--green)'}}>
                        {correctAnswers.join(' nebo ')}
                    </p>
                </div>

                {/* ZMĚNA ZDE: Zvětšen text o srdci */}
                <p className="text-xl md:text-2xl text-center font-bold" style={{color: 'var(--ink)'}}>
                    ❤️ Ztratil jsi jedno srdce
                </p>

                {/* ZMĚNA ZDE: Zvětšeno tlačítko */}
                <button
                    className="sketch-btn sketch-btn-primary w-full text-xl md:text-2xl py-3 md:py-4 mt-2"
                    onClick={onContinue}
                >
                    Pokračovat →
                </button>
            </div>
        </div>
    );
};