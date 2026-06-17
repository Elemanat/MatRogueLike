import React from 'react';

interface Props {
    playerName: string;
    onPlay: () => void;
    onStats: () => void;
    onSettings: () => void;
    onLogout: () => void;
}

export const MenuScreen: React.FC<Props> = ({playerName, onPlay, onStats, onSettings, onLogout}) => (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
        <img
            src="/assets/title.png"
            alt="VěžMat"
            className="w-3/4 md:w-1/2 h-auto object-contain drop-shadow-lg"
        />
        <p className="text-lg" style={{color: 'var(--ink-light)'}}>
            Vítej, {playerName}!
        </p>

        <div className="flex flex-col gap-4 w-full">
            <button
                className="sketch-btn sketch-btn-primary text-2xl py-3 w-full flex items-center justify-center gap-3"
                onClick={onPlay}
            >
                <img
                    src="/assets/icons/swords_icon.png"
                    alt="Meče"
                    className="h-8 w-8 object-contain"
                />
                Hrát
            </button>
            <button
                className="sketch-btn text-2xl py-3 w-full flex items-center justify-center gap-3"
                onClick={onStats}
            >
                <img
                    src="/assets/icons/graph_icon.png"
                    alt="Statistics"
                    className="h-8 w-8 object-contain"
                />
                Statistiky
            </button>
            <button
                className="sketch-btn text-2xl py-3 w-full flex items-center justify-center gap-3"
                onClick={onSettings}
            >
                <img
                    src="/assets/icons/gears_icon.png"
                    alt="Settings"
                    className="h-8 w-8 object-contain"
                />
                Nastavení
            </button>
            <button
                className="sketch-btn sketch-btn-danger text-xl py-2 w-full flex items-center justify-center gap-3"
                onClick={onLogout}
            >
                <img
                    src="/assets/icons/door_icon.png"
                    alt="Logout"
                    className="h-8 w-8 object-contain"
                />
                Odhlásit
            </button>
        </div>
    </div>
);