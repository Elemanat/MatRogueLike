import React from 'react';
import type { Item } from '../types/game';

const ITEM_EMOJI: Record<string, string> = {
  ADD_TIME:    '⏱',
  CHANGE_PROB: '🔄',
  HEAL:        '❤️',
  SKIP:        '💨',
  PEEK:        '🔭',
};

interface Props {
  item: Item;
  onTake: () => void;
  onSkip: () => void;
}

export const RewardScreen: React.FC<Props> = ({ item, onTake, onSkip }) => (
  <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
    <div className="text-5xl">🎉</div>
    <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--ink)' }}>Nepřítel poražen!</h2>

    <p className="text-lg text-center" style={{ color: 'var(--ink-light)' }}>Získáváš předmět:</p>

    <div className="sketch-box w-full px-5 py-4 flex flex-col items-center gap-2">
      <span className="text-5xl">{ITEM_EMOJI[item.id] ?? '?'}</span>
      <span className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{item.name}</span>
      <span className="text-base text-center" style={{ color: 'var(--ink-light)' }}>{item.description}</span>
    </div>

    <div className="flex gap-3 w-full">
      <button className="sketch-btn flex-1 text-lg py-2" onClick={onSkip}>
        Přeskočit
      </button>
      <button className="sketch-btn sketch-btn-primary flex-1 text-lg py-2" onClick={onTake}>
        Vzít ✓
      </button>
    </div>
  </div>
);

