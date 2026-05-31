import { useCallback, useEffect, useReducer } from 'react';
import { Screen, RoomType, EnemyType, ItemId } from '../types/game';
import type { GameState, Item, Tower, Enemy, Problem, PlayerStats, GameSettings } from '../types/game';
import { ALL_ITEMS } from '../services/gameCatalog';
import { apiClient } from '../services/api';
import { mapProblemDtoToProblem } from '../services/api/mappers';
import { generateProblem } from '../services/api/problemGenerator';
import type { RunAnswerResponse } from '../services/api/contracts';


const ENEMIES_NORMAL = ['Zlý zlomek', 'Záludná rovnice', 'Číselný duch', 'Rozbitá desetina'];
const ENEMIES_MINIBOSS = ['Miniboss: Velký jmenovatel', 'Miniboss: Mocný součin'];
const ENEMIES_BOSS = ['BOSS: Arcivládce Čísel', 'BOSS: Nekonečný Zlomek'];

const STORAGE_KEY_SESSION_STATS = 'vezmat.sessionStats.v1';
const STORAGE_KEY_SETTINGS = 'vezmat.settings.v1';
const STORAGE_KEY_LAST_PLAYER = 'vezmat.lastPlayer.v1';

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

/**
 * Generates a problem locally (fallback for when API is unavailable).
 * Used to bootstrap initial problem or as fallback when API fails.
 */
function generateLocalProblem(towerId: string, floor: number, enemyType: string): Problem {
  const dto = generateProblem({ towerId, floor, enemyType, seed: `local-${Math.random()}` });
  return mapProblemDtoToProblem(dto);
}

function makeEnemy(type: EnemyType): Enemy {
  if (type === EnemyType.BOSS)     return { name: pick(ENEMIES_BOSS),     type, maxHp: 5, hp: 5 };
  if (type === EnemyType.MINIBOSS) return { name: pick(ENEMIES_MINIBOSS), type, maxHp: 3, hp: 3 };
  return { name: pick(ENEMIES_NORMAL), type, maxHp: 1, hp: 1 };
}

/**
 * Určí typ příští místnosti:
 *  - poslední patro, poslední místnost → BOSS
 *  - poslední místnost v patře         → MINIBOSS
 *  - jinak náhodně EMPTY / CHEST / COMBAT (váhované)
 */
function generateRoomType(room: number, roomsPerFloor: number, floor: number, floors: number): RoomType {
  const isLastFloor = floor === floors;
  const isLastRoom  = room === roomsPerFloor;
  if (isLastFloor && isLastRoom) return RoomType.BOSS;
  if (isLastRoom)                return RoomType.MINIBOSS;
  // 50 % boj, 25 % truhla, 25 % prázdná
  const r = Math.random();
  if (r < 0.5) return RoomType.COMBAT;
  if (r < 0.75) return RoomType.CHEST;
  return RoomType.EMPTY;
}

function screenForRoom(rt: RoomType): Screen {
  if (rt === RoomType.EMPTY)                       return Screen.EMPTY_ROOM;
  if (rt === RoomType.CHEST)                       return Screen.CHEST;
  if (rt === RoomType.COMBAT || rt === RoomType.MINIBOSS || rt === RoomType.BOSS) return Screen.COMBAT;
  return Screen.COMBAT;
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialStats: PlayerStats = { enemiesDefeated: 0, floorsCompleted: 0, correctAnswers: 0, wrongAnswers: 0 };

const initialState: GameState = {
  currentScreen:  Screen.LOGIN,
  runId:          null,
  playerName:     '',
  playerHp:       3,
  playerMaxHp:    3,
  floor:          1,
  room:           1,
  inventory:      [],
  currentEnemy:   null,
  currentProblem: null,
  selectedTower:  null,
  peekNextRoom:   null,
  rewardItem:     null,
  runStats:       { ...initialStats },
  sessionStats:   { ...initialStats },
  settings:       { ...defaultSettings },
  wrongAnswerDialog: null,
};

function initState(): GameState {
  if (typeof window === 'undefined') return initialState;

  const storedStats = readStorageJson<unknown>(STORAGE_KEY_SESSION_STATS);
  const storedSettings = readStorageJson<unknown>(STORAGE_KEY_SETTINGS);
  const storedPlayer = window.localStorage.getItem(STORAGE_KEY_LAST_PLAYER);

  return {
    ...initialState,
    playerName: storedPlayer ?? '',
    sessionStats: isPlayerStats(storedStats) ? storedStats : { ...initialStats },
    settings: isGameSettings(storedSettings)
      ? {
          ...storedSettings,
          roundTimeSeconds: Math.max(10, Math.min(60, storedSettings.roundTimeSeconds)),
        }
      : { ...defaultSettings },
  };
}

// ── Chest items stored outside state (no side-effects in reducer) ─────────────
// Passed as part of PICK_CHEST actions through payload

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_NAME';          name: string }
  | { type: 'SELECT_TOWER';      tower: Tower }
  | { type: 'TO_MENU' }
  | { type: 'TO_TOWER_SELECT' }
  | { type: 'TO_INTRO' }
  | { type: 'TO_SETTINGS' }
  | { type: 'TO_STATISTICS' }
  | { type: 'LOGOUT' }
  | { type: 'START_RUN'; runId?: string; initialProblem?: Problem | null }
  | { type: 'CONTINUE' }
  | { type: 'ANSWER';            correct: boolean; answer?: string; result?: ResolvedRunAnswerResponse }
  | { type: 'USE_ITEM';          itemId: ItemId }
  | { type: 'PICK_CHEST_ITEM';   item: Item }
  | { type: 'TAKE_REWARD' }
  | { type: 'CLOSE_PEEK' }
  | { type: 'PEEK_SKIP_ROOM' }
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
       currentProblem: enemy ? generateLocalProblem(tower.id, nextFloor, enemy.type === EnemyType.BOSS ? 'BOSS' : enemy.type === EnemyType.MINIBOSS ? 'MINIBOSS' : 'NORMAL') : null,
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
     currentProblem: enemy ? generateLocalProblem(tower.id, state.floor, enemy.type === EnemyType.BOSS ? 'BOSS' : enemy.type === EnemyType.MINIBOSS ? 'MINIBOSS' : 'NORMAL') : null,
     peekNextRoom: null,
     rewardItem: null,
   };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'SET_NAME':
      return { ...state, playerName: action.name };

    case 'SELECT_TOWER':
      return { ...state, selectedTower: action.tower };

    case 'TO_MENU':
      return {
        ...initialState,
        playerName: state.playerName,
        currentScreen: Screen.MENU,
        sessionStats: state.sessionStats,
        settings: state.settings,
      };

    case 'TO_TOWER_SELECT':
      return { ...state, currentScreen: Screen.TOWER_SELECT };

    case 'TO_INTRO':
      return { ...state, currentScreen: Screen.INTRO };

    case 'TO_SETTINGS':
      return { ...state, currentScreen: Screen.SETTINGS };

    case 'TO_STATISTICS':
      return { ...state, currentScreen: Screen.STATISTICS };

    case 'LOGOUT':
      return { ...initialState, currentScreen: Screen.LOGIN, settings: state.settings };

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
         currentProblem: enemy ? (action.initialProblem ?? generateLocalProblem(tower.id, 1, enemy.type === EnemyType.BOSS ? 'BOSS' : enemy.type === EnemyType.MINIBOSS ? 'MINIBOSS' : 'NORMAL')) : null,
         peekNextRoom: null,
         rewardItem: null,
         runStats: { ...initialStats },
         runId: action.runId ?? null,
       };
     }

    case 'CONTINUE':
      return advanceRoom(state);

     case 'ANSWER': {
       const tower = state.selectedTower;
       if (!tower || !state.currentEnemy) return state;

       const apiState = action.result?.state;
       const nextProblem = action.result?.nextProblem ?? (tower ? generateLocalProblem(tower.id, state.floor, state.currentEnemy.type === EnemyType.BOSS ? 'BOSS' : state.currentEnemy.type === EnemyType.MINIBOSS ? 'MINIBOSS' : 'NORMAL') : null);

       if (action.correct) {
         const enemy = state.currentEnemy;
         const newEnemyHp = enemy.hp - 1;
         const runStats = { ...state.runStats, correctAnswers: state.runStats.correctAnswers + 1 };
         const sessionStats = { ...state.sessionStats, correctAnswers: state.sessionStats.correctAnswers + 1 };

         if (newEnemyHp > 0 && apiState !== 'ENEMY_DEFEATED' && apiState !== 'FLOOR_COMPLETE' && apiState !== 'GAME_OVER' && apiState !== 'VICTORY') {
           return {
             ...state,
             currentEnemy: { ...enemy, hp: newEnemyHp },
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
           return {
             ...state,
             currentScreen: Screen.FLOOR_COMPLETE,
             currentEnemy: null,
             currentProblem: null,
             runStats: runDefeatedStats,
             sessionStats: sessionDefeatedStats,
             rewardItem: null,
           };
         }

         const reward = resolveRewardItem(action.result?.rewardItemId);
         return {
           ...state,
           currentScreen: Screen.REWARD,
           currentEnemy: null,
           currentProblem: null,
           runStats: runDefeatedStats,
           sessionStats: sessionDefeatedStats,
           rewardItem: reward,
         };
       }

       const newHp = state.playerHp - 1;
       const runStats = { ...state.runStats, wrongAnswers: state.runStats.wrongAnswers + 1 };
       const sessionStats = { ...state.sessionStats, wrongAnswers: state.sessionStats.wrongAnswers + 1 };

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
         // Show dialog with wrong answer feedback
         wrongAnswerDialog: {
           question: state.currentProblem?.question || 'Příklad',
           yourAnswer: action.answer || '?',
           correctAnswer: state.currentProblem?.correctAnswer || '?',
         },
       };
     }

     case 'CLOSE_WRONG_ANSWER_DIALOG':
       return { ...state, wrongAnswerDialog: null };

    case 'CAMP_REST':
      return advanceRoom({
        ...state,
        playerHp: Math.min(state.playerMaxHp, state.playerHp + 1),
      });

    case 'CAMP_SCAVENGE': {
      // 50% Ĺˇance na nalezenĂ nĂˇhodnĂ©ho pĹ™edmÄ›tu
      const foundItem = Math.random() < 0.5 ? resolveRewardItem() : null;
      if (foundItem) {
        return advanceRoom({ ...state, inventory: [...state.inventory, foundItem] });
      }
      return advanceRoom(state);
    }

    case 'TAKE_REWARD': {
      const withReward = state.rewardItem
        ? { ...state, inventory: [...state.inventory, state.rewardItem], rewardItem: null }
        : { ...state, rewardItem: null };
      return advanceRoom(withReward);
    }

    case 'USE_ITEM': {
      const tower = state.selectedTower!;

      // Odstraň první item s daným id z inventáře
      const withoutOne = (id: ItemId): Item[] => {
        let removed = false;
        return state.inventory.filter(item => {
          if (!removed && item.id === id) { removed = true; return false; }
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
             currentProblem: state.currentEnemy ? generateLocalProblem(tower.id, state.floor, state.currentEnemy.type === EnemyType.BOSS ? 'BOSS' : state.currentEnemy.type === EnemyType.MINIBOSS ? 'MINIBOSS' : 'NORMAL') : null,
             inventory: withoutOne(ItemId.CHANGE_PROB),
           };
        case ItemId.SKIP: {
          // Nelze přeskočit bosse ani minibosse
          const e = state.currentEnemy;
          if (e && (e.type === EnemyType.BOSS || e.type === EnemyType.MINIBOSS)) return state;
          return advanceRoom({ ...state, inventory: withoutOne(ItemId.SKIP) });
        }
        case ItemId.PEEK: {
          const nextRoomNum = state.room + 1 > tower.roomsPerFloor ? 1 : state.room + 1;
          const nextFloor   = state.room + 1 > tower.roomsPerFloor ? state.floor + 1 : state.floor;
          const peeked = generateRoomType(nextRoomNum, tower.roomsPerFloor, nextFloor, tower.floors);
          return {
            ...state,
            peekNextRoom: peeked,
            inventory: withoutOne(ItemId.PEEK),
          };
        }
        case ItemId.ADD_TIME:
          // Timer logika je v CombatScreen přes toast, zde jen odebereme item
          return { ...state, inventory: withoutOne(ItemId.ADD_TIME) };
        default:
          return state;
      }
    }

    case 'PICK_CHEST_ITEM':
      return advanceRoom({ ...state, inventory: [...state.inventory, action.item] });

    case 'CLOSE_PEEK':
      return { ...state, peekNextRoom: null };

    case 'PEEK_SKIP_ROOM': {
      const e = state.currentEnemy;
      if (e && (e.type === EnemyType.BOSS || e.type === EnemyType.MINIBOSS)) {
        return { ...state, peekNextRoom: null };
      }
      return advanceRoom({ ...state, peekNextRoom: null });
    }

    case 'RESTART_TO_INTRO':
      return {
        ...initialState,
        playerName: state.playerName,
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
        sessionStats: { ...initialStats },
      };

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState, initState);

  const startRun = useCallback(async () => {
    const tower = state.selectedTower;
    if (!tower) return;

    try {
      const response = await apiClient.runs.startRun({
        playerName: state.playerName,
        towerId: tower.id,
      });

      dispatch({
        type: 'START_RUN',
        runId: response.runId,
        initialProblem: response.initialProblem ? mapProblemDtoToProblem(response.initialProblem) : null,
      });
    } catch {
      dispatch({ type: 'START_RUN' });
    }
  }, [state.playerName, state.selectedTower]);

  const answer = useCallback(async (answerText: string, correct: boolean) => {
    const runId = state.runId;
    const problemId = state.currentProblem?.id;

    if (!runId || !problemId) {
      dispatch({ type: 'ANSWER', answer: answerText, correct });
      return;
    }

    try {
      const response = await apiClient.runs.answer({
        runId,
        problemId,
        answer: answerText,
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
      dispatch({ type: 'ANSWER', answer: answerText, correct });
    }
  }, [state.currentProblem?.id, state.runId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_SESSION_STATS, JSON.stringify(state.sessionStats));
      window.localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(state.settings));
      window.localStorage.setItem(STORAGE_KEY_LAST_PLAYER, state.playerName);
    } catch {
      // Ignore quota/privacy errors; game should remain playable without persistence.
    }
  }, [state.sessionStats, state.settings, state.playerName]);

  return { state, dispatch, actions: { startRun, answer } };
}
















