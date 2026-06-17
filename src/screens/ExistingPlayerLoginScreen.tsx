import React, {useState} from 'react';

interface Props {
    onSubmit: (code: string) => void;
    onBack: () => void;
    onRecovery: () => void;
    isLoading?: boolean;
    error?: string;
}

export const ExistingPlayerLoginScreen: React.FC<Props> = ({onSubmit, onBack, onRecovery, isLoading, error}) => {
    const [code, setCode] = useState('');

    const handleSubmit = () => {
        if (code.trim()) {
            onSubmit(code.trim().toUpperCase());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
            <h1 className="text-5xl font-bold rpg-title" style={{color: 'var(--ink)'}}>VěžMat</h1>
            <p className="text-lg text-center" style={{color: 'var(--ink-light)'}}>
                Zadej svůj kód pro přihlášení
            </p>

            <div className="w-full flex flex-col gap-3">
                <input
                    className="w-full px-3 py-2 text-xl sketch-box outline-none text-center font-mono"
                    style={{
                        fontFamily: 'monospace',
                        background: 'var(--paper)',
                        color: 'var(--ink)',
                        letterSpacing: '0.1em'
                    }}
                    placeholder="XXX-XXX-XXX"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    maxLength={20}
                    disabled={isLoading}
                />
            </div>

            {error && (
                <p className="text-lg" style={{color: 'var(--danger)', textAlign: 'center'}}>
                    ❌ {error}
                </p>
            )}

            <div className="flex gap-3 w-full">
                <button
                    className="sketch-btn text-lg py-2 flex-1"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    ← Zpět
                </button>
                <button
                    className="sketch-btn sketch-btn-primary text-lg py-2 flex-1 disabled:opacity-40 transition-opacity"
                    disabled={!code.trim() || isLoading}
                    onClick={handleSubmit}
                >
                    Přihlásit →
                </button>
            </div>

            <button
                className="text-sm underline hover:opacity-70 transition-opacity"
                style={{color: 'var(--ink-light)'}}
                onClick={onRecovery}
                disabled={isLoading}
            >
                Zapomněl jsi kód?
            </button>
        </div>
    );
};

