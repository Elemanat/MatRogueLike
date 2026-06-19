import React, {useState} from 'react';

const ANIMALS = [
    {emoji: '🐶', label: 'Pes', icon: '/assets/icons/dog_icon_no_bg.png'},
    {emoji: '🐱', label: 'Kočka', icon: '/assets/icons/cat_icon_no_bg.png'},
    {emoji: '🐸', label: 'Žába', icon: '/assets/icons/frog_icon_no_bg.png'},
    {emoji: '🦊', label: 'Liška', icon: '/assets/icons/fox_icon_no_bg.png'},
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
            <img
                src="/assets/title.png"
                alt="VěžMat"
                className="w-3/4 md:w-1/2 h-auto object-contain drop-shadow-lg"
            />
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
            </div>

            <div className="w-full flex flex-col gap-2">
                <p className="text-sm text-center" style={{color: 'var(--ink-light)'}}>
                    Vyber si své tajné zvířátko:
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    {ANIMALS.map(animal => (
                        <button
                            key={animal.emoji}
                            className="sketch-box w-28 h-28 p-1 rounded-lg transition-all flex items-center justify-center overflow-hidden"
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
                                className={`w-full h-full scale-150 ${
                                    animal.emoji === '🐼' ? 'icon-no-bg object-contain' : 'object-cover'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

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
                    disabled={!name.trim() || isLoading}
                    onClick={handleSubmit}
                >
                    <img
                        src="/assets/icons/gate_icon.png"
                        alt="Vstup"
                        className="h-8 w-8 object-contain"
                    />
                    Pokračovat
                </button>
            </div>
        </div>
    );
};

