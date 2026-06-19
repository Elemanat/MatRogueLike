import {ItemId} from '../types/game';
import type {Item, Tower} from '../types/game';

export const TOWERS: Tower[] = [
    {
        id: 'divisibility-primes',
        name: 'Dělitelnost a prvočísla',
        topic: 'Hledání dělitelů a poznání prvočísel',
        floors: 5,
        roomsPerFloor: 5,
        badge_image: '/assets/badges/primal_badge.png',
        tower_image: '/assets/towers/primal_tower.png',
    },

    {
        id: 'fractions',
        name: 'Věž zlomků',
        topic: 'Zlomky, sčítání a odčítání',
        floors: 1,
        roomsPerFloor: 1,
        badge_image: '/assets/badges/fraction_badge.png',
        tower_image: '/assets/towers/fraction_tower.png',
    },

    {
        id: 'decimals',
        name: 'Desetinná čísla',
        topic: 'Počítání s posunem řádů',
        floors: 5,
        roomsPerFloor: 5,
        badge_image: '/assets/badges/decimal_badge.png',
        tower_image: '/assets/towers/decimal_tower.png',
    },

    {
        id: 'unit-conversions',
        name: 'Převody jednotek',
        topic: 'Délka, čas a hmotnost',
        floors: 5,
        roomsPerFloor: 5,
        badge_image: '/assets/badges/conversion_badge.png',
        tower_image: '/assets/towers/conversion_tower.png',
    },

    {
        id: 'angles-degrees',
        name: 'Úhly a stupně',
        topic: 'Rovinná geometrie a trojúhelníky',
        floors: 1,
        roomsPerFloor: 1,
        badge_image: '/assets/badges/angles_badge.png',
        tower_image: '/assets/towers/angles_tower.png',
    },
];

export const ALL_ITEMS: Item[] = [
    {id: ItemId.ADD_TIME, name: 'Přesýpací hodiny', description: '+30 sekund na příklad', icon: '/assets/items/timewatch.png'},
    {id: ItemId.CHANGE_PROB, name: 'Záměna', description: 'Vyměň příklad za jiný', icon: '/assets/items/change.png'},
    {id: ItemId.HEAL, name: 'Lektvar', description: 'Obnov 1 srdce', icon: '/assets/items/potion.png'},
    {id: ItemId.SKIP, name: 'Kouřová clona', description: 'Přeskoč příklad (bez ztráty)', icon: '/assets/items/skip.png'},
    {id: ItemId.PEEK, name: 'Dalekohled', description: 'Nakoukni do příští místnosti', icon: '/assets/items/dalekohled.png'},
];