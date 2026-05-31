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
  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
    {inventory.map((item, idx) => (
      <button
        key={`${item.id}-${idx}`}
        className="sketch-box-light"
        title={`${item.name}: ${item.description}`}
        disabled={disabled}
        onClick={() => onUse(item.id)}
        style={{
          width: '2.75rem', height: '2.75rem', fontSize: '1.4rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          padding: 0,
        }}
      >
        {ITEM_EMOJI[item.id] ?? '?'}
      </button>
    ))}
    {inventory.length === 0 && (
      <span style={{ color: 'var(--ink-light)', fontSize: '0.9rem', alignSelf: 'center' }}>
        (prázdný inventář)
      </span>
    )}
  </div>
);

