import React, {useState} from 'react';

const ANIMALS = [
    {emoji: '🐶', label: 'Pes', icon: '/assets/icons/dog_icon_no_bg.png'},
    {emoji: '🐱', label: 'Kočka', icon: '/assets/icons/cat_icon_no_bg.png'},
    {emoji: '🐸', label: 'Žába', icon: '/assets/icons/frog_icon_no_bg.png'},
    {emoji: '🦊', label: 'Liška', icon: '/assets/icons/fox_icon_no_bg.png'},
    {emoji: '🐼', label: 'Panda', icon: '/assets/icons/panda_icon_no_bg.png'},
] as const;

interface Props {
    onClose: () => void;
    onRecover: (playerName: string, secretAnimal: string) => Promise<string>;
}

const RecoverCodeDialog: React.FC<Props> = ({onClose, onRecover}) => {
    const [playerName, setPlayerName] = useState('');
    const [selectedAnimal, setSelectedAnimal] = useState<string>('🐶');
    const [isLoading, setIsLoading] = useState(false);
    const [recoveredCode, setRecoveredCode] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    const handleSubmit = async () => {
        if (!playerName.trim()) return;

        setIsLoading(true);
        setError('');
        try {
            const code = await onRecover(playerName.trim(), selectedAnimal);
            setRecoveredCode(code);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Neznámá chyba';
            if (errorMessage.includes('404')) {
                setError('Hráč nenalezen. Zkontroluj si jméno.');
            } else if (errorMessage.includes('401')) {
                setError('Špatné zvířátko. Zkus znovu.');
            } else {
                setError('Chyba při obnovování kódu. Zkus později.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyAndClose = () => {
        if (recoveredCode) {
            navigator.clipboard.writeText(recoveredCode);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div
                className="bg-white rounded-lg p-8 max-w-sm w-full sketch-box"
                style={{background: 'var(--paper)', color: 'var(--ink)'}}
            >
                {!recoveredCode ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Obnovit kód
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm block mb-2" style={{color: 'var(--ink-light)'}}>
                                    Tvoje jméno:
                                </label>
                                <input
                                    className="w-full px-3 py-2 text-lg sketch-box outline-none"
                                    style={{
                                        fontFamily: 'Caveat, cursive',
                                        background: 'var(--paper)',
                                        color: 'var(--ink)',
                                        border: '2px solid var(--ink-light)'
                                    }}
                                    placeholder="Napiš své jméno…"
                                    value={playerName}
                                    onChange={e => setPlayerName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    disabled={isLoading}
                                    maxLength={20}
                                />
                            </div>

                            <div>
                                <label className="text-sm block mb-2" style={{color: 'var(--ink-light)'}}>
                                    Tvoje tajné zvířátko:
                                </label>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {ANIMALS.map(animal => (
                                        <button
                                            key={animal.emoji}
                                            className="sketch-box w-20 h-20 p-1 rounded-lg transition-all flex items-center justify-center"
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

                            {error && (
                                <p className="text-sm text-center font-semibold" style={{color: 'var(--danger)'}}>
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

                            <div className="flex gap-3">
                                <button
                                    className="sketch-btn text-lg py-2 flex-1"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    Zrušit
                                </button>
                                <button
                                    className="sketch-btn sketch-btn-primary text-lg py-2 flex-1 disabled:opacity-40 transition-opacity"
                                    disabled={!playerName.trim() || isLoading}
                                    onClick={handleSubmit}
                                >
                                    {isLoading ? '⏳…' : 'Obnovit'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="flex justify-center items-center gap-3 text-2xl font-bold mb-6">
                            <img
                                src={'/assets/icons/fajvka_icon.png'}
                                alt={'Kód obnoven'}
                                className="h-8 w-8 object-contain"
                            />
                            Tvůj kód!
                        </h2>

                        <div className="text-center mb-8">
                            <p className="text-5xl font-bold font-mono tracking-widest"
                               style={{color: 'var(--primary)'}}>
                                {recoveredCode}
                            </p>
                        </div>

                        <button
                            className="w-full sketch-btn sketch-btn-primary text-xl py-2 flex items-center justify-center gap-3"
                            onClick={handleCopyAndClose}
                        >
                            <img
                                src="/assets/icons/clipboard_icon.png"
                                alt="Clipboard icon"
                                className="h-7 w-7 object-contain"
                            />

                            Zkopírovat a vstoupit

                            <img
                                src="/assets/icons/gate_icon.png"
                                alt="Vstup"
                                className="h-8 w-8 object-contain"
                            />

                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
export default RecoverCodeDialog
