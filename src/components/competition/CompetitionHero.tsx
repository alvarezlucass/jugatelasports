import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface CompetitionHeroProps {
    title: string;
    // Keeping these for interface compatibility but marking optional
    subtitle?: string;
    logo?: string;
    backgroundImage?: string;
    primaryColor?: string;
    stats?: { label: string; value: string }[];
}

export const CompetitionHero: React.FC<CompetitionHeroProps> = ({
    // Destructure but don't use yet - or better, remove from destructuring if not used in THIS version
}) => {
    // Countdown state (mocking a future date)
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 5, mins: 44 });

    // Simple countdown effect
    useEffect(() => {
        const timer = setInterval(() => {
            // Logic to update time would go here, keeping static for design mock
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative w-full overflow-hidden rounded-[2.5rem] bg-black border border-white/5 shadow-2xl mb-12 group">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop"
                    alt="Stadium"
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-end justify-between p-8 md:p-12 gap-8 md:gap-0 min-h-[400px] md:min-h-[480px]">

                {/* Main Content Info */}
                <div className="flex-1 space-y-6 max-w-2xl self-start md:self-auto mb-auto md:mb-0 md:mt-12 w-full">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        Partido Destacado: USA vs México (no olvidarse de automátizar)
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                        Mundial 2026: <br />
                        <span className="text-blue-500">Camino a la Gloria</span>
                    </h1>

                    <p className="text-zinc-400 text-lg font-medium max-w-lg  leading-relaxed">
                        Predice el resultado de la mayor rivalidad en Estados Unidos. Altos riesgos, mayores recompensas. Gana el doble de tokens JGT hoy.
                    </p>

                    <div className="flex items-center gap-8 pt-4">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all hover:gap-4 shadow-lg shadow-blue-600/30">
                            Apostar Ahora <ArrowRight size={18} />
                        </button>

                        <div className="hidden md:block">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Empieza en</div>
                            <div className="flex items-center gap-4 font-mono font-bold text-xl text-white">
                                <div>{timeLeft.days}d</div>
                                <div className="text-zinc-600">:</div>
                                <div>{timeLeft.hours}h</div>
                                <div className="text-zinc-600">:</div>
                                <div>{timeLeft.mins}m</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optional Decorative Elements or Secondary Stats could go right */}
            </div>
        </section>
    );
};
