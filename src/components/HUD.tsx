import React from 'react';
import {HealthBar} from './HealthBar';
import {MiniMap} from './MiniMap';
import type {Tower} from '../types/game';

interface Props {
    tower: Tower;
    floor: number;
    room: number;
    playerHp: number;
    playerMaxHp: number;
}

export const HUD: React.FC<Props> = ({tower, floor, room, playerHp, playerMaxHp}) => (
    <div
        className="flex items-center justify-between px-3 py-2 md:px-8 md:py-5 w-full"
        style={{
            borderBottom: '0.125rem solid var(--ink)',
            background: 'var(--paper-dark)',
        }}
    >
        {/* Vlevo: název věže + patro/místnost (zabere levou polovinu volného místa) */}
        <div className="flex flex-col min-w-0 flex-1 justify-center" style={{color: 'var(--ink)', lineHeight: 1.2}}>
            <div className="font-bold truncate text-[0.85rem] md:text-xl">
                {tower.name}
            </div>
            <div className="text-[0.75rem] md:text-base mt-1" style={{color: 'var(--ink-light)'}}>
                P{floor}/{tower.floors} · M{room}/{tower.roomsPerFloor}
            </div>
        </div>

        {/* Střed: minimapa (zůstane pevně uprostřed) */}
        <div className="flex-shrink-0 flex justify-center md:scale-125 origin-center mx-4">
            <MiniMap tower={tower} floor={floor} room={room}/>
        </div>

        {/* Vpravo: HP (zabere pravou polovinu volného místa a zarovná srdíčka doprava) */}
        <div className="flex-1 flex justify-end items-center">
            {/* Samotné škálování aplikujeme až na vnitřní div, aby se nedeformoval celý layout */}
            <div className="md:scale-[1.4] origin-right">
                <HealthBar health={playerHp} maxHealth={playerMaxHp}/>
            </div>
        </div>
    </div>
);