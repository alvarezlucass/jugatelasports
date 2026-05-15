import React from 'react';
import {
    Trophy,
    Users,
    Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Features: React.FC = () => {
    return (
        <section className="py-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Wallet,
                            title: "100% Gratuito",
                            desc: "Sin depósitos ni riesgos de dinero real.",
                            color: "text-blue-400",
                            bg: "bg-blue-500/10"
                        },
                        {
                            icon: Trophy,
                            title: "Sube en el Ranking",
                            desc: "Gana puntos y compite globalmente.",
                            color: "text-amber-400",
                            bg: "bg-amber-500/10"
                        },
                        {
                            icon: Users,
                            title: "Comunidad Activa",
                            desc: "Crea ligas privadas con tus amigos.",
                            color: "text-indigo-400",
                            bg: "bg-indigo-500/10"
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-card/50 backdrop-blur border border-white/5 p-8 rounded-[2rem] hover:bg-card transition-colors flex items-start gap-5 group">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", feature.bg, feature.color)}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
