import React, { useEffect, useState } from 'react';
import { databaseService } from '../../services/databaseService';
import { useUser } from '../../contexts/UserContext';
import { Trophy, Swords, Zap, MessageSquare, TrendingUp, Users, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { WORLD_CUP_GROUP_MATCHES } from '../../data/worldCupPersistence';
import { supabase } from '../../lib/supabase';

interface Activity {
    id: string;
    user_id: string;
    type: 'PREDICTION_MADE' | 'MATCH_WON' | 'LEVEL_UP' | 'PVP_CHALLENGE' | 'LOGIN_STREAK';
    content: any;
    created_at: string;
    profiles: {
        nickname: string;
        avatar_url: string;
        first_name: string;
    };
}

export const ActivityFeed: React.FC<{ listType?: 'GLOBAL' | 'FOLLOWING' }> = ({ listType = 'GLOBAL' }) => {
    const { user } = useUser();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [dynamicMatchNames, setDynamicMatchNames] = useState<Record<string, string>>({});

    const loadActivities = async () => {
        setLoading(true);
        const { data, error } = await databaseService.fetchActivities(user?.id, listType);
        if (!error && data) {
            const acts = data as Activity[];
            setActivities(acts);
            
            // Extract unique match IDs that might need resolving
            const matchIds = new Set<string>();
            acts.forEach(a => {
                if (a.content?.matchId && !a.content.matchDescription && !WORLD_CUP_GROUP_MATCHES.some(m => m.id === a.content.matchId)) {
                    matchIds.add(a.content.matchId);
                }
            });

            if (matchIds.size > 0) {
                const { data: matches } = await supabase
                    .from('matches')
                    .select('id, home_team, away_team')
                    .in('id', Array.from(matchIds));
                
                if (matches) {
                    const names: Record<string, string> = {};
                    matches.forEach(m => {
                        const hTeam = typeof m.home_team === 'string' ? m.home_team : m.home_team?.name || 'Local';
                        const aTeam = typeof m.away_team === 'string' ? m.away_team : m.away_team?.name || 'Visita';
                        names[m.id] = `${hTeam} vs ${aTeam}`;
                    });
                    setDynamicMatchNames(prev => ({ ...prev, ...names }));
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadActivities();
        
        // Polling cada 30 segundos o suscripción real-time en el futuro
        const interval = setInterval(loadActivities, 30000);
        return () => clearInterval(interval);
    }, [user?.id, listType]);

    const renderActivityIcon = (activity: Activity) => {
        const { type, content } = activity;
        
        if ((type === 'PREDICTION_MADE' || type === 'PVP_CHALLENGE') && content.opponentName) {
            return (
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-[#1A1F26]">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${content.opponentId || content.opponentName}`} 
                        alt="Opponent" 
                        className="w-full h-full object-cover" 
                    />
                </div>
            );
        }

        switch (type) {
            case 'MATCH_WON': return <Trophy className="w-4 h-4 text-amber-500" />;
            case 'PVP_CHALLENGE': return <Swords className="w-4 h-4 text-red-500" />;
            case 'LEVEL_UP': return <Zap className="w-4 h-4 text-blue-500" />;
            case 'PREDICTION_MADE': return <TrendingUp className="w-4 h-4 text-green-500" />;
            default: return <MessageSquare className="w-4 h-4 text-zinc-400" />;
        }
    };

    const resolveMatchName = (matchId: string) => {
        if (!matchId) return 'Partido Desconocido';
        if (dynamicMatchNames[matchId]) return dynamicMatchNames[matchId];
        const match = WORLD_CUP_GROUP_MATCHES.find(m => m.id === matchId);
        if (match) {
            const hTeam = typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam?.name;
            const aTeam = typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam?.name;
            return `${hTeam} vs ${aTeam}`;
        }
        return matchId;
    };

    const renderActivityContent = (activity: Activity) => {
        const { type, content } = activity;

        switch (type) {
            case 'MATCH_WON':
                return (
                    <p className="text-xs md:text-[13px] leading-relaxed text-zinc-400">
                        Acertó la predicción y ganó <span className="text-amber-500 font-black">+{content.points} PKTS</span>.
                    </p>
                );
            case 'PVP_CHALLENGE':
                return (
                    <p className="text-xs md:text-[13px] leading-relaxed text-zinc-400">
                        Lanzó un <span className="text-red-500 font-black">RETO PVP</span> {content.opponentName ? <span>contra <span className="text-white font-bold">{content.opponentName}</span></span> : 'abierto'}.
                    </p>
                );
            case 'LEVEL_UP':
                return (
                    <p className="text-xs md:text-[13px] leading-relaxed text-zinc-400">
                        Alcanzó el <span className="text-primary font-black">NIVEL {content.level}</span>.
                    </p>
                );
            case 'PREDICTION_MADE': {
                if (content.opponentName && content.homeTeam) {
                    const resultText = content.homeScore > content.awayScore ? `victoria de ${content.homeTeam}` 
                        : content.awayScore > content.homeScore ? `victoria de ${content.awayTeam}` 
                        : 'empate';
                        
                    return (
                        <p className="text-xs md:text-[13px] leading-relaxed text-zinc-400">
                            Aceptó el reto de <span className="text-white font-bold">{content.opponentName}</span> pronosticando <span className="text-blue-400 font-bold">{resultText}</span>.
                        </p>
                    );
                }
                
                return (
                    <p className="text-xs md:text-[13px] leading-relaxed text-zinc-400">
                        Armó una jugada para este partido.
                    </p>
                );
            }
            default:
                return <p className="text-xs md:text-[13px] leading-relaxed text-zinc-400">Interactuó con este evento.</p>;
        }
    };

    if (loading && activities.length === 0) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Actividad Reciente
                </h3>
                <button 
                    onClick={loadActivities}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tighter"
                >
                    Actualizar
                </button>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No hay actividad aún</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => {
                        const match = activity.content?.matchId ? WORLD_CUP_GROUP_MATCHES.find(m => m.id === activity.content.matchId) : null;
                        const matchName = match ? `${match.homeTeam} vs ${match.awayTeam}` : resolveMatchName(activity.content?.matchId);
                        
                        return (
                            <div 
                                key={activity.id}
                                className="group bg-[#0F131A]/60 backdrop-blur-md border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:border-white/10 hover:bg-white/5 relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]"
                            >
                                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none" />
                                
                                <div className="flex flex-col gap-3 relative z-10">
                                    {/* Cabecera del Evento (Protagonista) */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {renderActivityIcon(activity)}
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                                {activity.type === 'MATCH_WON' ? 'Recompensa' : activity.type === 'PVP_CHALLENGE' ? 'Reto PVP' : activity.type === 'PREDICTION_MADE' ? 'Predicción' : 'Nivel'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                            <Clock size={10} />
                                            <span>Hace {formatDistanceToNow(new Date(activity.created_at), { locale: es })}</span>
                                        </div>
                                    </div>

                                    {/* Contenido (El "Qué") */}
                                    <div className="flex-1">
                                        {matchName && activity.type !== 'LEVEL_UP' ? (
                                            <div className="text-sm md:text-base font-black text-white uppercase tracking-tight mb-1">
                                                {matchName}
                                            </div>
                                        ) : null}
                                        {renderActivityContent(activity)}
                                    </div>

                                    {/* Usuario (El "Quién", ahora secundario) */}
                                    <div className="flex items-center gap-2 mt-1 pt-3 border-t border-white/5">
                                        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 opacity-80">
                                            <img 
                                                src={activity.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`} 
                                                alt="" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                            {activity.profiles?.nickname || activity.profiles?.first_name || 'Alguien'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
