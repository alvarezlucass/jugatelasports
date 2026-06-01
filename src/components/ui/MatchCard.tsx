import React from 'react';
import type { Match } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Coins } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTeamModal } from '../../context/TeamModalContext';

interface MatchCardProps {
    match: Match;
    onPredict?: (matchId: string, selection: any) => void;
    type?: 'challenge' | 'upcoming' | 'market';
    stake?: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPredict, type = 'upcoming', stake = 500 }) => {
    const isMarket = type === 'market';
    const { openTeamModal } = useTeamModal();

    return (
        <div className="group relative bg-card border border-border/50 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative p-5">
                {/* Header: League & Status */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            Liga Profesional
                        </span>
                        <h3 className="text-base font-bold text-foreground leading-tight mt-1">
                            {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                        </h3>
                    </div>
                    {type === 'challenge' && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full animate-pulse">
                                INCOMING
                            </span>
                        </div>
                    )}
                    {type === 'market' && match.status === 'LIVE' && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full animate-pulse">
                                LIVE
                            </span>
                        </div>
                    )}
                </div>

                {/* Teams & VS */}
                <div className="flex justify-between items-center mb-6">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-3 w-1/3">
                        <div 
                            className="w-16 h-16 rounded-full bg-muted/30 p-3 ring-1 ring-border shadow-inner group-hover:scale-110 transition-transform duration-300 cursor-pointer hover:ring-blue-500/50"
                            onClick={(e) => { e.stopPropagation(); if(type !== 'challenge') openTeamModal(parseInt(match.homeTeam.id)); }}
                        >
                            {type === 'challenge'
                                ? <div className="w-full h-full rounded-full bg-gray-500 flex items-center justify-center text-xs">You</div>
                                : <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                            }
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate max-w-full">
                            {type === 'challenge' ? 'You' : match.homeTeam.shortName}
                        </span>
                    </div>

                    {/* VS Badge */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                        <span className="text-3xl font-black italic text-primary/80" style={{ textShadow: "0 0 20px rgba(37, 99, 235, 0.5)" }}>
                            VS
                        </span>
                        {isMarket && (
                            <span className="text-[10px] text-muted-foreground mt-1">
                                {format(new Date(match.date), "HH:mm")}
                            </span>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-3 w-1/3">
                        <div 
                            className="w-16 h-16 rounded-full bg-muted/30 p-3 ring-1 ring-border shadow-inner group-hover:scale-110 transition-transform duration-300 cursor-pointer hover:ring-blue-500/50"
                            onClick={(e) => { e.stopPropagation(); if(type !== 'challenge') openTeamModal(parseInt(match.awayTeam.id)); }}
                        >
                            {type === 'challenge'
                                ? <div className="w-full h-full rounded-full bg-gray-500 flex items-center justify-center text-xs">Opp</div>
                                : <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                            }
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate max-w-full">
                            {type === 'challenge' ? 'Opponent' : match.awayTeam.shortName}
                        </span>
                    </div>
                </div>

                {/* Footer: Date/Time & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    {/* Odds for Market Mode */}
                    {isMarket ? (
                        <div className="flex gap-2 w-full">
                            <button onClick={() => onPredict?.(match.id, 'HOME')} className="flex-1 bg-muted/30 hover:bg-primary/20 hover:text-primary transition-colors rounded-lg py-2 flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground">1</span>
                                <span className="text-sm font-bold">{match.odds.home}</span>
                            </button>
                            <button onClick={() => onPredict?.(match.id, 'DRAW')} className="flex-1 bg-muted/30 hover:bg-primary/20 hover:text-primary transition-colors rounded-lg py-2 flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground">X</span>
                                <span className="text-sm font-bold">{match.odds.draw}</span>
                            </button>
                            <button onClick={() => onPredict?.(match.id, 'AWAY')} className="flex-1 bg-muted/30 hover:bg-primary/20 hover:text-primary transition-colors rounded-lg py-2 flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground">2</span>
                                <span className="text-sm font-bold">{match.odds.away}</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5">
                                    <Coins className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-bold text-foreground">{stake} <span className="text-muted-foreground text-xs font-normal">Tokens</span></span>
                                </div>
                            </div>

                            <button
                                onClick={() => onPredict?.(match.id, 'HOME')}
                                className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:-translate-y-0.5"
                            >
                                {type === 'challenge' ? 'Accept' : 'Predict Now'}
                            </button>

                            <div className="absolute top-5 right-5 text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(match.date), "HH:mm")}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
