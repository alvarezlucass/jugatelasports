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
    const [matchState, setMatchState] = useState<'UPCOMING' | 'LIVE' | 'FINISHED'>('UPCOMING');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loadMatches = async () => {
            setMatchesLoading(true);
            let fetchOptions: any = {};
            
            if (matchState === 'UPCOMING') {
                fetchOptions = { upcomingOnly: true, daysLimit: 30 };
            } else if (matchState === 'LIVE') {
                fetchOptions = { liveOnly: true };
            } else if (matchState === 'FINISHED') {
                fetchOptions = { status: ['FINISHED'], limit: 50, daysLimit: 30 };
            }

            const data = await matchService.getMatches(
                selectedLeague === 'all' ? undefined : selectedLeague,
                fetchOptions
            );
            setMatches(data);
            setMatchesLoading(false);
        };
        
        loadMatches();

        let interval: NodeJS.Timeout;
        if (matchState === 'LIVE') {
            // Auto-refrescar la lista de partidos en curso cada 2 minutos
            interval = setInterval(() => {
                loadMatches();
            }, 120000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedLeague, matchState]);

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
                {/* Mode and Group Selectors ocultos a pedido del usuario. La prioridad son los partidos directos */}
                {/*
                <div className="mb-12">
                   ...
                </div>
                */}

                <div className="space-y-8">
                    <div className="flex flex-col gap-6 px-2">
                        <div className="text-center md:text-left">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">Selecciona un enfrentamiento</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Partidos Disponibles</h3>
                        </div>

                        {/* Match State Selector */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 bg-[#0F131A] p-2 rounded-2xl border border-white/5 w-fit mx-auto md:mx-0">
                            {[
                                { id: 'UPCOMING', name: 'Próximos', icon: '⏱️' },
                                { id: 'LIVE', name: 'En Curso', icon: '🔴' },
                                { id: 'FINISHED', name: 'Terminados', icon: '🏁' }
                            ].map((state) => (
                                <button
                                    key={state.id}
                                    onClick={() => setMatchState(state.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        matchState === state.id
                                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <span>{state.icon}</span>
                                    {state.name}
                                </button>
                            ))}
                        </div>
                        
                        {/* League Selector */}
                        <div className="flex flex-wrap gap-3 pb-2 justify-center md:justify-start">
                            {[
                                { id: 'all', name: 'Todas Las Ligas', icon: '🌍' },
                                { id: 'world-cup-2026', name: 'Mundial 2026', icon: '🏆' },
                                { id: 'copa-lpf', name: 'Copa de la LPF', icon: '🇦🇷' },
                                { id: 'lpf', name: 'Liga Profesional', icon: '⚽' },
                                { id: 'libertadores', name: 'Libertadores', icon: '🌎' },
                                { id: 'ucl', name: 'Champions League', icon: '⭐' },
                                { id: 'premier', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
                                { id: 'laliga', name: 'La Liga', icon: '🇪🇸' }
                            ].map((lg) => (
                                <button 
                                    key={lg.id}
                                    onClick={() => setSelectedLeague(lg.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 snap-start",
                                        selectedLeague === lg.id 
                                            ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-105" 
                                            : "bg-[#0F131A] border-white/5 text-zinc-400 hover:border-white/20 hover:text-white hover:bg-[#1A1F26]"
                                    )}
                                >
                                    <span className="text-lg">{lg.icon}</span>
                                    {lg.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0F131A] border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <OfficialMatchList 
                            matches={matches} 
                            onMatchClick={handleMatchClick}
                            sortDirection={matchState === 'FINISHED' ? 'desc' : 'asc'}
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
