import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, Trophy, Zap, Globe, Shield, Activity, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const LeaguesTeaserPage: React.FC = () => {
    const navigate = useNavigate();

    // Scroll al inicio al montar la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const location = useLocation();

    // Parse query parameters
    const getInitialTab = () => {
        const params = new URLSearchParams(location.search);
        const region = params.get('region');
        if (region === 'argentina') return 'argentina';
        if (region === 'europe') return 'europe';
        if (region === 'america') return 'america';
        return 'argentina'; // Default tab
    };

    const [activeTab, setActiveTab] = useState<'argentina' | 'europe' | 'america'>(getInitialTab);

    // Sync tab with URL parameter changes (if user clicks CategoryFAB, for example)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const region = params.get('region');
        if (region === 'argentina' || region === 'europe' || region === 'america') {
            setActiveTab(region);
        }
    }, [location.search]);

    const argentinaLeagues = [
        {
            id: 'lpf',
            name: 'Liga Profesional',
            subtitle: 'El torneo de primera división',
            color: 'from-sky-500/90 to-blue-800/90',
            image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop',
            icon: Shield,
            path: '/leagues/lpf',
        },
        {
            id: 'primera-nacional',
            name: 'Primera Nacional',
            subtitle: 'El torneo de ascenso argentino',
            color: 'from-blue-600/90 to-indigo-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg/800px-Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg.png',
            icon: Shield,
            path: '/leagues/primera-nacional',
        },
        {
            id: 'copa-argentina',
            name: 'Copa Argentina',
            subtitle: 'El torneo federal e integrador',
            color: 'from-sky-600/90 to-cyan-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg/800px-Asociaci%C3%B3n_del_F%C3%BAtbol_Argentino_logo.svg.png',
            icon: Trophy,
            path: '/leagues/copa-argentina',
        }
    ];

    const europeanLeagues = [
        {
            id: 'ucl',
            name: 'UEFA Champions League',
            subtitle: 'Noches mágicas de Europa',
            color: 'from-blue-700/90 to-indigo-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Coupe_des_clubs_champions_europ%C3%A9ens.png/800px-Coupe_des_clubs_champions_europ%C3%A9ens.png',
            icon: Trophy,
            path: '/leagues/ucl',
        },
        {
            id: 'uel',
            name: 'UEFA Europa League',
            subtitle: 'La batalla del viejo continente',
            color: 'from-orange-700/90 to-amber-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282021-present%29.svg/800px-UEFA_Europa_League_logo_%282021-present%29.svg.png',
            icon: Trophy,
            path: '/leagues/uel',
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
            id: 'laliga',
            name: 'La Liga',
            subtitle: 'Técnica pura y clásicos',
            color: 'from-red-700/90 to-orange-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Trofeo_La_Liga.jpg/800px-Trofeo_La_Liga.jpg',
            icon: Star,
            path: '/leagues/laliga',
        },
        {
            id: 'serie-a',
            name: 'Serie A',
            subtitle: 'La cuna del Calcio italiano',
            color: 'from-cyan-700/90 to-blue-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Serie_A_logo_2024.svg/800px-Serie_A_logo_2024.svg.png',
            icon: Shield,
            path: '/leagues/serie-a',
        },
        {
            id: 'bundesliga',
            name: 'Bundesliga',
            subtitle: 'Intensidad alemana',
            color: 'from-rose-700/90 to-zinc-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bundesliga_logo_%282017%29.svg/800px-Bundesliga_logo_%282017%29.svg.png',
            icon: Shield,
            path: '/leagues/bundesliga',
        },
        {
            id: 'ligue1',
            name: 'Ligue 1',
            subtitle: 'El talento francés',
            color: 'from-lime-700/90 to-emerald-950/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Ligue_1_McDonald%27s_logo.svg/800px-Ligue_1_McDonald%27s_logo.svg.png',
            icon: Shield,
            path: '/leagues/ligue1',
        },
        {
            id: 'primeira-liga',
            name: 'Primeira Liga',
            subtitle: 'La élite portuguesa',
            color: 'from-emerald-700/90 to-zinc-950/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Liga_Portugal_logo_%282023%29.svg/800px-Liga_Portugal_logo_%282023%29.svg.png',
            icon: Shield,
            path: '/leagues/primeira-liga',
        }
    ];

    const americanLeagues = [
        {
            id: 'libertadores',
            name: 'Copa Libertadores',
            subtitle: 'La gloria eterna de Sudamérica',
            color: 'from-amber-600/90 to-yellow-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Copa_Libertadores.png/800px-Copa_Libertadores.png',
            icon: Globe,
            path: '/leagues/libertadores',
        },
        {
            id: 'sudamericana',
            name: 'Copa Sudamericana',
            subtitle: 'La otra mitad de la gloria',
            color: 'from-amber-700/90 to-zinc-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Copa_Sudamericana_Logo.svg/800px-Copa_Sudamericana_Logo.svg.png',
            icon: Globe,
            path: '/leagues/sudamericana',
        },
        {
            id: 'brasileirao',
            name: 'Brasileirão',
            subtitle: 'Fútbol, samba y show de Brasil',
            color: 'from-green-600/90 to-yellow-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg/800px-Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg.png',
            icon: Globe,
            path: '/leagues/brasileirao',
        },
        {
            id: 'ligamx',
            name: 'Liga MX',
            subtitle: 'La fuerza de México',
            color: 'from-emerald-700/90 to-teal-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Liga_MX_logo.svg/800px-Liga_MX_logo.svg.png',
            icon: Shield,
            path: '/leagues/ligamx',
        },
        {
            id: 'primera-a-colombia',
            name: 'Primera A Colombia',
            subtitle: 'El talento cafetero',
            color: 'from-orange-700/90 to-amber-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Dimayor_logo.svg/800px-Dimayor_logo.svg.png',
            icon: Shield,
            path: '/leagues/primera-a-colombia',
        },
        {
            id: 'primera-chile',
            name: 'Primera de Chile',
            subtitle: 'La emoción transandina',
            color: 'from-red-700/90 to-blue-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Logo_ANFP.png/800px-Logo_ANFP.png',
            icon: Shield,
            path: '/leagues/primera-chile',
        },
        {
            id: 'primera-uruguay',
            name: 'Primera de Uruguay',
            subtitle: 'Pasión charrúa uruguaya',
            color: 'from-sky-700/90 to-zinc-900/90',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Logo_AUF.png/800px-Logo_AUF.png',
            icon: Shield,
            path: '/leagues/primera-uruguay',
        }
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

    const renderLeagueCard = (league: {
        id: string;
        name: string;
        subtitle: string;
        color: string;
        image: string;
        icon: React.ComponentType<any>;
        path?: string;
    }) => {
        const Card = league.path ? Link : 'div';
        return (
            <Card
                key={league.id}
                to={league.path || ''}
                className={cn(
                    "group block relative overflow-hidden rounded-[2.5rem] p-8 border border-white/10 transition-all duration-300 min-h-[280px] flex flex-col justify-between shadow-xl",
                    league.path 
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
                        league.path 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse" 
                            : "bg-zinc-800/80 text-zinc-400"
                    )}>
                        {league.path ? 'Activo' : 'Próximamente'}
                    </span>
                </div>

                <div className="relative z-10 space-y-2 mt-auto">
                    <h3 className={cn(
                        "text-3xl font-black uppercase tracking-tighter leading-none mt-12 transition-colors duration-300",
                        league.path ? "text-white" : "text-zinc-500 group-hover:text-white text-white/70"
                    )}>
                        {league.name}
                    </h3>
                    <p className={cn(
                        "text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                        league.path ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-300"
                    )}>
                        {league.subtitle}
                    </p>
                </div>
            </Card>
        );
    };

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

                {/* Tabs Selector Navigation */}
                <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center gap-2 bg-[#131822] p-2 rounded-[2.2rem] border border-white/5 w-full max-w-2xl shadow-2xl">
                        {[
                            { id: 'argentina', label: 'Ligas Argentinas', icon: Shield, color: 'text-sky-400' },
                            { id: 'europe', label: 'Fútbol Europeo', icon: Trophy, color: 'text-yellow-500' },
                            { id: 'america', label: 'Ligas Americanas', icon: Globe, color: 'text-amber-500' },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        navigate(`/leagues?region=${tab.id}`, { replace: true });
                                    }}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden z-10",
                                        isActive 
                                            ? "text-white" 
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={16} className={cn(isActive ? "text-white" : tab.color)} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.split(' ')[1] || tab.label}</span>
                                    
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabTeaserIndicator"
                                            className="absolute inset-0 bg-blue-600 -z-10"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dynamic Category View Grid */}
                <div className="pt-4 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'argentina' && (
                            <motion.div
                                key="argentina"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-3 px-2 border-b border-white/5 pb-4">
                                    <Shield size={24} className="text-sky-400 fill-sky-400/20" />
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Ligas Argentinas</h2>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">El fútbol de los campeones del mundo</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {argentinaLeagues.map((league) => renderLeagueCard(league))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'europe' && (
                            <motion.div
                                key="europe"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-3 px-2 border-b border-white/5 pb-4">
                                    <Trophy size={24} className="text-yellow-500 fill-yellow-500/20" />
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Fútbol Europeo</h2>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">La élite y las noches mágicas de Europa</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {europeanLeagues.map((league) => renderLeagueCard(league))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'america' && (
                            <motion.div
                                key="america"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-3 px-2 border-b border-white/5 pb-4">
                                    <Globe size={24} className="text-amber-500 fill-amber-500/20" />
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Ligas Americanas</h2>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">La pasión y mística americana</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {americanLeagues.map((league) => renderLeagueCard(league))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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

