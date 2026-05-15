import React from 'react';
import { MatchCard } from '../shared/MatchCard';
import type { Match } from '../../types';

interface MatchGroupProps {
    title: string;
    matches: Match[];
    onPredictClick?: (matchId: string) => void;
}

export const MatchGroup: React.FC<MatchGroupProps> = ({ title, matches, onPredictClick }) => {
    if (matches.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {matches.length} Partidos
                </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(match => (
                    <MatchCard
                        key={match.id}
                        match={match}
                        onPredictClick={onPredictClick}
                    />
                ))}
            </div>
        </div>
    );
};
