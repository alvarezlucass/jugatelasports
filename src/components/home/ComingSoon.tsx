import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SportsGrid } from './SportsGrid';

export const ComingSoon: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
                    Próximamente
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 max-w-3xl mx-auto leading-tight">
                    ¿Tenés un amigo que siempre se olvida de pagar sus jugadas?
                </h2>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
                    Esta sección es para esos amigos olvidadizos. Muy pronto sumamos más deportes y ligas para que nadie se quede afuera.
                </p>

                <SportsGrid />

                <button
                    onClick={() => navigate('/notify')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3"
                >
                    Avisame cuando esté disponible
                    <Bell className="w-5 h-5 fill-current" />
                </button>
            </div>

            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl -z-10" />
        </section>
    );
};
