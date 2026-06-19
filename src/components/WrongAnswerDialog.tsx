import React from 'react';
import {TextWithFractions} from './TextWithFractions';

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
            <div
                className="sketch-box px-8 py-8 md:px-10 md:py-10 flex flex-col items-center gap-6 mx-4 w-[90%] max-w-95 md:max-w-137.5 shake">

                <img
                    src={'/assets/icons/cross_icon.png'}
                    alt={'Špatná odpověď'}
                    className="h-30 w-30 object-contain"
                />

                <p className="text-3xl md:text-4xl font-bold text-center" style={{color: 'var(--red)'}}>
                    Špatná odpověď!
                </p>

                <div className="w-full text-left text-base md:text-lg" style={{color: 'var(--ink-light)'}}>

                    <p className="mb-3"><strong>Příklad:</strong></p>
                    <p className="text-2xl md:text-3xl font-bold text-center mb-5 leading-tight math-num"
                       style={{color: 'var(--ink)'}}>
                        <TextWithFractions text={prompt}/>
                    </p>

                    <p className="mb-2"><strong>Tvoje odpověď:</strong></p>
                    <p className="text-xl md:text-2xl text-center mb-5 math-num" style={{color: 'var(--red)'}}>
                        {yourAnswer ? <TextWithFractions text={yourAnswer}/> : '(vypršel čas)'}
                    </p>

                    <p className="mb-2"><strong>Správná odpověď:</strong></p>
                    <p className="text-xl md:text-2xl text-center math-num" style={{color: 'var(--green)'}}>
                        <TextWithFractions text={correctAnswers.join(' nebo ')}/>
                    </p>
                </div>

                <p className="text-xl md:text-2xl text-center font-bold" style={{color: 'var(--ink)'}}>
                    ❤️ Ztratil jsi jedno srdce
                </p>

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