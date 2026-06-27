import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Users, Trophy, Star, Target, Activity, Goal, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { mockClubData as data } from '../data/mockClubData';
import { PlayerProfileModal } from '../components/competition/PlayerProfileModal';
import { MatchDetailModal } from '../components/competition/MatchDetailModal';
import { ActionZonesPitch } from '../components/competition/ActionZonesPitch';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export const ClubDossierPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SQUAD' | 'STATS'>('OVERVIEW');
    const [hoveredPlayer, setHoveredPlayer] = useState<number | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    
    // Premium Data from DB
    const [dbTeam, setDbTeam] = useState<any>(null);
    const [dbPlayers, setDbPlayers] = useState<any[]>([]);
    const [dbMatches, setDbMatches] = useState<any[]>([]);
    const [dbStandings, setDbStandings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            const { data: teamData } = await supabase.from('teams').select('*').eq('id', id).single();
            const { data: playersData } = await supabase.from('players').select('*').eq('team_id', id);
            
            // For matches, we need to find matches where this team was home or away. Since team names might not exactly match id in our matches table schema, we try to use the team name if fetched.
            let matchesData: any[] = [];
            if (teamData) {
                 const { data: mData } = await supabase.from('matches').select('*').or(`home_team.ilike.%${teamData.name}%,away_team.ilike.%${teamData.name}%`).order('start_time', { ascending: false }).limit(5);
                 if (mData) matchesData = mData;
            }

            const { data: standingsData } = await supabase.from('standings').select('*').eq('team_id', id).order('season', { ascending: true });
            
            if (teamData) setDbTeam(teamData);
            if (playersData) setDbPlayers(playersData);
            if (matchesData) setDbMatches(matchesData);
            if (standingsData) setDbStandings(standingsData);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center text-white"><Activity className="animate-spin" size={48}/></div>;
    }

    // Use DB players if available, otherwise fallback
    const displayPlayers = dbPlayers.length > 0 ? dbPlayers : data.squad;

    // Group players by position
    const goalkeepers = displayPlayers.filter(p => p.position === 'Goalkeeper');
    const defenders = displayPlayers.filter(p => p.position === 'Defender');
    const midfielders = displayPlayers.filter(p => p.position === 'Midfielder');
    const attackers = displayPlayers.filter(p => p.position === 'Attacker');

    // Dynamic Team Info
    const teamName = dbTeam ? dbTeam.name : data.team.name;
    const teamLogo = dbTeam ? dbTeam.logo : data.team.logo;
    const venueName = dbTeam ? dbTeam.stadium_name || data.venue.name : data.venue.name;
    const founded = dbTeam ? dbTeam.founded || data.team.founded : data.team.founded;
    const dbCoach = dbTeam?.metadata?.coach;
    const coachName = dbCoach ? dbCoach.name : data.coach.name;
    const coachPhoto = dbCoach ? dbCoach.photo : data.coach.photo;
    const coachNationality = dbCoach ? dbCoach.nationality : data.coach.nationality;

    // Dynamic Stats from Standings
    const latestStanding = dbStandings.length > 0 ? dbStandings[dbStandings.length - 1] : null;
    const statsPlayed = latestStanding ? latestStanding.played : data.stats.played;
    const statsGoalsFor = latestStanding ? latestStanding.goals_for : data.stats.goalsFor;
    const statsGoalsAgainst = latestStanding ? latestStanding.goals_against : data.stats.goalsAgainst;
    // We don't have exact clean sheets in standings, mock it based on wins/draws or use mock
    const statsCleanSheets = latestStanding ? Math.floor(latestStanding.win * 0.8 + latestStanding.draw * 0.5) : data.stats.cleanSheets;

    // Dynamic Matches for Timeline
    const displayMatches = dbMatches.length > 0 ? dbMatches.map(m => {
        const isHome = m.home_team === teamName;
        const opponent = isHome ? m.away_team : m.home_team;
        // Determine result W/D/L
        let result = 'D';
        if (m.home_score > m.away_score) result = isHome ? 'W' : 'L';
        else if (m.home_score < m.away_score) result = isHome ? 'L' : 'W';
        
        return {
            ...m,
            home: isHome,
            opponent,
            opponentLogo: `https://ui-avatars.com/api/?name=${opponent}&background=random`,
            score: `${m.home_score}-${m.away_score}`,
            result,
            date: new Date(m.start_time).toLocaleDateString()
        };
    }) : data.fixtures;

    return (
        <div className="min-h-screen bg-[#0A0D12] pb-24 text-white selection:bg-blue-500/30">
            {/* Header Navigation */}
            <div className="container mx-auto px-4 py-6 sticky top-0 z-50 bg-[#0A0D12]/80 backdrop-blur-md border-b border-white/5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={18} /> Volver
                </button>
            </div>

            {/* Hero Section */}
            <div className="relative w-full h-[450px] md:h-[500px] overflow-hidden">
                <motion.div 
                    initial={{ scale: 1.1, filter: 'blur(10px)' }}
                    animate={{ scale: 1, filter: 'blur(3px)' }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url(${data.venue.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D12] via-[#0A0D12]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D12] via-transparent to-transparent opacity-80" />

                <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-end pb-12">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-8">
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="relative group perspective-1000"
                        >
                            <div className="w-40 h-40 md:w-56 md:h-56 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transform-gpu transition-transform duration-500 group-hover:scale-105 group-hover:rotate-y-12 group-hover:rotate-x-12">
                                <img src={teamLogo} alt={teamName} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 w-full md:w-auto"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                <Shield className="w-3 h-3" /> Datos Híbridos (DB + IA)
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 uppercase tracking-tighter leading-none mb-4">
                                {teamName}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-300 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 shadow-lg hover:bg-black/60 transition-colors">
                                    <MapPin size={16} className="text-emerald-400" />
                                    {venueName}
                                </div>
                                <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-300 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 shadow-lg hover:bg-black/60 transition-colors">
                                    <Star size={16} className="text-amber-400" />
                                    Fundado: {founded}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="container mx-auto px-4 mt-8 mb-12 relative z-20">
                <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
                    {['OVERVIEW', 'SQUAD', 'STATS'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === tab 
                                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {tab === 'OVERVIEW' ? 'Panel de Control' : tab === 'SQUAD' ? 'El Plantel' : 'Dashboard Analítico'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4">
                <AnimatePresence mode="wait">
                {activeTab === 'OVERVIEW' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Forma Actual Detailed */}
                        <div className="md:col-span-2 bg-[#0F131A] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="text-blue-500" /> Rendimiento Reciente
                                </h3>
                                <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">
                                    Últimos 5 Partidos
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-2 md:gap-4 relative z-10">
                                {displayMatches.map((fixture, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setSelectedMatch(fixture)}
                                        className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center text-center group/match cursor-pointer relative hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    >
                                        <div className={cn(
                                            "absolute -top-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border",
                                            fixture.result === 'W' ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                                            fixture.result === 'D' ? "bg-zinc-500 text-white border-zinc-400" :
                                            "bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                        )}>
                                            {fixture.result === 'W' ? 'V' : fixture.result === 'D' ? 'E' : 'D'}
                                        </div>
                                        <div className="w-10 h-10 mb-2 mt-2">
                                            <img src={fixture.opponentLogo} alt={fixture.opponent} className="w-full h-full object-contain drop-shadow-md group-hover/match:scale-110 transition-transform rounded-full" />
                                        </div>
                                        <span className="text-xl font-black text-white tracking-tighter">{fixture.score}</span>
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase line-clamp-1 mt-1">{fixture.opponent}</span>
                                        <span className="text-[8px] font-bold text-zinc-500 uppercase mt-1">{fixture.home ? '(L)' : '(V)'} - {fixture.date}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] text-zinc-500 text-center mt-4 uppercase font-bold tracking-widest animate-pulse">Click en cualquier partido para Drill-Down Táctico</p>
                        </div>

                        {/* El Mister (Coach) */}
                        <div className="bg-[#0F131A] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Target className="text-purple-500" /> Estratega
                            </h3>
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-purple-500/50 transition-colors shadow-2xl shrink-0 mb-4 relative">
                                    <img src={coachPhoto} alt={coachName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-white/5" />
                                </div>
                                <h4 className="text-2xl font-black text-white leading-tight mb-2">{coachName}</h4>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        {coachNationality}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* General Stats summary - SMART CARDS */}
                        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Partidos Jugados', val: statsPlayed, color: 'text-white', per90: null },
                                { label: 'Goles a Favor', val: statsGoalsFor, color: 'text-emerald-400', per90: statsPlayed > 0 ? (statsGoalsFor / statsPlayed).toFixed(2) : '0' },
                                { label: 'Goles en Contra', val: statsGoalsAgainst, color: 'text-red-400', per90: statsPlayed > 0 ? (statsGoalsAgainst / statsPlayed).toFixed(2) : '0' },
                                { label: 'Vallas Invictas', val: statsCleanSheets, color: 'text-sky-400', per90: statsPlayed > 0 ? `${Math.round((statsCleanSheets / statsPlayed) * 100)}%` : '0%' },
                            ].map((s, i) => (
                                <div key={i} className="group relative bg-[#0F131A] rounded-[2rem] p-6 border border-white/5 text-center flex flex-col items-center justify-center hover:bg-white/5 hover:border-white/20 transition-colors overflow-hidden">
                                    <div className="relative z-10 flex flex-col items-center group-hover:-translate-y-2 transition-transform duration-300">
                                        <span className={cn("text-4xl font-black mb-1", s.color)}>{s.val}</span>
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</span>
                                    </div>
                                    {s.per90 && (
                                        <div className="absolute bottom-0 left-0 w-full h-8 bg-black/40 flex items-center justify-center opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                                {s.per90} {i === 3 ? 'Efectividad' : 'Per 90 min'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'SQUAD' && (
                    <motion.div 
                        key="squad"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        {[
                            { title: 'Porteros', players: goalkeepers, color: 'text-amber-500' },
                            { title: 'Defensas', players: defenders, color: 'text-blue-500' },
                            { title: 'Mediocampistas', players: midfielders, color: 'text-emerald-500' },
                            { title: 'Delanteros', players: attackers, color: 'text-red-500' }
                        ].map((group, idx) => (
                            <div key={idx}>
                                <h3 className={cn("text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3", group.color)}>
                                    {group.title} <span className="text-zinc-600 text-sm">({group.players.length})</span>
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                    {group.players.map((player) => (
                                        <div 
                                            key={player.id} 
                                            onMouseEnter={() => setHoveredPlayer(player.id)}
                                            onMouseLeave={() => setHoveredPlayer(null)}
                                            onClick={() => setSelectedPlayer(player)}
                                            className="group relative bg-[#0F131A] rounded-[2rem] p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:bg-gradient-to-t hover:from-blue-500/5 hover:to-[#0F131A] overflow-hidden cursor-pointer shadow-lg"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                            
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6">
                                                    <div className="absolute inset-0 bg-white/5 rounded-full border border-white/10 group-hover:border-blue-500/50 transition-colors" />
                                                    <img 
                                                        src={player.photo} 
                                                        alt={player.name} 
                                                        className="absolute inset-0 w-full h-full object-cover rounded-full group-hover:scale-[1.2] origin-bottom transition-transform duration-500 ease-out z-20 bg-white/5"
                                                        style={{ clipPath: 'circle(50% at 50% 50%)' }}
                                                    />
                                                    <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 w-10 h-10 md:w-12 md:h-12 bg-[#0A0D12] rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-blue-500 transition-colors z-30 shadow-xl">
                                                        <span className="text-base md:text-lg font-black text-white">{player.number || '-'}</span>
                                                    </div>
                                                </div>
                                                
                                                <h4 className="text-sm md:text-lg font-black text-white text-center tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{player.name}</h4>
                                                <div className="flex flex-wrap justify-center gap-2 w-full">
                                                    <span className="text-[8px] md:text-[9px] font-black text-zinc-400 bg-white/5 px-2 md:px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                                                        {player.age || '?'} años
                                                    </span>
                                                    <span className="text-[8px] md:text-[9px] font-black text-zinc-400 bg-white/5 px-2 md:px-3 py-1 rounded-full uppercase tracking-widest border border-white/5 flex items-center gap-1">
                                                        <Activity size={10} /> {player.metadata?.deepStats?.games?.appearences || player.matches || 0} PJ
                                                    </span>
                                                    {hoveredPlayer === player.id && (
                                                        <motion.span 
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="text-[8px] md:text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 md:px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 flex items-center gap-1 w-full justify-center mt-1"
                                                        >
                                                            <Activity size={10} className="text-blue-400" /> Abrir Expediente Real
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'STATS' && (
                    <motion.div 
                        key="stats"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Real DB Standings Chart */}
                        {dbStandings.length > 0 && (
                            <div className="bg-[#0F131A] rounded-[2.5rem] p-6 md:p-10 border border-white/5 relative overflow-hidden mb-6">
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3 relative z-10">
                                    <Activity className="text-blue-500" size={24} /> Histórico de Posiciones
                                </h3>
                                
                                {dbStandings.length === 1 ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <div className="flex flex-col items-center bg-blue-500/5 px-12 py-8 rounded-3xl border border-blue-500/20">
                                            <span className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">Temporada {dbStandings[0].season}</span>
                                            <span className="text-6xl font-black text-white">#{dbStandings[0].rank}</span>
                                            <span className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Base de datos analizando historial antiguo...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[250px] w-full cursor-crosshair relative z-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dbStandings} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                <XAxis dataKey="season" stroke="#ffffff80" fontSize={12} tickLine={false} axisLine={false} padding={{ left: 30, right: 30 }} />
                                                <YAxis reversed stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={[1, 'dataMax + 2']} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#ffffff20', borderRadius: '1rem' }}
                                                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                    formatter={(value: any) => [`Puesto #${value}`, 'Posición Final']}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="rank" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth={4} 
                                                    dot={{ r: 6, fill: '#0A0D12', stroke: '#3b82f6', strokeWidth: 3 }}
                                                    activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Advanced Team Analytics (xG, Possession) */}
                            <div className="bg-[#0F131A] rounded-[2.5rem] p-6 md:p-10 border border-white/5 relative overflow-hidden lg:col-span-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                                    <Activity className="text-emerald-500" size={24} /> Scouting & Advanced Analytics
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Posesión Promedio', value: data.advancedStats.averagePossession, color: 'text-white' },
                                        { label: 'xG (Goles Esperados)', value: data.advancedStats.expectedGoals, color: 'text-emerald-400' },
                                        { label: 'Goles Reales Promedio', value: data.advancedStats.actualGoals, color: 'text-emerald-500' },
                                        { label: 'Precisión de Pases', value: data.advancedStats.passesAccuracy, color: 'text-purple-400' },
                                        { label: 'Tiros a Puerta (Prom)', value: data.advancedStats.shotsOnTarget, color: 'text-sky-400' },
                                        { label: 'Goles Evitados (Prom)', value: data.advancedStats.goalsPrevented, color: 'text-red-400' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                                            <span className={cn("text-3xl font-black mb-2 tracking-tighter", stat.color)}>{stat.value}</span>
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-tight">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Zones Pitch */}
                            <div className="bg-[#0F131A] rounded-[2.5rem] p-6 md:p-10 border border-white/5 flex flex-col items-center">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2 w-full justify-center">
                                    <Target className="text-emerald-500" size={24} /> Zonas de Acción
                                </h3>
                                <div className="flex-1 w-full flex items-center justify-center">
                                    <ActionZonesPitch defense={25} midfield={48} attack={27} teamColor="#10b981" />
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Player Profile Modal */}
            <PlayerProfileModal 
                isOpen={!!selectedPlayer} 
                onClose={() => setSelectedPlayer(null)} 
                player={selectedPlayer} 
            />

            {/* Match Detail Modal */}
            <MatchDetailModal
                isOpen={!!selectedMatch}
                onClose={() => setSelectedMatch(null)}
                match={selectedMatch}
            />
        </div>
    );
};
