import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Activity } from 'lucide-react';
import { getLeagueStandings } from '../../lib/leagues';

interface Standing {
    rank: number;
    team: {
        id: number;
        name: string;
        logo: string;
    };
    points: number;
    goalsDiff: number;
    all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: {
            for: number;
            against: number;
        };
    };
    form: string;
    status: string;
}

interface LiveStandingsProps {
    leagueId: number;
    season?: number;
}

export const LiveStandings: React.FC<LiveStandingsProps> = ({ leagueId, season = 2026 }) => {
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSuspended, setIsSuspended] = useState(false);

    const fetchStandings = async (force: boolean = false) => {
        setLoading(true);
        setError(null);
        setIsSuspended(false);
        try {
            const data = await getLeagueStandings(leagueId, season, force);
            if (data && data.suspended) {
                setIsSuspended(true);
                // Check if there's old cached data anyway
                const cached = localStorage.getItem(data.cacheKey);
                if (cached) {
                    const { data: cachedResponse } = JSON.parse(cached);
                    setStandings(cachedResponse.response[0].league.standings[0]);
                }
            } else if (data && data.response && data.response[0]) {
                setStandings(data.response[0].league.standings[0]);
            } else {
                setError('No se pudieron cargar las posiciones');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStandings();
    }, [leagueId, season]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-400 animate-pulse">Cargando tabla de posiciones...</p>
            </div>
        );
    }

    if (isSuspended && standings.length === 0) {
        return (
            <div className="p-12 text-center bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <Trophy className="w-12 h-12 text-blue-500/50 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white">Modo Bajo Demanda</h3>
                <p className="text-gray-400 mt-2 mb-6">Las llamadas automáticas están suspendidas para ahorrar créditos.</p>
                <button
                    onClick={() => fetchStandings(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                >
                    Cargar Clasificación
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Pos</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Equipo</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">PJ</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">G</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">E</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">P</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">DG</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Pts</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Forma</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {standings.map((team, index) => (
                            <motion.tr
                                key={team.team.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-white/5 transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold
                    ${team.rank <= 4 ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'}
                  `}>
                                        {team.rank}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <img src={team.team.logo} alt={team.team.name} className="w-8 h-8 object-contain" />
                                        <span className="font-medium text-gray-200 group-hover:text-white transition-colors">
                                            {team.team.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-400">{team.all.played}</td>
                                <td className="px-6 py-4 text-center text-gray-400">{team.all.win}</td>
                                <td className="px-6 py-4 text-center text-gray-400">{team.all.draw}</td>
                                <td className="px-6 py-4 text-center text-gray-400">{team.all.lose}</td>
                                <td className="px-6 py-4 text-center text-gray-400">
                                    <span className={team.goalsDiff > 0 ? 'text-green-400' : team.goalsDiff < 0 ? 'text-red-400' : ''}>
                                        {team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="font-bold text-white">{team.points}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-1">
                                        {team.form?.split('').map((r, i) => (
                                            <span
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${r === 'W' ? 'bg-green-500' : r === 'L' ? 'bg-red-500' : 'bg-gray-500'
                                                    }`}
                                                title={r === 'W' ? 'Ganado' : r === 'L' ? 'Perdido' : 'Empate'}
                                            />
                                        ))}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                <button
                    onClick={() => fetchStandings(true)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
                >
                    <Activity className="w-3 h-3" />
                    <span>ACTUALIZAR DATOS</span>
                </button>
            </div>
        </motion.div>
    );
};
