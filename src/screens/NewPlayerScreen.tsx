import React, {useState} from 'react';

const ANIMALS = [
    {emoji: '🐶', label: 'Pes', icon: '/assets/icons/dog_icon.png'},
    {emoji: '🐱', label: 'Kočka', icon: '/assets/icons/cat_icon.png'},
    {emoji: '🐸', label: 'Žába', icon: '/assets/icons/frog_icon.png'},
    {emoji: '🦊', label: 'Liška', icon: '/assets/icons/fox_icon.png'},
    {emoji: '🐼', label: 'Panda', icon: '/assets/icons/panda_icon_no_bg.png'},
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
            <h1 className="text-5xl font-bold rpg-title" style={{color: 'var(--ink)'}}>VěžMat</h1>
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
                    <p className="text-base font-semibold" style={{color: 'var(--red)'}}>
                        ❌ {error}
                    </p>
                )}
            </div>

            <div className="w-full flex flex-col gap-2">
                <p className="text-sm text-center" style={{color: 'var(--ink-light)'}}>
                    Vyber si své tajné zvířátko:
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    {ANIMALS.map(animal => (
                        <button
                            key={animal.emoji}
                            className="sketch-box w-28 h-28 p-2 rounded-lg transition-all flex items-center justify-center"
                            style={{
                                background: selectedAnimal === animal.emoji ? 'var(--paper-dark)' : 'var(--paper)',
                                border: selectedAnimal === animal.emoji
                                    ? '3px solid var(--ink)'
                                    : '2px solid var(--ink-light)',
                                opacity: isLoading ? 0.5 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: selectedAnimal === animal.emoji
                                    ? '0 0 10px rgba(44,44,62,0.3)'
                                    : '0.2rem 0.2rem 0 var(--ink)',
                            }}
                            onClick={() => setSelectedAnimal(animal.emoji)}
                            disabled={isLoading}
                            title={animal.label}
                        >
                            <img
                                src={animal.icon}
                                alt={animal.label}
                                className={animal.emoji === '🐼' ? 'icon-no-bg w-30 h-30 object-contain' : 'w-20 h-20 object-contain'}
                            />
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

