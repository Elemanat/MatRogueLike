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
                <h2 className="text-4xl font-bold text-center flex items-center justify-center gap-3"
                    style={{color: 'var(--ink)'}}>
                    <img
                        src="/assets/icons/confetti_icon.png"
                        alt="Radost"
                        className="h-10 w-10 object-contain"
                    />
                    Vítej!
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
                        <p className="text-2xl font-mono font-bold"
                           style={{color: 'var(--ink)', letterSpacing: '0.1em'}}>
                            {playerCode}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-center" style={{color: 'var(--ink-light)'}}>
                    Zkopíruj si svůj kód. Budeš ho potřebovat příště pro přihlášení!
                </p>

                <div className="flex gap-3 flex-col">
                    <button
                        className="sketch-btn text-lg py-2 w-full flex items-center justify-center gap-3"
                        onClick={copyToClipboard}
                    >
                        <img
                            src="/assets/icons/clipboard_icon.png"
                            alt="Clipboard icon"
                            className="h-7 w-7 object-contain"
                        />
                        Kopírovat
                    </button>

                    <button
                        className="sketch-btn text-lg py-2 w-full flex items-center justify-center gap-3"
                        onClick={onClose}
                    >
                        Pokračovat
                        <img
                            src="/assets/icons/gate_icon.png"
                            alt="Pokračovat"
                            className="h-8 w-8 object-contain"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};