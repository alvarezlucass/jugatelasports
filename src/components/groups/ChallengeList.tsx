import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { Swords, Gift, Check, ShieldAlert, Trophy, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { GroupChallenge } from '../../types';

interface Props {
    groupId: string;
}

export const ChallengeList: React.FC<Props> = ({ groupId }) => {
    const { user, opponents, challenges, acceptChallenge, resolveChallenge } = useUser();

    // Filter challenges for this group
    const groupChallenges = challenges.filter(c => c.groupId === groupId);

    const getParticipantName = (userId: string) => {
        if (userId === user?.id) return 'Tú';
        const op = opponents.find(o => o.id === userId);
        if (op) return op.name;
        if (userId === 'guest') return 'Invitado';
        return `Usuario ${userId.substring(0, 4)}`;
    };

    const getParticipantAvatar = (userId: string) => {
        if (userId === user?.id) return user?.avatar;
        const op = opponents.find(o => o.id === userId);
        if (op) return op.avatar;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
    };

    if (groupChallenges.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-6 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Swords size={32} />
                </div>
                <div className="text-center">
                    <p className="text-xl font-black text-white uppercase tracking-tighter">Sin Desafíos Activos</p>
                    <p className="text-sm font-bold opacity-50 mt-1 max-w-sm">No hay apuestas físicas en este momento. ¡Sé el primero en lanzar un reto!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groupChallenges.map(challenge => {
                const isCreator = challenge.creatorId === user?.id;
                const isTarget = challenge.targetId === user?.id;
                const isParticipating = challenge.participants.some(p => p.userId === user?.id);
                const isOpen = challenge.status === 'OPEN';
                const isCompleted = challenge.status === 'COMPLETED';

                const creatorName = getParticipantName(challenge.creatorId);
                const creatorAvatar = getParticipantAvatar(challenge.creatorId);
                const targetName = challenge.targetId ? getParticipantName(challenge.targetId) : 'Todos';
                const targetAvatar = challenge.targetId ? getParticipantAvatar(challenge.targetId) : null;

                const isPool = challenge.type === 'POOL';
                const currentPoolSize = isPool && challenge.entryFee ? (challenge.participants.length * challenge.entryFee) : 0;

                return (
                    <div key={challenge.id} className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <div className={cn(
                            "p-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                            isOpen ? "bg-amber-500/10 text-amber-400 border-b border-amber-500/20" :
                                isCompleted ? "bg-zinc-800/50 text-zinc-400 border-b border-white/5" :
                                    "bg-blue-500/10 text-blue-400 border-b border-blue-500/20"
                        )}>
                            {isOpen ? <ShieldAlert size={14} /> : isCompleted ? <Trophy size={14} /> : <Swords size={14} />}
                            {isOpen ? 'Desafío Abierto' : isCompleted ? 'Completado' : 'En Juego'}
                        </div>

                        <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex-1 space-y-3">
                                <h3 className="text-lg font-black text-white">{challenge.title}</h3>
                                {challenge.description && (
                                    <p className="text-sm text-zinc-400">{challenge.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-sm mt-2">
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                                        isPool 
                                            ? "text-amber-500 bg-amber-500/10 border-amber-500/20" 
                                            : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                    )}>
                                        <Gift size={16} />
                                        <span className="font-bold">
                                            {isPool ? `Pozo Total: ${currentPoolSize} TKNS` : challenge.reward}
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase">
                                        {challenge.participants.length} participantes
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <img src={creatorAvatar || undefined} alt={creatorName} className="w-10 h-10 rounded-full border-2 border-white/10 bg-black" />
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{creatorName}</span>
                                    </div>
                                    <div className="text-amber-500 font-black italic">VS</div>
                                    <div className="flex flex-col items-center gap-1">
                                        {targetAvatar ? (
                                            <img src={targetAvatar} alt={targetName} className="w-10 h-10 rounded-full border-2 border-white/10 bg-black" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center text-zinc-500">
                                                <Users size={20} />
                                            </div>
                                        )}
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{targetName}</span>
                                    </div>
                                </div>

                                {isOpen && !isCreator && (!challenge.targetId || isTarget) && !isParticipating && (
                                    <button
                                        onClick={() => acceptChallenge(challenge.id)}
                                        className={cn(
                                            "w-full mt-2 py-2 px-6 rounded-lg font-black uppercase tracking-wider transition-colors text-xs xl:text-sm flex flex-col items-center justify-center gap-1",
                                            isPool ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-white hover:bg-zinc-200 text-black"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Check size={16} /> Aceptar Reto
                                        </div>
                                        {isPool && (
                                            <span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">
                                                (Entrada: {challenge.entryFee} TKNS)
                                            </span>
                                        )}
                                    </button>
                                )}

                                {isParticipating && isOpen && (
                                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                        Aceptado
                                    </span>
                                )}

                                {isCreator && isOpen && challenge.participants.length > 1 && (
                                    <button
                                        onClick={() => resolveChallenge(challenge.id, user?.id || '')} // Simulando que el creador lo marca como resuelto
                                        className="w-full mt-2 py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase transition-colors"
                                    >
                                        Marcar Resuelto
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
