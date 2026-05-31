import React from 'react';
import type { Tower } from '../types/game';

interface Props {
  tower: Tower;
  floor: number;
  room: number;
}

export const MiniMap: React.FC<Props> = ({ tower, floor, room }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
      {/* Patra shora dolů, aktuální patro zvýrazněno */}
      {Array.from({ length: tower.floors }, (_, fi) => {
        const floorNum = tower.floors - fi; // kreslit od vrchu
        const isCurrentFloor = floorNum === floor;
        return (
          <div key={floorNum} style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            {/* Číslo patra */}
            <span style={{
              fontSize: '0.65rem',
              color: isCurrentFloor ? 'var(--ink)' : 'var(--grid)',
              width: '0.6rem',
              textAlign: 'right',
              fontWeight: isCurrentFloor ? 700 : 400,
            }}>
              {floorNum}
            </span>
            {/* Místnosti */}
            {Array.from({ length: tower.roomsPerFloor }, (__, ri) => {
              const roomNum = ri + 1;
              const isDone = isCurrentFloor
                ? roomNum < room
                : floorNum < floor;
              const isCurrent = isCurrentFloor && roomNum === room;
              const isFuture = floorNum > floor || (isCurrentFloor && roomNum > room);

              return (
                <div
                  key={roomNum}
                  title={`Patro ${floorNum}, místnost ${roomNum}`}
                  style={{
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '0.125rem',
                    border: isCurrent ? '0.125rem solid var(--ink)' : '0.065rem solid var(--grid)',
                    background: isCurrent
                      ? 'var(--red)'
                      : isDone
                      ? 'var(--ink)'
                      : isFuture
                      ? 'transparent'
                      : 'var(--paper)',
                    boxSizing: 'border-box',
                  }}
                />
              );
            })}
            {/* Boss/Miniboss ikona na konci patra */}
            <span style={{ fontSize: '0.6rem', marginLeft: '0.065rem' }}>
              {floorNum === tower.floors ? '👑' : '💀'}
            </span>
          </div>
        );
      })}
    </div>
  );
};


