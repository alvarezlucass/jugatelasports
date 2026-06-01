import { Trophy, Target, CircleDot, Flag, Zap, Star, PlayCircle, Globe, ArrowRight, Shield } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityFeed } from '../components/social/ActivityFeed';
import { motion } from 'framer-motion';
export const Home: React.FC = () => {
    const { user } = useUser();
    const [feedType, setFeedType] = useState<'GLOBAL' | 'FOLLOWING'>('GLOBAL');

    const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
    const [userPredictionCount, setUserPredictionCount] = useState<number>(0);
    const [loadingWidgets, setLoadingWidgets] = useState<boolean>(true);

    const getStartOfWeek = () => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(today.setDate(diff));
        start.setHours(0, 0, 0, 0);
        return start.toISOString();
    };

    const formatWidgetDate = (timeStr: string) => {
        if (!timeStr) return '';
        try {
            const date = new Date(timeStr);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short'
            }).toUpperCase();
        } catch (e) { return ''; }
    };

    useEffect(() => {
        const fetchWidgetData = async () => {
            try {
                // 1. Fetch next 3 upcoming future matches (after current time)
                const nowIso = new Date().toISOString();
                let { data: matches, error: matchesError } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('status', 'UPCOMING')
                    .gte('start_time', nowIso)
                    .order('start_time', { ascending: true })
                    .limit(3);

                // Fallback: If no future upcoming matches are found, grab the closest upcoming matches (even if start_time is in the past)
                if ((!matches || matches.length === 0) && !matchesError) {
                    const { data: fallbackMatches, error: fallbackError } = await supabase
                        .from('matches')
                        .select('*')
                        .eq('status', 'UPCOMING')
                        .order('start_time', { ascending: false })
                        .limit(3);
                    if (!fallbackError && fallbackMatches) {
                        matches = fallbackMatches.reverse();
                    }
                }

                if (!matchesError && matches) {
                    setUpcomingMatches(matches);
                }

                // 2. Fetch user weekly predictions count
                if (user?.id) {
                    const startOfWeek = getStartOfWeek();
                    const { count, error: countError } = await supabase
                        .from('predictions')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .gte('created_at', startOfWeek);

                    if (!countError && count !== null) {
                        setUserPredictionCount(count);
                    } else {
                        // Fallback
                        const { data: allPreds } = await supabase
                            .from('predictions')
                            .select('match_id')
                            .eq('user_id', user.id);
                        if (allPreds) {
                            setUserPredictionCount(allPreds.length);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching widget data:", err);
            } finally {
                setLoadingWidgets(false);
            }
        };

        fetchWidgetData();
    }, [user?.id]);

    const categories = [
        { 
            id: 'worldcup', 
            name: 'Mundial 2026', 
            subtitle: 'Fase de Grupos', 
            status: 'live', 
            bgGradient: 'from-blue-600/90 to-indigo-900/90', 
            image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800",
            icon: Trophy, 
            link: '/worldcup' 
        },
        { 
            id: 'lpf', 
            name: 'Ligas Argentinas', 
            subtitle: 'LPF, Copa Argentina y Nac.', 
            status: 'live', 
            bgGradient: 'from-sky-600/90 to-blue-900/90', 
            image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
            icon: Shield, 
            link: '/leagues?region=argentina' 
        },
        { 
            id: 'europe', 
            name: 'Ligas Europeas', 
            subtitle: 'Champions, Premier y LaLiga', 
            status: 'live', 
            bgGradient: 'from-indigo-800/90 to-blue-950/90', 
            image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
            icon: Trophy, 
            link: '/leagues?region=europe' 
        },
        { 
            id: 'america', 
            name: 'Ligas Americanas', 
            subtitle: 'Libertadores, Brasileirão y más', 
            status: 'live', 
            bgGradient: 'from-amber-600/90 to-yellow-950/90', 
            image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=800",
            icon: Globe, 
            link: '/leagues?region=america' 
        },
        { 
            id: 'nba', 
            name: 'Básquetbol', 
            subtitle: 'NBA & WNBA', 
            status: 'teaser', 
            bgGradient: 'from-orange-600/90 to-red-900/90', 
            image: "https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&q=80&w=800",
            icon: Target, 
            link: '/basketball' 
        },
        { 
            id: 'tennis', 
            name: 'Grand Slams', 
            subtitle: 'Circuitos ATP/WTA', 
            status: 'teaser', 
            bgGradient: 'from-emerald-600/90 to-teal-900/90', 
            image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800",
            icon: CircleDot, 
            link: '/tennis' 
        },
        { 
            id: 'f1', 
            name: 'Fórmula 1', 
            subtitle: 'Campeonato Mundial', 
            status: 'teaser', 
            bgGradient: 'from-rose-600/90 to-zinc-900/90', 
            image: "https://images.unsplash.com/photo-1510006721543-b2daecf2b1d6?auto=format&fit=crop&q=80&w=800",
            icon: Flag, 
            link: '/f1' 
        }
    ];

    return (
        <div className="flex flex-col min-h-screen pb-24 space-y-8 animate-in fade-in duration-700">

            {/* Main Banners Section */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F131A] border border-white/5 p-8 md:p-12 lg:w-2/3 flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black text-primary border border-primary/20 uppercase tracking-[0.2em]">
                            <Zap size={12} className="fill-primary" />
                            Plataforma Multideportiva
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                            El Universo <span className="text-primary">Jugatela</span>
                        </h1>
                        <p className="text-zinc-400 text-base md:text-lg font-bold leading-relaxed">
                            Predice resultados, compite en rankings globales y demuestra tu conocimiento en las mejores ligas de fútbol, básquet, tenis y más.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/predictions" className="px-6 py-3 bg-primary text-white font-black rounded-full text-xs uppercase tracking-wider hover:bg-primary-hover transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--primary),0.3)] flex items-center gap-2">
                                <PlayCircle size={16} />
                                Armar Jugadas
                            </Link>
                            {!user && (
                                <Link to="/register" className="px-6 py-3 bg-white/5 text-zinc-400 font-black rounded-full text-xs border border-white/10 uppercase tracking-wider hover:bg-white/10 transition-all">
                                    Registrarse
                                </Link>
                            )}
                        </div>
                    </div>
                    <motion.div 
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [12, 15, 12]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute -bottom-24 -right-24 pointer-events-none hidden xl:block opacity-30 group-hover:opacity-50 transition-opacity"
                    >
                        <Globe size={400} className="text-white/10" />
                    </motion.div>
                </div>

                {/* Teaser Ligas Europeas */}
                <Link to="/leagues?region=europe" className="group lg:w-1/3 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900/50 to-blue-900/20 border border-blue-500/20 p-8 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-500 active:scale-[0.99] cursor-pointer">
                    <div className="space-y-4 z-10 relative">
                        <div className="inline-flex px-3 py-1 rounded-full bg-white/10 text-[8px] font-black text-white uppercase tracking-[0.2em]"> Expandiendo Fronteras </div>
                        <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                            Ligas <br /> Europeas
                        </h3>
                        <p className="text-blue-200/60 font-medium text-xs line-clamp-2">
                            La Liga, Premier League, Champions y un ecosistema total de fútbol.
                        </p>
                    </div>
                    
                    <div className="flex gap-3 opacity-70 z-10 relative group-hover:opacity-100 transition-opacity duration-500 py-4">
                        <Star size={24} className="text-amber-400 fill-amber-400 animate-pulse delay-75" />
                        <Star size={24} className="text-amber-400 fill-amber-400 animate-pulse delay-150" />
                        <Star size={32} className="text-amber-400 fill-amber-400 animate-pulse delay-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    </div>

                    <div className="inline-flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest group-hover:text-blue-300 transition-colors z-10">
                        Descubre más <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Background abstract shape */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
                </Link>
            </div>
            {/* Categories Storefront */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Categorías Disponibles</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={cat.link}
                            onClick={(e) => cat.status === 'soon' && e.preventDefault()}
                            className={cn(
                                "group block relative overflow-hidden rounded-[2.5rem] p-8 border hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 min-h-[280px] flex flex-col justify-between shadow-xl",
                                cat.status === 'live' || cat.status === 'teaser'
                                    ? "border-white/20 hover:border-white/40 ring-0 hover:ring-1 hover:ring-white/20 cursor-pointer"
                                    : "border-white/10 opacity-90 cursor-default"
                            )}
                        >
                            {/* Background Image & Overlay */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${cat.image})` }}
                            />
                            <div className={cn("absolute inset-0 bg-gradient-to-br mix-blend-multiply transition-opacity duration-300", cat.bgGradient)} />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                            <div className="relative z-10 flex justify-between items-start">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                                    cat.status === 'live' || cat.status === 'teaser' ? "bg-white/10 text-white" : "bg-white/5 text-zinc-500"
                                )}>
                                    <cat.icon size={28} />
                                </div>

                                {cat.status === 'live' ? (
                                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)] animate-pulse">
                                        En Juego
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                        Próximamente
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10 space-y-2 mt-auto">
                                <h3 className={cn(
                                    "text-3xl font-black uppercase tracking-tighter leading-none mt-12",
                                    cat.status === 'live' || cat.status === 'teaser' ? "text-white" : "text-zinc-500 group-hover:text-zinc-400 transition-colors"
                                )}>
                                    {cat.name}
                                </h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                    {cat.subtitle}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Community Activity Feed */}
            <div className="pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Comunidad Jugatela</h2>
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">Lo que está pasando ahora</p>
                    </div>
                    
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-start">
                        <button 
                            onClick={() => setFeedType('GLOBAL')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                feedType === 'GLOBAL' ? "bg-primary text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Global
                        </button>
                        <button 
                            onClick={() => setFeedType('FOLLOWING')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                feedType === 'FOLLOWING' ? "bg-primary text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Siguiendo
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ActivityFeed listType={feedType} />
                    </div>
                    
                    <div className="space-y-6">
                        {/* Weekly Goal Card */}
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-500/20 p-8">
                            <h4 className="text-lg font-black text-amber-500 uppercase tracking-tighter mb-2">Desafío Semanal</h4>
                            <p className="text-amber-200/60 text-xs font-bold leading-relaxed mb-4">
                                Haz 5 predicciones esta semana para ganar un multiplicador X2.
                            </p>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-amber-500 h-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (userPredictionCount / 5) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-black text-amber-500/50 uppercase tracking-widest">
                                <span>{userPredictionCount} / 5</span>
                                <span>{Math.min(100, Math.round((userPredictionCount / 5) * 100))}%</span>
                            </div>
                        </div>

                        {/* Top Upcoming Matches */}
                        {upcomingMatches.length > 0 && (
                            <div className="rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-6 space-y-5">
                                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] text-center border-b border-white/5 pb-3">Próximos Partidos</h4>
                                <div className="space-y-4">
                                   {upcomingMatches.map((match) => (
                                       <Link 
                                           key={match.id}
                                           to={`/predictions/match/${match.id}`}
                                           className="block p-5 bg-gradient-to-br from-[#121620] to-[#0A0D14] hover:from-blue-950/20 hover:to-indigo-950/20 border border-white/5 hover:border-blue-500/30 rounded-[2.2rem] transition-all group relative overflow-hidden shadow-md"
                                       >
                                           {/* Hover glow effect */}
                                           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                           
                                           <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                                               {/* Home Team */}
                                               <div className="flex flex-col items-center flex-1 min-w-0">
                                                   <div className="w-10 h-10 bg-white/[0.02] rounded-xl flex items-center justify-center p-1.5 border border-white/5 group-hover:scale-105 transition-transform">
                                                       {match.home_team_logo ? (
                                                           <img src={match.home_team_logo} className="w-full h-full object-contain" alt="" />
                                                       ) : (
                                                           <span className="text-xl">{match.home_team_flag || '🏠'}</span>
                                                       )}
                                                   </div>
                                                   <span className="text-[10px] font-black text-zinc-300 group-hover:text-white transition-colors text-center mt-1.5 truncate w-full">
                                                       {match.home_team}
                                                   </span>
                                               </div>

                                               {/* VS Indicator */}
                                               <div className="flex flex-col items-center shrink-0">
                                                   <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                                       VS
                                                   </span>
                                                   <span className="text-[8px] font-bold text-zinc-500 mt-1 uppercase tracking-widest whitespace-nowrap">
                                                       {formatWidgetDate(match.start_time)}
                                                   </span>
                                               </div>

                                               {/* Away Team */}
                                               <div className="flex flex-col items-center flex-1 min-w-0">
                                                   <div className="w-10 h-10 bg-white/[0.02] rounded-xl flex items-center justify-center p-1.5 border border-white/5 group-hover:scale-105 transition-transform">
                                                       {match.away_team_logo ? (
                                                           <img src={match.away_team_logo} className="w-full h-full object-contain" alt="" />
                                                       ) : (
                                                           <span className="text-xl">{match.away_team_flag || '✈️'}</span>
                                                       )}
                                                   </div>
                                                   <span className="text-[10px] font-black text-zinc-300 group-hover:text-white transition-colors text-center mt-1.5 truncate w-full">
                                                       {match.away_team}
                                                   </span>
                                               </div>
                                           </div>

                                           {/* Prediction Call To Action */}
                                           <div className="w-full py-2 bg-blue-600 group-hover:bg-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-center text-white transition-colors relative z-10 shadow-lg group-hover:shadow-blue-500/20">
                                               PRONOSTICAR AHORA
                                           </div>
                                       </Link>
                                   ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

