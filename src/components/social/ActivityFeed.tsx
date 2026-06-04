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
        const { type, content, profiles } = activity;
        const name = profiles?.nickname || profiles?.first_name || 'Alguien';
        const displayMatch = content.matchDescription || resolveMatchName(content.matchId);

        switch (type) {
            case 'MATCH_WON':
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> ganó <span className="text-amber-500 font-black">+{content.points} PKTS</span> en el partido <span className="text-white font-bold italic">{displayMatch}</span>.
                    </p>
                );
            case 'PVP_CHALLENGE':
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> lanzó un <span className="text-red-500 font-black">RETO PVP</span> {content.opponentName ? <span>a <span className="text-white font-bold">{content.opponentName}</span></span> : ''} para <span className="text-white font-bold italic">{content.matchDescription}</span>.
                    </p>
                );
            case 'LEVEL_UP':
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> alcanzó el <span className="text-primary font-black">NIVEL {content.level}</span>.
                    </p>
                );
            case 'PREDICTION_MADE': {
                if (content.opponentName && content.homeTeam) {
                    const resultText = content.homeScore > content.awayScore ? `victoria de ${content.homeTeam}` 
                        : content.awayScore > content.homeScore ? `victoria de ${content.awayTeam}` 
                        : 'empate';
                        
                    return (
                        <p className="text-[13px] leading-relaxed text-zinc-400">
                            <span className="font-black text-white uppercase tracking-tight">{name}</span> jugó contra <span className="text-white font-bold">{content.opponentName}</span> pronosticando <span className="text-blue-400 font-bold">{resultText}</span> en <span className="text-white italic">{displayMatch}</span>.
                        </p>
                    );
                }
                
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> armó una jugada para <span className="text-white font-bold italic">{displayMatch}</span>.
                    </p>
                );
            }
            default:
                return <p className="text-[13px] leading-relaxed text-zinc-400">Actividad reciente de <span className="font-black text-white uppercase tracking-tight">{name}</span>.</p>;
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
                    {activities.map((activity) => (
                        <div 
                            key={activity.id}
                            className="group bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.05] border border-white/5 p-5 rounded-3xl transition-all duration-500 hover:scale-[1.01] hover:border-white/10 relative overflow-hidden active:scale-[0.99]"
                        >
                            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white/[0.02] to-transparent" />
                            
                            <div className="flex gap-4 items-center relative z-10">
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-[1.2rem] overflow-hidden border border-white/10 group-hover:border-primary/30 transition-colors shadow-lg">
                                        <img 
                                            src={activity.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`} 
                                            alt="" 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-[#121820] border border-white/10 p-0.5 rounded-full shadow-xl group-hover:scale-110 transition-transform">
                                        {renderActivityIcon(activity)}
                                    </div>
                                </div>
                                
                                <div className="flex-1 space-y-0.5">
                                    {renderActivityContent(activity)}
                                    <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                        <Clock size={10} />
                                        <span>Hace {formatDistanceToNow(new Date(activity.created_at), { locale: es })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
