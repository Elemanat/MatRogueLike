import React, {useState} from 'react';

interface Props {
    onSubmit: (name: string) => void;
    onBack: () => void;
    isLoading?: boolean;
}

export const NewPlayerScreen: React.FC<Props> = ({onSubmit, onBack, isLoading}) => {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
            <h1 className="text-5xl font-bold" style={{color: 'var(--ink)'}}>VěžMat</h1>
            <p className="text-xl text-center" style={{color: 'var(--ink-light)'}}>
                Jak se jmenuješ?
            </p>

            <div className="w-full flex flex-col gap-3">
                <input
                    className="w-full px-3 py-2 text-xl sketch-box outline-none"
                    style={{fontFamily: 'Caveat, cursive', background: 'var(--paper)', color: 'var(--ink)'}}
                    placeholder="Napiš své jméno…"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    maxLength={20}
                    disabled={isLoading}
                />
            </div>

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
                    disabled={!name.trim() || isLoading}
                    onClick={handleSubmit}
                >
                    Pokračovat →
                </button>
            </div>
        </div>
    );
};

