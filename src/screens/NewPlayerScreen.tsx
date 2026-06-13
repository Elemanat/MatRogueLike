import React, {useState} from 'react';

const ANIMALS = [
    {emoji: '🐶', label: 'Pes'},
    {emoji: '🐱', label: 'Kočka'},
    {emoji: '🐸', label: 'Žába'},
    {emoji: '🦊', label: 'Liška'},
    {emoji: '🐼', label: 'Panda'},
] as const;

interface Props {
    onSubmit: (name: string, secretAnimal: string) => void;
    onBack: () => void;
    isLoading?: boolean;
    error?: string;
}

export const NewPlayerScreen: React.FC<Props> = ({onSubmit, onBack, isLoading, error}) => {
    const [name, setName] = useState('');
    const [selectedAnimal, setSelectedAnimal] = useState<string>('🐶');

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim(), selectedAnimal);
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

                {error && (
                    <p className="text-base font-semibold" style={{color: 'var(--danger)'}}>
                        ❌ {error}
                    </p>
                )}
            </div>

            <div className="w-full flex flex-col gap-2">
                <p className="text-sm text-center" style={{color: 'var(--ink-light)'}}>
                    Vyber si své tajné zvířátko:
                </p>
                <div className="flex gap-3 justify-center">
                    {ANIMALS.map(animal => (
                        <button
                            key={animal.emoji}
                            className="text-3xl px-4 py-3 rounded-lg transition-all"
                            style={{
                                background: selectedAnimal === animal.emoji ? 'var(--primary)' : 'var(--paper)',
                                border: selectedAnimal === animal.emoji
                                    ? '3px solid var(--ink)'
                                    : '2px solid var(--ink-light)',
                                opacity: isLoading ? 0.5 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                            onClick={() => setSelectedAnimal(animal.emoji)}
                            disabled={isLoading}
                            title={animal.label}
                        >
                            {animal.emoji}
                        </button>
                    ))}
                </div>
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

