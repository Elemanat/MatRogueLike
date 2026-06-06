import React, {useState} from 'react';

interface Props {
    onEnter: (name: string) => void;
}

export const LoginScreen: React.FC<Props> = ({onEnter}) => {
    const [name, setName] = useState('');

    const handleStart = () => {
        if (name.trim()) {
            onEnter(name.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
            <h1 className="text-6xl font-bold" style={{color: 'var(--ink)'}}>VěžMat</h1>
            <p className="text-xl text-center" style={{color: 'var(--ink-light)'}}>
                Matematická věž čeká na svého hrdinu…
            </p>

            <div className="w-full flex flex-col gap-3">
                <label className="text-lg font-semibold" style={{color: 'var(--ink)'}}>
                    Tvoje jméno:
                </label>
                <input
                    className="w-full px-3 py-2 text-xl sketch-box outline-none"
                    style={{fontFamily: 'Caveat, cursive', background: 'var(--paper)', color: 'var(--ink)'}}
                    placeholder="Napiš své jméno…"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                    maxLength={20}
                />
            </div>

            <button
                className="sketch-btn sketch-btn-primary w-full text-2xl py-2 disabled:opacity-40 transition-opacity"
                disabled={!name.trim()}
                onClick={handleStart}
            >
                Vstoupit →
            </button>
        </div>
    );
};