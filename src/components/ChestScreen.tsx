import React, {useState} from 'react';
import {ALL_ITEMS} from '../services/gameCatalog';
import type {Item} from '../types/game';

interface Props {
    onPick: (item: Item) => void;
}

function pickTwoItems(): [Item, Item] {
    const arr = [...ALL_ITEMS];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return [arr[0], arr[1]];
}

export const ChestScreen: React.FC<Props> = ({onPick}) => {
    const [offered] = useState<[Item, Item]>(pickTwoItems);

    return (
        <div
            className="flex flex-col h-full px-6 py-4 md:px-10 md:py-6 gap-4 w-full items-center justify-center overflow-y-auto">

            <img
                src="/assets/chest.png"
                alt="Truhla"
                className="h-20 w-20 md:h-28 md:w-28 object-contain drop-shadow-md shrink-0"
            />

            <div className="text-center shrink-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-(--ink)">
                    Tajemná truhla!
                </h2>
                <p className="text-lg italic" style={{color: 'var(--ink-light)'}}>
                    Zapraskalo staré dřevo a uvnitř se něco zalesklo...<br className="hidden md:block"/>
                    Vyber si jeden předmět na svou další cestu:
                </p>
            </div>

            <div
                className="flex flex-col md:flex-row gap-4 w-full max-w-200 mt-4 mb-2 flex-1 items-stretch justify-center">
                {offered.map((item, index) => (
                    <button
                        key={item.id}
                        className="sketch-box flex flex-col items-center justify-center text-center px-6 py-6 cursor-pointer flex-1 w-full bg-(--paper) hover:-translate-y-2 hover:translate-x-1 hover:shadow-[0.4rem_0.4rem_0_var(--ink)] transition-all shrink-0 fade-in slide-up"
                        style={{border: '0.15rem solid var(--ink)', animationDelay: `${index * 0.15}s`}}
                        onClick={() => onPick(item)}
                    >
                        <img
                            src={item.icon}
                            alt={item.name}
                            className="h-12 w-12 object-contain mb-3 drop-shadow-md"
                        />

                        <div className="text-2xl font-bold mb-2 leading-tight" style={{color: 'var(--ink)'}}>
                            {item.name}
                        </div>

                        <div className="text-base font-medium" style={{color: 'var(--ink-light)'}}>
                            {item.description}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};