import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { LineupBuilder } from '../components/game/LineupBuilder';
import { ArrowLeft, Users, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../components/ui/SectionHeader';

export const Lineups: React.FC = () => {
    const { matches } = useGame();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);

    // For this mock, we just use the first match
    const activeMatch = matches.find(m => m.status === 'UPCOMING') || matches[0];

    const handleSave = (lineup: string[]) => {
        console.log(lineup); // Log the lineup usage
        setCompleted(true);
        // In real app, save to context
    };

    if (completed) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                >
                    <Trophy className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Lineup Saved!</h2>
                    <p className="text-muted-foreground">You'll earn points if you correctly predict the starting 11.</p>
                </div>
                <button onClick={() => setCompleted(false)} className="text-primary font-bold hover:underline">Back to Lineups</button>
            </div>
        )
    }

    if (selectedTeamId && activeMatch) {
        const team = selectedTeamId === activeMatch.homeTeam.id ? activeMatch.homeTeam : activeMatch.awayTeam;
        return (
            <div className="h-full flex flex-col max-w-4xl mx-auto">
                <div className="py-4 flex items-center gap-4 border-b border-border mb-4">
                    <button onClick={() => setSelectedTeamId(null)} className="p-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src={team.logo} className="w-8 h-8 object-contain" />
                        <h1 className="text-xl font-bold text-foreground">Predict 11 for {team.name}</h1>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-card rounded-3xl border border-border/50 shadow-xl">
                    <LineupBuilder team={team} onSave={handleSave} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Starting Lineups</h1>
                    <p className="text-muted-foreground">Build the starting 11 and earn extra points.</p>
                </div>
            </div>

            <div className="space-y-6">
                <SectionHeader title="Next Matches" icon={Calendar} />

                {/* Mock Match Selection */}
                <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-lg hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">TODAY 21:00</span>
                        <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Liga Profesional</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Home */}
                        <button
                            onClick={() => setSelectedTeamId(activeMatch.homeTeam.id)}
                            className="flex-1 w-full flex flex-col items-center gap-4 p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/50 group"
                        >
                            <img src={activeMatch.homeTeam.logo} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold text-foreground text-lg">{activeMatch.homeTeam.name}</span>
                            <span className="text-xs text-primary font-bold bg-primary/10 px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">Build Lineup</span>
                        </button>

                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black text-border">VS</span>
                        </div>

                        {/* Away */}
                        <button
                            onClick={() => setSelectedTeamId(activeMatch.awayTeam.id)}
                            className="flex-1 w-full flex flex-col items-center gap-4 p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/50 group"
                        >
                            <img src={activeMatch.awayTeam.logo} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold text-foreground text-lg">{activeMatch.awayTeam.name}</span>
                            <span className="text-xs text-primary font-bold bg-primary/10 px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">Build Lineup</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
