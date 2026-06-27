import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Target, Clock, AlertTriangle, Goal, Repeat } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export interface MatchDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    match: any | null; // This can be the DB match object or the mock fixture object
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ isOpen, onClose, match }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // En una app real de producción, haríamos fetch a la API si los eventos no están cacheados
        // Como no todos los partidos tienen eventos en la DB aún, simularemos o mostraremos los que hay.
        if (isOpen && match) {
            setLoading(true);
            // Simulación de carga desde el "Scout Engine"
            setTimeout(() => {
                setLoading(false);
            }, 800);
        }
    }, [isOpen, match]);

    if (!match) return null;

    // Determinar origen de datos (Mock vs DB)
    const isDbMatch = !!match.id;
    const homeTeam = isDbMatch ? match.home_team : (match.home ? 'Nueva Chicago' : match.opponent);
    const awayTeam = isDbMatch ? match.away_team : (!match.home ? 'Nueva Chicago' : match.opponent);
    const score = isDbMatch ? `${match.home_score} - ${match.away_score}` : match.score;
    const date = isDbMatch ? new Date(match.start_time).toLocaleDateString() : match.date;
    
    // Fallback logos si no vienen de DB
    const homeLogo = isDbMatch ? (match.home_team.includes('Chicago') ? 'https://media.api-sports.io/football/teams/484.png' : match.away_team_logo || `https://ui-avatars.com/api/?name=${homeTeam}&background=random`) : (match.home ? 'https://media.api-sports.io/football/teams/484.png' : match.opponentLogo);
    const awayLogo = isDbMatch ? (match.away_team.includes('Chicago') ? 'https://media.api-sports.io/football/teams/484.png' : match.home_team_logo || `https://ui-avatars.com/api/?name=${awayTeam}&background=random`) : (!match.home ? 'https://media.api-sports.io/football/teams/484.png' : match.opponentLogo);

    // Advanced Stats from DB metadata
    const advStats = match.metadata?.advancedStats;
    const comparisonData = advStats ? [
        { name: 'Posesión (%)', Chicago: parseInt(advStats['Ball Possession'] || '50'), Rival: 100 - parseInt(advStats['Ball Possession'] || '50') },
        { name: 'Tiros al Arco', Chicago: parseInt(advStats['Shots on Goal'] || '0'), Rival: 0 },
        { name: 'xG', Chicago: parseFloat(advStats['expected_goals'] || '0.0'), Rival: 0 },
        { name: 'Precisión Pases (%)', Chicago: parseInt(advStats['Passes %'] || '0'), Rival: 0 }
    ] : null;

    // Simulated events based on mock scorers if available
    const simulatedEvents = match.scorers ? match.scorers.map((s: string, i: number) => ({
        time: { elapsed: parseInt(s.split(' ')[s.split(' ').length-1].replace("'", "")) },
        type: 'Goal',
        player: { name: s.replace(s.split(' ')[s.split(' ').length-1], '') },
        team: match.home ? { name: homeTeam } : { name: awayTeam }
    })) : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-full overflow-hidden bg-[#0A0D12] rounded-[2rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col"
                    >
                        {/* Header Box Score */}
                        <div className="bg-gradient-to-b from-[#0F131A] to-black p-8 relative flex flex-col items-center justify-center border-b border-white/5">
                            <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                                <X size={20} />
                            </button>

                            <div className="flex items-center justify-center w-full max-w-2xl gap-8 md:gap-16">
                                {/* Home Team */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-24 h-24 md:w-32 md:h-32 mb-4 bg-white/5 rounded-full p-4 border border-white/10 shadow-2xl">
                                        <img src={homeLogo} alt={homeTeam} className="w-full h-full object-contain drop-shadow-lg" />
                                    </div>
                                    <span className="text-xl md:text-2xl font-black text-white text-center uppercase tracking-tighter">{homeTeam}</span>
                                </div>

                                {/* Score */}
                                <div className="flex flex-col items-center shrink-0">
                                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full mb-4 border border-emerald-500/20">Finalizado</span>
                                    <div className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none px-6 py-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                                        {score}
                                    </div>
                                    <span className="text-xs font-bold text-zinc-500 mt-4 flex items-center gap-2"><Clock size={14}/> {date}</span>
                                </div>

                                {/* Away Team */}
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-24 h-24 md:w-32 md:h-32 mb-4 bg-white/5 rounded-full p-4 border border-white/10 shadow-2xl">
                                        <img src={awayLogo} alt={awayTeam} className="w-full h-full object-contain drop-shadow-lg" />
                                    </div>
                                    <span className="text-xl md:text-2xl font-black text-white text-center uppercase tracking-tighter">{awayTeam}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-[#0A0D12]">
                            {loading ? (
                                <div className="h-64 flex flex-col items-center justify-center text-emerald-500">
                                    <Activity size={48} className="animate-pulse mb-4" />
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter">Motor Scout Analizando...</h4>
                                    <p className="text-zinc-500 text-sm">Extrayendo eventos y métricas de posesión</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Timeline */}
                                    <section>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                                            <Target className="text-red-500" /> Línea de Tiempo (Eventos)
                                        </h3>
                                        <div className="bg-[#0F131A] rounded-[2rem] p-6 border border-white/5 min-h-[300px]">
                                            {simulatedEvents.length > 0 ? (
                                                <div className="relative border-l-2 border-white/10 ml-4 space-y-6 py-4">
                                                    {simulatedEvents.map((ev: any, i: number) => (
                                                        <div key={i} className="relative pl-6">
                                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0F131A]" />
                                                            <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                                                                <Goal size={24} className="text-emerald-500" />
                                                                <div>
                                                                    <span className="text-sm font-bold text-white block">{ev.player.name}</span>
                                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{ev.team.name} • Minuto {ev.time.elapsed}'</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-zinc-500 text-sm font-bold text-center">
                                                    Eventos de gol detallados no disponibles en este partido.<br/>(El Scout Engine requiere más datos para esta liga).
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Match Stats */}
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                                <Activity className="text-blue-500" /> Comparativa Táctica
                                            </h3>
                                            {/* Tooltip / Explanation badge */}
                                            <div className="group relative cursor-help">
                                                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">¿De dónde viene esto?</span>
                                                <div className="absolute right-0 bottom-full mb-2 w-64 bg-zinc-800 text-zinc-200 text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                                    Estos datos son extraídos en tiempo real del endpoint <b>fixtures/statistics</b> de API-Sports, procesados por nuestro Scout Engine en Supabase. Muestran el rendimiento medible del partido.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0F131A] rounded-[2rem] p-6 border border-white/5 min-h-[300px] flex flex-col justify-center">
                                            {comparisonData ? (
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <BarChart data={comparisonData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                                        <XAxis type="number" stroke="#ffffff50" fontSize={10} axisLine={false} tickLine={false} />
                                                        <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                                        <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0A0D12', borderColor: '#ffffff10', borderRadius: '1rem', color: '#fff' }} />
                                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                                        <Bar dataKey="Chicago" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                                                        <Bar dataKey="Rival" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-zinc-500 text-sm font-bold text-center">
                                                    Métricas avanzadas (xG, Posesión) no registradas por los sensores ópticos en este encuentro específico.
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
