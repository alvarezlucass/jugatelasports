import React, { useState } from 'react';
import { X, Trophy, Star, History, Info, ChevronRight, Landmark, Users, Globe } from 'lucide-react';
import { type TeamHistory } from '../../data/worldCupPersistence';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface TeamDetailsModalProps {
    team: TeamHistory | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, isOpen, onClose }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'resumen' | 'cultura'>('resumen');

    if (!team || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-[#0F131A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all z-10"
                >
                    <X size={20} />
                </button>

                {/* Header/Banner */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-900 p-8 flex flex-col justify-end">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-sm">
                            {team.id === 'TEMP' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                            {team.id === 'TEMP' ? 'Información Pendiente' : 'Selección Nacional'}
                        </div>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                            {team.name}
                        </h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 px-8">
                    <button
                        onClick={() => setActiveTab('resumen')}
                        className={cn(
                            "pb-4 pt-6 px-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative flex-1 md:flex-none text-center",
                            activeTab === 'resumen' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Resumen
                        {activeTab === 'resumen' && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('cultura')}
                        className={cn(
                            "pb-4 pt-6 px-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all relative flex-1 md:flex-none text-center",
                            activeTab === 'cultura' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Historia & Cultura
                        {activeTab === 'cultura' && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {activeTab === 'resumen' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <Trophy className="w-5 h-5 text-amber-500 mb-2" />
                                    <div className="text-xl font-black text-white">{team.titles}</div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Títulos</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-left">
                                    <Star className="w-5 h-5 text-blue-500 mb-2" />
                                    <div className="text-xl font-black text-white truncate">{team.appearances}</div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mundiales</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-2">
                                    <History className="w-5 h-5 text-emerald-500 mb-2" />
                                    <div className="text-sm font-bold text-white truncate">{team.bestResult}</div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mejor Resultado</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                                    <Info size={14} /> Información del Equipo
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed font-medium bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                                    {team.description}
                                </p>
                            </div>

                            {/* Recent Form */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Últimos Resultados</div>
                                <div className="flex gap-3">
                                    {team.lastResults.map((result, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg",
                                                result === 'W' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20" :
                                                    result === 'L' ? "bg-red-500/20 text-red-500 border border-red-500/20" :
                                                        "bg-zinc-500/20 text-zinc-400 border border-zinc-500/20"
                                            )}
                                        >
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4">
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate(`/worldcup/team/${encodeURIComponent(team.name)}/squad`);
                                    }}
                                    className="w-full py-4 bg-white text-black font-black rounded-full text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                                >
                                    Ver Plantilla Completa <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cultura' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                            {/* Cultural Data Grid */}
                            {team.culture && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                            <Landmark size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Capital</div>
                                            <div className="text-white font-bold">{team.culture.capital}</div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Población</div>
                                            <div className="text-white font-bold">{team.culture.population}</div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-start gap-4 col-span-1 md:col-span-2">
                                        <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Curiosidad Geográfica</div>
                                            <div className="text-sm text-zinc-300 font-medium leading-relaxed">{team.culture.curiosity}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Detailed History */}
                            {(team.detailedHistory || team.description) && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                                        <History size={14} /> Legado Histórico
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed font-medium bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                                        {team.detailedHistory || team.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
