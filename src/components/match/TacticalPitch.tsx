import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Award, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { MatchLineup, MatchEvent } from '../../types';

interface TacticalPitchProps {
    lineup: MatchLineup;
    events: MatchEvent[];
    onPlayerClick?: (playerId: string) => void;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({ lineup, events, onPlayerClick }) => {
    // Función para obtener eventos relevantes de un jugador en este partido
    const getPlayerEvents = (playerId: string) => {
        return events.filter(e => e.player.id === playerId);
    }

    return (
        <div className="relative aspect-[3/4] bg-[#1a4a1a] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
            {/* Césped con diseño de franjas */}
            <div className="absolute inset-0 flex flex-col">
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "flex-1 w-full",
                            i % 2 === 0 ? "bg-emerald-900/40" : "bg-emerald-800/40"
                        )}
                    />
                ))}
            </div>

            {/* Líneas Reglamentarias */}
            <div className="absolute inset-4 border-2 border-white/20 rounded-lg pointer-events-none" />
            <div className="absolute top-4 left-1/4 right-1/4 h-24 border-b-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute bottom-4 left-1/4 right-1/4 h-24 border-t-2 border-x-2 border-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/20 pointer-events-none" />

            {/* Posicionamiento de Jugadores */}
            {lineup.startXI.map((slot, idx) => {
                const playerEvents = getPlayerEvents(slot.player.id);
                const hasGoal = playerEvents.some(e => e.type === 'GOAL');
                const hasYellow = playerEvents.some(e => e.detail.includes('Yellow'));
                const hasRed = playerEvents.some(e => e.detail.includes('Red'));

                return (
                    <motion.div 
                        key={slot.player.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => onPlayerClick?.(slot.player.id)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 text-center z-20 cursor-pointer group"
                        style={{
                            top: `${(parseInt(slot.grid?.split(':')[0] || '0') * 20)}%`,
                            left: `${(parseInt(slot.grid?.split(':')[1] || '0') * 25)}%`,
                        }}
                    >
                        <div className="relative">
                            {/* Avatar con borde de posición */}
                            <div className={cn(
                                "w-11 h-11 md:w-14 md:h-14 rounded-full border-2 transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] overflow-hidden bg-zinc-900 mx-auto",
                                slot.pos === 'GK' ? "border-amber-400" :
                                slot.pos === 'DEF' ? "border-blue-400" :
                                slot.pos === 'MID' ? "border-emerald-400" : "border-red-400"
                            )}>
                                <img 
                                    src={slot.player.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${slot.player.name}`} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Indicadores de Eventos */}
                            <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
                                {hasGoal && (
                                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                        <Award size={10} className="text-black" />
                                    </div>
                                )}
                                {hasYellow && (
                                    <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-lg" />
                                )}
                                {hasRed && (
                                    <div className="w-3 h-4 bg-red-500 rounded-sm shadow-lg" />
                                )}
                            </div>
                        </div>

                        {/* Nombre del Jugador */}
                        <div className="mt-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 group-hover:bg-blue-600 transition-colors">
                            <p className="text-[7px] md:text-[9px] font-black text-white truncate max-w-[65px] uppercase tracking-tighter">
                                {slot.player.name}
                            </p>
                        </div>
                    </motion.div>
                );
            })}

            {/* Marca de Agua / Branding */}
            <div className="absolute bottom-2 right-4 opacity-10 pointer-events-none">
                <Shield size={60} className="text-white" />
            </div>
        </div>
    );
};
