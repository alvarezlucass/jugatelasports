import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Trophy, Zap, Target, Star, Info, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { matchService } from '../services/matchService';
import { leagueService } from '../services/leagueService';
import { OfficialMatchList } from '../components/competition/OfficialMatchList';

export const BasketballHub: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'fixtures' | 'standings'>('fixtures');
    const [activeConference, setActiveConference] = useState<'east' | 'west'>('east');
    
    const [matches, setMatches] = useState<any[]>([]);
    const [standings, setStandings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const leagueId = 'nba';

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'fixtures') {
                const data = await matchService.getMatches(leagueId);
                // Filter matches for 2026 (simulated active season) or show all if empty
                const activeMatches = (data || []).filter(m => m.date.startsWith('2026'));
                setMatches(activeMatches.length > 0 ? activeMatches : data || []);
            } else if (activeTab === 'standings') {
                // Fetch standings from DB
                let res = await leagueService.getStandings(leagueId, 2026);
                if (!res.data || res.data.length === 0) {
                    res = await leagueService.getStandings(leagueId, 2024);
                }
                setStandings(res.data || []);
            }
        } catch (error) {
            console.error('Error loading basketball data:', error);
        } finally {
            setLoading(false);
        }
    };

    const conferenceStandings = standings.filter(s => {
        const conf = s.metadata?.conference || 'east';
        return conf.toLowerCase() === activeConference;
    });

    return (
        <div className="min-h-screen bg-[#0A0D12] pb-12 animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="sticky top-14 md:top-16 z-30 w-full bg-[#131822]/95 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center p-1 border border-orange-500/20">
                                <Target size={18} className="text-orange-500" />
                            </div>
                            <span className="text-sm font-black text-white uppercase tracking-tighter">
                                NBA <span className="text-orange-400">Basketball Hub</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Hero Section */}
                <section 
                    className="relative overflow-hidden rounded-[2.5rem] border border-orange-500/10 p-8 shadow-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url('/basketball_background.png')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-orange-950/40 mix-blend-multiply" />
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                         <Target size={400} className="absolute -top-20 -right-20 text-white rotate-12" />
                    </div>
                    
                    <div className="relative z-10 space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <Zap size={12} className="text-orange-400 fill-orange-400" />
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Temporada Activa 2026</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                            El Mejor Básquet <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                                DEL PLANETA
                            </span>
                        </h1>
                        <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                            Predice el ganador de los mejores cruces de la NBA, acumula tokens y escala en la clasificación.
                        </p>
                    </div>
                </section>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1 bg-[#131822] p-1.5 rounded-[1.5rem] border border-white/5 w-fit">
                    {[
                        { id: 'fixtures', label: 'Partidos NBA', icon: Calendar },
                        { id: 'standings', label: 'Tablas de Posiciones', icon: Trophy },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id 
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]" 
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
                            <RefreshCw size={40} className="text-orange-500 animate-spin opacity-20" />
                            <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em]">Cargando NBA Hub...</p>
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
                                    leagueBadge="NBA"
                                />
                            ) : (
                                <div className="p-12 text-center text-zinc-600">
                                    <Calendar size={40} className="mx-auto mb-4 opacity-10" />
                                    <h3 className="font-black uppercase tracking-widest mb-1 text-zinc-500">Sin partidos programados</h3>
                                    <p className="text-xs font-medium">No se encontraron partidos de la NBA en la base de datos.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Conference selector */}
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <button
                                    onClick={() => setActiveConference('east')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                                        activeConference === 'east'
                                            ? "bg-white/10 text-orange-400 border border-orange-500/20"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Conferencia Este
                                </button>
                                <button
                                    onClick={() => setActiveConference('west')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                                        activeConference === 'west'
                                            ? "bg-white/10 text-orange-400 border border-orange-500/20"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Conferencia Oeste
                                </button>
                            </div>

                            <div className="bg-[#131822] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                                {conferenceStandings.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                    <th className="px-6 py-4">Puesto</th>
                                                    <th className="px-6 py-4">Franquicia</th>
                                                    <th className="px-6 py-4 text-center">G</th>
                                                    <th className="px-6 py-4 text-center">P</th>
                                                    <th className="px-6 py-4 text-center">PCT</th>
                                                    <th className="px-6 py-4 text-center">Racha</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {conferenceStandings.map((s, idx) => (
                                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <span className={cn(
                                                                "w-6 h-6 flex items-center justify-center rounded text-[10px] font-black",
                                                                s.rank <= 8 ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500"
                                                            )}>
                                                                {s.rank}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-white/5 p-1 flex items-center justify-center">
                                                                    <img src={s.teams?.logo} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as any).src = 'https://media.api-sports.io/football/teams/unknown.png'; }} />
                                                                </div>
                                                                <span className="text-sm font-bold text-zinc-300 uppercase tracking-tight">{s.teams?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-black text-white">{s.win}</td>
                                                        <td className="px-6 py-4 text-center font-black text-zinc-500">{s.lose}</td>
                                                        <td className="px-6 py-4 text-center text-zinc-400 font-medium">
                                                            {(s.win / (s.played || 1)).toFixed(3)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-zinc-500 text-sm font-medium">
                                                            {s.form || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-zinc-600">
                                        <p className="text-xs font-bold uppercase tracking-widest">Sin datos de posiciones de la NBA.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <section className="bg-orange-500/5 border border-orange-500/10 rounded-[2rem] p-6 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                        <Info className="text-orange-400" size={20} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Pronósticos NBA</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            En el básquetbol se predice al ganador del encuentro (incluyendo prórrogas si aplica). Acertar el ganador te otorga puntos directos según las cuotas definidas. ¡Usa tus boosters de la tienda para maximizar el retorno!
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};
