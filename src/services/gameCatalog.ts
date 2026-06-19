import {ItemId} from '../types/game';
import type {Item, Tower} from '../types/game';
import {EnemyType} from '../types/game';

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
        floors: 5,
        roomsPerFloor: 5,
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
        floors: 5,
        roomsPerFloor: 5,
        badge_image: '/assets/badges/angles_badge.png',
        tower_image: '/assets/towers/angles_tower.png',
    },
];

export const ALL_ITEMS: Item[] = [
    {
        id: ItemId.ADD_TIME,
        name: 'Přesýpací hodiny',
        description: '+30 sekund na příklad',
        icon: '/assets/items/timewatch.png'
    },
    {id: ItemId.CHANGE_PROB, name: 'Záměna', description: 'Vyměň příklad za jiný', icon: '/assets/items/change.png'},
    {id: ItemId.HEAL, name: 'Lektvar', description: 'Obnov 1 srdce', icon: '/assets/items/potion.png'},
    {
        id: ItemId.SKIP,
        name: 'Kouřová clona',
        description: 'Přeskoč příklad (bez ztráty)',
        icon: '/assets/items/skip.png'
    },
    {
        id: ItemId.PEEK,
        name: 'Dalekohled',
        description: 'Nakoukni do příští místnosti',
        icon: '/assets/items/dalekohled.png'
    },
];

export interface EnemyTemplate {
    name: string;
    type: EnemyType;
    icon: string;
}

export const ALL_ENEMIES: EnemyTemplate[] = [
    {name: 'Kameňák', type: EnemyType.NORMAL, icon: '/assets/enemies/kamenak.png'},
    {name: 'Mikachu', type: EnemyType.NORMAL, icon: '/assets/enemies/mikachu.png'},
    {name: 'Stínový zloděj', type: EnemyType.NORMAL, icon: '/assets/enemies/stinovy_zlodej.png'},
    {name: 'Nenasytný mimik', type: EnemyType.NORMAL, icon: '/assets/enemies/nenasytny_mimik.png'},
    {name: 'Prastarý mimik', type: EnemyType.NORMAL, icon: '/assets/enemies/prastary_mimik.png'},
    {name: 'Kostěný král', type: EnemyType.MINIBOSS, icon: '/assets/enemies/kosteny_kral.png'},

    {name: 'Masožravá rostlina', type: EnemyType.NORMAL, icon: '/assets/enemies/masozrava_rostlina.png'},
    {name: 'Divoký kňour', type: EnemyType.NORMAL, icon: '/assets/enemies/divoky_knour.png'},
    {name: 'Vražedný klaun', type: EnemyType.NORMAL, icon: '/assets/enemies/vrazedny_klaun.png'},
    {name: 'Levitující lebka', type: EnemyType.NORMAL, icon: '/assets/enemies/levitujici_lebka.png'},
    {name: 'Mladá chiméra', type: EnemyType.NORMAL, icon: '/assets/enemies/mlada_chimera.png'},
    {name: 'Bažinný skřet', type: EnemyType.NORMAL, icon: '/assets/enemies/bazinny_skret.png'},

    {name: 'Kostěný voják', type: EnemyType.NORMAL, icon: '/assets/enemies/kosteny_vojak.png'},
    {name: 'Pochmurný strážce', type: EnemyType.NORMAL, icon: '/assets/enemies/pochmurny_strazce.png'},
    {name: 'Válečný slon', type: EnemyType.BOSS, icon: '/assets/enemies/valecny_slon.png'},
    {name: 'Nemrtvý legionář', type: EnemyType.NORMAL, icon: '/assets/enemies/nemrtvy_legionar.png'},
    {name: 'Ork berserk', type: EnemyType.NORMAL, icon: '/assets/enemies/ork_berserk.png'},

    {name: 'Krystalický pavouk', type: EnemyType.MINIBOSS, icon: '/assets/enemies/krystalicky_pavouk.png'},
    {name: 'Temný nekromant', type: EnemyType.MINIBOSS, icon: '/assets/enemies/temny_nekromant.png'},
    {name: 'Bažinná hydra', type: EnemyType.BOSS, icon: '/assets/enemies/bazinna_hydra.png'},
    {name: 'Minotaurí šampión', type: EnemyType.BOSS, icon: '/assets/enemies/minotauri_sampion.png'},
    {name: 'Pán upírů', type: EnemyType.BOSS, icon: '/assets/enemies/pan_upiru.png'},
    {name: 'Ozbrojený troll', type: EnemyType.MINIBOSS, icon: '/assets/enemies/ozbrojeny_troll.png'},

    {name: 'Kamenný titán', type: EnemyType.MINIBOSS, icon: '/assets/enemies/kamenny_titan.png'},
    {name: 'Skřetí krotitel', type: EnemyType.NORMAL, icon: '/assets/enemies/skreti_krotitel.png'},
    {name: 'Skřetí dobyvatel', type: EnemyType.MINIBOSS, icon: '/assets/enemies/skreti_dobyvatel.png'},
    {name: 'Mrazivý drak', type: EnemyType.BOSS, icon: '/assets/enemies/mrazivy_drak.png'},
    {name: 'Horský troll', type: EnemyType.NORMAL, icon: '/assets/enemies/horsky_troll.png'},
    {name: 'Obrněný zlobr', type: EnemyType.MINIBOSS, icon: '/assets/enemies/obrneny_zlobr.png'},
    {name: 'Kamarádský pošťák', type: EnemyType.NORMAL, icon: '/assets/enemies/kamaradsky_postak.png'},
];