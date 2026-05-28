import { ItemId } from '../types/game';
import type { Item, Tower } from '../types/game';

export const TOWERS: Tower[] = [
  { id: 'divisibility-primes', name: 'Dělitelnost a prvočísla', topic: 'Hledání dělitelů a poznání prvočísel', floors: 3, roomsPerFloor: 3 },
  { id: 'fractions', name: 'Věž zlomků', topic: 'Zlomky, sčítání a odčítání', floors: 3, roomsPerFloor: 3 },
  { id: 'decimals', name: 'Desetinná čísla', topic: 'Počítání s posunem řádů', floors: 3, roomsPerFloor: 3 },
  { id: 'unit-conversions', name: 'Převody jednotek', topic: 'Délka, čas a hmotnost', floors: 3, roomsPerFloor: 3 },
  { id: 'angles-degrees', name: 'Úhly a stupně', topic: 'Rovinná geometrie a trojúhelníky', floors: 3, roomsPerFloor: 4 },
];

export const ALL_ITEMS: Item[] = [
  { id: ItemId.ADD_TIME, name: 'Presypaci hodiny', description: '+30 sekund na priklad' },
  { id: ItemId.CHANGE_PROB, name: 'Zamena', description: 'Vymen priklad za jiny' },
  { id: ItemId.HEAL, name: 'Lektvar', description: 'Obnov 1 srdce' },
  { id: ItemId.SKIP, name: 'Kourova clona', description: 'Preskoc priklad (bez ztraty)' },
  { id: ItemId.PEEK, name: 'Dalekohled', description: 'Nakukni do pristi mistnosti' },
];
