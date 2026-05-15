import React, { useState } from 'react';
import { Search, Users, MessageSquare, Plus, UserPlus } from 'lucide-react';
import { MOCK_GROUPS } from '../../data/mock';

export const GroupsSidebar: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = MOCK_GROUPS.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-card/30 border-l border-white/5 backdrop-blur-md w-full">
            {/* Search Header */}
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Users className="text-amber-500" />
                        Social
                    </h2>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar grupos o usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-600"
                    />
                </div>
            </div>

            {/* Content Tabs (Mock) */}
            <div className="flex border-b border-white/5 px-6">
                <button className="flex-1 py-3 text-sm font-bold text-white border-b-2 border-amber-500 transition-colors">Grupos</button>
                <button className="flex-1 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors">Usuarios</button>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {filteredGroups.map((group) => (
                    <div
                        key={group.id}
                        className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
                            <Users className="text-amber-500 w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <h3 className="text-sm font-bold text-white truncate">{group.name}</h3>
                                {group.lastMessage && (
                                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">2m</span>
                                )}
                            </div>
                            {group.lastMessage && (
                                <p className="text-xs text-zinc-500 truncate">
                                    <span className="text-amber-500/70 font-medium">{group.lastMessage.senderName}:</span> {group.lastMessage.text}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Invite Widget */}
            <div className="p-6 bg-white/5 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <UserPlus className="text-amber-500 w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Invita a tus amigos</h4>
                        <p className="text-[10px] text-zinc-500">Gana tokens extra por cada invitado</p>
                    </div>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/20">
                    Copiar Enlace de Invitación
                </button>
            </div>
        </div>
    );
};
