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
            <img
                src="/assets/title.png"
                alt="VěžMat"
                className="w-3/4 md:w-1/2 h-auto object-contain drop-shadow-lg"
            />            <p className="text-lg text-center" style={{color: 'var(--ink-light)'}}>
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
                    <div className="flex items-center gap-2">
                        <img
                            src={'/assets/icons/cross_icon.png'}
                            alt={'Špatná odpověď'}
                            className="h-8 w-8 object-contain"
                        />
                        <span>{error}</span>
                    </div>
                </p>
            )}

            <div className="flex gap-3 w-full">
                <button
                    className="sketch-btn sketch-btn-danger text-xl py-2 flex-1 flex items-center justify-center gap-3"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    <img
                        src="/assets/icons/door_icon.png"
                        alt="Logout"
                        className="h-8 w-8 object-contain"
                    />
                    Zpět
                </button>
                <button
                    className="sketch-btn sketch-btn-primary text-xl py-2 flex-1 flex items-center justify-center gap-3 disabled:opacity-40 transition-opacity"
                    disabled={!code.trim() || isLoading}
                    onClick={handleSubmit}
                >
                    <img
                        src="/assets/icons/gate_icon.png"
                        alt="Vstup"
                        className="h-8 w-8 object-contain"
                    />
                    Přihlásit
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

