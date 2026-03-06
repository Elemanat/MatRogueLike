import { useReducer } from 'react';
import { Screen, RoomType, EnemyType, ItemId } from '../types/game';
import type { GameState, Item, Tower, Enemy, Problem } from '../types/game';

// ── Dummy data ────────────────────────────────────────────────────────────────

export const TOWERS: Tower[] = [
  { id: 'fractions', name: 'Věž zlomků',    topic: 'Zlomky a desetinná čísla', floors: 3, roomsPerFloor: 3 },
  { id: 'times',     name: 'Věž násobilky', topic: 'Násobilka a dělení',        floors: 2, roomsPerFloor: 4 },
];

export const ALL_ITEMS: Item[] = [
  { id: ItemId.ADD_TIME,    name: '⏱ Přesýpací hodiny', description: '+30 sekund na příklad' },
  { id: ItemId.CHANGE_PROB, name: '🔄 Záměna',           description: 'Vyměň příklad za jiný' },
  { id: ItemId.HEAL,        name: '❤️ Lektvar',           description: 'Obnov 1 srdce' },
  { id: ItemId.SKIP,        name: '💨 Kouřová clona',     description: 'Přeskoč příklad (bez ztráty)' },
  { id: ItemId.PEEK,        name: '🔭 Dalekohled',        description: 'Nakukni do příští místnosti' },
];

const PROBLEMS_FRACTIONS: Problem[] = [
  { id: 'f1', question: '1/2 + 1/4 = ?',  correctAnswer: '3/4',  wrongAnswers: ['1/2', '1/6'] },
  { id: 'f2', question: '3/4 − 1/4 = ?',  correctAnswer: '1/2',  wrongAnswers: ['1/4', '1/6'] },
  { id: 'f3', question: '0.5 + 0.3 = ?',  correctAnswer: '0.8',  wrongAnswers: ['0.53', '1.0'] },
  { id: 'f4', question: '1.5 × 2 = ?',    correctAnswer: '3.0',  wrongAnswers: ['2.5', '3.5'] },
  { id: 'f5', question: '2/3 + 1/3 = ?',  correctAnswer: '1',    wrongAnswers: ['2/3', '4/3'] },
  { id: 'f6', question: '5/6 − 1/3 = ?',  correctAnswer: '1/2',  wrongAnswers: ['2/3', '1/6'] },
  { id: 'f7', question: '0.75 − 0.25 = ?', correctAnswer: '0.5', wrongAnswers: ['0.25', '1.0'] },
  { id: 'f8', question: '3/8 + 1/8 = ?',  correctAnswer: '1/2',  wrongAnswers: ['4/16', '3/4'] },
];

const PROBLEMS_TIMES: Problem[] = [
  { id: 't1', question: '6 × 7 = ?',   correctAnswer: '42', wrongAnswers: ['36', '49'] },
  { id: 't2', question: '8 × 9 = ?',   correctAnswer: '72', wrongAnswers: ['63', '81'] },
  { id: 't3', question: '56 ÷ 7 = ?',  correctAnswer: '8',  wrongAnswers: ['6', '9'] },
  { id: 't4', question: '9 × 4 = ?',   correctAnswer: '36', wrongAnswers: ['32', '40'] },
  { id: 't5', question: '63 ÷ 9 = ?',  correctAnswer: '7',  wrongAnswers: ['6', '8'] },
];

const ENEMIES_NORMAL = ['Zlý zlomek', 'Záludná rovnice', 'Číselný duch', 'Rozbitá desetina'];
const ENEMIES_MINIBOSS = ['Miniboss: Velký jmenovatel', 'Miniboss: Mocný součin'];
const ENEMIES_BOSS = ['BOSS: Arcivládce Čísel', 'BOSS: Nekonečný Zlomek'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getProblems(towerId: string): Problem[] {
  return towerId === 'fractions' ? PROBLEMS_FRACTIONS : PROBLEMS_TIMES;
}

function randomProblem(towerId: string): Problem {
  return pick(getProblems(towerId));
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

const initialStats = { enemiesDefeated: 0, floorsCompleted: 0, correctAnswers: 0, wrongAnswers: 0 };

const initialState: GameState = {
  currentScreen:  Screen.LOGIN,
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
  stats:          { ...initialStats },
};

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
  | { type: 'START_RUN' }
  | { type: 'CONTINUE' }
  | { type: 'ANSWER';            correct: boolean }
  | { type: 'USE_ITEM';          itemId: ItemId }
  | { type: 'PICK_CHEST_ITEM';   item: Item }
  | { type: 'TAKE_REWARD' }
  | { type: 'CLOSE_PEEK' }
  | { type: 'PEEK_SKIP_ROOM' }
  | { type: 'RESTART_TO_INTRO' };

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
      currentProblem: enemy ? randomProblem(tower.id) : null,
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
    currentProblem: enemy ? randomProblem(tower.id) : null,
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
      return { ...initialState, playerName: state.playerName, currentScreen: Screen.MENU };

    case 'TO_TOWER_SELECT':
      return { ...state, currentScreen: Screen.TOWER_SELECT };

    case 'TO_INTRO':
      return { ...state, currentScreen: Screen.INTRO };

    case 'TO_SETTINGS':
      return { ...state, currentScreen: Screen.SETTINGS };

    case 'TO_STATISTICS':
      return { ...state, currentScreen: Screen.STATISTICS };

    case 'LOGOUT':
      return { ...initialState, currentScreen: Screen.LOGIN };

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
        currentProblem: enemy ? randomProblem(tower.id) : null,
        peekNextRoom: null,
        rewardItem: null,
        stats: { ...initialStats },
      };
    }

    case 'CONTINUE':
      return advanceRoom(state);

    case 'ANSWER': {
      const tower = state.selectedTower!;
      if (action.correct) {
        const enemy = state.currentEnemy!;
        const newEnemyHp = enemy.hp - 1;
        const newStats = { ...state.stats, correctAnswers: state.stats.correctAnswers + 1 };

        // Boss/Miniboss má více HP — ještě žije
        if (newEnemyHp > 0) {
          return {
            ...state,
            currentEnemy: { ...enemy, hp: newEnemyHp },
            currentProblem: randomProblem(tower.id),
            stats: newStats,
          };
        }

        // Nepřítel poražen
        const defeatedStats = {
          ...newStats,
          enemiesDefeated: newStats.enemiesDefeated + 1,
          floorsCompleted: enemy.type === EnemyType.MINIBOSS || enemy.type === EnemyType.BOSS
            ? newStats.floorsCompleted + 1
            : newStats.floorsCompleted,
        };

        // Boss poražen → výhra
        if (enemy.type === EnemyType.BOSS) {
          return { ...state, currentScreen: Screen.VICTORY, currentEnemy: null, stats: defeatedStats };
        }

        // Miniboss poražen → dialog čaroděje o dokončení patra
        if (enemy.type === EnemyType.MINIBOSS) {
          return {
            ...state,
            currentScreen: Screen.FLOOR_COMPLETE,
            currentEnemy: null,
            stats: defeatedStats,
            rewardItem: null,
          };
        }

        // Normální nepřítel poražen → nabídni odměnu (random item)
        const reward = pick(ALL_ITEMS);
        return {
          ...state,
          currentScreen: Screen.REWARD,
          currentEnemy: null,
          stats: defeatedStats,
          rewardItem: reward,
        };

      } else {
        // Špatná odpověď
        const newHp = state.playerHp - 1;
        const newStats = { ...state.stats, wrongAnswers: state.stats.wrongAnswers + 1 };
        if (newHp <= 0) {
          return { ...state, playerHp: 0, currentScreen: Screen.GAMEOVER, stats: newStats };
        }
        return {
          ...state,
          playerHp: newHp,
          currentProblem: randomProblem(tower.id),
          stats: newStats,
        };
      }
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
            currentProblem: randomProblem(tower.id),
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
      };

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}















