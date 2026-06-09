import React from 'react';

interface Props {
    playerName: string;
    playerCode: string;
    onClose: () => void;
}

export const PlayerCodeDialog: React.FC<Props> = ({playerName, playerCode, onClose}) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(playerCode).catch(console.error);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div
                className="sketch-box p-8 w-full max-w-sm flex flex-col gap-6 rounded-lg border-2"
                style={{
                    backgroundColor: 'var(--paper)',
                    borderColor: 'var(--ink)'
                }}
            >
                <h2 className="text-4xl font-bold text-center" style={{color: 'var(--ink)'}}>
                    🎉 Vítej!
                </h2>

                <p className="text-lg text-center" style={{color: 'var(--ink)'}}>
                    Ahoj, <strong>{playerName}</strong>!
                </p>

                <div className="flex flex-col gap-2">
                    <p className="text-sm" style={{color: 'var(--ink-light)'}}>
                        Tvůj unikátní kód:
                    </p>
                    <div
                        className="p-4 border-2 rounded text-center bg-white"
                        style={{borderColor: 'var(--ink)'}}
                    >
                        <p className="text-2xl font-mono font-bold" style={{color: 'var(--ink)', letterSpacing: '0.1em'}}>
                            {playerCode}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-center" style={{color: 'var(--ink-light)'}}>
                    Zkopíruj si svůj kód. Buď ho potřebovat příště pro přihlášení!
                </p>

                <div className="flex gap-3 flex-col">
                    <button
                        className="sketch-btn sketch-btn-primary text-lg py-2 w-full"
                        onClick={copyToClipboard}
                    >
                        📋 Kopírovat
                    </button>
                    <button
                        className="sketch-btn text-lg py-2 w-full"
                        onClick={onClose}
                    >
                        Pokračovat →
                    </button>
                </div>
            </div>
        </div>
    );
};

