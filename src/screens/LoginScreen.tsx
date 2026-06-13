import React from 'react';

interface Props {
    onNewPlayer: () => void;
    onExistingPlayer: () => void;
}

export const LoginScreen: React.FC<Props> = ({onNewPlayer, onExistingPlayer}) => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
            <h1 className="text-6xl font-bold" style={{color: 'var(--ink)'}}>VěžMat</h1>
            <p className="text-xl text-center" style={{color: 'var(--ink-light)'}}>
                Matematická věž čeká na svého hrdinu…
            </p>

            <div className="w-full flex flex-col gap-4">
                <button
                    className="sketch-btn sketch-btn-primary text-2xl py-3 w-full"
                    onClick={onNewPlayer}
                >
                    ✨ Nový hráč
                </button>
                <button
                    className="sketch-btn text-2xl py-3 w-full"
                    onClick={onExistingPlayer}
                >
                    🔑 Mám kód
                </button>
            </div>
        </div>
    );
};