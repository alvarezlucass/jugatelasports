import React from 'react';
import {
    Car,
    Activity,
    Gamepad2,
    Trophy
} from 'lucide-react';

export const SportsGrid: React.FC = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-16">
            {[
                { name: "Fútbol Int.", icon: Activity },
                { name: "Basquet", icon: Gamepad2 },
                { name: "Tenis", icon: Activity },
                { name: "Formula 1", icon: Car },
                { name: "NFL", icon: Trophy }
            ].map((sport, idx) => (
                <div key={idx} className="bg-card/30 border border-white/5 aspect-square rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-card/50 transition-colors group cursor-not-allowed">
                    <sport.icon className="w-8 h-8 text-muted-foreground group-hover:text-white transition-colors opacity-50 group-hover:opacity-100" />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-white uppercase tracking-wider">{sport.name}</span>
                </div>
            ))}
        </div>
    );
};
