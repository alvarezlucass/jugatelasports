import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, AlertTriangle, ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { MatchEvent } from '../../types';

interface MatchTimelineProps {
    events: MatchEvent[];
    homeTeamId: string;
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({ events, homeTeamId }) => {
    // Ordenar eventos por tiempo descendente
    const sortedEvents = [...events].sort((a, b) => b.time - a.time);

    const getEventIcon = (type: MatchEvent['type'], detail: string) => {
        switch (type) {
            case 'GOAL':
                return <Trophy size={14} className="text-white" />;
            case 'CARD':
                return <div className={cn(
                    "w-3 h-4 rounded-sm shadow-sm",
                    detail.includes('Yellow') ? "bg-yellow-400" : "bg-red-500"
                )} />;
            case 'SUB':
                return <ArrowLeftRight size={14} className="text-emerald-400" />;
            case 'VAR':
                return <AlertTriangle size={14} className="text-blue-400" />;
            default:
                return <Award size={14} className="text-zinc-500" />;
        }
    };

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-10 flex items-center justify-between">
                Sucesos Clave
                <span className="text-[10px] text-zinc-700 bg-white/5 px-2 py-0.5 rounded-full">Actualizado</span>
            </h3>

            <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                {sortedEvents.map((event, idx) => {
                    const isHome = event.teamId === homeTeamId;
                    
                    return (
                        <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-8 relative z-10 group"
                        >
                            {/* Time Circle */}
                            <div className="w-10 h-10 rounded-full bg-[#0A0D12] border-2 border-blue-500/50 flex items-center justify-center shrink-0 group-hover:border-blue-400 group-hover:scale-110 transition-all shadow-lg">
                                <span className="text-[10px] font-black">{event.time}'</span>
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/5 group-hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className={cn(
                                        "w-7 min-w-[28px] h-7 rounded-lg flex items-center justify-center",
                                        event.type === 'GOAL' ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-white/5"
                                    )}>
                                        {getEventIcon(event.type, event.detail)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest truncate">
                                                {event.detail}
                                            </p>
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                                isHome ? "text-blue-400 bg-blue-400/10" : "text-zinc-500 bg-white/5"
                                            )}>
                                                {isHome ? 'LOCAL' : 'VISITA'}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-black text-white">{event.player.name}</h4>
                                    </div>
                                </div>
                                {event.assistPlayer && (
                                    <p className="text-[10px] text-zinc-500 mt-1 pl-10 border-l border-white/5">
                                        Asistencia: <span className="text-zinc-300 font-bold">{event.assistPlayer.name}</span>
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {sortedEvents.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Esperando sucesos...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
