import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Trophy, Users, BarChart2, Clock, MapPin, Shield, Calendar, Globe, History, Info, Sparkles, Eye, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { databaseService } from '../services/databaseService';
import { useTeamModal } from '../context/TeamModalContext';
import { useUser } from '../contexts/UserContext';
import { PredictionListItem } from '../components/profile/PredictionListItem';
import { AlertTriangle, Terminal, Play, CheckCircle2 } from 'lucide-react';
import type { MatchLineup, MatchEvent, MatchStats, Player } from '../types';

// Importación de componentes industriales
import { TacticalPitch } from '../components/match/TacticalPitch';
import { StaffPanel } from '../components/match/StaffPanel';
import { AdvancedStatsPanel } from '../components/match/AdvancedStatsPanel';
import { MatchTimeline } from '../components/match/MatchTimeline';
import { PlayerDetailModal } from '../components/match/PlayerDetailModal';

import { footballApiService } from '../services/footballApiService';
import { mapApiFootballEvents, mapApiFootballLineups, mapApiFootballStatistics } from '../utils/footballApiMapper';
// Mocks mejorados para desarrollo visual (Mundial 2026 Style)

const getLeagueDisplayName = (leagueId: string | number | undefined) => {
    if (!leagueId) return 'Torneo Oficial';
    const id = leagueId.toString();
    switch (id) {
        case '1': case 'world-cup-2026': return 'FIFA World Cup 2026';
        case '128': case 'lpf': return 'Liga Profesional Argentina';
        case '129': case 'primera-nacional': return 'Primera Nacional (Arg)';
        case '130': case 'copa-argentina': return 'Copa Argentina';
        case '2': case 'ucl': return 'UEFA Champions League';
        case '39': case 'premier': return 'Premier League (Ing)';
        case '13': case 'libertadores': return 'Copa CONMEBOL Libertadores';
        case '140': case 'laliga': return 'La Liga (Esp)';
        case '135': case 'serie-a': return 'Serie A (Ita)';
        case '78': case 'bundesliga': return 'Bundesliga (Ale)';
        case '61': case 'ligue1': return 'Ligue 1 (Fra)';
        case '3': case 'uel': return 'UEFA Europa League';
        case '94': case 'primeira-liga': return 'Primeira Liga (Por)';
        case '71': case 'brasileirao': return 'Brasileirão (Bra)';
        case '262': case 'ligamx': return 'Liga MX (Mex)';
        case '239': case 'primera-a-colombia': return 'Categoría Primera A (Col)';
        case '265': case 'primera-chile': return 'Primera División de Chile';
        case '268': case 'primera-uruguay': return 'Primera División de Uruguay';
        case '11': case 'sudamericana': return 'Copa CONMEBOL Sudamericana';
        default: return `Liga ID: ${leagueId}`;
    }
};

const formatMatchDate = (timeStr: string) => {
    if (!timeStr) return '';
    try {
        const date = new Date(timeStr);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    } catch (e) { return timeStr; }
};

const MatchDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'SUMMARY' | 'LINEUPS' | 'STATS'>('SUMMARY');
    const [activeLineup, setActiveLineup] = useState<'HOME' | 'AWAY'>('HOME');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const { openTeamModal } = useTeamModal();
    const [matchData, setMatchData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showDevTools, setShowDevTools] = useState(false);
    const [simScore, setSimScore] = useState({ home: 0, away: 0 });
    const [isSimulating, setIsSimulating] = useState(false);
    const [liveMetadata, setLiveMetadata] = useState<{
        events?: MatchEvent[];
        stats?: MatchStats;
        lineup_home?: MatchLineup;
        lineup_away?: MatchLineup;
    } | null>(null);
    
    const { userPredictions, pvpChallenges, user } = useUser();

    const existingPredictions = React.useMemo(() => {
        if (!id) return [];
        
        const pvpPreds = (pvpChallenges || [])
            .filter(c => c.creatorId === user?.id && c.matchId === id && c.status !== 'CANCELLED' && c.status !== 'REJECTED')
            .map(c => ({
                id: `pvp-${c.id}`,
                userId: c.creatorId,
                matchId: c.matchId,
                selection: c.creatorSelection,
                stake: c.amount,
                potentialReturn: c.status === 'FINISHED' ? (c.winnerId === user?.id ? c.amount * 2 : 0) : c.amount * 2,
                status: c.status === 'FINISHED' ? (c.winnerId === user?.id ? 'WON' : 'LOST') : 'PENDING' as any,
                timestamp: c.createdAt,
                exactScore: { home: c.creatorHomeScore, away: c.creatorAwayScore },
                matchDetails: {
                    homeTeam: c.matchHomeTeam,
                    awayTeam: c.matchAwayTeam,
                    date: c.createdAt,
                    status: 'UPCOMING' as any,
                    betItemName: c.itemReward
                },
                targetSelection: c.targetSelection,
                targetHomeScore: c.targetHomeScore,
                targetAwayScore: c.targetAwayScore,
                targetName: c.targetName
            }));

        const uniquePreds: any[] = [...pvpPreds];
        const normalPreds = userPredictions.filter(p => p.matchId === id && p.status !== 'CANCELLED' && p.status !== 'REJECTED');
        
        for (const np of normalPreds) {
            if (!uniquePreds.find(up => up.timestamp === np.timestamp || up.id === np.id)) {
                uniquePreds.push(np);
            }
        }
        
        return uniquePreds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [id, userPredictions, pvpChallenges, user?.id]);

    React.useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setLoading(true);
            const { success, data } = await databaseService.fetchMatchDetail(id);
            if (success && data) {
                setMatchData(data);
            }
            setLoading(false);
        };

        loadData();

        const channel = supabase
            .channel(`match_${id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (payload) => {
                setMatchData(payload.new);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    React.useEffect(() => {
        if (!matchData?.api_id && !matchData?.id) return;
        const apiId = matchData.api_id || matchData.id;
        const isPastStart = matchData.start_time ? new Date(matchData.start_time).getTime() <= Date.now() : false;
        const elapsedForEff = matchData.start_time ? Math.floor((Date.now() - new Date(matchData.start_time).getTime()) / 60000) : 0;
        const isScheduled = matchData.status === 'SCHEDULED' || matchData.status === 'scheduled' || matchData.status === 'UPCOMING' || matchData.status === 'upcoming';
        const effStatus = isScheduled && isPastStart 
            ? (elapsedForEff >= 115 ? 'FINISHED' : 'LIVE') 
            : matchData.status.toUpperCase();
        
        // Solo llamamos a la API si el partido está en vivo o terminado
        if (effStatus !== 'LIVE' && effStatus !== 'FINISHED') {
            return;
        }

        const fetchLiveInfo = async () => {
            const { success, data } = await footballApiService.getMatchDetails(apiId.toString());
            if (success && data) {
                const homeId = data.teams?.home?.id?.toString();
                const awayId = data.teams?.away?.id?.toString();
                const lineups = mapApiFootballLineups(data.lineups);
                
                setLiveMetadata({
                    events: mapApiFootballEvents(data.events, homeId, awayId),
                    stats: mapApiFootballStatistics(data.statistics),
                    lineup_home: lineups.home || undefined,
                    lineup_away: lineups.away || undefined
                });
            }
        };

        fetchLiveInfo();

        let interval: NodeJS.Timeout;
        if (effStatus === 'LIVE') {
            // Refrescar cada 2 minutos
            interval = setInterval(fetchLiveInfo, 120000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [matchData?.id, matchData?.api_id, matchData?.status]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!matchData) {
        return (
            <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center p-6 text-center">
                <Shield size={64} className="text-zinc-800 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Partido no encontrado</h2>
                <button onClick={() => navigate(-1)} className="px-8 py-3 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px]">Volver</button>
            </div>
        );
    }

    const score = { 
        home: matchData.home_score ?? matchData.homeScore ?? 0, 
        away: matchData.away_score ?? matchData.awayScore ?? 0 
    };
    const tacticalMetadata = liveMetadata || matchData.metadata || {};
    const events = tacticalMetadata.events || null;
    const stats = tacticalMetadata.stats || null;
    const lineupHome = tacticalMetadata.lineup_home || null;
    const lineupAway = tacticalMetadata.lineup_away || null;

    const getSelectedPlayerStats = (playerId: any) => {
        const pEvents = events || [];
        const cleanId = (val: any) => val ? String(val).trim() : '';
        const targetId = cleanId(playerId);

        console.log("=== Debugging Player Stats ===");
        console.log("Target Player ID:", targetId);
        console.log("Match Events Count:", pEvents.length);

        const goals = pEvents.filter((e: any) => {
            const isMatch = e.type === 'GOAL' && 
                            cleanId(e.player?.id) === targetId && 
                            !e.detail?.toLowerCase().includes('own goal') &&
                            !e.detail?.toLowerCase().includes('contra');
            if (isMatch) {
                console.log("Found GOAL event match for player:", e);
            }
            return isMatch;
        }).length;

        const assists = pEvents.filter((e: any) => {
            const isMatch = e.type === 'GOAL' && cleanId(e.assistPlayer?.id) === targetId;
            if (isMatch) {
                console.log("Found ASSIST event match for player:", e);
            }
            return isMatch;
        }).length;

        const yellowCards = pEvents.filter((e: any) => {
            const isMatch = e.type === 'CARD' && 
                            cleanId(e.player?.id) === targetId && 
                            (e.detail?.toLowerCase().includes('yellow') || e.detail?.toLowerCase().includes('amarilla'));
            if (isMatch) {
                console.log("Found YELLOW CARD event match for player:", e);
            }
            return isMatch;
        }).length;

        const redCards = pEvents.filter((e: any) => {
            const isMatch = e.type === 'CARD' && 
                            cleanId(e.player?.id) === targetId && 
                            (e.detail?.toLowerCase().includes('red') || e.detail?.toLowerCase().includes('roja'));
            if (isMatch) {
                console.log("Found RED CARD event match for player:", e);
            }
            return isMatch;
        }).length;

        let rating = 6.0 + (goals * 1.5) + (assists * 0.8) - (yellowCards * 0.5) - (redCards * 1.5);
        if (goals === 0 && assists === 0 && yellowCards === 0 && redCards === 0) {
            rating = 6.8;
        }
        rating = Math.max(3.0, Math.min(10.0, rating));

        console.log("Final Computed Stats:", { goals, assists, yellowCards, redCards, rating });
        return { goals, assists, yellowCards, redCards, rating };
    };

    const handleSimulateResolution = async () => {
        if (!id) return;
        setIsSimulating(true);
        const { success, processed } = await databaseService.resolveMatch(id, simScore.home, simScore.away);
        if (success) { alert(`¡Éxito! ${processed} predicciones procesadas.`); }
        setIsSimulating(false);
    };

    return (
        <div className="min-h-screen bg-[#0A0D12] text-white pb-20">
            <div className="relative h-80 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent" />
                <div className="relative z-10 p-6">
                    <div className="flex justify-between items-center mb-2">
                        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
                                {getLeagueDisplayName(matchData.league_id)}
                            </span>
                            {matchData.season && (
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1 mr-1">
                                    Temporada {matchData.season}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-8 md:gap-16">
                        <div className="text-center group">
                            <div 
                                className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center justify-center mb-4 shadow-2xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const homeId = matchData.metadata?.home_id || (matchData.home_team_logo ? matchData.home_team_logo.match(/\/teams\/(\d+)\.png/)?.[1] : undefined);
                                    if (homeId) {
                                        openTeamModal(parseInt(homeId as string));
                                    } else {
                                        navigate(`/worldcup/team/${encodeURIComponent(matchData.home_team)}/squad`);
                                    }
                                }}
                            >
                                {matchData.home_team_logo ? (
                                    <img 
                                        src={matchData.home_team_logo} 
                                        alt={matchData.home_team} 
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                                    />
                                ) : (
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{matchData.home_team_flag || '🏠'}</span>
                                )}
                            </div>
                            <h2 className="font-black text-sm uppercase tracking-widest">{matchData.home_team}</h2>
                        </div>

                        <div className="text-center">
                            <div className={cn("backdrop-blur-md px-6 py-2 rounded-full border mb-4 inline-block", matchData.status === 'LIVE' || matchData.status === 'live' ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/10")}>
                                <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", matchData.status === 'LIVE' || matchData.status === 'live' ? "text-red-500 animate-pulse" : "text-blue-400")}>
                                    {matchData.status === 'LIVE' || matchData.status === 'live' ? 'En Vivo' : matchData.status === 'FINISHED' || matchData.status === 'finished' ? 'Finalizado' : 'Programado'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {matchData.status === 'FINISHED' || matchData.status === 'finished' || matchData.status === 'LIVE' || matchData.status === 'live' ? (
                                    <>
                                        <span className="text-5xl font-black md:text-7xl">{score.home}</span>
                                        <span className="text-xl md:text-3xl font-light text-white/30">:</span>
                                        <span className="text-5xl font-black md:text-7xl">{score.away}</span>
                                    </>
                                ) : (
                                    <span className="text-2xl font-black text-zinc-400 bg-white/5 border border-white/10 px-6 py-2 rounded-2xl tracking-widest uppercase">VS</span>
                                )}
                            </div>
                            <div className="mt-4 text-zinc-500 font-bold text-xs flex flex-col items-center justify-center gap-1.5">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className={cn("text-blue-500", (matchData.status === 'LIVE' || matchData.status === 'live') && "animate-pulse")} /> 
                                    {matchData.status === 'LIVE' || matchData.status === 'live' ? `${matchData.minute || 0}'` : matchData.status === 'FINISHED' || matchData.status === 'finished' ? 'FT' : matchData.start_time ? matchData.start_time.split('T')[1].substring(0, 5) : ''}
                                </div>
                                {matchData.start_time && (
                                    <div className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.1em] mt-1 text-center bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        {formatMatchDate(matchData.start_time)}
                                    </div>
                                )}
                                {matchData.metadata?.round && (
                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-0.5 text-center">
                                        {matchData.metadata.round}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center group">
                            <div 
                                className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center justify-center mb-4 shadow-2xl overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const awayId = matchData.metadata?.away_id || (matchData.away_team_logo ? matchData.away_team_logo.match(/\/teams\/(\d+)\.png/)?.[1] : undefined);
                                    if (awayId) {
                                        openTeamModal(parseInt(awayId as string));
                                    } else {
                                        navigate(`/worldcup/team/${encodeURIComponent(matchData.away_team)}/squad`);
                                    }
                                }}
                            >
                                {matchData.away_team_logo ? (
                                    <img 
                                        src={matchData.away_team_logo} 
                                        alt={matchData.away_team} 
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                                    />
                                ) : (
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{matchData.away_team_flag || '✈️'}</span>
                                )}
                            </div>
                            <h2 className="font-black text-sm uppercase tracking-widest">{matchData.away_team}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex px-4 border-b border-white/5 overflow-x-auto no-scrollbar bg-black/40 backdrop-blur-md sticky top-0 z-40">
                {[
                    { id: 'SUMMARY', label: 'Resumen', icon: Clock },
                    { id: 'LINEUPS', label: 'Alineación', icon: Users },
                    { id: 'STATS', label: 'Estadísticas', icon: BarChart2 }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-8 py-5 border-b-2 transition-all shrink-0 uppercase text-[10px] font-black tracking-widest relative",
                            activeTab === tab.id 
                                ? "border-blue-500 text-white" 
                                : "border-transparent text-zinc-500 hover:text-white"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div layoutId="activeTabBadge" className="absolute inset-0 bg-blue-500/5 -z-10" />
                        )}
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-[600px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'SUMMARY' && (
                        <motion.div 
                            key="tab-summary"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <MapPin size={14} className="text-blue-500" /> Detalle del Estadio
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-black/20 rounded-xl">
                                        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Sede</p>
                                        <p className="text-sm font-bold mt-1">{tacticalMetadata.stadium || 'TBD'}</p>
                                    </div>
                                    <div className="p-4 bg-black/20 rounded-xl">
                                        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Ciudad</p>
                                        <p className="text-sm font-bold mt-1">{tacticalMetadata.city || 'TBD'}</p>
                                    </div>
                                </div>
                                {/* User's Predictions for this match */}
                                <div className="bg-[#121820] rounded-[2.5rem] p-6 border border-white/5 space-y-6 mt-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={14} className="text-blue-500" /> Tus Jugadas ({existingPredictions.length})
                                    </h3>
                                    
                                    {existingPredictions.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {existingPredictions.map(pred => (
                                                <PredictionListItem key={pred.id} pred={pred} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Aún no tienes jugadas en este partido</p>
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => navigate(`/predictions/match/${id}`)}
                                        className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                                    >
                                        {existingPredictions.length > 0 ? 'Hacer Otra Jugada' : 'Crear mi Primera Jugada'}
                                    </button>
                                </div>
                            </div>

                            <MatchTimeline events={events || []} homeTeamId={matchData.metadata?.home_id || (matchData.home_team_logo ? matchData.home_team_logo.match(/\/teams\/(\d+)\.png/)?.[1] : undefined)} />
                        </motion.div>
                    )}

                    {activeTab === 'LINEUPS' && (
                        <motion.div 
                            key="tab-lineups"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {lineupHome && lineupAway && lineupHome.startXI && lineupAway.startXI ? (
                                <div className="max-w-3xl mx-auto space-y-12">
                                    
                                    {/* Titulares Header */}
                                    <div className="text-center">
                                        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-blue-400">Alineación Titular</h3>
                                        <div className="h-[2px] w-12 bg-blue-500 mx-auto mt-2 rounded-full" />
                                    </div>

                                    {/* Starting XI by position */}
                                    {(() => {
                                        const groupPos = (list: any[]) => {
                                            const gk = list.filter(p => p.pos === 'GK');
                                            const def = list.filter(p => p.pos === 'DEF');
                                            const mid = list.filter(p => p.pos === 'MID');
                                            const fwd = list.filter(p => p.pos === 'FWD');
                                            return { gk, def, mid, fwd };
                                        };

                                        const homeXI = groupPos(lineupHome.startXI);
                                        const awayXI = groupPos(lineupAway.startXI);

                                        const renderSection = (title: string, homeList: any[], awayList: any[]) => {
                                            const maxLen = Math.max(homeList.length, awayList.length);
                                            return (
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5 pb-2 text-center md:text-left">{title}</h4>
                                                    <div className="space-y-3">
                                                        {[...Array(maxLen)].map((_, i) => {
                                                            const homePlayer = homeList[i];
                                                            const awayPlayer = awayList[i];

                                                            const getPlayerEvents = (playerId: string) => {
                                                                return (events || []).filter(e => e.player?.id === playerId);
                                                            };

                                                            const renderPlayer = (slot: any, side: 'home' | 'away') => {
                                                                if (!slot) return <div className="flex-1" />;
                                                                
                                                                const pEvents = getPlayerEvents(slot.player.id);
                                                                const goals = pEvents.filter(e => e.type === 'GOAL');
                                                                const cards = pEvents.filter(e => e.type === 'CARD');
                                                                const isSub = (events || []).find(e => e.type === 'SUB' && (e.player?.id === slot.player.id || e.assistPlayer?.id === slot.player.id));
                                                                const subMin = isSub ? isSub.time : null;
                                                                const isSubIn = isSub && isSub.assistPlayer?.id === slot.player.id;

                                                                const photoUrl = `https://media.api-sports.io/football/players/${slot.player.id}.png`;

                                                                return (
                                                                    <div 
                                                                        onClick={() => {
                                                                            setSelectedPlayer({ 
                                                                                id: slot.player.id, 
                                                                                name: slot.player.name, 
                                                                                photo: photoUrl,
                                                                                number: slot.number,
                                                                                position: slot.pos
                                                                            } as any);
                                                                        }}
                                                                        className={cn(
                                                                            "flex-1 flex items-center gap-3.5 p-3 bg-[#131822] border border-white/10 rounded-2xl hover:border-blue-500/30 hover:bg-white/[0.03] transition-all cursor-pointer group",
                                                                            side === 'away' && "flex-row-reverse text-right"
                                                                        )}
                                                                    >
                                                                        {/* Photo */}
                                                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                                                            <img 
                                                                                src={photoUrl} 
                                                                                alt="" 
                                                                                className="w-full h-full object-cover" 
                                                                                onError={(e) => {
                                                                                    (e.target as any).src = `https://api.dicebear.com/7.x/initials/svg?seed=${slot.player.name}`;
                                                                                }}
                                                                            />
                                                                        </div>

                                                                        {/* Name & details */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className={cn("flex items-center gap-2", side === 'away' && "flex-row-reverse")}>
                                                                                <p className="text-xs md:text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors truncate">{slot.player.name}</p>
                                                                                {slot.number && (
                                                                                    <span className="text-[9px] text-zinc-500 font-bold bg-white/5 px-1.5 py-0.5 rounded">
                                                                                        {slot.number}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Badges/cards/goals */}
                                                                            <div className={cn("flex items-center gap-2 mt-1", side === 'away' && "flex-row-reverse")}>
                                                                                {goals.map((g, gi) => (
                                                                                    <span key={gi} className="text-[10px] animate-bounce" title="Gol">⚽</span>
                                                                                ))}
                                                                                {cards.map((c, ci) => (
                                                                                    <div 
                                                                                        key={ci} 
                                                                                        className={cn(
                                                                                            "w-2.5 h-3.5 rounded-sm shadow-sm",
                                                                                            c.detail.includes('Yellow') ? "bg-yellow-400" : "bg-red-500"
                                                                                        )} 
                                                                                        title={c.detail}
                                                                                    />
                                                                                ))}
                                                                                {subMin && (
                                                                                    <span className={cn(
                                                                                        "text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5",
                                                                                        isSubIn ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                                                                                    )}>
                                                                                        {isSubIn ? '↑' : '↓'} {subMin}'
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            };

                                                            return (
                                                                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {renderPlayer(homePlayer, 'home')}
                                                                    {renderPlayer(awayPlayer, 'away')}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        };

                                        return (
                                            <div className="space-y-8">
                                                {renderSection("Porteros", homeXI.gk, awayXI.gk)}
                                                {renderSection("Defensores", homeXI.def, awayXI.def)}
                                                {renderSection("Mediocampistas", homeXI.mid, awayXI.mid)}
                                                {renderSection("Delanteros", homeXI.fwd, awayXI.fwd)}
                                            </div>
                                        );
                                    })()}

                                    {/* Suplentes Header */}
                                    <div className="text-center pt-6">
                                        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-zinc-400">Suplentes</h3>
                                        <div className="h-[2px] w-12 bg-zinc-600 mx-auto mt-2 rounded-full" />
                                    </div>

                                    {/* Substitutes */}
                                    {(() => {
                                        const homeSubs = lineupHome.substitutes || [];
                                        const awaySubs = lineupAway.substitutes || [];
                                        const maxLen = Math.max(homeSubs.length, awaySubs.length);

                                        return (
                                            <div className="space-y-3">
                                                {[...Array(maxLen)].map((_, i) => {
                                                    const homePlayer = homeSubs[i];
                                                    const awayPlayer = awaySubs[i];

                                                    const getPlayerEvents = (playerId: string) => {
                                                        return (events || []).filter(e => e.player?.id === playerId);
                                                    };

                                                    const renderPlayer = (slot: any, side: 'home' | 'away') => {
                                                        if (!slot) return <div className="flex-1" />;
                                                        
                                                        const pEvents = getPlayerEvents(slot.player.id);
                                                        const goals = pEvents.filter(e => e.type === 'GOAL');
                                                        const cards = pEvents.filter(e => e.type === 'CARD');
                                                        const isSub = (events || []).find(e => e.type === 'SUB' && (e.player?.id === slot.player.id || e.assistPlayer?.id === slot.player.id));
                                                        const subMin = isSub ? isSub.time : null;
                                                        const isSubIn = isSub && isSub.assistPlayer?.id === slot.player.id;

                                                        const photoUrl = `https://media.api-sports.io/football/players/${slot.player.id}.png`;

                                                        return (
                                                            <div 
                                                                onClick={() => {
                                                                    setSelectedPlayer({ 
                                                                        id: slot.player.id, 
                                                                        name: slot.player.name, 
                                                                        photo: photoUrl,
                                                                        number: slot.number,
                                                                        position: slot.pos 
                                                                    } as any);
                                                                }}
                                                                className={cn(
                                                                    "flex-1 flex items-center gap-3.5 p-3 bg-[#131822]/60 border border-white/5 rounded-2xl hover:border-blue-500/20 hover:bg-white/[0.02] transition-all cursor-pointer group",
                                                                    side === 'away' && "flex-row-reverse text-right"
                                                                )}
                                                            >
                                                                {/* Photo */}
                                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                                                    <img 
                                                                        src={photoUrl} 
                                                                        alt="" 
                                                                        className="w-full h-full object-cover" 
                                                                        onError={(e) => {
                                                                            (e.target as any).src = `https://api.dicebear.com/7.x/initials/svg?seed=${slot.player.name}`;
                                                                        }}
                                                                    />
                                                                </div>

                                                                {/* Name & details */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={cn("flex items-center gap-2", side === 'away' && "flex-row-reverse")}>
                                                                        <p className="text-xs md:text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{slot.player.name}</p>
                                                                        {slot.number && (
                                                                            <span className="text-[9px] text-zinc-500 font-bold bg-white/5 px-1.5 py-0.5 rounded">
                                                                                {slot.number}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Details */}
                                                                    <div className={cn("flex items-center gap-1.5 mt-1", side === 'away' && "flex-row-reverse")}>
                                                                        <span className="text-[9px] text-zinc-500 uppercase">
                                                                            {slot.pos === 'GK' ? 'Portero' : slot.pos === 'DEF' ? 'Defensor' : slot.pos === 'MID' ? 'Mediocampista' : 'Delantero'}
                                                                        </span>
                                                                        {goals.map((g, gi) => (
                                                                            <span key={gi} className="text-[10px] animate-bounce" title="Gol">⚽</span>
                                                                        ))}
                                                                        {cards.map((c, ci) => (
                                                                            <div 
                                                                                key={ci} 
                                                                                className={cn(
                                                                                    "w-2.5 h-3.5 rounded-sm shadow-sm",
                                                                                    c.detail.includes('Yellow') ? "bg-yellow-400" : "bg-red-500"
                                                                                )} 
                                                                                title={c.detail}
                                                                            />
                                                                        ))}
                                                                        {subMin && (
                                                                            <span className={cn(
                                                                                "text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5",
                                                                                isSubIn ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                                                                            )}>
                                                                                {isSubIn ? '↑' : '↓'} {subMin}'
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    };

                                                    return (
                                                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {renderPlayer(homePlayer, 'home')}
                                                            {renderPlayer(awayPlayer, 'away')}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}

                                    {/* Staff / Coaches */}
                                    {(() => {
                                        const homeCoach = lineupHome.staff?.find(s => s.role.toLowerCase().includes('coach') || s.role.toLowerCase().includes('técnico'));
                                        const awayCoach = lineupAway.staff?.find(s => s.role.toLowerCase().includes('coach') || s.role.toLowerCase().includes('técnico'));
                                        
                                        if (!homeCoach && !awayCoach) return null;

                                        return (
                                            <div className="space-y-2 pt-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-white/5 pb-2 text-center md:text-left">Director Técnico</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {homeCoach ? (
                                                        <div className="flex items-center gap-3 p-3 bg-[#131822] border border-white/10 rounded-2xl">
                                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center text-zinc-400 font-bold shrink-0">DT</div>
                                                            <div>
                                                                <p className="text-xs md:text-sm font-black text-white">{homeCoach.name}</p>
                                                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Cuerpo Técnico</p>
                                                            </div>
                                                        </div>
                                                    ) : <div />}
                                                    {awayCoach ? (
                                                        <div className="flex items-center gap-3 p-3 bg-[#131822] border border-white/10 rounded-2xl flex-row-reverse text-right">
                                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center text-zinc-400 font-bold shrink-0">DT</div>
                                                            <div>
                                                                <p className="text-xs md:text-sm font-black text-white">{awayCoach.name}</p>
                                                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Cuerpo Técnico</p>
                                                            </div>
                                                        </div>
                                                    ) : <div />}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                </div>
                            ) : (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                                    <Users size={48} className="text-zinc-700 mb-4" />
                                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Alineaciones no confirmadas</h4>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 max-w-md">
                                        Las alineaciones oficiales de los equipos suelen confirmarse entre 45 y 60 minutos antes del inicio del partido.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'STATS' && (
                        <motion.div 
                            key="tab-stats"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {stats ? (
                                <AdvancedStatsPanel stats={stats} homeLogo={matchData.home_team_logo} awayLogo={matchData.away_team_logo} />
                            ) : (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                                    <BarChart2 size={48} className="text-zinc-700 mb-4" />
                                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">Estadísticas no disponibles</h4>
                                    {matchData.status === 'UPCOMING' ? (
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 max-w-md">
                                            Las estadísticas detalladas en tiempo real se habilitarán una vez comience el encuentro.
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 max-w-md">
                                            Las estadísticas de este partido se están sincronizando con el proveedor oficial.
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <PlayerDetailModal 
                isOpen={!!selectedPlayer} 
                onClose={() => setSelectedPlayer(null)} 
                player={selectedPlayer}
                stats={selectedPlayer ? getSelectedPlayerStats(selectedPlayer.id) : undefined}
            />

            {/* Industrial Dev Simulation Toolbar */}
            <div className="fixed bottom-6 left-6 z-50">
                {!showDevTools ? (
                    <button 
                        onClick={() => setShowDevTools(true)}
                        className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-2xl"
                    >
                        <Terminal size={20} className="text-zinc-500" />
                    </button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-zinc-900 border border-white/10 p-6 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-80 space-y-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={16} className="text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Dev Simulator</span>
                            </div>
                            <button onClick={() => setShowDevTools(false)} className="text-zinc-600 hover:text-white transition-colors">
                                <CheckCircle2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Set Final Result (3-2-1 Test)</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-600 uppercase font-bold">{matchData.home_team}</label>
                                    <input 
                                        type="number" 
                                        value={simScore.home}
                                        onChange={(e) => setSimScore(prev => ({ ...prev, home: parseInt(e.target.value) }))}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xl font-black focus:border-blue-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-zinc-600 uppercase font-bold">{matchData.away_team}</label>
                                    <input 
                                        type="number" 
                                        value={simScore.away}
                                        onChange={(e) => setSimScore(prev => ({ ...prev, away: parseInt(e.target.value) }))}
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xl font-black focus:border-blue-500/50 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSimulateResolution}
                                disabled={isSimulating}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSimulating ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Play size={14} className="fill-current" />
                                )}
                                FORZAR CIERRE PARTIDO
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MatchDetail;
