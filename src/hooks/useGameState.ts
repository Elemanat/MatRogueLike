import {useEffect, useReducer} from 'react';
import {Screen, RoomType, EnemyType, ItemId} from '../types/game';
import type {GameState, Item, Tower, Enemy, Problem, PlayerStats, GameSettings} from '../types/game';
import {ALL_ITEMS} from '../services/gameCatalog';
import {apiClient} from '../services/api';
import {mapProblemDtoToProblem} from '../services/api/mappers';
import type {RunAnswerResponse} from '../services/api/contracts';

const ENEMIES_NORMAL = ['Zlý zlomek', 'Záludná rovnice', 'Číselný duch', 'Rozbitá desetina'];
const ENEMIES_MINIBOSS = ['Miniboss: Velký jmenovatel', 'Miniboss: Mocný součin'];
const ENEMIES_BOSS = ['BOSS: Arcivládce Čísel', 'BOSS: Nekonečný Zlomek'];

const STORAGE_KEY_SESSION_STATS = 'vezmat.sessionStats.v1';
const STORAGE_KEY_SETTINGS = 'vezmat.settings.v1';
const STORAGE_KEY_LAST_PLAYER = 'vezmat.lastPlayer.v1';
const STORAGE_KEY_PLAYER_ID = 'vezmat.playerId.v1';
const STORAGE_KEY_PLAYER_CODE = 'vezmat.playerCode.v1';

const defaultSettings: GameSettings = {
    roundTimeSeconds: 20,
    soundEnabled: true,
    reducedMotion: false,
};

function isPlayerStats(value: unknown): value is PlayerStats {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return ['enemiesDefeated', 'floorsCompleted', 'correctAnswers', 'wrongAnswers']
        .every(k => typeof v[k] === 'number');
}

function isGameSettings(value: unknown): value is GameSettings {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.roundTimeSeconds === 'number'
        && typeof v.soundEnabled === 'boolean'
        && typeof v.reducedMotion === 'boolean'
    );
}

function readStorageJson<T>(key: string): T | null {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) as T : null;
    } catch {
        return null;
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function resolveRewardItem(rewardItemId?: string): Item {
    return ALL_ITEMS.find(item => item.id === rewardItemId) ?? pick(ALL_ITEMS);
}

function makeEnemy(type: EnemyType): Enemy {
    if (type === EnemyType.BOSS) return {name: pick(ENEMIES_BOSS), type, maxHp: 5, hp: 5};
    if (type === EnemyType.MINIBOSS) return {name: pick(ENEMIES_MINIBOSS), type, maxHp: 3, hp: 3};
    return {name: pick(ENEMIES_NORMAL), type, maxHp: 1, hp: 1};
}

/**
 * Určí typ příští místnosti:
 * - poslední patro, poslední místnost → BOSS
 * - poslední místnost v patře         → MINIBOSS
 * - jinak náhodně EMPTY / CHEST / COMBAT (váhované)
 */
function generateRoomType(room: number, roomsPerFloor: number, floor: number, floors: number): RoomType {
    const isLastFloor = floor === floors;
    const isLastRoom = room === roomsPerFloor;
    if (isLastFloor && isLastRoom) return RoomType.BOSS;
    if (isLastRoom) return RoomType.MINIBOSS;
    // 75 % boj, 15 % truhla, 10 % prázdná (tábořák)
    const r = Math.random();
    if (r < 0.75) return RoomType.COMBAT;
    if (r < 0.9) return RoomType.CHEST;
    return RoomType.EMPTY;
}

function screenForRoom(rt: RoomType): Screen {
    if (rt === RoomType.EMPTY) return Screen.EMPTY_ROOM;
    if (rt === RoomType.CHEST) return Screen.CHEST;
    if (rt === RoomType.COMBAT || rt === RoomType.MINIBOSS || rt === RoomType.BOSS) return Screen.COMBAT;
    return Screen.COMBAT;
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialStats: PlayerStats = {enemiesDefeated: 0, floorsCompleted: 0, correctAnswers: 0, wrongAnswers: 0};

const initialState: GameState = {
    currentScreen: Screen.LOGIN,
    runId: null,
    playerId: null,
    playerCode: null,
    playerName: '',
    playerHp: 3,
    playerMaxHp: 3,
    floor: 1,
    room: 1,
    inventory: [],
    currentEnemy: null,
    currentProblem: null,
    selectedTower: null,
    peekNextRoom: null,
    rewardItem: null,
    runStats: {...initialStats},
    sessionStats: {...initialStats},
    settings: {...defaultSettings},
    wrongAnswerDialog: null,
};

function initState(): GameState {
    if (typeof window === 'undefined') return initialState;

    const storedStats = readStorageJson<unknown>(STORAGE_KEY_SESSION_STATS);
    const storedSettings = readStorageJson<unknown>(STORAGE_KEY_SETTINGS);
    const storedPlayer = window.localStorage.getItem(STORAGE_KEY_LAST_PLAYER);
    const storedPlayerId = window.localStorage.getItem(STORAGE_KEY_PLAYER_ID);
    const storedPlayerCode = window.localStorage.getItem(STORAGE_KEY_PLAYER_CODE);

    return {
        ...initialState,
        playerName: storedPlayer ?? '',
        playerId: storedPlayerId ?? null,
        playerCode: storedPlayerCode ?? null,
        sessionStats: isPlayerStats(storedStats) ? storedStats : {...initialStats},
        settings: isGameSettings(storedSettings)
            ? {
                ...storedSettings,
                roundTimeSeconds: Math.max(10, Math.min(60, storedSettings.roundTimeSeconds)),
            }
            : {...defaultSettings},
    };
}

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
    | { type: 'SET_NAME'; name: string }
    | { type: 'SELECT_TOWER'; tower: Tower }
    | { type: 'TO_LOGIN' }
    | { type: 'TO_NEW_PLAYER' }
    | { type: 'CREATE_NEW_PLAYER_SUCCESS'; playerId: string; playerCode: string; playerName: string; runId: string }
    | { type: 'PLAYER_CODE_DIALOG_CLOSED' }
    | { type: 'TO_EXISTING_PLAYER_LOGIN' }
    | { type: 'LOGIN_BY_CODE_SUCCESS'; playerId: string; playerCode: string; playerName: string }
    | { type: 'LOGIN_BY_CODE_ERROR'; error: string }
    | { type: 'TO_MENU' }
    | { type: 'TO_TOWER_SELECT' }
    | { type: 'TO_INTRO' }
    | { type: 'TO_SETTINGS' }
    | { type: 'TO_STATISTICS' }
    | { type: 'LOGOUT' }
    | { type: 'START_RUN'; runId?: string; playerId?: string; playerCode?: string; initialProblem?: Problem | null }
    | { type: 'CONTINUE' }
    | { type: 'ANSWER'; correct: boolean; answer?: string; result?: ResolvedRunAnswerResponse }
    | { type: 'USE_ITEM'; itemId: ItemId; newProblem?: Problem } // OPRAVENO: přidán newProblem
    | { type: 'PICK_CHEST_ITEM'; item: Item }
    | { type: 'TAKE_REWARD' }
    | { type: 'SKIP_REWARD' }
    | { type: 'CLOSE_PEEK' }
    | { type: 'PEEK_REROLL' }
    | { type: 'RESTART_TO_INTRO' }
    | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
    | { type: 'RESET_SESSION_STATS' }
    | { type: 'CLOSE_WRONG_ANSWER_DIALOG' }
    | { type: 'CAMP_REST' }
    | { type: 'CAMP_SCAVENGE' };

type ResolvedRunAnswerResponse = Omit<RunAnswerResponse, 'nextProblem'> & {
    nextProblem?: Problem | null;
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function advanceRoom(state: GameState): GameState {
    const tower = state.selectedTower!;
    const nextRoom = state.room + 1;

    // Přechod do dalšího patra
    if (nextRoom > tower.roomsPerFloor) {
        const nextFloor = state.floor + 1;
        const rt = generateRoomType(1, tower.roomsPerFloor, nextFloor, tower.floors);
        const screen = screenForRoom(rt);
        const enemy = (rt === RoomType.COMBAT || rt === RoomType.MINIBOSS || rt === RoomType.BOSS)
            ? makeEnemy(rt === RoomType.COMBAT ? EnemyType.NORMAL : rt === RoomType.MINIBOSS ? EnemyType.MINIBOSS : EnemyType.BOSS)
            : null;
        return {
            ...state,
            floor: nextFloor,
            room: 1,
            currentScreen: screen,
            currentEnemy: enemy,
            currentProblem: state.currentProblem, // OPRAVENO: Zachováme existující problém
            peekNextRoom: null,
            rewardItem: null,
        };
    }

    const rt = generateRoomType(nextRoom, tower.roomsPerFloor, state.floor, tower.floors);
    const screen = screenForRoom(rt);
    const enemy = (rt === RoomType.COMBAT || rt === RoomType.MINIBOSS || rt === RoomType.BOSS)
        ? makeEnemy(rt === RoomType.COMBAT ? EnemyType.NORMAL : rt === RoomType.MINIBOSS ? EnemyType.MINIBOSS : EnemyType.BOSS)
        : null;
    return {
        ...state,
        room: nextRoom,
        currentScreen: screen,
        currentEnemy: enemy,
        currentProblem: state.currentProblem, // OPRAVENO: Zachováme existující problém
        peekNextRoom: null,
        rewardItem: null,
    };
}

function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {

        case 'SET_NAME':
            return {...state, playerName: action.name};

        case 'SELECT_TOWER':
            return {...state, selectedTower: action.tower};

        case 'TO_LOGIN':
            return {...initialState, currentScreen: Screen.LOGIN, settings: state.settings};

        case 'TO_NEW_PLAYER':
            return {...state, currentScreen: Screen.NEW_PLAYER, isLoading: false, loginError: undefined};

        case 'TO_EXISTING_PLAYER_LOGIN':
            return {...state, currentScreen: Screen.EXISTING_PLAYER_LOGIN, isLoading: false, loginError: undefined};

        case 'CREATE_NEW_PLAYER_SUCCESS':
            return {
                ...state,
                playerId: action.playerId,
                playerCode: action.playerCode,
                playerName: action.playerName,
                runId: action.runId,
                currentScreen: Screen.PLAYER_CODE_DIALOG,
                isLoading: false,
                loginError: undefined,
            };

        case 'PLAYER_CODE_DIALOG_CLOSED':
            return {...state, currentScreen: Screen.MENU};

        case 'LOGIN_BY_CODE_SUCCESS':
            return {
                ...state,
                playerId: action.playerId,
                playerCode: action.playerCode,
                playerName: action.playerName,
                currentScreen: Screen.PLAYER_CODE_DIALOG,
                isLoading: false,
                loginError: undefined,
            };

        case 'LOGIN_BY_CODE_ERROR':
            return {...state, isLoading: false, loginError: action.error};

        case 'TO_MENU':
            return {
                ...initialState,
                playerName: state.playerName,
                playerId: state.playerId,
                playerCode: state.playerCode,
                currentScreen: Screen.MENU,
                sessionStats: state.sessionStats,
                settings: state.settings,
            };

        case 'TO_TOWER_SELECT':
            return {...state, currentScreen: Screen.TOWER_SELECT};

        case 'TO_INTRO':
            return {...state, currentScreen: Screen.INTRO};

        case 'TO_SETTINGS':
            return {...state, currentScreen: Screen.SETTINGS};

        case 'TO_STATISTICS':
            return {...state, currentScreen: Screen.STATISTICS};

        case 'LOGOUT':
            return {...initialState, currentScreen: Screen.LOGIN, settings: state.settings};

        case 'START_RUN': {
            const tower = state.selectedTower!;
            const rt = generateRoomType(1, tower.roomsPerFloor, 1, tower.floors);
            const screen = screenForRoom(rt);
            const enemy = (rt === RoomType.COMBAT || rt === RoomType.MINIBOSS || rt === RoomType.BOSS)
                ? makeEnemy(rt === RoomType.COMBAT ? EnemyType.NORMAL : rt === RoomType.MINIBOSS ? EnemyType.MINIBOSS : EnemyType.BOSS)
                : null;
            return {
                ...state,
                currentScreen: screen,
                playerHp: 3,
                playerMaxHp: 3,
                floor: 1,
                room: 1,
                inventory: [],
                currentEnemy: enemy,
                currentProblem: action.initialProblem ?? null,
                peekNextRoom: null,
                rewardItem: null,
                runStats: {...initialStats},
                runId: action.runId ?? null,
                playerId: action.playerId ?? null,
                playerCode: action.playerCode ?? null,
            };
        }

        case 'CONTINUE':
            return advanceRoom(state);

        case 'ANSWER': {
            const tower = state.selectedTower;
            if (!tower || !state.currentEnemy) return state;

            const apiState = action.result?.state;
            const nextProblem = action.result?.nextProblem ?? null;

            if (action.correct) {
                const enemy = state.currentEnemy;
                const newEnemyHp = enemy.hp - 1;
                const runStats = {...state.runStats, correctAnswers: state.runStats.correctAnswers + 1};
                const sessionStats = {...state.sessionStats, correctAnswers: state.sessionStats.correctAnswers + 1};

                if (newEnemyHp > 0 && apiState !== 'ENEMY_DEFEATED' && apiState !== 'FLOOR_COMPLETE' && apiState !== 'GAME_OVER' && apiState !== 'VICTORY') {
                    return {
                        ...state,
                        currentEnemy: {...enemy, hp: newEnemyHp},
                        currentProblem: nextProblem,
                        runStats,
                        sessionStats,
                    };
                }

                const runDefeatedStats = {
                    ...runStats,
                    enemiesDefeated: runStats.enemiesDefeated + 1,
                    floorsCompleted: enemy.type === EnemyType.MINIBOSS || enemy.type === EnemyType.BOSS
                        ? runStats.floorsCompleted + 1
                        : runStats.floorsCompleted,
                };
                const sessionDefeatedStats = {
                    ...sessionStats,
                    enemiesDefeated: sessionStats.enemiesDefeated + 1,
                    floorsCompleted: enemy.type === EnemyType.MINIBOSS || enemy.type === EnemyType.BOSS
                        ? sessionStats.floorsCompleted + 1
                        : sessionStats.floorsCompleted,
                };

                if (apiState === 'VICTORY' || enemy.type === EnemyType.BOSS) {
                    return {
                        ...state,
                        currentScreen: Screen.VICTORY,
                        currentEnemy: null,
                        currentProblem: null,
                        runStats: runDefeatedStats,
                        sessionStats: sessionDefeatedStats,
                    };
                }

                if (apiState === 'FLOOR_COMPLETE' || enemy.type === EnemyType.MINIBOSS) {
                    const reward = resolveRewardItem(action.result?.rewardItemId);
                    return {
                        ...state,
                        currentScreen: Screen.REWARD,
                        currentEnemy: null,
                        currentProblem: nextProblem, // OPRAVENO: Předáme vygenerovaný problém z API
                        runStats: runDefeatedStats,
                        sessionStats: sessionDefeatedStats,
                        rewardItem: reward,
                    };
                }

                return advanceRoom({
                    ...state,
                    currentProblem: nextProblem, // OPRAVENO: Předáme vygenerovaný problém z API do další místnosti
                    runStats: runDefeatedStats,
                    sessionStats: sessionDefeatedStats,
                });
            }

            const newHp = state.playerHp - 1;
            const runStats = {...state.runStats, wrongAnswers: state.runStats.wrongAnswers + 1};
            const sessionStats = {...state.sessionStats, wrongAnswers: state.sessionStats.wrongAnswers + 1};

            if (newHp <= 0 || apiState === 'GAME_OVER') {
                return {
                    ...state,
                    playerHp: 0,
                    currentScreen: Screen.GAMEOVER,
                    currentEnemy: null,
                    currentProblem: null,
                    runStats,
                    sessionStats,
                };
            }

            return {
                ...state,
                playerHp: newHp,
                currentProblem: nextProblem,
                runStats,
                sessionStats,
                wrongAnswerDialog: {
                    prompt: state.currentProblem?.prompt || 'Příklad',
                    yourAnswer: action.answer || '?',
                    correctAnswers: state.currentProblem?.correctAnswers ?? ['?'],
                },
            };
        }

        case 'CLOSE_WRONG_ANSWER_DIALOG':
            return {...state, wrongAnswerDialog: null};

        case 'CAMP_REST':
            return advanceRoom({
                ...state,
                playerHp: Math.min(state.playerMaxHp, state.playerHp + 1),
            });

        case 'CAMP_SCAVENGE': {
            // 50% šance na nalezení náhodného předmětu
            const foundItem = Math.random() < 0.5 ? resolveRewardItem() : null;

            if (foundItem) {
                return {
                    ...state,
                    currentScreen: Screen.REWARD,
                    rewardItem: foundItem
                };
            }
            return advanceRoom(state);
        }

        case 'TAKE_REWARD': {
            const withReward = state.rewardItem
                ? {...state, inventory: [...state.inventory, state.rewardItem], rewardItem: null}
                : {...state, rewardItem: null};
            return advanceRoom(withReward);
        }

        case 'SKIP_REWARD': {
            return advanceRoom({...state, rewardItem: null});
        }

        case 'USE_ITEM': {
            const tower = state.selectedTower!;

            const withoutOne = (id: ItemId): Item[] => {
                let removed = false;
                return state.inventory.filter(item => {
                    if (!removed && item.id === id) {
                        removed = true;
                        return false;
                    }
                    return true;
                });
            };

            switch (action.itemId) {
                case ItemId.HEAL:
                    return {
                        ...state,
                        playerHp: Math.min(state.playerMaxHp, state.playerHp + 1),
                        inventory: withoutOne(ItemId.HEAL),
                    };
                case ItemId.CHANGE_PROB:
                    return {
                        ...state,
                        currentProblem: action.newProblem || state.currentProblem, // OPRAVENO: Použije vygenerovaný problém
                        inventory: withoutOne(ItemId.CHANGE_PROB),
                    };
                case ItemId.SKIP: {
                    const e = state.currentEnemy;
                    if (e && (e.type === EnemyType.BOSS || e.type === EnemyType.MINIBOSS)) return state;
                    return advanceRoom({...state, inventory: withoutOne(ItemId.SKIP)});
                }
                case ItemId.PEEK: {
                    const nextRoomNum = state.room + 1 > tower.roomsPerFloor ? 1 : state.room + 1;
                    const nextFloor = state.room + 1 > tower.roomsPerFloor ? state.floor + 1 : state.floor;
                    const peeked = generateRoomType(nextRoomNum, tower.roomsPerFloor, nextFloor, tower.floors);

                    if (peeked === RoomType.MINIBOSS || peeked === RoomType.BOSS) {
                        return {
                            ...state,
                            peekNextRoom: peeked,
                            inventory: withoutOne(ItemId.PEEK),
                        };
                    }

                    return {
                        ...state,
                        peekNextRoom: peeked,
                        inventory: withoutOne(ItemId.PEEK),
                    };
                }
                case ItemId.ADD_TIME:
                    return {...state, inventory: withoutOne(ItemId.ADD_TIME)};
                default:
                    return state;
            }
        }

        case 'PICK_CHEST_ITEM':
            return advanceRoom({...state, inventory: [...state.inventory, action.item]});

        case 'CLOSE_PEEK':
            return {...state, peekNextRoom: null};

        case 'PEEK_REROLL': {
            if (!state.peekNextRoom) return state;
            if (state.peekNextRoom === RoomType.MINIBOSS || state.peekNextRoom === RoomType.BOSS) {
                return state;
            }

            const tower = state.selectedTower!;
            const nextRoomNum = state.room + 1 > tower.roomsPerFloor ? 1 : state.room + 1;
            const nextFloor = state.room + 1 > tower.roomsPerFloor ? state.floor + 1 : state.floor;
            const newPeek = generateRoomType(nextRoomNum, tower.roomsPerFloor, nextFloor, tower.floors);

            return {
                ...state,
                peekNextRoom: newPeek,
            };
        }

        case 'RESTART_TO_INTRO':
            return {
                ...initialState,
                playerName: state.playerName,
                playerId: state.playerId,
                playerCode: state.playerCode,
                selectedTower: state.selectedTower,
                currentScreen: Screen.INTRO,
                sessionStats: state.sessionStats,
                settings: state.settings,
            };

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.settings,
                    roundTimeSeconds: Math.max(10, Math.min(60, action.settings.roundTimeSeconds ?? state.settings.roundTimeSeconds)),
                },
            };

        case 'RESET_SESSION_STATS':
            return {
                ...state,
                sessionStats: {...initialStats},
            };

        default:
            return state;
    }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
    const [state, dispatch] = useReducer(reducer, initialState, initState);

    // OPRAVENO: Odstraněn useCallback
    const startRun = async () => {
        const tower = state.selectedTower;
        if (!tower) return;

        try {
            console.log('[gameState.startRun] Starting API call...');
            const response = await apiClient.runs.startRun({
                playerName: state.playerName,
                towerId: tower.id,
            });

            console.log('[gameState.startRun] Got response:', response);

            window.localStorage.setItem(STORAGE_KEY_PLAYER_ID, response.playerId);
            window.localStorage.setItem(STORAGE_KEY_PLAYER_CODE, response.playerCode);

            dispatch({
                type: 'START_RUN',
                runId: response.runId,
                playerId: response.playerId,
                playerCode: response.playerCode,
                initialProblem: response.initialProblem ? mapProblemDtoToProblem(response.initialProblem) : null,
            });
        } catch (error) {
            console.error('[gameState.startRun] Error:', error);
            dispatch({type: 'START_RUN'});
        }
    };

    // OPRAVENO: Odstraněn useCallback
    const answer = async (answerText: string, correct: boolean) => {
        const runId = state.runId;
        const problemId = state.currentProblem?.id;

        if (!runId || !problemId) {
            dispatch({type: 'ANSWER', answer: answerText, correct});
            return;
        }

        try {
            const response = await apiClient.runs.answer({
                runId,
                problemId,
                answer: answerText,
                correctAnswers: state.currentProblem?.correctAnswers,
                floor: state.floor,
                room: state.room,
                items: JSON.stringify(state.inventory),
            });

            dispatch({
                type: 'ANSWER',
                answer: answerText,
                correct: response.isCorrect,
                result: {
                    ...response,
                    nextProblem: response.nextProblem ? mapProblemDtoToProblem(response.nextProblem) : undefined,
                },
            });
        } catch {
            dispatch({type: 'ANSWER', answer: answerText, correct});
        }
    };

    // OPRAVENO: Odstraněn useCallback
    const createNewPlayer = async (playerName: string) => {
        try {
            const response = await apiClient.runs.startRun({
                playerName,
                towerId: 'fractions',
            });

            window.localStorage.setItem(STORAGE_KEY_PLAYER_ID, response.playerId);
            window.localStorage.setItem(STORAGE_KEY_PLAYER_CODE, response.playerCode);
            window.localStorage.setItem(STORAGE_KEY_LAST_PLAYER, playerName);

            dispatch({
                type: 'CREATE_NEW_PLAYER_SUCCESS',
                playerId: response.playerId,
                playerCode: response.playerCode,
                playerName,
                runId: response.runId,
            });
        } catch (error) {
            console.error('[gameState.createNewPlayer] Error:', error);
            dispatch({type: 'TO_LOGIN'});
        }
    };

    // OPRAVENO: Odstraněn useCallback
    const loginByCode = async (code: string) => {
        try {
            dispatch({type: 'TO_EXISTING_PLAYER_LOGIN'});

            const response = await apiClient.players.loginByCode(code);

            window.localStorage.setItem(STORAGE_KEY_PLAYER_ID, response.playerId);
            window.localStorage.setItem(STORAGE_KEY_PLAYER_CODE, response.playerCode);
            window.localStorage.setItem(STORAGE_KEY_LAST_PLAYER, response.playerName);

            dispatch({
                type: 'LOGIN_BY_CODE_SUCCESS',
                playerId: response.playerId,
                playerCode: response.playerCode,
                playerName: response.playerName,
            });
        } catch (error) {
            console.error('[gameState.loginByCode] Error:', error);
            dispatch({
                type: 'LOGIN_BY_CODE_ERROR',
                error: 'Neplatný kód. Zkuste znovu.'
            });
        }
    };

    // NOVÉ: Asynchronní volání pro použití předmětů (např. Záměna)
    const useItem = async (itemId: ItemId) => {
        if (itemId === ItemId.CHANGE_PROB) {
            const towerId = state.selectedTower?.id;
            if (!towerId) return;

            try {
                // Připravíme parametry pro backend
                const params = new URLSearchParams({
                    towerId,
                    floor: state.floor.toString(),
                    enemyType: state.currentEnemy?.type || 'NORMAL'
                });

                // Můžeš to přepsat na apiClient.problems.next() pokud to tam už máš nachystané
                const res = await fetch(`http://localhost:3001/api/problems/next?${params}`);
                const data = await res.json();

                dispatch({
                    type: 'USE_ITEM',
                    itemId,
                    newProblem: mapProblemDtoToProblem(data.problem)
                });
            } catch (error) {
                console.error('Nepodařilo se vyměnit příklad:', error);
            }
        } else {
            // Ostatní itemy komunikaci s backendem nepotřebují
            dispatch({ type: 'USE_ITEM', itemId });
        }
    };

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY_SESSION_STATS, JSON.stringify(state.sessionStats));
            window.localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(state.settings));
            window.localStorage.setItem(STORAGE_KEY_LAST_PLAYER, state.playerName);
            if (state.playerId) window.localStorage.setItem(STORAGE_KEY_PLAYER_ID, state.playerId);
            if (state.playerCode) window.localStorage.setItem(STORAGE_KEY_PLAYER_CODE, state.playerCode);
        } catch {
            // Ignore quota/privacy errors
        }
    }, [state.sessionStats, state.settings, state.playerName, state.playerId, state.playerCode]);

    return {state, dispatch, actions: {startRun, answer, createNewPlayer, loginByCode, useItem}};
}