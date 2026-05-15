import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Activity, Target, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Player, PlayerStats } from '../../types';

interface PlayerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: Player | null;
    stats?: PlayerStats;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ isOpen, onClose, player, stats }) => {
    if (!player) return null;

    // Estadísticas por defecto si no vienen de la API (Mocks industriales)
    const displayStats = stats || {
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        rating: 6.8
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#131722] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        {/* Header with Player Photo */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-600/30 to-purple-600/30">
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors z-30"
                            >
                                <X size={20} className="text-white" />
                            </button>

                            <div className="absolute inset-0 flex items-end p-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-3xl border-4 border-[#131722] overflow-hidden bg-zinc-800 shadow-2xl relative z-20">
                                        <img 
                                            src={player.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
                                            alt={player.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white leading-tight">{player.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">ESTRELLA</div>
                                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">N 10 • FWD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Body */}
                        <div className="p-8 space-y-8">
                            {/* Rating Large */}
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Zap size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Rating de Partido</p>
                                        <p className="text-xs font-bold text-zinc-400">Basado en datos de API-Football</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-emerald-400">{displayStats.rating.toFixed(1)}</div>
                            </div>

                            {/* Core Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                                        <Target size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Goles</span>
                                    </div>
                                    <div className="text-xl font-black text-white">{displayStats.goals}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                                        <Activity size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Asistencias</span>
                                    </div>
                                    <div className="text-xl font-black text-white">{displayStats.assists}</div>
                                </div>
                            </div>

                            {/* Cards / Discipline */}
                            <div className="flex gap-4">
                                <div className="flex-1 flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Amarillas</span>
                                    <div className="w-3 h-5 bg-yellow-400 rounded-sm" />
                                    <span className="text-sm font-bold text-white ml-2">{displayStats.yellowCards}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-white/5">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Rojas</span>
                                    <div className="w-3 h-5 bg-red-500 rounded-sm" />
                                    <span className="text-sm font-bold text-white ml-2">{displayStats.redCards}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / CTA */}
                        <div className="p-6 bg-black/20 text-center border-t border-white/5">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <Trophy size={12} className="text-amber-500" /> Jugador del Mundial 2026
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
