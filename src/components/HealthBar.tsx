import React from 'react';

interface Props {
    health: number;
    maxHealth?: number;
}

export const HealthBar: React.FC<Props> = ({health, maxHealth = 3}) => (
    <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
        {Array.from({length: maxHealth}).map((_, i) => {
            const filled = i < health;
            const fillColor = filled ? 'var(--red)' : `url(#hatch-${i})`;

            return (
                <svg key={i} width="28" height="28" viewBox="0 0 26 26">
                    <defs>
                        <pattern id={`hatch-${i}`} patternUnits="userSpaceOnUse" width="4" height="4"
                                 patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="4" stroke="#374151" strokeWidth="1.5" strokeOpacity="0.5"/>
                        </pattern>
                    </defs>
                    <path
                        d="M13 22 C13 22 3 15.5 3 9.5 C3 6.4 5.4 4 8.5 4 C10.2 4 11.8 4.9 13 6.3 C14.2 4.9 15.8 4 18.5 4 C21.6 4 24 6.4 24 9.5 C24 15.5 13 22 13 22Z"
                        fill={fillColor}
                        stroke={'var(--ink)'}
                        strokeWidth="1.8"
                    />
                </svg>
            );
        })}
    </div>
);
