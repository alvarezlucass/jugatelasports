import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bell, Trophy, Zap, Globe, Shield, Activity, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export const LeaguesTeaserPage: React.FC = () => {
    const navigate = useNavigate();

    // Scroll al inicio al montar la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const leagues = [
        {
            id: 'lpf',
            name: 'Liga Profesional',
            subtitle: 'El torneo de los campeones del mundo',
            color: 'from-sky-400/90 to-blue-800/90',
            image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop', // Estadio conceptual
            icon: Shield,
            path: '/leagues/lpf',
        },
        {
            id: 'ucl',
            name: 'UEFA Champions League',
            subtitle: 'Las noches mágicas de Europa',
            color: 'from-blue-700/90 to-indigo-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Coupe_des_clubs_champions_europ%C3%A9ens.png/800px-Coupe_des_clubs_champions_europ%C3%A9ens.png',
            icon: Trophy,
            path: '/leagues/ucl',
        },
        {
            id: 'premier',
            name: 'Premier League',
            subtitle: 'El fútbol más competitivo',
            color: 'from-purple-700/90 to-pink-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Premier_League_Trophy.jpeg/800px-Premier_League_Trophy.jpeg',
            icon: Shield,
            path: '/leagues/premier',
        },
        {
            id: 'libertadores',
            name: 'Copa Libertadores',
            subtitle: 'La obsesión del continente',
            color: 'from-amber-600/90 to-yellow-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Copa_Libertadores.png/800px-Copa_Libertadores.png',
            icon: Globe,
            path: '/leagues/libertadores',
        },
        {
            id: 'laliga',
            name: 'La Liga',
            subtitle: 'Técnica pura y clásicos',
            color: 'from-red-700/90 to-orange-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Trofeo_La_Liga.jpg/800px-Trofeo_La_Liga.jpg',
            icon: Star,
            path: '/leagues/laliga',
        },
    ];


    const features = [
        {
            icon: Shield,
            title: 'Ligas Privadas "Fantasy"',
            desc: 'Arma grupos cerrados con tus amigos y compite por el trono cada fin de semana.',
            color: 'text-emerald-500'
        },
        {
            icon: Zap,
            title: 'Jugadas Express',
            desc: 'Predice los partidazos de la fecha con un multiclíck y cobra tokens.',
            color: 'text-blue-500'
        },
        {
            icon: Globe,
            title: 'Mercado de Pases Global',
            desc: 'Compra jugadores en nuestra tienda usando tus tokens ganados y potencia tu multiplicador.',
            color: 'text-amber-500'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0D12] pb-24 animate-in fade-in duration-700">
            {/* Top Navigation Bar Contextual */}
            <div className="sticky top-14 md:top-16 z-30 w-full bg-[#131822]/95 backdrop-blur-md border-b border-white/5 shadow-xl">
                <div className="container mx-auto px-4 h-12 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-1 text-zinc-400 hover:text-white transition-colors border-r border-white/10 pr-4"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Volver a Deportes</span>
                    </button>
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                        <Trophy size={14} className="fill-blue-500/20" /> Catálogo de Ligas
                    </span>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 space-y-16">
                
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-[3rem] bg-[#0F131A] border border-white/5 p-8 md:p-16 text-center md:text-left shadow-2xl">
                    <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-l from-indigo-600/20 via-blue-900/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-3xl space-y-8 flex flex-col md:block items-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-[10px] font-black text-indigo-400 border border-indigo-500/20 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <Activity size={12} />
                            Ecosistema Activo
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                            El Fútbol de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                                Élite Está Aquí
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                            Predice fecha tras fecha en los torneos de clubes más competitivos y prestigiosos del planeta. Sigue posiciones en tiempo real, consulta planteles y demuestra tus conocimientos.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button onClick={() => navigate('/leagues/lpf')} className="px-8 py-4 bg-indigo-600 text-white font-black rounded-full text-sm uppercase tracking-wider hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2">
                                <Trophy size={18} />
                                Jugar Liga Profesional
                            </button>
                        </div>
                    </div>
                    {/* Background Graphic */}
                    <Globe size={500} className="absolute -bottom-40 -right-20 text-indigo-500/5 rotate-12 pointer-events-none hidden md:block" />
                </section>

                {/* Leagues Grid */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <Star size={24} className="text-amber-400 fill-amber-400" />
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Competiciones Programadas</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {leagues.map((league) => {
                            const Card = (league as any).path ? Link : 'div';
                            return (
                                <Card
                                    key={league.id}
                                    to={(league as any).path}
                                    className={cn(
                                        "group block relative overflow-hidden rounded-[2.5rem] p-8 border border-white/10 transition-all duration-300 min-h-[280px] flex flex-col justify-between shadow-xl",
                                        (league as any).path 
                                            ? "cursor-pointer hover:scale-[1.02] active:scale-95" 
                                            : "opacity-90 cursor-default"
                                    )}
                                >
                                    {/* Background Image & Overlay */}
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${league.image})` }}
                                    />
                                    <div className={cn("absolute inset-0 bg-gradient-to-br mix-blend-multiply transition-opacity duration-300", league.color)} />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-white/5 text-zinc-500 transition-colors group-hover:text-white group-hover:bg-white/10">
                                            <league.icon size={28} />
                                        </div>

                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5",
                                            (league as any).path 
                                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse" 
                                                : "bg-zinc-800/80 text-zinc-400"
                                        )}>
                                            {(league as any).path ? 'Activo' : 'Próximamente'}
                                        </span>
                                    </div>

                                    <div className="relative z-10 space-y-2 mt-auto">
                                        <h3 className={cn(
                                            "text-3xl font-black uppercase tracking-tighter leading-none mt-12 transition-colors duration-300",
                                            (league as any).path ? "text-white" : "text-zinc-500 group-hover:text-white text-white/70"
                                        )}>
                                            {league.name}
                                        </h3>
                                        <p className={cn(
                                            "text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                                            (league as any).path ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-300"
                                        )}>
                                            {league.subtitle}
                                        </p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* Features Section */}
                <section className="space-y-8 pb-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">¿Qué podrás hacer?</h2>
                        <p className="text-zinc-500 font-bold max-w-xl mx-auto">La experiencia "Jugadas" llevada al siguiente nivel de inmersión.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-[#131822] border border-white/5 p-8 rounded-[2.5rem] hover:border-white/10 transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-lg shadow-black/50">
                                    <feature.icon size={26} className={feature.color} />
                                </div>
                                <h4 className="text-xl font-black text-white mb-3 tracking-tight">{feature.title}</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

