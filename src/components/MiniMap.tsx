import React from 'react';
import type { Tower } from '../types/game';

interface Props {
  tower: Tower;
  floor: number;
  room: number;
}

export const MiniMap: React.FC<Props> = ({ tower, floor, room }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Patra shora dolů, aktuální patro zvýrazněno */}
      {Array.from({ length: tower.floors }, (_, fi) => {
        const floorNum = tower.floors - fi; // kreslit od vrchu
        const isCurrentFloor = floorNum === floor;
        return (
          <div key={floorNum} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Číslo patra */}
            <span style={{
              fontSize: '0.65rem',
              color: isCurrentFloor ? 'var(--ink)' : 'var(--grid)',
              width: 10,
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
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    border: isCurrent ? '2px solid var(--ink)' : '1px solid var(--grid)',
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
            <span style={{ fontSize: '0.6rem', marginLeft: 1 }}>
              {floorNum === tower.floors ? '👑' : '💀'}
            </span>
          </div>
        );
      })}
    </div>
  );
};


