export const Screen = {
    LOGIN: 'LOGIN',
    NEW_PLAYER: 'NEW_PLAYER',
    PLAYER_CODE_DIALOG: 'PLAYER_CODE_DIALOG',
    EXISTING_PLAYER_LOGIN: 'EXISTING_PLAYER_LOGIN',
    MENU: 'MENU',
    TOWER_SELECT: 'TOWER_SELECT',
    INTRO: 'INTRO',
    SETTINGS: 'SETTINGS',
    STATISTICS: 'STATISTICS',
    EMPTY_ROOM: 'EMPTY_ROOM',
    CHEST: 'CHEST',
    COMBAT: 'COMBAT',
    REWARD: 'REWARD',
    FLOOR_COMPLETE: 'FLOOR_COMPLETE',
    GAMEOVER: 'GAMEOVER',
    VICTORY: 'VICTORY',
} as const;
export type Screen = (typeof Screen)[keyof typeof Screen];

export const EnemyType = {
    NORMAL: 'NORMAL',
    MINIBOSS: 'MINIBOSS',
    BOSS: 'BOSS',
} as const;
export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];

export const RoomType = {
    EMPTY: 'EMPTY',
    CHEST: 'CHEST',
    COMBAT: 'COMBAT',
    MINIBOSS: 'MINIBOSS',
    BOSS: 'BOSS',
} as const;
export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const ItemId = {
    ADD_TIME: 'ADD_TIME',
    CHANGE_PROB: 'CHANGE_PROB',
    HEAL: 'HEAL',
    SKIP: 'SKIP',
    PEEK: 'PEEK',
} as const;
export type ItemId = (typeof ItemId)[keyof typeof ItemId];

export interface Enemy {
    name: string;
    type: EnemyType;
    maxHp: number;
    hp: number;
}

export interface Item {
    id: ItemId;
    name: string;
    description: string;
}

export interface Problem {
    id: string;
    prompt: string;
    correctAnswers: string[];
    wrongAnswers: string[];
    topic: string;
    difficulty: number;
}

export interface Tower {
    id: string;
    name: string;
    topic: string;
    floors: number;
    roomsPerFloor: number;
}

export interface PlayerStats {
    enemiesDefeated: number;
    floorsCompleted: number;
    correctAnswers: number;
    wrongAnswers: number;
}

export interface GameSettings {
    roundTimeSeconds: number;
    soundEnabled: boolean;
    reducedMotion: boolean;
}

export interface GameState {
    currentScreen: Screen;
    runId: string | null;
    playerId: string | null;
    playerCode: string | null;
    playerName: string;
    playerHp: number;
    playerMaxHp: number;
    floor: number;
    room: number;
    inventory: Item[];
    currentEnemy: Enemy | null;
    currentProblem: Problem | null;
    selectedTower: Tower | null;
    peekNextRoom: RoomType | null;
    rewardItem: Item | null;
    runStats: PlayerStats;
    sessionStats: PlayerStats;
    settings: GameSettings;
    wrongAnswerDialog: { prompt: string; yourAnswer: string; correctAnswers: string[] } | null;
    isLoading?: boolean;
    loginError?: string;
}