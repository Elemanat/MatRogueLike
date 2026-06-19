import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { TOWERS } from '../services/gameCatalog';
import type { PlayerStatsResponse } from '../services/api/contracts';
import { BadgeDisplayDialog } from '../components/BadgeDisplayDialog';

interface Props {
    playerName: string;
    onBack: () => void;
}

const getTowerName = (towerId: string): string => {
    return TOWERS.find(t => t.id === towerId)?.name || towerId;
};

const getTowerBadgeImage = (towerId: string): string => {
    return TOWERS.find(t => t.id === towerId)?.badge_image || '/assets/badges/primal_badge.png';
};

interface SelectedBadge {
    towerId: string;
    towerName: string;
    badgeImageUrl: string;
    count: number;
}

export const StatisticsScreen: React.FC<Props> = ({ playerName, onBack }) => {
    const [stats, setStats] = useState<PlayerStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBadge, setSelectedBadge] = useState<SelectedBadge | null>(null);

    useEffect(() => {
        let mounted = true;

        apiClient.players.getStats(playerName)
            .then(res => {
                if (mounted) {
                    setStats(res);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (mounted) {
                    console.error('Failed to load stats:', err);
                    setError('Nepodařilo se načíst statistiky.');
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [playerName]);

    if (loading) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <p className="text-xl text-(--ink-light)">Načítám statistiky...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col h-full px-4 py-6 gap-4">
                <h2 className="text-3xl font-bold text-center text-(--ink)">Statistiky</h2>
                <p className="text-center text-(--red)">{error}</p>
                <button
                    className="sketch-btn sketch-btn-danger text-xl py-2 flex-1 flex items-center justify-center gap-3"
                    onClick={onBack}
                >
                    <img
                        src="/assets/icons/door_icon.png"
                        alt="Logout"
                        className="h-8 w-8 object-contain"
                    />
                    Zpět
                </button>
            </div>
        );
    }

    const totalBadges = Object.values(stats.towerBadges || {}).reduce((sum, count) => sum + count, 0);

    return (
        <div className="flex flex-col h-full px-4 py-6 gap-4 overflow-y-auto">
            <h2 className="text-3xl font-bold text-center text-(--ink)">Záznamy hrdiny</h2>
            <p className="text-center text-xl font-bold mb-4 text-(--ink)">{stats.playerName}</p>

            <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold underline mb-2 text-(--ink)">Celkové skóre</h3>
                {[
                    { label: '/assets/icons/map_icon.png', text: 'Počet pokusů (Runs)', value: stats.overall.totalRuns },
                    { label: '/assets/icons/pergamen_icon.png', text: 'Vyřešeno příkladů', value: stats.overall.totalAnswers },
                    { label: '/assets/icons/fajvka_icon.png', text: 'Správné odpovědi', value: stats.overall.correctAnswers },
                    { label: '/assets/icons/target_icon.png', text: 'Celková úspěšnost', value: `${stats.overall.accuracyPercentage} %` },
                ].map(row => (
                    <div key={row.text} className="sketch-box-light px-4 py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <img src={row.label} alt="Ikona" className="h-6 w-6 object-contain" />
                            <span className="text-lg text-(--ink)">{row.text}</span>
                        </div>
                        <span className="text-2xl font-bold text-(--ink)">{row.value}</span>
                    </div>
                ))}
            </div>

            {Object.keys(stats.byTopic).length > 0 && (
                <div className="flex flex-col gap-3 mt-6">
                    <h3 className="text-xl font-bold underline mb-2 text-(--ink)">Úspěšnost dle věží</h3>
                    {Object.entries(stats.byTopic).map(([topic, data]) => {
                        const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                        const badgeCount = stats.towerBadges?.[topic] || 0;
                        const hasBadge = badgeCount > 0;

                        return (
                            <div key={topic} className="sketch-box-light px-4 py-2 flex justify-between items-center gap-3">
                                <div className="flex-1">
                                    <span className="text-lg text-(--ink)">{getTowerName(topic)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xl font-bold ${acc >= 80 ? 'text-(--green)' : acc < 50 ? 'text-(--red)' : 'text-orange-500'}`}>
                                        {acc} % <span className="text-sm font-normal text-(--ink-light)">({data.correct}/{data.total})</span>
                                    </span>

                                    <button
                                        className={`sketch-btn px-2 py-1 flex items-center gap-1 transition-opacity ${
                                            hasBadge
                                                ? 'bg-yellow-100 border-yellow-400'
                                                : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                                        }`}
                                        disabled={!hasBadge}
                                        onClick={() => setSelectedBadge({
                                            towerId: topic,
                                            towerName: getTowerName(topic),
                                            badgeImageUrl: getTowerBadgeImage(topic),
                                            count: badgeCount
                                        })}
                                    >
                                        <img
                                            src={getTowerBadgeImage(topic)}
                                            alt={`${getTowerName(topic)} badge icon`}
                                            className={`h-6 md:h-8 w-8 object-contain ${!hasBadge ? 'grayscale' : ''}`}
                                        />
                                        <span className="text-sm font-bold text-(--ink)">
                                            {badgeCount}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalBadges > 0 && (
                <div className="sketch-box-light px-4 py-3 mt-4 flex items-center justify-center gap-2 bg-yellow-50">
                    <img src="/assets/icons/closet_icon.png" alt="Odznaky" className="h-8 w-8 object-contain" />
                    <span className="text-lg font-bold text-(--ink)">Celkem odznaků:</span>
                    <span className="text-2xl font-bold text-(--ink)">{totalBadges}</span>
                </div>
            )}

            <button
                className="sketch-btn sketch-btn-danger text-xl py-2 w-full flex items-center justify-center gap-3 mt-auto"
                onClick={onBack}
            >
                <img
                    src="/assets/icons/door_icon.png"
                    alt="Logout"
                    className="h-8 w-8 object-contain"
                />
                Zpět do menu
            </button>

            {selectedBadge && (
                <BadgeDisplayDialog
                    towerName={selectedBadge.towerName}
                    badgeImageUrl={selectedBadge.badgeImageUrl}
                    badgeCount={selectedBadge.count}
                    onClose={() => setSelectedBadge(null)}
                />
            )}
        </div>
    );
};