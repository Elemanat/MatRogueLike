import React from 'react';
import type {Item} from '../types/game';

interface Props {
    inventory: Item[];
    onUse: (id: Item['id']) => void;
    disabled?: boolean;
}

export const ItemBar: React.FC<Props> = ({inventory, onUse, disabled}) => (
    <div className="flex flex-wrap justify-center gap-2">
        {inventory.map((item, idx) => (
            <button
                key={`${item.id}-${idx}`}
                className={`sketch-box-light flex items-center justify-center w-11 h-11 p-0 ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1 transition-transform'
                }`}
                title={`${item.name}: ${item.description}`}
                disabled={disabled}
                onClick={() => onUse(item.id)}
            >
                {item.icon ? (
                    <img
                        src={item.icon}
                        alt={item.name}
                        className="h-8 w-8 object-contain drop-shadow-sm"
                    />
                ) : (
                    <span className="text-2xl">?</span>
                )}
            </button>
        ))}
        {inventory.length === 0 && (
            <span className="self-center text-sm" style={{color: 'var(--ink-light)'}}>
        (prázdný inventář)
      </span>
        )}
    </div>
);