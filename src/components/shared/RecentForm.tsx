import React from 'react';
import { cn } from '../../lib/utils';

type Result = 'W' | 'D' | 'L';

interface RecentFormProps {
    results: Result[];
    className?: string; // Additional classes for container
}

export const RecentForm: React.FC<RecentFormProps> = ({ results, className }) => {
    const getResultColor = (result: Result) => {
        switch (result) {
            case 'W': return 'bg-emerald-500 shadow-emerald-500/20';
            case 'D': return 'bg-gray-500 shadow-gray-500/20';
            case 'L': return 'bg-red-500 shadow-red-500/20';
            default: return 'bg-white/10';
        }
    };

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            {results.map((result, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-1 ring-white/10",
                        getResultColor(result)
                    )}
                    title={result === 'W' ? 'Victoria' : result === 'L' ? 'Derrota' : 'Empate'}
                >
                    {result}
                </div>
            ))}
        </div>
    );
};
