import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bell, Flag, Zap, Shield, Activity, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export const F1TeaserPage: React.FC = () => {
    const navigate = useNavigate();

    // Scroll al inicio al montar la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const leagues = [
        {
            id: 'drivers',
            name: 'Pilotos',
            subtitle: 'Predice el podio de cada carrera',
            color: 'from-rose-700/90 to-red-900/90',
            image: 'https://images.unsplash.com/photo-1532906399140-57551fa1680d?auto=format&fit=crop&q=80&w=800', // Formula 1 car
            icon: Flag,
        },
        {
            id: 'constructors',
            name: 'Constructores',
            subtitle: 'Estrategia y equipos',
            color: 'from-zinc-700/90 to-zinc-900/90',
            image: 'https://images.unsplash.com/photo-1510006721543-b2daecf2b1d6?auto=format&fit=crop&q=80&w=800', // Teams/Pit Stop
            icon: Flag,
        }
    ];

    const features = [
        {
            icon: Shield,
            title: 'Ligas de Motores',
            desc: 'Arma grupos privados y compite prediciendo las posiciones de largada y finales.',
            color: 'text-rose-500'
        },
        {
            icon: Zap,
            title: 'Multiclick Rápido',
            desc: 'Selecciona al ganador, pole position y vuelta rápida en segundos.',
            color: 'text-zinc-300'
        },
        {
            icon: Star,
            title: 'Gestor de Escuderías',
            desc: 'Adquiere mejoras para tu garaje virtual usando tokens para potenciar puntos.',
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
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                        <Flag size={14} className="fill-rose-500/20" /> Competiciones Motor
                    </span>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 space-y-16">
                
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-[3rem] bg-[#0F131A] border border-white/5 p-8 md:p-16 text-center md:text-left shadow-2xl">
                    <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-l from-rose-600/20 via-red-900/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-3xl space-y-8 flex flex-col md:block items-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-[10px] font-black text-rose-400 border border-rose-500/20 uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse">
                            <Activity size={12} />
                            En Desarrollo Activo
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                            Preparando la <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600">
                                Fórmula 1
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                            Estamos construyendo la infraestructura definitiva para que predigas fecha tras fecha en el Campeonato Mundial de automovilismo.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/notify" className="px-8 py-4 bg-rose-600 text-white font-black rounded-full text-sm uppercase tracking-wider hover:bg-rose-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2">
                                <Bell size={18} />
                                Activar Notificaciones
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Leagues Grid */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <Star size={24} className="text-amber-400 fill-amber-400" />
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Modalidades Programadas</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        {leagues.map((league) => (
                            <div
                                key={league.id}
                                className="group block relative overflow-hidden rounded-[2.5rem] p-8 border border-white/10 opacity-90 cursor-default hover:scale-[1.02] transition-all duration-300 min-h-[280px] flex flex-col justify-between shadow-xl"
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

                                    <span className="px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                                        Próximamente
                                    </span>
                                </div>

                                <div className="relative z-10 space-y-2 mt-auto">
                                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mt-12 text-zinc-500 group-hover:text-white transition-colors duration-300">
                                        {league.name}
                                    </h3>
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
                                        {league.subtitle}
                                    </p>
                                </div>
                            </div>
                        ))}
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
