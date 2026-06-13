import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Coins, Swords, Play, Square, Activity } from 'lucide-react';
import { footballApiService } from '../../services/footballApiService';

export const AdminDashboard: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        newUsers: 0,
        totalTokensPlayed: 0,
        totalChallenges: 0
    });
    const [loading, setLoading] = useState(true);
    const [isAutoSyncing, setIsAutoSyncing] = useState(false);
    const [syncLogs, setSyncLogs] = useState<string[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const performSync = async () => {
            try {
                // Find eligible matches
                const { data: matches } = await supabase
                    .from('matches')
                    .select('*')
                    .in('status', ['UPCOMING', 'SCHEDULED', 'NS', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'INT']);

                if (!matches || matches.length === 0) return;

                const now = Date.now();
                const eligibleMatches = matches.filter(m => {
                    if (!m.start_time) return false;
                    const matchTime = new Date(m.start_time).getTime();
                    const elapsedMins = (now - matchTime) / 60000;
                    // Match started between -10 and 4320 minutes ago (up to 72 horas atrás)
                    // Esto permite atrapar partidos de ayer que quedaron "colgados" en UPCOMING
                    return elapsedMins >= -10 && elapsedMins <= 4320; 
                });

                if (eligibleMatches.length === 0) {
                    setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] No hay partidos elegibles en este momento.`, ...prev].slice(0, 50));
                    return;
                }

                const newLogs: string[] = [];

                for (const match of eligibleMatches) {
                    const apiId = match.api_id || match.id;
                    const { success, data } = await footballApiService.getMatchDetails(apiId.toString());
                    
                    if (success && data && data.fixture) {
                        const shortStatus = data.fixture.status.short;
                        const homeScore = data.goals?.home;
                        const awayScore = data.goals?.away;
                        
                        let newStatus = match.status;
                        if (['FT', 'AET', 'PEN'].includes(shortStatus)) newStatus = 'FINISHED';
                        else if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT'].includes(shortStatus)) newStatus = 'LIVE';
                        else if (['CANC', 'PST', 'ABD'].includes(shortStatus)) newStatus = 'CANCELLED';

                        const updates: any = {};
                        let changed = false;

                        if (newStatus !== match.status) {
                            updates.status = newStatus;
                            changed = true;
                        }

                        if (homeScore !== null && homeScore !== undefined && homeScore !== match.home_score) {
                            updates.home_score = homeScore;
                            changed = true;
                        }

                        if (awayScore !== null && awayScore !== undefined && awayScore !== match.away_score) {
                            updates.away_score = awayScore;
                            changed = true;
                        }

                        if (changed) {
                            updates.updated_at = new Date().toISOString();
                            await supabase.from('matches').update(updates).eq('id', match.id);
                            newLogs.unshift(`[${new Date().toLocaleTimeString()}] Sincronizado ${match.home_team} vs ${match.away_team} -> ${newStatus} (${homeScore}-${awayScore})`);
                        }
                    }
                }
                
                if (newLogs.length > 0) {
                    setSyncLogs(prev => [...newLogs, ...prev].slice(0, 50));
                } else {
                    setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] Escaneo completado. Sin cambios.`, ...prev].slice(0, 50));
                }

            } catch (err: any) {
                setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] Error: ${err.message}`, ...prev].slice(0, 50));
            }
        };

        if (isAutoSyncing) {
            performSync();
            interval = setInterval(performSync, 120000);
            setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] Auto-Sync INICIADO.`, ...prev].slice(0, 50));
        } else {
            if (syncLogs.length > 0 && !syncLogs[0].includes('DETENIDO')) {
                setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] Auto-Sync DETENIDO.`, ...prev].slice(0, 50));
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAutoSyncing]);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            navigate('/');
        }
        if (user && user.role === 'ADMIN') {
            fetchStats();
        }
    }, [user, navigate]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // 1. Total users
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 2. New users (last 24h)
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count: newUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', yesterday);

            // 3. Tokens played (summing predictions stake + pvp_challenges amount)
            // Fetching a limited amount to avoid overloading if there are too many rows.
            // Ideally this should be an RPC, but we'll do it client-side for simplicity.
            let totalTokens = 0;
            const { data: predictions } = await supabase
                .from('predictions')
                .select('stake');
            
            if (predictions) {
                totalTokens += predictions.reduce((sum, p) => sum + (p.stake || 0), 0);
            }

            const { data: challengesData } = await supabase
                .from('pvp_challenges')
                .select('amount');

            if (challengesData) {
                totalTokens += challengesData.reduce((sum, c) => sum + (c.amount || 0), 0);
            }

            // 4. Total challenges created
            const { count: totalChallenges } = await supabase
                .from('pvp_challenges')
                .select('*', { count: 'exact', head: true });

            setStats({
                totalUsers: totalUsers || 0,
                newUsers: newUsers || 0,
                totalTokensPlayed: totalTokens,
                totalChallenges: totalChallenges || 0
            });

        } catch (error) {
            console.error('Error fetching stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'ADMIN') return <div className="text-white p-10 text-center">Acceso Denegado</div>;

    return (
        <div className="text-gray-100 min-h-screen flex flex-col bg-[#020c1b] font-['Montserrat']">
            <header className="bg-[#0a1128] border-b border-[#1e293b] py-4 px-6 sticky top-0 z-40 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black tracking-tight text-white font-['Orbitron']">JUGATELA <span className="text-[#00d2ff]">SPORTS</span></h1>
                        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
                <div className="bg-[#0a1128]/80 p-5 rounded-2xl border border-[#1e293b] flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Estadísticas Globales</h2>
                        <p className="text-xs text-gray-400">Resumen de actividad en la plataforma</p>
                    </div>
                    <button 
                        onClick={fetchStats}
                        className="bg-[#1e293b] hover:bg-[#00d2ff] text-white hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat Card 1 */}
                    <div className="bg-[#161b22] rounded-2xl border border-gray-800/80 p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400 uppercase">Usuarios Totales</span>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white">
                            {loading ? '...' : stats.totalUsers}
                        </h3>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-[#161b22] rounded-2xl border border-gray-800/80 p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400 uppercase">Nuevos (24h)</span>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <UserPlus className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white">
                            {loading ? '...' : stats.newUsers}
                        </h3>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-[#161b22] rounded-2xl border border-gray-800/80 p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400 uppercase">Tokens Jugados</span>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Coins className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white">
                            {loading ? '...' : stats.totalTokensPlayed.toLocaleString()}
                        </h3>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-[#161b22] rounded-2xl border border-gray-800/80 p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-400 uppercase">Desafíos Armados</span>
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Swords className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white">
                            {loading ? '...' : stats.totalChallenges}
                        </h3>
                    </div>
                </div>

                {/* Auto-Sync Panel */}
                <div className="bg-[#161b22] rounded-2xl border border-gray-800/80 p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                                <Activity className={`w-5 h-5 ${isAutoSyncing ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
                                Sincronizador de Partidos en Vivo (Auto-Sync)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Escanea partidos en curso cada 2 minutos y actualiza goles y estado en Supabase automáticamente.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAutoSyncing(!isAutoSyncing)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                isAutoSyncing 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                            }`}
                        >
                            {isAutoSyncing ? (
                                <>
                                    <Square className="w-4 h-4 fill-current" />
                                    Detener Auto-Sync
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    Iniciar Auto-Sync
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-black/50 border border-white/5 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1">
                        {syncLogs.length === 0 ? (
                            <div className="text-gray-600 flex h-full items-center justify-center italic">
                                Esperando para iniciar el sincronizador...
                            </div>
                        ) : (
                            syncLogs.map((log, i) => (
                                <div key={i} className={`${log.includes('Error') ? 'text-red-400' : log.includes('Sincronizado') ? 'text-green-400' : ''}`}>
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
