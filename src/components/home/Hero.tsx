import React from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Text Content */}
                    <div className="flex-1 space-y-8 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                            <Shield className="w-3.5 h-3.5" />
                            Free to Play
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight">
                            Demuestra tu <br />
                            <span className="text-blue-600">conocimiento</span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                            Participa en predicciones deportivas gratuitas, compite con amigos y sube en el ranking sin riesgos. Juega por la gloria y gana premios exclusivos.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                            >
                                Empezar
                            </button>
                            <button className="bg-muted/20 hover:bg-muted/30 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                                Explorar Ligas
                            </button>
                        </div>
                    </div>

                    {/* Hero Image/Illustration */}
                    <div className="flex-1 relative w-full max-w-xl lg:max-w-none">
                        <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Placeholder illustration based on screenshot */}
                                <div className="relative w-full h-full p-8 flex items-center justify-center">
                                    <img
                                        src="https://img.freepik.com/free-vector/friends-giving-high-five_23-2148160359.jpg?w=996&t=st=1706646000~exp=1706646600~hmac=..."
                                        alt="Friends High Five"
                                        className="object-cover w-full h-full rounded-2xl opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                                    // Using a generic placeholder if real asset not available, styled to match mood
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                </div>
                            </div>
                            {/* Glow effect */}
                            <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-blue-600 to-green-500 opacity-20 blur-xl -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
