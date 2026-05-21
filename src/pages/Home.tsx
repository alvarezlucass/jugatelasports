import { Trophy, Target, CircleDot, Flag, Zap, Star, PlayCircle, Globe, ArrowRight, Shield } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { ActivityFeed } from '../components/social/ActivityFeed';
import { motion } from 'framer-motion';
export const Home: React.FC = () => {
    const { user } = useUser();
    const [feedType, setFeedType] = useState<'GLOBAL' | 'FOLLOWING'>('GLOBAL');

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
            name: 'Liga Profesional', 
            subtitle: 'Fútbol Argentino', 
            status: 'teaser', 
            bgGradient: 'from-sky-600/90 to-blue-900/90', 
            image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
            icon: Shield, 
            link: '/leagues' 
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
        },
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
                <Link to="/leagues" className="group lg:w-1/3 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900/50 to-blue-900/20 border border-blue-500/20 p-8 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-500 active:scale-[0.99] cursor-pointer">
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
                                <div className="bg-amber-500 h-full w-[60%]" />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-black text-amber-500/50 uppercase tracking-widest">
                                <span>3 / 5</span>
                                <span>60%</span>
                            </div>
                        </div>

                        {/* Top Creators Teaser */}
                        <div className="rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-8 space-y-4">
                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Próximos Partidos TOP</h4>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                                   <span className="text-[10px] font-black text-white uppercase italic">ARG vs BRA</span>
                                   <span className="text-[10px] font-bold text-zinc-500">22 JUNIO</span>
                               </div>
                               <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                                   <span className="text-[10px] font-black text-white uppercase italic">GER vs ESP</span>
                                   <span className="text-[10px] font-bold text-zinc-500">24 JUNIO</span>
                               </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

