import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { useUser } from '../../contexts/UserContext';
import {
    Zap,
    Bot,
    Play,
    CheckCircle2,
    AlertTriangle,
    Trophy,
    Target,
    Users,
    Activity,
    Database,
    BarChart3,
    RefreshCw
} from 'lucide-react';
import { databaseService } from '../../services/databaseService';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

interface SimulationState {
    status: 'IDLE' | 'SIMULATING' | 'SUCCESS' | 'ERROR';
    message: string;
    affectedMatches: number;
    pointsDistributed: number;
}

export const IndustrialSim: React.FC = () => {
    const { matches, refreshMatches } = useGame();
    const { user, opponents, refreshProfile } = useUser();

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Acceso Denegado</h1>
                <p className="text-zinc-500 font-bold">Modulo Industrial restringido a administradores oficiales.</p>
            </div>
        );
    }
    const [simState, setSimState] = useState<SimulationState>({
        status: 'IDLE',
        message: '',
        affectedMatches: 0,
        pointsDistributed: 0
    });

    const [selectedBotLogics, setSelectedBotLogics] = useState({
        ia: true,
        contra: true,
        profe: true
    });

    const upcomingMatches = matches.filter(m => m.status === 'scheduled');

    // Simulate Bot Predictions based on user rules
    const simulateBotPredictions = async () => {
        setSimState({ ...simState, status: 'SIMULATING', message: 'Generando predicciones de Bots...' });

        try {
            for (const match of upcomingMatches) {
                for (const bot of opponents.filter(o => o.isAI)) {
                    let selection: 'HOME' | 'DRAW' | 'AWAY' = 'DRAW';

                    // IA Logic: Average of last 5 matches (Simulated by team performance/odds)
                    if (bot.id === 'bot-ia' && selectedBotLogics.ia) {
                        const probHome = 1 / match.odds.home;
                        const probAway = 1 / match.odds.away;
                        const rand = Math.random() * (probHome + probAway + (1 / match.odds.draw));
                        if (rand < probHome) selection = 'HOME';
                        else if (rand < probHome + probAway) selection = 'AWAY';
                        else selection = 'DRAW';
                    }

                    // Contra Logic: Direct antagonist to the user
                    else if (bot.id === 'bot-contra' && selectedBotLogics.contra) {
                        // Fetch current user prediction for this match
                        const { data: userPred } = await supabase
                            .from('predictions')
                            .select('selection')
                            .eq('user_id', user?.id)
                            .eq('match_id', match.id)
                            .single();

                        if (userPred) {
                            selection = userPred.selection === 'HOME' ? 'AWAY' :
                                userPred.selection === 'AWAY' ? 'HOME' : 'DRAW';
                        } else {
                            // Fallback if user didn't predict yet: opposite of the favorite
                            const favorite = match.odds.home < match.odds.away ? 'HOME' : 'AWAY';
                            selection = favorite === 'HOME' ? 'AWAY' : 'HOME';
                        }
                    }

                    // Profe Logic: Based on FIFA Ranking (Simplified strength check)
                    else if (bot.id === 'bot-profe' && selectedBotLogics.profe) {
                        // FIFA Ranking simulation: Odds are usually a good proxy for ranking strength
                        selection = match.odds.home < match.odds.away ? 'HOME' : 'AWAY';
                    }

                    // Insert prediction into DB for the bot
                    await supabase.from('predictions').insert({
                        user_id: bot.id,
                        match_id: match.id,
                        selection,
                        stake: 100,
                        potential_return: Math.round(100 * (match.odds[selection.toLowerCase() as keyof typeof match.odds])),
                        status: 'ACTIVE'
                    });
                }
            }

            setSimState({ ...simState, status: 'SUCCESS', message: 'Predicciones de Bots generadas exitosamente.' });
        } catch (error: any) {
            setSimState({ ...simState, status: 'ERROR', message: `Error: ${error.message}` });
        }
    };

    // Mass Resolution using the real Database Service logic
    const resolveMatchday = async () => {
        setSimState({ ...simState, status: 'SIMULATING', message: 'Cerrando jornada masivamente con Motor 3-2-1...' });

        try {
            let matchesResolved = 0;
            let totalPointsProcessed = 0;

            for (const match of upcomingMatches) {
                // Generate simulated results for the automation
                const homeScore = Math.floor(Math.random() * 3);
                const awayScore = Math.floor(Math.random() * 2);

                const result = await databaseService.resolveMatch(match.id, homeScore, awayScore);

                if (result.success) {
                    matchesResolved++;
                    totalPointsProcessed += (result as any).totalPoints || 0;
                }
            }

            setSimState({
                status: 'SUCCESS',
                message: `Jornada cerrada con Motor 3-2-1. Se procesaron ${matchesResolved} partidos.`,
                affectedMatches: matchesResolved,
                pointsDistributed: totalPointsProcessed
            });
            refreshMatches();
            refreshProfile();

        } catch (error: any) {
            setSimState({ ...simState, status: 'ERROR', message: `Error: ${error.message}` });
        }
    };

    const handleInitialSync = async () => {
        setSimState({ ...simState, status: 'SIMULATING', message: 'Sincronizando datos estáticos -> Supabase...' });
        const res = await databaseService.syncWorldCupData();
        if (res.success) {
            setSimState({ ...simState, status: 'SUCCESS', message: 'Sincronización inicial completada con éxito.' });
            refreshMatches();
        } else {
            setSimState({ ...simState, status: 'ERROR', message: 'Fallo en la sincronización inicial.' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0E14] text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Industrial */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600/20 rounded-xl">
                                <Database className="text-blue-500 w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic">World Cup SIMULATOR</h1>
                        </div>
                        <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Panel Administrativo de Control de Ecosistema</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleInitialSync}
                            className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-2xl px-6 py-3 flex items-center gap-3 transition-all"
                        >
                            <RefreshCw className={cn("text-blue-500 w-5 h-5", simState.status === 'SIMULATING' && "animate-spin")} />
                            <div className="text-left">
                                <div className="text-[10px] font-black text-zinc-500 uppercase">Datos Iniciales</div>
                                <div className="text-sm font-black text-blue-400">SINCRONIZAR DB</div>
                            </div>
                        </button>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3">
                            <Activity className="text-emerald-500 w-5 h-5" />
                            <div>
                                <div className="text-[10px] font-black text-zinc-500 uppercase">Partidos Activos</div>
                                <div className="text-lg font-black">{upcomingMatches.length}</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3">
                            <Bot className="text-purple-500 w-5 h-5" />
                            <div>
                                <div className="text-[10px] font-black text-zinc-500 uppercase">Bots Operativos</div>
                                <div className="text-lg font-black">{opponents.filter(o => o.isAI).length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Bot Configuration Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#121820] rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="text-amber-500 w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100">Lógicas de Bots</h3>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setSelectedBotLogics(p => ({ ...p, ia: !p.ia }))}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                                        selectedBotLogics.ia ? "bg-blue-600/10 border-blue-500/30" : "bg-white/2 border-white/5 opacity-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <AnimatePresence>
                                            {selectedBotLogics.ia && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </AnimatePresence>
                                        <div className="text-left">
                                            <div className="text-xs font-black uppercase tracking-tight">IA Analista</div>
                                            <div className="text-[9px] text-zinc-500 font-bold uppercase">Media últimos 5 partidos</div>
                                        </div>
                                    </div>
                                    <Activity size={14} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                                </button>

                                <button
                                    onClick={() => setSelectedBotLogics(p => ({ ...p, contra: !p.contra }))}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                                        selectedBotLogics.contra ? "bg-red-600/10 border-red-500/30" : "bg-white/2 border-white/5 opacity-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <AnimatePresence>
                                            {selectedBotLogics.contra && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-red-500" />}
                                        </AnimatePresence>
                                        <div className="text-left">
                                            <div className="text-xs font-black uppercase tracking-tight">El Contra</div>
                                            <div className="text-[9px] text-zinc-500 font-bold uppercase">Antagonista Local/Visita</div>
                                        </div>
                                    </div>
                                    <Target size={14} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                                </button>

                                <button
                                    onClick={() => setSelectedBotLogics(p => ({ ...p, profe: !p.profe }))}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                                        selectedBotLogics.profe ? "bg-emerald-600/10 border-emerald-500/30" : "bg-white/2 border-white/5 opacity-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <AnimatePresence>
                                            {selectedBotLogics.profe && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-emerald-500" />}
                                        </AnimatePresence>
                                        <div className="text-left">
                                            <div className="text-xs font-black uppercase tracking-tight">El Profe FIFA</div>
                                            <div className="text-[9px] text-zinc-500 font-bold uppercase">Basado en Ranking Oficial</div>
                                        </div>
                                    </div>
                                    <Trophy size={14} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                </button>
                            </div>

                            <button
                                onClick={simulateBotPredictions}
                                disabled={simState.status === 'SIMULATING' || upcomingMatches.length === 0}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                            >
                                <Play className="inline-block mr-2 w-3 h-3" /> Inyectar Predicciones Bot
                            </button>
                        </div>

                        {/* <div className="bg-[#121820] rounded-[2.5rem] p-8 border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="text-red-500 w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100">Zona de Cierre</h3>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">
                                Esta acción finalizará todos los partidos UPCOMING con resultados simulados complejos y distribuirá premios.
                            </p>
                            <button
                                onClick={resolveMatchday}
                                disabled={simState.status === 'SIMULATING' || upcomingMatches.length === 0}
                                className="w-full py-4 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/30 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                <Users className="inline-block mr-2 w-4 h-4" /> Ejecutar Cierre Masivo
                            </button>
                        </div> */}
                    </div>

                    {/* Simulation Console / Output */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#121820] rounded-[3rem] p-8 md:p-10 border border-white/5 min-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Consola de Simulación</h3>
                                </div>
                                <BarChart3 className="text-zinc-700 w-5 h-5" />
                            </div>

                            {simState.status === 'IDLE' ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-dashed border-white/10">
                                        <Play className="text-zinc-700 w-6 h-6" />
                                    </div>
                                    <p className="text-zinc-600 font-black text-xs uppercase tracking-[0.2em] italic">Sistema a la espera de instrucciones...</p>
                                </div>
                            ) : (
                                <div className="flex-1 space-y-8">
                                    <div className={cn(
                                        "p-6 rounded-[2rem] border flex items-center gap-4",
                                        simState.status === 'SIMULATING' ? "bg-blue-600/5 border-blue-500/20" :
                                            simState.status === 'SUCCESS' ? "bg-emerald-600/5 border-emerald-500/20" : "bg-red-600/5 border-red-500/20"
                                    )}>
                                        <div className="flex-1 space-y-1">
                                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estado Actual</div>
                                            <div className="text-lg font-black uppercase italic tracking-tight">{simState.message}</div>
                                        </div>
                                        {simState.status === 'SIMULATING' && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}><Zap className="text-blue-500" /></motion.div>}
                                        {simState.status === 'SUCCESS' && <CheckCircle2 className="text-emerald-500" />}
                                    </div>

                                    {simState.status === 'SUCCESS' && simState.affectedMatches > 0 && (
                                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <div className="text-4xl font-black text-white">{simState.affectedMatches}</div>
                                                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Partidos Procesados</div>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <div className="text-4xl font-black text-emerald-500">+{simState.pointsDistributed}</div>
                                                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Puntos XP Distribuidos</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Registro de Actividad Reciente</h4>
                                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {upcomingMatches.map(m => (
                                                <div key={m.id} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 group hover:bg-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-bold text-zinc-500">{m.homeTeam.shortName} vs {m.awayTeam.shortName}</span>
                                                        <div className="h-4 w-px bg-white/5" />
                                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Listado</span>
                                                    </div>
                                                    <div className="text-[8px] font-bold text-zinc-700 uppercase">{new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
