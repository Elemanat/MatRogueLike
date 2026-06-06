import React, {useEffect, useState} from 'react';
import {apiClient} from '../services/api';
import type {PlayerStatsResponse} from '../services/api/contracts';

interface Props {
    playerName: string;
    onBack: () => void;
}

export const StatisticsScreen: React.FC<Props> = ({playerName, onBack}) => {
    const [stats, setStats] = useState<PlayerStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                <p className="text-xl text-[var(--ink-light)]">Načítám statistiky...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col h-full px-4 py-6 gap-4">
                <h2 className="text-3xl font-bold text-center text-[var(--ink)]">Statistiky</h2>
                <p className="text-center text-[var(--red)]">{error}</p>
                <button className="sketch-btn mt-auto py-2 w-full" onClick={onBack}>← Zpátky</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full px-4 py-6 gap-4 overflow-y-auto">
            <h2 className="text-3xl font-bold text-center text-[var(--ink)]">Záznamy hrdiny</h2>
            <p className="text-center text-xl font-bold mb-4 text-[var(--ink)]">{stats.playerName}</p>

            <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold underline mb-2 text-[var(--ink)]">Celkové skóre</h3>
                {[
                    {label: '🏃 Počet pokusů (Runs)', value: stats.overall.totalRuns},
                    {label: '📝 Vyřešeno příkladů', value: stats.overall.totalAnswers},
                    {label: '✅ Správné odpovědi', value: stats.overall.correctAnswers},
                    {label: '🎯 Celková úspěšnost', value: `${stats.overall.accuracyPercentage} %`},
                ].map(row => (
                    <div key={row.label} className="sketch-box-light px-4 py-2 flex justify-between items-center">
                        <span className="text-lg text-[var(--ink)]">{row.label}</span>
                        <span className="text-2xl font-bold text-[var(--ink)]">{row.value}</span>
                    </div>
                ))}
            </div>

            {Object.keys(stats.byTopic).length > 0 && (
                <div className="flex flex-col gap-3 mt-6">
                    <h3 className="text-xl font-bold underline mb-2 text-[var(--ink)]">Úspěšnost roztříděná dle
                        věží</h3>
                    {Object.entries(stats.byTopic).map(([topic, data]) => {
                        const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                        return (
                            <div key={topic} className="sketch-box-light px-4 py-2 flex justify-between items-center">
                                <span className="text-lg font-mono text-[var(--ink)]">{topic}</span>
                                <span
                                    className={`text-xl font-bold ${acc >= 80 ? 'text-[var(--green)]' : acc < 50 ? 'text-[var(--red)]' : 'text-orange-500'}`}>
                  {acc} % <span className="text-sm font-normal text-[var(--ink-light)]">({data.correct}/{data.total})</span>
                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <button className="sketch-btn text-xl py-2 mt-6 w-full" onClick={onBack}>← Zpět do menu</button>
        </div>
    );
};