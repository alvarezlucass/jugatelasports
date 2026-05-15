import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bot, ShoppingBag, Gift, ChevronLeft, ChevronRight, Zap, Users, Plus, Timer, Target } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { calculatePoints } from '../../utils/pointsCalculator';
import { cn } from '../../lib/utils';
import { predictionService } from '../../services/predictionService';
import { aiService } from '../../services/aiService';
import { databaseService } from '../../services/databaseService';
import { useGame } from '../../contexts/GameContext';

interface PredictionFormProps {
    matchId: string;
    mode: 'MACHINE' | 'OPPONENT' | 'GROUP';
    opponentId?: string | null;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ matchId, mode, opponentId }) => {
    const { user, session, opponents, canAfford, spendTokens, addTokens, refreshProfile, addLocalPrediction, useItem, createPvpChallenge, storeItems } = useUser();
    const { getMatch } = useGame();
    const [localOpponentId, setLocalOpponentId] = useState<string | null>(opponentId || null);
    const [localGroupId, setLocalGroupId] = useState<string | null>(null);
    const [localMode, setLocalMode] = useState<'MACHINE' | 'OPPONENT' | 'GROUP'>(mode);
    const [selectorType, setSelectorType] = useState<'AI' | 'USERS' | 'GROUPS'>(
        mode === 'GROUP' ? 'GROUPS' : (opponentId && opponents.find(o => o.id === opponentId)?.isAI) || mode === 'MACHINE' ? 'AI' : 'USERS'
    );
    const [isChangingOpponent, setIsChangingOpponent] = useState(!opponentId || opponentId === 'null');
    const [showSuccess, setShowSuccess] = useState(false);
    const [selection, setSelection] = useState<'HOME' | 'DRAW' | 'AWAY' | null>(null);
    const [homeScore, setHomeScore] = useState<string>('');
    const [awayScore, setAwayScore] = useState<string>('');
    const [stake, setStake] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<{id: string, name: string, tokenValue: number} | null>(null);
    const [advanceMethod, setAdvanceMethod] = useState<'REGULAR' | 'EXTRA' | 'PENALTIES'>('REGULAR');
    const [challengeSent, setChallengeSent] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const queryParams = new URLSearchParams(window.location.search);
    const qHome = queryParams.get('home');
    const qAway = queryParams.get('away');

    const matchDetailsData = getMatch(matchId);
    const matchHomeTeamStr = typeof matchDetailsData?.homeTeam === 'string' ? matchDetailsData.homeTeam : (matchDetailsData?.homeTeam?.name || qHome || 'Local');
    const matchAwayTeamStr = typeof matchDetailsData?.awayTeam === 'string' ? matchDetailsData.awayTeam : (matchDetailsData?.awayTeam?.name || qAway || 'Visitante');

    const isKnockout = useMemo(() => {
        const midLower = matchId.toLowerCase();
        return midLower.includes('r32') ||
            midLower.includes('r16') ||
            midLower.includes('r8') ||
            midLower.includes('r4') ||
            midLower.includes('final') ||
            midLower.includes('third');
    }, [matchId]);


    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 200;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const paramName = queryParams.get('name');
    const paramAvatar = queryParams.get('avatar');
    let rival = opponents.find(op => op.id === localOpponentId);
    if (!rival && localOpponentId && paramName && paramAvatar) {
        rival = { id: localOpponentId, name: paramName, avatar: paramAvatar, level: 1, points: 0, streak: 0, isAI: false, winRate: 0.5 };
    }
    if (!rival && localOpponentId?.startsWith('ai-')) {
        rival = opponents.find(o => o.isAI);
    }
    const isAIOpponent = rival?.isAI || localMode === 'MACHINE';

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<{
        actualHome: number;
        actualAway: number;
        multiplier: number;
        winnings: number;
        description: string;
    } | null>(null);

    // New State for Boosters
    const [selectedBooster, setSelectedBooster] = useState<{ id: string, name: string, multiplier: number } | null>(null);

    useEffect(() => {
        setSelection(null);
        setHomeScore('');
        setAwayScore('');
        setStake('');
        setSelectedItem(null);
        setSelectedBooster(null);
        setSimulationResult(null);
        setAdvanceMethod('REGULAR');
        setChallengeSent(false);
        setShowSuccess(false);
    }, [matchId]);

    const handleSimulate = async () => {
        if (localMode !== 'GROUP' && !rival) {
            setIsChangingOpponent(true);
            alert('Por favor selecciona un oponente primero.');
            return;
        }
        if (localMode === 'GROUP' && !localGroupId) {
            setIsChangingOpponent(true);
            alert('Por favor selecciona una liga primero.');
            return;
        }
        if (!selection || homeScore === '' || awayScore === '' || stake === '') return;

        const stakeAmount = parseInt(stake);

        const isAIOpponent = rival?.isAI;

        if (isNaN(stakeAmount) || stakeAmount < 5) {
            alert('La jugada mínima es de 5 tokens.');
            return;
        }

        if (isAIOpponent && stakeAmount > 100) {
            alert('El límite para jugar contra la IA es de 100 tokens.');
            return;
        }

        if (!canAfford(stakeAmount)) {
            alert('¡No tienes suficientes tokens para esta jugada!');
            return;
        }

        if (localMode === 'OPPONENT' && !isAIOpponent && rival) {
            setIsSimulating(true);
            if (selectedItem) {
                await useItem(selectedItem.id);
            }
            if (selectedBooster) {
                await useItem(selectedBooster.id);
            }

            const success = await createPvpChallenge({
                creatorId: user?.id || 'guest',
                creatorName: user?.name || 'Invitado',
                creatorAvatar: user?.avatar || '',
                targetId: rival.id,
                targetName: rival.name,
                targetAvatar: rival.avatar,
                matchId: matchId,
                matchHomeTeam: matchHomeTeamStr,
                matchAwayTeam: matchAwayTeamStr,
                creatorSelection: selection,
                creatorHomeScore: parseInt(homeScore) || 0,
                creatorAwayScore: parseInt(awayScore) || 0,
                amount: stakeAmount,
                itemReward: selectedItem?.name
            });

            setIsSimulating(false);
            if (success) {
                setChallengeSent(true);
                // Registrar Actividad Social
                await databaseService.recordActivity(user?.id || 'guest', 'PVP_CHALLENGE', {
                    matchId: matchId,
                    matchDescription: `${matchHomeTeamStr} vs ${matchAwayTeamStr}`,
                    opponentId: rival.id,
                    opponentName: rival.name,
                    amount: stakeAmount
                });
            } else {
                alert('Hubo un error al crear el reto.');
            }
            return;
        }

        setIsSimulating(true);

        // Descontar item en garantía si se seleccionó uno
        if (selectedItem) {
            await useItem(selectedItem.id);
        }

        // Descontar booster si se usó
        if (selectedBooster) {
            await useItem(selectedBooster.id);
        }

        await spendTokens(stakeAmount, `Jugada (Match ${matchId.substring(0, 4)})`);

        // Get opponent data already defined as 'rival'

        // Guardar en Supabase via predictionService
        if (user && session) {
            await predictionService.savePrediction({
                matchId: matchId,
                userId: user.id,
                homeScore: parseInt(homeScore),
                awayScore: parseInt(awayScore),
                stake: stakeAmount,
                opponentType: rival ? (rival.isAI ? 'CPU' : 'FRIEND') : localMode === 'GROUP' ? 'COMMUNITY' : 'CPU',
                opponentId: rival ? rival.id : undefined,
                wagerItemId: selectedItem ? selectedItem.id : undefined,
                boosterId: selectedBooster ? selectedBooster.id : undefined,
                advanceMethod: isKnockout ? advanceMethod : 'REGULAR'
            });
        }

        // Si el partido es futuro, no simulamos resultado aleatorio
        // Detectar partidos de llaves o programados
        const isScheduled = matchDetailsData?.status === 'scheduled' || isKnockout;

        if (isScheduled) {
            setTimeout(() => {
                setIsSimulating(false);
                setShowSuccess(true);
                refreshProfile();
            }, 1200);
            return;
        }

        setTimeout(async () => {
            const predHome = parseInt(homeScore);
            const predAway = parseInt(awayScore);
            const actualHome = Math.floor(Math.random() * 6);
            const actualAway = Math.floor(Math.random() * 6);

            const result = calculatePoints(
                {
                    score: { home: predHome, away: predAway },
                    outcome: selection as any,
                    definition: isKnockout ? advanceMethod : 'REGULAR'
                },
                {
                    score: { home: actualHome, away: actualAway },
                    definition: 'REGULAR' // Mocked definition for simulated results
                },
                isKnockout
            );

            // Determinamos winnings para simulación instantánea (solo si el partido ya terminó o es modo demo)
            let isPush = false;
            let aiPredictionStr = '';

            if (isAIOpponent && rival) {
                // To fetch odds, we'd need the real match object, but we mock it here if not available
                const aiPred = aiService.generatePrediction(rival.id, null, selection, predHome, predAway);

                aiPredictionStr = ` (La IA eligió ${aiPred.selection === 'HOME' ? 'Local' : aiPred.selection === 'AWAY' ? 'Visitante' : 'Empate'} ${aiPred.homeScore}-${aiPred.awayScore})`;

                const aiResult = calculatePoints(
                    { home: aiPred.homeScore, away: aiPred.awayScore },
                    { home: actualHome, away: actualAway },
                    aiPred.selection
                );

                // Si ambos eligieron lo mismo en selection Y ambos puntuaron > 0, es Push
                if (aiPred.selection === selection && result.points > 0 && aiResult.points > 0) {
                    isPush = true;
                }
            }

            let winnings = 0;
            if (isPush) {
                winnings = stakeAmount; // Push: devuelve la inversión original
            } else {
                winnings = stakeAmount * result.points;
            }

            if (winnings > 0) {
                await addTokens(winnings, isPush ? `Empate contra IA - Devolución de Garantía` : `Premio Jugada (${result.description})`);
            }

            setSimulationResult({
                actualHome,
                actualAway,
                multiplier: isPush ? 1 : (result.points * (selectedBooster && result.points > 0 ? selectedBooster.multiplier : 1)),
                winnings: winnings,
                description: isPush ? `¡Push! Ambos acertaron.${aiPredictionStr}` : `${result.description}${aiPredictionStr}${selectedBooster && result.points > 0 ? ' (¡Multip. x2!)' : ''}`
            });

            // Local fallback for immediate feedback
            addLocalPrediction({
                id: `local-${Date.now()}`,
                userId: user?.id || 'guest',
                matchId: matchId,
                selection: selection,
                stake: stakeAmount,
                potentialReturn: winnings,
                status: winnings > 0 ? 'WON' : 'LOST',
                timestamp: new Date().toISOString(),
                exactScore: {
                    home: predHome,
                    away: predAway
                },
                matchDetails: {
                    homeTeam: 'Team H',
                    awayTeam: 'Team V',
                    date: new Date().toISOString(),
                    status: 'FINISHED',
                    actualScore: {
                        home: actualHome,
                        away: actualAway
                    },
                    betItemId: selectedItem?.id,
                    betItemName: selectedItem?.name
                }
            });

            setIsSimulating(false);
            refreshProfile(); // Actualizar historial en el acto (si Supabase está vivo)
        }, 1500);
    };

    const handleItemSelect = (item: BetItem | null) => {
        setSelectedItem(item);
        if (item) {
            setStake(item.tokenValue.toString());
        } else {
            setStake('');
        }
    };

    const randomOpponentName = (localMode === 'OPPONENT' || localMode === 'GROUP') ? `Usuario_${Math.floor(Math.random() * 1000)}` : 'AI Predictor v2.0';

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#1A1F26] to-[#0F131A] border border-white/5 shadow-xl">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-4 uppercase tracking-[0.2em] font-black">
                    <span>{localMode === 'GROUP' ? 'Liga Seleccionada' : 'Oponente Directo'}</span>
                    <button
                        onClick={() => setIsChangingOpponent(!isChangingOpponent)}
                        className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-colors uppercase tracking-widest flex items-center gap-1 text-[8px] font-black"
                    >
                        {isChangingOpponent ? 'Cancelar' : 'Cambiar'}
                    </button>
                </div>

                {isChangingOpponent ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 mb-2">
                        <div className="flex gap-2">
                            {(['AI', 'USERS', 'GROUPS'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectorType(type)}
                                    className={cn(
                                        "flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border transition-all duration-300 flex items-center justify-center gap-2",
                                        selectorType === type
                                            ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                                            : "bg-black/40 border-white/5 text-zinc-500 hover:text-white hover:bg-black/60"
                                    )}
                                >
                                    {type === 'AI' ? <Bot size={12} /> : type === 'USERS' ? <Zap size={12} /> : <Users size={12} />}
                                    {type === 'AI' ? 'Automático' : type === 'USERS' ? 'Amigos' : 'Grupos'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {selectorType === 'GROUPS' ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {user?.groups && user.groups.length > 0 ? (
                                        user.groups.map((group) => (
                                            <button
                                                key={group.id}
                                                onClick={() => {
                                                    setLocalGroupId(group.id);
                                                    setLocalMode('GROUP');
                                                    setLocalOpponentId(null);
                                                    setIsChangingOpponent(false);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                                                    localGroupId === group.id
                                                        ? "bg-blue-600/20 border-blue-500 shadow-lg"
                                                        : "bg-[#1A1F26] border-white/5 hover:border-white/20 hover:bg-[#252C36]"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0",
                                                    group.color === 'blue' ? "bg-blue-500" : group.color === 'green' ? "bg-emerald-500" : "bg-purple-500"
                                                )}>
                                                    <Users size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-black text-white uppercase tracking-tight">{group.name}</div>
                                                    <div className="text-[8px] font-bold text-zinc-500 uppercase flex items-center gap-1 mt-0.5">
                                                        <Users size={8} /> {group.memberIds.length} Miembros
                                                    </div>
                                                </div>
                                                {localGroupId === group.id && (
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <button
                                            onClick={() => window.location.href = '/groups'}
                                            className="w-full p-8 rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3 group hover:bg-white/10 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Plus size={24} className="text-zinc-500 group-hover:text-white" />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] font-black text-white uppercase tracking-widest">No tienes ligas aún</div>
                                                <div className="text-[8px] font-bold text-zinc-500 uppercase mt-1">Armá tu propia liga y competí con amigos</div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-2">
                                    {opponents
                                        .filter(op => selectorType === 'AI' ? op.isAI : !op.isAI)
                                        .map((op) => (
                                            <button
                                                key={op.id}
                                                onClick={() => {
                                                    setLocalOpponentId(op.id);
                                                    setLocalGroupId(null);
                                                    setLocalMode(op.isAI ? 'MACHINE' : 'OPPONENT');
                                                    setIsChangingOpponent(false);
                                                }}
                                                className={cn(
                                                    "relative group flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300",
                                                    localOpponentId === op.id
                                                        ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]"
                                                        : "bg-[#1A1F26] border-white/5 hover:border-white/20 hover:bg-[#252C36]"
                                                )}
                                            >
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                                                        <img src={op.avatar} alt={op.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    {localOpponentId === op.id && (
                                                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1A1F26]">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <div className="text-[8px] font-black text-white truncate w-full text-center uppercase tracking-tight">{op.name}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <div className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[6px] font-black text-blue-400">LVL {op.level}</div>
                                                        <div className="text-[6px] font-bold text-zinc-500">{op.winRate * 100}% WR</div>
                                                    </div>
                                                </div>
                                                {op.isAI && (
                                                    <div className="absolute top-1 left-1">
                                                        <Bot size={8} className="text-blue-400 opacity-50" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        {localMode === 'GROUP' && localGroupId ? (
                            <>
                                {(() => {
                                    const selectedGroup = user?.groups.find(g => g.id === localGroupId);
                                    return (
                                        <>
                                            <div className="relative">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10",
                                                    selectedGroup?.color === 'blue' ? "bg-blue-500/20 text-blue-500" : selectedGroup?.color === 'green' ? "bg-emerald-500/20 text-emerald-500" : "bg-purple-500/20 text-purple-500"
                                                )}>
                                                    <Users size={20} />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#121820]" />
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-sm uppercase tracking-tight">{selectedGroup?.name || 'Liga de Amigos'}</div>
                                                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Liga Privada • {selectedGroup?.memberIds.length || 0} Jugadores</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </>
                        ) : rival ? (
                            <>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10">
                                        <img src={rival.avatar} alt={rival.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#121820]" />
                                </div>
                                <div>
                                    <div className="font-black text-white text-sm uppercase tracking-tight">{rival.name}</div>
                                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Nivel {rival.level} • WR {rival.winRate * 100}%</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/10 flex items-center justify-center">
                                        <Bot size={20} className="text-blue-400" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#121820]" />
                                </div>
                                <div>
                                    <div className="font-black text-white text-sm uppercase tracking-tight">{randomOpponentName}</div>
                                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Nivel Maestro • Racha 3W</div>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {isAIOpponent && rival && (
                    <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5">
                        <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                            {rival.id === 'ai-ia' && "La IA Analista estudia la forma de los equipos y las rachas recientes para predecir el resultado más probable."}
                            {rival.id === 'ai-profe' && "El Profe analiza probabilidades y equipos basados en el Ranking FIFA. Si empatan en la predicción exacta, se considera 'Push'."}
                            {rival.id === 'ai-contra' && "El Contra siempre elegirá el resultado opuesto a ti de forma instantánea. Si eliges empate, elegirá aleatoriamente."}
                            {rival.id === 'ai-loco' && "La Suerte es Loca. Esta IA elegirá un resultado (Local, Empate, Visitante) de forma 100% aleatoria."}
                            <br />
                            <span className="text-blue-400 font-bold mt-1 inline-block">Monto máximo contra IA: 100 Tokens.</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2">1. Elige el Resultado</h4>
                <div className={cn("grid gap-3", isKnockout ? "grid-cols-2" : "grid-cols-3")}>
                    {(['HOME', 'DRAW', 'AWAY'] as const).map((opt) => {
                        if (isKnockout && opt === 'DRAW') return null;

                        return (
                            <button
                                key={opt}
                                onClick={() => setSelection(opt)}
                                disabled={isSimulating || !!simulationResult}
                                className={cn(
                                    "py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all active:scale-95",
                                    selection === opt
                                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                                        : "bg-[#1A1F26] border-white/5 text-zinc-500 hover:border-white/20"
                                )}
                            >
                                {opt === 'HOME' ? 'LOCAL' : opt === 'DRAW' ? 'EMPATE' : 'VISITANTE'}
                            </button>
                        );
                    })}
                </div>
            </div>

            {isKnockout && selection && selection !== 'DRAW' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-2 text-center">Clasificación en:</h4>
                    <div className="flex justify-center gap-3">
                        {(['REGULAR', 'EXTRA', 'PENALTIES'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setAdvanceMethod(m)}
                                className={cn(
                                    "px-4 py-3 rounded-xl border flex flex-col items-center gap-2 transition-all flex-1 max-w-[100px]",
                                    advanceMethod === m
                                        ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                                        : "bg-black/40 border-white/5 text-zinc-500 hover:text-white"
                                )}
                            >
                                {m === 'REGULAR' ? <Timer size={16} /> : m === 'EXTRA' ? <Zap size={16} /> : <Target size={16} />}
                                <span className="text-[8px] font-black uppercase tracking-widest">
                                    {m === 'REGULAR' ? '90 MIN' : m === 'EXTRA' ? '120 MIN' : 'PENALES'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4 text-center">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">2. Marcador Exacto</h4>
                <div className="flex items-center justify-center gap-6">
                    <div className="relative group">
                        <input
                            type="number"
                            min="0"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            placeholder="0"
                            className="w-20 h-20 rounded-[1.5rem] bg-[#1A1F26] border border-white/10 text-center text-4xl font-black text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-800"
                            disabled={isSimulating || !!simulationResult}
                        />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 rounded text-[8px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity">LCL</div>
                    </div>
                    <span className="text-3xl font-black text-blue-600 italic mt-2">:</span>
                    <div className="relative group">
                        <input
                            type="number"
                            min="0"
                            value={awayScore}
                            onChange={(e) => setAwayScore(e.target.value)}
                            placeholder="0"
                            className="w-20 h-20 rounded-[1.5rem] bg-[#1A1F26] border border-white/10 text-center text-4xl font-black text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-800"
                            disabled={isSimulating || !!simulationResult}
                        />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 rounded text-[8px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity">VST</div>
                    </div>
                </div>
            </div>

            {!isAIOpponent && (<div className="space-y-4">
                <div className="flex justify-between px-2">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">3. Jugar por "Especias" (Opcional)</h4>
                    <button
                        onClick={() => setSelectedItem(null)}
                        className={cn("text-[8px] font-black uppercase tracking-widest transition-opacity cursor-pointer", selectedItem ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none")}
                    >
                        Limpiar
                    </button>
                </div>
                <div className="flex items-center gap-2 group/slider">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); scroll('left'); }}
                        className="w-10 h-10 shrink-0 bg-[#1A1F26] hover:bg-[#252C36] border border-white/5 rounded-2xl flex items-center justify-center transition-all opacity-40 hover:opacity-100 disabled:opacity-10"
                    >
                        <ChevronLeft size={20} className="text-zinc-400" />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex-1 flex gap-3 overflow-x-auto pb-2 px-1 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {user?.inventory.map((invItem) => {
                            const storeItemDetails = storeItems.find(si => si.id === invItem.itemId);
                            if (!storeItemDetails || storeItemDetails.category !== 'especias') return null;

                            return (
                                <button
                                    key={`inv-${invItem.itemId}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const betItemEquivalent = {
                                            id: storeItemDetails.id,
                                            name: storeItemDetails.name,
                                            tokenValue: storeItemDetails.price
                                        };
                                        handleItemSelect(selectedItem?.id === storeItemDetails.id ? null : betItemEquivalent);
                                    }}
                                    disabled={isSimulating || !!simulationResult}
                                    className={cn(
                                        "flex-none w-32 p-4 rounded-2xl border transition-all relative overflow-hidden group snap-start flex flex-col items-center justify-between",
                                        selectedItem?.id === storeItemDetails.id
                                            ? "bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10"
                                            : "bg-[#1A1F26] border-white/5 hover:border-white/10"
                                    )}
                                >
                                    {/* Cantidad disponible badge */}
                                    <div className="absolute top-2 left-2 bg-white/10 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-md border border-white/10">
                                        x{invItem.quantity}
                                    </div>

                                    <div className="text-3xl mb-2 mt-2 group-hover:scale-110 transition-transform">
                                        {storeItemDetails.icon === 'Wine' ? '🍷' : storeItemDetails.icon === 'Flame' ? '🥩' : '🍺'}
                                    </div>
                                    <div className="text-[9px] font-black text-white uppercase leading-tight mb-1">{storeItemDetails.name}</div>
                                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{storeItemDetails.price} TKNS</div>

                                    {selectedItem?.id === storeItemDetails.id && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        {(!user?.inventory || user.inventory.filter(i => storeItems.find(si => si.id === i.itemId)?.category === 'especias').length === 0) && (
                            <div className="flex-none p-4 rounded-2xl border border-white/5 border-dashed bg-white/[0.02] flex flex-col items-center justify-center gap-2 opacity-50 px-8">
                                <ShoppingBag size={20} className="text-zinc-500" />
                                <span className="text-[10px] font-bold text-center">No tienes Especias.<br />Visita la tienda.</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); scroll('right'); }}
                        className="w-10 h-10 shrink-0 bg-[#1A1F26] hover:bg-[#252C36] border border-white/5 rounded-2xl flex items-center justify-center transition-all opacity-40 hover:opacity-100 disabled:opacity-10"
                    >
                        <ChevronRight size={20} className="text-zinc-400" />
                    </button>
                </div>
            </div>)}

            {/* Boosters Section */}
            <div className="space-y-4 pt-4 border-t border-white/5 mt-4 px-2">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Zap size={12} /> Utilizar Booster
                    </h4>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setSelectedBooster(null);
                        }}
                        className={cn("text-[8px] font-black uppercase tracking-widest transition-opacity cursor-pointer", selectedBooster ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none")}
                    >
                        Quitar
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(!user?.inventory || user.inventory.filter(i => storeItems.find(si => si.id === i.itemId)?.category === 'boosters').length === 0) ? (
                        <div className="w-full p-3 rounded-2xl border border-white/5 border-dashed bg-white/[0.02] text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-center">
                            No tienes boosters. Visita la tienda.
                        </div>
                    ) : (
                        user.inventory.filter(i => storeItems.find(si => si.id === i.itemId)?.category === 'boosters').map(invItem => {
                            const storeItem = storeItems.find(si => si.id === invItem.itemId);
                            if (!storeItem) return null;
                            const isSelected = selectedBooster?.id === storeItem.id;
                            const multiplier = storeItem.name.includes('X2') || storeItem.name.includes('x2') ? 2 : 1;

                            return (
                                <button
                                    key={invItem.itemId}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (isSelected) setSelectedBooster(null);
                                        else setSelectedBooster({ id: storeItem.id, name: storeItem.name, multiplier });
                                    }}
                                    className={cn(
                                        "px-4 py-3 rounded-2xl flex items-center gap-3 transition-all border relative",
                                        isSelected
                                            ? "bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                                            : "bg-[#1A1F26] border-white/5 hover:border-emerald-500/30"
                                    )}
                                >
                                    <div className="text-2xl mb-1 mt-1 group-hover:scale-110 transition-transform flex-shrink-0">
                                        🚀
                                    </div>
                                    <div className="text-left flex flex-col justify-center">
                                        <div className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-emerald-400" : "text-white")}>
                                            {storeItem.name}
                                        </div>
                                    </div>
                                    {isSelected && <div className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    <div className="absolute top-1 right-1 bg-white/10 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-md border border-white/10 shadow-lg">
                                        x{invItem.quantity}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>



            <div className="space-y-3">
                <div className="flex justify-between px-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        {selectedItem && !isAIOpponent ? 'Depósito en Garantía (Tokens)' : 'Inversión (Tokens)'}
                    </label>
                    <span className="text-[9px] font-bold text-zinc-700 uppercase">
                        {isAIOpponent ? 'Min 5 - Max 100' : 'Min 5'}
                    </span>
                </div>
                <div className="relative">
                    <input
                        type="number"
                        min="5"
                        value={stake}
                        onChange={(e) => {
                            setStake(e.target.value);
                            setSelectedItem(null); // Clear item if manually changing stake
                        }}
                        placeholder="Monto a jugar"
                        className="w-full p-5 rounded-2xl bg-[#1A1F26] border border-white/10 text-white font-black text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        disabled={isSimulating || !!simulationResult}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        TKNS
                    </div>
                </div>
                {selectedItem && (
                    <div className="px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <Gift size={14} className="text-blue-500" />
                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tight">
                            Estás jugando por un **{selectedItem.name}**. Se debitarán {selectedItem.tokenValue} tokens como garantía.
                        </p>
                    </div>
                )}
            </div>

            {challengeSent ? (
                <div className="p-8 rounded-[2.5rem] border bg-blue-500/5 border-blue-500/20 animate-in zoom-in duration-500 shadow-2xl text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                        🚀
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">¡Reto Enviado!</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                        Tu desafío ha sido enviado a <span className="text-blue-400 font-black">{rival?.name}</span>.<br />
                        Los tokens en juego quedan en garantía hasta su respuesta.
                    </p>
                    <button
                        onClick={() => {
                            setChallengeSent(false);
                            setSelection(null);
                            setHomeScore('');
                            setAwayScore('');
                            setStake('');
                        }}
                        className="mt-6 w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
                    >
                        Hacer Otra Jugada
                    </button>
                </div>
            ) : showSuccess ? (
                <div className="p-8 rounded-[2.5rem] border bg-emerald-500/5 border-emerald-500/20 animate-in zoom-in duration-500 shadow-2xl text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-600/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                        ✅
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">¡Jugada Registrada!</h2>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                        Tu predicción para <span className="text-blue-400 font-black">{matchHomeTeamStr} vs {matchAwayTeamStr}</span> ha sido guardada con éxito.<br />
                        Recibirás tus tokens una vez que termine el partido real (Julio 2026).
                    </p>
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowSuccess(false);
                                setSelection(null);
                                setHomeScore('');
                                setAwayScore('');
                                setStake('');
                            }}
                            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest transition-all border border-blue-500/20 active:scale-95 shadow-lg shadow-blue-600/20"
                        >
                            Ver Próximo Partido
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 opacity-60"
                        >
                            Volver al Fixture
                        </button>
                    </div>
                </div>
            ) : simulationResult ? (
                <div className={`p-8 rounded-[2.5rem] border ${simulationResult.winnings > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                    } animate-in zoom-in duration-500 shadow-2xl`}>
                    <div className="text-center space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Resultado Final</div>
                        <div className="text-5xl font-black text-white tracking-tighter italic">{simulationResult.actualHome} - {simulationResult.actualAway}</div>
                        <div className={cn(
                            "text-lg font-black uppercase tracking-tighter italic",
                            simulationResult.winnings > 0 ? 'text-emerald-500' : 'text-red-500'
                        )}>
                            {simulationResult.winnings > 0 ? `+${simulationResult.winnings} Tokens` : 'Jugada Fallida'}
                        </div>
                        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{simulationResult.description}</div>
                        <button
                            onClick={() => {
                                setSimulationResult(null);
                                setSelection(null);
                                setHomeScore('');
                                setAwayScore('');
                                setStake('');
                            }}
                            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                        >
                            Nueva Predicción
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => {
                        if (!user) {
                            // En modo desarrollo permitimos simular para que el usuario/AI vea el flujo
                            // pero para producción esto debería ser restrictivo. 
                            // Por ahora dejamos el alert pero lo hacemos más visible.
                            alert('⚠️ Debes iniciar sesión para realizar esta jugada.');
                            return;
                        }
                        handleSimulate();
                    }}
                    disabled={!selection || homeScore === '' || awayScore === '' || stake === '' || isSimulating || (localMode !== 'GROUP' && !rival) || (localMode === 'GROUP' && !localGroupId)}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                >
                    {isSimulating ? (
                        <span className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Procesando...
                        </span>
                    ) : (
                        <div className="relative">
                            {!user && <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[7px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Requiere Inicio de Sesión</div>}
                            {localMode === 'GROUP' ? 'Participar en Liga' : (localMode === 'OPPONENT' && !isAIOpponent ? 'Enviar Reto PvP' : '¡Jugátela!')}
                        </div>
                    )}
                </button>
            )}
        </div>
    );
};
