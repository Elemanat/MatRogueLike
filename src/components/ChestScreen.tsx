import React, { useState } from 'react';
import { ALL_ITEMS } from '../hooks/useGameState';
import type { Item } from '../types/game';

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

export const ChestScreen: React.FC<Props> = ({ onPick }) => {
  // useState s lazy initializer — spustí se jen při prvním renderu, mimo render fázi
  const [offered] = useState<[Item, Item]>(pickTwoItems);

  return (
    <div className="flex flex-col h-full px-4 py-6 gap-6 justify-between">
      <h2 className="text-2xl font-bold text-center" style={{ color: 'var(--ink)' }}>📦 Truhla!</h2>
      <p className="text-center text-lg" style={{ color: 'var(--ink-light)' }}>Vyber si jeden předmět:</p>

      <div className="flex flex-col gap-4 flex-1 justify-center">
        {offered.map(item => (
          <button
            key={item.id}
            className="sketch-box text-left px-5 py-4 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ border: '2px solid var(--ink)' }}
            onClick={() => onPick(item)}
          >
            <div className="text-2xl font-bold">{item.name}</div>
            <div className="text-base mt-1" style={{ color: 'var(--ink-light)' }}>{item.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
