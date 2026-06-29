import React from 'react';
import type {Item} from '../types/game';

interface Props {
    item: Item;
    onTake: () => void;
    onSkip: () => void;
}

export const RewardScreen: React.FC<Props> = ({item, onTake, onSkip}) => (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
        <div className="text-5xl">
            <img className="h-30 w-30 object-contain"
                 src="/assets/icons/confetti_icon.png"
                 alt="confeti"
            />
        </div>
        <h2 className="text-3xl font-bold text-center text-(--ink)">
            Nepřítel poražen!
        </h2>

        <p className="text-lg text-center text-(--ink-light)">
            Získáváš předmět:
        </p>

        <div className="sketch-box w-full px-5 py-4 flex flex-col items-center gap-2">
            <img
                src={item.icon}
                alt={item.name}
                className="h-16 w-16 object-contain drop-shadow-md"
            />
            <span className="text-2xl font-bold text-(--ink)">
                {item.name}
            </span>
            <span className="text-base text-center text-(--ink-light)">
                {item.description}
            </span>
        </div>

        <div className="flex gap-3 w-full">
            <button
                className="sketch-btn flex-1 text-lg py-2"
                onClick={onSkip}
            >
                Přeskočit
            </button>
            <button
                className="sketch-btn sketch-btn-primary flex-1 text-lg py-2"
                onClick={onTake}
            >
                Vzít ✓
            </button>
        </div>
    </div>
);