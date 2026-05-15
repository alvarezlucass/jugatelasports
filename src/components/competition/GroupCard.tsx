import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

interface GroupCardProps {
    groupLetter: string;
    teams: {
        id: string;
        name: string;
        flag: string;
        pj: number;
        dg: number;
        pts: number;
        form?: ('W' | 'D' | 'L')[];
    }[];
    onViewFixture?: () => void;
    onTeamClick?: (teamName: string) => void;
    isCompact?: boolean;
}

const renderForm = (form?: ('W' | 'D' | 'L')[]) => {
    const matches = form || ['W', 'D', 'L', 'W', 'W'];

    return (
        <div className="flex items-center gap-2 md:gap-3 justify-end">
            {matches.map((result, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black font-mono text-white shadow-lg transition-transform hover:scale-110",
                        result === 'W' ? 'bg-emerald-500 shadow-emerald-500/20 border-2 border-emerald-400/50' :
                            result === 'D' ? 'bg-amber-500 shadow-amber-500/20 border-2 border-amber-400/50' :
                                'bg-rose-500 shadow-rose-500/20 border-2 border-rose-400/50'
                    )}
                    title={result === 'W' ? 'Victoria' : result === 'D' ? 'Empate' : 'Derrota'}
                >
                    {result}
                </div>
            ))}
        </div>
    );
};

export const GroupCard: React.FC<GroupCardProps> = ({ groupLetter, teams, onViewFixture, onTeamClick, isCompact = false }) => {
    return (
        <div className="w-full bg-[#0F131A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl transition-all hover:border-blue-500/30 group">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
                    GRUPO {groupLetter}
                </h3>
                {onViewFixture && (
                    <button
                        onClick={onViewFixture}
                        className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-white transition-colors uppercase tracking-widest bg-blue-500/10 px-5 py-3 rounded-full border border-blue-500/20 hover:bg-blue-500/20"
                    >
                        Ver fixture <ChevronRight size={18} />
                    </button>
                )}
            </div>

            <div className="w-full overflow-x-auto scrollbar-hide">
                <table className={cn("w-full border-collapse min-w-full", !isCompact && "md:min-w-[700px]")}>
                    <thead>
                        <tr className={cn("font-black text-zinc-500 uppercase tracking-widest border-b border-white/10", isCompact ? "text-[10px]" : "text-[10px] md:text-sm")}>
                            <th className={cn("text-left text-zinc-500", isCompact ? "pb-4 w-8" : "pb-4 md:pb-6 w-8 md:w-16")}>Pos</th>
                            <th className={cn("text-left text-zinc-500", isCompact ? "pb-4" : "pb-4 md:pb-6")}>Selección</th>
                            <th className={cn("text-center text-zinc-500", isCompact ? "pb-4 w-12" : "pb-4 md:pb-6 w-12 md:w-24")}>PJ</th>
                            <th className={cn("text-center text-zinc-500", isCompact ? "pb-4 w-12" : "pb-4 md:pb-6 w-12 md:w-24")}>DG</th>
                            <th className={cn("text-right text-zinc-500 pr-4", isCompact ? "hidden" : "pb-4 md:pb-6 w-32 md:w-64 hidden lg:table-cell")}>Últimos 5</th>
                            <th className={cn("text-right text-blue-500/50", isCompact ? "pb-4 w-16" : "pb-4 md:pb-6 w-16 md:w-24")}>Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {teams.map((team, idx) => (
                            <tr
                                key={team.id}
                                className="group/row cursor-pointer hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-transparent transition-all"
                                onClick={() => onTeamClick?.(team.name)}
                            >
                                <td className={cn(isCompact ? "py-4" : "py-4 md:py-8")}>
                                    <span className={cn(
                                        "font-black",
                                        isCompact ? "text-lg" : "text-lg md:text-2xl",
                                        idx === 0 ? "text-blue-500" : idx === 1 ? "text-sky-400" : "text-zinc-500"
                                    )}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className={cn(isCompact ? "py-4" : "py-4 md:py-8")}>
                                    <div className={cn("flex items-center", isCompact ? "gap-3" : "gap-3 md:gap-6")}>
                                        <div className={cn("rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover/row:border-blue-500/50 transition-colors", isCompact ? "w-10 h-10" : "w-10 h-10 md:w-16 md:h-16")}>
                                            <img
                                                src={team.flag}
                                                alt={team.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className={cn(
                                            "font-black tracking-tighter uppercase",
                                            isCompact ? "text-base" : "text-base md:text-2xl",
                                            idx < 2 ? "text-white" : "text-zinc-300"
                                        )}>
                                            {team.name}
                                        </span>
                                    </div>
                                </td>
                                <td className={cn("text-center font-bold text-zinc-400", isCompact ? "py-4 text-base" : "py-4 md:py-8 text-base md:text-xl")}>
                                    {team.pj}
                                </td>
                                <td className={cn("text-center", isCompact ? "py-4" : "py-4 md:py-8")}>
                                    <span className={cn(
                                        "font-black",
                                        isCompact ? "text-base" : "text-base md:text-xl",
                                        team.dg > 0 ? "text-emerald-500" : team.dg < 0 ? "text-rose-500" : "text-zinc-500"
                                    )}>
                                        {team.dg > 0 ? `+${team.dg}` : team.dg}
                                    </span>
                                </td>
                                <td className={cn("text-right pr-4", isCompact ? "hidden" : "py-4 md:py-8 hidden lg:table-cell")}>
                                    {renderForm(team.form)}
                                </td>
                                <td className={cn("text-right", isCompact ? "py-4" : "py-4 md:py-8")}>
                                    <div className={cn(
                                        "inline-flex items-center justify-center rounded-xl font-black mx-auto lg:ml-auto lg:mr-0 shadow-inner",
                                        isCompact ? "w-10 h-10 text-lg" : "w-10 h-10 md:w-16 md:h-16 md:rounded-2xl text-lg md:text-2xl",
                                        idx === 0 ? "bg-blue-600 text-white shadow-blue-500/20" :
                                            idx === 1 ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-zinc-400"
                                    )}>
                                        {team.pts}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

