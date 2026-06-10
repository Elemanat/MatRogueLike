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
            <div className="sketch-box px-6 py-6 flex flex-col items-center gap-4 mx-4 w-full max-w-[280px]">
                <p className="text-4xl">❌</p>
                <p className="text-2xl font-bold text-center" style={{color: 'var(--red)'}}>Špatná odpověď!</p>

                <div className="w-full text-left text-sm" style={{color: 'var(--ink-light)'}}>
                    <p className="mb-2"><strong>Příklad:</strong></p>
                    <p className="text-base font-bold text-center mb-3" style={{color: 'var(--ink)'}}>
                        {prompt}
                    </p>

                    <p className="mb-1"><strong>Tvoje odpověď:</strong></p>
                    <p className="text-base text-center mb-3" style={{color: 'var(--red)'}}>
                        {yourAnswer ? yourAnswer : '(vypršel čas)'}
                    </p>

                    <p className="mb-1"><strong>Správná odpověď:</strong></p>
                    <p className="text-base text-center" style={{color: 'var(--green)'}}>
                        {correctAnswers.join(' nebo ')}
                    </p>
                </div>

                <p className="text-lg text-center font-bold" style={{color: 'var(--ink)'}}>
                    ❤️ Ztratil jsi jedno srdce
                </p>

                <button
                    className="sketch-btn sketch-btn-primary w-full text-lg py-2"
                    onClick={onContinue}
                >
                    Pokračovat →
                </button>
            </div>
        </div>
    );
};