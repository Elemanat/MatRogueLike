import React from 'react';

interface Props {
    onNewPlayer: () => void;
    onExistingPlayer: () => void;
}

export const LoginScreen: React.FC<Props> = ({onNewPlayer, onExistingPlayer}) => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
            <img
                src="/assets/title.png"
                alt="VěžMat"
                className="w-3/4 md:w-1/2 h-auto object-contain drop-shadow-lg"
            />
            <p className="text-xl text-center" style={{color: 'var(--ink-light)'}}>
                Matematická věž čeká na svého hrdinu…
            </p>

            <div className="w-full flex flex-col gap-4">
                <button
                    className="sketch-btn sketch-btn-primary text-2xl py-3 w-full flex items-center justify-center gap-3"
                    onClick={onNewPlayer}
                >
                    <img
                        src="/assets/icons/book_icon.png"
                        alt="Nový hráč ikonka"
                        className="h-10 w-10 object-contain"
                    />
                    Nový hráč
                </button>
                <button
                    className="sketch-btn text-2xl py-3 w-full flex items-center justify-center gap-3"
                    onClick={onExistingPlayer}
                >
                    <img
                        src="/assets/icons/key_icon.png"
                        alt="Klíč ikonka"
                        className="h-10 w-10 object-contain drop-shadow-sm"
                    />
                    Mám kód
                </button>
            </div>
        </div>
    );
};