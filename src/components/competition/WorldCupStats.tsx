import React, { useMemo, useState } from 'react';
import { Trophy, Activity, Goal, Calendar, Globe, Map } from 'lucide-react';
import { API_MATCHES, API_GROUPS } from '../../data/realData';
import { WORLD_QUALIFIERS } from '../../data/worldCup2026';
import { cn } from '../../lib/utils';
import type { Match } from '../../types';

export const WorldCupStats: React.FC = () => {
    // 1. Calcular estadísticas generales
    const { totalMatches, totalGoals, goalAverage } = useMemo(() => {
        const matchesWithScore = API_MATCHES.filter(m => m.status === 'FINISHED' && m.score);
        const totalMatches = matchesWithScore.length;
        const totalGoals = matchesWithScore.reduce((sum, m) => sum + (m.score?.home || 0) + (m.score?.away || 0), 0);
        const goalAverage = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0.00';

        return { totalMatches, totalGoals, goalAverage };
    }, []);

    // 2. Extraer equipos goleadores de API_GROUPS
    const topScoringTeams = useMemo(() => {
        let allTeams: any[] = [];
        API_GROUPS.forEach(group => {
            if (group.teams) {
                allTeams = [...allTeams, ...group.teams];
            }
        });

        // Ordenar por goles a favor
        allTeams.sort((a, b) => b.goalsFor - a.goalsFor);

        // Tomar el top 10
        return allTeams.slice(0, 5);
    }, []);

    // 3. Obtener los últimos partidos o los partidos más relevantes
    const recentMatches = useMemo(() => {
        return API_MATCHES.filter(m => m.status === 'FINISHED');
    }, []);

    // Qualifiers state
    const [activeRegionIdx, setActiveRegionIdx] = useState(0);
    const [activeGroupIdx, setActiveGroupIdx] = useState(0);

    const activeRegionData = WORLD_QUALIFIERS[activeRegionIdx];
    const currentGroup = activeRegionData?.groups[activeGroupIdx];

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveRegionIdx(Number(e.target.value));
        setActiveGroupIdx(0);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Encabezado */}
            <div className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-[9px] md:text-[10px] font-black text-amber-500 border border-amber-500/20 uppercase tracking-widest mb-2">
                    <Trophy size={12} />
                    Datos Reales (API)
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                    Centro de <span className="text-amber-500">Estadísticas</span>
                </h2>
                <p className="text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-widest opacity-60">
                    Métricas del Torneo y Rendimiento Histórico
                </p>
            </div>

            {/* General Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<Calendar className="text-blue-500" />} label="Partidos Jugados" value={totalMatches.toString()} />
                <StatCard icon={<Goal className="text-green-500" />} label="Goles Totales" value={totalGoals.toString()} />
                <StatCard icon={<Activity className="text-amber-500" />} label="Promedio Goles / Partido" value={goalAverage} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Top Teams List */}
                <div className="lg:col-span-1 bg-black/40 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Goal className="text-amber-500" size={20} />
                        Equipos Más Goleadores
                    </h3>
                    <div className="space-y-4">
                        {topScoringTeams.map((team, idx) => (
                            <div key={team.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-500 font-bold font-mono">#{idx + 1}</span>
                                    <img src={team.flag} alt={team.name} className="w-8 h-8 object-contain" />
                                    <span className="font-bold text-white">{team.name}</span>
                                </div>
                                <div className="text-amber-500 font-black text-lg">
                                    {team.goalsFor} <span className="text-xs text-zinc-500">G</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Match List Feed */}
                <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} />
                        Últimos Resultados Registrados
                    </h3>
                    
                    <div className="space-y-3 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {recentMatches.map(match => (
                            <MatchFeedItem key={match.id} match={match} />
                        ))}
                        {recentMatches.length === 0 && (
                            <p className="text-zinc-500 italic text-sm">No hay partidos registrados aún.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Eliminatorias Globales 2026 */}
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Globe className="text-blue-500" size={24} />
                        Eliminatorias Mundiales 2026
                    </h3>
                    
                    {/* Selectors */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Globe size={14} className="text-zinc-500" />
                            </div>
                            <select 
                                value={activeRegionIdx}
                                onChange={handleRegionChange}
                                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                            >
                                {WORLD_QUALIFIERS.map((region, idx) => (
                                    <option key={region.region} value={idx}>{region.region}</option>
                                ))}
                            </select>
                        </div>
                        
                        {activeRegionData.groups.length > 1 && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Map size={14} className="text-zinc-500" />
                                </div>
                                <select 
                                    value={activeGroupIdx}
                                    onChange={(e) => setActiveGroupIdx(Number(e.target.value))}
                                    className="w-full sm:w-auto pl-9 pr-8 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                                >
                                    {activeRegionData.groups.map((g, idx) => (
                                        <option key={g.name} value={idx}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {currentGroup ? (
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-zinc-500 uppercase bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">Pos</th>
                                    <th className="px-4 py-3 text-center">Equipo</th>
                                    <th className="px-3 py-3 text-center">PJ</th>
                                    <th className="px-3 py-3 text-center hidden md:table-cell">G</th>
                                    <th className="px-3 py-3 text-center hidden md:table-cell">E</th>
                                    <th className="px-3 py-3 text-center hidden md:table-cell">P</th>
                                    <th className="px-3 py-3 text-center hidden sm:table-cell">GF:GC</th>
                                    <th className="px-4 py-3 text-center font-black rounded-r-xl">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {currentGroup.teams.map((team, idx) => {
                                    // A simple heuristic for styling: top teams green, mid teams amber, bottom zinc.
                                    // This applies generally, though exact qualification spots vary by continent.
                                    const isTop = idx < (currentGroup.teams.length / 2.5);
                                    const isMid = idx >= (currentGroup.teams.length / 2.5) && idx < (currentGroup.teams.length / 1.5);
                                    
                                    return (
                                        <tr key={team.name} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                                                        isTop ? "bg-green-500/20 text-green-500" : isMid ? "bg-amber-500/20 text-amber-500" : "bg-zinc-800 text-zinc-500"
                                                    )}>
                                                        {team.rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-white flex items-center gap-3">
                                                {/* Fallback to generic flag if no API logo exists */}
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] overflow-hidden">
                                                    {team.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                {team.name}
                                            </td>
                                            <td className="px-3 py-3 text-center text-zinc-400">{team.pj}</td>
                                            <td className="px-3 py-3 text-center text-zinc-400 hidden md:table-cell">{team.won}</td>
                                            <td className="px-3 py-3 text-center text-zinc-400 hidden md:table-cell">{team.drawn}</td>
                                            <td className="px-3 py-3 text-center text-zinc-400 hidden md:table-cell">{team.lost}</td>
                                            <td className="px-3 py-3 text-center text-zinc-400 font-mono hidden sm:table-cell">{team.goalsFor}:{team.goalsAgainst}</td>
                                            <td className="px-4 py-3 text-center font-black text-amber-500 text-base">{team.points}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-8 text-center text-zinc-500 italic">No hay datos de grupos disponibles para esta región.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="bg-[#0F131A]/80 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-2">
        <div className="p-3 rounded-2xl bg-white/5 mb-2">
            {icon}
        </div>
        <div className="text-3xl font-black text-white">{value}</div>
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</div>
    </div>
);

const MatchFeedItem = ({ match }: { match: Match }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0F131A] border border-white/5">
        {/* Fecha simplificada o estado */}
        <div className="hidden sm:flex flex-col items-center justify-center w-20 px-2 border-r border-white/10">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider text-center">
                {new Date(match.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
            <span className={cn(
                "text-xs font-black",
                match.status === 'FINISHED' ? "text-zinc-400" : "text-green-500 animate-pulse"
            )}>
                {match.status === 'FINISHED' ? 'FT' : 'LIVE'}
            </span>
        </div>

        {/* Equipos y Marcador */}
        <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8 px-4">
            {/* Local */}
            <div className="flex-1 flex items-center justify-end gap-3 min-w-[100px]">
                <span className={cn("font-bold text-sm sm:text-base hidden sm:inline-block", 
                    (match.score?.home ?? 0) > (match.score?.away ?? 0) ? "text-white" : "text-zinc-400"
                )}>
                    {match.homeTeam.name}
                </span>
                <span className="font-bold text-xs sm:hidden text-zinc-400">{match.homeTeam.shortName}</span>
                <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-lg" />
            </div>

            {/* Resultado */}
            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-black/50 border border-white/10 min-w-[80px]">
                 {match.score ? (
                    <div className="flex items-center gap-2 text-xl sm:text-2xl font-black font-mono tracking-wider text-white">
                        <span>{match.score.home}</span>
                        <span className="text-zinc-600">-</span>
                        <span>{match.score.away}</span>
                    </div>
                ) : (
                    <div className="text-zinc-600 text-sm font-bold uppercase">vs</div>
                )}
            </div>

            {/* Visitante */}
            <div className="flex-1 flex items-center justify-start gap-3 min-w-[100px]">
                <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-lg" />
                <span className={cn("font-bold text-sm sm:text-base hidden sm:inline-block", 
                    (match.score?.away ?? 0) > (match.score?.home ?? 0) ? "text-white" : "text-zinc-400"
                )}>
                    {match.awayTeam.name}
                </span>
                <span className="font-bold text-xs sm:hidden text-zinc-400">{match.awayTeam.shortName}</span>
            </div>
        </div>
    </div>
);
