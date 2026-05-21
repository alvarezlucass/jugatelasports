import React from 'react';
import { Globe, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorldCup: React.FC = () => {
    const navigate = useNavigate();
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
                    {/* Text Content */}
                    <div className="flex-1 space-y-8 z-10 text-right lg:text-left">
                        {/* On mobile text-right might look weird, keeping standard flow or conditional? 
                            Actually sticking to standard layout but reversed image/text 
                         */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
                                <Globe className="w-3.5 h-3.5" />
                                World Cup 2026
                            </div>

                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tight mb-4">
                                Vive la pasión <br />
                                <span className="text-amber-500">Mundialista</span>
                            </h2>

                            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
                                Prepárate para el evento más grande del fútbol. Arma tus predicciones del mundial, compite con amigos y demuestra quién sabe más.
                            </p>

                            <button onClick={() => navigate('/worldcup')} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-amber-600/20 transition-all hover:scale-105 active:scale-95">
                                Participar Ahora
                            </button>

                        </div>
                    </div>

                    {/* Image/Illustration */}
                    <div className="flex-1 relative w-full max-w-xl lg:max-w-none">
                        <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-gradient-to-bl from-amber-900/10 to-transparent backdrop-blur-sm group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Placeholder for World Cup Image */}
                                <Trophy className="w-32 h-32 text-amber-500/50" />
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-l from-amber-600 to-orange-500 opacity-20 blur-xl -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
