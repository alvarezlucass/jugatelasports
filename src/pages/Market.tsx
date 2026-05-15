import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { MatchCard } from '../components/ui/MatchCard';
import { PredictionModal } from '../components/ui/PredictionModal';
import type { Match, PredictionOutcome } from '../types';
import { Filter, Search, Trophy } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';

export const Market: React.FC = () => {
    const { matches } = useGame();
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [selectedOption, setSelectedOption] = useState<PredictionOutcome | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePredict = (matchId: string, selection: PredictionOutcome) => {
        const match = matches.find(m => m.id === matchId);
        if (match) {
            setSelectedMatch(match);
            setSelectedOption(selection);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedMatch(null);
            setSelectedOption(null);
        }, 300); // Wait for exit animation
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Market</h1>
                    <p className="text-muted-foreground">Predict outcomes and multiply your tokens.</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 bg-card hover:bg-muted border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search team or match..."
                            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>
            </div>

            {/* Featured / Live Section could go here */}

            {/* Match List */}
            <div className="space-y-6">
                <SectionHeader title="Upcoming Matches" icon={Trophy} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map(match => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            onPredict={handlePredict}
                            type="market"
                        />
                    ))}
                </div>
            </div>

            {/* Prediction Modal */}
            <PredictionModal
                match={selectedMatch}
                selection={selectedOption}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};
