import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ActionZonesProps {
    defense: number;
    midfield: number;
    attack: number;
    teamColor?: string;
}

export const ActionZonesPitch: React.FC<ActionZonesProps> = ({ defense, midfield, attack, teamColor = '#10b981' }) => {
    // Helper to get opacity based on percentage
    const getOpacity = (val: number) => {
        if (val >= 40) return 0.8;
        if (val >= 30) return 0.5;
        if (val >= 20) return 0.3;
        return 0.1;
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* The Pitch */}
            <div className="relative w-full max-w-[300px] aspect-[2/3] bg-[#0A0D12] border-2 border-white/20 rounded-xl overflow-hidden p-2 flex flex-col">
                
                {/* Center Circle & Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/20 -translate-y-1/2 z-10" />
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />

                {/* Penalty Areas */}
                <div className="absolute top-0 left-1/2 w-32 h-16 border-2 border-t-0 border-white/20 -translate-x-1/2 z-10" />
                <div className="absolute top-0 left-1/2 w-16 h-6 border-2 border-t-0 border-white/20 -translate-x-1/2 z-10" />
                <div className="absolute top-[15%] left-1/2 w-16 h-8 border-t-2 border-white/20 rounded-t-[50%] -translate-x-1/2 z-10" />

                <div className="absolute bottom-0 left-1/2 w-32 h-16 border-2 border-b-0 border-white/20 -translate-x-1/2 z-10" />
                <div className="absolute bottom-0 left-1/2 w-16 h-6 border-2 border-b-0 border-white/20 -translate-x-1/2 z-10" />
                <div className="absolute bottom-[15%] left-1/2 w-16 h-8 border-b-2 border-white/20 rounded-b-[50%] -translate-x-1/2 z-10" />

                {/* The 3 Zones */}
                <div className="flex-1 flex flex-col relative z-20 h-full w-full gap-1">
                    {/* Attack Zone (Top) */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="flex-1 rounded-t-lg flex items-center justify-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 transition-opacity duration-500" style={{ backgroundColor: teamColor, opacity: getOpacity(attack) }} />
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-3xl font-black text-white drop-shadow-md">{attack}%</span>
                            <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-full mt-1">Ataque</span>
                        </div>
                    </motion.div>

                    {/* Midfield Zone (Middle) */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="flex-1 flex items-center justify-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 transition-opacity duration-500" style={{ backgroundColor: teamColor, opacity: getOpacity(midfield) }} />
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-3xl font-black text-white drop-shadow-md">{midfield}%</span>
                            <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-full mt-1">Medio</span>
                        </div>
                    </motion.div>

                    {/* Defense Zone (Bottom) */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        className="flex-1 rounded-b-lg flex items-center justify-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 transition-opacity duration-500" style={{ backgroundColor: teamColor, opacity: getOpacity(defense) }} />
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-3xl font-black text-white drop-shadow-md">{defense}%</span>
                            <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-full mt-1">Defensa</span>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Dirección de Ataque ⬆
            </div>
        </div>
    );
};
