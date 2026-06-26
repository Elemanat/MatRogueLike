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
    onSurrender: () => void;
}

export const HUD: React.FC<Props> = ({tower, floor, room, playerHp, playerMaxHp, onSurrender}) => (
    <div
        className="flex items-center justify-between px-3 py-2 md:px-8 md:py-5 w-full"
        style={{
            borderBottom: '0.125rem solid var(--ink)',
            background: 'var(--paper-dark)',
        }}
    >
        <div className="flex flex-col min-w-0 flex-1 justify-center" style={{color: 'var(--ink)', lineHeight: 1.2}}>
            <div className="font-bold truncate text-[0.85rem] md:text-xl">
                {tower.name}
            </div>
            <div className="text-[0.75rem] md:text-base mt-1" style={{color: 'var(--ink-light)'}}>
                P{floor}/{tower.floors} · M{room}/{tower.roomsPerFloor}
            </div>
        </div>

        <div className="shrink-0 flex justify-center md:scale-125 origin-center mx-2 md:mx-4">
            <MiniMap tower={tower} floor={floor} room={room}/>
        </div>

        <div className="flex-1 flex justify-center items-center">
            <button
                onClick={onSurrender}
                className="sketch-btn sketch-btn-danger text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-2 transition-transform hover:-translate-y-0.5"
                title="Vzdát pokus"
            >
                <img
                    src="/assets/icons/door_icon.png"
                    alt="Vzdát"
                    className="w-4 h-4 md:w-5 md:h-5 object-contain"
                />
                <span className="hidden sm:inline">Vzdát</span>
            </button>
        </div>

        <div className="shrink-0 flex items-center">
            <div className="md:scale-[1.4] origin-right">
                <HealthBar health={playerHp} maxHealth={playerMaxHp}/>
            </div>
        </div>
    </div>
);