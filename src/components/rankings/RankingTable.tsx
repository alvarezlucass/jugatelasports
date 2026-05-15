import React from 'react';
import type { User } from '../../types';
import { cn } from '../../lib/utils';
import { Medal, TrendingUp, TrendingDown, Minus, Sword } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RankingTableProps {
    users: User[]; // In real app would be a summarized user type
    currentUser?: User;
}

export const RankingTable: React.FC<RankingTableProps> = ({ users, currentUser }) => {
    const navigate = useNavigate();

    // Lógica Industrial: Top 7 + Usuario actual (si no está en el top 7)
    const top7 = users.slice(0, 7);
    const currentUserRank = users.findIndex(u => u.id === currentUser?.id) + 1;
    const isUserInTop7 = currentUserRank > 0 && currentUserRank <= 7;
    
    const displayUsers = [...top7];

    return (
        <div className="bg-[#0A0D12] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] border-b border-white/5">
                        <tr>
                            <th className="px-6 py-5 text-center w-20">Rango</th>
                            <th className="px-6 py-5">Héroe</th>
                            <th className="px-6 py-5 text-center hidden md:table-cell">Estado</th>
                            <th className="px-6 py-5 text-right">Puntos XC</th>
                            <th className="px-6 py-5 text-right w-24">Reto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {displayUsers.map((u, index) => {
                            const rank = index + 1;
                            const isMe = currentUser?.id === u.id;
                            
                            return (
                                <RankingRow 
                                    key={u.id} 
                                    user={u} 
                                    rank={rank} 
                                    isMe={isMe} 
                                    navigate={navigate} 
                                />
                            );
                        })}

                        {/* Fila Pegajosa para el Usuario (si está fuera del Top 7) */}
                        {!isUserInTop7 && currentUser && (
                            <>
                                <tr className="bg-gradient-to-r from-transparent via-zinc-800/20 to-transparent">
                                    <td colSpan={5} className="py-2 text-center">
                                        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-30" />
                                    </td>
                                </tr>
                                <RankingRow 
                                    user={currentUser} 
                                    rank={currentUserRank} 
                                    isMe={true} 
                                    isSticky={true}
                                    navigate={navigate} 
                                />
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface RankingRowProps {
    user: User;
    rank: number;
    isMe: boolean;
    isSticky?: boolean;
    navigate: any;
}

const RankingRow: React.FC<RankingRowProps> = ({ user, rank, isMe, isSticky, navigate }) => {
    return (
        <tr 
            onClick={() => navigate(`/profile/${user.id}`)}
            className={cn(
                "group transition-all duration-300 cursor-pointer", 
                isMe ? "bg-blue-500/[0.05] hover:bg-blue-500/[0.1]" : "hover:bg-white/[0.02]",
                isSticky && "border-t-2 border-blue-500/20"
            )}
        >
            <td className="px-6 py-5 text-center">
                <div className="flex items-center justify-center">
                    {rank === 1 ? (
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <Medal className="w-5 h-5 text-amber-500" />
                        </div>
                    ) : rank === 2 ? (
                        <div className="w-10 h-10 rounded-2xl bg-slate-400/10 flex items-center justify-center border border-slate-400/20">
                            <Medal className="w-5 h-5 text-slate-400" />
                        </div>
                    ) : rank === 3 ? (
                        <div className="w-10 h-10 rounded-2xl bg-amber-800/10 flex items-center justify-center border border-amber-800/20">
                            <Medal className="w-5 h-5 text-amber-800" />
                        </div>
                    ) : (
                        <span className={cn(
                            "font-black text-xs italic tracking-tighter",
                            isMe ? "text-blue-500" : "text-zinc-600"
                        )}>
                            #{rank}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl overflow-hidden ring-1 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                            isMe ? "ring-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "ring-white/10"
                        )}>
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        {isMe && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-lg border-2 border-[#0A0D12]" />}
                    </div>
                    <div className="flex flex-col">
                        <span className={cn(
                            "font-black text-base uppercase tracking-tight transition-colors", 
                            isMe ? "text-blue-500 italic" : "text-white group-hover:text-blue-400"
                        )}>
                            {user.name} {isMe && "(TÚ)"}
                        </span>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                Nivel {user.level || 1}
                             </span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 text-center hidden md:table-cell">
                <div className="flex items-center justify-center">
                    {rank <= 3 ? (
                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/10">
                            <TrendingUp className="w-3 h-3" /> Imparable
                        </div>
                    ) : (
                        <Minus className="w-4 h-4 text-zinc-800" />
                    )}
                </div>
            </td>
            <td className="px-6 py-5 text-right">
                <div className="flex flex-col items-end">
                    <span className="font-black text-white text-lg tracking-tighter leading-none">
                        {((user.points || user.tokens) ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">XP ACUMULADA</span>
                </div>
            </td>
            <td className="px-6 py-5 text-right">
                {!isMe && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/predictions?challenge=${user.id}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}`);
                        }}
                        className="p-3 bg-white/5 hover:bg-blue-600 text-zinc-400 hover:text-white rounded-xl transition-all active:scale-95 group/btn border border-white/5 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                        <Sword className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                    </button>
                )}
            </td>
        </tr>
    );
};
