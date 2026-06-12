import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TournamentBracket } from '../components/competition/TournamentBracket';
import { WorldCupTabs, type WorldCupView } from '../components/competition/WorldCupTabs';
import { GroupCard } from '../components/competition/GroupCard';
import { WorldCupStats } from '../components/competition/WorldCupStats';
// Local data used instead of API for 2026 World Cup data expansion.
import { Loader2, Calendar, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { getGroupStandings, WORLD_CUP_GROUP_MATCHES } from '../data/worldCupPersistence';
import { calculateAdvancingTeams, generateInitialBracket, generateEmptyBracketTree } from '../lib/bracketLogic';
import { useUser } from '../contexts/UserContext';

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
                // Import matchService dynamically to avoid circular dependencies if any
                const { matchService } = await import('../services/matchService');
                const groupMatchIds = WORLD_CUP_GROUP_MATCHES.map(m => m.id);
                // We pass undefined for leagueId but provide the specific IDs we want
                const matches = await matchService.getMatches(undefined, { ids: groupMatchIds, limit: 1000 });
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
    }, [userPredictions]);

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
                        <div className="text-center space-y-3 mb-10 md:mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[9px] md:text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Copa Mundial 2026
                            </div>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">Llaves <span className="text-blue-600">Eliminatorias</span></h2>
                            <p className="text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-widest opacity-60">Camino a la Gran Final • Predicciones Abiertas</p>
                        </div>
                        <TournamentBracket initialBracketData={computedBracket} groupTeams={groupTeamsMap} />
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
