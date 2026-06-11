import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, History, Trophy, Zap, Globe, MapPin, Calendar, Info, Sparkles, Lock, Eye, Coins, TrendingUp, RefreshCw, Bot, Users, Sword } from 'lucide-react';
import { WORLD_CUP_GROUP_MATCHES, getTeamStaticData, WORLD_CUP_VENUES, getTeamFlagUrl } from '../data/worldCupPersistence';
import { PredictionForm } from '../components/competition/PredictionForm';
import { MatchChat } from '../components/social/MatchChat';
import { MatchNews } from '../components/competition/MatchNews';
import { PredictionCard } from '../components/profile/PredictionCard';
import { PredictionListItem } from '../components/profile/PredictionListItem';
import { databaseService } from '../services/databaseService';
import { useTeamModal } from '../context/TeamModalContext';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';


export const MatchPredictionPage: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();
    const { openTeamModal } = useTeamModal();
    const { userPredictions, pvpChallenges, user } = useUser();

    const queryParams = new URLSearchParams(window.location.search);
    const qHome = queryParams.get('home');
    const qAway = queryParams.get('away');
    const opponentId = queryParams.get('opponentId');
    const selectedMode = queryParams.get('mode') as 'MACHINE' | 'OPPONENT' | 'GROUP';

    const [match, setMatch] = useState<any | null>(null);
    const [loadingMatch, setLoadingMatch] = useState(true);

    // Oracle / AI Prediction States
    const [userId, setUserId] = useState<string | null>(null);
    const [unlocked, setUnlocked] = useState(false);
    const [userBalance, setUserBalance] = useState<number>(0);
    const [unlocking, setUnlocking] = useState(false);

    useEffect(() => {
        if (!matchId) return;

        // Fetch User Session and Balance
        const initUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                // Check if already unlocked
                const { unlocked } = await databaseService.isPredictionUnlocked(matchId, session.user.id);
                setUnlocked(unlocked);
                
                // Fetch current user balance
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('total_balance')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile) {
                    setUserBalance(Number(profile.total_balance));
                }
            }
        };

        initUserSession();

        const staticMatch = WORLD_CUP_GROUP_MATCHES.find(m => m.id === matchId);
        if (staticMatch) {
            setMatch(staticMatch);
            setLoadingMatch(false);
            return;
        }

        if (qHome && qAway) {
            setMatch({
                id: matchId,
                homeTeam: qHome,
                awayTeam: qAway,
                group: 'Eliminatorias',
                date: '19 JUL 2026',
                time: '20:00',
                stadium: 'MetLife Stadium',
                city: 'New York/New Jersey',
                status: 'scheduled' as const,
                h2h: []
            });
            setLoadingMatch(false);
            return;
        }

        const DB_TO_SPANISH_TEAM_NAME: Record<string, string> = {
            "Germany": "Alemania",
            "Saudi Arabia": "Arabia Saudita",
            "Algeria": "Argelia",
            "Argentina": "Argentina",
            "Australia": "Australia",
            "Austria": "Austria",
            "Belgium": "Bélgica",
            "Bosnia & Herzegovina": "Bosnia",
            "Brazil": "Brasil",
            "Cape Verde Islands": "Cabo Verde",
            "Canada": "Canadá",
            "Colombia": "Colombia",
            "South Korea": "Corea del Sur",
            "Ivory Coast": "Costa de Marfil",
            "Croatia": "Croacia",
            "Curaçao": "Curazao",
            "Ecuador": "Ecuador",
            "Egypt": "Egipto",
            "Scotland": "Escocia",
            "Spain": "España",
            "France": "Francia",
            "Ghana": "Ghana",
            "Haiti": "Haití",
            "Iraq": "Irak",
            "Iran": "Irán",
            "England": "Inglaterra",
            "Japan": "Japón",
            "Jordan": "Jordania",
            "Morocco": "Marruecos",
            "Mexico": "México",
            "Norway": "Noruega",
            "New Zealand": "Nueva Zelanda",
            "Netherlands": "Países Bajos",
            "Panama": "Panamá",
            "Paraguay": "Paraguay",
            "Portugal": "Portugal",
            "Qatar": "Qatar",
            "Congo DR": "RD Congo",
            "Czech Republic": "República Checa",
            "Senegal": "Senegal",
            "South Africa": "Sudáfrica",
            "Sweden": "Suecia",
            "Switzerland": "Suiza",
            "Tunisia": "Túnez",
            "Turkey": "Turquía",
            "Uruguay": "Uruguay",
            "USA": "USA",
            "Uzbekistan": "Uzbekistán"
        };

        const fetchMatch = async () => {
            setLoadingMatch(true);
            const { success, data } = await databaseService.fetchMatchDetail(matchId);
            if (success && data) {
                setMatch({
                    id: data.id,
                    league_id: data.league_id,
                    group: data.metadata?.group || data.metadata?.round || 'General',
                    homeTeam: DB_TO_SPANISH_TEAM_NAME[data.home_team] || data.home_team,
                    awayTeam: DB_TO_SPANISH_TEAM_NAME[data.away_team] || data.away_team,
                    homeTeamLogo: data.home_team_logo,
                    awayTeamLogo: data.away_team_logo,
                    homeTeamId: data.metadata?.home_id || (data.home_team_logo ? data.home_team_logo.match(/\/teams\/(\d+)\.png/)?.[1] : undefined),
                    awayTeamId: data.metadata?.away_id || (data.away_team_logo ? data.away_team_logo.match(/\/teams\/(\d+)\.png/)?.[1] : undefined),
                    date: data.start_time.split('T')[0],
                    time: data.start_time.split('T')[1]?.substring(0, 5) || '00:00',
                    stadium: data.metadata?.stadium || 'Estadio',
                    city: data.metadata?.city || 'Ciudad',
                    status: data.status.toLowerCase() === 'finished' ? 'finished' : data.status.toLowerCase() === 'live' ? 'live' : 'scheduled',
                    homeScore: data.home_score,
                    awayScore: data.away_score,
                    h2h: data.metadata?.h2h || [],
                    ai_prediction: data.metadata?.ai_prediction || null
                });
            } else {
                setMatch(null);
            }
            setLoadingMatch(false);
        };

        fetchMatch();
    }, [matchId, qHome, qAway]);

    const handleUnlockOracle = async () => {
        if (!userId || !matchId) return;
        if (userBalance < 50) {
            alert('❌ Saldo insuficiente. Necesitas 50 tokens para desbloquear al Oráculo.');
            return;
        }
        setUnlocking(true);
        const { success } = await databaseService.unlockAiPrediction(matchId, userId, 50);
        if (success) {
            setUnlocked(true);
            setUserBalance(prev => prev - 50);
            // Refresh match details to make sure we have the latest data
            const { success: refreshSuccess, data: refreshData } = await databaseService.fetchMatchDetail(matchId);
            if (refreshSuccess && refreshData) {
                setMatch(prev => ({
                    ...prev,
                    ai_prediction: refreshData.metadata?.ai_prediction || null
                }));
            }
        } else {
            alert('❌ Ocurrió un error al desbloquear al Oráculo. Por favor intenta de nuevo.');
        }
        setUnlocking(false);
    };

    const homeTeam = useMemo(() => match ? getTeamStaticData(match.homeTeam) : null, [match]);
    const awayTeam = useMemo(() => match ? getTeamStaticData(match.awayTeam) : null, [match]);
    const venue = useMemo(() => match ? WORLD_CUP_VENUES.find(v => v.name === match.stadium) : null, [match]);

    const homeFlag = useMemo(() => {
        if (match?.homeTeamLogo) return match.homeTeamLogo;
        return getTeamFlagUrl(match?.homeTeam || '');
    }, [match]);

    const awayFlag = useMemo(() => {
        if (match?.awayTeamLogo) return match.awayTeamLogo;
        return getTeamFlagUrl(match?.awayTeam || '');
    }, [match]);


    const existingPredictions = useMemo(() => {
        if (!matchId) return [];
        
        const pvpPreds = (pvpChallenges || [])
            .filter(c => c.creatorId === user?.id && c.matchId === matchId && c.status !== 'CANCELLED' && c.status !== 'REJECTED')
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
        const normalPreds = userPredictions.filter(p => p.matchId === matchId && p.status !== 'CANCELLED' && p.status !== 'REJECTED');
        
        for (const np of normalPreds) {
            // Filter out duplicate normal predictions that are actually part of a PvP challenge.
            // If the normal prediction has a targetName (meaning it was created alongside a PvP challenge)
            // we check if a PvP challenge for the same match and stake already exists.
            if (np.targetName && np.targetName !== '') {
                const isPvpDup = uniquePreds.some(up => 
                     up.id.startsWith('pvp-') && up.matchId === np.matchId && up.stake === np.stake
                );
                if (isPvpDup) continue;
            }

            if (!uniquePreds.find(up => up.timestamp === np.timestamp || up.id === np.id)) {
                uniquePreds.push(np);
            }
        }
        
        return uniquePreds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [matchId, userPredictions, pvpChallenges, user?.id]);

    if (loadingMatch) {
        return (
            <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <Trophy size={48} className="text-zinc-700 mb-4" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Partido no encontrado</h2>
                <Link to="/predictions" className="mt-6 text-blue-500 font-bold hover:underline">Volver al Centro de Predicciones</Link>
            </div>
        );
    }

    return (
        <div className="pb-24 animate-in fade-in duration-700">
            {/* Header / Back Navigation */}
            <div className="container mx-auto px-4 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={18} /> Volver
                </button>
            </div>

            <div className="container mx-auto px-4 flex flex-col lg:grid lg:grid-cols-12 gap-12">
                {/* Left Side: Stats and History */}
                <div className="lg:col-span-7 space-y-12">
                    {/* Match Hero Card */}
                    <div className="relative overflow-hidden rounded-[3rem] bg-[#0F131A] border border-white/5 p-8 md:p-12">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                                <Zap size={12} className="fill-blue-400" /> Grupo {match.group} • Jornada Mundial
                            </div>

                            <div className="flex items-center justify-between w-full max-w-xl">
                                <div 
                                    onClick={() => {
                                        if (match.homeTeamId) {
                                            openTeamModal(parseInt(match.homeTeamId));
                                        } else {
                                            navigate(`/worldcup/team/${encodeURIComponent(match.homeTeam)}/squad`);
                                        }
                                    }}
                                    className="flex flex-col items-center gap-4 group cursor-pointer"
                                    title={`Ver expediente de ${match.homeTeam}`}
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/5 bg-white/5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 shadow-2xl group-hover:shadow-blue-500/20">
                                        <img src={homeFlag} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter text-center group-hover:text-blue-400 transition-colors">{match.homeTeam}</h3>
                                </div>

                                {match.status === 'finished' ? (
                                    <div className="flex items-center gap-4 text-4xl md:text-6xl font-black text-white">
                                        <span>{match.homeScore ?? 0}</span>
                                        <span className="text-zinc-500">-</span>
                                        <span>{match.awayScore ?? 0}</span>
                                    </div>
                                ) : (
                                    <div className="text-4xl md:text-6xl font-black text-blue-600 italic">VS</div>
                                )}

                                <div 
                                    onClick={() => {
                                        if (match.awayTeamId) {
                                            openTeamModal(parseInt(match.awayTeamId));
                                        } else {
                                            navigate(`/worldcup/team/${encodeURIComponent(match.awayTeam)}/squad`);
                                        }
                                    }}
                                    className="flex flex-col items-center gap-4 group cursor-pointer"
                                    title={`Ver expediente de ${match.awayTeam}`}
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/5 bg-white/5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 shadow-2xl group-hover:shadow-blue-500/20">
                                        <img src={awayFlag} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter text-center group-hover:text-blue-400 transition-colors">{match.awayTeam}</h3>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                    <Calendar size={14} className="text-blue-500" /> {match.date} • {match.time}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                    <MapPin size={14} className="text-blue-500" /> 
                                    {venue?.website ? (
                                        <a href={venue.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors underline decoration-blue-500/30">
                                            {match.stadium}
                                        </a>
                                    ) : (
                                        match.stadium
                                    )}, {match.city}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Stats Sections */}
                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        {/* H2H History */}
                        {match.h2h && match.h2h.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] px-2 h-4">
                                    <History size={14} className="text-blue-500" /> Historial Reciente (H2H)
                                </h4>
                                <div className="bg-[#0F131A]/40 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-center gap-3 flex-1">
                                    {match.h2h.map((entry: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{entry.competition}</span>
                                                <span className="text-xs font-black text-white">{entry.result}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600">{entry.date.split('-')[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Team Info / Ranking */}
                        <div className="flex flex-col gap-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] px-2 h-4">
                                <Info size={14} className="text-blue-500" /> Datos de las Selecciones
                            </h4>
                            <div className="flex flex-col gap-3 flex-1">
                                {[
                                    { name: match.homeTeam, team: homeTeam, flag: homeFlag, continent: homeTeam?.continent || 'América', id: match.homeTeamId },
                                    { name: match.awayTeam, team: awayTeam, flag: awayFlag, continent: awayTeam?.continent || 'América', id: match.awayTeamId }
                                ].map((item: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => item.id && openTeamModal(parseInt(item.id))}
                                        className="bg-[#0F131A]/40 border border-white/5 rounded-[1.5rem] p-4 flex items-center justify-between flex-1 cursor-pointer hover:border-blue-500/30 hover:bg-white/[0.05] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden group-hover:scale-110 transition-transform">
                                                <img src={item.flag} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase group-hover:text-blue-400 transition-colors">{item.name}</div>
                                                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{item.continent}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-blue-500 italic">#{item.team?.fifaRanking || '--'}</div>
                                            <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Ranking FIFA</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* El Oráculo: AI Predictions */}
                    {match.ai_prediction && (
                        <div className="pt-4">
                            <div className="relative overflow-hidden rounded-[2.5rem] p-0.5 bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-blue-500/30">
                                <div className="bg-[#0F131A] rounded-[2.4rem] p-6 md:p-8 border border-white/5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400">
                                                <Sparkles size={20} className="animate-pulse" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black uppercase tracking-widest text-white">El Oráculo de IA</h3>
                                                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Predicciones avanzadas del motor de inteligencia artificial</p>
                                            </div>
                                        </div>
                                        {unlocked && (
                                            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                                                Desbloqueado
                                            </span>
                                        )}
                                    </div>

                                    {!unlocked ? (
                                        <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center relative overflow-hidden bg-[#131822] rounded-3xl border border-white/5">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
                                            
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 relative z-10 border border-white/10">
                                                <Lock size={24} className="text-zinc-400" />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-wider mb-2 text-white relative z-10">Oráculo Bloqueado</h3>
                                            <p className="text-zinc-400 max-w-md mx-auto mb-4 relative z-10 font-medium">
                                                Descubre la predicción oficial calculada por nuestra Inteligencia Artificial.
                                            </p>
                                            
                                            <div className="flex flex-col gap-1.5 text-left bg-black/30 border border-white/5 rounded-2xl p-4 mb-6 max-w-sm w-full mx-auto relative z-10">
                                                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-1 text-center text-blue-400">El modelo analiza:</p>
                                                <div className="flex items-center gap-2"><Sparkles size={10} className="text-purple-400" /><span className="text-[10px] font-medium text-zinc-300">Últimos 10 partidos y forma actual</span></div>
                                                <div className="flex items-center gap-2"><Sparkles size={10} className="text-purple-400" /><span className="text-[10px] font-medium text-zinc-300">Historial directo (H2H)</span></div>
                                                <div className="flex items-center gap-2"><Sparkles size={10} className="text-purple-400" /><span className="text-[10px] font-medium text-zinc-300">Efectividad ataque/defensa</span></div>
                                            </div>

                                            <button
                                                onClick={handleUnlockOracle}
                                                disabled={unlocking || userBalance < 50}
                                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl hover:shadow-blue-500/25 transition-all overflow-hidden flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                                {unlocking ? (
                                                    <>
                                                        <RefreshCw className="animate-spin" size={20} />
                                                        <span>Procesando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye size={20} />
                                                        <span>Revelar Predicción</span>
                                                        <span className="bg-black/30 px-3 py-1 rounded-lg text-sm flex items-center gap-1.5 ml-2">
                                                            50 <Coins size={14} className="text-yellow-400" />
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                            {userBalance < 50 && (
                                                <p className="text-red-400 text-xs font-bold mt-4 uppercase tracking-widest relative z-10">
                                                    Saldo insuficiente (tienes {userBalance} tokens)
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-5">
                                                {/* Consejo destacado */}
                                                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 items-start">
                                                    <Trophy size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Consejo del Oráculo</div>
                                                        <p className="text-xs font-bold text-zinc-200 mt-1">{match.ai_prediction.advice}</p>
                                                    </div>
                                                </div>

                                                {/* Probabilidades de Ganar */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-[9px] font-black text-zinc-400 uppercase tracking-wider px-1">
                                                        <span>Probabilidades</span>
                                                        <span className="flex items-center gap-1"><TrendingUp size={10} /> Análisis 1X2</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                                                            <p className="text-[9px] text-blue-400 font-black uppercase tracking-wider">Local</p>
                                                            <p className="text-lg font-black text-white mt-1">{match.ai_prediction?.percent?.home || '33%'}</p>
                                                        </div>
                                                        <div className="p-3 bg-zinc-500/5 border border-zinc-500/10 rounded-xl text-center">
                                                            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">Empate</p>
                                                            <p className="text-lg font-black text-white mt-1">{match.ai_prediction?.percent?.draw || '33%'}</p>
                                                        </div>
                                                        <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center">
                                                            <p className="text-[9px] text-purple-400 font-black uppercase tracking-wider">Visita</p>
                                                            <p className="text-lg font-black text-white mt-1">{match.ai_prediction?.percent?.away || '33%'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Comparativa de Atributos */}
                                                {match.ai_prediction.comparison && (
                                                    <div className="space-y-3 bg-black/25 rounded-2xl p-4 border border-white/5">
                                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Comparativa Cara a Cara</p>
                                                        
                                                        {/* Barra de Forma */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                                                                <span>Forma Reciente ({match.ai_prediction.comparison.form.home})</span>
                                                                <span>Forma Reciente ({match.ai_prediction.comparison.form.away})</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                                                <div className="bg-blue-500 h-full" style={{ width: match.ai_prediction.comparison.form.home }} />
                                                                <div className="bg-purple-500 h-full flex-1" />
                                                            </div>
                                                        </div>

                                                        {/* Barra de Ataque */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                                                                <span>Poder de Ataque ({match.ai_prediction.comparison.att.home})</span>
                                                                <span>Poder de Ataque ({match.ai_prediction.comparison.att.away})</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                                                <div className="bg-blue-500 h-full" style={{ width: match.ai_prediction.comparison.att.home }} />
                                                                <div className="bg-purple-500 h-full flex-1" />
                                                            </div>
                                                        </div>

                                                        {/* Barra de Defensa */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                                                                <span>Seguridad Defensiva ({match.ai_prediction.comparison.def.home})</span>
                                                                <span>Seguridad Defensiva ({match.ai_prediction.comparison.def.away})</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                                                <div className="bg-blue-500 h-full" style={{ width: match.ai_prediction.comparison.def.home }} />
                                                                <div className="bg-purple-500 h-full flex-1" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TU JUGADA (MÓVIL SOLAMENTE) */}
                    <div className="block lg:hidden pt-6">
                        {match.status === 'finished' ? (
                            <div className="bg-[#0F131A] rounded-[2.5rem] p-8 border border-white/5 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                    <Trophy size={28} className="text-zinc-500" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-wider text-white">Partido Finalizado</h3>
                                <p className="text-sm text-zinc-400 font-medium">
                                    Ya no se pueden hacer más jugadas para este partido. Los resultados están siendo procesados.
                                </p>
                            </div>
                        ) : (
                            <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-blue-500/20 to-transparent">
                                <div className="bg-[#0F131A] rounded-[2.4rem] p-8 border border-white/5 shadow-2xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Tu Jugada</h2>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Completa los datos de tu Jugada</p>
                                            </div>
                                        </div>
                                        <PredictionForm
                                            matchId={match.id}
                                            mode={selectedMode || 'MACHINE'}
                                            opponentId={opponentId}
                                            matchStatus={match.status}
                                            homeTeamName={typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam?.name}
                                            awayTeamName={typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam?.name}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List of Previous Predictions */}
                    <div className="pt-4">
                        <div className="bg-[#0F131A] rounded-[2rem] p-4 md:p-6 border border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white mb-4">Tus Jugadas ({existingPredictions.length})</h3>
                            {existingPredictions.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {existingPredictions.map(pred => (
                                        <PredictionListItem key={pred.id} pred={pred} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Aún no tienes jugadas en este partido</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Match News */}
                    <div className="pt-4">
                        <div className="bg-[#0F131A] rounded-[2rem] p-4 md:p-6 border border-white/5">
                            <MatchNews />
                        </div>
                    </div>
                </div>

                {/* Right Side: Prediction Form (DESKTOP ONLY) */}
                <div className="hidden lg:block lg:col-span-5">
                    <div className="sticky top-24">
                        <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-blue-500/20 to-transparent">
                            <div className="bg-[#0F131A] rounded-[2.4rem] p-8 border border-white/5 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Tu Jugada</h2>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Completa los datos de tu Jugada</p>
                                        </div>
                                    </div>

                                    <PredictionForm
                                        matchId={match.id}
                                        mode={selectedMode || 'MACHINE'}
                                        opponentId={opponentId}
                                        matchStatus={match.status}
                                        homeTeamName={typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam?.name}
                                        awayTeamName={typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam?.name}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
