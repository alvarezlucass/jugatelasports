import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Swords, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

interface PredictionCardProps {
    pred: any;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ pred }) => {
    const navigate = useNavigate();
    const { storeItems } = useUser();

    return (
        <div 
            onClick={() => navigate(`/match/${pred.matchId}`)}
            className={cn(
                "rounded-[2.5rem] p-1 transition-all group cursor-pointer hover:scale-[1.01] overflow-hidden",
                pred.opponentType === 'CPU' ? "bg-gradient-to-b from-blue-500/20 to-transparent" : "bg-gradient-to-b from-purple-500/20 to-transparent"
            )}
        >
            <div className="bg-[#0F131A] rounded-[2.4rem] p-6 border border-white/5 h-full flex flex-col gap-6 shadow-2xl relative">
                
                {/* Header */}
                <div className="flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center border",
                            pred.opponentType === 'CPU' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        )}>
                            {pred.opponentType === 'CPU' ? <Bot size={16} /> : <Swords size={16} />}
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                {pred.opponentType === 'CPU' ? 'vs IA' : 'PvP Arena'}
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    pred.status === 'WON' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : pred.status === 'LOST' ? 'bg-red-500' : pred.status === 'REJECTED' || pred.status === 'CANCELLED' ? 'bg-zinc-500' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                )} />
                            </div>
                            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                {pred.status === 'WON' ? 'Acierto' : pred.status === 'LOST' ? 'Fallido' : pred.status === 'REJECTED' ? 'Rechazado' : pred.status === 'CANCELLED' ? 'Cancelado' : 'Jugada Activa'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={10} />
                            {new Date(pred.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                            {new Date(pred.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Match Info */}
                <div className="flex items-center justify-between gap-4 z-10 bg-white/[0.02] p-4 rounded-3xl border border-white/[0.03]">
                    <div className="flex-1 text-center">
                        <div className="font-black text-[11px] text-white uppercase truncate tracking-tight">{pred.matchDetails?.homeTeam || 'LOCAL'}</div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-2xl font-black text-white italic drop-shadow-md">{pred.exactScore?.home}</span>
                        <span className="text-zinc-700 font-black italic text-lg">-</span>
                        <span className="text-2xl font-black text-white italic drop-shadow-md">{pred.exactScore?.away}</span>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="font-black text-[11px] text-white uppercase truncate tracking-tight">{pred.matchDetails?.awayTeam || 'VISITANTE'}</div>
                    </div>
                </div>

                {/* Opponent Selection Info */}
                <div className="z-10">
                    {(pred.targetSelection || pred.opponentType || pred.targetName) ? (
                        <div className={cn(
                            "flex items-center justify-between px-5 py-3 rounded-2xl border transition-colors",
                            pred.targetSelection 
                                ? (pred.opponentType === 'CPU' ? "bg-blue-500/5 border-blue-500/10" : "bg-purple-500/5 border-purple-500/10")
                                : "bg-amber-500/5 border-amber-500/10"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                                    {pred.opponentType === 'CPU' ? <Bot size={12} className="text-blue-400" /> : <Swords size={12} className={pred.targetSelection ? "text-purple-400" : "text-amber-400"} />}
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">
                                        {pred.targetSelection ? 'Elección del Rival' : 'Desafío Pendiente'}
                                    </div>
                                    <div className="text-[10px] font-black text-white uppercase tracking-tight">
                                        {pred.targetName && pred.targetName !== 'Oponente' ? pred.targetName : (pred.opponentType === 'CPU' ? 'IA' : 'Oponente')}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                {pred.targetSelection ? (
                                    <>
                                        <div className={cn(
                                            "font-black text-[11px] uppercase tracking-wider",
                                            pred.opponentType === 'CPU' ? "text-blue-400" : "text-purple-400"
                                        )}>
                                            {pred.targetSelection === 'HOME' ? 'Local' : pred.targetSelection === 'AWAY' ? 'Visita' : 'Empate'}
                                        </div>
                                        {pred.targetHomeScore !== undefined && (
                                            <div className="text-[9px] font-bold text-zinc-400">
                                                Exacto: {pred.targetHomeScore} - {pred.targetAwayScore}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                                        Esperando
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer / Stakes */}
                <div className="pt-4 border-t border-white/[0.03] flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        {pred.matchDetails?.betItemName && (
                            <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-1.5">
                                <span className="text-[10px]">
                                    {(() => {
                                        const item = storeItems.find(i => i.name === pred.matchDetails?.betItemName);
                                        if (!item) return '🎁';
                                        const name = item.name.toLowerCase();
                                        if (name.includes('fernet')) return '🥃';
                                        if (name.includes('cerveza')) return '🍺';
                                        if (name.includes('asado')) return '🥩';
                                        if (name.includes('pizza')) return '🍕';
                                        if (name.includes('coca')) return '🥤';
                                        return '🎁';
                                    })()}
                                </span>
                                <span className="text-[8px] font-black text-amber-400 uppercase tracking-tight">{pred.matchDetails.betItemName}</span>
                            </div>
                        )}
                        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                            Inversión: <span className="text-white">{pred.stake} TKNS</span>
                        </div>
                    </div>
                    <div className={cn(
                        "font-black tracking-tighter text-lg",
                        pred.potentialReturn > 0 && pred.status === 'WON' ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : pred.status === 'LOST' ? 'text-red-500' : 'text-zinc-600'
                    )}>
                        {pred.status === 'WON' ? `+${pred.potentialReturn}` : pred.status === 'LOST' ? '-' + pred.stake : '---'}
                    </div>
                </div>
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    {pred.opponentType === 'CPU' ? <Bot size={120} /> : <Swords size={120} />}
                </div>
            </div>
        </div>
    );
};
