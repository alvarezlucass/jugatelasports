import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TournamentBracket } from '../components/competition/TournamentBracket';
import { WorldCupTabs, type WorldCupView } from '../components/competition/WorldCupTabs';
import { GroupCard } from '../components/competition/GroupCard';
import { WorldCupStats } from '../components/competition/WorldCupStats';
// Local data used instead of API for 2026 World Cup data expansion.
import { Loader2, Calendar, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { getGroupStandings, WORLD_CUP_GROUP_MATCHES, getTeamFlagUrl } from '../data/worldCupPersistence';
import { calculateAdvancingTeams, generateInitialBracket, generateEmptyBracketTree } from '../lib/bracketLogic';
import { useUser } from '../contexts/UserContext';
import { matchService } from '../services/matchService';

export const WorldCup: React.FC = () => {
    const { userPredictions } = useUser();
    const [activeView, setActiveView] = React.useState<WorldCupView>(() => {
        const saved = localStorage.getItem('wc_active_view');
        return (saved as WorldCupView) || 'matches';
    });

    React.useEffect(() => {
        localStorage.setItem('wc_active_view', activeView);
    }, [activeView]);
    const navigate = useNavigate();
    const location = useLocation();
    const [activeGroup, setActiveGroup] = useState<string>('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [realMatches, setRealMatches] = useState<any[]>([]);
    const [bracketMode, setBracketMode] = useState<'user' | 'real'>('user');
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Sync state with URL groups param and deep link bracket
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const groupsParam = params.get('groups');
        if (groupsParam) {
            setActiveGroup(groupsParam);
        }

        const bracketParam = params.get('bracket');
        if (bracketParam) {
            setActiveView('bracket');
        }
    }, [location.search]);

    // Fetch real matches from Supabase to correctly update tables
    React.useEffect(() => {
        const fetchRealMatches = async () => {
            setIsLoading(true);
            try {
                // Fetch all World Cup 2026 matches to include knockouts as well as group stage
                const matches = await matchService.getMatches('world-cup-2026', { season: 2026, limit: 1000 });
                setRealMatches(matches);
            } catch (err) {
                console.error("Error fetching real matches", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRealMatches();
    }, []);

    const groups: ('A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L')[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    const selectorOptions: ('A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'ALL')[] = ['ALL', ...groups];

    const groupTeamsMap = React.useMemo(() => {
        const map: Record<string, {name: string, flag: string}[]> = {};
        groups.forEach(letter => {
            map[letter] = getGroupStandings(letter, userPredictions, realMatches).map(t => ({
                name: t.name,
                flag: t.flag || ''
            }));
        });
        return map;
    }, [userPredictions, realMatches]);

    const computedBracket = React.useMemo(() => {
        const allStandings: Record<string, any[]> = {};
        groups.forEach(letter => {
            const teamsToRender = getGroupStandings(letter, userPredictions, realMatches);
            allStandings[letter] = teamsToRender.map((t: any) => ({
                id: t.id,
                name: t.name || 'Por Definir',
                flag: t.flag || '',
                pj: t.pj || 0,
                dg: t.dg || 0,
                pts: t.pts || 0,
            }));
        });
        
        const totalPoints = Object.values(allStandings).reduce((acc, teams) => 
            acc + teams.reduce((accT, t) => accT + t.pts, 0), 0);
            
        // Si no hay puntos aún, usamos placeholders informativos (1ro Grupo A, etc)
        // Pero si el usuario ya predijo resultados, calculamos los clasificados reales.
        // Si no hay predicciones del usuario aún, forzamos marcadores de posición (1ro Grupo A, etc)
        // Esto evita ver clubes antes de empezar a participar en la fase de grupos.
        const advancing = calculateAdvancingTeams(allStandings);
        const initialR32 = generateInitialBracket(advancing, userPredictions.length === 0); 
        
        // Saneamiento de seguridad: asegurar que nada nazca seleccionado por defecto
        const scrubbedR32 = initialR32.map(m => ({
            ...m,
            winnerId: undefined,
            homeScore: undefined,
            awayScore: undefined,
            team1: m.team1 ? { ...m.team1, selected: false } : undefined,
            team2: m.team2 ? { ...m.team2, selected: false } : undefined
        }));

        const emptyTree = generateEmptyBracketTree();
        emptyTree.r32 = scrubbedR32;
        return emptyTree;
    }, [userPredictions, realMatches]);

    const computedRealBracket = React.useMemo(() => {
        // Calculate group standings ignoring user predictions to get the real advancing base
        const allStandings: Record<string, any[]> = {};
        groups.forEach(letter => {
            const teamsToRender = getGroupStandings(letter, [], realMatches);
            allStandings[letter] = teamsToRender.map((t: any) => ({
                id: t.id,
                name: t.name || 'Por Definir',
                flag: t.flag || '',
                pj: t.pj || 0,
                dg: t.dg || 0,
                pts: t.pts || 0,
            }));
        });
        
        const totalRealPoints = Object.values(allStandings).reduce((acc, teams) => 
            acc + teams.reduce((accT, t) => accT + t.pts, 0), 0);

        const advancing = calculateAdvancingTeams(allStandings);
        // Si no hay puntos reales aún (el torneo no empezó), forzamos placeholders para no mostrar equipos arbitrarios.
        // Podríamos hacer esto por grupo, pero para un torneo no iniciado esto es perfecto.
        const initialR32 = generateInitialBracket(advancing, totalRealPoints === 0);
        
        const realTree = generateEmptyBracketTree();
        const allKnockoutMatches = realMatches.filter(m => m.metadata?.round && !m.metadata.round.toLowerCase().includes('group'));
        const availableKnockoutMatches = [...allKnockoutMatches];

        realTree.r32 = initialR32.map(m => ({
            ...m,
            winnerId: undefined,
            homeScore: undefined,
            awayScore: undefined,
            team1: m.team1 ? { ...m.team1, selected: false } : undefined,
            team2: m.team2 ? { ...m.team2, selected: false } : undefined
        }));

        // Pass 2: Aplicar partidos de la API y evitar equipos duplicados
        [...availableKnockoutMatches].forEach(apiMatch => {
            const kHomeFlag = getTeamFlagUrl(apiMatch.homeTeam);
            const kAwayFlag = getTeamFlagUrl(apiMatch.awayTeam);
            
            // Buscar el nodo generado matemáticamente que le corresponde a este equipo 1ro de grupo
            const node = realTree.r32.find(n => {
                const nTeam1Flag = n.team1?.name ? getTeamFlagUrl(n.team1.name) : null;
                return nTeam1Flag && (nTeam1Flag === kHomeFlag || nTeam1Flag === kAwayFlag);
            });

            if (node) {
                const oldTeam1 = node.team1;
                const oldTeam2 = node.team2;

                node.team1 = { 
                    name: apiMatch.homeTeam, 
                    flag: getTeamFlagUrl(apiMatch.homeTeam), 
                    source: 'API', 
                    selected: false,
                    originalId: apiMatch.homeTeam
                };
                node.team2 = { 
                    name: apiMatch.awayTeam, 
                    flag: getTeamFlagUrl(apiMatch.awayTeam), 
                    source: 'API', 
                    selected: false,
                    originalId: apiMatch.awayTeam
                };

                // Swap logic para evitar duplicados: Si apiTeam1 o apiTeam2 ya estaban en OTRO nodo, 
                // los reemplazamos por oldTeam1 u oldTeam2 (los que acabamos de sacar)
                realTree.r32.forEach(otherNode => {
                    if (otherNode.id !== node.id) {
                        if (otherNode.team1?.name === apiMatch.homeTeam) {
                            otherNode.team1 = oldTeam1 ? { ...oldTeam1 } : undefined;
                        } else if (otherNode.team2?.name === apiMatch.homeTeam) {
                            otherNode.team2 = oldTeam1 ? { ...oldTeam1 } : undefined;
                        }

                        if (otherNode.team1?.name === apiMatch.awayTeam) {
                            otherNode.team1 = oldTeam2 ? { ...oldTeam2 } : undefined;
                        } else if (otherNode.team2?.name === apiMatch.awayTeam) {
                            otherNode.team2 = oldTeam2 ? { ...oldTeam2 } : undefined;
                        }
                    }
                });

                // Remove from availableKnockoutMatches
                const index = availableKnockoutMatches.indexOf(apiMatch);
                if (index > -1) {
                    availableKnockoutMatches.splice(index, 1);
                }
            }
        });
        
        // This helper attempts to find the real match for a given bracket node and apply scores
        const findMatchAndApply = (node: MatchupNode) => {
            if (!node.team1?.name || !node.team2?.name) return;
            
            const nTeam1Flag = getTeamFlagUrl(node.team1.name);
            const nTeam2Flag = getTeamFlagUrl(node.team2.name);

            const match = allKnockoutMatches.find(m => {
                const mHomeFlag = getTeamFlagUrl(m.homeTeam);
                const mAwayFlag = getTeamFlagUrl(m.awayTeam);
                return (mHomeFlag === nTeam1Flag && mAwayFlag === nTeam2Flag) ||
                       (mHomeFlag === nTeam2Flag && mAwayFlag === nTeam1Flag);
            });
            if (match && (match.status === 'FINISHED' || match.status === 'LIVE' || match.status === 'finished' || match.status === 'live')) {
                const isReversed = match.homeTeam === node.team2?.name;
                node.homeScore = isReversed ? match.awayScore : match.homeScore;
                node.awayScore = isReversed ? match.homeScore : match.awayScore;
                
                if (match.status === 'FINISHED' || match.status === 'finished') {
                    if (node.homeScore !== undefined && node.awayScore !== undefined) {
                        if (node.homeScore > node.awayScore) {
                            node.winnerId = node.team1.name;
                            node.team1.selected = true;
                        } else if (node.awayScore > node.homeScore) {
                            node.winnerId = node.team2.name;
                            node.team2.selected = true;
                        } else {
                            // Penalties case
                            const homePen = match.metadata?.penalty_home || 0;
                            const awayPen = match.metadata?.penalty_away || 0;
                            if (isReversed) {
                                if (awayPen > homePen) { node.winnerId = node.team1.name; node.team1.selected = true; }
                                else { node.winnerId = node.team2.name; node.team2.selected = true; }
                            } else {
                                if (homePen > awayPen) { node.winnerId = node.team1.name; node.team1.selected = true; }
                                else { node.winnerId = node.team2.name; node.team2.selected = true; }
                            }
                            node.advanceMethod = 'PENALTIES';
                        }
                    }
                }
            }
        };

        realTree.r32.forEach(findMatchAndApply);
        // Cascading would require simulating the real tree sequentially, but since the tournament 
        // hasn't started, returning the base R32 with real standings is a great start.
        // Full cascade logic can be expanded once API structure for Knockouts is confirmed.

        return realTree;
    }, [realMatches]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-zinc-500 font-bold animate-pulse">Cargando datos del Mundial...</p>
                </div>
            );
        }

        switch (activeView) {
            case 'matches':
                return (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Group Selector */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {selectorOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setActiveGroup(option)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-xs font-black transition-all uppercase tracking-tight border",
                                        activeGroup === option
                                            ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                            : "bg-[#0F131A] border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                                    )}
                                >
                                    {option === 'ALL' ? 'Todos Los Grupos' : `Grupo ${option}`}
                                </button>
                            ))}
                        </div>

                        {/* Groups Grid */}
                        <div className={cn(
                            "grid gap-8", 
                            (activeGroup === 'ALL' || activeGroup.includes(',')) ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                        )}>
                            {groups.filter(letter => {
                                if (activeGroup === 'ALL') return true;
                                const allowedGroups = activeGroup.split(',');
                                return allowedGroups.includes(letter);
                            }).map((letter) => {
                                const teamsToRender = getGroupStandings(letter, userPredictions, realMatches);

                                return (
                                    <GroupCard
                                        key={letter}
                                        groupLetter={letter}
                                        teams={teamsToRender}
                                        onTeamClick={(name) => navigate(`/worldcup/team/${encodeURIComponent(name)}/squad`)}
                                        onViewFixture={() => navigate(`/worldcup/group/${letter}`)}
                                        isCompact={activeGroup === 'ALL'}
                                    />
                                );
                            })}
                        </div>

                        {/* CTA Banner */}
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-900/20 to-blue-600/10 border border-blue-500/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 text-center md:text-left">
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                                    ¿Estás listo para las finales?
                                </h2>
                                <p className="text-zinc-400 text-sm md:text-base max-w-xl font-medium">
                                    Sigue el camino de tus equipos favoritos y predice quién levantará la copa en el 2026.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button 
                                    onClick={() => setActiveView('bracket')}
                                    className="px-8 py-4 bg-white text-blue-900 font-black rounded-full text-sm uppercase tracking-wider hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-xl"
                                >
                                    Armar mi Bracket
                                </button>
                                <button
                                    onClick={() => navigate('/worldcup/venues')}
                                    className="px-8 py-4 bg-blue-600 text-white font-black rounded-full text-sm uppercase tracking-wider hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                >
                                    Ver Sedes
                                </button>
                            </div>
                            {/* Decorative Icon removed for cleaner UI */}
                        </div>
                    </div>
                );

            case 'bracket':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-3 mb-6 md:mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[9px] md:text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Copa Mundial 2026
                            </div>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">Llaves <span className="text-blue-600">Eliminatorias</span></h2>
                            <p className="text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-widest opacity-60">Camino a la Gran Final • Predicciones Abiertas</p>
                        </div>
                        
                        {/* Bracket Mode Toggle */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-[#0F131A] p-1.5 rounded-full border border-white/10 flex shadow-xl">
                                <button
                                    onClick={() => setBracketMode('user')}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                        bracketMode === 'user' 
                                            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                            : "text-white/40 hover:text-white"
                                    )}
                                >
                                    Mis Predicciones
                                </button>
                                <button
                                    onClick={() => setBracketMode('real')}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                        bracketMode === 'real' 
                                            ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]" 
                                            : "text-white/40 hover:text-white"
                                    )}
                                >
                                    Mundial Real
                                </button>
                            </div>
                        </div>

                        {bracketMode === 'real' && (
                            <div className="text-center bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl mb-4 max-w-2xl mx-auto text-xs font-bold flex items-center justify-center gap-2">
                                Estás viendo la llave oficial del Mundial. Los resultados están bloqueados en solo lectura.
                            </div>
                        )}

                        <TournamentBracket 
                            key={bracketMode}
                            initialBracketData={bracketMode === 'user' ? computedBracket : computedRealBracket} 
                            groupTeams={groupTeamsMap} 
                            isReadOnly={bracketMode === 'real'} 
                        />
                    </div>
                );

            case 'social':
                return <WorldCupStats />;
        }
    };

    return (
        <div className="pb-24 animate-in fade-in duration-500" ref={containerRef}>
            {/* Header Section */}
            <div className="container mx-auto px-4 pt-12 pb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-blue-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Copa Mundial 2026
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                            Fase de <span className="text-blue-600">Grupos</span>
                        </h1>
                        <p className="text-zinc-500 text-base md:text-lg font-bold">
                            Tabla de Posiciones y clasificados a Fase Final
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <WorldCupTabs
                            activeView={activeView}
                            onViewChange={(view) => {
                                if (view === 'venues') {
                                    navigate('/worldcup/venues');
                                } else {
                                    setActiveView(view as any);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className={cn(
                "py-8 transition-all duration-700",
                activeView === 'bracket' ? "w-full px-0 max-w-none shadow-none border-none" : "container mx-auto px-4 lg:px-6 xl:px-4"
            )}>
                {renderContent()}
            </div>

            {/* Floating Action Button for Group Phase / Fase Final */}
            <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
                {activeView !== 'matches' ? (
                    <button
                        onClick={() => setActiveView('matches')}
                        className="group flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-full font-black uppercase text-xs shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                        <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden md:block">Fase de Grupos</span>
                        <span className="md:hidden">Grupos</span>
                    </button>
                ) : (
                    <button
                        onClick={() => setActiveView('bracket')}
                        className="group flex items-center gap-3 px-6 py-4 bg-blue-950/90 backdrop-blur-xl border border-white/20 text-white rounded-full font-black uppercase text-xs shadow-[0_20px_50px_rgba(37,99,235,0.2)] hover:bg-blue-900 hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                        <Trophy size={18} className="text-amber-400 group-hover:scale-125 transition-transform" />
                        <span className="hidden md:block">Fase Final</span>
                        <span className="md:hidden">Final</span>
                    </button>
                )}
            </div>
        </div>
    );
};
