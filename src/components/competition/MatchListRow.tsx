import React from 'react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils'; // Keep if used for className later or remove if strict
import type { Match } from '../../types';

interface MatchListRowProps {
    match: Match;
    onPredictClick?: (matchId: string) => void;
}

export const MatchListRow: React.FC<MatchListRowProps> = ({ match, onPredictClick }) => {
    const isLive = match.status === 'LIVE';
    const isKnockout = match.id.startsWith('R32') || 
                       match.id.startsWith('R16') || 
                       match.id.startsWith('R8') || 
                       match.id.startsWith('R4') || 
                       match.id.startsWith('FINAL') || 
                       match.id.startsWith('THIRD');

    return (
        <div className="group bg-card/40 hover:bg-card/60 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row xl:flex-row items-center gap-3 transition-all duration-300 overflow-hidden">
            {/* Match Info / Teams */}
            <div className="flex items-center gap-2 md:gap-4 flex-1 w-full xl:w-auto">

                {/* Home Team */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-[3] min-w-0 justify-end">
                    <span className="font-bold text-xs md:text-sm lg:text-base text-right hidden md:block leading-snug truncate max-w-[120px] md:max-w-none">{match.homeTeam.name.toUpperCase()}</span>
                    <span className="font-bold text-xs md:hidden">{match.homeTeam.shortName}</span>
                    <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-8 h-8 md:w-10 md:h-10 object-contain flex-none bg-white/5 rounded-lg p-1" />
                </div>

                {/* Status / Score */}
                <div className="flex flex-col items-center justify-center min-w-[80px]">
                    {isLive ? (
                        <>
                            <div className="text-xs font-bold text-red-500 animate-pulse mb-1">LIVE</div>
                            <div className="text-xl font-black font-mono tracking-tighter">
                                {match.score?.home ?? 0} - {match.score?.away ?? 0}
                            </div>
                            <div className="text-[10px] text-amber-500 font-bold mt-1">78'</div>
                        </>
                    ) : (
                        <>
                            <div className="text-xs font-bold text-muted-foreground mb-1">VS</div>
                            <div className="text-lg font-black font-mono text-white/20">
                                {format(new Date(match.date), 'HH:mm')}
                            </div>
                            <div className="text-[10px] text-muted-foreground/50 uppercase">
                                {match.status === 'UPCOMING' ? 'Tomorrow' : format(new Date(match.date), "d MMM")}
                            </div>
                        </>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-[3] min-w-0">
                    <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-8 h-8 md:w-10 md:h-10 object-contain flex-none bg-white/5 rounded-lg p-1" />
                    <span className="font-bold text-xs md:text-sm lg:text-base hidden md:block leading-snug truncate max-w-[120px] md:max-w-none">{match.awayTeam.name.toUpperCase()}</span>
                    <span className="font-bold text-xs md:hidden">{match.awayTeam.shortName}</span>
                </div>
            </div>

            {/* Betting Odds Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <OddsButton
                        label="Local"
                        count={match.predictionCounts?.home}
                        onClick={() => onPredictClick?.(match.id)}
                    />
                    {!isKnockout && (
                        <OddsButton
                            label="Empate"
                            count={match.predictionCounts?.draw}
                            onClick={() => onPredictClick?.(match.id)}
                        />
                    )}
                    <OddsButton
                        label="Visitante"
                        count={match.predictionCounts?.away}
                        onClick={() => onPredictClick?.(match.id)}
                    />
                </div>

                <button
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase whitespace-nowrap hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    onClick={() => onPredictClick?.(match.id)}
                >
                    {isLive ? 'Live' : 'Opciones'}
                </button>
            </div>
        </div>
    );
};

const OddsButton = ({ label, count, onClick }: { label: string; count?: number; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex-1 md:flex-none flex flex-col items-center justify-center min-w-[65px] md:min-w-[75px] md:w-20 lg:w-24 py-2 rounded-xl bg-black/20 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
    >
        <span className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5 group-hover:text-white transition-colors">{label}</span>
        <span className="text-lg font-black text-white group-hover:text-amber-500 transition-colors">
            {count ?? 0}
        </span>
        <span className="text-[9px] font-bold text-amber-500/60 uppercase tracking-tighter">
            usuarios
        </span>
    </button>
);
