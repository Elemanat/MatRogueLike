import React from 'react';
import type { Tower } from '../types/game';

interface Props {
  tower: Tower;
  floor: number;
  room: number;
}

export const MiniMap: React.FC<Props> = ({ tower, floor, room }) => {
  return (
      <div className="flex flex-col items-center gap-0.5">
        {/* Patra shora dolů, aktuální patro zvýrazněno */}
        {Array.from({ length: tower.floors }, (_, fi) => {
          const floorNum = tower.floors - fi; // kreslit od vrchu
          const isCurrentFloor = floorNum === floor;
          return (
              <div key={floorNum} className="flex items-center gap-0.5">
                {/* Číslo patra */}
                <span
                    className={`w-2.5 text-right text-[0.65rem] ${isCurrentFloor ? 'font-bold' : 'font-normal'}`}
                    style={{ color: isCurrentFloor ? 'var(--ink)' : 'var(--grid)' }}
                >
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
                          className="w-3 h-3 rounded-sm box-border"
                          style={{
                            border: isCurrent ? '0.125rem solid var(--ink)' : '0.065rem solid var(--grid)',
                            background: isCurrent
                                ? 'var(--red)'
                                : isDone
                                    ? 'var(--ink)'
                                    : isFuture
                                        ? 'transparent'
                                        : 'var(--paper)',
                          }}
                      />
                  );
                })}

                {/* Boss/Miniboss ikona na konci patra */}
                <span className="text-[0.6rem] ml-[0.065rem]">
              {floorNum === tower.floors ? '👑' : '💀'}
            </span>
              </div>
          );
        })}
      </div>
  );
};