import React, { useState, useEffect, useMemo } from 'react';
import { OfficialMatchList } from '../components/competition/OfficialMatchList';
import { Trophy, Users, Bot, Zap, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';
import { matchService } from '../services/matchService';
import { GroupMatch } from '../data/worldCupPersistence';
import { OpponentProfileModal } from '../components/user/OpponentProfileModal';

export const Predictions: React.FC = () => {
    const { opponents = [], loading: userLoading, user } = useUser();
    const [matches, setMatches] = useState<GroupMatch[]>([]);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [mode, setMode] = useState<'MACHINE' | 'OPPONENT' | 'GROUP'>('MACHINE');
    const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [viewingOpponent, setViewingOpponent] = useState<any | null>(null);
    const [selectedLeague, setSelectedLeague] = useState<string>('all'); // Default to Todas
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loadMatches = async () => {
            setMatchesLoading(true);
            const data = await matchService.getMatches(
                selectedLeague === 'all' ? undefined : selectedLeague,
                { upcomingOnly: true, daysLimit: 30 }
            );
            setMatches(data);
            setMatchesLoading(false);
        };
        loadMatches();
    }, [selectedLeague]);

    // Handle pre-selected challenge from URL parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const challengeId = queryParams.get('challenge');
        if (challengeId) {
            setMode('OPPONENT');
            setSelectedOpponentId(challengeId);
        }
    }, [location.search]);

    // Filter opponents based on mode
    const filteredOpponents = useMemo(() => {
        let list = (opponents || []).filter(op =>
            mode === 'MACHINE' ? op.isAI : !op.isAI
        );
        
        if (mode === 'OPPONENT') {
            const queryParams = new URLSearchParams(location.search);
            const challengeId = queryParams.get('challenge');
            const name = queryParams.get('name');
            const avatar = queryParams.get('avatar');
            
            if (challengeId && name && avatar) {
                const existingIndex = list.findIndex(op => op.id === challengeId);
                const preselectedOp = existingIndex >= 0 
                    ? list[existingIndex] 
                    : { id: challengeId, name, avatar, level: 1, points: 0, streak: 0, isAI: false, winRate: 0.5 };
                
                if (existingIndex >= 0) {
                    list.splice(existingIndex, 1);
                }
                
                list = [preselectedOp, ...list];
            }
        }
        
        return list;
    }, [opponents, mode, location.search]);

    const handleMatchClick = (matchId: string) => {
        let modeParam = mode;
        let finalOpponentId = selectedOpponentId;

        let selectedOpName;
        let selectedOpAvatar;
        if(modeParam === 'OPPONENT' && finalOpponentId){
            const t = filteredOpponents.find(o=>o.id===finalOpponentId);
            if(t){ selectedOpName=t.name; selectedOpAvatar=t.avatar; }
        }

        const queryParams = new URLSearchParams({
            mode: modeParam,
            ...(finalOpponentId ? { opponentId: finalOpponentId } : {}),
            ...(mode === 'GROUP' && selectedGroupId ? { groupId: selectedGroupId } : {})
        });

        if(selectedOpName) queryParams.set('name', selectedOpName);
        if(selectedOpAvatar) queryParams.set('avatar', selectedOpAvatar);

        navigate(`/predictions/match/${matchId}?${queryParams.toString()}`);
    };

    if (userLoading || matchesLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="pb-24 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-8 pb-12">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-[0.2em]">
                        <Trophy size={14} className="fill-blue-400" />
                        Centro de Alto Rendimiento
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                        Zona de <span className="text-blue-600">Predicción</span>
                    </h1>
                    <p className="text-zinc-500 text-lg font-bold max-w-2xl mx-auto">
                        Analiza los datos históricos, elige a tu oponente y demuestra tus conocimientos futbolísticos.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Step 1: Mode Selector */}
                <div className="mb-12">
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] text-center mb-8">1. Elige tu modo de desafío</h2>
                    <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto overflow-x-auto pb-4 md:pb-0 px-4 no-scrollbar">
                        {[
                            { id: 'MACHINE', label: 'IA', icon: Bot, desc: 'Compite contra nuestro modelo predictivo', color: 'from-blue-600 to-cyan-500' },
                            { id: 'OPPONENT', label: 'Rival', icon: Users, desc: 'Desafía a un usuario aleatorio en línea', color: 'from-purple-600 to-pink-500' },
                            { id: 'GROUP', label: 'Grupo', icon: Zap, desc: 'Juega en tus ligas privadas creadas', color: 'from-amber-500 to-orange-600' }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => {
                                    setMode(m.id as any);
                                    setSelectedOpponentId(null);
                                }}
                                className={cn(
                                    "p-2 md:p-6 rounded-[1.2rem] md:rounded-[2rem] border transition-all text-left group relative overflow-hidden flex-1 min-w-[95px] md:min-w-0 shrink-0 flex flex-col items-center md:items-start",
                                    mode === m.id
                                        ? "bg-white/5 border-white/20 shadow-2xl scale-[1.02] z-10"
                                        : "bg-[#0F131A] border-white/5 hover:border-white/10 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 transition-transform group-hover:scale-110",
                                    mode === m.id ? `bg-gradient-to-br ${m.color} text-white shadow-lg` : "bg-white/5 text-zinc-500"
                                )}>
                                    <m.icon size={18} className="md:w-6 md:h-6" />
                                </div>
                                <div className="space-y-0.5 md:space-y-1 relative z-10 text-center md:text-left">
                                    <div className="font-black text-[10px] md:text-xs text-white uppercase tracking-tighter md:tracking-tight leading-none">{m.label}</div>
                                    <div className="hidden md:block text-[10px] font-bold text-zinc-500 leading-tight">{m.desc}</div>
                                </div>
                                {mode === m.id && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Opponent Selector Optional */}
                {(mode === 'OPPONENT' || mode === 'MACHINE') && (
                    <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
                        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] text-center mb-8">2. Selecciona a tu rival</h2>
                        <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 md:pb-0 px-4 md:justify-center no-scrollbar">
                            {filteredOpponents.map((op) => (
                                <button
                                    key={op.id}
                                    onClick={() => setViewingOpponent(op)}
                                    className={cn(
                                        "relative flex flex-col items-center gap-2 p-3 rounded-[1.5rem] border transition-all w-[95px] md:w-32 shrink-0",
                                        selectedOpponentId === op.id
                                            ? "bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
                                            : "bg-[#0F131A] border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="relative">
                                        <div className={cn(
                                            "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-transform",
                                            selectedOpponentId === op.id ? "border-blue-500 scale-110" : "border-white/10"
                                        )}>
                                            <img src={op.avatar} alt={op.name} className="w-full h-full object-cover" />
                                        </div>
                                        {selectedOpponentId === op.id && (
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-lg p-1 shadow-lg">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-white uppercase truncate w-full">{op.name}</div>
                                        <div className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-1">Nivel {op.level}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2 for Groups */}
                {mode === 'GROUP' && (
                    <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
                        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] text-center mb-8">2. Selecciona la liga</h2>

                        {user && user.groups.length === 0 ? (
                            <div className="text-center p-8 bg-white/5 border border-white/5 border-dashed rounded-[2rem] max-w-md mx-auto">
                                <Users size={32} className="text-zinc-500 mx-auto mb-4" />
                                <h3 className="text-white font-black uppercase tracking-tight mb-2">No estás en ninguna liga</h3>
                                <p className="text-sm font-bold text-zinc-500 mb-6">Crea un grupo o únete con un PIN para competir contra tus amigos en privado.</p>
                                <button onClick={() => navigate('/groups')} className="px-6 py-2 bg-white text-black font-black uppercase text-xs rounded-full hover:bg-zinc-200 transition-colors">
                                    Ir a Grupos
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 md:pb-0 px-4 md:justify-center no-scrollbar w-full">
                                {user?.groups.map((group) => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedGroupId(group.id === selectedGroupId ? null : group.id)}
                                        className={cn(
                                            "relative flex items-center gap-4 p-4 rounded-[2rem] border transition-all min-w-[200px] text-left",
                                            selectedGroupId === group.id
                                                ? `bg-${group.color}-600/10 border-${group.color}-500 shadow-lg shadow-${group.color}-500/20`
                                                : "bg-[#0F131A] border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 transition-transform",
                                            selectedGroupId === group.id ? `bg-${group.color}-500 scale-110` : "bg-white/10",
                                            selectedGroupId === group.id && group.color === 'blue' && "bg-blue-500",
                                            selectedGroupId === group.id && group.color === 'green' && "bg-green-500",
                                            selectedGroupId === group.id && group.color === 'purple' && "bg-purple-500"
                                        )}>
                                            <Trophy size={20} />
                                        </div>
                                        <div className="flex-1 pr-4">
                                            <div className="text-xs font-black text-white uppercase tracking-tighter truncate leading-tight w-32">{group.name}</div>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 mt-0.5"><Users size={10} /> {group.memberIds.length}</div>
                                        </div>
                                        {selectedGroupId === group.id && (
                                            <div className={cn(
                                                "absolute -top-2 -right-2 text-white rounded-lg p-1 shadow-lg",
                                                `bg-${group.color}-500`,
                                                group.color === 'blue' && "bg-blue-500",
                                                group.color === 'green' && "bg-green-500",
                                                group.color === 'purple' && "bg-purple-500"
                                            )}>
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Match Selection */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                        <div>
                            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2">{mode === 'GROUP' ? '2' : '3'}. Selecciona un enfrentamiento</h2>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Partidos Disponibles</h3>
                        </div>
                        
                        {/* League Selector */}
                        <div className="flex bg-[#0F131A] rounded-full p-1 border border-white/10 overflow-x-auto max-w-full no-scrollbar shrink-0 gap-1">
                            {[
                                { id: 'all', name: 'Todas' },
                                { id: 'world-cup-2026', name: 'Mundial 2026' },
                                { id: 'copa-lpf', name: 'Copa de la LPF' },
                                { id: 'lpf', name: 'Liga Profesional' },
                                { id: 'libertadores', name: 'Libertadores' },
                                { id: 'ucl', name: 'UCL' },
                                { id: 'premier', name: 'Premier League' },
                                { id: 'laliga', name: 'La Liga' }
                            ].map((lg) => (
                                <button 
                                    key={lg.id}
                                    onClick={() => setSelectedLeague(lg.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        selectedLeague === lg.id ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"
                                    )}
                                >
                                    {lg.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0F131A] border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <OfficialMatchList 
                            matches={matches} 
                            onMatchClick={handleMatchClick}
                        />
                    </div>
                </div>
            </div>

            <OpponentProfileModal
                opponent={viewingOpponent}
                isOpen={!!viewingOpponent}
                onClose={() => setViewingOpponent(null)}
                onSelect={() => setSelectedOpponentId(viewingOpponent?.id || null)}
            />
        </div>
    );
};
