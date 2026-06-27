import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Target, Shield, Clock, Repeat, Share2, Check } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

export interface PlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: any | null;
}

export const PlayerProfileModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, player }) => {
    const [copied, setCopied] = React.useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(`¡Mira las estadísticas Premium de ${player?.name} en nuestro Scouting Hub!`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!player) return null;

    // Parse Data from Supabase DB structure
    const stats = player.metadata?.deepStats || null;
    const transfers = player.metadata?.transfers || null;

    const minutes = stats?.games?.minutes || 0;
    const lineups = stats?.games?.lineups || 0;
    const goals = stats?.goals?.total || 0;
    const assists = stats?.goals?.assists || 0;
    const rating = stats?.games?.rating ? parseFloat(stats.games.rating).toFixed(1) : player.rating || 'N/A';

    // Generate a mock radar if we don't have enough data from the API yet, just to show the UI capability
    const radarData = [
        { subject: 'Ataque', A: goals > 0 ? 80 : 50, fullMark: 100 },
        { subject: 'Defensa', A: 60, fullMark: 100 },
        { subject: 'Pases', A: assists > 0 ? 75 : 55, fullMark: 100 },
        { subject: 'Físico', A: minutes > 1000 ? 85 : 60, fullMark: 100 },
        { subject: 'Táctica', A: lineups > 10 ? 80 : 50, fullMark: 100 },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl max-h-full overflow-hidden bg-[#0A0D12] rounded-[2rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col md:flex-row"
                    >
                        {/* Left Column (Hero) */}
                        <div className="md:w-1/3 bg-gradient-to-b from-[#0F131A] to-black p-8 md:p-12 relative flex flex-col items-center justify-center border-r border-white/5">
                            <button onClick={onClose} className="absolute top-4 right-4 md:hidden w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                <X size={16} />
                            </button>

                            <div className="relative w-40 h-40 md:w-56 md:h-56 mb-8">
                                <div className="absolute inset-0 bg-white/5 rounded-full border-2 border-white/10" />
                                <img src={player.photo} alt={player.name} className="absolute inset-0 w-full h-full object-cover rounded-full z-20 shadow-2xl" />
                                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#0A0D12] rounded-full flex items-center justify-center border-4 border-emerald-500 z-30 shadow-xl">
                                    <span className="text-2xl font-black text-white">{player.number}</span>
                                </div>
                            </div>

                            <div className="text-center relative z-10 w-full">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{player.name}</h2>
                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    <span className="text-xs font-black text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/5">{player.position}</span>
                                    <span className="text-xs font-black text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/5">{player.age} años</span>
                                </div>
                                
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center mb-6">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Scout Rating</span>
                                    <span className="text-4xl font-black text-emerald-400">{rating}</span>
                                </div>

                                <button onClick={handleShare} className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-600 hover:bg-emerald-500 text-white">
                                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                                    {copied ? '¡Enlace Copiado!' : 'Compartir Ficha Scout'}
                                </button>
                            </div>
                        </div>

                        {/* Right Column (Data) */}
                        <div className="md:w-2/3 p-6 md:p-10 overflow-y-auto custom-scrollbar relative bg-[#0A0D12]">
                            <button onClick={onClose} className="absolute top-6 right-6 hidden md:flex w-10 h-10 items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                                <X size={20} />
                            </button>

                            {!stats && !transfers ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                                    <Activity size={48} className="mb-4 opacity-20 text-emerald-500" />
                                    <h4 className="text-xl font-black text-white mb-2 tracking-tighter">Motor Scout Trabajando...</h4>
                                    <p className="text-center font-bold text-sm">Este jugador está en la cola de análisis profundo.<br/>Pronto verás sus métricas de pases, mapas de calor y rendimiento táctico detallado.</p>
                                    
                                    <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
                                        <div className="bg-[#0F131A] rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                                            <span className="text-2xl font-black text-white mb-1">{player.metadata?.deepStats?.games?.appearences || player.matches || '?'}</span>
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Partidos Jugados</span>
                                        </div>
                                        <div className="bg-[#0F131A] rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                                            <span className="text-2xl font-black text-white mb-1">{player.age || '?'}</span>
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Edad</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {/* Stats Grid */}
                                    <section>
                                        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Activity className="text-blue-500" /> Rendimiento Estacional DB
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Minutos', value: minutes, icon: Clock },
                                                { label: 'Titular', value: lineups, icon: Shield },
                                                { label: 'Goles', value: goals, icon: Target },
                                                { label: 'Asistencias', value: assists, icon: Repeat }
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-[#0F131A] rounded-2xl p-4 border border-white/5 flex flex-col items-center text-center">
                                                    <stat.icon size={16} className="text-zinc-500 mb-2" />
                                                    <span className="text-2xl font-black text-white mb-1">{stat.value}</span>
                                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <section>
                                            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Target className="text-purple-500" /> Atributos Radar
                                            </h3>
                                            <div className="bg-[#0F131A] rounded-[2rem] p-6 border border-white/5 h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                        <PolarGrid stroke="#ffffff20" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 10, fontWeight: 'bold' }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar name="Player" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </section>

                                        {transfers && transfers.length > 0 && (
                                            <section>
                                                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Repeat className="text-emerald-500" /> Mercado de Pases
                                                </h3>
                                                <div className="relative border-l-2 border-white/10 ml-4 space-y-6">
                                                    {transfers.slice(0, 4).map((t: any, i: number) => (
                                                        <div key={i} className="relative pl-6">
                                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0A0D12]" />
                                                            <div className="bg-[#0F131A] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white/5 rounded-full p-2 shrink-0">
                                                                    <img src={t.teams.in.logo} alt={t.teams.in.name} className="w-full h-full object-contain" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                                                                            {t.type}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-zinc-500">
                                                                            {t.date}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-white block">A {t.teams.in.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
