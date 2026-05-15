import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trophy, MapPin, Clock, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Match } from '../../types';
import { cn } from '../../lib/utils';

interface MatchCardProps {
    match: Match;
    showOdds?: boolean;
    className?: string;
    onPredictClick?: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
    match,
    showOdds = true,
    className,
    onPredictClick
}) => {
    const isLive = match.status === 'LIVE';
    const isFinished = match.status === 'FINISHED';
    const navigate = useNavigate();

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 shadow-2xl transition-all hover:border-primary/20 hover:bg-card/60 group",
            className
        )}>
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />

            {/* Header: League/Date & Stadium */}
            <div className="flex justify-between items-center p-4 pb-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>Estadio Lusail</span> {/* Placeholder, add to Match type if needed */}
                </div>
                <div className="flex items-center gap-2 font-medium">
                    {isLive ? (
                        <span className="flex items-center gap-1.5 text-red-500 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            EN VIVO
                        </span>
                    ) : (
                        <span>{format(new Date(match.date), "d 'de' MMM", { locale: es })}</span>
                    )}
                </div>
            </div>

            {/* Teams & Score */}
            <div className="flex items-center justify-between px-6 py-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-transparent p-2 ring-1 ring-white/5 group-hover:ring-primary/20 transition-all">
                            <img
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.name}
                                className="w-full h-full object-contain drop-shadow-md"
                            />
                        </div>
                        {isLive && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border border-border text-[10px] font-bold">
                                H
                            </div>
                        )}
                    </div>
                    <span className="font-bold text-lg tracking-tight text-center leading-tight">
                        {match.homeTeam.shortName}
                    </span>
                </div>

                {/* Center: VS or Score */}
                <div className="flex flex-col items-center justify-center px-4">
                    {isLive || isFinished ? (
                        <div className="flex items-center gap-3 text-3xl font-black font-mono tracking-tighter">
                            <span>{match.score?.home ?? 0}</span>
                            <span className="text-muted-foreground/30">-</span>
                            <span>{match.score?.away ?? 0}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black italic text-muted-foreground/20 select-none">VS</span>
                            <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-center">
                                <Clock className="w-3 h-3" />
                                {format(new Date(match.date), 'HH:mm')}
                            </div>
                        </div>
                    )}

                    {isLive && (
                        <span className="text-xs font-bold text-amber-500 mt-1">78'</span>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-transparent p-2 ring-1 ring-white/5 group-hover:ring-primary/20 transition-all">
                            <img
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.name}
                                className="w-full h-full object-contain drop-shadow-md"
                            />
                        </div>
                        {isLive && (
                            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border border-border text-[10px] font-bold">
                                A
                            </div>
                        )}
                    </div>
                    <span className="font-bold text-lg tracking-tight text-center leading-tight">
                        {match.awayTeam.shortName}
                    </span>
                </div>
            </div>

            {/* Footer / Odds */}
            {(showOdds && !isFinished) && (
                <div className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onPredictClick && onPredictClick(match.id)}
                            className="bg-white/5 hover:bg-primary/20 hover:text-primary transition-all duration-300 border border-white/5 hover:border-primary/50 text-[10px] font-black py-3 rounded-xl flex items-center justify-center gap-2 group/btn"
                        >
                            <span>PRONOSTICAR</span>
                            <Trophy className="w-3 h-3 transition-transform group-hover/btn:scale-110" />
                        </button>
                        <button
                            onClick={() => navigate(`/match/${match.id}`)}
                            className="bg-primary/10 hover:bg-primary/30 text-primary transition-all duration-300 border border-primary/20 hover:border-primary/50 text-[10px] font-black py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <span>DETalles</span>
                            <BarChart2 className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex justify-center gap-8 mt-3 text-[10px] text-muted-foreground font-mono">
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-xs">{match.odds.home}</span>
                            <span>{match.homeTeam.shortName}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-xs">{match.odds.draw}</span>
                            <span>EMPATE</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-xs">{match.odds.away}</span>
                            <span>{match.awayTeam.shortName}</span>
                        </div>
                    </div>
                </div>
            )}

            {isFinished && (
                <div className="p-4 pt-2">
                    <div className="w-full bg-white/5 border border-white/5 text-sm font-medium py-2 rounded-xl flex items-center justify-center text-muted-foreground">
                        Finalizado
                    </div>
                </div>
            )}
        </div>
    );
};
