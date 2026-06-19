import React from 'react';

interface Props {
    text: string;
}

export const TextWithFractions: React.FC<Props> = ({ text }) => {
    const parts = text.split(/(-?\d+\/-?\d+)/g);

    return (
        <>
            {parts.map((part, index) => {
                if (part.match(/^-?\d+\/-?\d+$/)) {
                    const [num, den] = part.split('/');
                    return (
                        <span key={index} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 4px', lineHeight: '1.2' }}>
                            <span style={{ borderBottom: '2px solid currentColor', padding: '0 2px' }}>{num}</span>
                            <span>{den}</span>
                        </span>
                    );
                }

                const formattedPart = part
                    .replace(/(\d)\.(\d)/g, '$1,$2')
                    .replace(/\*/g, '·')
                    .replace(/\//g, ':');

                return <span key={index}>{formattedPart}</span>;
            })}
        </>
    );
};