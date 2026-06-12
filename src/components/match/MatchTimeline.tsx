import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { MatchEvent } from '../../types';

interface MatchTimelineProps {
    events: MatchEvent[];
    homeTeamId: string;
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({ events = [], homeTeamId }) => {
    // Ordenar eventos por tiempo ascendente para la línea temporal horizontal
    const sortedEvents = [...(events || [])].sort((a, b) => a.time - b.time);

    const getEventIcon = (type: MatchEvent['type'], detail: string) => {
        switch (type) {
            case 'GOAL':
                return <Trophy size={14} className="text-zinc-800" />;
            case 'CARD':
                return <div className={cn(
                    "w-3 h-4 rounded-sm shadow-sm",
                    detail.toLowerCase().includes('yellow') ? "bg-yellow-400" : "bg-red-500"
                )} />;
            case 'SUB':
                return <ArrowLeftRight size={14} className="text-emerald-500" />;
            case 'VAR':
                return <AlertTriangle size={14} className="text-blue-500" />;
            default:
                return <Award size={14} className="text-zinc-500" />;
        }
    };

    if (sortedEvents.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center">
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Esperando sucesos...</p>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">
                Sucesos Clave
            </h3>

            <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="min-w-[600px] relative py-20 px-8 flex items-center">
                    
                    {/* Línea horizontal central */}
                    <div className="absolute left-0 right-0 h-[2px] bg-white/10 top-1/2 -translate-y-1/2 rounded-full" />

                    {/* Contenedor de eventos distribuidos uniformemente */}
                    <div className="flex w-full justify-between items-center relative z-10">
                        {sortedEvents.map((event, idx) => {
                            const isHome = event.teamId?.toString() === homeTeamId?.toString();
                            
                            return (
                                <motion.div 
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative flex flex-col items-center justify-center min-w-[80px]"
                                >
                                    {/* Contenido Arriba (Local) */}
                                    <div className={cn(
                                        "absolute bottom-full mb-4 flex flex-col items-center text-center w-32",
                                        !isHome && "opacity-0 pointer-events-none"
                                    )}>
                                        <span className="text-[11px] font-black text-white whitespace-nowrap">{event.player.name}</span>
                                        {event.assistPlayer && (
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">{event.assistPlayer.name}</span>
                                        )}
                                        <div className="mt-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                                            {getEventIcon(event.type, event.detail)}
                                        </div>
                                    </div>

                                    {/* Círculo del minuto */}
                                    <div className="w-8 h-8 bg-[#0A0D12] border-2 border-white/20 rounded-full flex items-center justify-center z-10 shadow-xl">
                                        <span className="text-[10px] font-black text-white">{event.time}'</span>
                                    </div>

                                    {/* Contenido Abajo (Visita) */}
                                    <div className={cn(
                                        "absolute top-full mt-4 flex flex-col items-center text-center w-32",
                                        isHome && "opacity-0 pointer-events-none"
                                    )}>
                                        <div className="mb-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                                            {getEventIcon(event.type, event.detail)}
                                        </div>
                                        <span className="text-[11px] font-black text-white whitespace-nowrap">{event.player.name}</span>
                                        {event.assistPlayer && (
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">{event.assistPlayer.name}</span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
