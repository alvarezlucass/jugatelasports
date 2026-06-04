import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Swords, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

interface PredictionListItemProps {
    pred: any;
}

export const PredictionListItem: React.FC<PredictionListItemProps> = ({ pred }) => {
    const navigate = useNavigate();
    const { storeItems } = useUser();

    return (
        <div 
            onClick={() => navigate(`/match/${pred.matchId}`)}
            className="group cursor-pointer w-full flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all"
        >
            {/* Status & Date */}
            <div className="flex w-full md:w-32 flex-col gap-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                    {pred.opponentType === 'CPU' ? (
                        <Bot size={14} className="text-blue-500" />
                    ) : (
                        <Swords size={14} className="text-purple-500" />
                    )}
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        pred.status === 'WON' ? "text-emerald-400" :
                        pred.status === 'LOST' ? "text-red-400" :
                        pred.status === 'REJECTED' ? "text-red-500" :
                        pred.status === 'CANCELLED' ? "text-zinc-500" :
                        "text-yellow-500"
                    )}>
                        {pred.status === 'WON' ? 'ACIERTO' :
                         pred.status === 'LOST' ? 'FALLIDO' :
                         pred.status === 'REJECTED' ? 'RECHAZADO' :
                         pred.status === 'CANCELLED' ? 'CANCELADO' :
                         'PENDIENTE'}
                    </span>
                </div>
                <div className="flex items-center gap-1 justify-center md:justify-start text-zinc-500">
                    <Clock size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">
                        {new Date(pred.timestamp).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Match info */}
            <div className="flex-1 flex items-center justify-between bg-black/20 rounded-xl px-4 py-2 border border-white/5 min-w-[200px]">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-white text-right flex-1 truncate max-w-[120px]">
                    {pred.matchDetails?.homeTeam || 'LOCAL'}
                </span>
                
                <div className="flex items-center gap-2 px-3">
                    <span className="text-xs md:text-base font-black text-white bg-white/10 px-2 py-0.5 rounded">
                        {pred.exactScore?.home ?? '-'}
                    </span>
                    <span className="text-xs font-black text-zinc-500">-</span>
                    <span className="text-xs md:text-base font-black text-white bg-white/10 px-2 py-0.5 rounded">
                        {pred.exactScore?.away ?? '-'}
                    </span>
                </div>

                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-white text-left flex-1 truncate max-w-[120px]">
                    {pred.matchDetails?.awayTeam || 'VISITA'}
                </span>
            </div>

            {/* Opponent Info */}
            <div className="flex flex-col items-center md:items-start w-full md:w-40 px-2">
                <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Rival</span>
                <span className="text-[10px] font-black uppercase text-white truncate max-w-full">
                    {pred.opponentType === 'CPU' ? 'IA' : (pred.targetName || 'OPONENTE')}
                </span>
            </div>

            {/* Stake / Return */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                <div className="flex flex-col items-start md:items-end">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Inversión</span>
                    <span className="text-[10px] font-black text-white">{pred.stake} TKNS</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Retorno</span>
                    <span className={cn(
                        "text-[10px] font-black",
                        pred.status === 'WON' ? "text-emerald-400" :
                        pred.status === 'LOST' ? "text-red-400/50" :
                        "text-blue-400"
                    )}>
                        {pred.status === 'WON' ? `+${pred.potentialReturn}` :
                         pred.status === 'LOST' ? '0' :
                         pred.potentialReturn} TKNS
                    </span>
                </div>
            </div>
        </div>
    );
};
