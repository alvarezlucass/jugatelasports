import React from 'react';
import type { Team } from '../../types';
import { Share2, BarChart2 } from 'lucide-react'; // Will implement next

interface TeamHeroProps {
    team: Team;
    rank?: number;
    confederation?: string;
    stats?: {
        label: string;
        value: string;
    }[];
    onPredictClick?: () => void;
    onShareClick?: () => void;
}

export const TeamHero: React.FC<TeamHeroProps> = ({
    team,
    rank = 1,
    confederation = "FIFA",
    stats,
    onPredictClick,
    onShareClick
}) => {
    return (
        <div className="relative w-full overflow-hidden rounded-3xl bg-card border border-white/5 shadow-2xl">
            {/* Background Pattern/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-background to-background z-0" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 p-6 md:p-8">

                {/* Logo Section */}
                <div className="relative shrink-0 group">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-24 h-24 md:w-32 md:h-32 relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105">
                        <img
                            src={team.logo}
                            alt={team.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Team Info */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
                            {team.name}
                        </h1>
                        {rank && (
                            <span className="px-2 py-0.5 rounded text-[10px] md:text-xs font-bold bg-blue-600 text-white shadow-lg border border-blue-400/20">
                                FIFA RANK: #{rank}
                            </span>
                        )}
                    </div>

                    <p className="text-muted-foreground font-medium text-sm md:text-base mb-6 max-w-lg">
                        {confederation}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start w-full">
                        {onPredictClick && (
                            <button
                                onClick={onPredictClick}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <BarChart2 className="w-4 h-4" />
                                Predecir Ganador
                            </button>
                        )}

                        {onShareClick && (
                            <button
                                onClick={onShareClick}
                                className="bg-white/5 hover:bg-white/10 text-foreground font-semibold px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 transition-all"
                            >
                                <Share2 className="w-4 h-4" />
                                Compartir
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Strip */}
            {stats && (
                <div className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-md px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center md:items-start">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center">
                                {stat.label}
                            </span>
                            <span className="text-lg md:text-xl font-black font-mono mt-0.5">
                                {stat.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
