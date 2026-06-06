import React from 'react';
import type { Item } from '../types/game';
import { ItemId } from '../types/game';

interface Props {
  inventory: Item[];
  onUse: (id: Item['id']) => void;
  disabled?: boolean;
}

const ITEM_EMOJI: Record<string, string> = {
  [ItemId.ADD_TIME]:    '⏱',
  [ItemId.CHANGE_PROB]: '🔄',
  [ItemId.HEAL]:        '❤️',
  [ItemId.SKIP]:        '💨',
  [ItemId.PEEK]:        '🔭',
};

export const ItemBar: React.FC<Props> = ({ inventory, onUse, disabled }) => (
    <div className="flex flex-wrap justify-center gap-2">
      {inventory.map((item, idx) => (
          <button
              key={`${item.id}-${idx}`}
              className={`sketch-box-light flex items-center justify-center w-11 h-11 text-2xl p-0 ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              title={`${item.name}: ${item.description}`}
              disabled={disabled}
              onClick={() => onUse(item.id)}
          >
            {ITEM_EMOJI[item.id] ?? '?'}
          </button>
      ))}
      {inventory.length === 0 && (
          <span className="self-center text-sm" style={{ color: 'var(--ink-light)' }}>
        (prázdný inventář)
      </span>
      )}
    </div>
);