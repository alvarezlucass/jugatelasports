import React, { useState, useEffect, useRef } from 'react';
import { Trophy, HelpCircle, Users, Share2, Globe, Youtube, Calendar, MapPin, Swords, Timer, Zap, Target, Bot, CheckCircle2, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { serializeBracket, deserializeBracket } from '../../lib/bracketSharing';
import { ShareModal } from '../user/ShareModal';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';


import { type MatchupNode, generateDemoBracketTree, generateEmptyBracketTree, simulateFullBracket, type SimulationPersona } from '../../lib/bracketLogic';

// --- Types & Constants ---
interface Props {
    initialBracketData?: Record<string, MatchupNode[]>;
    groupTeams?: Record<string, { name: string; flag: string }[]>;
    isReadOnly?: boolean;
}

interface MatchProps {
    matchData: MatchupNode;
    status?: 'pending' | 'predicted' | 'correct';
    isFinal?: boolean;
    isThirdPlace?: boolean;
    isRightSide?: boolean;
    className?: string;
    onPredict?: (teamId: 1 | 2) => void;
    onSelectMethod?: (method: 'REGULAR' | 'EXTRA' | 'PENALTIES') => void;
    onSelectTeam?: (teamId: 1 | 2) => void;
    dragDistanceRef?: React.MutableRefObject<number>;
    isLive?: boolean;
    liveMinute?: number;
    onChallenge?: (match: MatchupNode) => void;
}

// --- Components ---

const useDraggable = () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const startX = React.useRef(0);
    const scrollLeft = React.useRef(0);
    const dragDistance = React.useRef(0);
    const isDragActive = React.useRef(false);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!ref.current) return;
        isDragActive.current = true;
        startX.current = e.clientX - ref.current.offsetLeft;
        scrollLeft.current = ref.current.scrollLeft;
        dragDistance.current = 0;
    };

    const onMouseLeave = () => {
        isDragActive.current = false;
        setIsDragging(false);
        document.body.style.userSelect = '';
        if (ref.current) ref.current.style.cursor = 'grab';
    };

    const onMouseUp = () => {
        isDragActive.current = false;
        setIsDragging(false);
        document.body.style.userSelect = '';
        if (ref.current) ref.current.style.cursor = 'grab';
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragActive.current || !ref.current) return;
        
        const x = e.clientX - ref.current.offsetLeft;
        const walk = (x - startX.current) * 1.5; 
        const dist = Math.abs(walk);
        
        if (dist > 10) {
            if (!isDragging) {
                setIsDragging(true);
                document.body.style.userSelect = 'none';
                ref.current.style.cursor = 'grabbing';
            }
            e.preventDefault();
            ref.current.scrollLeft = scrollLeft.current - walk;
            dragDistance.current = dist;
        }
    };

    return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, isDragging, dragDistance };
};

const ProMatchCard: React.FC<MatchProps> = ({ 
    matchData, status, isFinal, isThirdPlace, isRightSide, className, onPredict, onSelectMethod, onSelectTeam, dragDistanceRef, onChallenge 
}) => {
    const { team1, team2 } = matchData;
    const navigate = useNavigate();

    if (isFinal) {
        return (
            <div className={cn("relative group w-full max-w-[320px] md:max-w-[420px]", className)}>
                {/* Intense Aura Glow */}
                <div className="absolute -inset-8 md:-inset-16 bg-blue-600/10 blur-[100px] rounded-full opacity-30 group-hover:opacity-60 transition-all duration-1000" />

                <div className="relative glass-card rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-10 border border-blue-500/20 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col gap-5 md:gap-10 bg-gradient-to-b from-blue-900/20 to-[#07090E] backdrop-blur-3xl">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                    <div className="flex flex-col items-center gap-5 md:gap-8">
                        <div className="flex items-center justify-center gap-6 md:gap-12 w-full">
                                    <div className="flex flex-col items-center gap-3 md:gap-6 cursor-pointer" onClick={() => team1?.name && team1.name !== 'Por Definir' && onPredict && onPredict(1)}>
                                        <div className={cn(
                                            "w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-[#0F131A] border p-2.5 md:p-5 shadow-2xl flex items-center justify-center transition-all duration-700 ring-1 relative",
                                            team1?.selected ? "border-blue-500 ring-blue-500/50 scale-110 shadow-[0_0_30px_rgba(37,99,235,0.4)]" : "border-white/10 ring-white/5 hover:border-blue-500/50"
                                        )}>
                                            <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {team1?.flag ? <img src={team1.flag} className="w-full h-full object-cover rounded shadow-md relative z-10" alt="" /> : <HelpCircle className="text-white/5 relative z-10" size={28} />}
                                            {matchData.homeScore !== undefined && (
                                                <div className="absolute -right-4 -top-4 w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-3xl font-black shadow-2xl border-2 border-blue-400 rotate-3 animate-in zoom-in duration-500 z-50">
                                                    {matchData.homeScore}
                                                </div>
                                            )}
                                        </div>
                                        <span className={cn("text-[7px] md:text-[10px] font-black uppercase tracking-[0.4em] italic", team1?.selected ? "text-blue-400" : "text-white/30")}>
                                            {team1?.name || "Finalista 1"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group/trophy flex flex-col items-center">
                                            <div className="absolute -inset-10 bg-yellow-500/30 blur-[50px] opacity-0 group-hover/trophy:opacity-100 transition-all duration-1000" />
                                            <Trophy className="w-10 h-10 md:w-20 md:h-20 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.7)] transition-all duration-1000 group-hover/trophy:scale-125" fill="currentColor" />
                                        </div>
                                        {team1?.name && team1.name !== 'Por Definir' && team2?.name && team2.name !== 'Por Definir' && !isReadOnly && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onChallenge) onChallenge(matchData);
                                                    else navigate(`/predictions/match/${matchData.id}?home=${encodeURIComponent(team1.name!)}&away=${encodeURIComponent(team2.name!)}&mode=MACHINE`);
                                                }}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 group/btn"
                                            >
                                                <Swords size={12} className="group-hover/btn:rotate-12 transition-transform" />
                                                Retar
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-2 md:gap-5 cursor-pointer" onClick={() => team2?.name && team2.name !== 'Por Definir' && onPredict && onPredict(2)}>
                                        <div className={cn(
                                            "w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-[#0F131A] border p-2.5 md:p-5 shadow-2xl flex items-center justify-center transition-all duration-700 ring-1 relative",
                                            team2?.selected ? "border-blue-500 ring-blue-500/50 scale-110 shadow-[0_0_30px_rgba(37,99,235,0.4)]" : "border-white/10 ring-white/5 hover:border-blue-500/50"
                                        )}>
                                            <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {team2?.flag ? <img src={team2.flag} className="w-full h-full object-cover rounded shadow-md relative z-10" alt="" /> : <HelpCircle className="text-white/5 relative z-10" size={28} />}
                                            {matchData.awayScore !== undefined && (
                                                <div className="absolute -left-4 -top-4 w-10 h-10 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-3xl font-black shadow-2xl border-2 border-blue-400 -rotate-3 animate-in zoom-in duration-500 z-50">
                                                    {matchData.awayScore}
                                                </div>
                                            )}
                                        </div>
                                        <span className={cn("text-[7px] md:text-[10px] font-black uppercase tracking-[0.4em] italic", team2?.selected ? "text-blue-400" : "text-white/30")}>
                                            {team2?.name || "Finalista 2"}
                                        </span>
                                    </div>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-6 md:w-12 h-px bg-gradient-to-r from-transparent to-white/20" />
                                <h4 className="text-white font-black text-lg md:text-2xl tracking-tighter uppercase italic text-glow">Gran Final Mundial</h4>
                                <div className="w-6 md:w-12 h-px bg-gradient-to-l from-transparent to-white/20" />
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-5 text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full"><Calendar size={12} className="text-blue-500" /> 19 JUL 2026</span>
                                <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full"><MapPin size={12} className="text-blue-500" /> METLIFE STADIUM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handlePredict1 = () => {
        if (team1 && team1.name && team1.name !== 'Por Definir') {
            if (onPredict) onPredict(1);
        } else if (onSelectTeam) {
            onSelectTeam(1);
        }
    };

    const handlePredict2 = () => {
        if (team2 && team2.name && team2.name !== 'Por Definir') {
            if (onPredict) onPredict(2);
        } else if (onSelectTeam) {
            onSelectTeam(2);
        }
    };

    const TeamRow = ({ team, score, onClick, onSelect }: { team: any, score?: number, onClick: () => void, onSelect?: () => void }) => {
        const isEmpty = !team?.name || team?.name === 'Por Definir';
        const isSet = !isEmpty;
        
        const handleClick = (e: React.MouseEvent) => {
            if (dragDistanceRef?.current && dragDistanceRef.current > 10) return;
            if (onSelect && isEmpty) onSelect();
            else if (onSelect && (e.target as HTMLElement).closest('.group\\/source')) onSelect();
            else onClick();
        };

        return (
            <div 
                onClick={handleClick}
                className={cn(
                    "flex items-center justify-between px-3 md:px-6 h-1/2 transition-all relative z-10 cursor-pointer",
                    team?.selected 
                        ? "bg-blue-600/10 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                        : "hover:bg-white/[0.05]",
                    isRightSide ? "flex-row-reverse" : "flex-row"
                )}
            >
                <div className={cn("flex-grow flex items-center gap-3 md:gap-4", isRightSide ? "flex-row-reverse text-right" : "flex-row text-left")}>
                    <div className="flex-shrink-0 w-6 h-4 md:w-8 md:h-5 rounded-[2px] md:rounded-[4px] overflow-hidden border border-white/10 shadow-sm bg-black/40">
                        {team?.flag ? <img src={team.flag} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-white/5" />}
                    </div>
                    <div className={cn("flex flex-col justify-center", isRightSide ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-1.5 mb-1 group/source">
                            <span className={cn(
                                "text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] leading-none transition-all", 
                                onSelect ? "text-blue-400 group-hover/source:text-blue-300" : "text-white/30"
                            )}>
                                {team?.source || "Clasificado"}
                            </span>
                        </div>
                        <span className={cn(
                            "text-[10px] md:text-[13px] font-black tracking-tight uppercase truncate max-w-[120px] leading-none transition-colors",
                            isSet ? (team?.selected ? "text-white" : "text-white/70") : "text-white/25"
                        )}>
                            {isSet ? team.name : (team?.source || 'TBD')}
                        </span>

                        {onSelect && !isSet && (
                            <span className="text-[7px] md:text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Definir Equipo
                            </span>
                        )}
                    </div>
                </div>
                {team?.selected && (
                    <div className="relative flex-shrink-0 ml-2">
                        <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" />
                    </div>
                )}
                {score !== undefined && (
                    <div className={cn(
                        "flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-full bg-blue-600 border border-blue-400 text-white font-black text-[11px] md:text-[14px] shadow-[0_5px_15px_rgba(37,99,235,0.3)] animate-in fade-in zoom-in duration-500",
                        isRightSide ? "mr-3" : "ml-3"
                    )}>
                        {score}
                    </div>
                )}
            </div>
        );
    };

    const isLiveMode = false; // Disabled random simulation mock
    
    return (
        <div className={cn(
            "glass-card border border-white/10 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 group relative h-20 md:h-[100px] flex flex-col justify-center cursor-pointer",
            "w-[var(--card-width)]",
            status === 'predicted' && "border-blue-500/40 shadow-[0_15px_50px_rgba(59,130,246,0.15)]",
            isThirdPlace ? "border-amber-500/30 bg-amber-900/10" : "",
            className
        )}>
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.05]" />
            <TeamRow team={team1} score={matchData.homeScore} onClick={handlePredict1} onSelect={onSelectTeam ? () => onSelectTeam(1) : undefined} />
            <TeamRow team={team2} score={matchData.awayScore} onClick={handlePredict2} onSelect={onSelectTeam ? () => onSelectTeam(2) : undefined} />

            {/* Advance Method Selector */}
            {matchData.winnerId && !isReadOnly && (
                <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-40 bg-[#0F131A]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl transition-all animate-in fade-in zoom-in duration-300",
                    isRightSide ? "right-[calc(100%+12px)]" : "left-[calc(100%+12px)]"
                )}>
                    {(['REGULAR', 'EXTRA', 'PENALTIES'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectMethod) onSelectMethod(m);
                            }}
                            title={m === 'REGULAR' ? 'Tiempo Regular' : m === 'EXTRA' ? 'Alargue' : 'Penales'}
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all group/icon relative",
                                matchData.advanceMethod === m 
                                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {m === 'REGULAR' ? <Timer size={14} /> : m === 'EXTRA' ? <Zap size={14} /> : <Target size={14} />}
                            
                            {/* Label on hover */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 scale-90 group-hover/icon:scale-100 origin-bottom">
                                {m === 'REGULAR' ? '90 MIN' : m === 'EXTRA' ? '120 MIN' : 'PENALES'}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Action overlay on hover for predictions */}
            {team1?.name && team1.name !== 'Por Definir' && team2?.name && team2.name !== 'Por Definir' && !isReadOnly && (
                <div className="absolute inset-0 bg-blue-600/0 transition-colors pointer-events-none z-30">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/predictions/match/${matchData.id}?home=${encodeURIComponent(team1.name!)}&away=${encodeURIComponent(team2.name!)}&mode=MACHINE`);
                        }}
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)] opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all pointer-events-auto flex items-center gap-2 border border-blue-400/50",
                            isRightSide ? "left-4" : "right-4"
                        )}
                    >
                        <Swords size={10} />
                        Desafiar
                    </button>
                </div>
            )}

            {/* Path glow indicator */}
            {status === 'predicted' && (
                <div className={cn(
                    "absolute top-0 bottom-0 w-[4px] md:w-[6px] bg-gradient-to-b from-blue-400 via-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20",
                    isRightSide ? "right-0" : "left-0"
                )} />
            )}
        </div>
    );
};

// --- Main Component ---

export const TournamentBracket: React.FC<Props> = ({ initialBracketData, groupTeams, isReadOnly }) => {
    const draggable = useDraggable(); 
    const { user, userPredictions, opponents, pvpChallenges, createPvpChallenge, spendTokens, canAfford, refreshProfile } = useUser();

    const [isCaptureMode, setIsCaptureMode] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [isSharedView, setIsSharedView] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const shareData = queryParams.get('bracket');
        
        if (shareData) {
            const externalBracket = deserializeBracket(shareData);
            if (externalBracket) {
                // Heal the bracket logic here to ensure teams cascade correctly
                const rounds = ['r32', 'r16', 'r8', 'r4'];
                const healed = JSON.parse(JSON.stringify(externalBracket));
                
                rounds.forEach((rk) => {
                    (healed[rk] || []).forEach((match: any, mi: number) => {
                        if (match._w) { // Winner hint from deserializer
                            const teamId = match._w;
                            
                            // Re-trigger the logic that would normally happen on click
                            // But manually for the whole tree
                            let nextRk: string | null = null;
                            if (rk === 'r32') nextRk = 'r16';
                            else if (rk === 'r16') nextRk = 'r8';
                            else if (rk === 'r8') nextRk = 'r4';
                            else if (rk === 'r4') nextRk = 'final';

                            if (nextRk && healed[nextRk]) {
                                const nmi = Math.floor(mi / 2);
                                const slot = mi % 2 === 0 ? 'team1' : 'team2';
                                const winnerObj = teamId === 1 ? match.team1 : match.team2;
                                if (winnerObj) healed[nextRk][nmi][slot] = { ...winnerObj, selected: false };
                            }
                        }
                    });
                });

                setBracketState(healed);
                setIsSharedView(true);
            }
        }
    }, []);
    
    // Sync predictions with bracket state
    useEffect(() => {
        if (!userPredictions || userPredictions.length === 0) return;
        
        setBracketState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let changed = false;

            Object.keys(newState).forEach(roundKey => {
                const matches = newState[roundKey];
                if (Array.isArray(matches)) {
                    matches.forEach((match: MatchupNode) => {
                        const pred = userPredictions.find(p => p.matchId === match.id);
                        if (pred && pred.exactScore) {
                            if (match.homeScore !== pred.exactScore.home || match.awayScore !== pred.exactScore.away) {
                                match.homeScore = pred.exactScore.home;
                                match.awayScore = pred.exactScore.away;
                                
                                // Auto-set winner based on score if possible
                                if (pred.exactScore.home > pred.exactScore.away) {
                                    match.winnerId = match.team1?.name;
                                    if (match.team1) match.team1.selected = true;
                                    if (match.team2) match.team2.selected = false;
                                } else if (pred.exactScore.away > pred.exactScore.home) {
                                    match.winnerId = match.team2?.name;
                                    if (match.team1) match.team1.selected = false;
                                    if (match.team2) match.team2.selected = true;
                                }
                                changed = true;
                            }
                        }
                    });
                }
            });

            return changed ? newState : prev;
        });
    }, [userPredictions]);
    
    const [challengeStatus, setChallengeStatus] = useState<'idle' | 'opponent_select' | 'submitting' | 'success'>('idle');
    const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
    const [selectingSlot, setSelectingSlot] = useState<{ 
        roundKey: string, 
        matchIndex: number, 
        teamSlot: 1 | 2, 
        groupLetter: string, 
        options?: { name: string, flag: string, parentMatchIndex?: number }[] 
    } | null>(null);
    const [showSyncBanner, setShowSyncBanner] = useState(false);
    const [showChallengeList, setShowChallengeList] = useState(false);
    const [challengingMatch, setChallengingMatch] = useState<MatchupNode | null>(null);

    const handleChallenge = (match: MatchupNode) => {
        setChallengingMatch(match);
    };

    const handleStartChallenge = (mode: 'MACHINE' | 'PVP') => {
        if (!challengingMatch) return;
        const { team1, team2, id } = challengingMatch;
        if (!team1?.name || !team2?.name) return;

        if (mode === 'MACHINE') {
            navigate(`/predictions/match/${id}?home=${encodeURIComponent(team1.name)}&away=${encodeURIComponent(team2.name)}&mode=MACHINE`);
        } else {
            // PVP logic: navigate to profile or show opponent picker
            // For now, let's go to predictions with PVP mode or group context
            navigate(`/predictions?mode=PVP&matchId=${id}&home=${encodeURIComponent(team1.name)}&away=${encodeURIComponent(team2.name)}`);
        }
        setChallengingMatch(null);
    };
    
    // Generate a COMPLETELY EMPTY bracket for fresh starts
    const emptyData = generateEmptyBracketTree();

    const [bracketState, setBracketState] = useState<Record<string, MatchupNode[]>>(() => {
        // Priority 1: If we have initial data from the tournament structure, use it
        // unless we have a clearly better saved state from a REAL logged-in user.
        const saved = localStorage.getItem('wc_bracket_projection');
        
        // We only restore from local storage if there's a real session to avoid viciating guest views
        if (saved && user && !user.id.includes('guest')) { 
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing saved bracket:', e);
            }
        }

        // If no user/saved data, or for guests, use the tournament's initial structure
        if (initialBracketData) {
            // Scrub any 'selected' status that might have leaked into the props
            const cleanData = JSON.parse(JSON.stringify(initialBracketData));
            Object.keys(cleanData).forEach(rk => {
                cleanData[rk].forEach((m: any) => {
                    m.winnerId = undefined;
                    m.homeScore = undefined;
                    m.awayScore = undefined;
                    if (m.team1) m.team1.selected = false;
                    if (m.team2) m.team2.selected = false;
                });
            });
            return cleanData;
        }

        return emptyData;
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('wc_bracket_projection', JSON.stringify(bracketState));
    }, [bracketState]);
    const bracketContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the left on mount so users see the start of the tournament (R32)
    useEffect(() => {
        if (draggable.ref.current) {
            // Give it a tiny delay to ensure layout is ready
            setTimeout(() => {
                if (draggable.ref.current) {
                    draggable.ref.current.scrollLeft = 0;
                }
            }, 100);
        }
    }, [draggable.ref]);

    useEffect(() => {
        // Detect if the R32 base has changed in initialBracketData compared to our current state
        if (initialBracketData && !isSharedView && bracketState.r32) {
            const hasChanges = initialBracketData.r32.some((m, i) => {
                const current = bracketState.r32[i];
                return (m.team1?.name !== current.team1?.name) || (m.team2?.name !== current.team2?.name);
            });
            setShowSyncBanner(hasChanges);
        }
    }, [initialBracketData, isSharedView, bracketState.r32]);

    const handleSyncGroups = () => {
        if (!initialBracketData) return;
        
        setBracketState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            
            // 1. Actualizar base R32
            newState.r32 = initialBracketData.r32.map((m, i) => {
                const current = prev.r32[i];

                return {
                    ...m,
                    team1: m.team1 ? { 
                        ...m.team1, 
                        // Mantenemos selección solo si el equipo es el mismo
                        selected: m.team1.name === current.team1?.name ? current.team1?.selected : false 
                    } : undefined,
                    team2: m.team2 ? { 
                        ...m.team2, 
                        selected: m.team2.name === current.team2?.name ? current.team2?.selected : false 
                    } : undefined
                };
            });

            // 2. Limpieza de cascada para evitar equipos "huérfanos" en rondas superiores
            const rounds = ['r32', 'r16', 'r8', 'r4'];
            rounds.forEach((rk) => {
                const matches = newState[rk];
                if (!Array.isArray(matches)) return;
                
                matches.forEach((match: any, mi: number) => {
                    const winnerId = match.team1?.selected ? 1 : (match.team2?.selected ? 2 : null);
                    
                    let nextRk: string | null = null;
                    if (rk === 'r32') nextRk = 'r16';
                    else if (rk === 'r16') nextRk = 'r8';
                    else if (rk === 'r8') nextRk = 'r4';
                    else if (rk === 'r4') nextRk = 'final';

                    if (nextRk && newState[nextRk]) {
                        const nmi = Math.floor(mi / 2);
                        const slot = mi % 2 === 0 ? 'team1' : 'team2';
                        const winnerObj = winnerId === 1 ? match.team1 : (winnerId === 2 ? match.team2 : null);

                        if (winnerObj && winnerObj.name !== 'Por Definir') {
                            // Si el ganador de esta ronda no coincide con el equipo en la ronda siguiente, lo actualizamos o limpiamos
                            newState[nextRk][nmi][slot] = { ...winnerObj, selected: false };
                        } else {
                            // Si no hay ganador definido aquí, limpiamos el slot en la siguiente ronda
                            const source = nextRk === 'final' ? `Ganador SF ${mi + 1}` : `Ganador ${rk.toUpperCase()} Match ${mi + 1}`;
                            newState[nextRk][nmi][slot] = { name: 'Por Definir', flag: '', source };
                            newState[nextRk][nmi].winnerId = undefined;
                        }
                    }

                    // Caso especial Tercer Puesto
                    if (rk === 'r4' && newState.thirdPlace) {
                        const loserObj = winnerId === 1 ? match.team2 : (winnerId === 2 ? match.team1 : null);
                        const slot = mi === 0 ? 'team1' : 'team2';
                        if (loserObj && loserObj.name !== 'Por Definir') {
                            newState.thirdPlace[0][slot] = { ...loserObj, selected: false };
                        } else {
                            newState.thirdPlace[0][slot] = { name: 'Por Definir', flag: '', source: `Perdedor SF ${mi + 1}` };
                        }
                    }
                });
            });

            return newState;
        });
        setShowSyncBanner(false);
    };

    const handleTeamSelect = (roundKey: string, matchIndex: number, teamSlot: 1 | 2, team: { name: string, flag: string, parentMatchIndex?: number }) => {
        if (isReadOnly) return;
        const newBracket = { ...bracketState };
        const match = newBracket[roundKey][matchIndex];
        const slot = teamSlot === 1 ? 'team1' : 'team2';
        
        // If it was a dynamic selection (consecutive), update the parent too
        if (team.parentMatchIndex !== undefined) {
            let parentRoundKey = '';
            if (roundKey === 'r16') parentRoundKey = 'r32';
            else if (roundKey === 'r8') parentRoundKey = 'r16';
            else if (roundKey === 'r4') parentRoundKey = 'r8';
            else if (roundKey === 'final') parentRoundKey = 'r4';
            else if (roundKey === 'thirdPlace') parentRoundKey = 'r4';

            if (parentRoundKey && newBracket[parentRoundKey]?.[team.parentMatchIndex]) {
                const parentMatch = newBracket[parentRoundKey][team.parentMatchIndex];
                
                // Set the selection in the parent match
                if (parentMatch.team1) parentMatch.team1.selected = parentMatch.team1.name === team.name;
                if (parentMatch.team2) parentMatch.team2.selected = parentMatch.team2.name === team.name;
                
                parentMatch.winnerId = team.name;
                if (!parentMatch.advanceMethod) parentMatch.advanceMethod = 'REGULAR';
            }
        }

        if (match[slot]) {
            match[slot] = { ...match[slot], name: team.name, flag: team.flag, selected: false };
        }

        // Wipe cascade forward
        const wipeCascade = (rk: string, mi: number) => {
            let nextRk: any = null;
            if (rk === 'r32') nextRk = 'r16';
            else if (rk === 'r16') nextRk = 'r8';
            else if (rk === 'r8') nextRk = 'r4';
            else if (rk === 'r4') nextRk = 'final';

            if (!nextRk) return;

            const nmi = Math.floor(mi / 2);
            const nextSlot = mi % 2 === 0 ? 'team1' : 'team2';

            if (newBracket[nextRk]?.[nmi]) {
                const source = nextRk === 'final' ? `Ganador SF ${mi + 1}` : `Ganador ${rk.toUpperCase()} Match ${mi + 1}`;
                newBracket[nextRk][nmi][nextSlot] = { name: 'Por Definir', flag: '', source };
                newBracket[nextRk][nmi].winnerId = undefined;
                wipeCascade(nextRk, nmi);
            }
        };

        wipeCascade(roundKey, matchIndex);
        setBracketState(newBracket);
        setSelectingSlot(null);
    };



    const handleMatchPredict = (roundKey: keyof typeof bracketState, matchIndex: number, teamId: 1 | 2) => {
        if (isReadOnly) return;
        let nextRoundKey: keyof typeof bracketState | null = null;
        if (roundKey === 'r32') nextRoundKey = 'r16';
        else if (roundKey === 'r16') nextRoundKey = 'r8';
        else if (roundKey === 'r8') nextRoundKey = 'r4';
        else if (roundKey === 'r4') nextRoundKey = 'final';

        if (!nextRoundKey && roundKey !== 'final' && roundKey !== 'thirdPlace') return;

        const newBracket = { ...bracketState };
        const currentMatch = newBracket[roundKey][matchIndex];
        
        if (currentMatch.team1) currentMatch.team1.selected = teamId === 1;
        if (currentMatch.team2) currentMatch.team2.selected = teamId === 2;
        currentMatch.winnerId = teamId === 1 ? currentMatch.team1?.name : currentMatch.team2?.name;
        
        if (!currentMatch.advanceMethod) currentMatch.advanceMethod = 'REGULAR';

        const wipeCascade = (rk: string, mi: number) => {
            let nextRk: any = null;
            if (rk === 'r32') nextRk = 'r16';
            else if (rk === 'r16') nextRk = 'r8';
            else if (rk === 'r8') nextRk = 'r4';
            else if (rk === 'r4') nextRk = 'final';

            if (!nextRk) return;

            const nmi = Math.floor(mi / 2);
            const slot = mi % 2 === 0 ? 'team1' : 'team2';

            if (rk === 'r4') {
                if (newBracket.final?.[0]) {
                    newBracket.final[0][slot] = { name: 'Por Definir', flag: '', source: `Ganador Semifinal ${mi + 1}` };
                    newBracket.final[0].winnerId = undefined;
                }
                if (newBracket.thirdPlace?.[0]) {
                    newBracket.thirdPlace[0][slot] = { name: 'Por Definir', flag: '', source: `Perdedor Semifinal ${mi + 1}` };
                    newBracket.thirdPlace[0].winnerId = undefined;
                }
                return;
            }

            if (newBracket[nextRk]?.[nmi]) {
                const source = `Ganador ${rk.toUpperCase()} Match ${mi + 1}`;
                newBracket[nextRk][nmi][slot] = { name: 'Por Definir', flag: '', source };
                newBracket[nextRk][nmi].winnerId = undefined;
                wipeCascade(nextRk, nmi);
            }
        };

        wipeCascade(roundKey, matchIndex);

        if (roundKey === 'r4') {
            const slotInFinal = matchIndex === 0 ? 'team1' : 'team2';
            const slotInThird = matchIndex === 0 ? 'team1' : 'team2';
            const winnerObj = teamId === 1 ? currentMatch.team1 : currentMatch.team2;
            const loserObj = teamId === 1 ? currentMatch.team2 : currentMatch.team1;

            if (winnerObj && newBracket.final?.[0]) {
                newBracket.final[0][slotInFinal] = { ...winnerObj, selected: false };
            }
            if (loserObj && newBracket.thirdPlace?.[0]) {
                newBracket.thirdPlace[0][slotInThird] = { ...loserObj, selected: false };
            }
        } else if (nextRoundKey && newBracket[nextRoundKey]) {
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const slotInNextMatch = matchIndex % 2 === 0 ? 'team1' : 'team2';
            
            const winnerObj = teamId === 1 ? currentMatch.team1 : currentMatch.team2;
            if (winnerObj && newBracket[nextRoundKey][nextMatchIndex]) {
                newBracket[nextRoundKey][nextMatchIndex][slotInNextMatch] = { ...winnerObj, selected: false };
            }
        }

        if (roundKey === 'final') {
            const winner = teamId === 1 ? currentMatch.team1?.name : currentMatch.team2?.name;
            if (winner && winner !== 'Por Definir') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#2563eb', '#fbbf24', '#ffffff']
                });
            }
        }

        setBracketState(newBracket);
    };

    const handleMethodSelect = (roundKey: keyof typeof bracketState, matchIndex: number, method: 'REGULAR' | 'EXTRA' | 'PENALTIES') => {
        if (isReadOnly) return;
        const newBracket = { ...bracketState };
        const currentMatch = newBracket[roundKey][matchIndex];
        currentMatch.advanceMethod = method;
        setBracketState(newBracket);
    };

    const countPredictions = () => {
        let count = 0;
        Object.values(bracketState).forEach((round: any) => {
            if (Array.isArray(round)) {
                round.forEach((m: any) => { if (m.winnerId) count++; });
            }
        });
        return count;
    };

    const handleShareBracket = () => {
        const encoded = serializeBracket(bracketState);
        const url = `${window.location.host === 'localhost:5173' ? 'http://localhost:5173' : window.location.origin}${window.location.pathname}?bracket=${encodeURIComponent(encoded)}`;
        setShareUrl(url);
        setIsShareModalOpen(true);
    };



    const handleSaveBracket = async () => {
        if (!user) {
            alert('¡Inicia sesión para poder jugar, desafiar y guardar tu llave del Mundial!');
            return;
        }

        const predicted = countPredictions();
        if (predicted < 1) {
            alert(`¡Llave Vacía! Debes predecir al menos 1 partido para poder desafiar.`);
            return;
        }

        setChallengeStatus('opponent_select');
    };

    const handleResetBracket = () => {
        if (!confirm('¿Estás seguro de que quieres limpiar todas tus predicciones actuales?')) return;
        
        // Reset to initial baseline teams (Qualified from groups)
        const baseline = initialBracketData || generateDemoBracketTree();
        
        // Deep clone baseline but ensure all selections are cleared
        const cleaned = JSON.parse(JSON.stringify(baseline));
        Object.values(cleaned).forEach((round: any) => {
            if (Array.isArray(round)) {
                round.forEach((m: any) => {
                    m.winnerId = undefined;
                    m.homeScore = undefined;
                    m.awayScore = undefined;
                    m.advanceMethod = undefined;
                    if (m.team1) m.team1.selected = false;
                    if (m.team2) m.team2.selected = false;
                });
            }
        });

        setBracketState(cleaned);
        localStorage.removeItem('wc_bracket_projection');
    };

    const confirmChallenge = async () => {
        if (!selectedOpponent || !user) return;
        
        const stakeAmount = 100;
        if (!canAfford(stakeAmount)) {
            alert('No tienes tokens suficientes (Costo: 100 TKNS)');
            return;
        }

        setChallengeStatus('submitting');
        
        try {
            // Generate Opponent Bracket if it's an AI Persona
            let opponentBracket: any = null;
            let initialStatus: 'PENDING' | 'ACCEPTED' = 'PENDING';

            if (selectedOpponent.isAI) {
                const personaMap: Record<string, SimulationPersona> = {
                    'ai-profe': 'IA',
                    'ai-contra': 'Contra',
                    'ai-loco': 'Loco'
                };
                const persona = personaMap[selectedOpponent.id] || 'IA';
                
                // For the machine, we simulate a FRESH bracket from the R32 baseline 
                // to see how it compares to the user's choices.
                const baseline = { r32: bracketState.r32.map(m => ({ ...m, winnerId: undefined, homeScore: undefined, awayScore: undefined })) };
                opponentBracket = simulateFullBracket(baseline, persona);
                initialStatus = 'ACCEPTED';
            }

            const pvpData = {
                creatorId: user.id,
                creatorName: user.name,
                creatorAvatar: user.avatar,
                targetId: selectedOpponent.id,
                targetName: selectedOpponent.name,
                targetAvatar: selectedOpponent.avatar,
                matchId: 'BRACKET_2026_WC',
                matchHomeTeam: 'Llave Proyectada',
                matchAwayTeam: 'Camino a la Final',
                amount: stakeAmount,
                creatorSelection: 'HOME' as const, 
                creatorHomeScore: 0,
                creatorAwayScore: 0,
                isBracketChallenge: true,
                bracketState: JSON.stringify(bracketState),
                opponentBracketState: opponentBracket ? JSON.stringify(opponentBracket) : undefined,
                status: initialStatus
            };

            await spendTokens(stakeAmount, `Desafío de Llave contra ${selectedOpponent.name}`);
            await createPvpChallenge(pvpData as any);

            setChallengeStatus('success');
            refreshProfile();
        } catch (error) {
            console.error('Error creating challenge:', error);
            alert('Hubo un error al crear el desafío.');
            setChallengeStatus('idle');
        }
    };

    const totalPredicted = countPredictions();

    const leftR32 = bracketState.r32?.slice(0, 8) || [];
    const rightR32 = bracketState.r32?.slice(8, 16) || [];
    const leftR16 = bracketState.r16?.slice(0, 4) || [];
    const rightR16 = bracketState.r16?.slice(4, 8) || [];
    const leftR8 = bracketState.r8?.slice(0, 2) || [];
    const rightR8 = bracketState.r8?.slice(2, 4) || [];
    const leftR4 = bracketState.r4?.slice(0, 1) || [];
    const rightR4 = bracketState.r4?.slice(1, 2) || [];
    const finalMatch = bracketState.final?.[0];
    const thirdPlaceMatch = bracketState.thirdPlace?.[0];

    return (
        <div 
            ref={bracketContainerRef}
            className={cn(
                "space-y-12 md:space-y-24 py-12 md:py-24 select-none bg-[#07090E] relative overflow-hidden min-h-screen",
                isCaptureMode && "py-0 bg-black"
            )}
        >
            {/* Share Modal */}
            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                shareUrl={shareUrl} 
                title={`¡Mira mi predicción del Mundial 2026! ¿Quién es tu campeón?`}
            />

            {/* Shared View Badge */}
            {isSharedView && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 backdrop-blur-md rounded-full border border-blue-500/30 shadow-2xl">
                        <Users size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Viendo Predicción Compartida</span>
                        <button 
                            onClick={() => {
                                setBracketState(generateDemoBracketTree());
                                setIsSharedView(false);
                            }}
                            className="ml-2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X size={10} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Control Bar - Viral Features - Moved to Challenge Flow per User Feedback */}

            {/* Capture Mode Overlay Close */}
            {isCaptureMode && (
                <div className="fixed top-8 right-8 z-[100] animate-in fade-in zoom-in duration-500">
                    <button 
                        onClick={() => setIsCaptureMode(false)}
                        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl"
                    >
                        <X size={28} />
                    </button>
                </div>
            )}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04)_0%,transparent_70%)]" />
            </div>

            {/* Poster Mode Overlay */}
            {isCaptureMode && (
                <div className="flex flex-col items-center justify-center mb-16 text-center animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 mb-6 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                        <Trophy size={48} className="text-white" />
                    </div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2">Mundial 2026</h1>
                    <p className="text-blue-400 font-bold text-xl uppercase tracking-[0.5em]">Mi Predicción Oficial</p>
                    <div className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
                        <span className="text-white/60 font-black uppercase text-sm tracking-widest">Predicho por <span className="text-white">{user?.name || 'Invitado'}</span></span>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                :root { 
                    --base-height: 110px;
                    --round-gap: 60px;
                    --card-width: 200px;
                }
                @media (min-width: 768px) {
                    :root { 
                        --base-height: 120px; 
                        --round-gap: 80px;
                        --card-width: 230px;
                    }
                }
                @media (min-width: 1440px) {
                    :root { 
                        --base-height: 130px; 
                        --round-gap: 100px;
                        --card-width: 250px;
                    }
                }
                @media (min-width: 2560px) {
                    :root {
                        --base-height: 150px;
                        --round-gap: 120px;
                        --card-width: 280px;
                    }
                }
                .styled-scrollbar::-webkit-scrollbar { height: 8px; background: transparent; }
                .styled-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
                .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
                .scroll-container { cursor: grab; }
                .scroll-container:active { cursor: grabbing; }
            `}} />

            {/* Bracket Navigation/Sync Area */}
            <div className="relative z-50 flex flex-col items-center gap-4 mb-8">
                <AnimatePresence>
                    {showSyncBanner && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0, y: -20 }}
                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -20 }}
                            className="w-full max-w-2xl px-4"
                        >
                            <div className="bg-blue-600/10 border border-blue-500/30 rounded-[1.5rem] p-4 flex items-center justify-between gap-4 backdrop-blur-xl shadow-[0_0_30px_rgba(37,99,235,0.15)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <RefreshCw size={20} className="text-blue-400 animate-spin-slow" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Nuevos Clasificados</div>
                                        <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Tus predicciones de grupos han actualizado las llaves.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSyncGroups}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    Sincronizar Bracket
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div 
                ref={draggable.ref}
                onMouseDown={draggable.onMouseDown}
                onMouseLeave={draggable.onMouseLeave}
                onMouseUp={draggable.onMouseUp}
                onMouseMove={draggable.onMouseMove}
                className="relative z-10 overflow-x-auto styled-scrollbar pb-32 w-full"
                style={{ cursor: draggable.isDragging ? 'grabbing' : 'grab' }}
            >
                <div className="min-w-[2800px] md:min-w-[3400px] py-12 flex justify-start scroll-smooth px-12 md:px-48">
                    <div className="flex">

                        {/* LEFT SIDE */}
                        <div className="w-[var(--card-width)] flex-shrink-0">
                            <div className="mb-14 px-8 border-l-4 border-blue-600/20">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">16avos</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {leftR32.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[var(--base-height)]">
                                        <ProMatchCard
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r32', i, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r32', i, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const source = teamSlot === 1 ? match.team1?.source : match.team2?.source;
                                                const groupLetter = source?.match(/Grupo ([A-L])/)?.[1] || '';
                                                setSelectingSlot({ 
                                                    roundKey: 'r32', 
                                                    matchIndex: i, 
                                                    teamSlot, 
                                                    groupLetter: groupLetter || 'A' // Default to A or show global selector if empty
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                        {i % 2 === 0 && (
                                            <div className="absolute left-[calc(var(--card-width)-10px)] top-1/2 w-[var(--round-gap)] h-[var(--base-height)] border-y-2 border-r-2 border-white/10 rounded-r-[2rem] z-0">
                                                <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0F131A] border-2 border-white/20 rounded-full" />
                                                <div className="absolute right-[calc(var(--round-gap)*-1)] top-1/2 -translate-y-1/2 w-[var(--round-gap)] h-[2px] bg-white/[0.05]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-[var(--card-width)] flex-shrink-0 ml-[calc(var(--round-gap)+20px)]">
                            <div className="mb-14 px-10 border-l-4 border-blue-600/40">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">Octavos</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {leftR16.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[calc(var(--base-height)*2)]">
                                        <ProMatchCard
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r16', i, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r16', i, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = i * 2 + (teamSlot - 1);
                                                const parentMatch = bracketState.r32[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'r16', 
                                                    matchIndex: i, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                        {i % 2 === 0 && (
                                            <div className="absolute left-[calc(var(--card-width)-10px)] top-1/2 w-[var(--round-gap)] h-[calc(var(--base-height)*2)] border-y-2 border-r-2 border-white/10 rounded-r-[3rem] z-0">
                                                <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0F131A] border-2 border-white/20 rounded-full" />
                                                <div className="absolute right-[calc(var(--round-gap)*-1)] top-1/2 -translate-y-1/2 w-[var(--round-gap)] h-[2px] bg-white/[0.05]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-[var(--card-width)] flex-shrink-0 ml-[calc(var(--round-gap)+20px)]">
                            <div className="mb-14 px-10 border-l-4 border-white/20">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">Cuartos</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {leftR8.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[calc(var(--base-height)*4)]">
                                        <ProMatchCard
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r8', i, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r8', i, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = i * 2 + (teamSlot - 1);
                                                const parentMatch = bracketState.r16[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'r8', 
                                                    matchIndex: i, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                        {i % 2 === 0 && (
                                            <div className="absolute left-[calc(var(--card-width)-10px)] top-1/2 w-[var(--round-gap)] h-[calc(var(--base-height)*4)] border-y-2 border-r-2 border-white/10 rounded-r-[4rem] z-0">
                                                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#0F131A] border-[3px] border-white/20 rounded-full" />
                                                <div className="absolute right-[calc(var(--round-gap)*-1.2)] top-1/2 -translate-y-1/2 w-[calc(var(--round-gap)*1.2)] h-[2px] bg-white/[0.05]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-[var(--card-width)] flex-shrink-0 ml-[calc(var(--round-gap)*1.2+20px)]">
                            <div className="mb-14 px-10 border-l-4 border-yellow-500/30">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">Semis</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {leftR4.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[calc(var(--base-height)*8)]">
                                        <ProMatchCard
                                            className="scale-105 shadow-[0_0_50px_rgba(234,179,8,0.1)] ring-1 ring-yellow-500/20"
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r4', i, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r4', i, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = i * 2 + (teamSlot - 1);
                                                const parentMatch = bracketState.r8[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'r4', 
                                                    matchIndex: i, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CENTER */}
                        <div className="w-[450px] md:w-[600px] flex-shrink-0 relative flex flex-col items-center justify-center px-8" style={{ height: 'calc(var(--base-height) * 8)' }}>
                            <div className="w-full flex-grow flex flex-col items-center justify-center gap-20">
                                <div className="flex flex-col items-center gap-12 w-full mt-[-80px]">
                                    {finalMatch && (
                                        <ProMatchCard 
                                            isFinal 
                                            matchData={finalMatch} 
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(t) => handleMatchPredict('final', 0, t)}
                                            onSelectMethod={(method) => handleMethodSelect('final', 0, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = teamSlot === 1 ? 0 : 1;
                                                const parentMatch = bracketState.r4[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'final', 
                                                    matchIndex: 0, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                    )}
                                </div>
                                {thirdPlaceMatch && (
                                    <div className="flex flex-col items-center w-[var(--card-width)] opacity-90 hover:opacity-100 transition-opacity">
                                        <div className="px-6 py-2 mb-4 rounded-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-3xl">
                                            <h3 className="text-[10px] md:text-[11px] font-black text-orange-400 uppercase tracking-widest text-glow leading-none">Tercer Puesto</h3>
                                        </div>
                                        <ProMatchCard 
                                            isThirdPlace
                                            matchData={thirdPlaceMatch} 
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(t) => handleMatchPredict('thirdPlace', 0, t)}
                                            onSelectMethod={(method) => handleMethodSelect('thirdPlace', 0, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = teamSlot === 1 ? 0 : 1;
                                                const parentMatch = bracketState.r4[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'thirdPlace', 
                                                    matchIndex: 0, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="w-[var(--card-width)] flex-shrink-0 mr-[calc(var(--round-gap)*1.2+20px)]">
                            <div className="mb-14 px-10 border-r-4 border-yellow-500/30 text-right">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">Semis</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {rightR4.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[calc(var(--base-height)*8)]">
                                        <ProMatchCard
                                            isRightSide
                                            className="scale-105 shadow-[0_0_50px_rgba(234,179,8,0.1)] ring-1 ring-yellow-500/20"
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r4', i + 1, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r4', i + 1, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = (i + 1) * 2 + (teamSlot - 1);
                                                const parentMatch = bracketState.r8[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'r4', 
                                                    matchIndex: i + 1, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-[var(--card-width)] flex-shrink-0 mr-[calc(var(--round-gap)+20px)]">
                            <div className="mb-14 px-10 border-r-4 border-white/20 text-right">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">Cuartos</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {rightR8.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[calc(var(--base-height)*4)]">
                                        {i % 2 === 0 && (
                                            <div className="absolute right-[calc(var(--card-width)-10px)] top-1/2 w-[var(--round-gap)] h-[calc(var(--base-height)*4)] border-y-2 border-l-2 border-white/10 rounded-l-[4rem] z-0">
                                                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-[#0F131A] border-[3px] border-white/20 rounded-full" />
                                                <div className="absolute left-[calc(var(--round-gap)*-1.2)] top-1/2 -translate-y-1/2 w-[calc(var(--round-gap)*1.2)] h-[2px] bg-white/[0.05]" />
                                            </div>
                                        )}
                                        <ProMatchCard
                                            isRightSide
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r8', i + 2, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r8', i + 2, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = (i + 2) * 2 + (teamSlot - 1);
                                                const parentMatch = bracketState.r16[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'r8', 
                                                    matchIndex: i + 2, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-[var(--card-width)] flex-shrink-0 mr-[calc(var(--round-gap)+20px)]">
                            <div className="mb-14 px-10 border-r-4 border-blue-600/40 text-right">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">Octavos</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {rightR16.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[calc(var(--base-height)*2)]">
                                        {i % 2 === 0 && (
                                            <div className="absolute right-[calc(var(--card-width)-10px)] top-1/2 w-[var(--round-gap)] h-[calc(var(--base-height)*2)] border-y-2 border-l-2 border-white/10 rounded-l-[3rem] z-0">
                                                <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0F131A] border-2 border-white/20 rounded-full" />
                                                <div className="absolute left-[calc(var(--round-gap)*-1)] top-1/2 -translate-y-1/2 w-[var(--round-gap)] h-[2px] bg-white/[0.05]" />
                                            </div>
                                        )}
                                        <ProMatchCard
                                            isRightSide
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r16', i + 4, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r16', i + 4, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const parentMatchIndex = (i + 4) * 2 + (teamSlot - 1);
                                                const parentMatch = bracketState.r32[parentMatchIndex];
                                                const options: any[] = [];
                                                if (parentMatch.team1) options.push({ ...parentMatch.team1, parentMatchIndex });
                                                if (parentMatch.team2) options.push({ ...parentMatch.team2, parentMatchIndex });

                                                setSelectingSlot({ 
                                                    roundKey: 'r16', 
                                                    matchIndex: i + 4, 
                                                    teamSlot, 
                                                    groupLetter: 'A',
                                                    options: options.length > 0 ? options : undefined
                                                });
                                            }}
                                            onChallenge={handleChallenge}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-[var(--card-width)] flex-shrink-0">
                            <div className="mb-14 px-8 border-r-4 border-blue-600/20 text-right">
                                <h3 className="text-[12px] md:text-[14px] font-black text-white/40 uppercase tracking-[0.6em]">16avos</h3>
                            </div>
                            <div className="flex flex-col relative" style={{ height: 'calc(var(--base-height) * 8)' }}>
                                {rightR32.map((match, i) => (
                                    <div key={match.id} className="relative flex items-center h-[var(--base-height)]">
                                        {i % 2 === 0 && (
                                            <div className="absolute right-[calc(var(--card-width)-10px)] top-1/2 w-[var(--round-gap)] h-[var(--base-height)] border-y-2 border-l-2 border-white/10 rounded-l-[2rem] z-0">
                                                <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0F131A] border-2 border-white/20 rounded-full" />
                                                <div className="absolute left-[calc(var(--round-gap)*-1)] top-1/2 -translate-y-1/2 w-[var(--round-gap)] h-[2px] bg-white/[0.05]" />
                                            </div>
                                        )}
                                        <ProMatchCard
                                            isRightSide
                                            matchData={match}
                                            status={(match.winnerId || match.homeScore !== undefined) ? 'predicted' : 'pending'}
                                            dragDistanceRef={draggable.dragDistance}
                                            onPredict={(teamId) => handleMatchPredict('r32', i + 8, teamId)}
                                            onSelectMethod={(method) => handleMethodSelect('r32', i + 8, method)}
                                            onSelectTeam={(teamSlot) => {
                                                const source = teamSlot === 1 ? match.team1?.source : match.team2?.source;
                                                const groupLetter = source?.match(/Grupo ([A-L])/)?.[1] || '';
                                                setSelectingSlot({ 
                                                    roundKey: 'r32', 
                                                    matchIndex: i + 8, 
                                                    teamSlot, 
                                                    groupLetter: groupLetter || 'A' 
                                                });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                {/* --- Challenge Mode Selection Modal --- */}
                <AnimatePresence>
                    {challengingMatch && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setChallengingMatch(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            
                            <motion.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                className="relative w-full max-w-lg bg-[#0F131A] border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl"
                            >
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

                                <div className="relative z-10 space-y-8 text-center">
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                                            <Swords size={40} className="text-blue-500" />
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                                            Elegí tu <span className="text-blue-500">Modo</span>
                                        </h3>
                                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                                            {challengingMatch.team1?.name} vs {challengingMatch.team2?.name}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => handleStartChallenge('MACHINE')}
                                            className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-blue-600/5 transition-all text-left flex items-center gap-6"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-[#0F131A] flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all shrink-0">
                                                <Bot size={24} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1">IA Simulator</h4>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">Retar a la inteligencia artificial</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleStartChallenge('PVP')}
                                            className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-amber-500/50 hover:bg-amber-600/5 transition-all text-left flex items-center gap-6"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-[#0F131A] flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 transition-all shrink-0">
                                                <Users size={24} className="text-amber-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1">Duelo PvP</h4>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">Desafío directo contra un rival</p>
                                            </div>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setChallengingMatch(null)}
                                        className="w-full py-4 text-xs font-black text-zinc-600 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Team Selector Modal */}
                {selectingSlot && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md bg-black/60 shadow-3xl">
                    <div className="absolute inset-0" onClick={() => setSelectingSlot(null)} />
                    <div className="relative glass-card bg-[#0F131A] border border-white/10 rounded-[2rem] p-8 max-w-2xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.9)] animate-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter">
                                    {selectingSlot.options ? "Definir Clasificado" : "Selecciona Clasificado"}
                                </h3>
                                <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                                    {selectingSlot.options ? "Elige el ganador del partido previo" : "Navega por los Grupos"}
                                </p>
                            </div>
                            <button onClick={() => setSelectingSlot(null)} className="text-white/40 hover:text-white transition-colors uppercase text-[10px] font-black">Cerrar</button>
                        </div>
                        
                        {selectingSlot.options ? (
                            <div className="grid grid-cols-2 gap-6">
                                {selectingSlot.options.map((team: any) => (
                                    <button
                                        key={team.name}
                                        onClick={() => handleTeamSelect(selectingSlot.roundKey, selectingSlot.matchIndex, selectingSlot.teamSlot, team)}
                                        className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-blue-600/5 group-hover:opacity-100 opacity-0 transition-opacity" />
                                        <div className="w-24 h-16 rounded-xl overflow-hidden border border-white/10 shadow-2xl group-hover:scale-110 transition-transform relative z-10">
                                            <img src={team.flag} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="text-center relative z-10">
                                            <span className="text-white font-black text-xs md:text-sm uppercase tracking-widest">{team.name}</span>
                                            <div className="text-blue-400 text-[8px] font-black uppercase tracking-[0.2em] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Avanzar a la Llave</div>
                                        </div>
                                    </button>
                                ))}
                                {selectingSlot.options.every(t => t.name === 'Por Definir') && (
                                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Primero debes definir los equipos en la ronda anterior</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Group Tabs for easier navigation - Only for R32/Full Selection */}
                                <div className="flex flex-wrap gap-2 mb-8 p-2 bg-white/5 rounded-2xl border border-white/5">
                                    {groupTeams && Object.keys(groupTeams).map(letter => (
                                        <button
                                            key={letter}
                                            onClick={() => setSelectingSlot({ ...selectingSlot, groupLetter: letter })}
                                            className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                                                selectingSlot.groupLetter === letter ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:bg-white/10"
                                            )}
                                        >
                                            {letter}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {groupTeams && groupTeams[selectingSlot.groupLetter]?.map((team) => (
                                        <button
                                            key={team.name}
                                            onClick={() => handleTeamSelect(selectingSlot.roundKey, selectingSlot.matchIndex, selectingSlot.teamSlot, team)}
                                            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500 transition-all group"
                                        >
                                            <div className="w-12 h-9 rounded-md overflow-hidden border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                                                <img src={team.flag} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="text-white font-black text-[9px] uppercase tracking-tight text-center leading-tight truncate w-full">{team.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}



            {/* Hub */}
            <div className={cn("fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 w-full max-w-[90vw] md:max-w-2xl", totalPredicted > 0 ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0")}>
                <div className="glass-card bg-[#0F131A]/95 border border-white/10 rounded-[2.5rem] p-4 md:p-6 shadow-3xl flex flex-col gap-6 backdrop-blur-3xl">
                    {challengeStatus === 'idle' && (
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex flex-col">
                                <span className="text-[12px] font-black text-blue-400 uppercase tracking-widest italic mb-1">PROYECCIÓN MUNDIALISTA</span>
                                <span className="text-white font-black text-sm md:text-xl uppercase tracking-tighter italic">{totalPredicted} de 32 partidos</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleResetBracket}
                                    title="Limpiar Llave"
                                    className="p-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-red-400 rounded-2xl transition-all active:scale-95 border border-white/5"
                                >
                                    <RefreshCw size={20} />
                                </button>

                                <button 
                                    onClick={() => setShowChallengeList(true)}
                                    title="Mis Desafíos"
                                    className="p-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-blue-400 rounded-2xl transition-all active:scale-95 border border-white/5 flex items-center gap-2"
                                >
                                    <Swords size={20} />
                                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest pt-0.5">Mis Retos ({pvpChallenges.filter(c => c.isBracketChallenge).length})</span>
                                </button>

                                <button onClick={handleSaveBracket} className="px-8 md:px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] md:text-[12px] shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3">
                                    <Zap size={18} /> ¡Jugatela!
                                </button>
                            </div>
                        </div>
                    )}
                    {challengeStatus === 'opponent_select' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-black text-lg md:text-2xl uppercase italic">Elige tu Oponente</h3>
                                    <p className="text-blue-400 font-bold text-[9px] uppercase tracking-widest mt-1">Costo: 100 TKNS</p>
                                </div>
                                <button onClick={() => setChallengeStatus('idle')} className="text-white/40 hover:text-white uppercase text-[10px] font-black transition-colors">Cancelar</button>
                            </div>

                            <div className="space-y-8">
                                {/* Machines Section */}
                                <div className="space-y-4">
                                    <h4 className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">Retar a Expertos (Máquinas)</h4>
                                    <div className="flex gap-4 overflow-x-auto pb-4 styled-scrollbar">
                                        {opponents.filter(op => op.isAI).map((op: any) => (
                                            <button 
                                                key={op.id} 
                                                onClick={() => setSelectedOpponent(op)} 
                                                className={cn(
                                                    "flex-shrink-0 flex flex-col items-center gap-4 p-5 rounded-[2rem] border transition-all w-36 md:w-44 group relative overflow-hidden",
                                                    selectedOpponent?.id === op.id ? "bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/30" : "bg-white/5 border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <div className="relative z-10">
                                                    <div className={cn(
                                                        "w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all",
                                                        selectedOpponent?.id === op.id ? "border-white" : "border-white/10 group-hover:scale-110"
                                                    )}>
                                                        <img src={op.avatar} className="w-full h-full rounded-full" alt="" />
                                                    </div>
                                                    <Bot size={20} className={cn("absolute -bottom-1 -right-1", selectedOpponent?.id === op.id ? "text-white" : "text-blue-400")} />
                                                </div>
                                                <div className="text-center relative z-10">
                                                    <p className={cn("font-black text-[11px] md:text-[13px] uppercase tracking-tight", selectedOpponent?.id === op.id ? "text-white" : "text-white/90")}>{op.name}</p>
                                                    <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-1", selectedOpponent?.id === op.id ? "text-white/70" : "text-blue-400/50")}>
                                                        {op.id === 'ai-contra' ? 'Contra-Llave' : op.id === 'ai-loco' ? 'Caótico (Loco)' : 'Equilibrado (IA)'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Friends Section */}
                                <div className="space-y-4">
                                    <h4 className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">Retar a Amigos</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {opponents.filter(op => !op.isAI).slice(0, 8).map((op: any) => (
                                            <button 
                                                key={op.id} 
                                                onClick={() => setSelectedOpponent(op)} 
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                                                    selectedOpponent?.id === op.id ? "bg-blue-600/20 border-blue-500" : "bg-white/5 border-white/10"
                                                )}
                                            >
                                                <img src={op.avatar} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                                                <p className="text-white font-black text-[10px] uppercase truncate flex-grow text-left">{op.name}</p>
                                                {selectedOpponent?.id === op.id && <CheckCircle2 size={14} className="text-blue-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {selectedOpponent && (
                                <div className="pt-4 border-t border-white/5 animate-in slide-in-from-bottom-4 duration-500">
                                    <button 
                                        onClick={confirmChallenge} 
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[12px] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <Swords size={20} />
                                        {selectedOpponent.isAI ? `Desafiar a ${selectedOpponent.name} (Automático)` : `Enviar Reto a ${selectedOpponent.name}`}
                                    </button>
                                    {!selectedOpponent.isAI && (
                                        <p className="text-center text-white/30 text-[8px] font-black uppercase tracking-[0.3em] mt-4 italic">
                                            El reto quedará en PENDIENTE hasta que {selectedOpponent.name} lo acepte
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {challengeStatus === 'submitting' && <div className="py-12 flex flex-col items-center gap-6"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /><p className="text-white font-black uppercase text-[12px]">Creando...</p></div>}
                    {challengeStatus === 'success' && (
                        <div className="py-8 flex flex-col items-center gap-8 w-full animate-in zoom-in duration-500">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                    <CheckCircle2 className="text-green-500" size={32} />
                                </div>
                                <h3 className="text-white font-black text-2xl md:text-3xl uppercase italic tracking-tighter text-glow-green">¡Desafío Guardado!</h3>
                                <p className="text-zinc-400 font-bold text-[10px] md:text-[12px] uppercase tracking-[0.2em] max-w-[80%]">Tu llave ha sido registrada con éxito. ¿Qué quieres hacer ahora?</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                <button 
                                    onClick={() => {
                                        setChallengeStatus('idle');
                                        handleResetBracket();
                                    }}
                                    className="flex items-center justify-center gap-3 p-5 rounded-[1.5rem] bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95 group"
                                >
                                    <RefreshCw size={20} className="text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
                                    <span className="text-[10px] font-black uppercase tracking-widest pt-1">Limpiar y Nuevo Reto</span>
                                </button>
                                
                                <button 
                                    onClick={handleShareBracket}
                                    className="flex items-center justify-center gap-3 p-5 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 shadow-xl shadow-blue-600/20 group"
                                >
                                    <Share2 size={20} className="group-hover:animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest pt-1">Compartir Reto</span>
                                </button>
                            </div>
                            
                            <button 
                                onClick={() => setChallengeStatus('idle')} 
                                className="text-zinc-500 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] transition-colors"
                            >
                                Seguir viendo esta llave
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Challenge List Overlay */}
            <AnimatePresence>
                {showChallengeList && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card bg-[#0F131A] border border-white/10 rounded-[3rem] p-8 w-full max-w-2xl shadow-3xl flex flex-col gap-8"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter">Mis Desafíos de Llave</h3>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Historial de retos enviados y guardados</p>
                                </div>
                                <button 
                                    onClick={() => setShowChallengeList(false)}
                                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto pr-4 styled-scrollbar space-y-4">
                                {pvpChallenges.filter(c => c.isBracketChallenge).length === 0 ? (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                            <Trophy className="text-zinc-700" size={32} />
                                        </div>
                                        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">No has enviado ningún desafío aún</p>
                                    </div>
                                ) : (
                                    pvpChallenges.filter(c => c.isBracketChallenge).map((c) => (
                                        <div key={c.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <img src={c.targetAvatar} className="w-14 h-14 rounded-2xl border-2 border-white/10" alt="" />
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-[#0F131A]">
                                                        <Swords size={12} className="text-white" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-white font-black text-sm uppercase tracking-tight">{c.targetName}</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                        <span className={cn(
                                                            "text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                                                            c.status === 'PENDING' ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                                                        )}>
                                                            {c.status === 'PENDING' ? 'Pendiente' : 'Aceptado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20">Ver Detalle</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button 
                                onClick={() => {
                                    setShowChallengeList(false);
                                    handleResetBracket();
                                }}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Iniciar Nueva Predicción (Limpiar Todo)
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            {!isCaptureMode && (
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-12 md:px-24 pt-20 border-t border-white/10 bg-[#07090E]/90 pb-24 mx-0 md:mx-12 rounded-t-[4rem]">
                    <div className="flex items-center gap-8 md:gap-12 py-6 md:py-10 px-10 md:px-16 rounded-[2.5rem] bg-white/[0.02] border border-white/10 w-full lg:w-auto">
                        <div className="flex -space-x-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-10 md:w-16 h-10 md:h-16 rounded-full border-4 border-[#07090E] bg-zinc-900 flex items-center justify-center overflow-hidden"><Users size={18} className="text-white/20" /></div>
                            ))}
                        </div>
                        <div className="ml-8 border-l-2 border-white/10 pl-8">
                            <p className="text-[14px] md:text-[22px] font-black text-white italic uppercase">2,482 COMPITIENDO</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center lg:items-end gap-10 text-center lg:text-right w-full lg:w-auto">
                        <div className="flex items-center gap-12 opacity-40">
                            <Globe size={32} /> <Share2 size={32} /> <Youtube size={32} />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">Elite Edition • 2026</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
