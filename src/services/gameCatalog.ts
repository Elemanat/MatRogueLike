import { ItemId } from '../types/game';
import type { Item, Tower } from '../types/game';

export const TOWERS: Tower[] = [
  { id: 'fractions', name: 'Vez zlomku', topic: 'Zlomky a desetinna cisla', floors: 3, roomsPerFloor: 3 },
  { id: 'times', name: 'Vez nasobilky', topic: 'Nasobilka a deleni', floors: 2, roomsPerFloor: 4 },
];

export const ALL_ITEMS: Item[] = [
  { id: ItemId.ADD_TIME, name: 'Presypaci hodiny', description: '+30 sekund na priklad' },
  { id: ItemId.CHANGE_PROB, name: 'Zamena', description: 'Vymen priklad za jiny' },
  { id: ItemId.HEAL, name: 'Lektvar', description: 'Obnov 1 srdce' },
  { id: ItemId.SKIP, name: 'Kourova clona', description: 'Preskoc priklad (bez ztraty)' },
  { id: ItemId.PEEK, name: 'Dalekohled', description: 'Nakukni do pristi mistnosti' },
];

