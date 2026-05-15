import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, ChevronRight, Trophy, Shield, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryDetailsProps {
    tournamentData: any;
    squadsData: any;
    onClose: () => void;
}

export const HistoryDetails: React.FC<HistoryDetailsProps> = ({ tournamentData, squadsData, onClose }) => {
    const [activeTab, setActiveTab] = useState<'MATCHES' | 'GROUPS' | 'SQUADS'>('MATCHES');
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    // Helper to get match by ID (if needed) or just iterate
    const knockoutStages = tournamentData?.knockout || [];
    const groups = tournamentData?.groups || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-white/10 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-amber-500/10"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <Trophy className="text-amber-500" />
                            Detalles del Torneo
                        </h2>
                        <p className="text-zinc-400 text-sm">Explora resultados completos y planteles</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={24} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-zinc-900/50">
                    <TabButton label="Eliminatorias" active={activeTab === 'MATCHES'} onClick={() => setActiveTab('MATCHES')} icon={<Trophy size={16} />} />
                    <TabButton label="Fase de Grupos" active={activeTab === 'GROUPS'} onClick={() => setActiveTab('GROUPS')} icon={<Calendar size={16} />} />
                    <TabButton label="Planteles" active={activeTab === 'SQUADS'} onClick={() => setActiveTab('SQUADS')} icon={<Users size={16} />} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">

                    {activeTab === 'MATCHES' && (
                        <div className="space-y-8">
                            {knockoutStages.map((stage: any) => (
                                <div key={stage.round} className="space-y-4">
                                    <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm border-l-4 border-amber-500 pl-3">
                                        {stage.round}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        {stage.matches.map((match: any) => (
                                            <MatchCard key={match.id} match={match} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'GROUPS' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {Object.entries(groups).map(([groupName, groupData]: [string, any]) => (
                                <div key={groupName} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-amber-500 text-sm">
                                            {groupName}
                                        </span>
                                        Grupo {groupName}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-zinc-500 uppercase bg-white/5">
                                                <tr>
                                                    <th className="px-3 py-2 rounded-l">Equipo</th>
                                                    <th className="px-2 py-2 text-center">PJ</th>
                                                    <th className="px-2 py-2 text-center">G</th>
                                                    <th className="px-2 py-2 text-center">E</th>
                                                    <th className="px-2 py-2 text-center">P</th>
                                                    <th className="px-2 py-2 text-center">Pts</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {groupData.standings.map((team: any, i: number) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-3 py-3 font-medium text-zinc-200 flex items-center gap-2">
                                                            <div className="size-2 rounded-full hidden sm:block"
                                                                style={{ backgroundColor: i < 2 ? '#22c55e' : 'transparent' }}
                                                            />
                                                            {team.team}
                                                        </td>
                                                        <td className="px-2 py-3 text-center text-zinc-400">{team.played}</td>
                                                        <td className="px-2 py-3 text-center text-zinc-400">{team.won}</td>
                                                        <td className="px-2 py-3 text-center text-zinc-400">{team.drawn}</td>
                                                        <td className="px-2 py-3 text-center text-zinc-400">{team.lost}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-amber-500">{team.points}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'SQUADS' && (
                        <div className="flex flex-col md:flex-row gap-6 h-full">
                            {/* Team Selector */}
                            <div className="w-full md:w-64 space-y-2 flex-shrink-0">
                                {squadsData?.teams?.map((team: any) => (
                                    <button
                                        key={team.id}
                                        onClick={() => setSelectedTeam(team.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedTeam === team.id
                                            ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        <img src={team.flag} alt={team.code} className="w-6 h-6 object-contain" />
                                        <span>{team.name}</span>
                                        {selectedTeam === team.id && <ChevronRight size={16} className="ml-auto" />}
                                    </button>
                                ))}
                                {!squadsData?.teams && <div className="text-zinc-500 p-4">Cargando planteles...</div>}
                            </div>

                            {/* Squad List */}
                            <div className="flex-1 bg-black/20 rounded-2xl p-6 border border-white/5 min-h-[400px]">
                                {selectedTeam ? (
                                    <SquadList
                                        team={squadsData?.teams?.find((t: any) => t.id === selectedTeam)}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-zinc-500 flex-col gap-4 opacity-50">
                                        <Shirt size={48} className="stroke-1" />
                                        <p>Selecciona un equipo para ver su plantel</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
};

const TabButton = ({ label, active, onClick, icon }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 relative transition-colors ${active ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
        {icon}
        {label}
        {active && (
            <motion.div
                layoutId="activeTabHistory"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
        )}
    </button>
);

const MatchCard = ({ match }: { match: any }) => (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 flex flex-col gap-4 hover:border-amber-500/20 transition-colors group">
        <div className="flex justify-between items-center text-xs text-zinc-500">
            <span>{new Date(match.date).toLocaleDateString()}</span>
            <span>{match.stadium}</span>
        </div>

        <div className="flex justify-between items-center">
            {/* Home */}
            <div className="flex items-center gap-3 flex-1">
                <img src={match.homeFlag} className="w-8 h-8 object-contain" alt="" />
                <span className={`font-bold ${match.score.split('-')[0] > match.score.split('-')[1] ? 'text-white' : 'text-zinc-400'}`}>
                    {match.homeTeam}
                </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center px-4">
                <div className="text-2xl font-black font-mono text-white tracking-widest bg-white/5 px-3 py-1 rounded">
                    {match.score}
                </div>
                {match.penalties && (
                    <div className="text-[10px] text-amber-500 font-mono mt-1">
                        ({match.penalties})
                    </div>
                )}
            </div>

            {/* Away */}
            <div className="flex items-center gap-3 flex-1 justify-end">
                <span className={`font-bold text-right ${match.score.split('-')[1] > match.score.split('-')[0] ? 'text-white' : 'text-zinc-400'}`}>
                    {match.awayTeam}
                </span>
                <img src={match.awayFlag} className="w-8 h-8 object-contain" alt="" />
            </div>
        </div>

        {/* Major Events (Goals) */}
        {match.events && match.events.length > 0 && (
            <div className="pt-3 border-t border-white/5 space-y-1">
                {match.events.map((ev: any, i: number) => (
                    <div key={i} className={`flex items-center gap-2 text-xs ${ev.team === 'home' ? '' : 'justify-end'}`}>
                        {ev.team === 'home' && <span className="font-mono text-zinc-500">{ev.time}</span>}
                        <span className="text-zinc-300">{ev.player}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                        {ev.team === 'away' && <span className="font-mono text-zinc-500">{ev.time}</span>}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const SquadList = ({ team }: { team: any }) => {
    if (!team) return null;

    // Group by position
    const goalkeepers = team.squad.filter((p: any) => p.position === 'Goalkeeper');
    const defenders = team.squad.filter((p: any) => p.position === 'Defender');
    const midfielders = team.squad.filter((p: any) => p.position === 'Midfielder');
    const attackers = team.squad.filter((p: any) => p.position === 'Attacker');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <img src={team.flag} className="w-16 h-16 object-contain drop-shadow-lg" alt="" />
                <div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{team.name}</h3>
                    <p className="text-amber-500 font-bold text-sm">DT: {team.coach?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <PositionGroup title="Arqueros" players={goalkeepers} />
                <PositionGroup title="Defensores" players={defenders} />
                <PositionGroup title="Mediocampistas" players={midfielders} />
                <PositionGroup title="Delanteros" players={attackers} />
            </div>
        </div>
    );
}

const PositionGroup = ({ title, players }: any) => (
    <div className="space-y-3">
        <h4 className="text-xs uppercase font-bold text-zinc-500 tracking-widest border-b border-white/5 pb-1">{title}</h4>
        <div className="grid grid-cols-1 gap-2">
            {players.map((p: any) => (
                <div key={p.number} className="flex items-center gap-3 group">
                    <span className="font-mono text-zinc-600 w-6 text-right group-hover:text-amber-500 transition-colors">{p.number}</span>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{p.name}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
