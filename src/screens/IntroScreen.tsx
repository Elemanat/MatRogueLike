import React, {useState, useEffect} from 'react';
import type {Tower} from '../types/game';
import {apiClient} from '../services/api';

interface Props {
    tower: Tower;
    playerName: string;
    onContinue: () => void;
}

export const IntroScreen: React.FC<Props> = ({tower, playerName, onContinue}) => {
    const [lineIdx, setLineIdx] = useState(0);
    const [isFirstTimePlay, setIsFirstTimePlay] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        apiClient.players.getStats(playerName)
            .then(stats => {
                if (mounted) {
                    const hasPlayedThisTower = stats.byTopic && stats.byTopic[tower.id] !== undefined;
                    setIsFirstTimePlay(!hasPlayedThisTower);
                    setIsLoading(false);
                }
            })
            .catch(err => {
                console.error('Nepodařilo se načíst statistiky pro intro:', err);
                if (mounted) {
                    setIsFirstTimePlay(true);
                    setIsLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [playerName, tower.id]);

    const wizardLines = isFirstTimePlay
        ? [
            'Vítej, statečný dobrodruhu! Před tebou stojí mocná věž plná matematických záhad.',
            'Nepřátelé ti budou klást příklady. Správnou odpovědí jim zasadíš ránu — špatnou odpovědí přijdeš o srdce.',
            'V truhlách najdeš mocné předměty: lektvary, záměny příkladů, nebo i dalekohled pro nakouknutí do dalších místností.',
            'Ale pozor! Tyhle předměty ti zůstanou jenom teď ve věži, v dalším průchodu je nemáš.',
            'Na konci každého patra číhá silný miniboss — potřebuješ ho porazit třikrát! A na vrcholu věže tě čeká sám Boss…',
            'Hodně štěstí! Věž se sama nedobude.',
        ]
        : [
            `Vítej zpět! Před tebou se tyčí ${tower.name}.`,
            `Dnes se zaměříme na: ${tower.topic}. Nezapomeň na své dřívější chyby a ukaž, co v tobě je!`,
            'Připrav se, vstupujeme...'
        ];

    const next = () => {
        if (lineIdx < wizardLines.length - 1) setLineIdx(l => l + 1);
        else onContinue();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <p className="text-xl font-medium" style={{color: 'var(--ink)'}}>
                    Rozhlížím se po věži...
                </p>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col h-full px-6 py-6 md:px-12 md:py-6 gap-4 w-full items-center justify-between overflow-y-auto">

            <div className="text-center w-full shrink-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-1 rpg-title">
                    {tower.name}
                </h2>
                <p className="text-base md:text-lg font-medium" style={{color: 'var(--ink-light)'}}>
                    {tower.topic}
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 md:gap-5 flex-1 justify-center w-full max-w-2xl">
                <div
                    className="sketch-box flex items-center justify-center w-40 h-40 md:w-48 md:h-48 rounded-full shadow-[0.2rem_0.2rem_0_var(--ink)] md:shadow-[0.3rem_0.3rem_0_var(--ink)] shrink-0"
                    style={{background: 'var(--paper-dark)'}}>
                    <img
                        src="/assets/body_wizard.png"
                        alt="Wizard"
                        className="w-3/4 h-3/4 object-contain drop-shadow-md"
                    />
                </div>

                <div
                    className="wizard-bubble w-full px-5 py-4 md:px-6 md:py-6 flex items-center justify-center min-h-30 md:min-h-35"
                    style={{background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: '1rem'}}>
                    <p className="text-lg md:text-2xl font-medium text-center leading-relaxed"
                       style={{color: 'var(--ink)', fontFamily: 'Caveat, cursive'}}>
                        {wizardLines[lineIdx]}
                    </p>
                </div>

                <div className="flex gap-2.5 mt-2 shrink-0">
                    {wizardLines.map((_, i) => (
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

            <button
                className={`sketch-btn text-xl md:text-2xl py-3 w-full max-w-sm shrink-0 mt-2 transition-transform hover:-translate-y-1 flex items-center justify-center gap-3 ${lineIdx < wizardLines.length - 1 ? 'sketch-btn-secondary' : 'sketch-btn-primary'}`}
                onClick={next}
            >
                <img
                    src={lineIdx < wizardLines.length - 1 ? '/assets/icons/gate_icon.png' : '/assets/icons/swords_icon.png'}
                    alt={lineIdx < wizardLines.length - 1 ? 'Brána' : 'Meče'}
                    className="h-8 w-8 object-contain"
                />
                {lineIdx < wizardLines.length - 1 ? 'Dál' : 'Do věže!'}
            </button>
        </div>
    );
};