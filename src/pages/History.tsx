import React, { useState } from 'react';
import { HistoryTimeline } from '../components/competition/HistoryTimeline';
import { ChevronLeft, Trophy, Calendar, Target, Swords, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamFlagUrl } from '../data/worldCupPersistence';

export const History: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'glory' | 'my-predictions'>('glory');
    const { userPredictions } = useUser();

    return (
        <div className="min-h-screen bg-[#07090E] text-white pt-24 pb-20">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <Link to="/worldcup" className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors group">
                        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> 
                        <span className="text-xs font-black uppercase tracking-widest">Volver al Mundial</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4">
                                {activeTab === 'glory' ? (
                                    <>Historia de la <span className="text-amber-500 text-glow">Gloria</span></>
                                ) : (
                                    <>Mi <span className="text-blue-500 text-glow">Camino</span></>
                                )}
                            </h1>
                            <p className="text-zinc-400 font-bold max-w-2xl text-sm md:text-base uppercase tracking-wide opacity-60">
                                {activeTab === 'glory' 
                                    ? "Un recorrido por todos los campeones y momentos que forjaron la leyenda."
                                    : "Tu registro histórico de predicciones, aciertos y desafíos en el torneo."}
                            </p>
                        </div>

                        {/* Premium Tab Switcher */}
                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                            <button
                                onClick={() => setActiveTab('glory')}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    activeTab === 'glory' 
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                                        : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <Trophy size={14} /> La Historia
                            </button>
                            <button
                                onClick={() => setActiveTab('my-predictions')}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    activeTab === 'my-predictions' 
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                                        : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <Target size={14} /> Mis Predicciones
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'glory' ? (
                        <motion.div
                            key="glory-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <HistoryTimeline />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="my-predictions-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            {userPredictions.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Swords size={40} className="text-zinc-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Nada por aquí aún</h3>
                                        <p className="text-zinc-500 font-bold text-sm max-w-sm mx-auto mt-2 leading-relaxed">
                                            Todavía no has realizado ninguna predicción. ¡Empieza a jugar en el bracket o desafía a un amigo!
                                        </p>
                                    </div>
                                    <Link 
                                        to="/worldcup" 
                                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                                    >
                                        Ir al Mundial
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userPredictions.map((pred, idx) => (
                                        <div 
                                            key={pred.matchId + idx}
                                            className="group relative bg-[#13171F] border border-white/10 rounded-[2rem] p-6 hover:border-blue-500/50 transition-all overflow-hidden"
                                        >
                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className={cn(
                                                    "flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full",
                                                    pred.status === 'WON' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                                    pred.status === 'LOST' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                                                    'bg-white/5 text-zinc-500 border border-white/5'
                                                )}>
                                                    <Clock size={10} /> {pred.status === 'WON' ? 'Acierto' : pred.status === 'LOST' ? 'Fallido' : 'Pendiente'}
                                                </span>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    {(() => {
                                                        const homeName = pred.matchDetails?.homeTeam || pred.matchId.split('-')[0];
                                                        const awayName = pred.matchDetails?.awayTeam || pred.matchId.split('-')[1] || 'Visitante';
                                                        const homeFlag = getTeamFlagUrl(homeName);
                                                        const awayFlag = getTeamFlagUrl(awayName);

                                                        return (
                                                            <>
                                                                <div className="flex-1 flex flex-col items-center gap-2 overflow-hidden">
                                                                    <div className="w-12 h-8 rounded bg-white/5 overflow-hidden border border-white/10 shrink-0">
                                                                        <img src={homeFlag} className="w-full h-full object-cover" alt="" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-white truncate w-full text-center">
                                                                        {homeName}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="flex flex-col items-center shrink-0">
                                                                    <div className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-2">
                                                                        <span>{pred.exactScore?.home ?? '?'}</span>
                                                                        <span className="text-zinc-700">-</span>
                                                                        <span>{pred.exactScore?.away ?? '?'}</span>
                                                                    </div>
                                                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Tu Score</span>
                                                                </div>

                                                                <div className="flex-1 flex flex-col items-center gap-2 overflow-hidden">
                                                                    <div className="w-12 h-8 rounded bg-white/5 overflow-hidden border border-white/10 shrink-0">
                                                                        <img src={awayFlag} className="w-full h-full object-cover" alt="" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-white truncate w-full text-center">
                                                                        {awayName}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5 uppercase">
                                                        <TrendingUp size={12} className="text-blue-500" />
                                                        Puntos en Juego
                                                    </div>
                                                    <span className="text-white font-black">{pred.stake} Pts</span>
                                                </div>
                                            </div>

                                            {/* Hover Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
