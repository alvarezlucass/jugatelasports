import React, { useMemo, useState } from 'react';
import { Trophy, MapPin, Star, Eye, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import historyData from '../../data/history/worldcup_full.json';
import { HistoryDetails } from './HistoryDetails';

interface WorldCupEdition {
    year: number;
    host: string;
    winner: string;
    winnerFlag: string;
    runnerUp: string;
    runnerUpFlag: string;
    score: string;
    penalties?: string;
    extraTime?: boolean;
    mvp: string;
    teams?: number;
    topScorer?: string;
    topScorerGoals?: number;
}

// Map of years that have detailed data
const DETAILED_YEARS = [2022];

export const HistoryTimeline: React.FC = () => {
    const [loadingDetails, setLoadingDetails] = useState<number | null>(null);
    const [selectedTournament, setSelectedTournament] = useState<any | null>(null);
    const [selectedSquads, setSelectedSquads] = useState<any | null>(null);

    // Sort logic
    const sortedHistory = useMemo(() => {
        return [...historyData].sort((a, b) => b.year - a.year); // Newest first
    }, []);

    const handleViewDetails = async (year: number) => {
        setLoadingDetails(year);
        try {
            // Import dynamically from reorganized structure
            const [matchesMod, squadsMod] = await Promise.allSettled([
                import(`../../data/history/${year}/matches.json`),
                import(`../../data/history/${year}/squads.json`)
            ]);

            setSelectedTournament(matchesMod.status === 'fulfilled' ? matchesMod.value.default : null);
            setSelectedSquads(squadsMod.status === 'fulfilled' ? squadsMod.value.default : null);
        } catch (error) {
            console.error('Error loading tournament details:', error);
        } finally {
            setLoadingDetails(null);
        }
    };

    return (
        <div className="space-y-12 py-8 animate-in fade-in duration-700">
            {/* Header with Neon Effect */}
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    Legado <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">Mundialista</span>
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto px-4">
                    Un recorrido histórico por las citas más legendarias del fútbol mundial.
                </p>
            </div>

            {/* Timeline Vertical Layout */}
            <div className="relative container mx-auto px-4 max-w-4xl">
                {/* Vertical Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent -translate-x-1/2 hidden md:block" />

                <div className="space-y-12">
                    {sortedHistory.map((edition, index) => (
                        <TimelineItem
                            key={edition.year}
                            edition={edition}
                            index={index}
                            onViewDetails={() => handleViewDetails(edition.year)}
                            isLoading={loadingDetails === edition.year}
                            hasDetails={DETAILED_YEARS.includes(edition.year)}
                        />
                    ))}
                </div>
            </div>

            {/* Detailed Modal */}
            <AnimatePresence>
                {selectedTournament && (
                    <HistoryDetails
                        tournamentData={selectedTournament}
                        squadsData={selectedSquads}
                        onClose={() => {
                            setSelectedTournament(null);
                            setSelectedSquads(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

interface TimelineItemProps {
    edition: WorldCupEdition;
    index: number;
    onViewDetails: () => void;
    isLoading: boolean;
    hasDetails: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ edition, index, onViewDetails, isLoading, hasDetails }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 relative ${isEven ? 'md:flex-row-reverse' : ''}`}
        >
            {/* Content Side */}
            <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                <div className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]">

                    {/* Glowing Border Gradient on Hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-amber-500 font-black text-2xl tracking-tight font-mono">
                            {edition.year}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-white/5 px-2 py-1 rounded">
                            <MapPin size={12} className="text-zinc-400" />
                            {edition.host}
                        </div>
                    </div>

                    {/* Matchup */}
                    <div className="flex flex-col items-center gap-4 py-2">
                        {/* Winner */}
                        <div className="flex items-center gap-4 w-full justify-between group/winner">
                            <div className="flex items-center gap-3">
                                <img src={edition.winnerFlag} alt={edition.winner} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] pb-1" />
                                <div>
                                    <div className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                                        {edition.winner}
                                        <Trophy size={14} className="text-amber-500" />
                                    </div>
                                    <div className="text-xs text-amber-500/80 font-medium">Campeón</div>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white font-mono tracking-tighter">
                                {edition.score.split('-')[0]}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-white/10 relative">
                            {edition.penalties && (
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-2 text-[10px] text-zinc-500 font-mono whitespace-nowrap border border-white/5 rounded-full">
                                    Pen: {edition.penalties}
                                </span>
                            )}
                            {edition.extraTime && !edition.penalties && (
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-2 text-[10px] text-zinc-500 font-mono whitespace-nowrap border border-white/5 rounded-full">
                                    A.E.T
                                </span>
                            )}
                        </div>

                        {/* Runner Up */}
                        <div className="flex items-center gap-4 w-full justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3">
                                <img src={edition.runnerUpFlag} alt={edition.runnerUp} className="w-8 h-8 object-contain grayscale group-hover:grayscale-0 transition-all pb-1" />
                                <div>
                                    <div className="text-base font-bold text-zinc-300">
                                        {edition.runnerUp}
                                    </div>
                                    <div className="text-xs text-zinc-600 font-medium">Subcampeón</div>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-zinc-400 font-mono tracking-tighter">
                                {edition.score.split('-')[1]}
                            </div>
                        </div>
                    </div>

                    {/* MVP Footer */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="text-xs text-zinc-500 font-mono uppercase">Jugador del Torneo</div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200/90 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                            <Star size={10} className="fill-amber-500/50" />
                            {edition.mvp}
                        </div>
                    </div>

                    {/* View Details Button */}
                    {hasDetails && (
                        <button
                            disabled={isLoading}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails();
                            }}
                            className="w-full mt-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-white transition-all flex items-center justify-center gap-2 overflow-hidden relative group/btn"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Eye size={14} />
                                    <span>Ver Detalles del Mundial</span>
                                </>
                            )}
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
                <div className="w-4 h-4 bg-zinc-900 rounded-full border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10 relative">
                    <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20" />
                </div>
            </div>

            {/* Empty Side for Layout Balance */}
            <div className="w-full md:w-1/2" />
        </motion.div>
    );
};
