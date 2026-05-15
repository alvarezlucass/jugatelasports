import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Shield, Lock, History, Swords, UserPlus, UserMinus, Sparkles } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { MOCK_USER } from '../data/mockData';
import { cn } from '../lib/utils';
import type { User } from '../types';

// Extend our mocked users for the ranking logic context
const MOCK_RANKING_USERS: User[] = [
    { ...MOCK_USER, id: 'u2', name: 'Diego', tokens: 520, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego' },
    { ...MOCK_USER, id: 'u3', name: 'Valentina', tokens: 495, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valentina' },
    MOCK_USER,
    { ...MOCK_USER, id: 'u4', name: 'Lucas', tokens: 380, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' },
    { ...MOCK_USER, id: 'u5', name: 'Sofía', tokens: 350, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia' },
].sort((a, b) => b.tokens - a.tokens);

export const PublicProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user: currentUser, isFollowing, toggleFollow, opponents } = useUser();

    // Priorizar datos de oponentes industriales o usuarios reales
    const profile = useMemo(() => {
        const op = opponents.find(o => o.id === userId);
        if (op) return {
            id: op.id,
            name: op.name,
            avatar: op.avatar,
            level: op.level || 1,
            points: op.points || 0,
            streak: op.streak || 0,
            isAI: op.isAI
        };
        // Fallback a mocks (solo para desarrollo)
        return MOCK_RANKING_USERS.find(u => u.id === userId);
    }, [userId, opponents]);

    const following = userId ? isFollowing(userId) : false;

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-700">
                <Trophy size={48} className="text-zinc-700 mb-4" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Jugador No Encontrado</h2>
                <button onClick={() => navigate(-1)} className="mt-6 text-blue-500 font-bold hover:underline py-2 px-4 rounded-full bg-blue-500/10">Volver</button>
            </div>
        );
    }

    const rank = MOCK_RANKING_USERS.findIndex(u => u.id === profile.id) + 1;
    const mockedMatchesPlayed = Math.floor(profile.tokens / 15);
    const mockedWinRate = 45 + Math.floor(Math.random() * 30); // 45% - 75%
    const mockedHits = Math.floor((mockedWinRate / 100) * mockedMatchesPlayed);

    return (
        <div className="max-w-4xl mx-auto pb-24 space-y-10 animate-in fade-in duration-700 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest mt-6"
            >
                <ArrowLeft size={18} /> Volver al Ranking
            </button>

            {/* Profile Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1F26] to-[#0F131A] p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl mt-4">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

                <div className="absolute top-4 right-6 flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                    <Lock size={12} className="text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Perfil Público Restringido</span>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10 pt-4">
                    <div className="relative group mx-auto md:mx-0">
                        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-br from-emerald-500 to-indigo-600 relative z-10 shadow-2xl">
                            <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="w-full h-full rounded-full border-4 border-[#0F131A] object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 md:mt-0">
                            <div className="space-y-1">
                                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic break-all">
                                    {profile.name}
                                </h2>
                                <p className="text-zinc-500 font-bold text-sm tracking-widest flex justify-center md:justify-start items-center gap-2">
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {profile.id !== currentUser?.id && (
                                    <button
                                        onClick={() => userId && toggleFollow(userId)}
                                        className={cn(
                                            "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all border",
                                            following 
                                                ? "bg-white/5 border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500" 
                                                : "bg-[#2EE59D] border-[#2EE59D] text-black shadow-[0_8px_15px_rgba(46,229,157,0.2)] hover:-translate-y-1"
                                        )}
                                    >
                                        {following ? <UserMinus size={18} /> : <UserPlus size={18} />}
                                        {following ? 'Siguiendo' : 'Seguir'}
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate('/predictions?challenge=' + profile.id)}
                                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all"
                                >
                                    <Swords size={18} />
                                    Desafiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] pt-4 px-2">Rendimiento en Torneo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121820] p-4 md:p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                    <div className="text-2xl md:text-3xl font-black text-amber-500">#{rank}</div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Rank Global</div>
                </div>
                <div className="bg-[#121820] p-4 md:p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center gap-2 border-b-2 border-b-white/5">
                    <div className="text-2xl md:text-3xl font-black text-emerald-500">{mockedWinRate}%</div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Precisión</div>
                </div>
                <div className="bg-[#121820] p-4 md:p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                    <div className="text-2xl md:text-3xl font-black text-white">{mockedMatchesPlayed}</div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Jugadas</div>
                </div>
                <div className="bg-[#121820] p-4 md:p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center gap-2 border-t-2 border-t-white/5 md:border-t-0 md:border-b-white/5">
                    <div className="text-2xl md:text-3xl font-black text-blue-500">{mockedHits}</div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Aciertos</div>
                </div>
            </div>

            {/* History Feed Mock */}
            <div className="hidden md:block bg-[#121820] rounded-[2.5rem] border border-white/5 p-6 md:p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <History className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter">Últimas Jugadas</h4>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Registro público de actividad</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {/* Mock history items */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-red-500' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
                                <div>
                                    <div className="text-xs font-black text-white uppercase">Mundial FIFA 2026 - Fase Grupos</div>
                                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Jugada Confirmada</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-black ${i === 2 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {i === 2 ? 'FALLADO' : 'ACERTADO'}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};
