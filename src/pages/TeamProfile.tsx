import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Trophy, Users, Activity, MapPin, Star, History as HistoryIcon, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

interface TeamProfileData {
    id: number;
    name: string;
    founded: number | null;
    stadium_name: string | null;
    city: string | null;
    country: string | null;
    logo: string | null;
}

interface Match {
    id: string;
    start_time: string;
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
    status: string;
    home_team_logo?: string;
    away_team_logo?: string;
    metadata?: any;
}

export const TeamProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState<TeamProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const [activeTab, setActiveTab] = useState<'FIXTURE' | 'TIMELINE' | 'STADIUM' | 'SQUAD' | 'TROPHIES'>('FIXTURE');

    // Data states
    const [matches, setMatches] = useState<Match[]>([]);
    const [standings, setStandings] = useState<any[]>([]);
    const [squad, setSquad] = useState<{ players: any[], coaches: any[] }>({ players: [], coaches: [] });
    const [trophies, setTrophies] = useState<any[]>([]);

    useEffect(() => {
        if (!id || isNaN(Number(id))) {
            setErrorMsg("ID de equipo inválido.");
            setLoading(false);
            return;
        }

        const fetchTeamData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Team basic info
                const { data: teamData, error: teamError } = await supabase
                    .from('teams')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (teamError) throw teamError;
                if (!teamData) throw new Error("Equipo no encontrado.");
                setTeam(teamData);

                // 2. Fetch Matches (where team is home or away)
                // Usando JSONB ->> operator para buscar en el metadata
                const { data: matchesData } = await supabase
                    .from('matches')
                    .select('*')
                    .or(`metadata->>home_id.eq.${id},metadata->>away_id.eq.${id}`)
                    .order('start_time', { ascending: false })
                    .limit(50);
                
                if (matchesData) setMatches(matchesData);

                // 3. Fetch Standings (Línea de tiempo)
                const { data: standingsData } = await supabase
                    .from('standings')
                    .select('*')
                    .eq('team_id', id)
                    .order('season', { ascending: false })
                    .limit(10);

                if (standingsData) setStandings(standingsData);

                // 4. Fetch Squad & Trophies
                const [playersRes, coachesRes, trophiesRes] = await Promise.all([
                    supabase.from('players').select('*').eq('team_id', id).order('number', { ascending: true }),
                    supabase.from('coaches').select('*').eq('team_id', id),
                    supabase.from('trophies').select('*').eq('team_id', id).order('season', { ascending: false })
                ]);

                setSquad({
                    players: playersRes.data || [],
                    coaches: coachesRes.data || []
                });
                setTrophies(trophiesRes.data || []);

            } catch (err: any) {
                console.error("Error cargando perfil del equipo:", err);
                setErrorMsg(err.message || "Error de conexión.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-8" />
                <h2 className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Cargando Expediente...</h2>
            </div>
        );
    }

    if (errorMsg || !team) {
        return (
            <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center p-4">
                <Shield size={64} className="text-red-500/50 mb-6" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Expediente No Disponible</h2>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 font-mono text-sm mb-8">
                    {errorMsg || "El equipo no existe en la base de datos."}
                </div>
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                    <ArrowLeft size={18} /> Volver
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0D12] pb-24 animate-in fade-in duration-700">
            {/* Header / Back Navigation */}
            <div className="container mx-auto px-4 py-6 sticky top-0 z-50 bg-[#0A0D12]/80 backdrop-blur-md">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={18} /> Volver
                </button>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 mb-8">
                <div className="relative overflow-hidden rounded-[3rem] bg-[#0F131A] border border-white/5 p-8 md:p-16">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-[2rem] p-6 border border-white/10 flex items-center justify-center shadow-2xl shrink-0">
                            {team.logo ? (
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain drop-shadow-2xl" />
                            ) : (
                                <Shield className="w-20 h-20 text-zinc-600" />
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest mb-4">
                                <Star className="fill-blue-400" size={12} /> Club Verificado
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                                {team.name}
                            </h1>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8">
                                {team.stadium_name && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                        <MapPin size={16} className="text-sky-400" />
                                        {team.stadium_name}
                                    </div>
                                )}
                                {team.founded && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                        <HistoryIcon size={16} className="text-sky-400" />
                                        Fundado en {team.founded}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="container mx-auto px-4 mb-8">
                <div className="flex overflow-x-auto no-scrollbar gap-2 md:gap-4 border-b border-white/5 pb-4">
                    {[
                        { id: 'FIXTURE', label: 'Fixture', icon: Calendar },
                        { id: 'TIMELINE', label: 'Línea de Tiempo', icon: Activity },
                        // { id: 'STADIUM', label: 'El Estadio', icon: MapPin },
                        { id: 'SQUAD', label: 'Plantel', icon: Users },
                        { id: 'TROPHIES', label: 'Vitrina', icon: Trophy },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
                                activeTab === tab.id 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105" 
                                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4">
                {activeTab === 'FIXTURE' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Calendar className="text-blue-500" /> Últimos Partidos
                        </h3>
                        {matches.length === 0 ? (
                            <p className="text-zinc-500 text-center py-12 bg-white/5 rounded-3xl border border-white/5">No hay partidos registrados en la base de datos.</p>
                        ) : (
                            <div className="grid gap-4">
                                {matches.map((m) => (
                                    <div key={m.id} className="bg-[#0F131A] border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/match/${m.id}`)}>
                                        <div className="flex items-center gap-4 flex-1 justify-end">
                                            <span className={cn("font-bold text-sm md:text-base", m.home_team === team.name ? "text-white" : "text-zinc-400")}>{m.home_team}</span>
                                            {m.home_team_logo ? <img src={m.home_team_logo} alt="" className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 bg-white/10 rounded-full" />}
                                        </div>
                                        <div className="px-6 flex flex-col items-center">
                                            <div className="text-xl md:text-2xl font-black text-white tabular-nums bg-white/5 px-4 py-1 rounded-xl">
                                                {m.home_score !== null ? m.home_score : '-'} : {m.away_score !== null ? m.away_score : '-'}
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                                                {new Date(m.start_time).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 flex-1 justify-start">
                                            {m.away_team_logo ? <img src={m.away_team_logo} alt="" className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 bg-white/10 rounded-full" />}
                                            <span className={cn("font-bold text-sm md:text-base", m.away_team === team.name ? "text-white" : "text-zinc-400")}>{m.away_team}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'TIMELINE' && (
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-12 flex items-center gap-2">
                            <Activity className="text-blue-500" /> Línea de Tiempo (5 Años)
                        </h3>
                        {standings.length === 0 ? (
                            <p className="text-zinc-500 text-center py-12 bg-white/5 rounded-3xl border border-white/5">No hay datos históricos disponibles.</p>
                        ) : (
                            <div className="relative border-l-2 border-white/10 ml-4 md:ml-8 space-y-12">
                                {standings.map((s, idx) => (
                                    <div key={s.id} className="relative pl-8 md:pl-12">
                                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-blue-500 rounded-full border-4 border-[#0A0D12] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                        <div className="bg-[#0F131A] border border-white/5 p-6 md:p-8 rounded-3xl hover:border-white/10 transition-colors">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-2xl font-black text-white">Temporada {s.season}</h4>
                                                <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                                    Liga ID: {s.league_id}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                                    <span className="text-xs text-zinc-500 uppercase font-bold mb-1">Posición</span>
                                                    <span className="text-2xl font-black text-white">#{s.rank}</span>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                                    <span className="text-xs text-zinc-500 uppercase font-bold mb-1">Puntos</span>
                                                    <span className="text-2xl font-black text-white">{s.points}</span>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                                    <span className="text-xs text-zinc-500 uppercase font-bold mb-1">Partidos</span>
                                                    <span className="text-2xl font-black text-white">{s.played}</span>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                                    <span className="text-xs text-zinc-500 uppercase font-bold mb-1">Racha</span>
                                                    <span className="text-lg font-black text-white tracking-[0.2em]">{s.form || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab STADIUM oculta temporalmente por falta de datos completos
                {activeTab === 'STADIUM' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="relative overflow-hidden rounded-[3rem] bg-[#0F131A] border border-white/5 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F131A] via-[#0F131A]/80 to-transparent z-10" />
                            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                            
                            <div className="relative z-20 p-8 md:p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
                                <MapPin size={48} className="text-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                                    {team.stadium_name || "Estadio Principal"}
                                </h3>
                                <p className="text-zinc-400 font-medium max-w-lg mb-8">
                                    La fortaleza de {team.name}. Un recinto histórico donde se forjaron las leyendas del club y se vivieron las noches más épicas.
                                </p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Ubicación</span>
                                        <span className="font-black text-white">{team.city || 'TBD'}</span>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Capacidad</span>
                                        <span className="font-black text-white">45,000+</span>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md col-span-2 md:col-span-1">
                                        <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Superficie</span>
                                        <span className="font-black text-white">Césped Natural</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                */}

                {activeTab === 'SQUAD' && (
                    <div className="space-y-12">
                        {/* Entrenador */}
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity className="text-blue-500" /> Director Técnico
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {squad.coaches.map(c => (
                                    <div key={c.id} className="bg-[#0F131A] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                                            {c.photo ? (
                                                <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl">👔</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white leading-tight">{c.name}</h4>
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider">{c.role}</span>
                                        </div>
                                    </div>
                                ))}
                                {squad.coaches.length === 0 && <p className="text-zinc-500 text-sm">No hay información del cuerpo técnico.</p>}
                            </div>
                        </div>

                        {/* Jugadores */}
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Users className="text-blue-500" /> Jugadores
                            </h3>
                            {squad.players.length === 0 ? (
                                <p className="text-zinc-500 py-8 text-center bg-white/5 rounded-3xl border border-white/5">No hay jugadores registrados en el plantel.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {squad.players.map(p => (
                                        <div key={p.id} className="bg-[#0F131A] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all rounded-2xl p-4 flex items-center gap-4 group">
                                            <div className="relative shrink-0">
                                                <div className="w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-blue-500/50 transition-colors">
                                                    {p.photo ? (
                                                        <img src={p.photo} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                                                            <Users size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#0F131A] border border-white/10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg">
                                                    {p.number || '-'}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 ml-2">
                                                <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{p.position}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'TROPHIES' && (
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Trophy className="text-blue-500" /> Palmarés
                        </h3>
                        {trophies.length === 0 ? (
                            <p className="text-zinc-500 text-center py-12 bg-white/5 rounded-3xl border border-white/5">No hay trofeos registrados en la vitrina.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {trophies.map(t => (
                                    <div key={t.id} className="bg-gradient-to-br from-[#0F131A] to-black border border-amber-500/20 hover:border-amber-500/40 transition-all rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group cursor-default shadow-lg shadow-amber-500/5 hover:-translate-y-2">
                                        <div className="w-20 h-20 bg-gradient-to-b from-amber-400/20 to-transparent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                                            <Trophy size={32} className="text-amber-400 drop-shadow-lg" />
                                        </div>
                                        <h4 className="font-black text-sm text-white uppercase tracking-wider mb-2 leading-tight">{t.name}</h4>
                                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">{t.season}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
