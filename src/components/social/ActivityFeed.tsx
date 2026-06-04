import React, { useEffect, useState } from 'react';
import { databaseService } from '../../services/databaseService';
import { useUser } from '../../contexts/UserContext';
import { Trophy, Swords, Zap, MessageSquare, TrendingUp, Users, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

    const loadActivities = async () => {
        setLoading(true);
        const { data, error } = await databaseService.fetchActivities(user?.id, listType);
        if (!error && data) {
            setActivities(data as Activity[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadActivities();
        
        // Polling cada 30 segundos o suscripción real-time en el futuro
        const interval = setInterval(loadActivities, 30000);
        return () => clearInterval(interval);
    }, [user?.id, listType]);

    const renderActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'MATCH_WON': return <Trophy className="w-4 h-4 text-amber-500" />;
            case 'PVP_CHALLENGE': return <Swords className="w-4 h-4 text-red-500" />;
            case 'LEVEL_UP': return <Zap className="w-4 h-4 text-blue-500" />;
            case 'PREDICTION_MADE': return <TrendingUp className="w-4 h-4 text-green-500" />;
            default: return <MessageSquare className="w-4 h-4 text-zinc-400" />;
        }
    };

    const renderActivityContent = (activity: Activity) => {
        const { type, content, profiles } = activity;
        const name = profiles?.nickname || profiles?.first_name || 'Alguien';

        switch (type) {
            case 'MATCH_WON':
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> ganó <span className="text-amber-500 font-black">+{content.points} PKTS</span> en el partido <span className="text-white font-bold italic">{content.matchDescription || content.matchId}</span>.
                    </p>
                );
            case 'PVP_CHALLENGE':
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> lanzó un <span className="text-red-500 font-black">RETO PVP</span> para <span className="text-white font-bold italic">{content.matchDescription}</span>.
                    </p>
                );
            case 'LEVEL_UP':
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> alcanzó el <span className="text-primary font-black">NIVEL {content.level}</span>.
                    </p>
                );
            case 'PREDICTION_MADE':
                return (
                    <p className="text-[13px] leading-relaxed text-zinc-400">
                        <span className="font-black text-white uppercase tracking-tight">{name}</span> armó una jugada para <span className="text-white font-bold italic">{content.matchDescription || content.matchId}</span>.
                    </p>
                );
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
                                    <div className="absolute -bottom-1 -right-1 bg-[#121820] border border-white/10 p-1.5 rounded-xl shadow-xl group-hover:scale-110 transition-transform">
                                        {renderActivityIcon(activity.type)}
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
