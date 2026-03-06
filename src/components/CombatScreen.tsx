import React, { useMemo, useState, useCallback } from 'react';
import type { Problem, Item, Enemy, RoomType } from '../types/game';
import { EnemyType, ItemId } from '../types/game';
import { ItemBar } from './ItemBar';
import { HealthBar } from './HealthBar';

const ROOM_TYPE_LABEL: Record<string, string> = {
  EMPTY:    '🌫️ Prázdná místnost',
  CHEST:    '📦 Truhla',
  COMBAT:   '⚔️ Souboj',
  MINIBOSS: '💀 Miniboss',
  BOSS:     '👑 Boss',
};

interface Props {
  enemy: Enemy;
  problem: Problem;
  playerHp: number;
  playerMaxHp: number;
  inventory: Item[];
  peekNextRoom: RoomType | null;
  onAnswer: (correct: boolean) => void;
  onUseItem: (id: Item['id']) => void;
  onClosePeek: () => void;
  onPeekSkip: () => void;
  onAddTimeUsed: () => void; // callback pro spuštění toast
}

export const CombatScreen: React.FC<Props> = ({
  enemy, problem, inventory,
  peekNextRoom, onAnswer, onUseItem, onClosePeek, onPeekSkip, onAddTimeUsed,
}) => {
  const [showTimeToast, setShowTimeToast] = useState(false);

  // Zamíchat odpovědi
  const answers = useMemo(() => {
    const all = [problem.correctAnswer, ...problem.wrongAnswers];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [problem.correctAnswer, problem.wrongAnswers]);

  // ADD_TIME: sleduj použití itemu a zobraz toast
  const handleUseItem = useCallback((id: Item['id']) => {
    if (id === ItemId.ADD_TIME) {
      onUseItem(id);
      onAddTimeUsed();
      setShowTimeToast(true);
      setTimeout(() => setShowTimeToast(false), 2000);
    } else {
      onUseItem(id);
    }
  }, [onUseItem, onAddTimeUsed]);

  const enemyColor = enemy.type === EnemyType.BOSS
    ? 'var(--gold)'
    : enemy.type === EnemyType.MINIBOSS
    ? 'var(--red)'
    : 'var(--ink)';

  return (
    <div className="flex flex-col h-full px-3 py-3 gap-3 relative">

      {/* ADD_TIME toast */}
      {showTimeToast && (
        <div
          className="toast-slide"
          style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--ink)', color: 'var(--paper)',
            padding: '6px 18px', borderRadius: 6, zIndex: 20,
            fontFamily: 'Caveat, cursive', fontSize: '1.2rem', fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          ⏱ +30 sekund!
        </div>
      )}

      {/* PEEK modal */}
      {peekNextRoom && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(44,44,62,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
        }}>
          <div className="sketch-box px-6 py-6 flex flex-col items-center gap-4 mx-4">
            <p className="text-2xl font-bold text-center" style={{ color: 'var(--ink)' }}>🔭 Příští místnost:</p>
            <p className="text-3xl font-bold text-center">{ROOM_TYPE_LABEL[peekNextRoom]}</p>
            <div className="flex gap-3 w-full">
              <button className="sketch-btn flex-1 text-lg" onClick={onClosePeek}>Přijmout</button>
              <button className="sketch-btn sketch-btn-danger flex-1 text-lg" onClick={onPeekSkip}>Přeskočit</button>
            </div>
          </div>
        </div>
      )}

      {/* Nepřítel */}
      <div className="sketch-box px-3 py-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xl font-bold" style={{ color: enemyColor }}>{enemy.name}</span>
          <HealthBar health={enemy.hp} maxHealth={enemy.maxHp} />
        </div>
        {enemy.maxHp > 1 && (
          <div className="hp-bar-track" style={{ height: 10 }}>
            <div className="hp-bar-fill" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Placeholder pro ilustraci nepřítele */}
      <div
        className="sketch-box-light flex items-center justify-center"
        style={{ flex: 1, minHeight: 80, fontSize: '3rem' }}
      >
        {enemy.type === EnemyType.BOSS ? '👑' : enemy.type === EnemyType.MINIBOSS ? '💀' : '👾'}
      </div>

      {/* Příklad */}
      <div className="sketch-box px-4 py-3 text-center">
        <p className="text-base" style={{ color: 'var(--ink-light)' }}>Vypočítej:</p>
        <p className="text-3xl font-bold" style={{ color: 'var(--ink)', fontFamily: 'Caveat, cursive' }}>
          {problem.question}
        </p>
      </div>

      {/* Odpovědi */}
      <div className="flex flex-col gap-2">
        {answers.map(ans => (
          <button
            key={ans}
            className="sketch-btn text-xl py-2 w-full"
            onClick={() => onAnswer(ans === problem.correctAnswer)}
          >
            {ans}
          </button>
        ))}
      </div>

      {/* ItemBar */}
      <div className="sketch-box-light px-2 py-2">
        <p className="text-xs text-center mb-1" style={{ color: 'var(--ink-light)' }}>Předměty:</p>
        <ItemBar inventory={inventory} onUse={handleUseItem} />
      </div>
    </div>
  );
};




