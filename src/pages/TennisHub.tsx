import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Trophy, Zap, CircleDot, Star, Info, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { matchService } from '../services/matchService';
import { leagueService } from '../services/leagueService';
import { OfficialMatchList } from '../components/competition/OfficialMatchList';

export const TennisHub: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'fixtures' | 'rankings'>('fixtures');
    const [activeCircuit, setActiveCircuit] = useState<'atp' | 'wta'>('atp');
    
    const [matches, setMatches] = useState<any[]>([]);
    const [standings, setStandings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const leagueId = 'tennis';

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
            } else if (activeTab === 'rankings') {
                // Fetch tennis rankings (mapped to standings table)
                let res = await leagueService.getStandings(leagueId, 2026);
                if (!res.data || res.data.length === 0) {
                    res = await leagueService.getStandings(leagueId, 2024);
                }
                setStandings(res.data || []);
            }
        } catch (error) {
            console.error('Error loading tennis data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentRankings = standings.filter(s => {
        const circuit = s.metadata?.circuit || 'atp';
        return circuit.toLowerCase() === activeCircuit;
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
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center p-1 border border-emerald-500/20">
                                <CircleDot size={18} className="text-emerald-500" />
                            </div>
                            <span className="text-sm font-black text-white uppercase tracking-tighter">
                                Grand Slams <span className="text-emerald-400">Tennis Hub</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Hero Section */}
                <section 
                    className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/10 p-8 shadow-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url('/tennis_background.png')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-emerald-950/40 mix-blend-multiply" />
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                         <CircleDot size={400} className="absolute -top-20 -right-20 text-white rotate-12" />
                    </div>
                    
                    <div className="relative z-10 space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Zap size={12} className="text-emerald-400 fill-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Grand Slams 2026</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                            El Circuito de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                                LOS MAESTROS
                            </span>
                        </h1>
                        <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                            Predice al ganador de los encuentros definitorios en Wimbledon, Roland Garros, US Open y Australian Open.
                        </p>
                    </div>
                </section>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1 bg-[#131822] p-1.5 rounded-[1.5rem] border border-white/5 w-fit">
                    {[
                        { id: 'fixtures', label: 'Partidos de Tenis', icon: Calendar },
                        { id: 'rankings', label: 'Ranking ATP / WTA', icon: Trophy },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id 
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]" 
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
                            <RefreshCw size={40} className="text-emerald-500 animate-spin opacity-20" />
                            <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em]">Cargando Tennis Hub...</p>
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
                                    leagueBadge="Grand Slam"
                                />
                            ) : (
                                <div className="p-12 text-center text-zinc-600">
                                    <Calendar size={40} className="mx-auto mb-4 opacity-10" />
                                    <h3 className="font-black uppercase tracking-widest mb-1 text-zinc-500">Sin partidos programados</h3>
                                    <p className="text-xs font-medium">No se encontraron partidos en juego.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Circuit selector */}
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <button
                                    onClick={() => setActiveCircuit('atp')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                                        activeCircuit === 'atp'
                                            ? "bg-white/10 text-emerald-400 border border-emerald-500/20"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Ranking ATP (Masculino)
                                </button>
                                <button
                                    onClick={() => setActiveCircuit('wta')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all",
                                        activeCircuit === 'wta'
                                            ? "bg-white/10 text-emerald-400 border border-emerald-500/20"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    Ranking WTA (Femenino)
                                </button>
                            </div>

                            <div className="bg-[#131822] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
                                {currentRankings.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                    <th className="px-6 py-4">Puesto</th>
                                                    <th className="px-6 py-4">Tenista</th>
                                                    <th className="px-6 py-4 text-center">País</th>
                                                    <th className="px-6 py-4 text-center">PTS</th>
                                                    <th className="px-6 py-4 text-center">Torneos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {currentRankings.map((s, idx) => (
                                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <span className="w-6 h-6 flex items-center justify-center rounded text-[10px] font-black text-emerald-400 bg-emerald-500/10">
                                                                {s.rank}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-white/5 p-1 flex items-center justify-center">
                                                                    <img src={s.teams?.logo} alt="" className="w-full h-full object-contain rounded" onError={(e) => { (e.target as any).src = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Tennis_ball_3.svg'; }} />
                                                                </div>
                                                                <span className="text-sm font-bold text-zinc-300 uppercase tracking-tight">{s.teams?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-zinc-400 font-medium uppercase tracking-wider text-xs">
                                                            {s.metadata?.country || 'TBD'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-black text-white">{s.points}</td>
                                                        <td className="px-6 py-4 text-center text-zinc-500 text-sm font-medium">
                                                            {s.played || '0'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-zinc-600">
                                        <p className="text-xs font-bold uppercase tracking-widest">Sin datos de rankings de tenis.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Info className="text-emerald-400" size={20} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Pronósticos Tenis</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                            En el tenis se predice al ganador absoluto del encuentro. Las cuotas son dinámicas y reflejan el estado de forma reciente de los tenistas. ¡Analiza los duelos de los Grand Slams y potencia tus tokens!
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};
