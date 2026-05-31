import React, { useMemo, useState, useCallback, useEffect } from 'react';
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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function parseMathAnswer(value: string): number | null {
  const normalized = value.trim().replace(',', '.');

  const fractionMatch = normalized.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator === 0) return null;
    return numerator / denominator;
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function isEquivalentAnswer(selected: string, correct: string): boolean {
  if (selected.trim() === correct.trim()) return true;
  const a = parseMathAnswer(selected);
  const b = parseMathAnswer(correct);
  if (a === null || b === null) return false;
  return Math.abs(a - b) < 1e-9;
}

interface Props {
  enemy: Enemy;
  problem: Problem;
  playerHp: number;
  playerMaxHp: number;
  inventory: Item[];
  peekNextRoom: RoomType | null;
  roundTimeSeconds: number;
  reducedMotion: boolean;
  showWrongAnswerDialog?: boolean; // Pass this to freeze timer when dialog is showing
  onAnswer: (answer: string, correct: boolean) => void;
  onUseItem: (id: Item['id']) => void;
  onClosePeek: () => void;
  onPeekSkip: () => void;
  onAddTimeUsed: () => void; // callback pro spuštění toast
}

export const CombatScreen: React.FC<Props> = ({
  enemy, problem, inventory,
  peekNextRoom, roundTimeSeconds, reducedMotion, showWrongAnswerDialog, onAnswer, onUseItem, onClosePeek, onPeekSkip, onAddTimeUsed,
}) => {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showTimeToast, setShowTimeToast] = useState(false);
  const [timeLeft, setTimeLeft] = useState(roundTimeSeconds);
  const [timeCap, setTimeCap] = useState(roundTimeSeconds);

  useEffect(() => {
    if (peekNextRoom) return;
    if (hasAnswered) return;
    if (showWrongAnswerDialog) return; // Freeze timer when dialog is showing
    if (timeLeft <= 0) {
      setHasAnswered(true);
      onAnswer('', false);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [hasAnswered, timeLeft, onAnswer, peekNextRoom, showWrongAnswerDialog]);

  // Deterministické pseudo-zamíchání, aby byl render čistý bez Math.random()
  const answers = useMemo(() => {
    const all = [problem.correctAnswer, ...problem.wrongAnswers];
    return all
      .map((answer, idx) => ({ answer, idx, rank: hashString(`${problem.id}:${answer}:${idx}`) }))
      .sort((a, b) => a.rank - b.rank)
      .map(x => x.answer);
  }, [problem.id, problem.correctAnswer, problem.wrongAnswers]);

  // ADD_TIME: sleduj použití itemu a zobraz toast
  const handleUseItem = useCallback((id: Item['id']) => {
    if (id === ItemId.ADD_TIME) {
      onUseItem(id);
      setTimeLeft(prev => Math.min(180, prev + 30));
      setTimeCap(prev => Math.min(180, prev + 30));
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
  const isLowTime = timeLeft <= 5;
  const timePct = Math.max(0, Math.min(100, (timeLeft / timeCap) * 100));

  const handleAnswer = useCallback((selectedAnswer: string) => {
    if (hasAnswered) return;
    setHasAnswered(true);

    // Check against all correct answers if available, not just the first one
    const correctAnswers = problem.allCorrectAnswers ?? [problem.correctAnswer];
    const isCorrect = correctAnswers.some(correct => isEquivalentAnswer(selectedAnswer, correct));

    onAnswer(selectedAnswer, isCorrect);
  }, [hasAnswered, onAnswer, problem.correctAnswer, problem.allCorrectAnswers]);

  return (
    <div className="flex flex-col h-full px-3 py-3 gap-3 relative">

      {/* ADD_TIME toast */}
      {showTimeToast && (
        <div
          className="toast-slide"
          style={{
            position: 'absolute', top: '0.5rem', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--ink)', color: 'var(--paper)',
            padding: '0.4rem 1.1rem', borderRadius: '0.4rem', zIndex: 20,
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
          <div className="hp-bar-track" style={{ height: '0.6rem' }}>
            <div className="hp-bar-fill" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Placeholder pro ilustraci nepřítele */}
      <div
        className="sketch-box-light flex items-center justify-center"
        style={{ flex: 1, minHeight: '5rem', fontSize: '3rem' }}
      >
        {enemy.type === EnemyType.BOSS ? '👑' : enemy.type === EnemyType.MINIBOSS ? '💀' : '👾'}
      </div>

      {/* Příklad */}
      <div className="sketch-box px-4 py-3 text-center">
        <div className="time-row">
          <span className={`time-text ${isLowTime ? 'time-text-danger' : ''}`}>⏳ {timeLeft}s</span>
          <span className="time-hint">na odpověď</span>
        </div>
        <div className="time-track" aria-hidden="true">
          <div
            className={`time-fill ${isLowTime ? (reducedMotion ? 'time-fill-danger-static' : 'time-fill-danger') : ''}`}
            style={{ width: `${timePct}%` }}
          />
        </div>
        <p className="text-base mt-2" style={{ color: 'var(--ink-light)' }}>Vypočítej:</p>
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
            onClick={() => handleAnswer(ans)}
            disabled={hasAnswered}
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

