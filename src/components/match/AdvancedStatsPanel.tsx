import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, MousePointer2, Percent } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { MatchStats } from '../../types';

interface AdvancedStatsPanelProps {
    stats: MatchStats;
}

export const AdvancedStatsPanel: React.FC<AdvancedStatsPanelProps> = ({ stats }) => {
    const renderStatRow = (label: string, home: number, away: number, icon: React.ReactNode, isPercentage: boolean = false) => {
        const total = home + away;
        const homePerc = total === 0 ? 50 : (home / total) * 100;
        const awayPerc = 100 - homePerc;

        return (
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span className="text-white text-lg">{home}{isPercentage ? '%' : ''}</span>
                    <div className="flex items-center gap-2">
                        {icon}
                        <span>{label}</span>
                    </div>
                    <span className="text-white text-lg">{away}{isPercentage ? '%' : ''}</span>
                </div>
                
                <div className="h-2.5 flex rounded-full overflow-hidden bg-white/5 p-[1px] border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${homePerc}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${awayPerc}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-l from-zinc-600 to-zinc-400 rounded-r-full" 
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 text-blue-400 mb-2">
                <BarChart3 size={14} /> Rendimiento Industrial
            </h3>

            {renderStatRow("Posesión de Balón", stats.possession.home, stats.possession.away, <Percent size={12} />, true)}
            {renderStatRow("Remates Totales", stats.shots.home, stats.shots.away, <Target size={12} />)}
            {renderStatRow("Remates al Arco", stats.shotsOnGoal.home, stats.shotsOnGoal.away, <Target size={12} className="text-blue-500" />)}
            {renderStatRow("Pases Completados", stats.passes.home, stats.passes.away, <MousePointer2 size={12} />)}
            {renderStatRow("Córners", stats.corners.home, stats.corners.away, <BarChart3 size={12} />)}

            {/* Hint para el usuario */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Datos actualizados según cronograma dinámico
                </p>
            </div>
        </div>
    );
};
