import React from 'react';
import type { Player } from '../../types';
import { cn } from '../../lib/utils';
import { Star, Flame, Trophy } from 'lucide-react';

interface PlayerCardProps {
    player: Player;
    stats?: {
        label: string;
        value: string | number;
    }[];
    badges?: Array<'CAPTAIN' | 'GOALSCORER' | 'MOTM' | 'STAR'>;
    teamColor?: string; // Hex or tailwind class for background gradient
    className?: string;
    onClick?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
    player,
    stats,
    badges,
    teamColor = "from-blue-600/20 to-blue-900/10", // Default gradient
    className,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-xl border border-white/5 bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all cursor-pointer",
                className
            )}
        >
            {/* Background Gradient */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", teamColor)} />

            <div className="relative p-4 flex items-center gap-4">
                {/* Player Image / Avatar */}
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/20 ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
                        {player.photo ? (
                            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                <span className="text-xs font-bold">{player.position}</span>
                            </div>
                        )}
                    </div>
                    {/* Number Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-background border border-border w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                        {player.number}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg leading-none truncate group-hover:text-primary transition-colors">
                            {player.name}
                        </h3>
                    </div>

                    {/* Stats Line */}
                    {stats && stats.length > 0 && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {stats.map((stat, idx) => (
                                <span key={idx} className="flex items-center gap-1">
                                    <span className="text-white font-semibold">{stat.value}</span>
                                    <span>{stat.label}</span>
                                    {idx < stats.length - 1 && <span className="text-white/20">•</span>}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Badges */}
                    {badges && badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {badges.includes('CAPTAIN') && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                    <Star className="w-3 h-3 fill-current" />
                                    CAPITÁN
                                </span>
                            )}
                            {badges.includes('GOALSCORER') && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                    <Flame className="w-3 h-3 fill-current" />
                                    GOLEADOR
                                </span>
                            )}
                            {badges.includes('MOTM') && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                    <Trophy className="w-3 h-3 fill-current" />
                                    MVP
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
