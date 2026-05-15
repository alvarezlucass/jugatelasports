import React from 'react';
import { Rocket, Timer, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
    featureName?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ featureName = "Esta sección" }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                <div className="relative w-24 h-24 bg-[#0F131A] border border-white/5 rounded-[2rem] flex items-center justify-center text-blue-500 shadow-2xl">
                    <Rocket size={48} className="animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Muy Pronto
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                {featureName} <br />
                <span className="text-blue-600">estárá disponible</span>
            </h1>

            <p className="text-zinc-500 font-bold max-w-md mx-auto mb-10 leading-relaxed uppercase tracking-widest text-xs opacity-60">
                Estamos concentrando toda nuestra energía en el lanzamiento oficial del <span className="text-white">Mundial 2026</span>.
                Vuelve pronto para disfrutar de toda la experiencia de Jugatela Sports.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate('/worldcup')}
                    className="px-8 py-4 bg-blue-600 text-white font-black rounded-full text-sm uppercase tracking-wider hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center gap-2"
                >
                    <Timer size={18} />
                    Ir al Mundial 2026
                </button>

                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-4 bg-white/5 text-zinc-400 font-black rounded-full text-sm uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    <ChevronLeft size={18} />
                    Volver
                </button>
            </div>

            <div className="mt-20 flex items-center gap-8 opacity-20 filter grayscale">
                <span className="text-xl font-black italic">LA LIGA</span>
                <span className="text-xl font-black italic">CHAMPIONS</span>
                <span className="text-xl font-black italic">NBA</span>
            </div>
        </div>
    );
};
