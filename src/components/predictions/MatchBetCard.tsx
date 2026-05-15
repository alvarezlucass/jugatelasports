import React from 'react';
import type { Match, Prediction } from '../../types';
import { Calendar, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface MatchBetCardProps {
    match: Match;
    onBetSelect: (selection: 'HOME' | 'DRAW' | 'AWAY', odds: number) => void;
    userPrediction?: Prediction;
}

export const MatchBetCard: React.FC<MatchBetCardProps> = ({ match, onBetSelect, userPrediction }) => {
    const isLive = match.status === 'LIVE';
    const isFinished = match.status === 'FINISHED';

    // Helper para formatear fecha (Ej: "Hoy 16:00" o "Mañana 21:00")
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header: Fecha y Estado */}
            <div className="bg-muted/30 px-4 py-2 flex justify-between items-center text-xs font-bold text-muted-foreground border-b border-border/50">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(match.date).toDateString()} • {formatDate(match.date)}
                </span>
                {isLive && <span className="text-red-500 animate-pulse">● EN VIVO</span>}
            </div>

            <div className="p-5">
                {/* Equipos y Marcador */}
                <div className="flex justify-between items-center mb-6">
                    {/* Home */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-16 h-16 relative">
                            <img src={match.homeTeam.logo || "https://placehold.co/60x60/png?text=HOME"} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-sm font-bold text-center leading-tight">{match.homeTeam.name}</span>
                    </div>

                    {/* VS / Score */}
                    <div className="flex flex-col items-center px-4">
                        {isLive || isFinished ? (
                            <div className="text-3xl font-black tracking-tighter flex gap-2">
                                <span>{match.score?.home ?? 0}</span>
                                <span className="text-muted-foreground/30">-</span>
                                <span>{match.score?.away ?? 0}</span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground font-black text-xl italic">VS</span>
                        )}
                    </div>

                    {/* Away */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-16 h-16 relative">
                            <img src={match.awayTeam.logo || "https://placehold.co/60x60/png?text=AWAY"} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-sm font-bold text-center leading-tight">{match.awayTeam.name}</span>
                    </div>
                </div>

                {/* Botones de Apuesta (Odds) */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'HOME', label: '1', odds: match.odds.home, team: match.homeTeam.name },
                        { id: 'DRAW', label: 'X', odds: match.odds.draw, team: 'Empate' },
                        { id: 'AWAY', label: '2', odds: match.odds.away, team: match.awayTeam.name }
                    ].map((opt) => {
                        const isSelected = userPrediction?.selection === opt.id;
                        return (
                            <button
                                key={opt.id}
                                disabled={isFinished || !!userPrediction}
                                onClick={() => onBetSelect(opt.id as any, opt.odds)}
                                className={cn(
                                    "relative flex flex-col items-center py-2 rounded-xl border transition-all active:scale-95",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted/20 border-border/50 hover:bg-muted/40 hover:border-border text-foreground"
                                )}
                            >
                                <span className="text-[10px] opacity-70 font-bold mb-0.5">{opt.label}</span>
                                <span className="text-lg font-black tracking-tight flex items-center gap-1">
                                    {opt.odds.toFixed(2)}
                                </span>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
                                        <TrendingUp className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
