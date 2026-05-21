import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { type GroupMatch, getTeamStaticData } from '../../data/worldCupPersistence';
import { BarChart2, Shield } from 'lucide-react';

interface OfficialMatchListProps {
    matches: (GroupMatch & { league_id?: string })[];
    onMatchClick?: (matchId: string) => void;
    showGroupLink?: boolean;
}

const formatRound = (round: string, leagueId?: string) => {
    if (!round) return '';
    // If it's a Copa/Mundial style group letter, like 'A', 'B', etc.
    if (round.length === 1 && /^[A-Z]$/.test(round)) {
        return `Grupo ${round}`;
    }
    
    // Check if it's LPF round format
    // Examples: "2nd Phase - 8" -> "Fase 2 - Fecha 8"
    // "Regular Season - 1" -> "Fecha 1"
    let formatted = round;
    if (round.toLowerCase().includes('2nd phase')) {
        const match = round.match(/\d+/);
        formatted = match ? `Fase 2 - Fecha ${match[0]}` : 'Fase 2';
    } else if (round.toLowerCase().includes('regular season')) {
        const match = round.match(/\d+/);
        formatted = match ? `Fecha ${match[0]}` : 'Temporada Regular';
    } else if (round.toLowerCase().includes('1st phase')) {
        const match = round.match(/\d+/);
        formatted = match ? `Fase 1 - Fecha ${match[0]}` : 'Fase 1';
    }
    
    return formatted;
};

export const OfficialMatchList: React.FC<OfficialMatchListProps> = ({ 
    matches, 
    onMatchClick,
    showGroupLink = true 
}) => {
    const navigate = useNavigate();
    // Group matches by date
    const groupedMatches = matches.reduce((acc, match) => {
        const date = match.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(match);
        return acc;
    }, {} as Record<string, (GroupMatch & { league_id?: string })[]>);

    const sortedDates = Object.keys(groupedMatches).sort();

    return (
        <div className="w-full space-y-12 py-8">
            {sortedDates.map((date) => (
                <div key={date} className="space-y-4">
                    {/* Date Header */}
                    <div className="flex items-center justify-between px-2 md:px-4">
                        <h3 className="text-lg md:text-xl font-bold text-white/90">
                            {format(parseISO(date), "EEEE d MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
                        </h3>
                        {showGroupLink && !groupedMatches[date].some(m => m.league_id === '128' || m.league_id === 'lpf') && (
                            <button 
                                onClick={() => {
                                    const dateGroups = Array.from(new Set(groupedMatches[date].map(m => m.group))).sort();
                                    navigate(`/worldcup?groups=${dateGroups.join(',')}`);
                                }}
                                className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Ver grupos
                            </button>
                        )}
                    </div>

                    {/* Matches for this date */}
                    <div className="flex flex-col">
                        {groupedMatches[date].map((match) => {
                            const homeData = getTeamStaticData(match.homeTeam);
                            const awayData = getTeamStaticData(match.awayTeam);
                            const homeFlag = match.homeTeamLogo || (homeData ? `https://flagcdn.com/${homeData.id.toLowerCase().substring(0, 2)}.svg` : '');
                            const awayFlag = match.awayTeamLogo || (awayData ? `https://flagcdn.com/${awayData.id.toLowerCase().substring(0, 2)}.svg` : '');

                            return (
                                <div
                                    key={match.id}
                                    onClick={() => onMatchClick?.(match.id)}
                                    className="group relative cursor-pointer border-t border-white/5 bg-[#0F131A]/40 hover:bg-white/5 transition-all py-4 md:py-8 px-4"
                                >
                                    <div className="flex flex-col items-center max-w-4xl mx-auto">
                                        {/* Match Content */}
                                        <div className="flex items-center justify-center w-full gap-4 md:gap-8">
                                            {/* Home Team */}
                                            <div className="flex-1 flex items-center justify-end gap-2 md:gap-4 overflow-hidden">
                                                <span className="text-sm md:text-xl font-bold text-white uppercase tracking-tight truncate">
                                                    <span className="hidden md:inline">{match.homeTeam}</span>
                                                    <span className="md:hidden">{homeData?.id || match.homeTeam.substring(0, 3).toUpperCase()}</span>
                                                </span>
                                                <div className="w-6 h-4 md:w-10 md:h-7 rounded-sm border border-white/10 overflow-hidden shrink-0 shadow-sm group-hover:border-blue-500/50 transition-colors flex items-center justify-center bg-zinc-900/50">
                                                    {homeFlag ? (
                                                        <img src={homeFlag} alt={match.homeTeam} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Shield className="w-4 h-4 text-zinc-400 p-0.5" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Time */}
                                            <div className="shrink-0 text-lg md:text-3xl font-black text-white tabular-nums bg-white/5 px-2 py-0.5 rounded-lg md:bg-transparent md:px-0">
                                                {match.time}
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex-1 flex items-center justify-start gap-2 md:gap-4 overflow-hidden">
                                                <div className="w-6 h-4 md:w-10 md:h-7 rounded-sm border border-white/10 overflow-hidden shrink-0 shadow-sm group-hover:border-blue-500/50 transition-colors flex items-center justify-center bg-zinc-900/50">
                                                    {awayFlag ? (
                                                        <img src={awayFlag} alt={match.awayTeam} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Shield className="w-4 h-4 text-zinc-400 p-0.5" />
                                                    )}
                                                </div>
                                                <span className="text-sm md:text-xl font-bold text-white uppercase tracking-tight truncate">
                                                    <span className="hidden md:inline">{match.awayTeam}</span>
                                                    <span className="md:hidden">{awayData?.id || match.awayTeam.substring(0, 3).toUpperCase()}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Match Info Subtitle */}
                                        <div className="mt-2 md:mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[8px] md:text-[10px] font-medium text-zinc-500 uppercase tracking-widest text-center">
                                            <span>{formatRound(match.group, match.league_id)}</span>
                                            <span className="hidden md:inline w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="hidden md:inline text-zinc-400">{match.stadium} ({match.city})</span>
                                        </div>
                                    </div>
                                    
                                    {/* Hover visual cue & Data Hub Access */}
                                    <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 flex items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/match/${match.id}`);
                                            }}
                                            className="text-[9px] font-black text-white uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2"
                                        >
                                            <BarChart2 size={12} /> Hub Datos
                                        </button>
                                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 hidden md:block">
                                            Armar Jugada ⚔️
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
