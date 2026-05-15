import React from 'react';
import { Users, Plus, KeyRound, Trophy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

export const GroupDashboard: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const groups = user?.groups || [];

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-500 bg-[#0A0D12]">
            {/* Header */}
            <div className="container mx-auto px-4 pt-8 pb-12">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-[0.2em]">
                        <Users size={14} className="fill-blue-400" />
                        Ligas Privadas
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                        Mis <span className="text-blue-600">Grupos</span>
                    </h1>
                    <p className="text-zinc-500 text-lg font-bold max-w-2xl mx-auto">
                        Compite contra tus amigos, crea tus propias reglas y demuestra quién manda en tu círculo.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl space-y-12">
                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/groups/create')}
                        className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-900/40 to-[#0F131A] border border-blue-500/20 hover:border-blue-500/50 transition-all group flex flex-col items-center justify-center text-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
                            <Plus size={32} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Crear Grupo</h3>
                            <p className="text-sm text-zinc-500 font-bold">Sé el administrador de tu propia liga</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/groups/join')}
                        className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-900/20 to-[#0F131A] border border-purple-500/20 hover:border-purple-500/50 transition-all group flex flex-col items-center justify-center text-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
                            <KeyRound size={28} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Unirse con PIN</h3>
                            <p className="text-sm text-zinc-500 font-bold">Ingresa a una liga ya existente</p>
                        </div>
                    </button>
                </div>

                {/* Groups List */}
                <div>
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                        Tus Ligas Activas
                        <span className="h-px bg-white/5 flex-1" />
                    </h2>

                    {groups.length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02]">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-zinc-500">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Aún no tienes grupos</h3>
                            <p className="text-zinc-500 font-bold max-w-md mx-auto">
                                Crea un grupo o únete a uno para empezar a competir con tus amigos de forma privada.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groups.map((group) => (
                                <button
                                    key={group.id}
                                    onClick={() => navigate(`/groups/${group.id}`)}
                                    className="p-6 rounded-[2rem] bg-[#0F131A] border border-white/5 hover:border-white/20 transition-all group flex items-center gap-6"
                                >
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0",
                                        `bg-${group.color}-600`, // Assuming defined colors in tailwind
                                        group.color === 'blue' && "bg-blue-600 shadow-blue-900/50",
                                        group.color === 'green' && "bg-green-600 shadow-green-900/50",
                                        group.color === 'purple' && "bg-purple-600 shadow-purple-900/50"
                                    )}>
                                        <Trophy size={28} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                            {group.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Users size={12} /> {group.memberIds.length} Miembros</span>
                                            {group.adminId === user?.id && <span className="text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full">Admin</span>}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-white/10 group-hover:text-white transition-all shrink-0">
                                        <ChevronRight size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
