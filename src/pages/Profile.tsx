import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { User as UserIcon, Settings, LogOut, Wallet, ChevronRight, Trophy, Zap, Star, X } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { cn } from '../lib/utils';
import { fireVictoryConfetti } from '../utils/confetti';
import type { PvpChallenge } from '../types';
import { Info, BarChart3, TrendingUp, Target } from 'lucide-react';
import { PointsRulesModal } from '../components/modals/PointsRulesModal';
import { PerformanceStats } from '../components/profile/PerformanceStats';
import { ActivityFeed } from '../components/social/ActivityFeed';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    BarChart, 
    Bar, 
    Cell, 
    PieChart, 
    Pie 
} from 'recharts';

const ChallengeCard: React.FC<{
    challenge: PvpChallenge;
    user: any;
    acceptPvpChallenge: (id: string) => void;
    rejectPvpChallenge: (id: string) => void;
    cancelPvpChallenge: (id: string) => void;
    resolvePvpChallenge: (id: string, winnerId: string) => void;
    navigate: any;
}> = ({ challenge, user, acceptPvpChallenge, rejectPvpChallenge, cancelPvpChallenge, resolvePvpChallenge, navigate }) => {
    const [showResolvePanel, setShowResolvePanel] = React.useState(false);
    const [realHome, setRealHome] = React.useState('');
    const [realAway, setRealAway] = React.useState('');

    const isCreator = challenge.creatorId === user?.id;
    const opponentName = isCreator ? challenge.targetName : challenge.creatorName;
    const opponentAvatar = isCreator ? challenge.targetAvatar : challenge.creatorAvatar;

    // Determine winner by comparing creator's prediction vs real score
    const handleResolveByScore = () => {
        const h = parseInt(realHome);
        const a = parseInt(realAway);
        if (isNaN(h) || isNaN(a)) return;

        // Determine real outcome
        let realOutcome: 'HOME' | 'DRAW' | 'AWAY';
        if (h > a) realOutcome = 'HOME';
        else if (a > h) realOutcome = 'AWAY';
        else realOutcome = 'DRAW';

        // Creator wins if their selection matches real outcome
        const creatorCorrect = challenge.creatorSelection === realOutcome;
        const winnerId = creatorCorrect ? challenge.creatorId : challenge.targetId;

        resolvePvpChallenge(challenge.id, winnerId);
        if (winnerId === user?.id) fireVictoryConfetti();
        setShowResolvePanel(false);
    };

    return (
        <div id={`challenge-${challenge.id}`} className="bg-[#121820] rounded-[2.5rem] p-6 border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col gap-5 group relative overflow-hidden scroll-mt-24">
            {/* Background glow based on status */}
            {challenge.status === 'PENDING' && !isCreator && <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none" />}
            {challenge.status === 'ACCEPTED' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />}
            
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                        <img src={opponentAvatar} alt={opponentName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                            {challenge.status === 'PENDING' ? (isCreator ? 'Esperando a' : 'Te desafía') : challenge.status === 'ACCEPTED' ? 'En Juego vs' : 'Historial vs'}
                        </div>
                        <div className="text-sm font-black text-white uppercase tracking-tight">{opponentName}</div>
                    </div>
                </div>
                {challenge.status === 'PENDING' && !isCreator && (
                    <div className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse border border-amber-500/20">
                        ¡Acción Requerida!
                    </div>
                )}
                {challenge.status === 'PENDING' && isCreator && (
                    <div className="px-3 py-1 bg-white/5 text-zinc-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">
                        Enviado
                    </div>
                )}
                {challenge.status === 'ACCEPTED' && (
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        En Curso
                    </div>
                )}
                {challenge.status === 'FINISHED' && (
                    <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", 
                        challenge.winnerId === user?.id ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20" : "bg-red-500/20 text-red-500 border-red-500/20"
                    )}>
                        {challenge.winnerId === user?.id ? '🏆 Ganaste' : 'Perdiste'}
                    </div>
                )}
                {challenge.status === 'REJECTED' && (
                    <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                        Cancelado
                    </div>
                )}
            </div>

            <div className="py-4 border-y border-white/5 flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between gap-4">
                    <div className={cn("flex-1 text-center font-black text-xs uppercase tracking-tighter truncate", challenge.creatorSelection === 'HOME' ? "text-blue-400" : "text-zinc-400")}>
                        {challenge.matchHomeTeam}
                    </div>
                    <div className={cn("text-xl font-black italic", challenge.creatorSelection === 'DRAW' ? "text-blue-400" : "text-zinc-700")}>VS</div>
                    <div className={cn("flex-1 text-center font-black text-xs uppercase tracking-tighter truncate", challenge.creatorSelection === 'AWAY' ? "text-blue-400" : "text-zinc-400")}>
                        {challenge.matchAwayTeam}
                    </div>
                </div>
                <div className="text-center bg-white/5 mx-6 py-1.5 rounded-xl border border-white/5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                        {isCreator ? 'Predijiste:' : `${challenge.creatorName} predijo:`} <span className="text-white font-black">{challenge.creatorSelection === 'HOME' ? 'Local' : challenge.creatorSelection === 'AWAY' ? 'Visitante' : 'Empate'} ({challenge.creatorHomeScore} - {challenge.creatorAwayScore})</span>
                    </span>
                </div>
            </div>

            {/* Smart Resolve Panel */}
            {showResolvePanel && challenge.status === 'ACCEPTED' && (
                <div className="relative z-10 bg-[#0A0E14] border border-blue-500/20 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-200 space-y-3">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">Resultado Real del Partido</p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold truncate max-w-[70px] text-center">{challenge.matchHomeTeam}</span>
                            <input
                                type="number" min="0" max="20" value={realHome}
                                onChange={e => setRealHome(e.target.value)}
                                placeholder="0"
                                className="w-16 h-16 bg-[#1A1F26] border border-white/10 rounded-2xl text-center text-3xl font-black text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <span className="text-2xl font-black text-zinc-600 mt-4">—</span>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold truncate max-w-[70px] text-center">{challenge.matchAwayTeam}</span>
                            <input
                                type="number" min="0" max="20" value={realAway}
                                onChange={e => setRealAway(e.target.value)}
                                placeholder="0"
                                className="w-16 h-16 bg-[#1A1F26] border border-white/10 rounded-2xl text-center text-3xl font-black text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowResolvePanel(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 font-black text-[9px] uppercase tracking-widest rounded-xl transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleResolveByScore}
                            disabled={realHome === '' || realAway === ''}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-colors"
                        >
                            Confirmar Resultado
                        </button>
                    </div>
                    <p className="text-[8px] text-zinc-600 text-center">El sistema determinará el ganador según la predicción registrada</p>
                </div>
            )}

            <div className="flex justify-between items-center relative z-10 flex-wrap gap-3">
                <div className="flex flex-col gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none">En Juego</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-tighter">
                            {challenge.amount} TKNS
                        </span>
                        {challenge.itemReward && (
                            <>
                                <span className="text-zinc-600 font-black text-[10px]">+</span>
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-tighter border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 rounded-md">
                                    {challenge.itemReward}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {challenge.status === 'PENDING' && !isCreator && (
                        <>
                            <button onClick={() => rejectPvpChallenge(challenge.id)} className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors">
                                <X size={14} />
                            </button>
                            <button onClick={() => acceptPvpChallenge(challenge.id)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest rounded-full transition-colors">
                                Aceptar Reto
                            </button>
                        </>
                    )}
                    {challenge.status === 'PENDING' && isCreator && (
                        <button onClick={() => cancelPvpChallenge(challenge.id)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest rounded-full transition-colors border border-white/5">
                            Retirar
                        </button>
                    )}
                    {challenge.status === 'ACCEPTED' && (
                        <button
                            onClick={() => setShowResolvePanel(!showResolvePanel)}
                            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-black text-[9px] uppercase tracking-widest rounded-full transition-colors border border-blue-500/30"
                        >
                            {showResolvePanel ? 'Ocultar' : '⚽ Ingresar Resultado Real'}
                        </button>
                    )}
                    {challenge.status === 'FINISHED' && (
                        <button 
                            onClick={() => navigate(`/predictions?challenge=${isCreator ? challenge.targetId : challenge.creatorId}&name=${encodeURIComponent(opponentName)}&avatar=${encodeURIComponent(opponentAvatar)}`)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest rounded-full transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Revancha
                        </button>
                    )}
                    {challenge.status === 'REJECTED' && (
                        <button 
                            onClick={() => navigate(`/predictions?challenge=${isCreator ? challenge.targetId : challenge.creatorId}&name=${encodeURIComponent(opponentName)}&avatar=${encodeURIComponent(opponentAvatar)}`)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-widest rounded-full transition-colors border border-white/5"
                        >
                            Volver a Desafiar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Profile: React.FC = () => {
    const { user, transactions, userPredictions, pvpChallenges, acceptPvpChallenge, rejectPvpChallenge, cancelPvpChallenge, resolvePvpChallenge, signOut, storeItems } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [syncing, setSyncing] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'SOCIAL' | 'PREDICTIONS' | 'PVP' | 'PERFORMANCE' | 'ACTIVITY'>('PREDICTIONS');
    const [pvpView, setPvpView] = React.useState<'SUMMARY' | 'RECEIVED' | 'SENT'>('SUMMARY');
    const [showRulesModal, setShowRulesModal] = React.useState(false);

    // Performance Data Calculation from Industrial Stats
    const performanceData = React.useMemo(() => {
        if (!user || !user.stats) return null;

        // 1. Evolution from stats trend
        const evolution = (user.stats.performanceTrend || []).map((p: any, i: number) => ({
            match: i + 1,
            points: p.points,
            date: p.date
        }));

        // 2. Distribution from stats counters
        const distribution = [
            { name: 'Aciertos', value: user.stats.wonCount || 0, color: '#10B981' },
            { name: 'Fallos', value: user.stats.lostCount || 0, color: '#EF4444' },
            { name: 'En Juego', value: userPredictions.filter(p => p.status === 'ACTIVE' || p.status === 'PENDING').length, color: '#F59E0B' }
        ];

        // 3. Accuracy by Team (Keep dynamic from current predictions for granularity)
        const teamStats: Record<string, { total: number; wins: number }> = {};
        userPredictions.forEach(p => {
            if (!p.matchDetails) return;
            const teams = [p.matchDetails.homeTeam, p.matchDetails.awayTeam];
            teams.forEach(t => {
                if (!teamStats[t]) teamStats[t] = { total: 0, wins: 0 };
                teamStats[t].total += 1;
                if (p.status === 'WON') teamStats[t].wins += 1;
            });
        });

        const accuracyByTeam = Object.entries(teamStats)
            .map(([name, stats]) => ({
                name,
                accuracy: Math.round((stats.wins / stats.total) * 100),
                total: stats.total
            }))
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 5);

        return { evolution, distribution, accuracyByTeam };
    }, [user?.stats, userPredictions]);


    const receivedChallenges = pvpChallenges?.filter(c => c.targetId === user?.id) || [];
    const sentChallenges = pvpChallenges?.filter(c => c.creatorId === user?.id) || [];

    const totalPredictions = userPredictions.length;
    const wonPredictions = user?.stats?.wonCount || 0;
    const lostPredictions = user?.stats?.lostCount || 0;
    const winRate = user?.stats?.accuracy || 0;

    // Efecto para auto-navegar al desafío preseleccionado desde una notificación
    useEffect(() => {
        const highlightId = location.state?.highlightChallengeId;
        const navPvpTab = location.state?.pvpTab;
        const navPvpView = location.state?.pvpView;

        // Si viene con tab específico desde notificación, aplicar directamente
        if (navPvpTab === 'PVP') {
            setActiveTab('PVP');
        }
        if (navPvpView === 'RECEIVED' || navPvpView === 'SENT' || navPvpView === 'SUMMARY') {
            setPvpView(navPvpView);
        }

        if (highlightId && pvpChallenges.length > 0) {
            setActiveTab('PVP');
            const isReceived = receivedChallenges.some(c => c.id === highlightId);
            const isSent = sentChallenges.some(c => c.id === highlightId);
            
            if (isReceived) setPvpView('RECEIVED');
            else if (isSent) setPvpView('SENT');
            else setPvpView('SUMMARY');

            setTimeout(() => {
                const el = document.getElementById(`challenge-${highlightId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-black');
                    setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-black'), 2000);
                    window.history.replaceState({}, document.title);
                }
            }, 350);
        }
    }, [location.state?.highlightChallengeId, location.state?.pvpTab, pvpChallenges.length]);

    const handleSyncData = async () => {
        setSyncing(true);
        const result = await databaseService.syncWorldCupData();
        if (result.success) {
            alert('Datos del Mundial sincronizados con la DB exitosamente.');
        } else {
            alert('Error al sincronizar datos. Revisa la consola.');
        }
        setSyncing(false);
    };

    if (!user) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
                <UserIcon size={32} className="text-zinc-600" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Acceso Restringido</h3>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Inicia sesión para ver tu perfil de jugador</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-24 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header / Banner Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1F26] to-[#0F131A] p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
                    {/* Avatar with Status */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-110 opacity-50" />
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] p-1 bg-gradient-to-br from-blue-500 to-indigo-600 relative z-10">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-[2.8rem] border-4 border-[#0F131A] object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-2xl border-4 border-[#0F131A] z-20" />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-1">
                            <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] border border-blue-500/20 mb-2">
                                Jugador Verificado 2026
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">
                                {user.name}
                            </h2>
                            <p className="text-zinc-500 font-bold text-sm tracking-widest">{user.email}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/5 flex items-center gap-3 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <Trophy size={18} className="text-amber-500 relative z-10" />
                                <div className="text-left relative z-10">
                                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Prestigio</div>
                                    <div className="text-lg font-black text-white leading-none">Nivel {user.level}</div>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex items-center gap-3 group relative overflow-hidden cursor-help" onClick={() => setShowRulesModal(true)}>
                                <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <Zap size={18} className="text-emerald-500 relative z-10" />
                                <div className="text-left relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Puntos XP</div>
                                        <Info size={10} className="text-emerald-500/60 mb-1" />
                                    </div>
                                    <div className="text-lg font-black text-white leading-none">{(user.points || 0)} <span className="text-[10px] text-zinc-600 font-bold">/ {((user.level || 1)) * 100}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="max-w-md w-full space-y-2">
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(user.points || 0) % 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                />
                            </div>
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Próximo Nivel: {Math.floor(100 - (user.points % 100))} XP Restantes</p>
                        </div>
                    </div>

                    {/* Quick Config */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleSyncData}
                            disabled={syncing}
                            className="p-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-2xl border border-blue-500/20 transition-all font-black text-[9px] uppercase tracking-widest disabled:opacity-50"
                        >
                            {syncing ? 'Sincronizando...' : 'Sincronizar DB'}
                        </button>
                        <button className="p-4 hover:bg-white/5 text-zinc-500 hover:text-white rounded-2xl border border-transparent hover:border-white/5 transition-all">
                            <Settings size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121820] p-8 rounded-[2.5rem] border border-white/5 group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="p-4 bg-blue-500/10 rounded-2xl">
                            <Wallet className="w-8 h-8 text-blue-500" />
                        </div>
                        <button className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-blue-400">Ver Detalles</button>
                    </div>
                    <div className="space-y-1">
                        <span className="text-4xl font-black text-white tracking-tighter">
                            {user.tokens.toLocaleString()}
                        </span>
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Tokens Disponibles</div>
                    </div>
                </div>

                <div className="bg-[#121820] p-8 rounded-[2.5rem] border border-white/5 group hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl">
                            <Star className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">On Fire</div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-4xl font-black text-white tracking-tighter">
                            {user.streak} Días
                        </span>
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Racha de Juego</div>
                    </div>
                </div>
            </div>

            {/* Advanced Stats Section */}
            <div className="bg-[#121820] p-8 md:p-10 rounded-[3rem] border border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Estadísticas Predictivas</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="text-4xl md:text-5xl font-black text-white">{winRate}%</div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Efectividad Global</div>
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="text-3xl md:text-4xl font-black text-zinc-300">{totalPredictions}</div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Partidos Pronosticados</div>
                    </div>
                    <div className="flex flex-col gap-2 relative z-10 border-l border-white/5 pl-4 md:pl-6">
                        <div className="text-2xl md:text-3xl font-black text-emerald-500">{wonPredictions}</div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Aciertos (Victoria)</div>
                    </div>
                    <div className="flex flex-col gap-2 relative z-10 border-l border-white/5 pl-4 md:pl-6">
                        <div className="text-2xl md:text-3xl font-black text-red-500">{lostPredictions}</div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Fallos (Derrota)</div>
                    </div>
                </div>
            </div>

            {/* Tabs System */}
            <div className="flex items-center gap-8 border-b border-white/5 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                <button
                    onClick={() => setActiveTab('PREDICTIONS')}
                    className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap",
                        activeTab === 'PREDICTIONS' ? "text-blue-500" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    Mis Jugadas
                    {activeTab === 'PREDICTIONS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('SOCIAL')}
                    className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap",
                        activeTab === 'SOCIAL' ? "text-blue-500" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    Actividad
                    {activeTab === 'SOCIAL' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('PERFORMANCE')}
                    className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap",
                        activeTab === 'PERFORMANCE' ? "text-purple-500" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    Analítica
                    {activeTab === 'PERFORMANCE' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('PVP')}
                    className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap",
                        activeTab === 'PVP' ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    Arena PvP
                    {activeTab === 'PVP' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('ACTIVITY')}
                    className={cn(
                        "pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative whitespace-nowrap",
                        activeTab === 'ACTIVITY' ? "text-zinc-300" : "text-zinc-600 hover:text-zinc-400"
                    )}
                >
                    Finanzas
                    {activeTab === 'ACTIVITY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-300 rounded-full" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-6 px-2">
                {activeTab === 'PREDICTIONS' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        {userPredictions.length > 0 ? (
                            userPredictions.map(pred => (
                                <div key={pred.id} className="bg-[#121820] rounded-[2.5rem] p-6 border border-white/5 hover:border-blue-500/20 transition-all flex flex-col gap-6 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                pred.status === 'WON' ? 'bg-emerald-500' : pred.status === 'LOST' ? 'bg-red-500' : 'bg-amber-500'
                                            )} />
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                                {pred.status === 'WON' ? 'Acierto' : pred.status === 'LOST' ? 'Fallido' : 'Pendiente'}
                                            </span>
                                        </div>
                                        <div className="text-[9px] font-bold text-zinc-600 uppercase">
                                            {new Date(pred.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 text-center font-black text-xs text-white uppercase truncate">
                                            {pred.matchDetails?.homeTeam}
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-xl font-black text-white italic">{pred.exactScore?.home}</span>
                                            <span className="text-zinc-700 font-black italic">-</span>
                                            <span className="text-xl font-black text-white italic">{pred.exactScore?.away}</span>
                                        </div>
                                        <div className="flex-1 text-center font-black text-xs text-white uppercase truncate">
                                            {pred.matchDetails?.awayTeam}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/[0.03] flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {pred.matchDetails?.betItemName && (
                                                <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-1.5 animate-pulse">
                                                    <span className="text-[10px]">
                                                        {(() => {
                                                            const item = storeItems.find(i => i.name === pred.matchDetails?.betItemName);
                                                            if (!item) return '🎁';
                                                            const name = item.name.toLowerCase();
                                                            if (name.includes('fernet')) return '🥃';
                                                            if (name.includes('cerveza')) return '🍺';
                                                            if (name.includes('asado')) return '🥩';
                                                            if (name.includes('pizza')) return '🍕';
                                                            if (name.includes('coca')) return '🥤';
                                                            return '🎁';
                                                        })()}
                                                    </span>
                                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-tight">{pred.matchDetails.betItemName}</span>
                                                </div>
                                            )}
                                            <div className="text-[9px] font-bold text-zinc-500 uppercase">Inversión: {pred.stake} TKNS</div>
                                        </div>
                                        <div className={cn(
                                            "font-black tracking-tighter",
                                            pred.potentialReturn > 0 ? 'text-emerald-500' : 'text-zinc-700'
                                        )}>
                                            {pred.status === 'WON' ? `+${pred.potentialReturn}` : pred.status === 'LOST' ? '-' + pred.stake : '---'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-zinc-700 bg-white/2 rounded-[3.5rem] border border-dashed border-white/5 font-black uppercase text-xs tracking-widest italic">
                                Aún no has realizado ninguna jugada
                            </div>
                        )}
                    </div>
                ) : activeTab === 'ACTIVITY' ? (
                    <div className="space-y-3 animate-in fade-in duration-500">
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <div key={tx.id} className="bg-[#121820]/40 hover:bg-[#121820] transition-all rounded-3xl p-5 border border-white/[0.03] flex justify-between items-center group">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-lg",
                                            tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        )}>
                                            {tx.amount > 0 ? <ChevronRight className="rotate-180" size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-xs uppercase tracking-widest">{tx.description}</p>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight mt-1">{new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-black tracking-tighter",
                                        tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'
                                    )}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 text-zinc-700 bg-[#121820]/20 rounded-[3rem] border border-dashed border-white/5 font-black uppercase text-xs tracking-widest">
                                No se registran transacciones recientes
                            </div>
                        )}
                    </div>
                ) : activeTab === 'PERFORMANCE' ? (
                    <PerformanceStats transactions={transactions} predictions={userPredictions} />
                ) : activeTab === 'SOCIAL' ? (
                    <div className="max-w-xl mx-auto py-4">
                        <ActivityFeed listType="FOLLOWING" />
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {pvpView !== 'SUMMARY' && (
                            <div className="flex items-center gap-3 px-2 mb-2">
                                <button 
                                    onClick={() => setPvpView('SUMMARY')}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                                >
                                    <ChevronRight className="rotate-180 w-5 h-5" />
                                </button>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                    {pvpView === 'RECEIVED' ? 'Desafíos Recibidos' : 'Desafíos Realizados'}
                                </h3>
                                <span className="ml-auto bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-zinc-400">
                                    {(pvpView === 'RECEIVED' ? receivedChallenges : sentChallenges).length} Total
                                </span>
                            </div>
                        )}

                        {pvpView === 'SUMMARY' ? (
                            <>
                                {/* Sección Recibidos */}
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => receivedChallenges.length > 0 && setPvpView('RECEIVED')}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3 bg-[#121820] border border-white/5 rounded-2xl transition-colors",
                                            receivedChallenges.length > 0 ? "cursor-pointer hover:bg-white/5 group" : ""
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                <ChevronRight className="rotate-180 text-blue-500 w-4 h-4" />
                                            </div>
                                            <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Desafíos Recibidos</h3>
                                            {receivedChallenges.filter(c => c.status === 'PENDING').length > 0 && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            )}
                                        </div>
                                        {receivedChallenges.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase">Ver {receivedChallenges.length}</span>
                                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                                            </div>
                                        )}
                                    </div>

                                    {receivedChallenges.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {receivedChallenges.slice(0, 5).map(c => (
                                                <ChallengeCard key={c.id} challenge={c} user={user} acceptPvpChallenge={acceptPvpChallenge} rejectPvpChallenge={rejectPvpChallenge} cancelPvpChallenge={cancelPvpChallenge} resolvePvpChallenge={resolvePvpChallenge} navigate={navigate} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-zinc-700 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/5 font-black uppercase text-[10px] tracking-widest italic">
                                            No has recibido ningún desafío aún
                                        </div>
                                    )}
                                </div>

                                {/* Sección Realizados */}
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => sentChallenges.length > 0 && setPvpView('SENT')}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3 bg-[#121820] border border-white/5 rounded-2xl transition-colors",
                                            sentChallenges.length > 0 ? "cursor-pointer hover:bg-white/5 group" : ""
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <ChevronRight className="text-emerald-500 w-4 h-4" />
                                            </div>
                                            <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Desafíos Realizados</h3>
                                        </div>
                                        {sentChallenges.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase">Ver {sentChallenges.length}</span>
                                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                                            </div>
                                        )}
                                    </div>

                                    {sentChallenges.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {sentChallenges.slice(0, 5).map(c => (
                                                <ChallengeCard key={c.id} challenge={c} user={user} acceptPvpChallenge={acceptPvpChallenge} rejectPvpChallenge={rejectPvpChallenge} cancelPvpChallenge={cancelPvpChallenge} resolvePvpChallenge={resolvePvpChallenge} navigate={navigate} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-zinc-700 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/5 font-black uppercase text-[10px] tracking-widest italic">
                                            No has desafiado a nadie aún
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(pvpView === 'RECEIVED' ? receivedChallenges : sentChallenges).map(c => (
                                    <ChallengeCard key={c.id} challenge={c} user={user} acceptPvpChallenge={acceptPvpChallenge} rejectPvpChallenge={rejectPvpChallenge} cancelPvpChallenge={cancelPvpChallenge} resolvePvpChallenge={resolvePvpChallenge} navigate={navigate} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Logout Action */}
            <div className="pt-6 flex justify-center">
                <button
                    onClick={signOut}
                    className="group flex items-center gap-3 text-[10px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-[0.3em] transition-all py-4 px-8 rounded-full hover:bg-red-500/5"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Finalizar Sesión
                </button>
            </div>
            {/* Rules Modal */}
            <PointsRulesModal 
                isOpen={showRulesModal} 
                onClose={() => setShowRulesModal(false)} 
            />
        </div>
    );
};
