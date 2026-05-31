import React from 'react';
import { HealthBar } from './HealthBar';
import { MiniMap } from './MiniMap';
import type { Tower } from '../types/game';

interface Props {
  tower: Tower;
  floor: number;
  room: number;
  playerHp: number;
  playerMaxHp: number;
}

export const HUD: React.FC<Props> = ({ tower, floor, room, playerHp, playerMaxHp }) => (
  <div
    style={{
      borderBottom: '0.125rem solid var(--ink)',
      background: 'var(--paper-dark)',
      padding: '0.4rem 0.6rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem',
    }}
  >
    {/* Vlevo: název věže + patro/místnost */}
    <div style={{ color: 'var(--ink)', lineHeight: 1.2, minWidth: 0 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {tower.name}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)' }}>
        P{floor}/{tower.floors} · M{room}/{tower.roomsPerFloor}
      </div>
    </div>

    {/* Střed: minimapa */}
    <MiniMap tower={tower} floor={floor} room={room} />

    {/* Vpravo: HP */}
    <HealthBar health={playerHp} maxHealth={playerMaxHp} />
  </div>
);
