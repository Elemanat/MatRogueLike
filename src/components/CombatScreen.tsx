import React, {useMemo, useState, useCallback, useEffect} from 'react';
import type {Problem, Item, Enemy} from '../types/game';
import {EnemyType, ItemId, RoomType} from '../types/game';
import {ItemBar} from './ItemBar';
import {HealthBar} from './HealthBar';

const ROOM_TYPE_LABEL: Record<string, string> = {
    EMPTY: '🌫️ Prázdná místnost',
    CHEST: '📦 Truhla',
    COMBAT: '⚔️ Souboj',
    MINIBOSS: '💀 Miniboss',
    BOSS: '👑 Boss',
};

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
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
    hasRerolledPeek: boolean;
    roundTimeSeconds: number;
    reducedMotion: boolean;
    showWrongAnswerDialog?: boolean;
    onAnswer: (answer: string, correct: boolean) => void;
    onUseItem: (id: Item['id']) => void;
    onClosePeek: () => void;
    onPeekSkip: () => void;
    onAddTimeUsed: () => void;
}

export const CombatScreen: React.FC<Props> = ({
                                                  enemy,
                                                  problem,
                                                  inventory,
                                                  peekNextRoom,
                                                  hasRerolledPeek,
                                                  roundTimeSeconds,
                                                  reducedMotion,
                                                  showWrongAnswerDialog,
                                                  onAnswer,
                                                  onUseItem,
                                                  onClosePeek,
                                                  onPeekSkip,
                                                  onAddTimeUsed,
                                              }) => {
    const [hasAnswered, setHasAnswered] = useState(false);
    const [showTimeToast, setShowTimeToast] = useState(false);
    const [timeLeft, setTimeLeft] = useState(roundTimeSeconds);
    const [timeCap, setTimeCap] = useState(roundTimeSeconds);

    useEffect(() => {
        if (peekNextRoom) return;
        if (hasAnswered) return;
        if (showWrongAnswerDialog) return;

        if (timeLeft <= 0) {
            const t = setTimeout(() => {
                setHasAnswered(true);
                onAnswer('', false);
            }, 0);
            return () => clearTimeout(t);
        }

        const timer = window.setTimeout(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [hasAnswered, timeLeft, onAnswer, peekNextRoom, showWrongAnswerDialog]);

    // Náhodné zamíchání odpovědí
    const answers = useMemo(() => {
        // Vezmeme první správnou odpověď z pole a připojíme špatné odpovědi
        const all = [problem.correctAnswers[0], ...problem.wrongAnswers];
        return shuffleArray(all);
    }, [problem]);

    // ADD_TIME: sleduj použití itemu a zobraz toast
    const handleUseItem = useCallback((id: Item['id']) => {
        if (id === ItemId.ADD_TIME) {
            onUseItem(id);
            setTimeLeft(prev => Math.min(180, prev + 30));
            setTimeCap(prev => Math.min(180, prev + 30));
            onAddTimeUsed();
            setShowTimeToast(true);
            setTimeout(() => setShowTimeToast(false), 2000);
        } else if (id === ItemId.CHANGE_PROB) {
            // Když použijeme záměnu, musíme nejen říct ven, ať to sežene nový,
            // ale musíme i zresetovat náš bojový formulář a časovač.
            onUseItem(id);
            setHasAnswered(false);
            setTimeLeft(roundTimeSeconds);
            setTimeCap(roundTimeSeconds);
        } else {
            onUseItem(id);
        }
    }, [onUseItem, onAddTimeUsed, roundTimeSeconds]);

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

        // Check against all correct answers z pole
        const isCorrect = problem.correctAnswers.some(correct => isEquivalentAnswer(selectedAnswer, correct));

        onAnswer(selectedAnswer, isCorrect);
    }, [hasAnswered, onAnswer, problem.correctAnswers]);

    return (
        // Hlavní kontejner – přepíná mezi jedním (mobil) a dvěma (desktop) sloupci
        <div className="flex flex-col md:flex-row h-full px-3 py-3 gap-5 relative w-full items-stretch overflow-y-auto">

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
                        <p className="text-2xl font-bold text-center" style={{color: 'var(--ink)'}}>🔭 Příští
                            místnost:</p>
                        <p className="text-3xl font-bold text-center">{ROOM_TYPE_LABEL[peekNextRoom]}</p>
                        <div className="flex gap-3 w-full flex-col">
                            <button className="sketch-btn text-lg" onClick={onClosePeek}>✓ V pořádku</button>

                            {!hasRerolledPeek && peekNextRoom !== RoomType.MINIBOSS && peekNextRoom !== RoomType.BOSS && (
                                <button className="sketch-btn sketch-btn-warning text-lg" onClick={onPeekSkip}>
                                    🔄 Změnit místnost
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Levý sloupec (nebo horní na mobilu): Nepřítel a otázka */}
            <div className="flex flex-col gap-3 w-full md:w-[60%] shrink-0">
                {/* Nepřítel */}
                <div className="sketch-box px-4 py-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold" style={{color: enemyColor}}>{enemy.name}</span>
                        {/* Pokud je potřeba, mírně zvětšeno vizuálně přidáním class/styles (HealthBar to může override) */}
                        <div className="scale-110 origin-right">
                            <HealthBar health={enemy.hp} maxHealth={enemy.maxHp}/>
                        </div>
                    </div>
                    {enemy.maxHp > 1 && (
                        <div className="hp-bar-track mt-1" style={{height: '0.8rem'}}>
                            <div className="hp-bar-fill" style={{width: `${(enemy.hp / enemy.maxHp) * 100}%`}}/>
                        </div>
                    )}
                </div>

                {/* Placeholder pro ilustraci nepřítele */}
                <div
                    className="sketch-box-light flex items-center justify-center grow min-h-[120px] md:min-h-0"
                    style={{fontSize: '5rem'}}
                >
                    {enemy.type === EnemyType.BOSS ? '👑' : enemy.type === EnemyType.MINIBOSS ? '💀' : '👾'}
                </div>

                {/* Příklad */}
                <div className="sketch-box px-5 py-4 text-center shrink-0">
                    <div className="time-row mb-1">
                        <span className={`time-text text-xl ${isLowTime ? 'time-text-danger' : ''}`}>⏳ {timeLeft}s</span>
                        <span className="time-hint text-sm">na odpověď</span>
                    </div>
                    <div className="time-track" aria-hidden="true" style={{height: '10px'}}>
                        <div
                            className={`time-fill ${isLowTime ? (reducedMotion ? 'time-fill-danger-static' : 'time-fill-danger') : ''}`}
                            style={{width: `${timePct}%`}}
                        />
                    </div>
                    <p className="text-lg mt-4 font-medium" style={{color: 'var(--ink-light)'}}>Vypočítej:</p>
                    <p className="text-4xl md:text-5xl font-bold leading-tight" style={{color: 'var(--ink)', fontFamily: 'Caveat, cursive', padding: '0.5rem 0'}}>
                        {problem.prompt}
                    </p>
                </div>
            </div>

            {/* Pravý sloupec (nebo spodní na mobilu): Odpovědi a inventář */}
            <div className="flex flex-col gap-3 w-full md:w-[40%]">

                {/* Odpovědi - kontejner, který zabere zbývající místo a rozdělí mezery */}
                <div className="flex flex-col gap-3 grow justify-center">
                    {answers.map(ans => (
                        <button
                            key={ans}
                            className="sketch-btn text-2xl py-3 w-full shadow-[0.25rem_0.25rem_0_var(--ink)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[0.1rem_0.1rem_0_var(--ink)] transition-all"
                            onClick={() => handleAnswer(ans)}
                            disabled={hasAnswered}
                        >
                            {ans}
                        </button>
                    ))}
                </div>

                {/* ItemBar */}
                <div className="sketch-box-light px-3 py-3 mt-auto shrink-0">
                    <p className="text-sm font-bold text-center mb-2" style={{color: 'var(--ink-light)'}}>Předměty:</p>
                    <ItemBar inventory={inventory} onUse={handleUseItem}/>
                </div>
            </div>

        </div>
    );
};