import React from 'react';
import { StatBar } from '../shared/StatBar';
import { PlayerCard } from '../shared/PlayerCard';
import type { Player } from '../../types';

interface StatsOverviewProps {
    topScorers: Player[];
    teamStats: {
        label: string;
        teamOne: { name: string; value: number | string; color?: string };
        teamTwo: { name: string; value: number | string; color?: string };
    }[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ topScorers, teamStats }) => {
    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Top Scorers Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">⚽</span> Goleadores
                    </h3>
                    <button className="text-xs text-primary font-bold hover:underline">Ver Todos</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {topScorers.map((player, idx) => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            stats={[{ label: 'Goles', value: player.id === 'p1' ? 7 : 5 }]} // Mock stats mapping logic would go here
                            badges={idx === 0 ? ['GOALSCORER'] : []}
                            className={idx === 0 ? 'border-primary/40 bg-primary/5' : ''}
                        />
                    ))}
                </div>
            </div>

            {/* Side Stats Column */}
            <div className="space-y-6">
                <div className="bg-card/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="text-xl">📊</span> Estadísticas Globales
                    </h3>
                    <div className="space-y-8">
                        {teamStats.map((stat, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>{stat.teamOne.name}</span>
                                    <span>{stat.teamTwo.name}</span>
                                </div>
                                <StatBar
                                    label={stat.label}
                                    leftValue={stat.teamOne.value}
                                    rightValue={stat.teamTwo.value}
                                    leftColor={stat.teamOne.color}
                                    rightColor={stat.teamTwo.color}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
