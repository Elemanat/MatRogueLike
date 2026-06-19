import React, {useEffect} from 'react';

interface Props {
    towerName: string;
    badgeImageUrl: string;
    badgeCount: number;
    onClose: () => void;
}

export const BadgeDisplayDialog: React.FC<Props> = ({
                                                        towerName,
                                                        badgeImageUrl,
                                                        badgeCount,
                                                        onClose
                                                    }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(44,44,62,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40,
        }} onClick={onClose}>
            <div
                className="sketch-box px-8 py-8 md:px-10 md:py-10 flex flex-col items-center gap-6 mx-4 w-[90%] max-w-95 md:max-w-137.5"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={badgeImageUrl} alt={`${towerName} badge`} className="h-40 md:h-48 w-auto object-contain"/>

                <p className="text-3xl md:text-4xl font-bold text-center" style={{color: 'var(--ink)'}}>
                    {towerName}
                </p>

                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded border border-yellow-400">
                    <span className="text-xl md:text-2xl font-bold text-(--ink)">×{badgeCount}</span>
                </div>

                <button
                    className="sketch-btn sketch-btn-danger text-xl py-2 w-full flex items-center justify-center gap-3 mt-auto"
                    onClick={onClose}
                >
                    <img
                        src="/assets/icons/door_icon.png"
                        alt="Logout"
                        className="h-8 w-8 object-contain"
                    />
                    Zpět
                </button>
            </div>
        </div>
    );
};