import {ItemId} from '../types/game';
import type {Item, Tower} from '../types/game';

export const TOWERS: Tower[] = [
    {
        id: 'divisibility-primes',
        name: 'Dělitelnost a prvočísla',
        topic: 'Hledání dělitelů a poznání prvočísel',
        floors: 5,
        roomsPerFloor: 5
    },
    {id: 'fractions', name: 'Věž zlomků', topic: 'Zlomky, sčítání a odčítání', floors: 5, roomsPerFloor: 5},
    {id: 'decimals', name: 'Desetinná čísla', topic: 'Počítání s posunem řádů', floors: 5, roomsPerFloor: 5},
    {id: 'unit-conversions', name: 'Převody jednotek', topic: 'Délka, čas a hmotnost', floors: 5, roomsPerFloor: 5},
    {
        id: 'angles-degrees',
        name: 'Úhly a stupně',
        topic: 'Rovinná geometrie a trojúhelníky',
        floors: 5,
        roomsPerFloor: 5
    },
];

export const ALL_ITEMS: Item[] = [
    {id: ItemId.ADD_TIME, name: 'Přesýpací hodiny', description: '+30 sekund na příklad'},
    {id: ItemId.CHANGE_PROB, name: 'Záměna', description: 'Vyměň příklad za jiný'},
    {id: ItemId.HEAL, name: 'Lektvar', description: 'Obnov 1 srdce'},
    {id: ItemId.SKIP, name: 'Kouřová clona', description: 'Přeskoč příklad (bez ztráty)'},
    {id: ItemId.PEEK, name: 'Dalekohled', description: 'Nakoukni do příští místnosti'},
];