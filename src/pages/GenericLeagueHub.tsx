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
    Star,
    Bell
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
        dbLeagueIdForMatches: 'lpf',
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
        dbLeagueIdForMatches: 'ucl',
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
        dbLeagueIdForMatches: 'premier',
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
        dbLeagueIdForMatches: 'libertadores',
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
        dbLeagueIdForMatches: 'laliga',
        dbLeagueIdForStandings: 'laliga',
        colorClass: 'text-red-400',
        gradientFromTo: 'from-red-600/20 to-orange-900/40 border-red-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/800px-LaLiga_logo_2023.svg.png',
        description: 'Técnica exquisita, posesión y el clásico más grande del mundo. Predice cada jornada del campeonato español.',
        bannerIcon: Star
    },
    uel: {
        name: 'UEFA Europa League',
        subtitle: 'Europa',
        apiLeagueId: 3,
        dbLeagueIdForMatches: 'uel',
        dbLeagueIdForStandings: 'uel',
        colorClass: 'text-orange-400',
        gradientFromTo: 'from-orange-600/20 to-amber-950/40 border-orange-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282021-present%29.svg/800px-UEFA_Europa_League_logo_%282021-present%29.svg.png',
        description: 'La intensidad y drama de la Europa League. Predice las batallas continentales y conquista el trofeo de plata.',
        bannerIcon: Trophy
    },
    'serie-a': {
        name: 'Serie A',
        subtitle: 'Italia',
        apiLeagueId: 135,
        dbLeagueIdForMatches: 'serie-a',
        dbLeagueIdForStandings: 'serie-a',
        colorClass: 'text-cyan-400',
        gradientFromTo: 'from-cyan-600/20 to-blue-900/40 border-cyan-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Serie_A_logo_2024.svg/800px-Serie_A_logo_2024.svg.png',
        description: 'Táctica de hierro y pasión italiana. Predice los emocionantes encuentros del Calcio italiano.',
        bannerIcon: Shield
    },
    bundesliga: {
        name: 'Bundesliga',
        subtitle: 'Alemania',
        apiLeagueId: 78,
        dbLeagueIdForMatches: 'bundesliga',
        dbLeagueIdForStandings: 'bundesliga',
        colorClass: 'text-red-400',
        gradientFromTo: 'from-red-700/20 to-zinc-900/40 border-red-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bundesliga_logo_%282017%29.svg/800px-Bundesliga_logo_%282017%29.svg.png',
        description: 'Estadios llenos y el fútbol más vertical de Europa. Predice los vibrantes partidos de la Bundesliga.',
        bannerIcon: Shield
    },
    ligue1: {
        name: 'Ligue 1',
        subtitle: 'Francia',
        apiLeagueId: 61,
        dbLeagueIdForMatches: 'ligue1',
        dbLeagueIdForStandings: 'ligue1',
        colorClass: 'text-lime-400',
        gradientFromTo: 'from-lime-600/20 to-emerald-950/40 border-lime-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Ligue_1_McDonald%27s_logo.svg/800px-Ligue_1_McDonald%27s_logo.svg.png',
        description: 'Fuerza, velocidad y elegancia en la liga francesa. Sigue y predice cada jornada de la Ligue 1.',
        bannerIcon: Shield
    },
    'primeira-liga': {
        name: 'Primeira Liga',
        subtitle: 'Portugal',
        apiLeagueId: 94,
        dbLeagueIdForMatches: 'primeira-liga',
        dbLeagueIdForStandings: 'primeira-liga',
        colorClass: 'text-emerald-400',
        gradientFromTo: 'from-emerald-600/20 to-zinc-900/40 border-emerald-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Liga_Portugal_logo_%282023%29.svg/800px-Liga_Portugal_logo_%282023%29.svg.png',
        description: 'Técnica e intensidad en Portugal. Predice a los grandes como Benfica, Porto y Sporting CP.',
        bannerIcon: Shield
    },
    brasileirao: {
        name: 'Brasileirão',
        subtitle: 'Brasil',
        apiLeagueId: 71,
        dbLeagueIdForMatches: 'brasileirao',
        dbLeagueIdForStandings: 'brasileirao',
        colorClass: 'text-yellow-400',
        gradientFromTo: 'from-green-600/20 to-yellow-900/40 border-green-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg/800px-Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg.png',
        description: 'El "Jogo Bonito" y la liga más emocionante de Sudamérica. Predice la Serie A del fútbol brasileño.',
        bannerIcon: Globe
    },
    ligamx: {
        name: 'Liga MX',
        subtitle: 'México',
        apiLeagueId: 262,
        dbLeagueIdForMatches: 'ligamx',
        dbLeagueIdForStandings: 'ligamx',
        colorClass: 'text-emerald-400',
        gradientFromTo: 'from-emerald-600/20 to-teal-950/40 border-emerald-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Liga_MX_logo.svg/800px-Liga_MX_logo.svg.png',
        description: 'La pasión del fútbol mexicano. Predice las fechas de la Liga MX, desde el Apertura hasta la Liguilla.',
        bannerIcon: Shield
    },
    'primera-a-colombia': {
        name: 'Categoría Primera A',
        subtitle: 'Colombia',
        apiLeagueId: 239,
        dbLeagueIdForMatches: 'primera-a-colombia',
        dbLeagueIdForStandings: 'primera-a-colombia',
        colorClass: 'text-orange-400',
        gradientFromTo: 'from-orange-600/20 to-amber-900/40 border-orange-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Dimayor_logo.svg/800px-Dimayor_logo.svg.png',
        description: 'La garra y el talento del fútbol profesional colombiano. Sigue posiciones y predice los partidos.',
        bannerIcon: Shield
    },
    'primera-chile': {
        name: 'Primera División',
        subtitle: 'Chile',
        apiLeagueId: 265,
        dbLeagueIdForMatches: 'primera-chile',
        dbLeagueIdForStandings: 'primera-chile',
        colorClass: 'text-red-400',
        gradientFromTo: 'from-red-600/20 to-blue-900/40 border-red-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_ANFP.png/800px-Logo_ANFP.png',
        description: 'El torneo oficial de la Primera División de Chile. Predice cada fecha en el sistema de jugadas.',
        bannerIcon: Shield
    },
    'primera-uruguay': {
        name: 'Primera División',
        subtitle: 'Uruguay',
        apiLeagueId: 268,
        dbLeagueIdForMatches: 'primera-uruguay',
        dbLeagueIdForStandings: 'primera-uruguay',
        colorClass: 'text-sky-400',
        gradientFromTo: 'from-sky-600/20 to-black/40 border-sky-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Logo_AUF.png/800px-Logo_AUF.png',
        description: 'La tradición charrúa y la gloria uruguaya. Predice los clásicos nacionales de Uruguay.',
        bannerIcon: Shield
    },
    sudamericana: {
        name: 'Copa Sudamericana',
        subtitle: 'Sudamérica',
        apiLeagueId: 11,
        dbLeagueIdForMatches: 'sudamericana',
        dbLeagueIdForStandings: 'sudamericana',
        colorClass: 'text-amber-400',
        gradientFromTo: 'from-amber-600/20 to-zinc-900/40 border-amber-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Copa_Sudamericana_Logo.svg/800px-Copa_Sudamericana_Logo.svg.png',
        description: 'La otra mitad de la gloria continental. Predice el camino a la final de la Copa Sudamericana.',
        bannerIcon: Globe
    },
    'primera-nacional': {
        name: 'Primera Nacional',
        subtitle: 'Argentina',
        apiLeagueId: 129,
        dbLeagueIdForMatches: 'primera-nacional',
        dbLeagueIdForStandings: 'primera-nacional',
        colorClass: 'text-blue-400',
        gradientFromTo: 'from-blue-600/20 to-indigo-950/40 border-blue-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg/800px-Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg.png',
        description: 'La segunda división de Argentina. Sigue posiciones y predice el camino al ascenso.',
        bannerIcon: Shield
    },
    'copa-argentina': {
        name: 'Copa Argentina',
        subtitle: 'Argentina',
        apiLeagueId: 130,
        dbLeagueIdForMatches: 'copa-argentina',
        dbLeagueIdForStandings: 'copa-argentina',
        colorClass: 'text-sky-400',
        gradientFromTo: 'from-sky-600/20 to-cyan-900/40 border-sky-500/10',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg/800px-Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg.png',
        description: 'El torneo federal más integrador de Argentina. La mística de los cruces de eliminación directa.',
        bannerIcon: Trophy
    }
};

const formatRoundTabName = (round: string) => {
    if (!round) return '';
    let formatted = round;
    
    const lower = round.toLowerCase();
    
    // Translations map for knockout stages and cup stages
    if (lower.includes('round of 16')) {
        formatted = 'Octavos de Final';
    } else if (lower.includes('quarter-finals')) {
        formatted = 'Cuartos de Final';
    } else if (lower.includes('semi-finals')) {
        formatted = 'Semifinales';
    } else if (lower.includes('final') && !lower.includes('semi-final') && !lower.includes('quarter-final')) {
        formatted = 'Final';
    } else if (lower.includes('league stage -')) {
        const match = round.match(/\d+/);
        formatted = match ? `Fase de Liga - Fecha ${match[0]}` : 'Fase de Liga';
    } else if (lower.includes('group stage -')) {
        const match = round.match(/\d+/);
        formatted = match ? `Fase de Grupos - Fecha ${match[0]}` : 'Fase de Grupos';
    } else if (lower.includes('regular season -')) {
        const match = round.match(/\d+/);
        formatted = match ? `Fecha ${match[0]}` : round;
    } else if (lower.includes('apertura -')) {
        const match = round.match(/\d+/);
        if (match) {
            formatted = `Fecha ${match[0]} (Apertura)`;
        }
    } else if (lower.includes('clausura -')) {
        const match = round.match(/\d+/);
        if (match) {
            formatted = `Fecha ${match[0]} (Clausura)`;
        }
    }
    
    return formatted;
};

const formatSeasonYear = (leagueKey: string, season: number) => {
    const euroLeagues = ['ucl', 'premier', 'laliga', 'serie-a', 'bundesliga', 'ligue1', 'uel', 'primeira-liga', 'ligamx'];
    if (euroLeagues.includes(leagueKey)) {
        return `${season - 1}/${season.toString().slice(-2)}`;
    }
    return season.toString();
};

export const GenericLeagueHub: React.FC = () => {
    const navigate = useNavigate();
    const { leagueId } = useParams<{ leagueId: string }>();
    const { user } = useUser();
    
    const [activeTab, setActiveTab] = useState<'fixtures' | 'standings' | 'teams'>('fixtures');
    const [standings, setStandings] = useState<any[]>([]);
    const [standingsSeason, setStandingsSeason] = useState<number>(2026);
    const [teams, setTeams] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [rounds, setRounds] = useState<string[]>([]);
    const [selectedRound, setSelectedRound] = useState<string>('');
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
                const finalMatches = activeMatches.length > 0 ? activeMatches : data || [];
                setMatches(finalMatches);

                // Group matches by round to find unique rounds
                const roundsMap = new Map();
                finalMatches.forEach(m => {
                    const rName = m.group || 'General';
                    if (!roundsMap.has(rName)) {
                        roundsMap.set(rName, { name: rName, minDate: m.date, matches: [] });
                    }
                    const info = roundsMap.get(rName);
                    info.matches.push(m);
                    if (m.date < info.minDate) {
                        info.minDate = m.date;
                    }
                });

                // Sort rounds DESCENDING (de atrás hacia adelante) so that current/latest rounds appear first
                const sortedRounds = Array.from(roundsMap.values())
                    .sort((a, b) => b.minDate.localeCompare(a.minDate))
                    .map(r => r.name);

                setRounds(sortedRounds);

                if (sortedRounds.length > 0) {
                    const today = new Date();
                    let bestRound = '';
                    
                    // 1. First priority: find round with active live matches
                    const liveRound = sortedRounds.find(rName => {
                        const rMatches = finalMatches.filter(m => (m.group || 'General') === rName);
                        return rMatches.some(m => m.status === 'live');
                    });
                    
                    if (liveRound) {
                        bestRound = liveRound;
                    } else {
                        // 2. Second priority: find the round whose matches are closest to today's date
                        let minDiff = Infinity;
                        sortedRounds.forEach(rName => {
                            const rMatches = finalMatches.filter(m => (m.group || 'General') === rName);
                            rMatches.forEach(m => {
                                const matchTime = m.startTime ? new Date(m.startTime).getTime() : new Date(m.date).getTime();
                                const diff = Math.abs(matchTime - today.getTime());
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    bestRound = rName;
                                }
                            });
                        });
                    }
                    
                    const defaultRound = bestRound || sortedRounds[0];
                    setSelectedRound(defaultRound);
                }
            } else if (activeTab === 'standings') {
                const res = await leagueService.getStandings(config.dbLeagueIdForStandings);
                setStandings(res.data || []);
                if (res.season) {
                    setStandingsSeason(res.season);
                }
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
                            {import.meta.env.VITE_API_FOOTBALL_KEY ? (
                                <>
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
                                </>
                            ) : (
                                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
                                    <Globe size={12} className="animate-pulse" />
                                    Sync Automático Activo 🟢
                                </div>
                            )}
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
                        <div className="space-y-6">
                            {/* Round Selector component */}
                            {rounds.length > 0 && (
                                <div className="bg-[#131822] border border-white/5 p-4 rounded-[1.5rem] flex flex-col md:flex-row items-center gap-4 justify-between shadow-xl">
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Fecha / Ronda:</span>
                                        <select
                                            value={selectedRound}
                                            onChange={(e) => setSelectedRound(e.target.value)}
                                            className="w-full md:w-64 bg-[#0A0D12] text-zinc-300 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:border-blue-500/50 outline-none transition-colors uppercase tracking-wider cursor-pointer"
                                        >
                                            {rounds.map((rName) => {
                                                const rMatches = matches.filter(m => (m.group || 'General') === rName);
                                                const isFinished = rMatches.every(m => m.status === 'finished');
                                                const isLive = rMatches.some(m => m.status === 'live');
                                                const labelSuffix = isLive ? ' (EN VIVO 🟢)' : isFinished ? ' (Finalizada)' : ' (Pendiente)';
                                                return (
                                                    <option key={rName} value={rName}>
                                                        {formatRoundTabName(rName) + labelSuffix}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    
                                    {/* Horizontal chips quick selection for desktop */}
                                    <div className="hidden lg:flex items-center gap-2 overflow-x-auto max-w-2xl no-scrollbar scroll-smooth">
                                        {rounds.map((rName) => {
                                            const rMatches = matches.filter(m => (m.group || 'General') === rName);
                                            const isFinished = rMatches.every(m => m.status === 'finished');
                                            const isLive = rMatches.some(m => m.status === 'live');
                                            return (
                                                <button
                                                    key={rName}
                                                    onClick={() => setSelectedRound(rName)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                                        selectedRound === rName
                                                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                            : isLive 
                                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                                : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
                                                    )}
                                                >
                                                    {formatRoundTabName(rName).replace(' (Apertura)', '').replace(' (Clausura)', '')}
                                                    {isLive && <span className="ml-1 text-[8px] animate-pulse">●</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="bg-[#131822] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                                {matches.length > 0 ? (
                                    <OfficialMatchList 
                                        matches={matches.filter(m => (m.group || 'General') === selectedRound)} 
                                        showGroupLink={false}
                                        onMatchClick={(matchId) => {
                                            const targetMatch = matches.find(m => m.id === matchId);
                                            if (targetMatch && (targetMatch.status === 'finished' || targetMatch.status === 'live')) {
                                                navigate(`/match/${matchId}`);
                                            } else {
                                                navigate(`/predictions/match/${matchId}?mode=MACHINE`);
                                            }
                                        }}
                                        leagueBadge={config.name}
                                    />
                                ) : (
                                    <div className="p-12 text-center text-zinc-400 bg-black/20 rounded-3xl border border-white/5 relative overflow-hidden m-4">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
                                        
                                        <Calendar size={48} className="mx-auto mb-6 opacity-20 text-blue-400 relative z-10" />
                                        <h3 className="text-lg md:text-xl font-black uppercase tracking-wider mb-3 text-white relative z-10">Las fechas no se han definido al momento</h3>
                                        <p className="text-sm font-medium text-zinc-400 max-w-md mx-auto mb-8 relative z-10">
                                            Estamos a la espera de que la organización oficial confirme el calendario de partidos para esta competición.
                                        </p>
                                        
                                        <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 relative z-10">
                                            <button 
                                                onClick={() => navigate('/notify')}
                                                className="flex items-center gap-3 px-6 py-4 bg-[#0A0D12] rounded-xl hover:bg-white/5 transition-all border border-white/10 group shadow-xl"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <Bell size={16} className="text-blue-400 group-hover:animate-ping" />
                                                </div>
                                                <span className="text-sm font-black text-white uppercase tracking-wider">
                                                    Registrarse para alerta
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'standings' ? (
                        standings.length > 0 ? (
                            (() => {
                                // Group standings by group_name
                                const groupsMap: Record<string, any[]> = {};
                                standings.forEach(s => {
                                    const gName = s.group_name || 'General';
                                    if (!groupsMap[gName]) {
                                        groupsMap[gName] = [];
                                    }
                                    groupsMap[gName].push(s);
                                });

                                const groupKeys = Object.keys(groupsMap).sort((a, b) => a.localeCompare(b));

                                const formatGroupName = (name: string) => {
                                    return name
                                        .replace(/Group\s+/gi, 'Grupo ')
                                        .replace(/League Stage/gi, 'Fase de Liga')
                                        .replace(/Group Stage/gi, 'Fase de Grupos');
                                };

                                if (groupKeys.length > 1) {
                                    return (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {groupKeys.map((groupKey) => {
                                                const groupStandings = groupsMap[groupKey].sort((a, b) => a.rank - b.rank);
                                                return (
                                                    <div key={groupKey} className="bg-[#131822] border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/15">
                                                        <div className="p-6 border-b-2 border-white/10 bg-white/[0.02] flex items-center justify-between">
                                                            <h3 className="text-base font-black text-white uppercase tracking-wider">{formatGroupName(groupKey)}</h3>
                                                            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                                                Temporada {formatSeasonYear(currentLeagueKey, standingsSeason)}
                                                            </span>
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left border-collapse">
                                                                <thead>
                                                                    <tr className="bg-white/[0.04] text-xs font-black uppercase tracking-wider text-zinc-200 border-b-2 border-white/10">
                                                                        <th className="px-4 py-4 w-14 text-center">#</th>
                                                                        <th className="px-4 py-4">Club</th>
                                                                        <th className="px-4 py-4 text-center text-blue-400 font-extrabold">PTS</th>
                                                                        <th className="px-4 py-4 text-center">PJ</th>
                                                                        <th className="px-4 py-4 text-center">G</th>
                                                                        <th className="px-4 py-4 text-center">E</th>
                                                                        <th className="px-4 py-4 text-center">P</th>
                                                                        <th className="px-4 py-4 text-center">DG</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/10">
                                                                    {groupStandings.map((s, idx) => {
                                                                        const diff = (s.goals_for || 0) - (s.goals_against || 0);
                                                                        return (
                                                                            <tr key={idx} className="hover:bg-white/[0.06] transition-colors border-b border-white/5 last:border-b-0 group">
                                                                                <td className="px-4 py-4.5 text-center">
                                                                                    <span className={cn(
                                                                                        "w-7 h-7 inline-flex items-center justify-center rounded-xl text-xs font-black shadow-inner",
                                                                                        s.rank <= 2 
                                                                                            ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40" 
                                                                                            : s.rank <= 4 
                                                                                                ? "bg-blue-500/25 text-blue-300 border border-blue-500/40"
                                                                                                : "bg-white/5 text-zinc-300 border border-white/10"
                                                                                    )}>
                                                                                        {s.rank}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-4.5">
                                                                                    <div 
                                                                                        className="flex items-center gap-3 cursor-pointer group/team"
                                                                                        onClick={() => openTeamDetails(s.teams)}
                                                                                    >
                                                                                        <div className="w-8 h-8 rounded-xl bg-white/5 p-1 flex items-center justify-center border-2 border-white/10 group-hover/team:scale-105 group-hover/team:border-blue-500/40 transition-all shadow-md">
                                                                                            <img src={s.teams?.logo} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as any).src = 'https://media.api-sports.io/football/teams/unknown.png'; }} />
                                                                                        </div>
                                                                                        <span className="text-xs md:text-sm font-bold text-zinc-100 group-hover/team:text-blue-400 transition-colors tracking-tight line-clamp-1">{s.teams?.name}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-4.5 text-center">
                                                                                    <span className="font-extrabold text-sm md:text-base text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                                                                                        {s.points}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-4.5 text-center text-zinc-100 text-xs md:text-sm font-extrabold">{s.played}</td>
                                                                                <td className="px-4 py-4.5 text-center text-zinc-100 text-xs md:text-sm font-bold">{s.win}</td>
                                                                                <td className="px-4 py-4.5 text-center text-zinc-100 text-xs md:text-sm font-bold">{s.draw}</td>
                                                                                <td className="px-4 py-4.5 text-center text-zinc-100 text-xs md:text-sm font-bold">{s.lose}</td>
                                                                                <td className={cn(
                                                                                    "px-4 py-4.5 text-center text-xs md:text-sm font-extrabold",
                                                                                    diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-zinc-400"
                                                                                )}>
                                                                                    {diff > 0 ? `+${diff}` : diff}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                // Single group fallback (Default)
                                return (
                                    <div className="bg-[#131822] border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="p-6 border-b-2 border-white/10 flex items-center justify-between bg-white/[0.02]">
                                            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Tabla de Posiciones</h3>
                                            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                                Temporada {formatSeasonYear(currentLeagueKey, standingsSeason)}
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto bg-black/[0.05]">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-white/[0.04] text-xs md:text-sm font-black uppercase tracking-wider text-zinc-200 border-b-2 border-white/10">
                                                        <th className="px-6 py-4.5 w-20 text-center">#</th>
                                                        <th className="px-6 py-4.5">Club</th>
                                                        <th className="px-6 py-4.5 text-center text-blue-400 font-extrabold">PTS</th>
                                                        <th className="px-6 py-4.5 text-center">PJ</th>
                                                        <th className="px-6 py-4.5 text-center">G</th>
                                                        <th className="px-6 py-4.5 text-center">E</th>
                                                        <th className="px-6 py-4.5 text-center">P</th>
                                                        <th className="px-6 py-4.5 text-center">DG</th>
                                                        <th className="px-6 py-4.5 text-center">Racha</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/10">
                                                    {standings.map((s, idx) => {
                                                        const diff = (s.goals_for || 0) - (s.goals_against || 0);
                                                        return (
                                                            <tr key={idx} className="hover:bg-white/[0.06] transition-colors border-b border-white/5 last:border-b-0 group">
                                                                <td className="px-6 py-5 text-center">
                                                                    <span className={cn(
                                                                        "w-8 h-8 inline-flex items-center justify-center rounded-xl text-xs font-black shadow-inner",
                                                                        s.rank <= 4 ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40" : "bg-white/5 text-zinc-300 border border-white/10"
                                                                    )}>
                                                                        {s.rank}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <div 
                                                                        className="flex items-center gap-4 cursor-pointer group/team"
                                                                        onClick={() => openTeamDetails(s.teams)}
                                                                    >
                                                                        <div className="w-10 h-10 rounded-2xl bg-white/5 p-1.5 flex items-center justify-center border-2 border-white/10 group-hover/team:scale-105 group-hover/team:border-blue-500/40 transition-all shadow-md">
                                                                            <img src={s.teams?.logo} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as any).src = 'https://media.api-sports.io/football/teams/unknown.png'; }} />
                                                                        </div>
                                                                        <span className="text-sm md:text-base font-extrabold text-zinc-100 group-hover/team:text-blue-400 transition-colors tracking-tight">{s.teams?.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5 text-center">
                                                                    <span className="font-extrabold text-base md:text-lg text-white bg-blue-500/10 px-3.5 py-1.5 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                                                        {s.points}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-5 text-center text-zinc-100 text-sm md:text-base font-extrabold">{s.played}</td>
                                                                <td className="px-6 py-5 text-center text-zinc-100 text-sm md:text-base font-bold">{s.win}</td>
                                                                <td className="px-6 py-5 text-center text-zinc-100 text-sm md:text-base font-bold">{s.draw}</td>
                                                                <td className="px-6 py-5 text-center text-zinc-100 text-sm md:text-base font-bold">{s.lose}</td>
                                                                <td className={cn(
                                                                    "px-6 py-5 text-center text-sm md:text-base font-extrabold",
                                                                    diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-zinc-400"
                                                                )}>
                                                                    {diff > 0 ? `+${diff}` : diff}
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        {s.form?.split('').map((char: string, i: number) => (
                                                                            <div 
                                                                                key={i} 
                                                                                className={cn(
                                                                                    "w-2.5 h-2.5 rounded-full border border-black/30 shadow-sm",
                                                                                    char === 'W' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                                                                                    char === 'D' ? "bg-amber-500" : "bg-rose-500"
                                                                                )} 
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="bg-[#131822] border border-white/5 rounded-[2rem] p-12 text-center text-zinc-600">
                                <p className="text-xs font-bold uppercase tracking-widest">Sin datos de posiciones.</p>
                            </div>
                        )
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
