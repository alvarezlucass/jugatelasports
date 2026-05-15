import React, { useState } from 'react';
import { ChevronLeft, Star, Shield, Zap, Target, User, Calendar } from 'lucide-react';
import { type TeamHistory, getTeamMatches } from '../../data/worldCupPersistence';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { OfficialMatchList } from './OfficialMatchList';

interface TeamSquadViewProps {
    team: TeamHistory;
}

type PositionFilter = 'ALL' | 'G' | 'D' | 'M' | 'F';
type TeamTab = 'SQUAD' | 'FIXTURES' | 'STAFF' | 'HISTORY';

export const TeamSquadView: React.FC<TeamSquadViewProps> = ({ team }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TeamTab>('FIXTURES');
    const [filter, setFilter] = useState<PositionFilter>('ALL');

    const filteredPlayers = team.players?.filter(p => filter === 'ALL' || p.position === filter) || [];

    const getPositionName = (pos: string) => {
        switch (pos) {
            case 'G': return 'Porteros';
            case 'D': return 'Defensas';
            case 'M': return 'Mediocampistas';
            case 'F': return 'Delanteros';
            default: return 'Jugadores';
        }
    };

    const getPositionIcon = (pos: string) => {
        switch (pos) {
            case 'G': return <Shield size={14} />;
            case 'D': return <Shield size={14} />;
            case 'M': return <Zap size={14} />;
            case 'F': return <Target size={14} />;
            default: return <User size={14} />;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'FIXTURES':
                const teamMatches = getTeamMatches(team.name);
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Calendar className="text-blue-500" />
                                Calendario de <span className="text-blue-600">{team.name}</span>
                            </h3>
                            <div className="text-[10px] font-bold text-zinc-500 bg-white/5 px-4 py-2 rounded-full border border-white/5 uppercase tracking-widest">
                                Mundial 2026 • Fase de Grupos
                            </div>
                        </div>
                        <div className="bg-[#0F131A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <OfficialMatchList 
                                matches={teamMatches} 
                                onMatchClick={(matchId) => navigate(`/predictions/match/${matchId}?mode=MACHINE`)}
                            />
                        </div>
                    </div>
                );
            case 'SQUAD':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 p-2 bg-[#131822]/80 backdrop-blur-sm border border-white/5 rounded-[2rem] max-w-fit shadow-2xl">
                            {(['ALL', 'G', 'D', 'M', 'F'] as PositionFilter[]).map((pos) => (
                                <button
                                    key={pos}
                                    onClick={() => setFilter(pos)}
                                    className={cn(
                                        "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        filter === pos
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {pos === 'ALL' ? 'Todos' : getPositionName(pos)}
                                </button>
                            ))}
                        </div>

                        {/* Players Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPlayers.map((player) => (
                                <div
                                    key={player.id}
                                    className="group relative bg-gradient-to-b from-[#131822] to-[#0A0D12] border border-white/5 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all duration-300 hover:translate-y-[-4px] overflow-hidden shadow-xl hover:shadow-blue-500/10 flex flex-col"
                                >
                                    <div className="absolute top-2 right-4 z-0">
                                        <span className="text-6xl font-black text-white/[0.03] group-hover:text-blue-500/10 transition-colors tracking-tighter">
                                            #{player.number}
                                        </span>
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                                                <User size={32} className="text-zinc-600" />
                                            </div>
                                            {player.isStar && (
                                                <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                                    <Star size={16} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                                {player.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                                                    {getPositionIcon(player.position)}
                                                    {getPositionName(player.position).slice(0, -1)}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                <span>{player.age} años</span>
                                            </div>
                                        </div>

                                        <div className="pt-5 border-t border-white/5 mt-auto">
                                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Club Actual</div>
                                            <div className="text-sm font-bold text-zinc-300 truncate">{player.club}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'STAFF':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        {team.coachingStaff?.map((staff) => (
                            <div key={staff.id} className="bg-[#0F131A] border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 group hover:border-blue-500/20 transition-all">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-zinc-700">
                                    <User size={40} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-2 text-left">{staff.role}</div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-left">{staff.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'HISTORY':
                return (
                    <div className="bg-[#0F131A] border border-white/5 rounded-[3rem] p-10 md:p-16 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                        <div className="max-w-4xl mx-auto space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Trayectoria <span className="text-blue-600">Histórica</span></h3>
                                <p className="text-xl text-zinc-400 font-medium leading-relaxed">
                                    {team.detailedHistory || team.description}
                                </p>
                            </div>

                            {/* Quick Facts */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Títulos Mundiales</div>
                                    <div className="text-4xl font-black text-white">{team.titles}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Participaciones</div>
                                    <div className="text-4xl font-black text-white">{team.appearances}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mejor Puesto</div>
                                    <div className="text-xl font-black text-white uppercase">{team.bestResult}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-700 bg-[#0A0D12]">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900/80 to-[#0A0D12] pt-10 pb-16 lg:pb-24 border-b border-white/5">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.15] pointer-events-none mix-blend-overlay" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />

                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest mb-10 transition-colors w-fit"
                    >
                        <ChevronLeft size={16} /> Volver
                    </button>

                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 xl:gap-12">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8">
                            <div className="w-24 h-24 sm:w-32 sm:h-24 md:w-36 md:h-24 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 p-4 flex items-center justify-center shadow-2xl shrink-0">
                                <span className="text-4xl md:text-5xl font-black text-white/50 select-none uppercase tracking-tighter drop-shadow-md">{team.id}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="inline-flex px-4 py-1.5 rounded-full bg-blue-500/20 text-[10px] font-black text-blue-300 uppercase tracking-widest border border-blue-500/30 shadow-inner">
                                    Perfil Oficial Selección
                                </div>
                                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none uppercase drop-shadow-2xl">
                                    {team.name}
                                </h1>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl self-start xl:self-center shadow-xl w-full sm:w-auto overflow-x-auto no-scrollbar relative z-20">
                            {(['FIXTURES', 'SQUAD', 'STAFF', 'HISTORY'] as TeamTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 sm:flex-none",
                                        activeTab === tab 
                                            ? "bg-white text-black shadow-lg scale-105" 
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {tab === 'FIXTURES' ? 'Calendario' : tab === 'SQUAD' ? 'Plantilla' : tab === 'STAFF' ? 'Staff' : 'Historia'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 mt-12 mb-20 relative z-10">
                {renderContent()}
            </div>
        </div>
    );
};
