import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { ArrowLeft, Trophy, Users, Shield, Share2, Medal, Activity, Swords, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { type League } from '../types';
import { ChallengeList } from '../components/groups/ChallengeList';
import { CreateChallengeModal } from '../components/groups/CreateChallengeModal';

export const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, opponents, pvpChallenges } = useUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'ranking' | 'activity' | 'challenges'>('ranking');
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

    const group = user?.groups.find(g => g.id === id) || {
        id: id || 'g1',
        name: 'Liga de Prueba',
        color: 'blue',
        memberIds: ['guest', 'u-2', 'u-3', 'ai-1'],
        isPublic: false,
        adminId: 'u-2'
    } as League;

    // Build member list using real points from context (no Math.random)
    const allKnownUsers = [
        ...(user ? [user] : []),
        ...opponents.map(o => ({ id: o.id, name: o.name, avatar: o.avatar, points: o.points, level: o.level }))
    ];

    const members = group.memberIds.map(mId => {
        const known = allKnownUsers.find(u => u.id === mId);
        if (known) return known;
        return {
            id: mId,
            name: `Usuario ${mId.substring(0, 6)}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mId}`,
            points: 0,
            level: 1
        };
    }).sort((a, b) => b.points - a.points);

    // PvP activity feed filtered by group members
    const groupMemberIds = new Set(group.memberIds);
    const groupActivity = pvpChallenges
        .filter(c => groupMemberIds.has(c.creatorId) || groupMemberIds.has(c.targetId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);

    const handleShare = () => {
        navigator.clipboard?.writeText(group.id.toUpperCase()).catch(() => {});
        alert(`Código de liga copiado: ${group.id.toUpperCase()}`);
    };

    return (
        <div className="min-h-screen pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Hero */}
            <div className={cn(
                "pt-12 pb-16 px-4 relative overflow-hidden",
                `bg-${group.color}-900/20`
            )}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

                <div className="container mx-auto max-w-4xl relative z-10">
                    <button
                        onClick={() => navigate('/groups')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 w-fit"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Mis Ligas</span>
                    </button>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                        <div className={cn(
                            "w-24 h-24 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shrink-0 border-2 border-white/10",
                            group.color === 'blue' && "bg-blue-600 shadow-blue-500/50",
                            group.color === 'green' && "bg-green-600 shadow-green-500/50",
                            group.color === 'purple' && "bg-purple-600 shadow-purple-500/50"
                        )}>
                            <Trophy size={48} className="drop-shadow-lg" />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className={cn(
                                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1.5",
                                    !group.isPublic
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        : "bg-green-500/10 text-green-400 border-green-500/20"
                                )}>
                                    {!group.isPublic ? <Shield size={12} /> : <Users size={12} />}
                                    {!group.isPublic ? 'Liga Privada' : 'Liga Pública'}
                                </span>
                                {group.adminId === user?.id && (
                                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1.5">
                                        <Trophy size={12} />
                                        Admin
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                                {group.name}
                            </h1>

                            <p className="text-zinc-400 font-bold max-w-xl text-sm md:text-base">
                                {members.length} jugadores · Ranking oficial de la liga.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                title="Invitar Amigos"
                            >
                                <Share2 size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/predictions?mode=GROUP')}
                                className="px-6 h-12 rounded-full bg-white text-black font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-xl"
                            >
                                Jugar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="container mx-auto px-4 max-w-4xl mt-[-2rem] relative z-20 space-y-8">
                <div className="flex bg-[#0F131A] p-1.5 rounded-full border border-white/5 w-fit mx-auto shadow-xl">
                    <button
                        onClick={() => setActiveTab('ranking')}
                        className={cn(
                            "px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === 'ranking'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <Medal size={16} /> Posiciones
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={cn(
                            "px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === 'activity'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <Activity size={16} /> Actividad
                        {groupActivity.filter(c => c.status === 'PENDING').length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('challenges')}
                        className={cn(
                            "px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === 'challenges'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <Swords size={16} /> Desafíos
                    </button>
                </div>

                {activeTab === 'ranking' && (
                    <div className="bg-[#0F131A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
                        <div className="p-6 md:p-8 flex flex-col gap-2">
                            {members.map((member, index) => {
                                const isCurrentUser = member.id === user?.id;
                                const isTop3 = index < 3;

                                return (
                                    <div
                                        key={member.id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl transition-all",
                                            isCurrentUser ? "bg-blue-600/10 border border-blue-500/20" : "hover:bg-white/[0.02]",
                                            index === 0 && "bg-amber-500/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 text-center font-black text-xl",
                                            index === 0 ? "text-amber-400" :
                                                index === 1 ? "text-zinc-300" :
                                                    index === 2 ? "text-amber-700" : "text-zinc-600"
                                        )}>
                                            {index + 1}
                                        </div>

                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 bg-black/50">
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            </div>
                                            {isTop3 && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0F131A] rounded-full flex items-center justify-center">
                                                    <Trophy size={12} className={cn(
                                                        index === 0 ? "text-amber-400" :
                                                            index === 1 ? "text-zinc-300" : "text-amber-700"
                                                    )} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className={cn(
                                                    "font-black text-lg tracking-tight",
                                                    isCurrentUser ? "text-blue-400" : "text-white"
                                                )}>
                                                    {member.name}
                                                </h4>
                                                {isCurrentUser && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Tú</span>}
                                            </div>
                                            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                                Nivel {member.level}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-black text-white font-mono">{member.points.toLocaleString()}</div>
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Puntos</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="animate-in slide-in-from-bottom-4">
                        {groupActivity.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-6 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                    <Activity size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white italic uppercase tracking-tighter">Sin actividad reciente</p>
                                    <p className="text-sm font-bold opacity-50 mt-2 max-w-sm">Los desafíos PvP entre miembros aparecerán aquí.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#0F131A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl divide-y divide-white/5">
                                <div className="p-6 border-b border-white/5">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={14} className="text-blue-400" /> Feed de Actividad · {groupActivity.length} acciones
                                    </h3>
                                </div>
                                {groupActivity.map(challenge => {
                                    const statusIcon = challenge.status === 'FINISHED'
                                        ? <CheckCircle size={14} className="text-emerald-400" />
                                        : challenge.status === 'REJECTED'
                                        ? <XCircle size={14} className="text-red-400" />
                                        : <Clock size={14} className="text-amber-400" />;

                                    const statusLabel = challenge.status === 'PENDING' ? 'Pendiente'
                                        : challenge.status === 'ACCEPTED' ? 'En Curso'
                                        : challenge.status === 'FINISHED'
                                        ? (challenge.winnerId === user?.id ? '🏆 Ganaste' : challenge.winnerId ? 'Perdiste' : 'Empate')
                                        : 'Cancelado';

                                    return (
                                        <div key={challenge.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10">
                                                <img src={challenge.creatorAvatar} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-white uppercase tracking-tight">
                                                    <span className="text-blue-400">{challenge.creatorName}</span>
                                                    <span className="text-zinc-500 mx-1">desafió a</span>
                                                    <span className="text-emerald-400">{challenge.targetName}</span>
                                                </p>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">
                                                    {challenge.matchHomeTeam} vs {challenge.matchAwayTeam} · {challenge.amount} TKNS
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {statusIcon}
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{statusLabel}</span>
                                            </div>
                                            <div className="text-[8px] text-zinc-700 font-bold uppercase shrink-0">
                                                {new Date(challenge.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'challenges' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                                    <Swords className="text-amber-500" />
                                    Desafíos de la Liga
                                </h2>
                                <p className="text-sm font-bold text-zinc-400">Jugá por un Fernet, un asado o tokens contra tus amigos.</p>
                            </div>
                            <button
                                onClick={() => setIsChallengeModalOpen(true)}
                                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider transition-colors shadow-xl shadow-amber-500/20"
                            >
                                Crear Desafío
                            </button>
                        </div>

                        <ChallengeList groupId={group.id} />
                    </div>
                )}
            </div>

            <CreateChallengeModal
                isOpen={isChallengeModalOpen}
                onClose={() => setIsChallengeModalOpen(false)}
                group={group}
            />
        </div>
    );
};
