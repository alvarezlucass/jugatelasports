import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Coins, Swords } from 'lucide-react';

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
            </main>
        </div>
    );
};
