import React from 'react';
import type { MatchStats } from '../../types';
import { cn } from '../../lib/utils';

interface AdvancedStatsPanelProps {
    stats: MatchStats;
    homeLogo?: string;
    awayLogo?: string;
}

export const AdvancedStatsPanel: React.FC<AdvancedStatsPanelProps> = ({ stats, homeLogo, awayLogo }) => {
    const renderStatRow = (label: string, home: number | undefined, away: number | undefined, isPercentage: boolean = false) => {
        const homeVal = home ?? 0;
        const awayVal = away ?? 0;
        const homeStr = `${homeVal}${isPercentage ? '%' : ''}`;
        const awayStr = `${awayVal}${isPercentage ? '%' : ''}`;

        const isHomeHigher = homeVal > awayVal;
        const isAwayHigher = awayVal > homeVal;

        return (
            <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-b-0 hover:bg-white/[0.01] transition-colors px-2">
                {/* Home Stat Value */}
                <div className="w-20 flex justify-start">
                    <span className={cn(
                        "inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full text-xs font-black tracking-tight border transition-all",
                        isHomeHigher 
                            ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]" 
                            : "bg-white/5 border-white/10 text-zinc-300"
                    )}>
                        {homeStr}
                    </span>
                </div>

                {/* Stat Label */}
                <span className="text-[11px] md:text-xs font-black text-zinc-400 text-center uppercase tracking-widest flex-1 px-4">
                    {label}
                </span>

                {/* Away Stat Value */}
                <div className="w-20 flex justify-end">
                    <span className={cn(
                        "inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full text-xs font-black tracking-tight border transition-all",
                        isAwayHigher 
                            ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]" 
                            : "bg-white/5 border-white/10 text-zinc-300"
                    )}>
                        {awayStr}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#131822] border-2 border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6 max-w-xl mx-auto">
            {/* Header with Team Logos */}
            <div className="flex items-center justify-between pb-6 border-b-2 border-white/10">
                {homeLogo ? (
                    <div className="w-10 h-10 rounded-xl bg-white/5 p-1.5 flex items-center justify-center border border-white/10 shadow-md shrink-0">
                        <img src={homeLogo} alt="" className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div className="w-10" />
                )}
                
                <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-zinc-400 text-center">
                    Estadísticas del Equipo
                </h3>

                {awayLogo ? (
                    <div className="w-10 h-10 rounded-xl bg-white/5 p-1.5 flex items-center justify-center border border-white/10 shadow-md shrink-0">
                        <img src={awayLogo} alt="" className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div className="w-10" />
                )}
            </div>

            <div className="divide-y divide-white/5">
                {renderStatRow("Posesión", stats.possession?.home, stats.possession?.away, true)}
                {renderStatRow("Remates", stats.shots?.home, stats.shots?.away)}
                {renderStatRow("Remates al Arco", stats.shotsOnGoal?.home, stats.shotsOnGoal?.away)}
                {renderStatRow("Pases", stats.passes?.home, stats.passes?.away)}
                
                {/* Additional Stats fetched dynamically */}
                {stats.passAccuracy && renderStatRow("Precisión de los pases", stats.passAccuracy.home, stats.passAccuracy.away, true)}
                {stats.fouls && renderStatRow("Faltas", stats.fouls.home, stats.fouls.away)}
                {stats.yellowCards && renderStatRow("Tarjetas amarillas", stats.yellowCards.home, stats.yellowCards.away)}
                {stats.redCards && renderStatRow("Tarjetas rojas", stats.redCards.home, stats.redCards.away)}
                {stats.offsides && renderStatRow("Posición adelantada", stats.offsides.home, stats.offsides.away)}
                
                {renderStatRow("Tiros de esquina", stats.corners?.home, stats.corners?.away)}
            </div>
        </div>
    );
};
