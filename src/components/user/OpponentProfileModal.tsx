import React from 'react';
import { Bot, Trophy, X, Zap, Target, Flame, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OpponentProfileModalProps {
    opponent: Record<string, any> | null;
    isOpen: boolean;
    onClose: () => void;
    onSelect: () => void;
}

export const OpponentProfileModal: React.FC<OpponentProfileModalProps> = ({
    opponent,
    isOpen,
    onClose,
    onSelect
}) => {
    if (!isOpen || !opponent) return null;

    const isAI = opponent.isAI;
    const winRate = isAI ? 68 : 45 + Math.floor(Math.random() * 30); // Mock win rate
    const winStreak = isAI ? 5 : Math.floor(Math.random() * 4); // Mock streak
    const totalPredictions = isAI ? 1240 : 45 + Math.floor(Math.random() * 100);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm bg-[#0F131A] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Header Background */}
                    <div className={cn(
                        "h-32 w-full relative overflow-hidden",
                        isAI ? "bg-gradient-to-br from-cyan-900 via-blue-900 to-[#0F131A]" : "bg-gradient-to-br from-purple-900 via-pink-900 to-[#0F131A]"
                    )}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Avatar Profile */}
                    <div className="flex flex-col items-center -mt-16 px-6 relative z-10">
                        <div className="relative mb-3 group">
                            <div className={cn(
                                "w-28 h-28 rounded-full border-4 overflow-hidden shadow-2xl",
                                isAI ? "border-cyan-500 bg-cyan-950" : "border-purple-500 bg-[#1A1F2E]"
                            )}>
                                {isAI ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-cyan-500">
                                        <Bot size={48} />
                                    </div>
                                ) : (
                                    <img
                                        src={opponent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent.name}`}
                                        alt={opponent.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* Level Badge */}
                            <div className={cn(
                                "absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-lg flex items-center gap-1",
                                isAI ? "bg-cyan-950 border-cyan-500 text-cyan-400" : "bg-purple-950 border-purple-500 text-purple-400"
                            )}>
                                <Trophy size={10} />
                                LVL {opponent.level}
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 mt-2 flex items-center gap-2">
                            {opponent.name}
                            {isAI && <span className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm">BOT</span>}
                        </h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                            <Zap size={12} className="text-yellow-500" />
                            {opponent.points.toLocaleString()} PTS Totales
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-px bg-white/5 mt-6 border-y border-white/5">
                        <div className="bg-[#0F131A] p-4 text-center">
                            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                                <Target size={12} /> Acierto
                            </div>
                            <div className="text-xl font-black text-white">{winRate}%</div>
                        </div>
                        <div className="bg-[#0F131A] p-4 text-center">
                            <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                                <TrendingUp size={12} /> Jugadas
                            </div>
                            <div className="text-xl font-black text-white">{totalPredictions}</div>
                        </div>
                    </div>

                    {/* Recent Form */}
                    <div className="px-6 py-5">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Racha Actual</span>
                            <div className="flex gap-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border",
                                            scaleStreakColor(winStreak, i)
                                        )}
                                    >
                                        {i < winStreak ? 'V' : 'D'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="p-4 bg-white/5">
                        <button
                            onClick={() => {
                                onSelect();
                                onClose();
                            }}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2",
                                isAI
                                    ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/50"
                                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/50"
                            )}
                        >
                            <Flame size={18} />
                            Desafiar Rival
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Helper for streak colors
function scaleStreakColor(streak: number, index: number) {
    if (index < streak) {
        return "bg-green-500/20 text-green-500 border-green-500/50";
    }
    return "bg-red-500/10 text-red-500 border-red-500/20";
}
