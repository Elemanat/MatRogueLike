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
    // --- NORMAL ---
    {name: 'Kameňák', type: EnemyType.NORMAL, icon: '/assets/enemies/kamenak.png'},
    {name: 'Mikachu', type: EnemyType.NORMAL, icon: '/assets/enemies/mikachu.png'},
    {name: 'Stínový zloděj', type: EnemyType.NORMAL, icon: '/assets/enemies/stinovy_zlodej.png'},
    {name: 'Nenasytný mimik', type: EnemyType.NORMAL, icon: '/assets/enemies/nenasytny_mimik.png'},
    {name: 'Prastarý mimik', type: EnemyType.NORMAL, icon: '/assets/enemies/prastary_mimik.png'},
    {name: 'Masožravá rostlina', type: EnemyType.NORMAL, icon: '/assets/enemies/masozrava_rostlina.png'},
    {name: 'Divoký kňour', type: EnemyType.NORMAL, icon: '/assets/enemies/divoky_knour.png'},
    {name: 'Vražedný klaun', type: EnemyType.NORMAL, icon: '/assets/enemies/vrazedny_klaun.png'},
    {name: 'Levitující lebka', type: EnemyType.NORMAL, icon: '/assets/enemies/levitujici_lebka.png'},
    {name: 'Mladá chiméra', type: EnemyType.NORMAL, icon: '/assets/enemies/mlada_chimera.png'},
    {name: 'Bažinný skřet', type: EnemyType.NORMAL, icon: '/assets/enemies/bazinny_skret.png'},
    {name: 'Kostěný voják', type: EnemyType.NORMAL, icon: '/assets/enemies/kosteny_vojak.png'},
    {name: 'Pochmurný strážce', type: EnemyType.NORMAL, icon: '/assets/enemies/pochmurny_strazce.png'},
    {name: 'Nemrtvý legionář', type: EnemyType.NORMAL, icon: '/assets/enemies/nemrtvy_legionar.png'},
    {name: 'Ork berserk', type: EnemyType.NORMAL, icon: '/assets/enemies/ork_berserk.png'},
    {name: 'Skřetí krotitel', type: EnemyType.NORMAL, icon: '/assets/enemies/skreti_krotitel.png'},
    {name: 'Horský troll', type: EnemyType.NORMAL, icon: '/assets/enemies/horsky_troll.png'},
    {name: 'Kamarádský pošťák', type: EnemyType.NORMAL, icon: '/assets/enemies/kamaradsky_postak.png'},
    {name: 'Zrádný obchodník', type: EnemyType.NORMAL, icon: '/assets/enemies/zradny_obchodnik.png'},
    {name: 'Naštvaný matikář', type: EnemyType.NORMAL, icon: '/assets/enemies/nastvany_matikar.png'},
    {name: 'Naštvaná učitelka', type: EnemyType.NORMAL, icon: '/assets/enemies/nastvana_ucitelka.png'},
    {name: 'Jedovatý sliz', type: EnemyType.NORMAL, icon: '/assets/enemies/jedovaty_sliz.png'},
    {name: 'Ohnivý elementál', type: EnemyType.NORMAL, icon: '/assets/enemies/ohnivy_elemental.png'},
    {name: 'Vzdušný elementál', type: EnemyType.NORMAL, icon: '/assets/enemies/vzdusny_elemental.png'},
    {name: 'Vodní elementál', type: EnemyType.NORMAL, icon: '/assets/enemies/vodni_elemental.png'},
    {name: 'Zemní elementál', type: EnemyType.NORMAL, icon: '/assets/enemies/zemni_elemental.png'},
    {name: 'Obří netopýr', type: EnemyType.NORMAL, icon: '/assets/enemies/obri_netopyr.png'},
    {name: 'Šaman ork', type: EnemyType.NORMAL, icon: '/assets/enemies/skreti_saman.png'},
    {name: 'Zkorumpovaný mág', type: EnemyType.NORMAL, icon: '/assets/enemies/zkorumpovany_mag.png'},
    {name: 'Písečný škorpión', type: EnemyType.NORMAL, icon: '/assets/enemies/pisecny_skorpion.png'},
    {name: 'Krvavý vlk', type: EnemyType.NORMAL, icon: '/assets/enemies/krvavy_vlk.png'},

    // --- MINIBOSS ---
    {name: 'Kostěný král', type: EnemyType.MINIBOSS, icon: '/assets/enemies/kosteny_kral.png'},
    {name: 'Krystalický pavouk', type: EnemyType.MINIBOSS, icon: '/assets/enemies/krystalicky_pavouk.png'},
    {name: 'Temný nekromant', type: EnemyType.MINIBOSS, icon: '/assets/enemies/temny_nekromant.png'},
    {name: 'Ozbrojený troll', type: EnemyType.MINIBOSS, icon: '/assets/enemies/ozbrojeny_troll.png'},
    {name: 'Kamenný titán', type: EnemyType.MINIBOSS, icon: '/assets/enemies/kamenny_titan.png'},
    {name: 'Skřetí dobyvatel', type: EnemyType.MINIBOSS, icon: '/assets/enemies/skreti_dobyvatel.png'},
    {name: 'Obrněný zlobr', type: EnemyType.MINIBOSS, icon: '/assets/enemies/obrneny_zlobr.png'},
    {name: 'Lávový golem', type: EnemyType.MINIBOSS, icon: '/assets/enemies/lavovy_golem.png'},
    {name: 'Královna harpyjí', type: EnemyType.MINIBOSS, icon: '/assets/enemies/kralovna_harpyji.png'},
    {name: 'Šílený alchymista', type: EnemyType.MINIBOSS, icon: '/assets/enemies/sileny_alchymista.png'},
    {name: 'Průzračný přízrak', type: EnemyType.MINIBOSS, icon: '/assets/enemies/pruzracny_prizrak.png'},
    {name: 'Zástupce ředitele', type: EnemyType.MINIBOSS, icon: '/assets/enemies/zastupce_reditele.png'},
    {name: 'Drsný školník', type: EnemyType.MINIBOSS, icon: '/assets/enemies/drsny_skolnik.png'},
    {name: 'Skřetí arcišaman' , type: EnemyType.MINIBOSS, icon: '/assets/enemies/skreti_arcisaman.png'},

    // --- BOSS ---
    {name: 'Válečný slon', type: EnemyType.BOSS, icon: '/assets/enemies/valecny_slon.png'},
    {name: 'Bažinná hydra', type: EnemyType.BOSS, icon: '/assets/enemies/bazinna_hydra.png'},
    {name: 'Minotaurí šampión', type: EnemyType.BOSS, icon: '/assets/enemies/minotauri_sampion.png'},
    {name: 'Pán upírů', type: EnemyType.BOSS, icon: '/assets/enemies/pan_upiru.png'},
    {name: 'Mrazivý drak', type: EnemyType.BOSS, icon: '/assets/enemies/mrazivy_drak.png'},
    {name: 'Pán plamenů', type: EnemyType.BOSS, icon: '/assets/enemies/pan_plamenu.png'},
    {name: 'Pouštní červ', type: EnemyType.BOSS, icon: '/assets/enemies/poustni_cerv.png'},
    {name: 'Pán bouří', type: EnemyType.BOSS, icon: '/assets/enemies/pan_bouri.png'},
    {name: 'Královna pavouků', type: EnemyType.BOSS, icon: '/assets/enemies/kralovna_pavouku.png'},
    {name: 'Ředitel školy' , type: EnemyType.BOSS, icon: '/assets/enemies/reditel_skoly.png'},
    {name: 'Ředitel Amalgám Institucionálního Zmaru' , type: EnemyType.BOSS, icon: '/assets/enemies/reditel_amalgam.png'},
];

function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Přednačte POUZE základní UI herní assety (Věže, Itemy, Pozadí).
 * Ostatní (např. desítky nepřátel) ignorujeme, aby start hry trval jen moment.
 */
export async function preloadGameImages(): Promise<void> {
    const imageUrls: Set<string> = new Set();

    // 1. Zahrneme věže
    TOWERS.forEach(tower => {
        if (tower.badge_image) imageUrls.add(tower.badge_image);
        if (tower.tower_image) imageUrls.add(tower.tower_image);
    });

    // 2. Zahrneme UI předměty a ikonky
    ALL_ITEMS.forEach(item => {
        if (item.icon) imageUrls.add(item.icon);
    });

    // NEPŘÁTELE ÚMYSLNĚ VYNECHÁVÁME! Zpomalují start na 30 vteřin.

    // 3. Dynamický import (pojistka pro další statické věci mimo nepřátele)
    try {
        const assetModules = import.meta.glob('/public/assets/**/*.{png,jpg,svg,webp}', { eager: true });
        Object.keys(assetModules).forEach(path => {
            const assetPath = path.replace('/public', '');

            // KLÍČOVÁ PODMÍNKA: Zabráníme Vite, aby na pozadí nacpal do preloaderu složku s nepřáteli
            if (!assetPath.includes('/enemies/')) {
                imageUrls.add(assetPath);
            }
        });
    } catch (err) {
        console.warn('[Image Preloader] Could not load assets dynamically:', err);
    }

    const urlsArray = Array.from(imageUrls);
    const CONCURRENCY_LIMIT = 6;
    const batches = chunkArray(urlsArray, CONCURRENCY_LIMIT);

    console.log(`[Image Preloader] Starting optimized preload of ${urlsArray.length} UI images...`);

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        await Promise.all(
            batch.map(url =>
                new Promise<void>((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => {
                        console.warn(`[Image Preloader] Failed to preload: ${url}`);
                        resolve();
                    };
                    img.src = url;
                })
            )
        );
    }

    console.log(`[Image Preloader] UI Preload completely finished.`);
}