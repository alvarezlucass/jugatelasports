import React, { useState } from 'react';
import { RankingTable } from '../components/rankings/RankingTable';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { Trophy, Users, Crown } from 'lucide-react';
import { cn } from '../lib/utils';
// Rankings are now computed dynamically from context data inside the component

type RankingTab = 'GENERAL' | 'GROUPS';

export const Rankings: React.FC = () => {
    const { user, opponents, followingIds } = useUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<RankingTab>('GENERAL');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    // Combinar usuario actual con oponentes y ordenar por puntos
    const allUsers = user ? [user, ...opponents] : opponents;
    const sortedUsers = [...allUsers].sort((a, b) => (b.points || 0) - (a.points || 0));
    const topThree = sortedUsers.slice(0, 3);
    const restOfUsers = sortedUsers; // La tabla ya maneja el scroll y visualización

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Ranking</h1>
                    <p className="text-muted-foreground">Compite para ser el mejor.</p>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Trophy className="w-8 h-8 text-amber-500" />
                </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-card rounded-2xl border border-border/50 max-w-md mx-auto">
                <button
                    onClick={() => setActiveTab('GENERAL')}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'GENERAL' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Global
                </button>
                <button
                    onClick={() => setActiveTab('GROUPS')}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'GROUPS' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Amigos y Grupos
                </button>
            </div>

            {activeTab === 'GENERAL' && (
                <div className="space-y-12">                    {/* Top 3 Podium */}
                    <div className="flex justify-center items-end gap-4 sm:gap-8 h-48 mt-8">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <div 
                                onClick={() => navigate(`/profile/${topThree[1].id}`)}
                                className="flex flex-col items-center gap-3 relative top-0 hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                            >
                                <div className="w-16 h-16 rounded-full border-4 border-slate-400 overflow-hidden shadow-lg shadow-slate-400/20">
                                    <img src={topThree[1].avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-sm font-bold text-slate-400 bg-slate-400/10 px-3 py-1 rounded-full">{topThree[1].name}</div>
                                <div className="w-20 h-28 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-2xl flex items-center justify-center text-4xl font-black text-slate-500 border-t-4 border-slate-400 shadow-xl relative z-10">
                                    2
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <div 
                                onClick={() => navigate(`/profile/${topThree[0].id}`)}
                                className="flex flex-col items-center gap-3 hover:-translate-y-2 transition-transform duration-300 z-20 cursor-pointer"
                            >
                                <div className="absolute -mt-12 text-amber-500 animate-bounce">
                                    <Crown className="w-8 h-8 fill-current" />
                                </div>
                                <div className="w-20 h-20 rounded-full border-4 border-amber-500 overflow-hidden shadow-xl shadow-amber-500/30 ring-4 ring-amber-500/10">
                                    <img src={topThree[0].avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-base font-bold text-amber-500 bg-amber-500/10 px-4 py-1 rounded-full border border-amber-500/20">{topThree[0].name}</div>
                                <div className="w-24 h-36 bg-gradient-to-b from-amber-600/20 to-amber-800/20 backdrop-blur-md rounded-t-2xl flex items-center justify-center text-5xl font-black text-amber-500 border-t-4 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                                    1
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <div 
                                onClick={() => navigate(`/profile/${topThree[2].id}`)}
                                className="flex flex-col items-center gap-3 hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                            >
                                <div className="w-16 h-16 rounded-full border-4 border-amber-700 overflow-hidden shadow-lg shadow-amber-700/20">
                                    <img src={topThree[2].avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-sm font-bold text-amber-700 bg-amber-700/10 px-3 py-1 rounded-full">{topThree[2].name}</div>
                                <div className="w-20 h-20 bg-gradient-to-b from-amber-900 to-slate-900 rounded-t-2xl flex items-center justify-center text-4xl font-black text-amber-800 border-t-4 border-amber-700 shadow-xl relative z-10">
                                    3
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-xl">
                        <RankingTable users={sortedUsers} currentUser={user || undefined} />
                    </div>
                </div>
            )}
            {activeTab === 'GROUPS' && (
                <div className="space-y-8">
                    {/* Selector de Grupo / Amigos */}
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                         <button 
                            onClick={() => setSelectedGroupId(null)}
                            className={cn(
                                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0",
                                !selectedGroupId ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-zinc-500"
                            )}
                         >
                            Mis Amigos
                         </button>
                         {user?.groups.map(group => (
                             <button 
                                key={group.id}
                                onClick={() => setSelectedGroupId(group.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0",
                                    selectedGroupId === group.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-zinc-500"
                                )}
                             >
                                {group.name}
                             </button>
                         ))}
                    </div>

                    <div className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-xl">
                        {selectedGroupId ? (
                             <RankingTable 
                                users={[user, ...opponents]
                                    .filter((u): u is User => u !== null)
                                    .filter(u => 
                                        user?.groups.find(g => g.id === selectedGroupId)?.memberIds.includes(u.id)
                                    )
                                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                                } 
                                currentUser={user || undefined} 
                             />
                        ) : (
                             <RankingTable 
                                users={[user, ...opponents]
                                    .filter((u): u is User => u !== null)
                                    .filter(u => u.id === user?.id || followingIds.includes(u.id))
                                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                                } 
                                currentUser={user || undefined} 
                             />
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};
