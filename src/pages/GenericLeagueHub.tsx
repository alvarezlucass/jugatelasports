import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Trophy, 
    ArrowLeft, 
    Calendar, 
    Users, 
    ChevronRight, 
    Zap, 
    Shield, 
    Activity, 
    Info,
    RefreshCw,
    Globe,
    Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { leagueService } from '../services/leagueService';
import { matchService } from '../services/matchService';
import { OfficialMatchList } from '../components/competition/OfficialMatchList';
import { TeamDetailsModal } from '../components/modals/TeamDetailsModal';

const LEAGUE_CONFIGS: Record<string, {
    name: string;
    subtitle: string;
    apiLeagueId: number;
    dbLeagueIdForMatches: string;
    dbLeagueIdForStandings: string;
    colorClass: string;
    gradientFromTo: string;
    logoUrl: string;
    description: string;
    bannerIcon: any;
}> = {
    lpf: {
        name: 'Liga Profesional',
        subtitle: 'Argentina',
        apiLeagueId: 128,
        dbLeagueIdForMatches: '128',
        dbLeagueIdForStandings: 'lpf',
        colorClass: 'text-sky-400',
        gradientFromTo: 'from-sky-600/20 to-indigo-900/40 border-sky-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Liga_Profesional_de_F%C3%BAtbol_%28Argentina%29_logo.svg/800px-Liga_Profesional_de_F%C3%BAtbol_%28Argentina%29_logo.svg.png',
        description: 'Sigue a los 28 clubes, predice cada fecha y compite por el trono local en el sistema de predicciones más avanzado de Argentina.',
        bannerIcon: Shield
    },
    ucl: {
        name: 'UEFA Champions League',
        subtitle: 'Europa',
        apiLeagueId: 2,
        dbLeagueIdForMatches: '2',
        dbLeagueIdForStandings: 'ucl',
        colorClass: 'text-blue-400',
        gradientFromTo: 'from-blue-700/20 to-indigo-950/40 border-blue-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Coupe_des_clubs_champions_europ%C3%A9ens.png/800px-Coupe_des_clubs_champions_europ%C3%A9ens.png',
        description: 'El torneo de clubes más prestigioso del mundo. Predice las noches mágicas de Europa y conviértete en rey continental.',
        bannerIcon: Trophy
    },
    premier: {
        name: 'Premier League',
        subtitle: 'Inglaterra',
        apiLeagueId: 39,
        dbLeagueIdForMatches: '39',
        dbLeagueIdForStandings: 'premier',
        colorClass: 'text-purple-400',
        gradientFromTo: 'from-purple-600/20 to-pink-900/40 border-purple-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg',
        description: 'El fútbol más veloz, físico y emocionante de Inglaterra. Predice a los gigantes de la Premier League.',
        bannerIcon: Shield
    },
    libertadores: {
        name: 'Copa Libertadores',
        subtitle: 'Sudamérica',
        apiLeagueId: 13,
        dbLeagueIdForMatches: '13',
        dbLeagueIdForStandings: 'libertadores',
        colorClass: 'text-amber-400',
        gradientFromTo: 'from-amber-600/20 to-yellow-900/40 border-amber-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Copa_Libertadores.png/800px-Copa_Libertadores.png',
        description: 'La mística y pasión del continente sudamericano. Predice la gloria eterna en cada fase eliminatoria.',
        bannerIcon: Globe
    },
    laliga: {
        name: 'La Liga',
        subtitle: 'España',
        apiLeagueId: 140,
        dbLeagueIdForMatches: '140',
        dbLeagueIdForStandings: 'laliga',
        colorClass: 'text-red-400',
        gradientFromTo: 'from-red-600/20 to-orange-900/40 border-red-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/800px-LaLiga_logo_2023.svg.png',
        description: 'Técnica exquisita, posesión y el clásico más grande del mundo. Predice cada jornada del campeonato español.',
        bannerIcon: Star
    }
};

export const GenericLeagueHub: React.FC = () => {
    const navigate = useNavigate();
    const { leagueId } = useParams<{ leagueId: string }>();
    const { user } = useUser();
    
    const [activeTab, setActiveTab] = useState<'fixtures' | 'standings' | 'teams'>('fixtures');
    const [standings, setStandings] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Default to 'lpf' if parameter is not in configs
    const currentLeagueKey = leagueId && LEAGUE_CONFIGS[leagueId] ? leagueId : 'lpf';
    const config = LEAGUE_CONFIGS[currentLeagueKey];

    useEffect(() => {
        loadData();
    }, [activeTab, currentLeagueKey]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'fixtures') {
                const data = await matchService.getMatches(config.dbLeagueIdForMatches);
                // Filter matches to only show 2026 (simulated active season)
                const activeMatches = (data || []).filter(m => m.date.startsWith('2026'));
                // If there are no 2026 matches yet, show all to ensure data is displayed
                setMatches(activeMatches.length > 0 ? activeMatches : data || []);
            } else if (activeTab === 'standings') {
                // Try 2026 first, fallback to 2024
                let res = await leagueService.getStandings(config.dbLeagueIdForStandings, 2026);
                if (!res.data || res.data.length === 0) {
                    res = await leagueService.getStandings(config.dbLeagueIdForStandings, 2024);
                }
                setStandings(res.data || []);
            } else if (activeTab === 'teams') {
                const res = await leagueService.getTeams(config.dbLeagueIdForStandings);
                setTeams(res.data || []);
            }
        } catch (error) {
            console.error(`Error loading data for league ${currentLeagueKey}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!user || user.role !== 'ADMIN') return;
        setSyncing(true);
        try {
            // Default sync to 2026 season for new setups, or 2024 as default backup
            const targetSeason = config.apiLeagueId === 128 ? 2024 : 2026;
            await leagueService.syncTeams(config.dbLeagueIdForStandings, config.apiLeagueId);
            await leagueService.syncStandings(config.dbLeagueIdForStandings, config.apiLeagueId, targetSeason);
            await loadData();
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Error en la sincronización general.');
        } finally {
            setSyncing(false);
        }
    };

    const handleDeepSyncAll = async () => {
        if (!user || user.role !== 'ADMIN' || teams.length === 0) return;
        setSyncing(true);
        setSyncProgress({ current: 0, total: teams.length });
        
        try {
            for (let i = 0; i < teams.length; i++) {
                setSyncProgress(prev => ({ ...prev, current: i + 1 }));
                await leagueService.syncTeamDeepData(teams[i].id);
                // 500ms delay to avoid API rate limit triggers
                await new Promise(r => setTimeout(r, 500));
            }
            alert('Sincronización profunda completada con éxito.');
        } catch (error) {
            console.error('Error in deep sync:', error);
            alert('Error en la sincronización profunda.');
        } finally {
            setSyncing(false);
            setSyncProgress({ current: 0, total: 0 });
        }
    };

    const openTeamDetails = (team: any) => {
        setSelectedTeam(team);
        setIsDetailsOpen(true);
    };

    const BannerIcon = config.bannerIcon;

    return (
        <div className="min-h-screen bg-[#0A0D12] pb-12 animate-in fade-in duration-500">
            {/* Contextual Header with Team/League Colors */}
            <div className="sticky top-14 md:top-16 z-30 w-full bg-[#131822]/95 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/leagues')}
                            className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center p-1 border border-white/10">
                                <img 
                                    src={config.logoUrl} 
                                    alt={config.name} 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-sm font-black text-white uppercase tracking-tighter">
                                {config.name} <span className={config.colorClass}>{config.subtitle}</span>
                            </span>
                        </div>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <div className="flex items-center gap-2">
                             {activeTab === 'teams' && teams.length > 0 && (
                                <button 
                                    onClick={handleDeepSyncAll}
                                    disabled={syncing}
                                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-400 transition-all flex items-center gap-2"
                                >
                                    <Activity size={12} className={cn(syncing && "animate-pulse")} />
                                    {syncing && syncProgress.total > 0 
                                        ? `Progreso: ${syncProgress.current}/${syncProgress.total}` 
                                        : 'Sync Profunda (Planteles)'}
                                </button>
                            )}
                            <button 
                                onClick={handleSync}
                                disabled={syncing}
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={12} className={cn(syncing && "animate-spin")} />
                                {syncing && syncProgress.total === 0 ? 'Sincronizando...' : 'Actualizar Gral.'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 space-y-8">
                
                {/* Hero Feature */}
                <section className={cn("relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br border p-8 shadow-2xl", config.gradientFromTo)}>
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                         <BannerIcon size={400} className="absolute -top-20 -right-20 text-white rotate-12" />
                    </div>
                    
                    <div className="relative z-10 space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <Zap size={12} className={cn("fill-current", config.colorClass)} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", config.colorClass)}>Competición Activa</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                            {config.name} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
                                TEMPORADA 2026
                            </span>
                        </h1>
                        <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                            {config.description}
                        </p>
                    </div>
                </section>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1 bg-[#131822] p-1.5 rounded-[1.5rem] border border-white/5 w-fit">
                    {[
                        { id: 'fixtures', label: 'Partidos', icon: Calendar },
                        { id: 'standings', label: 'Posiciones', icon: Trophy },
                        { id: 'teams', label: 'Clubes', icon: Shield },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]" 
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <RefreshCw size={40} className="text-blue-500 animate-spin opacity-20" />
                            <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em]">Cargando Hub...</p>
                        </div>
                    ) : activeTab === 'fixtures' ? (
                        <div className="bg-[#131822] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                            {matches.length > 0 ? (
                                <OfficialMatchList 
                                    matches={matches} 
                                    showGroupLink={false}
                                    onMatchClick={(matchId) => {
                                        navigate(`/predictions/match/${matchId}?mode=MACHINE`);
                                    }}
                                    leagueBadge={config.name}
                                />
                            ) : (
                                <div className="p-12 text-center text-zinc-600">
                                    <Calendar size={40} className="mx-auto mb-4 opacity-10" />
                                    <h3 className="font-black uppercase tracking-widest mb-1 text-zinc-500">Sin partidos programados</h3>
                                    <p className="text-xs font-medium">No se encontraron partidos de esta liga en la base de datos.</p>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'standings' ? (
                        <div className="bg-[#131822] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Tabla de Posiciones</h3>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Temporada 2026</span>
                            </div>
                            {standings.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                <th className="px-6 py-4">#</th>
                                                <th className="px-6 py-4">Club</th>
                                                <th className="px-6 py-4 text-center">PTS</th>
                                                <th className="px-6 py-4 text-center">PJ</th>
                                                <th className="px-6 py-4 text-center">G</th>
                                                <th className="px-6 py-4 text-center">E</th>
                                                <th className="px-6 py-4 text-center">P</th>
                                                <th className="px-6 py-4 text-center">Racha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {standings.map((s, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "w-6 h-6 flex items-center justify-center rounded text-[10px] font-black",
                                                            s.rank <= 4 ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500"
                                                        )}>
                                                            {s.rank}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div 
                                                            className="flex items-center gap-3 cursor-pointer group/team"
                                                            onClick={() => openTeamDetails(s.teams)}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 p-1.5 flex items-center justify-center group-hover/team:scale-110 transition-transform">
                                                                <img src={s.teams?.logo} alt="" className="w-full h-full object-contain animate-fade-in" onError={(e) => { (e.target as any).src = 'https://media.api-sports.io/football/teams/unknown.png'; }} />
                                                            </div>
                                                            <span className="text-sm font-bold text-zinc-300 group-hover/team:text-blue-400 transition-colors uppercase tracking-tight">{s.teams?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-white">{s.points}</td>
                                                    <td className="px-6 py-4 text-center text-zinc-500 text-sm font-medium">{s.played}</td>
                                                    <td className="px-6 py-4 text-center text-zinc-500 text-sm font-medium">{s.win}</td>
                                                    <td className="px-6 py-4 text-center text-zinc-500 text-sm font-medium">{s.draw}</td>
                                                    <td className="px-6 py-4 text-center text-zinc-500 text-sm font-medium">{s.lose}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {s.form?.split('').map((char: string, i: number) => (
                                                                <div 
                                                                    key={i} 
                                                                    className={cn(
                                                                        "w-1.5 h-1.5 rounded-full",
                                                                        char === 'W' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                                                                        char === 'D' ? "bg-amber-500" : "bg-red-500"
                                                                    )} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-zinc-600">
                                    <p className="text-xs font-bold uppercase tracking-widest">Sin datos de posiciones.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                            {teams.length > 0 ? (
                                teams.map((team) => (
                                    <button 
                                        key={team.id}
                                        onClick={() => openTeamDetails(team)}
                                        className="bg-[#131822] border border-white/5 rounded-[1.5rem] p-6 hover:border-blue-500/30 hover:-translate-y-1 transition-all group shadow-xl"
                                    >
                                        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl p-3 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" onError={(e) => { (e.target as any).src = 'https://media.api-sports.io/football/teams/unknown.png'; }} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-tight text-zinc-500 text-center line-clamp-1 group-hover:text-white transition-colors">
                                            {team.name}
                                        </h4>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full p-12 text-center text-zinc-600 border border-white/5 rounded-[2rem]">
                                    <p className="text-xs font-bold uppercase tracking-widest">Sin datos de clubes.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Information Card */}
                <section className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-6 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Info className="text-blue-400" size={20} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Reglas de Juego</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            Los puntos se calculan de manera estándar: <strong>3 pts</strong> por resultado exacto, <strong>2 pts</strong> por acierto de diferencia de goles, y <strong>1 pto</strong> por acertar el ganador. Puedes aplicar especias y multiplicadores comprados en la Tienda antes de que empiece el partido.
                        </p>
                    </div>
                </section>
            </main>

            <TeamDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                team={selectedTeam}
            />
        </div>
    );
};
